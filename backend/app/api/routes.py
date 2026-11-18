import pandas as pd
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Response
from fastapi.responses import PlainTextResponse

from app.schemas.rainfall import (
    DatasetMetadata,
    SummaryStatistics,
    ProbabilityRequest,
    ProbabilityResponse,
    MonthlyStatistics,
    YearlyStatistics,
    SeasonalStatistics,
    AnomalyResponse,
    RiskAssessment,
    ApiResponse,
    FetchApiRequest,
    RainfallRecord
)
from app.services import (
    data_manager,
    calculate_summary_statistics,
    calculate_monthly_statistics,
    calculate_yearly_statistics,
    calculate_seasonal_statistics,
    calculate_rainfall_probability,
    detect_anomalies,
    compute_risk_assessment,
    DEFAULT_RAINY_DAY_THRESHOLD_MM
)

router = APIRouter(prefix="/api")


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RainRisk API",
        "version": "1.0.0",
        "active_dataset": data_manager.metadata.name if data_manager.metadata else None,
        "observations_loaded": len(data_manager.df)
    }


@router.get("/rainfall/dataset-info", response_model=ApiResponse)
def get_dataset_info():
    if data_manager.metadata is None or data_manager.df.empty:
        return ApiResponse(
            success=False,
            message="No rainfall dataset currently loaded.",
            metadata=None,
            issues=[]
        )
    return ApiResponse(
        success=True,
        message="Active dataset information retrieved.",
        metadata=data_manager.metadata,
        issues=data_manager.issues[:20]  # Return top 20 issues for display
    )


@router.get("/rainfall/preview", response_model=List[RainfallRecord])
def get_dataset_preview(limit: int = Query(default=100, ge=1, le=1000)):
    if data_manager.df.empty:
        return []
    records = []
    subset = data_manager.df.head(limit)
    for _, row in subset.iterrows():
        records.append(
            RainfallRecord(
                date=str(row["date"]),
                rainfall_mm=float(row["rainfall_mm"])
            )
        )
    return records


@router.get("/rainfall/timeseries")
def get_rainfall_timeseries(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    downsample: bool = Query(default=False)
):
    """
    Returns time series records for charting, optionally filtered by date range.
    """
    if data_manager.df.empty:
        return []

    df = data_manager.df.copy()
    if start_date:
        df = df[df["date"] >= start_date]
    if end_date:
        df = df[df["date"] <= end_date]

    # For very large datasets (>3000 pts) if downsample is requested
    if downsample and len(df) > 3000:
        # Group by month for overview
        df["dt"] = pd.to_datetime(df["date"])
        df["month_str"] = df["dt"].dt.strftime("%Y-%m")
        grouped = df.groupby("month_str")["rainfall_mm"].sum().reset_index()
        return [{"date": row["month_str"], "rainfall_mm": round(float(row["rainfall_mm"]), 2)} for _, row in grouped.iterrows()]

    return [{"date": str(row["date"]), "rainfall_mm": float(row["rainfall_mm"])} for _, row in df.iterrows()]


