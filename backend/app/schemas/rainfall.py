from typing import List, Optional
from pydantic import BaseModel, Field


class RainfallRecord(BaseModel):
    date: str
    rainfall_mm: float


class ValidationIssue(BaseModel):
    type: str  # 'duplicate_date', 'missing_value', 'negative_value', 'invalid_date', 'warning'
    message: str
    row: Optional[int] = None
    value: Optional[str] = None


class DatasetMetadata(BaseModel):
    name: str
    source: str
    data_type: str  # 'historical_reanalysis', 'csv_upload', 'sample_historical'
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_date: str
    end_date: str
    total_records: int
    valid_observations: int
    missing_count: int
    duplicate_count: int
    unit: str = "mm"
    retrieved_at: str
    warnings: List[str] = []


class SummaryStatistics(BaseModel):
    count: int
    total_rainfall: float
    mean: float
    median: float
    min: float
    max: float
    sample_variance: float
    population_variance: float
    sample_std_dev: float
    population_std_dev: float
    p75: float
    p90: float
    p95: float
    p99: float
    rainy_days_count: int
    rainy_days_percentage: float
    rainy_day_threshold_mm: float
    skewness: float
    kurtosis: float
    variance_convention: str = "Sample variance (Bessel's correction ddof=1, s^2 = Σ(xi - x̄)^2 / (n - 1))"


class WilsonConfidenceInterval(BaseModel):
    confidence_level: float = 0.95
    lower_bound: float
    upper_bound: float
    lower_percentage: float
    upper_percentage: float
    z_critical: float = 1.96
    method: str = "Wilson score interval for binomial proportion"
    explanation: str


class ProbabilityRequest(BaseModel):
    threshold_mm: float = Field(ge=0.0, default=50.0)
    filter_type: str = Field(default="all", description="'all', 'month', or 'season'")
    filter_value: Optional[str] = Field(default=None, description="Month number (1-12) or Season Name")


class ProbabilityResponse(BaseModel):
    threshold_mm: float
    filter_type: str
    filter_value: Optional[str]
    total_observations: int
    exceedance_count: int
    probability: float
    probability_percentage: float
    non_exceedance_count: int
    non_exceedance_probability: float
    confidence_interval_95: WilsonConfidenceInterval
    interpretation: str
    disclaimer: str


class MonthlyStatistics(BaseModel):
    month: int
    month_name: str
    total_rainfall: float
    mean_daily_rainfall: float
    median_daily_rainfall: float
    max_daily_rainfall: float
    rainy_days: int
    observation_count: int
    percentage_of_annual: float


class YearlyStatistics(BaseModel):
    year: int
    total_rainfall: float
    mean_daily_rainfall: float
    max_daily_rainfall: float
    max_daily_date: Optional[str]
    rainy_days: int
    observation_count: int


class SeasonalStatistics(BaseModel):
    season: str
    season_code: str
    months_included: List[str]
    total_rainfall: float
    mean_daily_rainfall: float
    max_daily_rainfall: float
    rainy_days: int
    observation_count: int
    percentage_of_total: float
    description: str


class AnomalyRecord(BaseModel):
    date: str
    rainfall_mm: float
    method: str
    threshold_value: float
    z_score: Optional[float]
    percentile_rank: Optional[float]
    severity: str  # 'Elevated', 'High', 'Extreme'


class AnomalyResponse(BaseModel):
    method: str
    threshold_criterion: str
    total_anomalies: int
    anomalies: List[AnomalyRecord]
    percentile_value: float
    z_score_threshold: float
    scientific_disclaimer: str


class RiskAssessment(BaseModel):
    risk_level: str  # 'Normal', 'Elevated', 'Unusually High', 'Extreme'
    category_color: str
    summary_description: str
    threshold_criteria: str
    historical_95th_percentile: float
    historical_99th_percentile: float
    max_recorded_rainfall: float
    max_recorded_date: Optional[str]
    imd_classification: str
    scientific_disclaimer: str


class FetchApiRequest(BaseModel):
    latitude: float = 13.0827
    longitude: float = 80.2707
    location_name: str = "Chennai, Tamil Nadu, India"
    start_date: str = "2004-01-01"
    end_date: str = "2023-12-31"


class ApiResponse(BaseModel):
    success: bool
    message: str
    metadata: Optional[DatasetMetadata] = None
    issues: List[ValidationIssue] = []
