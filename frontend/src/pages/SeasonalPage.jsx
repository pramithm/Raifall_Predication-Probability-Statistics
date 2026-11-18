import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Sun,
  Wind,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { fetchMonthlyStatistics, fetchYearlyStatistics, fetchSeasonalStatistics } from '../services/api';

const SEASON_ICONS = {
  WIN: Sun,
  PRE: Sun,
  SWM: Wind,
  NEM: CloudRain,
};

const SEASON_COLORS = {
  WIN: '#64748b',
  PRE: '#f59e0b',
  SWM: '#0d9488',
  NEM: '#06b6d4',
};

export default function SeasonalPage() {
  const [seasonalData, setSeasonalData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('total_rainfall');

  useEffect(() => {
    fetchSeasonalStatistics().then(setSeasonalData).catch(console.error);
    fetchMonthlyStatistics().then(setMonthlyData).catch(console.error);
    fetchYearlyStatistics().then(setYearlyData).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Monsoon Context Notice */}
      <div className="card-glass rounded-xl border border-slate-800 p-4 bg-slate-900/80">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              Monsoon Seasons & Climate Patterns
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              In Chennai and coastal regions, most rain falls during the <span className="font-bold text-cyan-400">Northeast Monsoon (Oct–Dec)</span> via tropical cyclonic storms, accounting for over 60% of annual rain.
            </p>
          </div>
        </div>
      </div>

      {/* Seasonal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {seasonalData.map((season) => {
          const Icon = SEASON_ICONS[season.season_code] || CloudRain;
          const color = SEASON_COLORS[season.season_code] || '#06b6d4';
          return (
            <div
              key={season.season_code}
              className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {season.season_code}
                  </span>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-950 font-bold"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">{season.season}</h3>
                <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                  {season.months_included.join(', ')}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Total Rain:</span>
                    <span className="font-bold text-white">
                      {season.total_rainfall.toLocaleString()} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Daily Average:</span>
                    <span className="font-bold text-cyan-400">
                      {season.mean_daily_rainfall.toFixed(2)} mm/day
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Highest Day:</span>
                    <span className="font-bold text-white">
                      {season.max_daily_rainfall.toFixed(1)} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Rainy Days:</span>
                    <span className="font-bold text-white">{season.rainy_days} days</span>
                  </div>
                </div>
              </div>

              {/* Share bar */}
              <div className="mt-4 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Share of Total Rain:</span>
                  <span style={{ color }}>{season.percentage_of_total}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${season.percentage_of_total}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Chart */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Monthly Rainfall Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Compare rainfall numbers month by month across the year.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">View:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-xs font-bold bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-cyan-400"
            >
              <option value="total_rainfall">Total Rain (mm)</option>
              <option value="mean_daily_rainfall">Daily Average (mm/day)</option>
              <option value="max_daily_rainfall">Highest Day Rain (mm)</option>
            </select>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="month_name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} unit=" mm" />
              <Tooltip
                formatter={(val) => [`${val} mm`, 'Rain Value']}
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey={selectedMetric} radius={[4, 4, 0, 0]}>
                {monthlyData.map((m) => (
                  <Cell
                    key={m.month}
                    fill={m.month >= 10 ? '#06b6d4' : m.month >= 6 ? '#0d9488' : '#475569'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year by Year Comparison Chart */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="text-base font-bold text-white mb-1">
          Year-by-Year Rain Totals
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Annual rainfall totals highlighting heavy deluge storm years (2005, 2015, 2021, 2023)
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} unit=" mm" />
              <Tooltip
                formatter={(val, name, props) => [
                  `${val} mm (Highest day: ${props.payload.max_daily_rainfall} mm on ${props.payload.max_daily_date})`,
                  'Total Rain'
                ]}
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="total_rainfall" radius={[4, 4, 0, 0]}>
                {yearlyData.map((entry) => {
                  const isPeak = [2005, 2015, 2021, 2023].includes(entry.year);
                  return (
                    <Cell
                      key={`year-${entry.year}`}
                      fill={isPeak ? '#ef4444' : '#06b6d4'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
