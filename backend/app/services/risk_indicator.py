from typing import Optional
import numpy as np
import pandas as pd
from app.schemas.rainfall import RiskAssessment


def compute_risk_assessment(df: pd.DataFrame) -> RiskAssessment:
    """
    Computes a rainfall-based statistical risk indicator based on historical percentiles
    and meteorological thresholds (such as IMD benchmarks).
    """
    if df.empty or "rainfall_mm" not in df.columns:
        return RiskAssessment(
            risk_level="Unknown",
            category_color="gray",
            summary_description="No dataset active.",
            threshold_criteria="N/A",
            historical_95th_percentile=0.0,
            historical_99th_percentile=0.0,
            max_recorded_rainfall=0.0,
            max_recorded_date=None,
            imd_classification="Unknown",
            scientific_disclaimer="Please upload or fetch a rainfall dataset."
        )

    data = df.dropna(subset=["rainfall_mm"])
    arr = data["rainfall_mm"].to_numpy().astype(float)
    
    if len(arr) == 0:
        return RiskAssessment(
            risk_level="Unknown",
            category_color="gray",
            summary_description="No valid records.",
            threshold_criteria="N/A",
            historical_95th_percentile=0.0,
            historical_99th_percentile=0.0,
            max_recorded_rainfall=0.0,
            max_recorded_date=None,
            imd_classification="Unknown",
            scientific_disclaimer="No valid observations."
        )

    p95 = float(np.percentile(arr, 95))
    p99 = float(np.percentile(arr, 99))
    max_val = float(np.max(arr))
    
    max_idx = data["rainfall_mm"].idxmax()
    max_date = str(data.loc[max_idx, "date"]) if "date" in data.columns else None

    # Overall dataset risk profile evaluation:
    # Based on maximum event intensity observed in the record
    if max_val >= 204.5 or p99 >= 100.0:
        risk_level = "Extreme"
        color = "red"
        desc = (
            f"Record displays severe rainfall events reaching {max_val:.1f} mm "
            f"(above IMD 'Extremely Heavy' threshold of 204.5 mm / 99th percentile {p99:.1f} mm). "
            f"Indicates vulnerability to acute hydrological stress."
        )
        criteria = "Max event ≥ 204.5 mm (Extremely Heavy) or P99 ≥ 100.0 mm"
        imd_class = "Extremely Heavy Rainfall Category (> 204.4 mm/day)"
    elif max_val >= 115.6 or p95 >= 50.0:
        risk_level = "Unusually High"
        color = "amber"
        desc = (
            f"Historical observations reflect multiple heavy deluge events reaching {max_val:.1f} mm "
            f"(IMD 'Very Heavy' threshold 115.6 - 204.4 mm)."
        )
        criteria = "Max event 115.6 - 204.4 mm or P95 ≥ 50.0 mm"
        imd_class = "Very Heavy Rainfall Category (115.6 - 204.4 mm/day)"
    elif max_val >= 64.5:
        risk_level = "Elevated"
        color = "yellow"
        desc = (
            f"Record features isolated heavy rainfall spikes reaching {max_val:.1f} mm "
            f"(IMD 'Heavy Rainfall' threshold 64.5 - 115.5 mm)."
        )
        criteria = "Max event 64.5 - 115.5 mm"
        imd_class = "Heavy Rainfall Category (64.5 - 115.5 mm/day)"
    else:
        risk_level = "Normal"
        color = "green"
        desc = "Rainfall events are within typical moderate ranges with no extreme historical deluge recorded."
        criteria = "Max event < 64.5 mm"
        imd_class = "Moderate / Light Rainfall Category (< 64.5 mm/day)"

    disclaimer = (
        "Hydrological Notice: This metric is a statistical rainfall-based indicator reflecting "
        "historical precipitation intensity. It is NOT an official flood warning or flood forecast. "
        "Actual urban flooding is governed by storm sewer drainage capacity, localized terrain depressions, "
        "soil saturation, reservoir discharge, and coastal tidal surges."
    )

    return RiskAssessment(
        risk_level=risk_level,
        category_color=color,
        summary_description=desc,
        threshold_criteria=criteria,
        historical_95th_percentile=round(p95, 2),
        historical_99th_percentile=round(p99, 2),
        max_recorded_rainfall=round(max_val, 2),
        max_recorded_date=max_date,
        imd_classification=imd_class,
        scientific_disclaimer=disclaimer
    )
