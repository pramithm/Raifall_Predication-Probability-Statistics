import pytest
from app.services.rainfall_data import RainfallDataManager


def test_csv_validation_rejects_negative_and_missing():
    manager = RainfallDataManager()
    
    csv_content = (
        "date,rainfall_mm\n"
        "2023-01-01,10.5\n"
        "2023-01-02,-5.0\n"       # Negative value (must be excluded)
        "2023-01-03,invalid\n"    # Non-numeric value (must be excluded)
        "2023-01-04,\n"           # Missing value (must be excluded)
        "2023-01-01,12.0\n"       # Duplicate date (first kept, second flagged)
        "2023-01-05,25.0\n"       # Valid
    ).encode("utf-8")

    success, msg, issues = manager.process_csv_upload(csv_content, "test.csv")
    assert success is True
    # Valid rows should be 2023-01-01 (10.5) and 2023-01-05 (25.0) => 2 rows
    assert len(manager.df) == 2
    assert manager.metadata.missing_count >= 2
    assert manager.metadata.duplicate_count == 1
    
    # Check that issues list contains warning details
    issue_types = [issue.type for issue in issues]
    assert "negative_value" in issue_types
    assert "duplicate_date" in issue_types


def test_csv_validation_accepts_aliases():
    manager = RainfallDataManager()
    # Using 'Date' and 'Precipitation'
    csv_content = (
        "Date,Precipitation\n"
        "2023-06-01,15.2\n"
        "2023-06-02,0.0\n"
    ).encode("utf-8")

    success, msg, issues = manager.process_csv_upload(csv_content, "alias_test.csv")
    assert success is True
    assert len(manager.df) == 2
    assert "date" in manager.df.columns
    assert "rainfall_mm" in manager.df.columns
