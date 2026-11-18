import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { computeProbability } from '../services/api';

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const SEASON_OPTIONS = [
  { value: 'Winter', label: 'Winter (Jan-Feb)' },
  { value: 'Pre-Monsoon / Summer', label: 'Summer (Mar-May)' },
  { value: 'Southwest Monsoon', label: 'SW Monsoon (Jun-Sep)' },
  { value: 'Northeast Monsoon', label: 'NE Monsoon (Oct-Dec - Peak Rain)' },
];

export default function ProbabilityPage({ metadata }) {
  const [threshold, setThreshold] = useState(50);
  const [filterType, setFilterType] = useState('all');
  const [monthFilter, setMonthFilter] = useState('11');
  const [seasonFilter, setSeasonFilter] = useState('Northeast Monsoon');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const calculate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const filterVal = filterType === 'month' ? monthFilter : filterType === 'season' ? seasonFilter : null;
      const data = await computeProbability(threshold, filterType, filterVal);
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to calculate probability');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [filterType, monthFilter, seasonFilter]);

  const pieData = result ? [
    { name: `Heavy Rain Days (> ${result.threshold_mm} mm)`, value: result.exceedance_count, color: '#06b6d4' },
    { name: `Normal / Light Days (≤ ${result.threshold_mm} mm)`, value: result.non_exceedance_count, color: '#334155' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="card-glass rounded-xl border border-slate-800 p-5 bg-slate-900/80">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Rain Chance & Probability Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Find out the exact percentage chance of heavy rainfall exceeding any millimeter threshold for the whole year, a specific month, or monsoon season.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Panel */}
        <div className="lg:col-span-5 card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
              Select Settings
            </h3>

            {/* Threshold Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Rainfall Amount (mm):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-32 px-3 py-2 text-sm font-bold bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 text-cyan-400"
                />
                <span className="text-xs text-slate-400">millimeters in 24 hours</span>
              </div>

              {/* Threshold Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {[25, 50, 64.5, 100, 115.6, 204.5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setThreshold(val);
                      setTimeout(calculate, 50);
                    }}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                      threshold === val
                        ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {val} mm
                  </button>
                ))}
              </div>
            </div>

            {/* Time Filter Scope */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Time Period:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { id: 'all', label: 'All Year' },
                  { id: 'season', label: 'By Season' },
                  { id: 'month', label: 'By Month' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilterType(item.id)}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      filterType === item.id
                        ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {filterType === 'month' && (
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Select Month:
                  </label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {filterType === 'season' && (
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Select Monsoon Season:
                  </label>
                  <select
                    value={seasonFilter}
                    onChange={(e) => setSeasonFilter(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-400"
                  >
                    {SEASON_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={isLoading}
            className="mt-6 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-sm font-bold shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Calculator className="h-4 w-4" />
            {isLoading ? 'Calculating...' : 'Calculate Rain Chance'}
          </button>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg ? (
            <div className="p-5 bg-red-500/10 rounded-xl border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Notice:</span>
                <p className="mt-1">{errorMsg}</p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Primary Result Display */}
              <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Calculated Rain Chance
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Threshold: {result.threshold_mm} mm
                  </span>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <div>
                    <div className="text-4xl sm:text-5xl font-black tracking-tight text-cyan-400">
                      {result.probability_percentage}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Historical Exceedance Rate
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-right space-y-1">
                    <div>
                      Days exceeding threshold: <span className="font-bold text-white">{result.exceedance_count} days</span>
                    </div>
                    <div>
                      Total days evaluated: <span className="font-bold text-white">{result.total_observations.toLocaleString()} days</span>
                    </div>
                  </div>
                </div>

                {/* 95% Confidence Interval */}
                <div className="mt-5 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-purple-400" />
                      Estimated Range (95% Confidence)
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-200">
                      {result.confidence_interval_95.lower_percentage}% to {result.confidence_interval_95.upper_percentage}%
                    </span>
                  </div>

                  <div className="relative w-full h-3 bg-slate-800 rounded-full my-3 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-purple-500 rounded-full"
                      style={{
                        left: `${Math.max(0, result.confidence_interval_95.lower_percentage)}%`,
                        width: `${Math.max(
                          2,
                          result.confidence_interval_95.upper_percentage -
                            result.confidence_interval_95.lower_percentage
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Based on historical data, the true long-term chance is expected to sit between {result.confidence_interval_95.lower_percentage}% and {result.confidence_interval_95.upper_percentage}%.
                  </p>
                </div>
              </div>

              {/* Visual Proportion Chart */}
              <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Days Breakdown Chart
                </h4>

                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [`${val.toLocaleString()} days`, name]}
                        contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
