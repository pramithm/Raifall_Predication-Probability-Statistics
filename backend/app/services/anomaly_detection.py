from typing import List, Optional
import numpy as np
import pandas as pd
from app.schemas.rainfall import AnomalyRecord, AnomalyResponse


def detect_anomalies(
    df: pd.DataFrame,
    percentile_threshold: float = 95.0,
    z_score_threshold: float = 3.0,
    method: str = "percentile"  # 'percentile', 'z_score', or 'combined'
) -> AnomalyResponse:
    """
    Identifies statistically anomalous precipitation events using empirical percentiles
    or standard scores (z-scores).
    """
    if df.empty or "rainfall_mm" not in df.columns:
        return AnomalyResponse(
            method=method,
            threshold_criterion="Empty dataset",
            total_anomalies=0,
            anomalies=[],
            percentile_value=0.0,
            z_score_threshold=z_score_threshold,
            scientific_disclaimer="No observations available for anomaly detection."
        )

    data = df.copy()
    data["date_dt"] = pd.to_datetime(data["date"], errors="coerce")
    data = data.dropna(subset=["date_dt", "rainfall_mm"])

    if data.empty:
        return AnomalyResponse(
            method=method,
            threshold_criterion="No valid records",
            total_anomalies=0,
            anomalies=[],
            percentile_value=0.0,
            z_score_threshold=z_score_threshold,
            scientific_disclaimer="No valid records available for anomaly detection."
        )

    arr = data["rainfall_mm"].to_numpy().astype(float)
    mean_val = float(np.mean(arr))
    std_val = float(np.std(arr, ddof=1)) if len(arr) > 1 else 0.0

    # Calculate empirical cutoff
    cutoff_percentile_val = float(np.percentile(arr, percentile_threshold))

    anomalies: List[AnomalyRecord] = []

    for _, row in data.iterrows():
        val = float(row["rainfall_mm"])
        date_str = str(row["date"])
        
        # Calculate z-score
        z = ((val - mean_val) / std_val) if std_val > 1e-9 else 0.0
        
        # Percentile rank (empirical percentile of this value in array)
        pct_rank = float((np.sum(arr <= val) / len(arr)) * 100.0)

        is_anomaly = False
        method_matched = []

        if method == "percentile" or method == "combined":
            if val >= cutoff_percentile_val and val > 0:
                is_anomaly = True
                method_matched.append(f"Percentile ≥ P{percentile_threshold} ({cutoff_percentile_val:.1f} mm)")

        if method == "z_score" or method == "combined":
            if z >= z_score_threshold and val > 0:
                is_anomaly = True
                method_matched.append(f"Z-Score ≥ {z_score_threshold} (z={z:.2f})")

        if is_anomaly:
            # Determine severity
            if val >= 204.4 or z >= 5.0 or pct_rank >= 99.5:
                severity = "Extreme"
            elif val >= 115.6 or z >= 3.5 or pct_rank >= 98.0:
                severity = "High"
            else:
                severity = "Elevated"

            anomalies.append(
                AnomalyRecord(
                    date=date_str,
                    rainfall_mm=round(val, 2),
                    method=" & ".join(method_matched) if method_matched else method,
                    threshold_value=round(cutoff_percentile_val, 2),
                    z_score=round(z, 2),
                    percentile_rank=round(pct_rank, 2),
                    severity=severity
                )
            )

    # Sort anomalies descending by rainfall value
    anomalies.sort(key=lambda x: x.rainfall_mm, reverse=True)

    criterion_desc = (
        f"Percentile threshold: P{percentile_threshold} ({cutoff_percentile_val:.2f} mm)"
        if method == "percentile"
        else f"Z-score threshold: z ≥ {z_score_threshold} (Mean: {mean_val:.2f} mm, StdDev: {std_val:.2f} mm)"
        if method == "z_score"
        else f"Combined criteria: P{percentile_threshold} or z ≥ {z_score_threshold}"
    )

    disclaimer = (
        "Hydrological & Statistical Disclaimer: An identified statistical rainfall anomaly "
        "indicates that the daily precipitation is rare relative to this historical record. "
        "An unusual rainfall event is NOT automatically a guaranteed flood event, as surface runoff, "
        "urban stormwater drainage capacity, soil antecedent moisture, topography, and tidal levels "
        "are critical factors in determining actual inundation."
    )

    return AnomalyResponse(
        method=method,
        threshold_criterion=criterion_desc,
        total_anomalies=len(anomalies),
        anomalies=anomalies,
        percentile_value=round(cutoff_percentile_val, 2),
        z_score_threshold=z_score_threshold,
        scientific_disclaimer=disclaimer
    )
