import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, X, Maximize2, Download, FileText, ChevronDown, ChevronUp, Layers, Compass, CheckCircle2, ZoomIn, ZoomOut } from 'lucide-react';
import { IndustryGarment } from '../types';
import { useLanguage } from '../context/LanguageContext';
import StarBorder from './StarBorder';

interface IndustryBentoGalleryProps {
  garments: IndustryGarment[];
  availableFilterTags?: string[];
  projectTitle: string;
}

export default function IndustryBentoGallery({
  garments,
  availableFilterTags,
  projectTitle,
}: IndustryBentoGalleryProps) {
  const { language } = useLanguage();
  const isES = language === 'es';

  // Determine all available unique tags from garments or provided filter tags
  const tagsList = useMemo(() => {
    if (availableFilterTags && availableFilterTags.length > 0) {
      return availableFilterTags;
    }
    const set = new Set<string>();
    garments.forEach((g) => g.tags.forEach((t) => set.add(t.toUpperCase())));
    return ['TODOS', ...Array.from(set)];
  }, [availableFilterTags, garments]);

  const [activeTag, setActiveTag] = useState<string>('TODOS');
  const [selectedGarment, setSelectedGarment] = useState<IndustryGarment | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [expandedTechSheetId, setExpandedTechSheetId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Reset zoom when switching inspected garment
  useEffect(() => {
    setIsZoomed(false);
  }, [selectedGarment?.id]);

  // Filter garments based on active tag
  const filteredGarments = useMemo(() => {
    if (!activeTag || activeTag === 'TODOS' || activeTag === 'ALL') {
      return garments;
    }
    return garments.filter((g) =>
      g.tags.some((t) => t.toUpperCase() === activeTag.toUpperCase())
    );
  }, [garments, activeTag]);

  // Compute count for each tag
  const getTagCount = (tag: string) => {
    if (tag === 'TODOS' || tag === 'ALL') return garments.length;
    return garments.filter((g) =>
      g.tags.some((t) => t.toUpperCase() === tag.toUpperCase())
    ).length;
  };

  // 1. INTELLIGENT BENTO PACKING & BALANCED DISTRIBUTION ENGINE
  // Eliminates remaining white space and ensures images dynamically fill the grid container
  const bentoColumns = useMemo(() => {
    const total = filteredGarments.length;
    if (total === 0) return [];

    // Case 1: 1 garment -> 1 full-bleed hero column (fills 100% container width & height)
    if (total === 1) {
      return [
        {
          id: `col-${filteredGarments[0].id}`,
          isFullHeight: true,
          widthClass: 'flex-1 min-w-[300px] w-full',
          items: [filteredGarments[0]],
        },
      ];
    }

    // Case 2: 2 garments -> 2 balanced full-height columns (fills 50% width each, 100% height)
    if (total === 2) {
      return filteredGarments.map((g) => ({
        id: `col-${g.id}`,
        isFullHeight: true,
        widthClass: 'flex-1 min-w-[280px]',
        items: [g],
      }));
    }

    // Case 3: 3 garments (e.g. CORTO) -> 3 balanced full-height columns (fills 33.3% width each, 100% height)
    // No lopsided gaps, perfectly balanced across the entire container width!
    if (total === 3) {
      return filteredGarments.map((g) => ({
        id: `col-${g.id}`,
        isFullHeight: true,
        widthClass: 'flex-1 min-w-[260px] md:min-w-[300px]',
        items: [g],
      }));
    }

    // Case 4: 4 garments -> 2 balanced 2-row stacks (both columns expand with flex-1 to fill 100% container)
    if (total === 4) {
      return [
        {
          id: `col-${filteredGarments[0].id}-${filteredGarments[1].id}`,
          isFullHeight: false,
          widthClass: 'flex-1 min-w-[280px]',
          items: [filteredGarments[0], filteredGarments[1]],
        },
        {
          id: `col-${filteredGarments[2].id}-${filteredGarments[3].id}`,
          isFullHeight: false,
          widthClass: 'flex-1 min-w-[280px]',
          items: [filteredGarments[2], filteredGarments[3]],
        },
      ];
    }

    // Case 5: 5+ garments -> Balanced Masonry packing with smart 2-row stacking
    const cols: {
      id: string;
      isFullHeight: boolean;
      widthClass: string;
      items: IndustryGarment[];
    }[] = [];

    let i = 0;
    while (i < total) {
      const current = filteredGarments[i];
      const isTall = current.bentoSpan === 'tall';
      const isLarge = current.bentoSpan === 'large';

      if (isLarge) {
        // Hero Large Column: 1 item, full height
        cols.push({
          id: `col-${current.id}`,
          isFullHeight: true,
          widthClass: 'w-[360px] sm:w-[440px] md:w-[480px]',
          items: [current],
        });
        i += 1;
      } else if (isTall) {
        // Tall Single Column: 1 item, full height
        cols.push({
          id: `col-${current.id}`,
          isFullHeight: true,
          widthClass: 'w-[280px] sm:w-[320px] md:w-[350px]',
          items: [current],
        });
        i += 1;
      } else {
        // Non-tall item: pair with next non-tall item for a split stack
        const next = filteredGarments[i + 1];
        if (next && next.bentoSpan !== 'tall' && next.bentoSpan !== 'large') {
          const hasWide = current.bentoSpan === 'wide' || next.bentoSpan === 'wide';
          cols.push({
            id: `col-${current.id}-${next.id}`,
            isFullHeight: false,
            widthClass: hasWide
              ? 'w-[340px] sm:w-[390px] md:w-[430px]'
              : 'w-[280px] sm:w-[320px] md:w-[350px]',
            items: [current, next],
          });
          i += 2;
        } else {
          // Single remaining item: spans full height gracefully (zero holes)
          cols.push({
            id: `col-${current.id}`,
            isFullHeight: true,
            widthClass: current.bentoSpan === 'wide'
              ? 'w-[340px] sm:w-[390px] md:w-[430px]'
              : 'w-[280px] sm:w-[320px] md:w-[350px]',
            items: [current],
          });
          i += 1;
        }
      }
    }

    // If total columns generated are <= 4, let them flex to fill the full container dynamically
    if (cols.length <= 4) {
      return cols.map((c) => ({
        ...c,
        widthClass: `${c.widthClass} flex-1`,
      }));
    }

    return cols;
  }, [filteredGarments]);

  // 2. ULTRA-SMOOTH INERTIA POINTER DRAG ENGINE & OVERFLOW DETECTION
  const [isDragging, setIsDragging] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const isPointerDown = useRef(false);
  const hasMoved = useRef(false);
  const lastClientX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const momentumRafRef = useRef<number | null>(null);

  // Measure if container overflows and requires scroll / drag
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const checkScroll = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 4;
      setCanScroll(hasOverflow);
    };

    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    window.addEventListener('resize', checkScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [bentoColumns, filteredGarments.length]);

  const stopMomentum = () => {
    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canScroll || e.button !== 0 || !scrollContainerRef.current) return;
    stopMomentum();
    const container = scrollContainerRef.current;

    isPointerDown.current = true;
    hasMoved.current = false;
    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = container.scrollLeft;
    lastClientX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const dx = e.clientX - dragStartX.current;

    // Only engage drag and capture pointer if user moved more than 8px
    if (Math.abs(dx) > 8) {
      if (!hasMoved.current) {
        hasMoved.current = true;
        setIsDragging(true);
        try {
          container.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      const now = performance.now();
      const dt = Math.max(1, now - lastTime.current);
      const instantDx = e.clientX - lastClientX.current;

      // Smooth velocity in px/ms
      velocity.current = instantDx / dt;
      lastClientX.current = e.clientX;
      lastTime.current = now;

      container.scrollLeft = dragStartScrollLeft.current - dx;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    const container = scrollContainerRef.current;

    try {
      if (container && container.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    if (hasMoved.current) {
      // Apply momentum gliding friction decay if released with speed
      let v = velocity.current * 16; // pixels per frame at 60fps
      if (Math.abs(v) > 2) {
        const step = () => {
          if (!scrollContainerRef.current) return;
          scrollContainerRef.current.scrollLeft -= v;
          v *= 0.92; // smooth decay
          if (Math.abs(v) > 0.5) {
            momentumRafRef.current = requestAnimationFrame(step);
          } else {
            setIsDragging(false);
            setTimeout(() => {
              hasMoved.current = false;
            }, 60);
          }
        };
        momentumRafRef.current = requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          setIsDragging(false);
          hasMoved.current = false;
        }, 60);
      }
    } else {
      setIsDragging(false);
      hasMoved.current = false;
    }
  };

  const handlePointerCancel = () => {
    isPointerDown.current = false;
    setIsDragging(false);
    hasMoved.current = false;
    stopMomentum();
  };

  // Garment click: open inspection modal
  const handleGarmentClick = (garment: IndustryGarment) => {
    if (hasMoved.current || isDragging) return;
    setSelectedGarment(garment);
  };

  // Navigation helpers within the inspection lightbox
  const currentGarmentIndex = useMemo(() => {
    if (!selectedGarment) return -1;
    return filteredGarments.findIndex((g) => g.id === selectedGarment.id);
  }, [selectedGarment, filteredGarments]);

  const goToPrevGarment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentGarmentIndex > 0) {
      setSelectedGarment(filteredGarments[currentGarmentIndex - 1]);
    } else if (filteredGarments.length > 0) {
      setSelectedGarment(filteredGarments[filteredGarments.length - 1]);
    }
  };

  const goToNextGarment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentGarmentIndex < filteredGarments.length - 1) {
      setSelectedGarment(filteredGarments[currentGarmentIndex + 1]);
    } else if (filteredGarments.length > 0) {
      setSelectedGarment(filteredGarments[0]);
    }
  };

  // Horizontal scroll buttons
  const scroll = (direction: 'left' | 'right') => {
    stopMomentum();
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(window.innerWidth * 0.7, 500);
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Trigger technical spec sheet download
  const handleDownloadTechSheet = (garment: IndustryGarment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!garment.techSheet) return;

    const ts = garment.techSheet;
    const content = `========================================================================
SYS.VOID // SPECIFICATION DOSSIER & TECHNICAL PACK
========================================================================
REF. CODE:      ${garment.refCode}
ITEM NAME:      ${garment.name}
CATEGORY:       ${garment.category.toUpperCase()}
SEASON:         ${ts.season}
FABRIC CODE:    ${ts.fabricCode}
WEIGHT:         ${ts.weight}
COMPOSITION:    ${ts.composition}
TREATMENT:      ${ts.treatment}
SILHOUETTE:     ${garment.silhouette || 'Ergonomic 3D structural cut'}
DETAILS:        ${garment.details || 'Industrial grade reinforced seam construction'}
------------------------------------------------------------------------
TECHNICAL SPECIFICATIONS & PHYSICAL TESTING:
------------------------------------------------------------------------
${ts.specs.map((s) => `• ${s.label.padEnd(25, ' ')}: ${s.value}`).join('\n')}
========================================================================
COORDINATES:    [SYS.VOID // CAD SECTOR INDUSTRY]
GENERATION:     ${new Date().toISOString()} // VERIFIED SPEC
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = ts.downloadFileName || `${garment.refCode}_TECH_SPEC.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessId(garment.id);
    setTimeout(() => {
      setDownloadSuccessId((prev) => (prev === garment.id ? null : prev));
    }, 2500);
  };

  // Toggle inline tech sheet dropdown
  const toggleTechSheet = (garmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTechSheetId((prev) => (prev === garmentId ? null : garmentId));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedGarment) return;
      if (e.key === 'Escape') {
        setSelectedGarment(null);
      } else if (e.key === 'ArrowRight') {
        const idx = filteredGarments.findIndex((g) => g.id === selectedGarment.id);
        if (idx !== -1 && idx < filteredGarments.length - 1) {
          setSelectedGarment(filteredGarments[idx + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = filteredGarments.findIndex((g) => g.id === selectedGarment.id);
        if (idx > 0) {
          setSelectedGarment(filteredGarments[idx - 1]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopMomentum();
    };
  }, [selectedGarment, filteredGarments]);

  // Dedicated physics-smoothed scroll engine with seamless vertical-horizontal-vertical transition
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let targetScrollLeft = el.scrollLeft;
    let animFrameId: number | null = null;

    const getParentVertical = (element: HTMLElement): HTMLElement | null => {
      let curr = element.parentElement;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        const style = window.getComputedStyle(curr);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && curr.scrollHeight > curr.clientHeight) {
          return curr;
        }
        curr = curr.parentElement;
      }
      return null;
    };

    const smoothLerpHorizontal = () => {
      const diff = targetScrollLeft - el.scrollLeft;
      if (Math.abs(diff) > 0.4) {
        el.scrollLeft += diff * 0.2; // Smooth 60fps spring lerp
        animFrameId = requestAnimationFrame(smoothLerpHorizontal);
      } else {
        el.scrollLeft = targetScrollLeft;
        animFrameId = null;
      }
    };

    const handleNativeWheel = (e: WheelEvent) => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 2) return;

      const parentVertical = getParentVertical(el) || (el.closest('.overflow-y-auto') as HTMLElement) || null;

      // 1. Two-finger horizontal swipe on trackpad (deltaX)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
        e.preventDefault();
        stopMomentum();
        const currentPos = animFrameId ? targetScrollLeft : el.scrollLeft;
        targetScrollLeft = Math.max(0, Math.min(maxScrollLeft, currentPos + e.deltaX));
        if (!animFrameId) {
          animFrameId = requestAnimationFrame(smoothLerpHorizontal);
        }
        return;
      }

      const deltaY = e.deltaY;
      if (deltaY === 0) return;

      // 2. Wheel UP ("cuando vuelvas arriba vuelva a ser vertical")
      if (deltaY < 0) {
        // Smoothly scroll the parent container UP towards the top of the project
        if (parentVertical) {
          parentVertical.scrollBy({ top: deltaY, behavior: 'smooth' });
          e.preventDefault();
        } else {
          window.scrollBy({ top: deltaY, behavior: 'smooth' });
          e.preventDefault();
        }
        return;
      }

      // 3. Wheel DOWN ("cuando bajes hasta aqui con el scroll se haga el horizontal")
      const currentPos = animFrameId ? targetScrollLeft : el.scrollLeft;
      const roomForward = Math.max(0, maxScrollLeft - currentPos);

      if (roomForward > 1) {
        // Bento still has cards to reveal: advance smoothly in horizontal
        e.preventDefault();
        stopMomentum();

        if (deltaY <= roomForward) {
          targetScrollLeft = Math.min(maxScrollLeft, currentPos + deltaY);
        } else {
          // Reached the end of horizontal items: gently hand off remainder to vertical scroll down
          targetScrollLeft = maxScrollLeft;
          const overflow = (deltaY - roomForward) * 0.7;
          if (parentVertical) {
            parentVertical.scrollBy({ top: overflow, behavior: 'smooth' });
          } else {
            window.scrollBy({ top: overflow, behavior: 'smooth' });
          }
        }

        if (!animFrameId) {
          animFrameId = requestAnimationFrame(smoothLerpHorizontal);
        }
      } else {
        // At the far right end: smoothly continue scrolling vertically down
        if (parentVertical) {
          parentVertical.scrollBy({ top: deltaY, behavior: 'smooth' });
          e.preventDefault();
        } else {
          window.scrollBy({ top: deltaY, behavior: 'smooth' });
          e.preventDefault();
        }
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [bentoColumns, filteredGarments.length, stopMomentum]);

  // Staggered entrance animation for industry bento items on filter switch using GSAP
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollLeft = 0;

    const cols = el.querySelectorAll('.industry-bento-col');
    if (!cols || cols.length === 0) return;

    gsap.killTweensOf(cols);

    const eachTime = Math.min(0.045, 0.4 / Math.max(1, cols.length));

    gsap.fromTo(
      cols,
      {
        opacity: 0,
        y: 28,
        scale: 0.94,
        filter: 'blur(8px)',
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.55,
        ease: 'power3.out',
        stagger: {
          each: eachTime,
          from: 'start',
        },
        clearProps: 'transform,opacity,filter',
      }
    );
  }, [activeTag]);

  // Card component renderer for single garments
  const renderCard = (garment: IndustryGarment, isFullHeight: boolean) => {
    const hasTechSheet = !!garment.techSheet;
    const isTechSheetOpen = expandedTechSheetId === garment.id;
    const isDownloaded = downloadSuccessId === garment.id;
    const hasError = imageErrors[garment.id];

    return (
      <div
        key={garment.id}
        onClick={() => handleGarmentClick(garment)}
        className={`w-full ${
          isFullHeight ? 'h-full' : 'flex-1 min-h-0'
        } group relative border border-white/40 hover:border-[#c4ffff] bg-black/85 hover:bg-black/95 transition-all duration-300 flex flex-col overflow-hidden shadow-[4px_4px_0px_rgba(255,255,255,0.05)] hover:shadow-[0_0_22px_rgba(196,255,255,0.25)] select-none`}
      >
        {/* Top Header / Ref Tag */}
        <div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-white/20 bg-black/90 text-xs sm:text-sm tracking-widest text-white/80 shrink-0 font-bold">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse shrink-0"></span>
            <span className="text-[#c4ffff] font-bold">{garment.refCode}</span>
          </div>
          <div className="text-white/60 tracking-wider text-[10px] sm:text-xs uppercase font-mono">
            {isFullHeight ? 'LOOKBOOK // FULL' : 'DETAIL // STACK'}
          </div>
        </div>

        {/* Garment Image Frame */}
        <div className="w-full flex-1 relative overflow-hidden bg-neutral-950 min-h-0 select-none">
          {!hasError ? (
            <img
              src={garment.image}
              alt={garment.name}
              draggable={false}
              referrerPolicy="no-referrer"
              onError={() => setImageErrors((prev) => ({ ...prev, [garment.id]: true }))}
              className="w-full h-full object-cover grayscale opacity-75 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out pointer-events-none select-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-neutral-900 to-black text-white/60 text-center">
              <Layers size={28} className="text-[#c4ffff] opacity-60 mb-2" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">
                {garment.refCode} // CAD.SPEC
              </span>
            </div>
          )}

          {/* Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent opacity-80 group-hover:opacity-50 transition-opacity pointer-events-none" />
        </div>

        {/* Garment Details & Actions (No repeated info or duplicate buttons) */}
        <div className="p-2.5 sm:p-3 bg-black/90 flex flex-col justify-between gap-1.5 shrink-0 border-t border-white/10 z-10">
          <div className="flex flex-col">
            <h3 className="text-white text-sm sm:text-base font-bold uppercase tracking-wider line-clamp-1 group-hover:text-[#c4ffff] transition-colors">
              {isES && garment.nameEs ? garment.nameEs : garment.name}
            </h3>
            {garment.material && (
              <p className="text-white/70 text-xs sm:text-[13px] truncate mt-0.5 font-mono">
                {garment.material}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
            {/* Non-repeating category / silhouette badge */}
            <div className="text-white/60 text-xs uppercase tracking-wider truncate font-mono">
              {garment.silhouette ? (
                <span className="truncate">{garment.silhouette}</span>
              ) : (
                <span className="text-white/40">{garment.category}</span>
              )}
            </div>

            {/* Responsive info button and tech sheet button */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGarment(garment);
                }}
                className="cursor-target px-2 sm:px-2.5 py-1 border border-[#c4ffff]/80 hover:border-[#c4ffff] text-[#c4ffff] hover:bg-[#c4ffff] hover:text-black transition-colors uppercase text-[10px] sm:text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0"
                title={isES ? 'Ver información' : 'View info'}
              >
                <Maximize2 size={11} className="shrink-0" />
                <span className="whitespace-nowrap">INFO</span>
              </button>

              {hasTechSheet && (
                <button
                  type="button"
                  onClick={(e) => toggleTechSheet(garment.id, e)}
                  className={`cursor-target px-1.5 sm:px-2 py-1 border transition-all uppercase text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${
                    isTechSheetOpen
                      ? 'bg-[#c4ffff] text-black border-[#c4ffff]'
                      : 'border-white/40 hover:border-[#c4ffff] text-white hover:text-[#c4ffff] bg-black/60'
                  }`}
                  title={isES ? 'Ficha técnica' : 'Technical sheet'}
                >
                  <FileText size={11} className="shrink-0" />
                  <span className="whitespace-nowrap">
                    {isTechSheetOpen
                      ? (isES ? 'CERRAR' : 'CLOSE')
                      : isFullHeight
                      ? (isES ? 'FICHA TÉCNICA' : 'TECH SHEET')
                      : (isES ? 'FICHA' : 'TECH')}
                  </span>
                  {isTechSheetOpen ? <ChevronUp size={11} className="shrink-0" /> : <ChevronDown size={11} className="shrink-0" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inline Expandable Tech Sheet Drawer */}
        {isTechSheetOpen && garment.techSheet && (
          <div
            className="absolute inset-x-0 bottom-0 top-[35px] bg-black/95 z-30 p-3 sm:p-4 border-t-2 border-[#c4ffff] flex flex-col justify-between overflow-y-auto animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/20">
                <span className="text-[#c4ffff] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <FileText size={11} />
                  {isES ? 'FICHA TÉCNICA INDUSTRIAL' : 'TECHNICAL SPEC SHEET'}
                </span>
                <button
                  onClick={(e) => toggleTechSheet(garment.id, e)}
                  className="text-white/60 hover:text-white p-0.5"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="text-[8px] sm:text-[9px] text-white/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/50 uppercase">TEJIDO:</span>
                  <span className="text-[#c4ffff] font-bold">{garment.techSheet.fabricCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 uppercase">GRAMAJE:</span>
                  <span>{garment.techSheet.weight}</span>
                </div>
                <div className="text-[8px] text-white/60 pt-1 border-t border-white/10">
                  {garment.techSheet.composition}
                </div>
              </div>

              <div className="bg-white/5 p-1.5 border border-white/10 space-y-1 text-[8px]">
                {garment.techSheet.specs.slice(0, 3).map((s, sIdx) => (
                  <div key={sIdx} className="flex justify-between gap-1">
                    <span className="text-white/50 truncate">{s.label}:</span>
                    <span className="text-white font-medium truncate">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={(e) => handleDownloadTechSheet(garment, e)}
                className="w-full py-1.5 bg-[#c4ffff] hover:bg-white text-black font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(196,255,255,0.4)]"
              >
                {isDownloaded ? (
                  <>
                    <CheckCircle2 size={12} className="text-black" />
                    <span>{isES ? 'FICHA DESCARGADA' : 'SPEC DOWNLOADED'}</span>
                  </>
                ) : (
                  <>
                    <Download size={12} />
                    <span>{isES ? 'DESCARGAR FICHA TÉCNICA' : 'DOWNLOAD TECH PACK'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Hover accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-[#c4ffff] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 font-mono select-none">
      {/* 1. TERMINAL CHIP-BASED FILTER SUBMENU */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-y border-white/20 py-3 bg-black/60 px-2 sm:px-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 bg-[#c4ffff] animate-ping shrink-0" />
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#c4ffff] font-bold">
            SYS.FILTER // [SELECT_TAG]:
          </span>
        </div>

        {/* Horizontal Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {tagsList.map((tag) => {
            const isAll = tag === 'TODOS' || tag === 'ALL';
            const isActive = activeTag === tag || (isAll && (activeTag === 'TODOS' || activeTag === 'ALL'));
            const count = getTagCount(tag);

            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`font-mono text-[9px] sm:text-[10px] md:text-xs uppercase px-3 py-1.5 transition-all duration-200 cursor-crosshair whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-black font-extrabold border-2 border-[#c4ffff] shadow-[0_0_15px_rgba(196,255,255,0.8),inset_0_0_4px_rgba(0,0,0,0.3)] tracking-wider scale-[1.02]'
                    : 'bg-black/80 text-white/70 border border-white/30 hover:border-white hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={isActive ? 'text-black font-bold' : 'text-[#c4ffff] opacity-70'}>
                  {isActive ? '▪' : '>'}
                </span>
                <span>{tag}</span>
                <span className={`text-[8px] sm:text-[9px] px-1 py-0.2 ${isActive ? 'bg-black text-white font-bold' : 'text-white/50'}`}>
                  [{count}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Horizontal Navigation Buttons (Shown only when content overflows) */}
        {canScroll && (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll('left')}
              title={isES ? 'Desplazar izquierda' : 'Scroll left'}
              className="p-1.5 border border-white/40 hover:border-[#c4ffff] text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-crosshair"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              title={isES ? 'Desplazar derecha' : 'Scroll right'}
              className="p-1.5 border border-white/40 hover:border-[#c4ffff] text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-crosshair"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 2. GAPLESS HORIZONTAL BENTO GRID (Zero blank holes + dynamic container filling) */}
      <div className="relative w-full overflow-hidden">
        {/* Subtle Edge Scrims (Shown only when scrolling is active) */}
        {canScroll && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/90 to-transparent z-10 hidden sm:block" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/90 to-transparent z-10 hidden sm:block" />
          </>
        )}

        <div
          ref={scrollContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`flex flex-row items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-hide py-2 px-1 h-[530px] sm:h-[570px] md:h-[610px] ${
            !canScroll
              ? 'w-full'
              : isDragging
              ? 'cursor-grabbing select-none touch-none'
              : 'cursor-grab active:cursor-grabbing touch-pan-x'
          }`}
          style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bentoColumns.map((col) => {
            return (
              <div
                key={col.id}
                className={`industry-bento-col ${col.widthClass} ${canScroll ? 'shrink-0' : 'flex-1'} h-full flex flex-col gap-3 sm:gap-4`}
              >
                {col.items.map((item) => renderCard(item, col.isFullHeight))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SCROLL NAVIGATION HINT & STATUS */}
      <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-white/50 px-1 pt-1 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <Compass size={11} className="text-[#c4ffff]" />
          <span>
            {isES
              ? `BENTO GRID // ${filteredGarments.length} PRENDAS EN ${projectTitle}`
              : `BENTO GRID // ${filteredGarments.length} PIECES IN ${projectTitle}`}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 uppercase tracking-widest text-[#c4ffff]">
          {canScroll ? (
            <span>{isES ? '↔ ARRASTRAR O SCROLL HORIZONTAL ↔' : '↔ CLICK & DRAG TO SCROLL ↔'}</span>
          ) : (
            <span className="text-white/60">
              {isES ? '✓ DISTRIBUCIÓN COMPLETA // 100% DINÁMICO' : '✓ BALANCED CONTAINER // 100% DYNAMIC'}
            </span>
          )}
        </div>
      </div>

      {/* 4. FULLSCREEN GARMENT INSPECTION LIGHTBOX (PORTALED TO ROOT BODY) */}
      {selectedGarment &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 md:p-6"
            onClick={() => setSelectedGarment(null)}
          >
            {/* Background cyber scanlines */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2ZmMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-15 pointer-events-none" />

            {/* Left Prev Arrow Button */}
            {filteredGarments.length > 1 && (
              <div className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-[100000]">
                <button
                  type="button"
                  onClick={goToPrevGarment}
                  title={isES ? 'Prenda anterior (←)' : 'Previous garment (←)'}
                  className="cursor-target p-2.5 sm:p-3.5 bg-black/90 hover:bg-[#c4ffff] text-white hover:text-black border border-white/50 hover:border-[#c4ffff] transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <ChevronLeft size={26} className="sm:w-8 sm:h-8" />
                </button>
              </div>
            )}

            {/* Right Next Arrow Button */}
            {filteredGarments.length > 1 && (
              <div className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100000]">
                <button
                  type="button"
                  onClick={goToNextGarment}
                  title={isES ? 'Siguiente prenda (→)' : 'Next garment (→)'}
                  className="cursor-target p-2.5 sm:p-3.5 bg-black/90 hover:bg-[#c4ffff] text-white hover:text-black border border-white/50 hover:border-[#c4ffff] transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <ChevronRight size={26} className="sm:w-8 sm:h-8" />
                </button>
              </div>
            )}

            {/* Main Inspection Modal Dialog */}
            <div
              className="relative w-full max-w-4xl bg-black border-2 border-white/60 p-5 sm:p-7 md:p-9 flex flex-col md:flex-row gap-6 sm:gap-8 shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto scrollbar-hide z-[100001]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-3 h-3 border-b-2 border-l-2 border-[#c4ffff] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-[#c4ffff] pointer-events-none" />

              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setSelectedGarment(null)}
                className="cursor-target absolute top-3.5 right-3.5 p-2 text-white/70 hover:text-black hover:bg-[#c4ffff] border border-white/30 hover:border-[#c4ffff] transition-colors bg-black/80 z-20"
                title={isES ? 'Cerrar (ESC)' : 'Close (ESC)'}
              >
                <X size={20} />
              </button>

              {/* Left Column: Image with Zoom Toggle */}
              <div className="w-full md:w-1/2 flex flex-col gap-2.5">
                <div
                  className={`w-full aspect-[3/4] relative bg-neutral-950 border border-white/30 overflow-hidden flex items-center justify-center cursor-target ${
                    isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  {!imageErrors[selectedGarment.id] ? (
                    <img
                      src={selectedGarment.image}
                      alt={selectedGarment.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-transform duration-300 ease-out select-none ${
                        isZoomed ? 'scale-150 object-center' : 'scale-100'
                      }`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-white/60">
                      <Layers size={40} className="text-[#c4ffff] mb-3" />
                      <span className="text-xs uppercase font-bold text-white">
                        {selectedGarment.refCode} // CAD BLUEPRINT
                      </span>
                    </div>
                  )}

                  {/* Zoom Badge Indicator */}
                  <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/85 border border-white/40 text-white px-2.5 py-1 text-xs font-mono flex items-center gap-1.5 pointer-events-none">
                    {isZoomed ? <ZoomOut size={12} /> : <ZoomIn size={12} />}
                    <span>{isZoomed ? (isES ? 'ALEJAR' : 'ZOOM OUT') : (isES ? 'AMPLIAR' : 'ZOOM IN')}</span>
                  </div>
                </div>

                {/* Sub-label under photo */}
                <div className="flex items-center justify-between text-xs font-mono text-white/60 px-1 pt-0.5">
                  <span className="font-bold">REF: {selectedGarment.refCode}</span>
                  {currentGarmentIndex !== -1 && (
                    <span className="text-[#c4ffff] font-bold">
                      [ {String(currentGarmentIndex + 1).padStart(2, '0')} / {String(filteredGarments.length).padStart(2, '0')} ]
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Specification Dossier */}
              <div className="w-full md:w-1/2 flex flex-col justify-between gap-5 font-mono">
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-2 text-[#c4ffff] text-xs sm:text-sm tracking-widest uppercase font-bold">
                    <span className="w-2 h-2 bg-[#c4ffff] animate-pulse"></span>
                    <span>{selectedGarment.refCode}</span>
                    <span>·</span>
                    <span>{selectedGarment.category.toUpperCase()}</span>
                  </div>

                  <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wider leading-snug">
                    {isES && selectedGarment.nameEs ? selectedGarment.nameEs : selectedGarment.name}
                  </h2>

                  {selectedGarment.silhouette && (
                    <div className="p-3 bg-white/5 border-l-2 border-[#c4ffff] text-white/95 text-sm sm:text-base leading-relaxed">
                      <span className="block text-[10px] sm:text-xs text-[#c4ffff] uppercase tracking-widest mb-1 font-bold">
                        {isES ? 'SILUETA Y CONSTRUCCIÓN' : 'SILHOUETTE & DRAPE'}
                      </span>
                      {selectedGarment.silhouette}
                    </div>
                  )}

                  {selectedGarment.material && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest font-bold">
                        {isES ? 'COMPOSICIÓN TEXTIL' : 'TEXTILE COMPOSITION'}
                      </span>
                      <span className="text-white text-sm sm:text-base font-medium">{selectedGarment.material}</span>
                    </div>
                  )}

                  {selectedGarment.details && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest font-bold">
                        {isES ? 'ESPECIFICACIONES INDUSTRIALES' : 'INDUSTRIAL SPECIFICATIONS'}
                      </span>
                      <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                        {selectedGarment.details}
                      </p>
                    </div>
                  )}

                  {selectedGarment.techSheet && (
                    <div className="mt-2 p-3.5 border border-[#c4ffff]/60 bg-black/70 space-y-2.5">
                      <div className="flex items-center justify-between text-[#c4ffff] text-xs sm:text-sm font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <FileText size={14} />
                          {isES ? 'FICHA TÉCNICA OFICIAL DISPONIBLE' : 'OFFICIAL TECH PACK AVAILABLE'}
                        </span>
                        <span className="text-white/80">{selectedGarment.techSheet.sheetId}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-white/80 pt-1.5 border-t border-white/10">
                        <div>
                          <span className="text-white/40 block text-[10px] sm:text-xs">FABRIC:</span>
                          <span className="font-bold">{selectedGarment.techSheet.fabricCode}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px] sm:text-xs">WEIGHT:</span>
                          <span className="font-bold">{selectedGarment.techSheet.weight}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDownloadTechSheet(selectedGarment, e)}
                        className="cursor-target w-full mt-2 py-2.5 bg-[#c4ffff] hover:bg-white text-black font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(196,255,255,0.4)]"
                      >
                        <Download size={15} />
                        <span>{isES ? 'DESCARGAR FICHA TÉCNICA COMPLETA (.TXT)' : 'DOWNLOAD FULL TECH PACK (.TXT)'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/50 font-mono uppercase">
                  <div className="flex items-center gap-2.5">
                    <span>{isES ? '[ESC] SALIR' : '[ESC] EXIT'}</span>
                    <span>·</span>
                    <span>{isES ? '[← →] NAVEGAR' : '[← →] NAVIGATE'}</span>
                  </div>
                  <span className="text-[#c4ffff] tracking-widest text-[11px]">
                    CAD // BLUEPRINT
                  </span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
