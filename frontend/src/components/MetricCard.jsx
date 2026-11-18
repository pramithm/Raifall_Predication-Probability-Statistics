import React from 'react';

export default function MetricCard({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  badgeText = null,
  badgeColor = 'cyan',
}) {
  const getBadgeClass = (color) => {
    switch (color) {
      case 'red':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'amber':
      case 'orange':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'emerald':
      case 'green':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  const getIconBg = (color) => {
    switch (color) {
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'amber': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'emerald': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="card-glass rounded-xl p-4 border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          {Icon && (
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${getIconBg(badgeColor)}`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-black tracking-tight text-white">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-slate-400">{unit}</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
        <span className="text-[11px] text-slate-400 truncate" title={subtitle}>
          {subtitle}
        </span>
        {badgeText && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeClass(
              badgeColor
            )} shrink-0`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
