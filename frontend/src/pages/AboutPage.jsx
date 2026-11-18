import React from 'react';
import {
  GraduationCap,
  Calculator,
  Compass,
  Code2,
  AlertTriangle,
  CloudRain
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Probability & Statistics Capstone Project
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              METEO INTELLIGENCE / RainRisk
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mt-2">
          This project was built for the course <span className="font-bold text-white">Probability and Statistics</span>. It applies real-world math formulas to historical rainfall records: calculating daily rain averages, chance of heavy rain, confidence ranges, and extreme weather spikes.
        </p>
      </div>

      {/* Overview & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <CloudRain className="h-4 w-4 text-cyan-400" />
            Project Goal
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Coastal cities face heavy rainfall storms during monsoon seasons. This application uses simple statistics to analyze past weather data and calculate how often heavy rain events occur over time.
          </p>
        </div>

        <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <Compass className="h-4 w-4 text-emerald-400" />
            Default Region: Chennai, India
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Analyzes 20 years of daily rainfall data for Chennai, Tamil Nadu (2004–2023). Highlights major storms like the 2015 floods (345 mm in one day) and 2023 Cyclone Michaung (255 mm in one day).
          </p>
        </div>
      </div>

      {/* Simple Math Formulas */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calculator className="h-5 w-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">
            Core Statistical Formulas Used
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>1. Daily Average & Variance</span>
              <span className="font-mono text-cyan-400">ddof = 1</span>
            </div>
            <p className="text-slate-400">
              Calculates daily average rain and sample variation across all recorded days:
            </p>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-center text-cyan-300">
              Average = Sum(Rain) / Total Days
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>2. Rain Chance (Probability)</span>
              <span className="font-mono text-cyan-400">Percentage %</span>
            </div>
            <p className="text-slate-400">
              Calculates the chance of rain exceeding a chosen limit (e.g. 50 mm):
            </p>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-center text-cyan-300">
              Chance % = (Heavy Rain Days / Total Days) * 100
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>3. Confidence Interval Range</span>
              <span className="font-mono text-purple-400">95% Wilson Score</span>
            </div>
            <p className="text-slate-400">
              Calculates a lower and upper range for the estimated rain chance with 95% certainty.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>4. Z-Score (Sigma Spike)</span>
              <span className="font-mono text-cyan-400">Standard Deviation</span>
            </div>
            <p className="text-slate-400">
              Measures how far a specific storm day spiked above the normal daily average.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card-glass rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Code2 className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">System Architecture</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Frontend</span>
            <ul className="space-y-1 text-slate-400">
              <li>• <span className="font-semibold text-white">React + Vite</span> — Responsive web dashboard</li>
              <li>• <span className="font-semibold text-white">Leaflet Map</span> — Interactive map with radar overlays</li>
              <li>• <span className="font-semibold text-white">Recharts</span> — Sleek dark weather trend charts</li>
              <li>• <span className="font-semibold text-white">Tailwind CSS</span> — Meteo Intelligence dark theme</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Backend</span>
            <ul className="space-y-1 text-slate-400">
              <li>• <span className="font-semibold text-white">Python + FastAPI</span> — Fast API REST web service</li>
              <li>• <span className="font-semibold text-white">NumPy & Pandas</span> — Data processing and math stats</li>
              <li>• <span className="font-semibold text-white">SciPy</span> — Wilson score confidence calculations</li>
              <li>• <span className="font-semibold text-white">Open-Meteo API</span> — Historical weather data API</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="card-glass rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 text-xs space-y-2 text-amber-300">
        <div className="font-bold flex items-center gap-2 text-sm text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          Disclaimer
        </div>
        <p className="leading-relaxed">
          RainRisk is an educational application for Probability & Statistics. It calculates historical rainfall statistics and is not an official weather forecast or flood warning system.
        </p>
      </div>
    </div>
  );
}
