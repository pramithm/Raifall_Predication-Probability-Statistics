import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  ShieldAlert
} from 'lucide-react';
import { fetchAnomalies } from '../services/api';

export default function ExtremePage({ summary, riskAssessment }) {
  const [method, setMethod] = useState('percentile');
  const [percentileVal, setPercentileVal] = useState(95.0);
  const [zScoreVal, setZScoreVal] = useState(3.0);
  const [anomalyData, setAnomalyData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const loadAnomalies = () => {
    fetchAnomalies(percentileVal, zScoreVal, method)
      .then(setAnomalyData)
      .catch(console.error);
  };

  useEffect(() => {
    loadAnomalies();
  }, [method, percentileVal, zScoreVal]);

  const anomaliesList = anomalyData?.anomalies || [];
  const filteredAnomalies = anomaliesList.filter(
    (a) =>
      a.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.severity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAnomalies.length / itemsPerPage);
  const paginatedAnomalies = filteredAnomalies.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="card-glass rounded-xl border border-slate-800 p-4 bg-slate-900/80">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              Heavy Rain & Extreme Weather Alerts
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Shows days with unusually high rainfall compared to historical averages. Note: Extreme rain is a statistical record and not an official civil flood warning.
            </p>
          </div>
        </div>
      </div>

      {/* Detection Controls */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Alert Detection Settings
            </h3>
            <p className="text-xs text-slate-400">
              Filter extreme days using Percentile cutoff or Z-Score (standard deviation spikes)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-slate-800 p-0.5 bg-slate-950 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMethod('percentile')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  method === 'percentile' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Percentile Cutoff
              </button>
              <button
                type="button"
                onClick={() => setMethod('z_score')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  method === 'z_score' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Z-Score (Sigma)
              </button>
              <button
                type="button"
                onClick={() => setMethod('combined')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  method === 'combined' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Combined
              </button>
            </div>

            {method !== 'z_score' && (
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
                <span className="font-bold text-slate-400">Cutoff:</span>
                <select
                  value={percentileVal}
                  onChange={(e) => setPercentileVal(Number(e.target.value))}
                  className="font-bold bg-transparent text-cyan-400 focus:outline-none"
                >
                  <option value="90.0">P90 Cutoff</option>
                  <option value="95.0">P95 (Top 5% Rain)</option>
                  <option value="98.0">P98 (Top 2% Rain)</option>
                  <option value="99.0">P99 (Top 1% Extreme)</option>
                </select>
              </div>
            )}

            {method !== 'percentile' && (
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
                <span className="font-bold text-slate-400">Sigma Spike:</span>
                <select
                  value={zScoreVal}
                  onChange={(e) => setZScoreVal(Number(e.target.value))}
                  className="font-bold bg-transparent text-cyan-400 focus:outline-none"
                >
                  <option value="2.5">z ≥ 2.5</option>
                  <option value="3.0">z ≥ 3.0 (3-Sigma)</option>
                  <option value="3.5">z ≥ 3.5</option>
                  <option value="4.0">z ≥ 4.0 (Very Rare)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {anomalyData && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              Rule: <span className="font-mono text-cyan-400 font-bold">{anomalyData.threshold_criterion}</span>
            </div>
            <div>
              Extreme Days Flagged: <span className="font-bold text-red-400">{anomalyData.total_anomalies} days</span>
            </div>
          </div>
        )}
      </div>

      {/* Observations Table */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Extreme Rainfall Days Table
            </h3>
            <p className="text-xs text-slate-400">
              Sorted by highest rainfall amount
            </p>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Rainfall (mm)</th>
                <th className="py-2.5 px-3">Z-Score</th>
                <th className="py-2.5 px-3">Percentile Rank</th>
                <th className="py-2.5 px-3">Severity Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {paginatedAnomalies.length > 0 ? (
                paginatedAnomalies.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-cyan-400">
                      {item.rainfall_mm.toFixed(1)} mm
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {item.z_score !== null ? `+${item.z_score.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {item.percentile_rank !== null ? `${item.percentile_rank.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.severity === 'Extreme'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : item.severity === 'High'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No extreme days found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Page {page} of {totalPages} ({filteredAnomalies.length} total events)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 font-bold"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
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
