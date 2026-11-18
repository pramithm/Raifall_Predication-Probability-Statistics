import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Play,
  Pause,
  RotateCcw,
  Compass,
  CloudRain,
  Wind,
  Thermometer,
  Zap,
  MapPin,
  Eye,
  ShieldAlert,
  Search
} from 'lucide-react';

// Custom Map Center Recenter Helper
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Preset cities with regional stations
const PRESET_CITIES = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, rain: 42.5, status: 'Heavy Rain Alert' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, rain: 68.0, status: 'Very Heavy Rain' },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, rain: 8.2, status: 'Light Rain' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, rain: 18.4, status: 'Moderate Rain' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, rain: 31.0, status: 'Moderate Rain' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, rain: 12.4, status: 'Passing Showers' },
  { name: 'London', lat: 51.5074, lon: -0.1278, rain: 4.1, status: 'Drizzle' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, rain: 24.0, status: 'Moderate Rain' },
];

// Create custom glowing marker icon
const createCustomIcon = (color = '#06b6d4', size = 28) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; opacity: 0.3; animation: pulseGlow 2s infinite;"></div>
        <div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid #0f172a; box-shadow: 0 0 10px ${color};"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function InteractiveMap({ metadata, summary }) {
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]);
  const [activeLayer, setActiveLayer] = useState('rainfall'); // 'rainfall', 'radar', 'temperature', 'wind'
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeStep, setTimeStep] = useState(0); // 0 to 4 timeline steps
  const [searchQuery, setSearchQuery] = useState('');

  // Update selected city if metadata has custom coordinates
  useEffect(() => {
    if (metadata && metadata.latitude && metadata.longitude) {
      setSelectedCity({
        name: metadata.name || 'Dataset Location',
        lat: metadata.latitude,
        lon: metadata.longitude,
        rain: summary?.max || 45.0,
        status: 'Active Study Area'
      });
    }
  }, [metadata, summary]);

  // Timeline scrubber playback animation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeStep((prev) => (prev + 1) % 5);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const timeLabels = ['-4 hrs', '-3 hrs', '-2 hrs', '-1 hr', 'LIVE Now'];

  // Radar circle radii for visualization
  const radarRadius = (timeStep + 1) * 12000;

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  const filteredCities = PRESET_CITIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card-glass-glow rounded-2xl p-5 border border-slate-800 text-slate-100 overflow-hidden relative shadow-2xl">
      {/* Map Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Compass className="h-5 w-5 text-cyan-400" /> Live Interactive Weather & Radar Map
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time rainfall radar, storm intensity layers, and weather station monitor.
          </p>
        </div>

        {/* Quick Search & Location Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {PRESET_CITIES.slice(0, 4).map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedCity.name === city.name
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Overlay Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Container (3 cols) */}
        <div className="lg:col-span-3 relative rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] h-[380px] sm:h-[440px] shadow-inner">
          <MapContainer
            center={[selectedCity.lat, selectedCity.lon]}
            zoom={10}
            scrollWheelZoom={false}
            className="h-full w-full z-0"
          >
            <ChangeView center={[selectedCity.lat, selectedCity.lon]} zoom={10} />
            
            {/* Free Dark Basemap (Esri World Dark Gray Base - No API Key Required) */}
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />

            {/* Radar Scan Layer Circle */}
            {(activeLayer === 'radar' || activeLayer === 'rainfall') && (
              <Circle
                center={[selectedCity.lat, selectedCity.lon]}
                radius={radarRadius}
                pathOptions={{
                  color: selectedCity.rain > 50 ? '#ef4444' : '#06b6d4',
                  fillColor: selectedCity.rain > 50 ? '#ef4444' : '#06b6d4',
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: '4, 8'
                }}
              />
            )}

            {/* Main City Marker */}
            <Marker
              position={[selectedCity.lat, selectedCity.lon]}
              icon={createCustomIcon(selectedCity.rain > 50 ? '#ef4444' : '#06b6d4', 32)}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <div className="font-bold text-cyan-400 text-sm">{selectedCity.name} Station</div>
                  <div className="text-slate-300">Rain Intensity: <span className="font-bold text-white">{selectedCity.rain} mm/day</span></div>
                  <div className="text-slate-400">Status: <span className="text-emerald-400 font-semibold">{selectedCity.status}</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Lat: {selectedCity.lat.toFixed(4)}, Lon: {selectedCity.lon.toFixed(4)}</div>
                </div>
              </Popup>
            </Marker>

            {/* Surrounding City Markers */}
            {PRESET_CITIES.map((c) => {
              if (c.name === selectedCity.name) return null;
              return (
                <Marker
                  key={c.name}
                  position={[c.lat, c.lon]}
                  icon={createCustomIcon('#38bdf8', 22)}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <div className="font-bold text-sky-400">{c.name}</div>
                      <div className="text-slate-300">Rain: {c.rain} mm/day</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Map Layer Selectors (Top Right) */}
          <div className="absolute top-3 right-3 z-10 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex flex-col gap-1 shadow-lg">
            <button
              onClick={() => setActiveLayer('rainfall')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLayer === 'rainfall'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudRain className="h-3.5 w-3.5" /> Rain Layer
            </button>
            <button
              onClick={() => setActiveLayer('radar')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLayer === 'radar'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5" /> Radar Scan
            </button>
            <button
              onClick={() => setActiveLayer('wind')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLayer === 'wind'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wind className="h-3.5 w-3.5" /> Wind Flow
            </button>
          </div>

          {/* Floating Rain Spectrum Legend (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] shadow-lg">
            <div className="text-slate-400 font-semibold mb-1 flex items-center justify-between">
              <span>Rainfall Intensity</span>
              <span className="text-cyan-400 font-bold">mm/h</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">0</span>
              <div className="h-2.5 w-32 rounded-full bg-gradient-to-r from-slate-700 via-cyan-500 via-blue-600 via-amber-500 to-red-500" />
              <span className="text-slate-300 font-bold">100+</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Light</span>
              <span>Mod</span>
              <span>Heavy</span>
              <span>Extreme</span>
            </div>
          </div>
        </div>

        {/* Station Telemetry & Timeline Controls (1 col) */}
        <div className="flex flex-col justify-between space-y-3">
          {/* Active Station Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Active Target</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cyan-400" /> {selectedCity.name}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                LIVE
              </span>
            </div>

            {/* Quick Gauges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500">Rain Value</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">{selectedCity.rain} mm</div>
              </div>

              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500">Status</div>
                <div className="text-xs font-bold text-emerald-400 mt-1 truncate">{selectedCity.status}</div>
              </div>

              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500">Latitude</div>
                <div className="font-mono text-slate-300 mt-0.5">{selectedCity.lat.toFixed(2)}°N</div>
              </div>

              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500">Longitude</div>
                <div className="font-mono text-slate-300 mt-0.5">{selectedCity.lon.toFixed(2)}°E</div>
              </div>
            </div>
          </div>

          {/* Radar Playback Timeline Controls */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-purple-400" /> Timeline Playback
              </span>
              <span className="text-[11px] font-mono text-purple-400 font-bold">
                {timeLabels[timeStep]}
              </span>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md shadow-cyan-500/20"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? 'Pause' : 'Play Loop'}
              </button>
              <button
                onClick={() => { setTimeStep(0); setIsPlaying(false); }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                title="Reset Timeline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Scrubber step indicators */}
            <div className="flex justify-between items-center gap-1 pt-1">
              {timeLabels.map((lbl, idx) => (
                <button
                  key={idx}
                  onClick={() => { setTimeStep(idx); setIsPlaying(false); }}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    timeStep === idx
                      ? 'bg-cyan-400 shadow-sm shadow-cyan-400'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
