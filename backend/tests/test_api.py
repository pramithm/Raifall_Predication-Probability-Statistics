import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "RainRisk API"


def test_dataset_info_endpoint():
    res = client.get("/api/rainfall/dataset-info")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["metadata"] is not None


def test_summary_statistics_endpoint():
    res = client.get("/api/rainfall/summary")
    assert res.status_code == 200
    data = res.json()
    assert "mean" in data
    assert "sample_variance" in data
    assert "p95" in data


def test_probability_calculation_endpoint():
    payload = {
        "threshold_mm": 50.0,
        "filter_type": "all"
    }
    res = client.post("/api/rainfall/probability", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["threshold_mm"] == 50.0
    assert "probability" in data
    assert "confidence_interval_95" in data
    assert "lower_bound" in data["confidence_interval_95"]
    assert "upper_bound" in data["confidence_interval_95"]


def test_monthly_and_seasonal_endpoints():
    res_m = client.get("/api/rainfall/monthly")
    assert res_m.status_code == 200
    assert len(res_m.json()) == 12

    res_s = client.get("/api/rainfall/seasonal")
    assert res_s.status_code == 200
    assert len(res_s.json()) == 4


def test_anomalies_and_risk_endpoints():
    res_a = client.get("/api/rainfall/anomalies?percentile=99.0")
    assert res_a.status_code == 200
    data_a = res_a.json()
    assert "anomalies" in data_a

    res_r = client.get("/api/rainfall/risk")
    assert res_r.status_code == 200
    data_r = res_r.json()
    assert data_r["risk_level"] in ["Normal", "Elevated", "Unusually High", "Extreme"]


def test_timeseries_downsampling_endpoint():
    res = client.get("/api/rainfall/timeseries?downsample=true")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "date" in data[0]
        assert "rainfall_mm" in data[0]


def test_export_dataset_endpoint():
    res_cleaned = client.get("/api/rainfall/export?export_type=cleaned")
    assert res_cleaned.status_code == 200
    assert "text/csv" in res_cleaned.headers["content-type"]
    assert "date,rainfall_mm" in res_cleaned.text

    res_summary = client.get("/api/rainfall/export?export_type=summary")
    assert res_summary.status_code == 200
    assert "text/csv" in res_summary.headers["content-type"]
    assert "Metric,Value,Unit/Convention" in res_summary.text

