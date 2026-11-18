import io
import os
from datetime import datetime
from typing import Tuple, List, Optional
import httpx
import pandas as pd
import numpy as np

from app.schemas.rainfall import DatasetMetadata, ValidationIssue

SAMPLE_FILE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/sample_rainfall.csv"))

DATE_COLUMN_ALIASES = ["date", "time", "datetime", "timestamp", "observation_date", "day", "dt"]
RAINFALL_COLUMN_ALIASES = [
    "rainfall_mm", "rainfall", "precipitation", "precipitation_mm", 
    "rain_mm", "rain", "prcp", "precip", "daily_rainfall_mm"
]


class RainfallDataManager:
    def __init__(self):
        self.df: pd.DataFrame = pd.DataFrame(columns=["date", "rainfall_mm"])
        self.metadata: Optional[DatasetMetadata] = None
        self.issues: List[ValidationIssue] = []
        # Attempt to initialize with sample dataset on startup
        self.load_default_sample()

    def load_default_sample(self) -> bool:
        """Loads the pre-packaged 20-year Chennai dataset from disk."""
        if os.path.exists(SAMPLE_FILE_PATH):
            try:
                raw_df = pd.read_csv(SAMPLE_FILE_PATH)
                clean_df, meta, issues = self._validate_and_clean_df(
                    raw_df,
                    name="Chennai, Tamil Nadu, India",
                    source="Historical Reanalysis (ERA5-Land via Open-Meteo)",
                    data_type="sample_historical",
                    lat=13.0827,
                    lon=80.2707
                )
                self.df = clean_df
                self.metadata = meta
                self.issues = issues
                return True
            except Exception as e:
                print(f"Warning: Failed loading default sample dataset: {e}")
                return False
        return False

    async def fetch_open_meteo_historical(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
        location_name: str = "Custom Coordinates"
    ) -> Tuple[bool, str, List[ValidationIssue]]:
        """
        Fetches historical daily precipitation data from Open-Meteo's archive API.
        """
        try:
            # Date validation
            s_dt = datetime.strptime(start_date, "%Y-%m-%d")
            e_dt = datetime.strptime(end_date, "%Y-%m-%d")
            if s_dt > e_dt:
                return False, "Start date cannot be after end date.", []
            if s_dt.year < 1940:
                return False, "Open-Meteo historical reanalysis records begin in 1940.", []
            if e_dt > datetime.now():
                return False, "Historical archive API cannot query future dates. Please select an end date up to yesterday.", []
        except ValueError:
            return False, "Dates must follow the ISO-8601 YYYY-MM-DD format.", []

        url = (
            f"https://archive-api.open-meteo.com/v1/archive"
            f"?latitude={latitude}&longitude={longitude}"
            f"&start_date={start_date}&end_date={end_date}"
            f"&daily=precipitation_sum&timezone=auto"
        )

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.get(url)
                if res.status_code != 200:
                    try:
                        err_json = res.json()
                        reason = err_json.get("reason", res.text)
                    except Exception:
                        reason = res.text
                    return False, f"Open-Meteo API Error (HTTP {res.status_code}): {reason}", []

                payload = res.json()
                daily = payload.get("daily", {})
                times = daily.get("time", [])
                precips = daily.get("precipitation_sum", [])

                if not times:
                    return False, "Open-Meteo API returned no daily records for the specified parameters.", []

                raw_df = pd.DataFrame({
                    "date": times,
                    "rainfall_mm": precips
                })

                clean_df, meta, issues = self._validate_and_clean_df(
                    raw_df,
                    name=location_name,
                    source=f"Open-Meteo Historical Archive ({location_name})",
                    data_type="historical_reanalysis",
                    lat=latitude,
                    lon=longitude
                )

                self.df = clean_df
                self.metadata = meta
                self.issues = issues
                return True, "Historical rainfall data successfully fetched and verified.", issues

        except httpx.TimeoutException:
            return False, "Network request to Open-Meteo API timed out. Please verify connectivity.", []
        except Exception as e:
            return False, f"Failed to retrieve data from Open-Meteo: {str(e)}", []

    def process_csv_upload(
        self,
        file_bytes: bytes,
        filename: str
    ) -> Tuple[bool, str, List[ValidationIssue]]:
        """
        Parses and validates a user-uploaded CSV file.
        """
        if len(file_bytes) == 0:
            return False, "Uploaded file is empty.", []
        if len(file_bytes) > 20 * 1024 * 1024:
            return False, "Uploaded file exceeds maximum limit of 20MB.", []

        # Attempt to decode string content
        decoded_str = None
        for enc in ["utf-8-sig", "utf-8", "latin1", "cp1252"]:
            try:
                decoded_str = file_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue

        if decoded_str is None:
            return False, "Unable to decode CSV text. File must be UTF-8 or Latin-1 encoded.", []

        # Read into dataframe with separator autodetection
        try:
            raw_df = pd.read_csv(io.StringIO(decoded_str), sep=None, engine="python")
        except Exception as e:
            return False, f"Malformed CSV structure: {str(e)}", []

        if raw_df.empty:
            return False, "CSV contains headers but no data records.", []

        # Normalize column headers
        col_map = {}
        date_col = None
        rain_col = None

        for col in raw_df.columns:
            cleaned_col = str(col).strip().lower().replace(" ", "_").replace("-", "_")
            if cleaned_col in DATE_COLUMN_ALIASES and not date_col:
                date_col = col
                col_map[col] = "date"
            elif cleaned_col in RAINFALL_COLUMN_ALIASES and not rain_col:
                rain_col = col
                col_map[col] = "rainfall_mm"

        if not date_col or not rain_col:
            found_cols = ", ".join(list(raw_df.columns))
            return (
                False,
                f"Missing required columns. Required: 'date' and 'rainfall_mm' (or aliases like 'precipitation'). Found: [{found_cols}]",
                []
            )

        standardized_df = raw_df[[date_col, rain_col]].rename(columns=col_map)

        clean_df, meta, issues = self._validate_and_clean_df(
            standardized_df,
            name=f"User Dataset: {filename}",
            source=f"Uploaded CSV ({filename})",
            data_type="csv_upload"
        )

        if clean_df.empty:
            return False, "Dataset contains no valid records after validation.", issues

        self.df = clean_df
        self.metadata = meta
        self.issues = issues
        return True, f"Successfully imported {len(clean_df)} valid daily observations from {filename}.", issues

    def _validate_and_clean_df(
        self,
        raw_df: pd.DataFrame,
        name: str,
        source: str,
        data_type: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> Tuple[pd.DataFrame, DatasetMetadata, List[ValidationIssue]]:
        """
        Strict validation pipeline:
        - Detect invalid dates
        - Detect non-numeric and negative values
        - Detect missing values (do not silently replace with 0)
        - Detect duplicate dates and resolve via warning
        """
        issues: List[ValidationIssue] = []
        total_raw_records = len(raw_df)

        valid_rows = []
        seen_dates = set()
        duplicate_count = 0
        missing_count = 0
        negative_count = 0
        invalid_date_count = 0

        for idx, row in raw_df.iterrows():
            row_num = idx + 2  # 1-indexed header + 1
            raw_date = row.get("date")
            raw_rain = row.get("rainfall_mm")

            # Check for missing values
            if pd.isna(raw_date) or pd.isna(raw_rain):
                missing_count += 1
                if missing_count <= 5:
                    issues.append(
                        ValidationIssue(
                            type="missing_value",
                            message=f"Row {row_num}: Missing date or rainfall observation (excluded from analysis).",
                            row=row_num
                        )
                    )
                continue

            # Parse date
            try:
                parsed_dt = pd.to_datetime(raw_date, errors="raise")
                date_str = parsed_dt.strftime("%Y-%m-%d")
            except Exception:
                invalid_date_count += 1
                if invalid_date_count <= 5:
                    issues.append(
                        ValidationIssue(
                            type="invalid_date",
                            message=f"Row {row_num}: Could not parse '{raw_date}' as valid date (excluded).",
                            row=row_num,
                            value=str(raw_date)
                        )
                    )
                continue

            # Parse rainfall numeric value
            try:
                rain_val = float(raw_rain)
                if np.isnan(rain_val) or np.isinf(rain_val):
                    raise ValueError("NaN or Inf")
            except Exception:
                missing_count += 1
                if missing_count <= 5:
                    issues.append(
                        ValidationIssue(
                            type="non_numeric",
                            message=f"Row {row_num}: Rainfall value '{raw_rain}' is not a valid number (excluded).",
                            row=row_num,
                            value=str(raw_rain)
                        )
                    )
                continue

            # Check negative rainfall
            if rain_val < 0.0:
                negative_count += 1
                if negative_count <= 5:
                    issues.append(
                        ValidationIssue(
                            type="negative_value",
                            message=f"Row {row_num}: Negative precipitation ({rain_val} mm) is physically impossible (excluded).",
                            row=row_num,
                            value=str(rain_val)
                        )
                    )
                continue

            # Check duplicate dates
            if date_str in seen_dates:
                duplicate_count += 1
                if duplicate_count <= 5:
                    issues.append(
                        ValidationIssue(
                            type="duplicate_date",
                            message=f"Row {row_num}: Duplicate observation for date '{date_str}' (first occurrence retained).",
                            row=row_num,
                            value=date_str
                        )
                    )
                continue

            seen_dates.add(date_str)
            valid_rows.append({"date": date_str, "rainfall_mm": round(rain_val, 2)})

        # Aggregate warnings for excessive issues
        warning_summaries = []
        if duplicate_count > 0:
            warning_summaries.append(f"Encountered {duplicate_count} duplicate date rows; retained initial occurrences.")
        if missing_count > 0:
            warning_summaries.append(f"Encountered {missing_count} missing/invalid numeric values; excluded from analysis.")
        if negative_count > 0:
            warning_summaries.append(f"Encountered {negative_count} negative rainfall values; excluded as physically invalid.")
        if invalid_date_count > 0:
            warning_summaries.append(f"Encountered {invalid_date_count} unparseable date formats; excluded.")

        clean_df = pd.DataFrame(valid_rows)
        if not clean_df.empty:
            clean_df = clean_df.sort_values(by="date").reset_index(drop=True)
            start_date = str(clean_df["date"].iloc[0])
            end_date = str(clean_df["date"].iloc[-1])
        else:
            start_date = "N/A"
            end_date = "N/A"

        meta = DatasetMetadata(
            name=name,
            source=source,
            data_type=data_type,
            latitude=lat,
            longitude=lon,
            start_date=start_date,
            end_date=end_date,
            total_records=total_raw_records,
            valid_observations=len(clean_df),
            missing_count=missing_count,
            duplicate_count=duplicate_count,
            unit="mm",
            retrieved_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            warnings=warning_summaries
        )

        return clean_df, meta, issues

    def export_cleaned_csv(self) -> str:
        """Returns CSV string of active cleaned dataset."""
        if self.df.empty:
            return "date,rainfall_mm\n"
        return self.df.to_csv(index=False)

    def export_summary_csv(self, summary_dict: dict) -> str:
        """Returns CSV string of statistical indicators."""
        output = io.StringIO()
        output.write("Metric,Value,Unit/Convention\n")
        for k, v in summary_dict.items():
            output.write(f'"{k}","{v}",""\n')
        return output.getvalue()


# Global in-memory dataset manager
data_manager = RainfallDataManager()
