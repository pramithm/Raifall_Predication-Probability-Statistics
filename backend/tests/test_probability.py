import pytest
import pandas as pd
from app.schemas.rainfall import ProbabilityRequest
from app.services.probability import (
    calculate_rainfall_probability,
    compute_wilson_confidence_interval
)


def test_wilson_confidence_interval_bounds():
    """Test Wilson score interval calculation against theoretical properties."""
    # Scenario: k=5, n=10, 50% exceedance
    ci = compute_wilson_confidence_interval(k=5, n=10, confidence_level=0.95)
    assert ci.lower_bound >= 0.0
    assert ci.upper_bound <= 1.0
    assert ci.lower_bound < 0.5 < ci.upper_bound
    assert pytest.approx(ci.lower_bound, 0.01) == 0.237
    assert pytest.approx(ci.upper_bound, 0.01) == 0.763

    # Extreme edge case: k=0 (0 exceedances out of 100 days)
    # Unlike Wald interval (which gives [0, 0]), Wilson provides non-zero upper bound
    ci_zero = compute_wilson_confidence_interval(k=0, n=100, confidence_level=0.95)
    assert ci_zero.lower_bound == 0.0
    assert ci_zero.upper_bound > 0.0
    assert ci_zero.upper_bound < 0.05

    # Extreme edge case: k=100 out of 100
    ci_full = compute_wilson_confidence_interval(k=100, n=100, confidence_level=0.95)
    assert ci_full.upper_bound == 1.0
    assert ci_full.lower_bound > 0.95


def test_empirical_probability_strict_greater_than():
    """
    Test that P(R > threshold) strictly uses > and not >=.
    If observations are [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    For threshold = 50:
    Values strictly > 50 are [60, 70, 80, 90, 100] => 5 observations.
    5 / 10 = 0.50 (50%).
    """
    df = pd.DataFrame({
        "date": [f"2023-01-{i:02d}" for i in range(1, 11)],
        "rainfall_mm": [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0]
    })

    req = ProbabilityRequest(threshold_mm=50.0, filter_type="all")
    res = calculate_rainfall_probability(df, req)

    assert res.total_observations == 10
    assert res.exceedance_count == 5
    assert res.probability == 0.5
    assert res.probability_percentage == 50.0
    assert res.non_exceedance_count == 5
    assert res.non_exceedance_probability == 0.5

    # Threshold exactly matching max value
    req_max = ProbabilityRequest(threshold_mm=100.0, filter_type="all")
    res_max = calculate_rainfall_probability(df, req_max)
    assert res_max.exceedance_count == 0
    assert res_max.probability == 0.0


def test_conditional_probability_by_month():
    """
    Test conditional probability P(R > t | selected month).
    """
    df = pd.DataFrame({
        "date": [
            "2023-11-01", "2023-11-02", "2023-11-03", "2023-11-04",  # Nov (Month 11)
            "2023-05-01", "2023-05-02"                               # May (Month 5)
        ],
        "rainfall_mm": [60.0, 70.0, 10.0, 5.0, 0.0, 2.0]
    })

    # Test conditional on November (month 11)
    req_nov = ProbabilityRequest(threshold_mm=50.0, filter_type="month", filter_value="11")
    res_nov = calculate_rainfall_probability(df, req_nov)

    assert res_nov.total_observations == 4
    # Nov values > 50 are 60.0 and 70.0 (2 out of 4)
    assert res_nov.exceedance_count == 2
    assert res_nov.probability == 0.5
    assert res_nov.probability_percentage == 50.0
