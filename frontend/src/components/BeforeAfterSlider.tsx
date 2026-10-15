import React, { useState, useRef, useCallback } from 'react';
import { Sliders } from 'lucide-react';

interface BeforeAfterSliderProps {
  preUrl: string;
  postUrl: string;
  overlayUrl?: string;
  showOverlay?: boolean;
  opacity?: number;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  preUrl,
  postUrl,
  overlayUrl,
  showOverlay = false,
  opacity = 0.8,
  className = ''
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded border border-slate-200 bg-slate-900 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* Post Disaster Base Image (Right Side) */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={postUrl}
          alt="Post Disaster"
          className="w-full h-full object-contain"
        />
        {/* Optional Damage Overlay on Post Image */}
        {showOverlay && overlayUrl && (
          <img
            src={overlayUrl}
            alt="Damage Overlay"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ opacity }}
          />
        )}
        <div className="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded border border-slate-700">
          POST-DISASTER
        </div>
      </div>

      {/* Pre Disaster Image (Left Side clipped by slider) */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={preUrl}
          alt="Pre Disaster"
          className="h-full object-contain max-w-none"
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
        />
        <div className="absolute top-3 left-3 bg-emerald-800/90 text-white text-xs font-semibold px-2.5 py-1 rounded border border-emerald-700">
          PRE-DISASTER
        </div>
      </div>

      {/* Vertical Slider Bar handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-md"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-8 h-8 rounded-full bg-white text-slate-800 border-2 border-teal-700 flex items-center justify-center shadow-lg">
          <Sliders className="w-4 h-4 text-teal-700" />
        </div>
      </div>
    </div>
  );
};
