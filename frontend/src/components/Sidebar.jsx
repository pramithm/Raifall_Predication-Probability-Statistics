import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Calculator,
  CalendarDays,
  AlertTriangle,
  Database,
  Info,
  CloudRain,
  CheckCircle2,
  Compass,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview & Map', icon: LayoutDashboard },
  { id: 'analysis', label: 'Daily Rain Stats', icon: BarChart3 },
  { id: 'probability', label: 'Rain Chance Calc', icon: Calculator },
  { id: 'seasonal', label: 'Monsoon Seasons', icon: CalendarDays },
  { id: 'extreme', label: 'Heavy Rain Alerts', icon: AlertTriangle },
  { id: 'data', label: 'Data & Uploads', icon: Database },
  { id: 'about', label: 'Project Info', icon: Info },
];

export default function Sidebar({ activeTab, setActiveTab, metadata, isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-[#090d16] text-slate-200 border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-white text-base">METEO</span>
                <span className="rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  RAINRISK
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Climate Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dataset Status Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Location
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Ready
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate" title={metadata?.name || 'Chennai, India'}>
              {metadata?.name || 'Chennai, Tamil Nadu'}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Record Length:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {metadata?.valid_observations?.toLocaleString() || '7,305'} days
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
