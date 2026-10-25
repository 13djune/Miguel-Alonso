import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IndustryGarment } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface SectorLightboxItem {
  id: string;
  garment: IndustryGarment;
  imageUrl: string;
  imageIndexInGarment: number;
  totalImagesInGarment: number;
  globalIndex: number;
}

export interface GarmentLightboxModalProps {
  garment: IndustryGarment;
  initialIndex?: number;
  sectorGarments?: IndustryGarment[];
  sectorTitle?: string;
  onClose: () => void;
  onGarmentChange?: (newGarment: IndustryGarment, newImageIndex: number) => void;
  isLight?: boolean;
}

export default function GarmentLightboxModal({
  garment,
  initialIndex = 0,
  sectorGarments,
  sectorTitle,
  onClose,
  onGarmentChange,
  isLight = false,
}: GarmentLightboxModalProps) {
  const { language } = useLanguage();
  const isES = language === 'es';

  // Construct flattened list of all images across all garments in the current sector
  const items: SectorLightboxItem[] = useMemo(() => {
    const list: SectorLightboxItem[] = [];
    const sourceGarments =
      sectorGarments && sectorGarments.length > 0 ? sectorGarments : [garment];

    let globalIdx = 0;
    sourceGarments.forEach((g) => {
      // Gather images: if garment has colorways and no explicit override images, include all colorways uniquely
      let gImages: string[];
      if (g.images && g.images.length > 0) {
        gImages = g.images;
      } else if (g.colorways && g.colorways.length > 0) {
        const collected: string[] = [];
        g.colorways.forEach((cw) => {
          (cw.images || [cw.image]).forEach((img) => {
            if (!collected.includes(img)) collected.push(img);
          });
        });
        gImages = collected.length > 0 ? collected : [g.image];
      } else {
        gImages = [g.image];
      }

      gImages.forEach((imgUrl, imgIdx) => {
        list.push({
          id: `${g.id}_${imgIdx}`,
          garment: g,
          imageUrl: imgUrl,
          imageIndexInGarment: imgIdx,
          totalImagesInGarment: gImages.length,
          globalIndex: globalIdx,
        });
        globalIdx++;
      });
    });

    return list;
  }, [sectorGarments, garment]);

  // Helper to find index in sector items matching garment and photo index
  const findItemIndex = (targetGarment: IndustryGarment, targetImgIdx: number): number => {
    if (!items.length) return 0;
    const targetImages =
      targetGarment.images && targetGarment.images.length > 0
        ? targetGarment.images
        : [targetGarment.image];
    const targetImgUrl = targetImages[targetImgIdx];

    // Priority 1: Match by exact image URL
    if (targetImgUrl) {
      const matchByUrl = items.findIndex((item) => item.imageUrl === targetImgUrl);
      if (matchByUrl !== -1) return matchByUrl;
    }

    // Priority 2: Match by garment ID and index
    const match = items.findIndex(
      (item) =>
        item.garment.id === targetGarment.id &&
        item.imageIndexInGarment === targetImgIdx
    );
    if (match !== -1) return match;

    const fallbackGarmentMatch = items.findIndex(
      (item) => item.garment.id === targetGarment.id
    );
    return fallbackGarmentMatch !== -1 ? fallbackGarmentMatch : 0;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    findItemIndex(garment, initialIndex)
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const carouselScrollRef = useRef<HTMLDivElement | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Ref-based callback to avoid infinite loops from function reference changes
  const onGarmentChangeRef = useRef(onGarmentChange);
  useEffect(() => {
    onGarmentChangeRef.current = onGarmentChange;
  }, [onGarmentChange]);

  // Sync index only when garment.id or initialIndex externally changes
  const lastGarmentIdRef = useRef(garment.id);
  const lastInitialIndexRef = useRef(initialIndex);
  useEffect(() => {
    if (lastGarmentIdRef.current !== garment.id || lastInitialIndexRef.current !== initialIndex) {
      lastGarmentIdRef.current = garment.id;
      lastInitialIndexRef.current = initialIndex;
      const idx = findItemIndex(garment, initialIndex);
      setCurrentIndex(idx);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [garment.id, initialIndex]);

  // Dedicated user-driven selection function (never called unconditionally on mount)
  const selectItem = (index: number) => {
    if (!items.length || index < 0 || index >= items.length) return;
    setCurrentIndex(index);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });

    const targetItem = items[index];
    if (targetItem && onGarmentChangeRef.current) {
      onGarmentChangeRef.current(targetItem.garment, targetItem.imageIndexInGarment);
    }
  };

  // Auto-scroll carousel so the active thumbnail is centered
  useEffect(() => {
    const activeThumb = thumbnailRefs.current[currentIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  const activeItem = items[currentIndex] || items[0];

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
    if (items.length <= 1) return;
    const nextIdx = (currentIndex + 1) % items.length;
    selectItem(nextIdx);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (items.length <= 1) return;
    const prevIdx = (currentIndex - 1 + items.length) % items.length;
    selectItem(prevIdx);
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
  }, [items.length, onClose]);

  if (typeof document === 'undefined' || !activeItem) return null;

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
        {/* Left: Garment Identifier & Sector Context */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 max-w-[65vw]">
          <span className={`w-2 h-2 animate-pulse shrink-0 ${isLight ? 'bg-black' : 'bg-white'}`} />
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 truncate">
            <span
              className={`font-mono text-[9px] sm:text-xs font-bold uppercase tracking-widest whitespace-nowrap ${
                isLight ? 'text-black' : 'text-white'
              }`}
            >
              {isES
                ? `GALERÍA HD // ${activeItem.garment.refCode} // VISTA ${(activeItem.imageIndexInGarment + 1).toString().padStart(2, '0')}/${activeItem.totalImagesInGarment.toString().padStart(2, '0')}`
                : `HD GALLERY // ${activeItem.garment.refCode} // VIEW ${(activeItem.imageIndexInGarment + 1).toString().padStart(2, '0')}/${activeItem.totalImagesInGarment.toString().padStart(2, '0')}`}
            </span>

            <span
              className={`hidden md:inline font-mono text-[9px] border px-1.5 py-0.5 uppercase truncate max-w-[200px] ${
                isLight ? 'text-black border-black/40 bg-black/5' : 'text-white/80 border-white/30 bg-white/5'
              }`}
            >
              {activeItem.garment.name}
            </span>

            {sectorTitle && (
              <span
                className={`hidden lg:inline font-mono text-[8.5px] border px-1.5 py-0.5 uppercase tracking-wider ${
                  isLight ? 'text-black/60 border-black/20' : 'text-white/60 border-white/20'
                }`}
              >
                {sectorTitle.replace(/^[0-9]+ /, '')}
              </span>
            )}
          </div>
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
        {items.length > 1 && (
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
            src={activeItem.imageUrl}
            alt={`${activeItem.garment.name} - View ${activeItem.imageIndexInGarment + 1}`}
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
        className={`relative z-[120] w-full border-t px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 ${
          isLight
            ? 'bg-white/95 border-black shadow-[0_-4px_20px_rgba(0,0,0,0.1)] text-black'
            : 'bg-black/95 border-white/30 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carousel on Lower-Left corner displaying all images in the sector */}
        <div
          ref={carouselScrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 max-w-[80vw] sm:max-w-[70vw] md:max-w-[75vw]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, idx) => {
            const isActive = currentIndex === idx;
            const prevItem = idx > 0 ? items[idx - 1] : null;
            const isNewGarment = prevItem && prevItem.garment.id !== item.garment.id;

            return (
              <React.Fragment key={item.id}>
                {isNewGarment && (
                  <div
                    className={`h-8 w-px mx-0.5 shrink-0 opacity-40 ${
                      isLight ? 'bg-black' : 'bg-white'
                    }`}
                  />
                )}
                <button
                  ref={(el) => {
                    thumbnailRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => {
                    selectItem(idx);
                  }}
                  title={`${item.garment.refCode} - ${item.garment.name} (${item.imageIndexInGarment + 1}/${item.totalImagesInGarment})`}
                  className={`cursor-target cursor-crosshair pulse-tactile relative w-12 h-12 sm:w-14 sm:h-14 border transition-all shrink-0 overflow-hidden ${
                    isActive
                      ? isLight
                        ? 'border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.9)] scale-105 bg-white'
                        : 'border-2 border-white shadow-[0_0_14px_#ffffff] scale-105 bg-black/80'
                      : isLight
                      ? 'border border-black/30 hover:border-black opacity-70 hover:opacity-100 bg-neutral-100'
                      : 'border border-white/30 hover:border-white opacity-60 hover:opacity-100 bg-black/80'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={`${item.garment.name} - View ${item.imageIndexInGarment + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/85 text-[7px] font-mono text-white px-1 flex items-center justify-between pointer-events-none leading-tight">
                    <span className="truncate max-w-[32px]">{item.garment.refCode}</span>
                    <span>{(item.imageIndexInGarment + 1).toString().padStart(2, '0')}</span>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Global sector image counter */}
        <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider shrink-0 whitespace-nowrap hidden sm:block pl-2">
          <span className={`font-bold ${isLight ? 'text-black' : 'text-white'}`}>
            [ {(currentIndex + 1).toString().padStart(2, '0')} / {items.length.toString().padStart(2, '0')} {isES ? 'FOTOS SECTOR' : 'SECTOR PHOTOS'} ]
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
