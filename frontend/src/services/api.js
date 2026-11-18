const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch API health');
  return res.json();
}

export async function fetchDatasetInfo() {
  const res = await fetch(`${API_BASE}/rainfall/dataset-info`);
  if (!res.ok) throw new Error('Failed to retrieve dataset info');
  return res.json();
}

export async function fetchSummaryStatistics(rainyThreshold = 2.5) {
  const res = await fetch(`${API_BASE}/rainfall/summary?rainy_threshold=${rainyThreshold}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch summary statistics');
  }
  return res.json();
}

export async function fetchTimeseries(startDate = null, endDate = null, downsample = false) {
  let url = `${API_BASE}/rainfall/timeseries?downsample=${downsample}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch timeseries data');
  return res.json();
}

export async function computeProbability(thresholdMm, filterType = 'all', filterValue = null) {
  const res = await fetch(`${API_BASE}/rainfall/probability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threshold_mm: parseFloat(thresholdMm),
      filter_type: filterType,
      filter_value: filterValue ? String(filterValue) : null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to calculate rainfall probability');
  }
  return res.json();
}

export async function fetchMonthlyStatistics(rainyThreshold = 2.5) {
  const res = await fetch(`${API_BASE}/rainfall/monthly?rainy_threshold=${rainyThreshold}`);
  if (!res.ok) throw new Error('Failed to fetch monthly statistics');
  return res.json();
}

export async function fetchYearlyStatistics(rainyThreshold = 2.5) {
  const res = await fetch(`${API_BASE}/rainfall/yearly?rainy_threshold=${rainyThreshold}`);
  if (!res.ok) throw new Error('Failed to fetch yearly statistics');
  return res.json();
}

export async function fetchSeasonalStatistics(rainyThreshold = 2.5) {
  const res = await fetch(`${API_BASE}/rainfall/seasonal?rainy_threshold=${rainyThreshold}`);
  if (!res.ok) throw new Error('Failed to fetch seasonal statistics');
  return res.json();
}

export async function fetchAnomalies(percentile = 95.0, zScore = 3.0, method = 'percentile') {
  const res = await fetch(
    `${API_BASE}/rainfall/anomalies?percentile=${percentile}&z_score=${zScore}&method=${method}`
  );
  if (!res.ok) throw new Error('Failed to fetch anomalies');
  return res.json();
}

export async function fetchRiskAssessment() {
  const res = await fetch(`${API_BASE}/rainfall/risk`);
  if (!res.ok) throw new Error('Failed to fetch risk assessment');
  return res.json();
}

export async function fetchPreview(limit = 100) {
  const res = await fetch(`${API_BASE}/rainfall/preview?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch preview records');
  return res.json();
}

export async function fetchFromOpenMeteo(latitude, longitude, startDate, endDate, locationName) {
  const res = await fetch(`${API_BASE}/rainfall/fetch-api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      start_date: startDate,
      end_date: endDate,
      location_name: locationName,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch historical weather from API');
  }
  return res.json();
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/rainfall/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload and validate CSV file');
  }
  return res.json();
}

export async function loadSampleDataset() {
  const res = await fetch(`${API_BASE}/rainfall/load-sample`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load sample dataset');
  }
  return res.json();
}

export function getExportUrl(type = 'cleaned') {
  return `${API_BASE}/rainfall/export?export_type=${type}`;
}