@router.post("/rainfall/fetch-api", response_model=ApiResponse)
async def fetch_historical_api(req: FetchApiRequest):
    success, message, issues = await data_manager.fetch_open_meteo_historical(
        latitude=req.latitude,
        longitude=req.longitude,
        start_date=req.start_date,
        end_date=req.end_date,
        location_name=req.location_name
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return ApiResponse(
        success=True,
        message=message,
        metadata=data_manager.metadata,
        issues=issues
    )


@router.post("/rainfall/upload", response_model=ApiResponse)
async def upload_csv_file(file: UploadFile = File(...)):
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only .csv and formatted text files are supported.")

    content = await file.read()
    success, message, issues = data_manager.process_csv_upload(content, file.filename)

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return ApiResponse(
        success=True,
        message=message,
        metadata=data_manager.metadata,
        issues=issues
    )


@router.post("/rainfall/load-sample", response_model=ApiResponse)
def load_sample_dataset():
    success = data_manager.load_default_sample()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to load sample Chennai dataset from storage.")

    return ApiResponse(
        success=True,
        message="Default Chennai 20-year sample dataset loaded successfully.",
        metadata=data_manager.metadata,
        issues=[]
    )


@router.get("/rainfall/summary", response_model=SummaryStatistics)
def get_summary_statistics(
    rainy_threshold: float = Query(default=DEFAULT_RAINY_DAY_THRESHOLD_MM, ge=0.0)
):
    if data_manager.df.empty:
        raise HTTPException(status_code=400, detail="No active dataset available for statistical calculation.")

    try:
        return calculate_summary_statistics(data_manager.df, rainy_threshold_mm=rainy_threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute summary statistics: {str(e)}")


@router.post("/rainfall/probability", response_model=ProbabilityResponse)
def compute_probability(req: ProbabilityRequest):
    if data_manager.df.empty:
        raise HTTPException(status_code=400, detail="No active dataset available for probability analysis.")

    try:
        return calculate_rainfall_probability(data_manager.df, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Probability calculation error: {str(e)}")


@router.get("/rainfall/monthly", response_model=List[MonthlyStatistics])
def get_monthly_analysis(
    rainy_threshold: float = Query(default=DEFAULT_RAINY_DAY_THRESHOLD_MM, ge=0.0)
):
    if data_manager.df.empty:
        return []
    return calculate_monthly_statistics(data_manager.df, rainy_threshold_mm=rainy_threshold)


@router.get("/rainfall/yearly", response_model=List[YearlyStatistics])
def get_yearly_analysis(
    rainy_threshold: float = Query(default=DEFAULT_RAINY_DAY_THRESHOLD_MM, ge=0.0)
):
    if data_manager.df.empty:
        return []
    return calculate_yearly_statistics(data_manager.df, rainy_threshold_mm=rainy_threshold)


@router.get("/rainfall/seasonal", response_model=List[SeasonalStatistics])
def get_seasonal_analysis(
    rainy_threshold: float = Query(default=DEFAULT_RAINY_DAY_THRESHOLD_MM, ge=0.0)
):
    if data_manager.df.empty:
        return []
    return calculate_seasonal_statistics(data_manager.df, rainy_threshold_mm=rainy_threshold)


@router.get("/rainfall/anomalies", response_model=AnomalyResponse)
def get_anomalies(
    percentile: float = Query(default=95.0, ge=50.0, le=99.99),
    z_score: float = Query(default=3.0, ge=1.0, le=10.0),
    method: str = Query(default="percentile", pattern="^(percentile|z_score|combined)$")
):
    if data_manager.df.empty:
        raise HTTPException(status_code=400, detail="No active dataset available for anomaly detection.")
    return detect_anomalies(
        data_manager.df,
        percentile_threshold=percentile,
        z_score_threshold=z_score,
        method=method
    )


@router.get("/rainfall/risk", response_model=RiskAssessment)
def get_risk_assessment():
    if data_manager.df.empty:
        raise HTTPException(status_code=400, detail="No active dataset available for risk assessment.")
    return compute_risk_assessment(data_manager.df)


@router.get("/rainfall/export")
def export_dataset(export_type: str = Query(default="cleaned", pattern="^(cleaned|summary)$")):
    if data_manager.df.empty:
        raise HTTPException(status_code=400, detail="Cannot export an empty dataset.")

    if export_type == "cleaned":
        csv_data = data_manager.export_cleaned_csv()
        filename = f"rainrisk_cleaned_{datetime.now().strftime('%Y%m%d')}.csv"
    else:
        summary = calculate_summary_statistics(data_manager.df)
        csv_data = data_manager.export_summary_csv(summary.model_dump())
        filename = f"rainrisk_statistical_summary_{datetime.now().strftime('%Y%m%d')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
