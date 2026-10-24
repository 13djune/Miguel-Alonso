import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IndustryGarment } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface GarmentLightboxModalProps {
  garment: IndustryGarment;
  initialIndex?: number;
  onClose: () => void;
  isLight?: boolean;
}

export default function GarmentLightboxModal({
  garment,
  initialIndex = 0,
  onClose,
  isLight = false,
}: GarmentLightboxModalProps) {
  const { language } = useLanguage();
  const isES = language === 'es';

  const images = useMemo(() => {
    if (!garment) return [];
    return garment.images && garment.images.length > 0 ? garment.images : [garment.image];
  }, [garment]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex % (images.length || 1));
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync index if initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex % (images.length || 1));
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [initialIndex, images.length]);

  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel > 1) {
      resetZoom();
    } else {
      setZoomLevel(2.2);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100005] flex flex-col justify-between overflow-hidden select-none animate-fadeIn ${
        isLight ? 'bg-[#f5f5f8]/98 text-black' : 'bg-[#050505]/98 text-white'
      }`}
      onClick={onClose}
    >
      {/* Ambient Background Grid & Scanlines */}
      <div className={`absolute inset-0 bg-cyber-grid pointer-events-none ${isLight ? 'opacity-25' : 'opacity-15'}`} />
      <div className="scanlines pointer-events-none" />

      {/* Top Tactical Control Header */}
      <div
        className={`relative z-[120] w-full border-b px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 ${
          isLight
            ? 'bg-white/95 border-black shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-black'
            : 'bg-black/90 border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Garment Identifier */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className={`w-2 h-2 animate-pulse ${isLight ? 'bg-black' : 'bg-white'}`} />
          <span
            className={`font-mono text-[9px] sm:text-xs font-bold uppercase tracking-widest ${
              isLight ? 'text-black' : 'text-white'
            }`}
          >
            {isES
              ? `GALERÍA HD // ${garment.refCode} // VISTA ${(currentIndex + 1).toString().padStart(2, '0')} / ${images.length.toString().padStart(2, '0')}`
              : `HD GALLERY // ${garment.refCode} // VIEW ${(currentIndex + 1).toString().padStart(2, '0')} / ${images.length.toString().padStart(2, '0')}`}
          </span>
          <span
            className={`hidden md:inline font-mono text-[9px] border px-1.5 py-0.5 uppercase ${
              isLight ? 'text-black border-black/40' : 'text-white/80 border-white/30'
            }`}
          >
            {garment.name}
          </span>
        </div>

        {/* Center: Zoom Controls Toolbar */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 border px-2 py-1 ${
            isLight ? 'bg-black/[0.04] border-black/30' : 'bg-white/[0.05] border-white/30'
          }`}
        >
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            title={isES ? 'Alejar zoom (-)' : 'Zoom out (-)'}
            className={`cursor-target cursor-crosshair pulse-tactile font-mono text-xs sm:text-sm px-2 py-0.5 disabled:opacity-30 font-bold transition-colors ${
              isLight ? 'text-black hover:text-black' : 'text-white hover:text-white'
            }`}
          >
            -
          </button>
          <button
            type="button"
            onClick={resetZoom}
            title={isES ? 'Restablecer zoom 100% (0)' : 'Reset zoom 100% (0)'}
            className={`cursor-target cursor-crosshair pulse-tactile font-mono text-[9px] sm:text-[10px] px-2 py-0.5 border font-bold tracking-wider transition-colors ${
              isLight
                ? 'bg-white border-black text-black hover:bg-black hover:text-white'
                : 'bg-black border-white/40 text-white hover:bg-white hover:text-black'
            }`}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 4}
            title={isES ? 'Acercar zoom (+)' : 'Zoom in (+)'}
            className={`cursor-target cursor-crosshair pulse-tactile font-mono text-xs sm:text-sm px-2 py-0.5 disabled:opacity-30 font-bold transition-colors ${
              isLight ? 'text-black hover:text-black' : 'text-white hover:text-white'
            }`}
          >
            +
          </button>
          <span
            className={`hidden lg:inline-block font-mono text-[8px] border-l pl-2 ml-1 ${
              isLight ? 'text-black/40 border-black/20' : 'text-white/40 border-white/20'
            }`}
          >
            {isES ? 'RUEDA / DOBLE CLICK / ARRASTRAR' : 'WHEEL / DOUBLE CLICK / DRAG'}
          </span>
        </div>

        {/* Right: Close Button with Solid White Fill & Magnetic Cursor */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-target cursor-crosshair pulse-tactile border border-white bg-white text-black hover:bg-black hover:text-white font-mono font-bold text-xs uppercase tracking-wider px-2 py-1 transition-colors shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.4)]"
            title={isES ? 'Cerrar' : 'Close'}
          >
            [ X ]
          </button>
        </div>
      </div>

      {/* Central Interactive Zoom Viewport */}
      <div
        className={`relative flex-1 w-full h-full flex items-center justify-center overflow-hidden ${
          zoomLevel > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous / Next Arrow Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous look"
              className={`cursor-target cursor-crosshair pulse-tactile absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 border font-mono text-sm sm:text-base font-bold flex items-center justify-center transition-all z-[115] ${
                isLight
                  ? 'bg-white hover:bg-black text-black hover:text-white border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]'
                  : 'bg-black/85 border-white hover:border-white hover:bg-white hover:text-black text-white shadow-[0_0_15px_rgba(0,0,0,0.8)]'
              }`}
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next look"
              className={`cursor-target cursor-crosshair pulse-tactile absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 border font-mono text-sm sm:text-base font-bold flex items-center justify-center transition-all z-[115] ${
                isLight
                  ? 'bg-white hover:bg-black text-black hover:text-white border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]'
                  : 'bg-black/85 border-white hover:border-white hover:bg-white hover:text-black text-white shadow-[0_0_15px_rgba(0,0,0,0.8)]'
              }`}
            >
              &gt;
            </button>
          </>
        )}

        {/* Scalable and Pannable Image Container */}
        <div
          className="relative inline-block max-w-[90vw] max-h-[72vh] flex items-center justify-center will-change-transform"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
            transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`${garment.name} - View ${currentIndex + 1}`}
            className={`max-w-[90vw] max-h-[72vh] object-contain border pointer-events-none select-none ${
              isLight
                ? 'border-black shadow-[8px_8px_0px_rgba(0,0,0,0.9)]'
                : 'border-white/60 shadow-[0_0_50px_rgba(0,0,0,0.95)]'
            }`}
          />
        </div>
      </div>

      {/* Bottom Thumbnails Strip Bar (Lower-Left Carousel Matching SYS.CREATIVE) */}
      <div
        className={`relative z-[120] w-full border-t px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto ${
          isLight
            ? 'bg-white/95 border-black shadow-[0_-4px_20px_rgba(0,0,0,0.1)] text-black'
            : 'bg-black/95 border-white/30 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carousel on Lower-Left corner */}
        <div className="flex items-center gap-2">
          {images.map((img, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className={`cursor-target cursor-crosshair pulse-tactile relative w-11 h-11 sm:w-13 sm:h-13 border transition-all shrink-0 overflow-hidden ${
                  isActive
                    ? isLight
                      ? 'border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.9)] scale-105 bg-white'
                      : 'border-2 border-white shadow-[0_0_12px_#ffffff] scale-105 bg-black/80'
                    : isLight
                    ? 'border border-black/30 hover:border-black opacity-70 hover:opacity-100 bg-neutral-100'
                    : 'border border-white/30 hover:border-white opacity-60 hover:opacity-100 bg-black/80'
                }`}
              >
                <img
                  src={img}
                  alt={`Look ${idx + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <span className="absolute bottom-0 right-0 bg-black/80 text-[7px] font-mono text-white px-1 pointer-events-none">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>

        <div className="font-mono text-[9px] uppercase tracking-wider shrink-0 hidden sm:block">
          <span className={isLight ? 'text-black/70' : 'text-white/70'}>
            [ {currentIndex + 1} / {images.length} {isES ? 'VISTAS' : 'VIEWS'} ]
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
