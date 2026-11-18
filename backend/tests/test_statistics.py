import pytest
import pandas as pd
import numpy as np
from app.services.statistics import (
    calculate_summary_statistics,
    calculate_monthly_statistics,
    calculate_yearly_statistics,
    calculate_seasonal_statistics
)


def test_manually_verifiable_descriptive_statistics():
    """
    Test dataset with manually verified mathematical values:
    Values: [0.0, 10.0, 20.0, 30.0, 40.0]
    n = 5
    Sum = 100.0
    Mean = 20.0
    Median = 20.0
    Min = 0.0, Max = 40.0
    Sum of squared deviations from mean = (-20)^2 + (-10)^2 + 0^2 + 10^2 + 20^2 = 400 + 100 + 0 + 100 + 400 = 1000.0
    Sample variance (ddof=1) = 1000 / 4 = 250.0
    Population variance (ddof=0) = 1000 / 5 = 200.0
    Sample std dev = sqrt(250) ≈ 15.8114
    Population std dev = sqrt(200) ≈ 14.1421
    Rainy days (>= 2.5 mm): 4 days (10, 20, 30, 40) => 4/5 = 80.0%
    """
    df = pd.DataFrame({
        "date": ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05"],
        "rainfall_mm": [0.0, 10.0, 20.0, 30.0, 40.0]
    })

    stats = calculate_summary_statistics(df, rainy_threshold_mm=2.5)

    assert stats.count == 5
    assert stats.total_rainfall == 100.0
    assert stats.mean == 20.0
    assert stats.median == 20.0
    assert stats.min == 0.0
    assert stats.max == 40.0
    assert stats.sample_variance == 250.0
    assert stats.population_variance == 200.0
    assert pytest.approx(stats.sample_std_dev, 0.001) == 15.8114
    assert pytest.approx(stats.population_std_dev, 0.001) == 14.1421
    assert stats.p75 == 30.0
    assert stats.rainy_days_count == 4
    assert stats.rainy_days_percentage == 80.0


def test_single_observation_variance():
    """Single observation has sample variance 0.0 without crash."""
    df = pd.DataFrame({
        "date": ["2023-01-01"],
        "rainfall_mm": [15.5]
    })
    stats = calculate_summary_statistics(df)
    assert stats.count == 1
    assert stats.mean == 15.5
    assert stats.sample_variance == 0.0
    assert stats.sample_std_dev == 0.0


def test_zero_variance_case():
    """All identical values have 0 variance and zero standard deviation."""
    df = pd.DataFrame({
        "date": ["2023-01-01", "2023-01-02", "2023-01-03"],
        "rainfall_mm": [0.0, 0.0, 0.0]
    })
    stats = calculate_summary_statistics(df)
    assert stats.count == 3
    assert stats.mean == 0.0
    assert stats.sample_variance == 0.0
    assert stats.sample_std_dev == 0.0
    assert stats.rainy_days_count == 0


def test_empty_dataset_raises_error():
    """Empty dataframe raises ValueError with clear message."""
    df = pd.DataFrame(columns=["date", "rainfall_mm"])
    with pytest.raises(ValueError, match="Cannot calculate statistics on an empty or invalid dataframe"):
        calculate_summary_statistics(df)


def test_monthly_and_seasonal_breakdowns():
    """Test monthly and seasonal aggregation grouping."""
    dates = [
        "2023-01-15",  # Winter
        "2023-04-10",  # Pre-Monsoon
        "2023-07-20",  # SWM
        "2023-11-05",  # NEM
        "2023-11-12",  # NEM
    ]
    rainfall = [5.0, 10.0, 50.0, 100.0, 150.0]
    df = pd.DataFrame({"date": dates, "rainfall_mm": rainfall})

    monthly = calculate_monthly_statistics(df)
    assert len(monthly) == 12
    # November (month 11) should have 250 mm total
    nov = next(m for m in monthly if m.month == 11)
    assert nov.total_rainfall == 250.0
    assert nov.observation_count == 2
    assert nov.max_daily_rainfall == 150.0

    seasonal = calculate_seasonal_statistics(df)
    assert len(seasonal) == 4
    nem = next(s for s in seasonal if s.season_code == "NEM")
    assert nem.total_rainfall == 250.0
    assert nem.observation_count == 2
