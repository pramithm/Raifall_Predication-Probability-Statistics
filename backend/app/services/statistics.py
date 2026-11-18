from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from scipy import stats
from app.schemas.rainfall import (
    SummaryStatistics,
    MonthlyStatistics,
    YearlyStatistics,
    SeasonalStatistics,
)

# Indian Meteorological Department (IMD) standard rainy day threshold is 2.5 mm
DEFAULT_RAINY_DAY_THRESHOLD_MM = 2.5

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

# Standard Indian Meteorological Department season definitions
SEASONS_DEFINITION = [
    {
        "name": "Winter",
        "code": "WIN",
        "months": [1, 2],
        "description": "Cold weather period (Jan-Feb). Historically dry in Tamil Nadu, with minimal convective precipitation."
    },
    {
        "name": "Pre-Monsoon / Summer",
        "code": "PRE",
        "months": [3, 4, 5],
        "description": "Hot weather season (Mar-May). Intense daytime heating leading to occasional isolated thunderstorm activity."
    },
    {
        "name": "Southwest Monsoon",
        "code": "SWM",
        "months": [6, 7, 8, 9],
        "description": "Southwest Monsoon (Jun-Sep). Convective evening showers; accounts for ~25-30% of Chennai's annual rainfall."
    },
    {
        "name": "Northeast Monsoon",
        "code": "NEM",
        "months": [10, 11, 12],
        "description": "Northeast (Retreating) Monsoon (Oct-Dec). The dominant rainy season for coastal Tamil Nadu, yielding ~60% of annual precipitation via low-pressure systems and cyclones."
    }
]


def calculate_summary_statistics(
    df: pd.DataFrame,
    rainy_threshold_mm: float = DEFAULT_RAINY_DAY_THRESHOLD_MM
) -> SummaryStatistics:
    """
    Computes rigorous descriptive statistics on rainfall observations.
    Bessel's correction (ddof=1) is used for sample variance and sample standard deviation.
    """
    if df.empty or "rainfall_mm" not in df.columns:
        raise ValueError("Cannot calculate statistics on an empty or invalid dataframe.")

    series = df["rainfall_mm"].dropna().astype(float)
    n = len(series)

    if n == 0:
        raise ValueError("No valid numeric rainfall records available for statistical calculation.")

    arr = series.to_numpy()
    total_rainfall = float(np.sum(arr))
    mean_val = float(np.mean(arr))
    median_val = float(np.median(arr))
    min_val = float(np.min(arr))
    max_val = float(np.max(arr))

    # Variance and standard deviation handling
    if n > 1:
        sample_var = float(np.var(arr, ddof=1))
        sample_std = float(np.std(arr, ddof=1))
    else:
        sample_var = 0.0
        sample_std = 0.0

    population_var = float(np.var(arr, ddof=0))
    population_std = float(np.std(arr, ddof=0))

    # Percentiles
    p75 = float(np.percentile(arr, 75))
    p90 = float(np.percentile(arr, 90))
    p95 = float(np.percentile(arr, 95))
    p99 = float(np.percentile(arr, 99))

    # Rainy days
    rainy_mask = arr >= rainy_threshold_mm
    rainy_days_count = int(np.sum(rainy_mask))
    rainy_days_percentage = round((rainy_days_count / n) * 100.0, 2)

    # Skewness and kurtosis (safe computation)
    if sample_std > 1e-9:
        try:
            skewness_val = float(stats.skew(arr, bias=False))
            kurtosis_val = float(stats.kurtosis(arr, bias=False))
            if np.isnan(skewness_val) or np.isinf(skewness_val):
                skewness_val = 0.0
            if np.isnan(kurtosis_val) or np.isinf(kurtosis_val):
                kurtosis_val = 0.0
        except Exception:
            skewness_val = 0.0
            kurtosis_val = 0.0
    else:
        skewness_val = 0.0
        kurtosis_val = 0.0

    return SummaryStatistics(
        count=n,
        total_rainfall=round(total_rainfall, 2),
        mean=round(mean_val, 3),
        median=round(median_val, 3),
        min=round(min_val, 3),
        max=round(max_val, 2),
        sample_variance=round(sample_var, 4),
        population_variance=round(population_var, 4),
        sample_std_dev=round(sample_std, 4),
        population_std_dev=round(population_std, 4),
        p75=round(p75, 2),
        p90=round(p90, 2),
        p95=round(p95, 2),
        p99=round(p99, 2),
        rainy_days_count=rainy_days_count,
        rainy_days_percentage=rainy_days_percentage,
        rainy_day_threshold_mm=rainy_threshold_mm,
        skewness=round(skewness_val, 3),
        kurtosis=round(kurtosis_val, 3),
        variance_convention=(
            "Sample variance uses Bessel's correction with ddof=1: s² = Σ(xi - x̄)² / (n - 1). "
            "Population variance uses ddof=0: σ² = Σ(xi - x̄)² / n."
        )
    )


