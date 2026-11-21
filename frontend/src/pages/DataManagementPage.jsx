import React, { useState, useEffect } from 'react';
import {
  CloudDownload,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  RotateCcw
} from 'lucide-react';
import {
  fetchFromOpenMeteo,
  uploadCsv,
  loadSampleDataset,
  fetchPreview,
  getExportUrl
} from '../services/api';

const CITY_PRESETS = [
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707, start: '2004-01-01', end: '2023-12-31' },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777, start: '2004-01-01', end: '2023-12-31' },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946, start: '2004-01-01', end: '2023-12-31' },
  { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639, start: '2004-01-01', end: '2023-12-31' },
  { name: 'Delhi, NCR', lat: 28.6139, lon: 77.2090, start: '2004-01-01', end: '2023-12-31' },
];

export default function DataManagementPage({ metadata, onDatasetUpdated }) {
  const [activeSourceTab, setActiveSourceTab] = useState('api');

  const [locationName, setLocationName] = useState('Chennai, Tamil Nadu, India');
  const [latitude, setLatitude] = useState(13.0827);
  const [longitude, setLongitude] = useState(80.2707);
  const [startDate, setStartDate] = useState('2004-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleStatus, setSampleStatus] = useState(null);

  const [previewRows, setPreviewRows] = useState([]);
  const [previewPage, setPreviewPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchPreview(100).then(setPreviewRows).catch(console.error);
  }, [metadata]);

  const applyCityPreset = (city) => {
    setLocationName(city.name);
    setLatitude(city.lat);
    setLongitude(city.lon);
    setStartDate(city.start);
    setEndDate(city.end);
  };

  const handleFetchApi = async (e) => {
    e.preventDefault();
    setApiLoading(true);
    setApiStatus(null);
    try {
      const res = await fetchFromOpenMeteo(latitude, longitude, startDate, endDate, locationName);
      setApiStatus({ type: 'success', message: res.message });
      if (onDatasetUpdated) onDatasetUpdated();
    } catch (err) {
      setApiStatus({ type: 'error', message: err.message || 'API request failed' });
    } finally {
      setApiLoading(false);
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadLoading(true);
    setUploadStatus(null);
    try {
      const res = await uploadCsv(selectedFile);
      setUploadStatus({
        type: 'success',
        message: res.message,
        issues: res.issues || [],
      });
      if (onDatasetUpdated) onDatasetUpdated();
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.message || 'CSV upload failed' });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setSampleLoading(true);
    setSampleStatus(null);
    try {
      const res = await loadSampleDataset();
      setSampleStatus({ type: 'success', message: res.message });
      if (onDatasetUpdated) onDatasetUpdated();
    } catch (err) {
      setSampleStatus({ type: 'error', message: err.message || 'Failed to load sample dataset' });
    } finally {
      setSampleLoading(false);
    }
  };

  const totalPreviewPages = Math.ceil(previewRows.length / rowsPerPage);
  const currentPreviewRows = previewRows.slice(
    (previewPage - 1) * rowsPerPage,
    previewPage * rowsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="card-glass rounded-xl border border-slate-800 p-2 bg-slate-900/80 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSourceTab('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSourceTab === 'api'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CloudDownload className="h-4 w-4" />
          Fetch Weather Data from API
        </button>

        <button
          onClick={() => setActiveSourceTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSourceTab === 'upload'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Upload CSV File
        </button>

        <button
          onClick={() => setActiveSourceTab('sample')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSourceTab === 'sample'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Chennai Sample
        </button>
      </div>

      {/* Tab Panels */}
      {activeSourceTab === 'api' && (
        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">
                Fetch Historical Weather Data from Open-Meteo
              </h3>
              <p className="text-xs text-slate-400">
                Downloads daily rainfall data for any location and date range
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 self-start">
              Open-Meteo API
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 mb-2 block">Quick Indian City Presets:</span>
            <div className="flex flex-wrap gap-2">
              {CITY_PRESETS.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => applyCityPreset(city)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                >
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleFetchApi} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Location Name:</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Latitude:</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Longitude:</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={apiLoading}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CloudDownload className="h-4 w-4" />
                {apiLoading ? 'Fetching...' : 'Fetch Data'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none"
                required
              />
            </div>
          </form>

          {apiStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                apiStatus.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border border-red-500/30'
              }`}
            >
              {apiStatus.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <span>{apiStatus.message}</span>
            </div>
          )}
        </div>
      )}

      {activeSourceTab === 'upload' && (
        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">
              Upload Custom Rainfall CSV File
            </h3>
            <p className="text-xs text-slate-400">
              CSV file must include columns: <span className="font-mono text-cyan-400">date</span> and{' '}
              <span className="font-mono text-cyan-400">rainfall_mm</span> (or precipitation)
            </p>
          </div>

          <form onSubmit={handleUploadFile} className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-950/50 hover:bg-slate-950 transition-colors">
              <UploadCloud className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full max-w-xs mx-auto text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Validates dates and filters out missing or negative values automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploadLoading}
              className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UploadCloud className="h-4 w-4" />
              {uploadLoading ? 'Uploading...' : 'Upload & Analyze File'}
            </button>
          </form>

          {uploadStatus && (
            <div
              className={`p-3 rounded-lg text-xs space-y-2 ${
                uploadStatus.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {uploadStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span>{uploadStatus.message}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSourceTab === 'sample' && (
        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">
              Restore 20-Year Chennai Dataset
            </h3>
            <p className="text-xs text-slate-400">
              Reloads historical 7,305 daily records for Chennai (2012-2025)
            </p>
          </div>

          <button
            onClick={handleLoadSample}
            disabled={sampleLoading}
            className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {sampleLoading ? 'Loading Sample...' : 'Reset to Chennai Dataset'}
          </button>

          {sampleStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                sampleStatus.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border border-red-500/30'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{sampleStatus.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Dataset Info & Download Bar */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Active Dataset Details</h3>
            <p className="text-xs text-slate-400">
              Location details and download options
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getExportUrl('cleaned')}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              Download Cleaned CSV
            </a>
            <a
              href={getExportUrl('summary')}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              Download Stats Summary
            </a>
          </div>
        </div>

        {metadata && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Dataset Name:</span>
              <span className="font-bold text-white truncate block" title={metadata.name}>
                {metadata.name}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Valid Days:</span>
              <span className="font-bold text-cyan-400">
                {metadata.valid_observations.toLocaleString()} days
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Date Range:</span>
              <span className="font-mono text-slate-300 font-bold block">
                {metadata.start_date} to {metadata.end_date}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Data Source:</span>
              <span className="font-bold text-slate-200 truncate block">
                {metadata.data_type === 'csv_upload' ? 'User CSV' : 'Open-Meteo API'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Preview Table */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <h4 className="text-sm font-bold text-white mb-3">
          Daily Records Preview
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-2 px-3">Row</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Precipitation (mm)</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {currentPreviewRows.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50">
                  <td className="py-2 px-3 font-mono text-slate-500">
                    {(previewPage - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-white">{r.date}</td>
                  <td className="py-2 px-3 font-bold text-cyan-400">{r.rainfall_mm.toFixed(1)} mm</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Validated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPreviewPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 mt-2">
            <span>
              Page {previewPage} of {totalPreviewPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={previewPage <= 1}
                onClick={() => setPreviewPage((p) => p - 1)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 font-bold"
              >
                Prev
              </button>
              <button
                disabled={previewPage >= totalPreviewPages}
                onClick={() => setPreviewPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
