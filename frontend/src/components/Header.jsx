import React from 'react';
import {
  Menu,
  RotateCw,
  MapPin,
  Calendar,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';

const PAGE_DETAILS = {
  overview: {
    title: 'Rainfall Overview & Live Map',
    description: 'Quick snapshot of rainfall trends, daily averages, and live station map.',
  },
  analysis: {
    title: 'Daily Rain Numbers',
    description: 'Simple breakdown of rain stats: total rain, averages, spread, and rainy days count.',
  },
  probability: {
    title: 'Rain Probability Calculator',
    description: 'Check how likely it is to rain heavily on any given day, month, or season.',
  },
  seasonal: {
    title: 'Monsoon Seasons',
    description: 'Compare rainfall across summer, winter, and monsoon periods.',
  },
  extreme: {
    title: 'Heavy Rain Alerts & High Days',
    description: 'Highlights unusually high rainfall events and extreme rain days in history.',
  },
  data: {
    title: 'Data & Upload Center',
    description: 'Fetch new location weather data from API, upload CSV files, or export cleaned files.',
  },
  about: {
    title: 'Project Info & Help',
    description: 'Simple explanation of formulas, data source, and background information.',
  },
};

export default function Header({
  activeTab,
  metadata,
  riskAssessment,
  onRefresh,
  isRefreshing,
  onToggleSidebar,
}) {
  const pageInfo = PAGE_DETAILS[activeTab] || PAGE_DETAILS.overview;

  const getRiskBadge = () => {
    if (!riskAssessment) return null;
    const level = riskAssessment.risk_level;
    let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
    let icon = <Info className="h-3.5 w-3.5" />;

    if (level === 'Extreme') {
      badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/30';
      icon = <Flame className="h-3.5 w-3.5 text-red-400" />;
    } else if (level === 'Unusually High') {
      badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      icon = <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    } else if (level === 'Elevated') {
      badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      icon = <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    } else if (level === 'Normal') {
      badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      icon = <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
    }

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}
        title={riskAssessment.summary_description}
      >
        {icon}
        <span>Rain Status: {level}</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0b1329]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Mobile hamburger & Page Title */}
          <div className="flex items-start gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden mt-0.5"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold tracking-wide text-white">
                  {pageInfo.title}
                </h1>
                <div className="hidden sm:block">{getRiskBadge()}</div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                {pageInfo.description}
              </p>
            </div>
          </div>

          {/* Right: Dataset Provenance Pills & Refresh Action */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Location Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 text-cyan-400 text-xs font-semibold border border-slate-800">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]" title={metadata?.name || 'Chennai'}>
                {metadata?.name?.split(',')[0] || 'Chennai'}
              </span>
            </div>

            {/* Timeframe Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 text-slate-300 text-xs font-semibold border border-slate-800">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {metadata ? `${metadata.start_date.slice(0, 4)}–${metadata.end_date.slice(0, 4)}` : '2012-2025'}
              </span>
            </div>

            {/* Source Pill */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span className="truncate max-w-[150px]" title={metadata?.source || 'Open-Meteo ERA5'}>
                {metadata?.data_type === 'csv_upload' ? 'CSV File' : 'Open-Meteo'}
              </span>
            </div>

            {/* Refresh Action */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
              title="Refresh data"
            >
              <RotateCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
