import pytest
import pandas as pd
from app.services.anomaly_detection import detect_anomalies


def test_percentile_anomaly_detection():
    # 20 observations, one extreme spike of 250 mm
    rainfall_values = [0.0] * 15 + [5.0, 10.0, 20.0, 30.0, 250.0]
    dates = [f"2023-10-{i+1:02d}" for i in range(20)]
    df = pd.DataFrame({"date": dates, "rainfall_mm": rainfall_values})

    # P95 anomaly detection
    res = detect_anomalies(df, percentile_threshold=95.0, method="percentile")
    assert res.total_anomalies >= 1
    # The 250.0 mm value should be flagged with severity 'Extreme'
    top = res.anomalies[0]
    assert top.rainfall_mm == 250.0
    assert top.date == "2023-10-20"
    assert top.severity == "Extreme"


def test_z_score_anomaly_detection():
    rainfall_values = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 100.0]
    dates = [f"2023-10-{i+1:02d}" for i in range(10)]
    df = pd.DataFrame({"date": dates, "rainfall_mm": rainfall_values})

    res = detect_anomalies(df, z_score_threshold=2.5, method="z_score")
    assert res.total_anomalies == 1
    assert res.anomalies[0].rainfall_mm == 100.0
    assert res.anomalies[0].z_score >= 2.5
