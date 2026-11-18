import math
from typing import Optional, Tuple
import numpy as np
import pandas as pd
from scipy import stats
from app.schemas.rainfall import (
    ProbabilityRequest,
    ProbabilityResponse,
    WilsonConfidenceInterval,
)
from app.services.statistics import SEASONS_DEFINITION, MONTH_NAMES


def compute_wilson_confidence_interval(
    k: int,
    n: int,
    confidence_level: float = 0.95
) -> WilsonConfidenceInterval:
    """
    Calculates the Wilson score confidence interval for a binomial proportion.
    
    Formula:
        p_center = (p_hat + z^2 / (2n)) / (1 + z^2 / n)
        margin = (z / (1 + z^2 / n)) * sqrt((p_hat * (1 - p_hat) / n) + (z^2 / (4n^2)))
        CI = [max(0, p_center - margin), min(1, p_center + margin)]
    """
    if n <= 0:
        return WilsonConfidenceInterval(
            confidence_level=confidence_level,
            lower_bound=0.0,
            upper_bound=0.0,
            lower_percentage=0.0,
            upper_percentage=0.0,
            z_critical=1.96,
            method="Wilson score interval for binomial proportion",
            explanation="Sample size is zero; confidence interval cannot be computed."
        )

    p_hat = k / n
    # Compute z critical value for the specified two-tailed confidence level
    alpha = 1.0 - confidence_level
    z = float(stats.norm.ppf(1.0 - alpha / 2.0))

    z_sq = z ** 2
    denominator = 1.0 + (z_sq / n)
    center = (p_hat + (z_sq / (2.0 * n))) / denominator
    
    inside_sqrt = (p_hat * (1.0 - p_hat) / n) + (z_sq / (4.0 * (n ** 2)))
    # Safeguard against minor negative floating precision
    inside_sqrt = max(0.0, inside_sqrt)
    margin = (z / denominator) * math.sqrt(inside_sqrt)

    lower = max(0.0, center - margin)
    upper = min(1.0, center + margin)

    return WilsonConfidenceInterval(
        confidence_level=confidence_level,
        lower_bound=round(lower, 5),
        upper_bound=round(upper, 5),
        lower_percentage=round(lower * 100.0, 3),
        upper_percentage=round(upper * 100.0, 3),
        z_critical=round(z, 3),
        method="Wilson score interval for binomial proportion",
        explanation=(
            f"The 95% Wilson score interval accounts for uncertainty in binomial proportion "
            f"estimates (k={k}, n={n}). Unlike the standard Wald interval, it behaves well even when "
            f"k is small or zero without yielding degenerate bounds outside [0, 1]."
        )
    )


def calculate_rainfall_probability(
    df: pd.DataFrame,
    req: ProbabilityRequest
) -> ProbabilityResponse:
    """
    Calculates empirical and conditional probability P(R > threshold)
    using strict greater-than inequality, along with a 95% Wilson confidence interval.
    """
    if df.empty or "rainfall_mm" not in df.columns:
        raise ValueError("Cannot compute rainfall probability on an empty or invalid dataset.")

    data = df.copy()
    data["date_dt"] = pd.to_datetime(data["date"], errors="coerce")
    data = data.dropna(subset=["date_dt", "rainfall_mm"])

    # Apply conditional filters if requested
    subset = data
    filter_desc = "Entire Dataset"

    if req.filter_type == "month" and req.filter_value is not None:
        try:
            m_val = int(req.filter_value)
            if not 1 <= m_val <= 12:
                raise ValueError("Month filter value must be an integer between 1 and 12.")
            subset = data[data["date_dt"].dt.month == m_val]
            filter_desc = f"Month: {MONTH_NAMES[m_val - 1]}"
        except ValueError as e:
            raise ValueError(f"Invalid month filter: {e}")

    elif req.filter_type == "season" and req.filter_value is not None:
        season_match = next((s for s in SEASONS_DEFINITION if s["name"].lower() == req.filter_value.lower() or s["code"].lower() == req.filter_value.lower()), None)
        if not season_match:
            # Fallback search by substring
            season_match = next((s for s in SEASONS_DEFINITION if req.filter_value.lower() in s["name"].lower()), None)

        if not season_match:
            valid_seasons = ", ".join([s["name"] for s in SEASONS_DEFINITION])
            raise ValueError(f"Unknown season '{req.filter_value}'. Valid seasons: {valid_seasons}")

        subset = data[data["date_dt"].dt.month.isin(season_match["months"])]
        filter_desc = f"Season: {season_match['name']} ({', '.join(season_match['months_included'] if 'months_included' in season_match else [MONTH_NAMES[m-1] for m in season_match['months']])})"

    total_obs = len(subset)
    if total_obs == 0:
        raise ValueError(f"No valid observations found for the specified filter ({filter_desc}).")

    # Strict greater than
    exceedance_mask = subset["rainfall_mm"] > req.threshold_mm
    exceedance_count = int(exceedance_mask.sum())
    non_exceedance_count = total_obs - exceedance_count

    probability = exceedance_count / total_obs
    probability_pct = round(probability * 100.0, 3)
    non_exceedance_prob = non_exceedance_count / total_obs

    # Wilson 95% Confidence Interval
    ci_95 = compute_wilson_confidence_interval(exceedance_count, total_obs, confidence_level=0.95)

    interpretation = (
        f"In this historical record ({filter_desc}), {exceedance_count} out of {total_obs} days "
        f"({probability_pct}%) recorded daily rainfall strictly exceeding {req.threshold_mm} mm. "
        f"With 95% confidence, the true Bernoulli underlying parameter p is estimated between "
        f"{ci_95.lower_percentage}% and {ci_95.upper_percentage}%."
    )

    disclaimer = (
        "Statistical Note: This calculation represents an empirical frequency under the binomial model. "
        "Real-world meteorological precipitation exhibits temporal autocorrelation (clustering of rainy days). "
        "These probabilities are historical estimates and do not constitute an official deterministic weather forecast."
    )

    return ProbabilityResponse(
        threshold_mm=req.threshold_mm,
        filter_type=req.filter_type,
        filter_value=req.filter_value,
        total_observations=total_obs,
        exceedance_count=exceedance_count,
        probability=round(probability, 5),
        probability_percentage=probability_pct,
        non_exceedance_count=non_exceedance_count,
        non_exceedance_probability=round(non_exceedance_prob, 5),
        confidence_interval_95=ci_95,
        interpretation=interpretation,
        disclaimer=disclaimer
    )
