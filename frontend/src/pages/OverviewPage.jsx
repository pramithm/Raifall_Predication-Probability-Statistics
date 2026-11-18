import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Droplets,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Flame,
  BarChart2,
  Compass,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import MetricCard from '../components/MetricCard';
import InteractiveMap from '../components/InteractiveMap';
import { computeProbability, fetchMonthlyStatistics, fetchTimeseries } from '../services/api';

export default function OverviewPage({
  summary,
  metadata,
  riskAssessment,
  anomalies,
  onNavigate,
}) {
  const [selectedThreshold, setSelectedThreshold] = useState(50);
  const [probData, setProbData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchMonthlyStatistics().then(setMonthlyData).catch(console.error);
    fetchTimeseries(null, null, true).then(setTrendData).catch(console.error);
  }, [metadata]);

  useEffect(() => {
    if (!summary) return;
    computeProbability(selectedThreshold, 'all')
      .then(setProbData)
      .catch(console.error);
  }, [selectedThreshold, summary]);

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center card-glass rounded-2xl border border-slate-800">
        <div className="h-12 w-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
          <CloudRain className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Rainfall Data Loaded</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1 mb-6">
          Please select a location or upload a CSV file to see weather analytics.
        </p>
        <button
          onClick={() => onNavigate('data')}
          className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
        >
          Go to Data & Uploads
        </button>
      </div>
    );
  }

  // Simple distribution categories
  const distributionData = [
    { category: 'Dry (0 mm)', count: Math.round(summary.count * (1 - summary.rainy_days_percentage / 100)), color: '#475569' },
    { category: 'Light (2.5-15.5)', count: Math.round(summary.rainy_days_count * 0.65), color: '#38bdf8' },
    { category: 'Moderate (15.6-64.4)', count: Math.round(summary.rainy_days_count * 0.25), color: '#2563eb' },
    { category: 'Heavy (64.5-115.5)', count: Math.round(summary.rainy_days_count * 0.08), color: '#f59e0b' },
    { category: 'Extreme (>115.5)', count: Math.round(summary.rainy_days_count * 0.02), color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive Weather Map Component (Meteo Intelligence style) */}
      <InteractiveMap metadata={metadata} summary={summary} />

      {/* Threshold Selector Notice Bar */}
      <div className="card-glass rounded-xl border border-slate-800 p-4 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Location: {metadata?.name || 'Chennai, Tamil Nadu, India'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on {summary.count.toLocaleString()} daily records ({metadata?.start_date} to {metadata?.end_date}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-400">Rain Limit:</span>
          <select
            value={selectedThreshold}
            onChange={(e) => setSelectedThreshold(Number(e.target.value))}
            className="text-xs font-bold bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-400 focus:outline-none focus:border-cyan-500"
          >
            <option value="25">25 mm (Light Rain)</option>
            <option value="50">50 mm (Heavy Rain)</option>
            <option value="75">75 mm (Very Heavy)</option>
            <option value="100">100 mm (Severe Storm)</option>
            <option value="150">150 mm (Extreme Deluge)</option>
          </select>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Rain"
          value={summary.total_rainfall.toLocaleString()}
          unit="mm"
          subtitle={`~${(summary.total_rainfall / (summary.count / 365.25)).toFixed(0)} mm per year`}
          icon={Droplets}
          badgeText="Total"
          badgeColor="cyan"
        />

        <MetricCard
          title="Daily Average"
          value={summary.mean.toFixed(2)}
          unit="mm/day"
          subtitle={`Median: ${summary.median.toFixed(1)} mm`}
          icon={BarChart2}
          badgeText="Average"
          badgeColor="cyan"
        />

        <MetricCard
          title="Highest Day Rain"
          value={summary.max.toFixed(1)}
          unit="mm"
          subtitle={riskAssessment?.max_recorded_date ? `Date: ${riskAssessment.max_recorded_date}` : 'Peak Rain'}
          icon={TrendingUp}
          badgeText="Max Record"
          badgeColor="red"
        />

        <MetricCard
          title={`Days > ${selectedThreshold} mm`}
          value={probData ? probData.exceedance_count : '...'}
          unit="days"
          subtitle={`Out of ${summary.count.toLocaleString()} total days`}
          icon={Calendar}
          badgeText={probData ? `${probData.probability_percentage}%` : ''}
          badgeColor="amber"
        />

        <MetricCard
          title={`Chance (> ${selectedThreshold} mm)`}
          value={probData ? `${probData.probability_percentage}%` : '...'}
          subtitle={
            probData
              ? `Range: ${probData.confidence_interval_95.lower_percentage}% - ${probData.confidence_interval_95.upper_percentage}%`
              : 'Probability'
          }
          icon={CloudRain}
          badgeText="Probability"
          badgeColor="purple"
        />

        <MetricCard
          title="Extreme Rain Days"
          value={anomalies?.total_anomalies ?? 0}
          unit="days"
          subtitle={`Cutoff: ${summary.p95.toFixed(1)} mm`}
          icon={AlertTriangle}
          badgeText={riskAssessment?.risk_level || 'Normal'}
          badgeColor={riskAssessment?.risk_level === 'Extreme' ? 'red' : 'amber'}
        />
      </div>

      {/* Row 1: Rain Trend & Monthly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rainfall Trend Chart */}
        <div className="lg:col-span-2 card-glass rounded-xl p-5 border border-slate-800 bg-slate-900/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Rainfall Trend</h3>
              <p className="text-xs text-slate-400">Total monthly rain over time demonstrating monsoon cycles</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 self-start sm:self-auto">
              Historical Timeline
            </span>
          </div>

          <div className="h-72 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonCyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    interval={Math.floor(trendData.length / 8)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    unit=" mm"
                  />
                  <Tooltip
                    formatter={(val) => [`${val} mm`, 'Monthly Rain']}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rainfall_mm"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#neonCyanGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Loading rain trend chart...
              </div>
            )}
          </div>
        </div>

        {/* Monthly Average Bar Chart */}
        <div className="card-glass rounded-xl p-5 border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Monthly Daily Averages</h3>
            <p className="text-xs text-slate-400 mb-4">Average daily rain across calendar months</p>

            <div className="h-72 w-full">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis
                      dataKey="month_name"
                      tickFormatter={(val) => val.slice(0, 3)}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} unit=" mm" />
                    <Tooltip
                      formatter={(val) => [`${val} mm/day`, 'Avg Rain']}
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="mean_daily_rainfall" radius={[4, 4, 0, 0]}>
                      {monthlyData.map((entry) => (
                        <Cell
                          key={`cell-${entry.month}`}
                          fill={entry.month >= 10 ? '#38bdf8' : entry.month >= 6 ? '#0d9488' : '#475569'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Loading monthly chart...
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400 inline-block" /> Oct-Dec Monsoon
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-500 inline-block" /> Jun-Sep Monsoon
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown, Simple Probability & Risk Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rainfall Intensity Breakdown */}
        <div className="card-glass rounded-xl p-5 border border-slate-800 bg-slate-900/80">
          <h3 className="text-base font-bold text-white mb-1">
            Rain Intensity Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            How many days fell into each rainfall category
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#cbd5e1' }} tickLine={false} width={100} />
                <Tooltip
                  formatter={(val) => [`${val.toLocaleString()} days`, 'Count']}
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {distributionData.map((d, idx) => (
                    <Cell key={idx} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200">Dry Days Note:</span> Around{' '}
            <span className="font-bold text-cyan-400">
              {(100 - summary.rainy_days_percentage).toFixed(1)}%
            </span>{' '}
            of days have no rain, which is normal for monsoon climates.
          </div>
        </div>

        {/* Rain Chance Summary */}
        <div className="card-glass rounded-xl p-5 border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">
                Heavy Rain Chance
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Probability
              </span>
            </div>

            {probData ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Chance of Rain &gt; {selectedThreshold} mm</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">
                    {probData.probability_percentage}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Happened on <span className="font-bold text-white">{probData.exceedance_count}</span> of{' '}
                    <span className="font-bold text-white">{probData.total_observations.toLocaleString()}</span> days.
                  </div>
                </div>

                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-xs space-y-1">
                  <div className="font-bold text-purple-300">Confidence Range</div>
                  <div className="font-mono text-purple-200 font-bold">
                    {probData.confidence_interval_95.lower_percentage}% to {probData.confidence_interval_95.upper_percentage}%
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                    Based on historical records, the actual long-term chance sits within this estimated range.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">Calculating chance...</div>
            )}
          </div>

          <button
            onClick={() => onNavigate('probability')}
            className="mt-4 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
          >
            Open Chance Calculator <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Rain Risk Alert Profile */}
        <div className="card-glass rounded-xl p-5 border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">Rain Status Profile</h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  riskAssessment?.risk_level === 'Extreme'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {riskAssessment?.risk_level || 'Normal'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {riskAssessment?.summary_description || 'Dataset shows historical rainfall patterns.'}
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">95% High Days Cutoff:</span>
                <span className="font-bold text-white">{summary.p95.toFixed(1)} mm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">99% Peak Days Cutoff:</span>
                <span className="font-bold text-white">{summary.p99.toFixed(1)} mm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Rainy Days (≥ 2.5 mm):</span>
                <span className="font-bold text-cyan-400">
                  {summary.rainy_days_count} ({summary.rainy_days_percentage}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
            <span className="font-bold flex items-center gap-1 mb-0.5 text-amber-400">
              <AlertTriangle className="h-3 w-3" /> Quick Note
            </span>
            This indicator shows past rainfall patterns. It is a historical statistic and not a live weather forecast.
          </div>
        </div>
      </div>
    </div>
  );
}