def calculate_monthly_statistics(
    df: pd.DataFrame,
    rainy_threshold_mm: float = DEFAULT_RAINY_DAY_THRESHOLD_MM
) -> List[MonthlyStatistics]:
    """
    Computes aggregated monthly rainfall metrics across the entire dataset.
    """
    if df.empty or "date" not in df.columns or "rainfall_mm" not in df.columns:
        return []

    data = df.copy()
    data["date_dt"] = pd.to_datetime(data["date"], errors="coerce")
    data = data.dropna(subset=["date_dt", "rainfall_mm"])
    
    if data.empty:
        return []

    data["month"] = data["date_dt"].dt.month
    total_all_rainfall = float(data["rainfall_mm"].sum())
    
    results: List[MonthlyStatistics] = []
    
    for m in range(1, 13):
        m_data = data[data["month"] == m]
        obs_count = len(m_data)
        
        if obs_count > 0:
            arr = m_data["rainfall_mm"].to_numpy()
            m_total = float(np.sum(arr))
            m_mean = float(np.mean(arr))
            m_median = float(np.median(arr))
            m_max = float(np.max(arr))
            m_rainy = int(np.sum(arr >= rainy_threshold_mm))
            pct_total = round((m_total / total_all_rainfall * 100.0), 2) if total_all_rainfall > 0 else 0.0
        else:
            m_total = 0.0
            m_mean = 0.0
            m_median = 0.0
            m_max = 0.0
            m_rainy = 0
            pct_total = 0.0

        results.append(
            MonthlyStatistics(
                month=m,
                month_name=MONTH_NAMES[m - 1],
                total_rainfall=round(m_total, 2),
                mean_daily_rainfall=round(m_mean, 3),
                median_daily_rainfall=round(m_median, 3),
                max_daily_rainfall=round(m_max, 2),
                rainy_days=m_rainy,
                observation_count=obs_count,
                percentage_of_annual=pct_total
            )
        )

    return results


def calculate_yearly_statistics(
    df: pd.DataFrame,
    rainy_threshold_mm: float = DEFAULT_RAINY_DAY_THRESHOLD_MM
) -> List[YearlyStatistics]:
    """
    Computes annual summaries and peak daily precipitation for each year.
    """
    if df.empty or "date" not in df.columns or "rainfall_mm" not in df.columns:
        return []

    data = df.copy()
    data["date_dt"] = pd.to_datetime(data["date"], errors="coerce")
    data = data.dropna(subset=["date_dt", "rainfall_mm"])
    
    if data.empty:
        return []

    data["year"] = data["date_dt"].dt.year
    results: List[YearlyStatistics] = []

    for year, group in data.groupby("year"):
        arr = group["rainfall_mm"].to_numpy()
        obs_count = len(arr)
        y_total = float(np.sum(arr))
        y_mean = float(np.mean(arr))
        
        # Max daily and date of occurrence
        max_idx = group["rainfall_mm"].idxmax()
        max_val = float(group.loc[max_idx, "rainfall_mm"])
        max_date = str(group.loc[max_idx, "date"])
        
        y_rainy = int(np.sum(arr >= rainy_threshold_mm))

        results.append(
            YearlyStatistics(
                year=int(year),
                total_rainfall=round(y_total, 2),
                mean_daily_rainfall=round(y_mean, 3),
                max_daily_rainfall=round(max_val, 2),
                max_daily_date=max_date,
                rainy_days=y_rainy,
                observation_count=obs_count
            )
        )

    results.sort(key=lambda x: x.year)
    return results


def calculate_seasonal_statistics(
    df: pd.DataFrame,
    rainy_threshold_mm: float = DEFAULT_RAINY_DAY_THRESHOLD_MM
) -> List[SeasonalStatistics]:
    """
    Computes seasonal totals and distributions tailored to the Indian monsoon climate.
    """
    if df.empty or "date" not in df.columns or "rainfall_mm" not in df.columns:
        return []

    data = df.copy()
    data["date_dt"] = pd.to_datetime(data["date"], errors="coerce")
    data = data.dropna(subset=["date_dt", "rainfall_mm"])
    
    if data.empty:
        return []

    data["month"] = data["date_dt"].dt.month
    total_all_rainfall = float(data["rainfall_mm"].sum())
    
    results: List[SeasonalStatistics] = []

    for s_def in SEASONS_DEFINITION:
        s_months = s_def["months"]
        s_data = data[data["month"].isin(s_months)]
        obs_count = len(s_data)

        if obs_count > 0:
            arr = s_data["rainfall_mm"].to_numpy()
            s_total = float(np.sum(arr))
            s_mean = float(np.mean(arr))
            s_max = float(np.max(arr))
            s_rainy = int(np.sum(arr >= rainy_threshold_mm))
            pct_total = round((s_total / total_all_rainfall * 100.0), 2) if total_all_rainfall > 0 else 0.0
        else:
            s_total = 0.0
            s_mean = 0.0
            s_max = 0.0
            s_rainy = 0
            pct_total = 0.0

        months_included_names = [MONTH_NAMES[m - 1] for m in s_months]

        results.append(
            SeasonalStatistics(
                season=s_def["name"],
                season_code=s_def["code"],
                months_included=months_included_names,
                total_rainfall=round(s_total, 2),
                mean_daily_rainfall=round(s_mean, 3),
                max_daily_rainfall=round(s_max, 2),
                rainy_days=s_rainy,
                observation_count=obs_count,
                percentage_of_total=pct_total,
                description=s_def["description"]
            )
        )

    return results
