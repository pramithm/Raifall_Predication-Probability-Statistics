import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sliders,
  HelpCircle,
  Activity,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { fetchTimeseries, fetchSummaryStatistics } from '../services/api';

export default function AnalysisPage({ summary, onSummaryUpdate }) {
  const [rainyThreshold, setRainyThreshold] = useState(2.5);
  const [currentSummary, setCurrentSummary] = useState(summary);
  const [timeseries, setTimeseries] = useState([]);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);

  useEffect(() => {
    if (summary) setCurrentSummary(summary);
  }, [summary]);

  useEffect(() => {
    loadTimeseries();
  }, []);

  const loadTimeseries = (sDate = null, eDate = null) => {
    setIsLoadingSeries(true);
    fetchTimeseries(sDate, eDate, true)
      .then(setTimeseries)
      .catch(console.error)
      .finally(() => setIsLoadingSeries(false));
  };

  const handleThresholdChange = async (newVal) => {
    setRainyThreshold(newVal);
    try {
      const updated = await fetchSummaryStatistics(newVal);
      setCurrentSummary(updated);
      if (onSummaryUpdate) onSummaryUpdate(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const applyPreset = (preset) => {
    if (preset === 'all') {
      loadTimeseries(null, null);
    } else if (preset === '2015') {
      loadTimeseries('2015-10-01', '2015-12-31');
    } else if (preset === '2023') {
      loadTimeseries('2023-10-01', '2023-12-31');
    }
  };

  if (!currentSummary) return null;

  return (
    <div className="space-y-6">
      {/* Configuration Header Bar */}
      <div className="card-glass rounded-xl border border-slate-800 p-4 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Daily Rain Numbers & Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key daily rain numbers, averages, spread, and rainy day cutoffs.
          </p>
        </div>

        {/* Rainy Day Threshold Selector */}
        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300">Rainy Day Cutoff:</span>
          <select
            value={rainyThreshold}
            onChange={(e) => handleThresholdChange(Number(e.target.value))}
            className="text-xs font-bold bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-400 focus:outline-none focus:border-cyan-500"
          >
            <option value="1.0">1.0 mm (Very Light)</option>
            <option value="2.5">2.5 mm (Standard Rainy Day)</option>
            <option value="5.0">5.0 mm (Moderate Rain)</option>
            <option value="10.0">10.0 mm (Heavy Rain)</option>
          </select>
        </div>
      </div>

      {/* Primary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average & Middle Rain */}
        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Average & Middle Rain
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="text-2xl font-black text-cyan-400">{currentSummary.mean.toFixed(2)} mm</div>
              <div className="text-xs text-slate-400">Daily Average</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">{currentSummary.median.toFixed(2)} mm</div>
              <div className="text-xs text-slate-400">Middle Value (Median)</div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Middle value is lower than average because most days have light or zero rain.
          </div>
        </div>

        {/* Rain Variation / Spread */}
        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Rain Spread & Variation
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="text-2xl font-black text-white">{currentSummary.sample_variance.toFixed(1)}</div>
              <div className="text-xs text-slate-400">Variance (s²)</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-cyan-400">{currentSummary.sample_std_dev.toFixed(2)}</div>
              <div className="text-xs text-slate-400">Std Deviation (mm)</div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Higher standard deviation means rainfall changes wildly from dry days to heavy storms.
          </div>
        </div>

        {/* Rainy Days Count */}
        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Rainy Days Count
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="text-2xl font-black text-white">{currentSummary.rainy_days_count}</div>
              <div className="text-xs text-slate-400">Rainy Days (≥ {rainyThreshold} mm)</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-cyan-400">{currentSummary.rainy_days_percentage}%</div>
              <div className="text-xs text-slate-400">Rain Frequency</div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Out of {currentSummary.count.toLocaleString()} total days in this record.
          </div>
        </div>

        {/* Rain Shape & Spikes */}
        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Storm Spike Factor
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="text-2xl font-black text-white">{currentSummary.skewness.toFixed(2)}</div>
              <div className="text-xs text-slate-400">Skewness Score</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-amber-400">{currentSummary.kurtosis.toFixed(2)}</div>
              <div className="text-xs text-slate-400">Extreme Spike Score</div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Positive scores show that rain is concentrated in sudden heavy downpours.
          </div>
        </div>
      </div>

      {/* Percentiles Breakdown */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="text-sm font-bold text-white mb-1">
          Rainfall Level Levels (Percentiles)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Shows how much rain fell on light, medium, heavy, and extreme rain days.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-bold text-slate-400">Lowest Day</span>
            <div className="text-lg font-black text-slate-300 mt-1">{currentSummary.min.toFixed(1)} mm</div>
            <span className="text-[10px] text-slate-500">Dry (0 mm)</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-bold text-slate-400">Middle Day</span>
            <div className="text-lg font-black text-white mt-1">{currentSummary.median.toFixed(1)} mm</div>
            <span className="text-[10px] text-slate-500">50% Mark</span>
          </div>

          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-center">
            <span className="text-[11px] font-bold text-cyan-400">75% Mark</span>
            <div className="text-lg font-black text-white mt-1">{currentSummary.p75.toFixed(1)} mm</div>
            <span className="text-[10px] text-cyan-300">Top 25% Rain</span>
          </div>

          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-center">
            <span className="text-[11px] font-bold text-cyan-400">90% Mark</span>
            <div className="text-lg font-black text-white mt-1">{currentSummary.p90.toFixed(1)} mm</div>
            <span className="text-[10px] text-cyan-300">Top 10% Rain</span>
          </div>

          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-center">
            <span className="text-[11px] font-bold text-amber-400">95% Mark</span>
            <div className="text-lg font-black text-amber-300 mt-1">{currentSummary.p95.toFixed(1)} mm</div>
            <span className="text-[10px] text-amber-400">Heavy Rain Day</span>
          </div>

          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30 text-center">
            <span className="text-[11px] font-bold text-red-400">99% Mark</span>
            <div className="text-lg font-black text-red-300 mt-1">{currentSummary.p99.toFixed(1)} mm</div>
            <span className="text-[10px] text-red-400">Extreme Deluge</span>
          </div>
        </div>
      </div>

      {/* Historical Explorer Chart */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Daily Rain Explorer Chart
            </h3>
            <p className="text-xs text-slate-400">
              Interactive chart showing daily rain spikes across all recorded years.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3 text-cyan-400" /> Presets:
            </span>
            <button
              onClick={() => applyPreset('all')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Full Record
            </button>
            <button
              onClick={() => applyPreset('2015')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
            >
              2015 Major Flood
            </button>
            <button
              onClick={() => applyPreset('2023')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/40"
            >
              2023 Cyclone
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          {isLoadingSeries ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Loading rain records...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  interval={Math.floor(timeseries.length / 10)}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} unit=" mm" />
                <Tooltip
                  formatter={(val) => [`${val} mm`, 'Rainfall']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="rainfall_mm"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#38bdf8', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Formula & Method Note */}
      <div className="card-glass rounded-xl border border-slate-800 p-4 bg-slate-950/60 text-xs text-slate-400 space-y-1">
        <div className="font-bold text-white flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-cyan-400" />
          Simple Calculation Note
        </div>
        <p className="leading-relaxed">
          Sample Variance and Standard Deviation use standard sample formulas (<code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-400 font-mono">ddof=1</code>) to accurately reflect real-world weather variation.
        </p>
      </div>
    </div>
  );
}
