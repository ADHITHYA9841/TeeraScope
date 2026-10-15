import React, { useState } from 'react';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';
import type { InferenceResults, BuildingPrediction } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { api } from '../services/api';

interface DamageOverlayMapProps {
  assessmentId: string;
  results: InferenceResults;
  selectedBuilding: BuildingPrediction | null;
  onSelectBuilding: (building: BuildingPrediction | null) => void;
}

export const DamageOverlayMap: React.FC<DamageOverlayMapProps> = ({
  assessmentId,
  results,
  selectedBuilding,
  onSelectBuilding
}) => {
  const [viewMode, setViewMode] = useState<'overlay' | 'slider' | 'pre' | 'side'>('overlay');
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.85);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filteredClasses, setFilteredClasses] = useState<number[]>([0, 1, 2, 3]);

  const preUrl = api.getPreImageUrl(assessmentId);
  const postUrl = api.getPostImageUrl(assessmentId);
  const overlayUrl = api.getResultOverlayUrl(assessmentId);

  const toggleClassFilter = (severityIdx: number) => {
    if (filteredClasses.includes(severityIdx)) {
      setFilteredClasses(filteredClasses.filter(c => c !== severityIdx));
    } else {
      setFilteredClasses([...filteredClasses, severityIdx]);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    onSelectBuilding(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-md text-xs font-medium">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1.5 rounded ${viewMode === 'overlay' ? 'bg-white text-teal-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Damage Overlay
          </button>
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded ${viewMode === 'slider' ? 'bg-white text-teal-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Split Slider
          </button>
          <button
            onClick={() => setViewMode('side')}
            className={`px-3 py-1.5 rounded ${viewMode === 'side' ? 'bg-white text-teal-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('pre')}
            className={`px-3 py-1.5 rounded ${viewMode === 'pre' ? 'bg-white text-teal-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Pre-Disaster
          </button>
        </div>

        {/* Overlay Controls */}
        {viewMode === 'overlay' && (
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
            >
              {showOverlay ? <Eye className="w-3.5 h-3.5 text-teal-700" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              {showOverlay ? 'Overlay Visible' : 'Overlay Hidden'}
            </button>

            {showOverlay && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-24 accent-teal-700 cursor-pointer"
                />
                <span className="w-8 text-slate-700 font-mono text-[11px]">{Math.round(overlayOpacity * 100)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
          <button onClick={handleZoomOut} title="Zoom Out" className="p-1 text-slate-600 hover:bg-slate-100 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-2 text-slate-600">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={handleZoomIn} title="Zoom In" className="p-1 text-slate-600 hover:bg-slate-100 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleResetZoom} title="Reset View" className="p-1 text-slate-600 hover:bg-slate-100 rounded ml-1 border-l border-slate-200">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium text-slate-700">Filter Damage Classes:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleClassFilter(0)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 border ${
              filteredClasses.includes(0) ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold' : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            No Damage ({results.damage_breakdown.no_damage.count})
          </button>
          <button
            onClick={() => toggleClassFilter(1)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 border ${
              filteredClasses.includes(1) ? 'bg-yellow-50 text-yellow-800 border-yellow-300 font-semibold' : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-600"></span>
            Minor ({results.damage_breakdown.minor_damage.count})
          </button>
          <button
            onClick={() => toggleClassFilter(2)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 border ${
              filteredClasses.includes(2) ? 'bg-orange-50 text-orange-800 border-orange-300 font-semibold' : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            Major ({results.damage_breakdown.major_damage.count})
          </button>
          <button
            onClick={() => toggleClassFilter(3)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 border ${
              filteredClasses.includes(3) ? 'bg-red-50 text-red-800 border-red-300 font-semibold' : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            Destroyed ({results.damage_breakdown.destroyed.count})
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 bg-slate-900 overflow-auto min-h-[420px] flex items-center justify-center p-4">
        {viewMode === 'slider' ? (
          <div className="w-full h-full max-h-[600px] flex items-center justify-center">
            <BeforeAfterSlider
              preUrl={preUrl}
              postUrl={postUrl}
              overlayUrl={overlayUrl}
              showOverlay={showOverlay}
              opacity={overlayOpacity}
              className="w-full h-[540px]"
            />
          </div>
        ) : viewMode === 'side' ? (
          <div className="grid grid-cols-2 gap-3 w-full h-full">
            <div className="relative bg-slate-950 rounded overflow-hidden border border-slate-800">
              <img src={preUrl} alt="Pre Disaster" className="w-full h-full object-contain" />
              <div className="absolute top-2 left-2 bg-emerald-800/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                PRE-DISASTER
              </div>
            </div>
            <div className="relative bg-slate-950 rounded overflow-hidden border border-slate-800">
              <img src={postUrl} alt="Post Disaster" className="w-full h-full object-contain" />
              {showOverlay && (
                <img
                  src={overlayUrl}
                  alt="Overlay"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ opacity: overlayOpacity }}
                />
              )}
              <div className="absolute top-2 left-2 bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                POST-DISASTER + MASK
              </div>
            </div>
          </div>
        ) : viewMode === 'pre' ? (
          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img src={preUrl} alt="Pre Disaster" className="max-h-[560px] object-contain rounded" />
          </div>
        ) : (
          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img src={postUrl} alt="Post Disaster Base" className="max-h-[560px] object-contain rounded" />

            {showOverlay && (
              <img
                src={overlayUrl}
                alt="Predicted Damage Mask"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded"
                style={{ opacity: overlayOpacity }}
              />
            )}

            <svg
              className="absolute inset-0 w-full h-full pointer-events-auto"
              viewBox={`0 0 ${results.processed_dimensions[0]} ${results.processed_dimensions[1]}`}
            >
              {results.buildings.map((bld) => {
                if (!filteredClasses.includes(bld.damage_severity)) return null;

                const isSelected = selectedBuilding?.id === bld.id;
                const [x, y, w, h] = bld.bbox;

                return (
                  <rect
                    key={bld.id}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="transparent"
                    stroke={isSelected ? '#00FFFF' : bld.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="cursor-pointer hover:stroke-cyan-300 transition-colors"
                    onClick={() => onSelectBuilding(isSelected ? null : bld)}
                  >
                    <title>{`${bld.id} (${bld.damage_class}) - Confidence ${Math.round(bld.confidence * 100)}%`}</title>
                  </rect>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
