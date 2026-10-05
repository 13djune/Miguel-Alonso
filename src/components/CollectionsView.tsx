import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Project, IndustryGarment } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Download,
  FileText,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import StarBorder from './StarBorder';

interface CollectionsViewProps {
  projects: Project[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export default function CollectionsView({ projects, onClose, onSelectProject }: CollectionsViewProps) {
  const { t, language } = useLanguage();
  const isES = language === 'es';

  const creativeProjects = useMemo(() => projects.slice(0, 4), [projects]);
  const industryProjects = useMemo(() => projects.slice(4, 8), [projects]);

  // Sector filter: 'ALL' or index of industry project (0: Look-Book, 1: Pantalones, 2: Outerwear, 3: Accesorios)
  const [selectedSector, setSelectedSector] = useState<number | 'ALL'>('ALL');
  const [activeTag, setActiveTag] = useState<string>('TODOS');

  // Inspection modal state
  const [inspectedGarment, setInspectedGarment] = useState<IndustryGarment | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // All industry garments flattened
  const allIndustryGarments = useMemo(() => {
    const list: IndustryGarment[] = [];
    industryProjects.forEach((proj) => {
      if (proj.garments) {
        list.push(...proj.garments);
      }
    });
    return list;
  }, [industryProjects]);

  // Available tags based on currently selected sector
  const availableTags = useMemo(() => {
    const sourceGarments =
      selectedSector === 'ALL'
        ? allIndustryGarments
        : industryProjects[selectedSector]?.garments || [];

    const tagsSet = new Set<string>();
    sourceGarments.forEach((g) => {
      if (g.tags) {
        g.tags.forEach((tag) => tagsSet.add(tag.toUpperCase()));
      }
    });
    return ['TODOS', ...Array.from(tagsSet)];
  }, [selectedSector, industryProjects, allIndustryGarments]);

  // Filtered garments for the Bento Grid
  const displayedGarments = useMemo(() => {
    let list =
      selectedSector === 'ALL'
        ? allIndustryGarments
        : industryProjects[selectedSector]?.garments || [];

    if (activeTag && activeTag !== 'TODOS' && activeTag !== 'ALL') {
      const tagLower = activeTag.toLowerCase();
      list = list.filter((g) => g.tags?.some((t) => t.toLowerCase() === tagLower));
    }

    return list;
  }, [selectedSector, activeTag, allIndustryGarments, industryProjects]);

  // Reset tag when sector changes
  const handleSectorChange = (sector: number | 'ALL') => {
    setSelectedSector(sector);
    setActiveTag('TODOS');
  };

  // Bento grid container reference for GSAP animations
  const bentoGridRef = useRef<HTMLDivElement | null>(null);

  // Staggered entrance animation for Bento Grid items using GSAP whenever user switches filter categories
  useEffect(() => {
    const container = bentoGridRef.current;
    if (!container) return;

    // Reset scroll to start so user sees entrance ripple clearly
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }

    const items = container.querySelectorAll('.bento-grid-item');
    if (!items || items.length === 0) return;

    // Kill any active GSAP tweens on these items
    gsap.killTweensOf(items);

    // Stagger calculation: balanced across item count (max 0.45s total stagger)
    const eachTime = Math.min(0.045, 0.45 / Math.max(1, items.length));

    gsap.fromTo(
      items,
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
  }, [selectedSector, activeTag]);

  // =========================================================================
  // SMOOTH INERTIA-BASED DRAG-TO-SCROLL UTILITY
  // =========================================================================
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScroll, setCanScroll] = useState(true);
  const [isAtHorizontalEnd, setIsAtHorizontalEnd] = useState(false);
  const [isAtHorizontalStart, setIsAtHorizontalStart] = useState(true);

  const isPointerDown = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const hasMoved = useRef(false);
  const lastClientX = useRef(0);
  const lastClientY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const momentumRafRef = useRef<number | null>(null);
  const dragSamples = useRef<{ time: number; x: number; y: number }[]>([]);

  // Find scrollable vertical parent container
  const getParentVertical = useCallback((element: HTMLElement): HTMLElement | null => {
    let curr = element.parentElement;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      const style = window.getComputedStyle(curr);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && curr.scrollHeight > curr.clientHeight) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return null;
  }, []);

  const stopMomentum = useCallback(() => {
    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  }, []);

  // Shared scroll-controller: Detects scroll-end on horizontal overflow
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const checkHorizontalBoundaries = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 2) {
        setIsAtHorizontalEnd(true);
        setIsAtHorizontalStart(true);
        return;
      }
      const atEnd = el.scrollLeft >= maxScroll - 3;
      const atStart = el.scrollLeft <= 3;
      setIsAtHorizontalEnd(atEnd);
      setIsAtHorizontalStart(atStart);
    };

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      checkHorizontalBoundaries();
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        checkHorizontalBoundaries();
      }, 50);
    };

    const handleScrollEnd = () => {
      checkHorizontalBoundaries();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    el.addEventListener('scrollend', handleScrollEnd, { passive: true });
    checkHorizontalBoundaries();

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('scrollend', handleScrollEnd);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [displayedGarments.length]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !scrollContainerRef.current) return;
    stopMomentum();

    const now = performance.now();
    isPointerDown.current = true;
    hasMoved.current = false;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    dragStartScrollLeft.current = scrollContainerRef.current.scrollLeft;
    lastClientX.current = e.clientX;
    lastClientY.current = e.clientY;
    lastTime.current = now;
    velocity.current = 0;
    dragSamples.current = [{ time: now, x: e.clientX, y: e.clientY }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const now = performance.now();
    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;
    const instantDx = e.clientX - lastClientX.current;
    const instantDy = e.clientY - lastClientY.current;

    // Track displacement vs time samples for accurate velocity calculation
    dragSamples.current.push({ time: now, x: e.clientX, y: e.clientY });
    // Keep a rolling window of recent samples (last 90ms)
    dragSamples.current = dragSamples.current.filter((s) => now - s.time <= 90);

    const maxScroll = container.scrollWidth - container.clientWidth;
    const currentScroll = container.scrollLeft;
    const atRightBoundary = currentScroll >= maxScroll - 1;
    const atLeftBoundary = currentScroll <= 1;

    // Transition pointer event context back to vertical page-scrolling when reaching horizontal limits
    if (atRightBoundary && instantDx < 0) {
      const parentVertical = getParentVertical(container);
      const verticalStep = instantDy !== 0 ? -instantDy : -instantDx * 0.6;
      if (parentVertical) {
        parentVertical.scrollTop += verticalStep;
      } else {
        window.scrollBy({ top: verticalStep });
      }
    } else if (atLeftBoundary && instantDx > 0) {
      const parentVertical = getParentVertical(container);
      const verticalStep = instantDy !== 0 ? -instantDy : -instantDx * 0.6;
      if (parentVertical) {
        parentVertical.scrollTop += verticalStep;
      } else {
        window.scrollBy({ top: verticalStep });
      }
    }

    // Engage horizontal drag when horizontal intent dominates
    if (Math.abs(dx) > 6 || hasMoved.current) {
      if (!hasMoved.current) {
        // If vertical dragging was intended before moving horizontally, do not capture pointer
        if (Math.abs(dy) > Math.abs(dx) * 1.25) {
          return;
        }
        hasMoved.current = true;
        setIsDragging(true);
        try {
          container.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      container.scrollLeft = dragStartScrollLeft.current - dx;
    }

    lastClientX.current = e.clientX;
    lastClientY.current = e.clientY;
    lastTime.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    try {
      if (scrollContainerRef.current?.hasPointerCapture(e.pointerId)) {
        scrollContainerRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    const now = performance.now();
    const samples = dragSamples.current;

    // Calculate accurate velocity from displacement / time over the recent sample window
    let computedVelocity = 0;
    if (samples.length >= 2) {
      const oldest = samples[0];
      const newest = samples[samples.length - 1];
      const timeDelta = newest.time - oldest.time;
      const distDelta = newest.x - oldest.x;
      // If the user paused before releasing, velocity naturally settles to zero
      if (now - newest.time < 75 && timeDelta > 10) {
        computedVelocity = distDelta / timeDelta; // px per ms
      }
    }

    if (hasMoved.current && scrollContainerRef.current && Math.abs(computedVelocity) > 0.08) {
      // Physical momentum deceleration with friction & boundary handoff
      let currentVelocity = Math.max(-3.2, Math.min(3.2, computedVelocity));
      let lastFrame = performance.now();

      const step = (frameNow: number) => {
        const dt = Math.min(32, frameNow - lastFrame);
        lastFrame = frameNow;

        if (Math.abs(currentVelocity) > 0.015 && scrollContainerRef.current) {
          const el = scrollContainerRef.current;
          const maxScroll = el.scrollWidth - el.clientWidth;
          const move = currentVelocity * dt * 1.15;
          const nextScroll = el.scrollLeft - move;

          if (nextScroll <= 0) {
            el.scrollLeft = 0;
            // Hand off residual momentum smoothly to vertical upward scroll
            const parentVertical = getParentVertical(el);
            if (parentVertical) {
              parentVertical.scrollBy({ top: -Math.abs(currentVelocity) * dt * 0.5, behavior: 'smooth' });
            }
            currentVelocity = 0;
          } else if (nextScroll >= maxScroll) {
            el.scrollLeft = maxScroll;
            // Hand off residual momentum smoothly to vertical downward scroll
            const parentVertical = getParentVertical(el);
            if (parentVertical) {
              parentVertical.scrollBy({ top: Math.abs(currentVelocity) * dt * 0.7, behavior: 'smooth' });
            }
            currentVelocity = 0;
          } else {
            el.scrollLeft = nextScroll;
            // Physical decay curve (friction per frame)
            currentVelocity *= Math.pow(0.938, dt / 16);
            momentumRafRef.current = requestAnimationFrame(step);
            return;
          }
        }

        setIsDragging(false);
        setTimeout(() => {
          hasMoved.current = false;
        }, 50);
      };

      momentumRafRef.current = requestAnimationFrame(step);
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

  // Shared scroll-controller: Mouse wheel horizontal scroll & smooth boundary transition to vertical
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let targetScrollLeft = el.scrollLeft;
    let animFrameId: number | null = null;

    const smoothLerpHorizontal = () => {
      const diff = targetScrollLeft - el.scrollLeft;
      if (Math.abs(diff) > 0.4) {
        el.scrollLeft += diff * 0.2; // Smooth 60fps exponential ease
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

      // Trackpad horizontal swipe
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

      // Wheel UP -> smooth vertical upward scroll to navigate page above
      if (deltaY < 0) {
        if (parentVertical) {
          parentVertical.scrollBy({ top: deltaY, behavior: 'smooth' });
          e.preventDefault();
        } else {
          window.scrollBy({ top: deltaY, behavior: 'smooth' });
          e.preventDefault();
        }
        return;
      }

      // Wheel DOWN -> advance horizontally until end, then smoothly hand off to vertical page scroll
      const currentPos = animFrameId ? targetScrollLeft : el.scrollLeft;
      const roomForward = Math.max(0, maxScrollLeft - currentPos);

      if (roomForward > 1) {
        e.preventDefault();
        stopMomentum();

        if (deltaY <= roomForward) {
          targetScrollLeft = Math.min(maxScrollLeft, currentPos + deltaY);
        } else {
          targetScrollLeft = maxScrollLeft;
          const excess = (deltaY - roomForward) * 0.7;
          if (parentVertical) {
            parentVertical.scrollBy({ top: excess, behavior: 'smooth' });
          } else {
            window.scrollBy({ top: excess, behavior: 'smooth' });
          }
        }

        if (!animFrameId) {
          animFrameId = requestAnimationFrame(smoothLerpHorizontal);
        }
      } else {
        // At the right end: seamlessly continue scrolling down vertically
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
  }, [displayedGarments.length, getParentVertical, stopMomentum]);

  // Check scrollability
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        setCanScroll(scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth + 2);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayedGarments.length]);

  // Step scroll buttons
  const scrollStep = (direction: 'left' | 'right') => {
    stopMomentum();
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // =========================================================================
  // DYNAMIC SPAN SIZES BASED ON INDEX (Auto-packing with CSS grid-auto-flow: dense)
  // =========================================================================
  const getBentoSpanByIndex = (index: number) => {
    // 6-item repeating cadence designed for a 2-row horizontal dense grid:
    // Index 0: 2 rows x 2 cols (Hero focal piece)
    // Index 1: 1 row  x 1 col  (Upper compact piece)
    // Index 2: 1 row  x 1 col  (Lower compact piece, auto-fills hole under Index 1 via dense)
    // Index 3: 2 rows x 1 col  (Tall portrait column piece)
    // Index 4: 1 row  x 2 cols (Wide horizontal strip)
    // Index 5: 1 row  x 2 cols (Wide horizontal strip opposite row, auto-fills dense)
    const pattern = index % 6;
    switch (pattern) {
      case 0:
        return {
          colSpan: 'col-span-2',
          rowSpan: 'row-span-2',
          widthClass: 'w-[320px] sm:w-[420px] md:w-[460px]',
          isLarge: true,
          label: 'HERO CAD',
        };
      case 1:
        return {
          colSpan: 'col-span-1',
          rowSpan: 'row-span-1',
          widthClass: 'w-[190px] sm:w-[230px] md:w-[260px]',
          isLarge: false,
          label: 'DETAIL_01',
        };
      case 2:
        return {
          colSpan: 'col-span-1',
          rowSpan: 'row-span-1',
          widthClass: 'w-[190px] sm:w-[230px] md:w-[260px]',
          isLarge: false,
          label: 'DETAIL_02',
        };
      case 3:
        return {
          colSpan: 'col-span-1',
          rowSpan: 'row-span-2',
          widthClass: 'w-[220px] sm:w-[270px] md:w-[300px]',
          isLarge: false,
          label: 'TALL SILHOUETTE',
        };
      case 4:
        return {
          colSpan: 'col-span-2',
          rowSpan: 'row-span-1',
          widthClass: 'w-[320px] sm:w-[390px] md:w-[430px]',
          isLarge: false,
          label: 'PANORAMIC SPEC',
        };
      case 5:
      default:
        return {
          colSpan: 'col-span-2',
          rowSpan: 'row-span-1',
          widthClass: 'w-[320px] sm:w-[390px] md:w-[430px]',
          isLarge: false,
          label: 'LATERAL CUT',
        };
    }
  };

  // Garment click: inspect only if user was not actively dragging
  const handleGarmentClick = (garment: IndustryGarment) => {
    if (hasMoved.current || isDragging) return;
    setInspectedGarment(garment);
    setIsZoomed(false);
  };

  // Lightbox sequential navigation
  const currentGarmentIndex = useMemo(() => {
    if (!inspectedGarment) return -1;
    return displayedGarments.findIndex((g) => g.id === inspectedGarment.id);
  }, [inspectedGarment, displayedGarments]);

  const goToPrevGarment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentGarmentIndex > 0) {
      setInspectedGarment(displayedGarments[currentGarmentIndex - 1]);
    } else if (displayedGarments.length > 0) {
      setInspectedGarment(displayedGarments[displayedGarments.length - 1]);
    }
  };

  const goToNextGarment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentGarmentIndex < displayedGarments.length - 1) {
      setInspectedGarment(displayedGarments[currentGarmentIndex + 1]);
    } else if (displayedGarments.length > 0) {
      setInspectedGarment(displayedGarments[0]);
    }
  };

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (!inspectedGarment) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedGarment(null);
      } else if (e.key === 'ArrowRight') {
        goToNextGarment();
      } else if (e.key === 'ArrowLeft') {
        goToPrevGarment();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedGarment, currentGarmentIndex, displayedGarments]);

  // Technical spec sheet text download
  const handleDownloadTechSheet = (garment: IndustryGarment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!garment.techSheet) return;

    const sheet = garment.techSheet;
    const content = `=====================================================
VALENTINA ARCHIVE // TECHNICAL SPECIFICATION SHEET
=====================================================
DOCUMENT ID   : ${sheet.sheetId}
GARMENT REF   : ${garment.refCode}
ITEM NAME     : ${garment.name}
CATEGORY      : ${garment.category.toUpperCase()}
SEASON        : ${sheet.season}
DATE EXPORTED : ${new Date().toISOString().split('T')[0]}

[TEXTILE SPECIFICATION]
FABRIC CODE   : ${sheet.fabricCode}
WEIGHT        : ${sheet.weight}
COMPOSITION   : ${sheet.composition}
FINISH/TREAT  : ${sheet.treatment}

[SILHOUETTE & ANATOMY]
${garment.silhouette || 'Standard ergonomic industrial pattern'}

[TECHNICAL CONSTRUCTION SPECS]
${sheet.specs.map((s) => `• ${s.label.padEnd(24, ' ')}: ${s.value}`).join('\n')}

[INDUSTRIAL MANUFACTURING DETAILS]
${garment.details || 'Double safety stitch throughout with taped seam reinforcement.'}

=====================================================
AUTHENTIC DIGITAL BLUEPRINT // CC BY-NC 4.0
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${garment.refCode}_TECH_SHEET.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessId(garment.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  const activeSectorProject = typeof selectedSector === 'number' ? industryProjects[selectedSector] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 bg-black/95 pointer-events-auto animate-fade-in-up">
      <div className="w-full h-full flex flex-col bg-black/90 font-mono shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:px-8 border-b border-white gap-2 shrink-0">
          <div className="text-white uppercase tracking-widest text-xs sm:text-sm font-bold flex items-center gap-2 sm:gap-3 truncate">
            <span className="w-2 h-2 bg-white animate-pulse shrink-0"></span>
            <span className="truncate">{t('overlay.nav.collections')}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-black hover:bg-white px-2.5 sm:px-3 py-1 uppercase text-[10px] sm:text-xs transition-colors border border-transparent hover:border-white shrink-0 whitespace-nowrap cursor-crosshair"
          >
            {t('modal.close.view')}
          </button>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 scrollbar-hide space-y-10">
          {/* 1. CREATIVE UNIVERSE */}
          <div>
            <h2 className="text-white tracking-widest uppercase text-base sm:text-xl font-bold mb-4 border-b border-white pb-2 break-words flex items-center justify-between">
              <span>[ {isES ? 'UNIVERSO: CREATIVO' : 'UNIVERSE: CREATIVE'} ]</span>
              <span className="text-[10px] sm:text-xs text-[#c4ffff] font-normal">
                4 {isES ? 'PLANETAS' : 'PLANETS'}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {creativeProjects.map((project, idx) => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group relative flex flex-col border border-white hover:border-white transition-colors cursor-crosshair bg-white/5"
                >
                  <div className="aspect-video w-full overflow-hidden border-b border-white group-hover:border-white relative">
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.dataset.triedFallback) return;
                        target.dataset.triedFallback = 'true';
                        if (project.title.includes('REGNUM') || project.id === '1') {
                          target.src = '/assets/img/REGNUM/regnum_1.png';
                        } else if (project.title.includes('P3RMFRST') || project.id === '2') {
                          target.src = '/assets/img/P3RMFRST/p3rmfrst_1.png';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col gap-2 relative z-10 bg-black/40 group-hover:bg-transparent transition-colors">
                    <div className="flex justify-between items-center gap-1">
                      <div className="text-[10px] text-white tracking-widest uppercase font-bold shrink-0">
                        IDX_{String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] text-[#c4ffff] uppercase tracking-wider font-bold truncate max-w-[120px]">
                        {project.tags?.[0] || (isES ? 'CONCEPTO' : 'CONCEPT')}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mt-1 break-words line-clamp-2">
                      {project.title.replace(/^[0-9]+ /, '')}
                    </div>
                  </div>
                  <div
                    className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: '#c4ffff', boxShadow: '0 0 10px #c4ffff' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. REFINED DENSE BENTO GRID HORIZONTAL SCROLL LOOKBOOK */}
          <div className="pt-2">
            <div className="border-b border-white pb-3 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-white tracking-widest uppercase text-base sm:text-xl font-bold break-words flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#c4ffff] animate-pulse"></span>
                  <span>[ {isES ? 'UNIVERSO: INDUSTRIA // BENTO LOOKBOOK DENSE' : 'UNIVERSE: INDUSTRY // DENSE BENTO LOOKBOOK'} ]</span>
                </h2>
                <p className="text-white/60 text-xs mt-1">
                  {isES
                    ? 'Distribución paramétrica densa (CSS grid-auto-flow: dense) con desplazamiento inercial suave y fichas técnicas descargables.'
                    : 'Dense parametric packing (CSS grid-auto-flow: dense) with smooth inertia drag-to-scroll and downloadable tech packs.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {activeSectorProject && (
                  <button
                    onClick={() => onSelectProject(activeSectorProject)}
                    className="px-3 py-1.5 border border-[#c4ffff] bg-black text-[#c4ffff] hover:bg-[#c4ffff] hover:text-black font-mono text-[10px] sm:text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-crosshair"
                  >
                    <ExternalLink size={12} />
                    <span>{isES ? 'ABRIR EXPEDIENTE COMPLETO' : 'OPEN FULL DOSSIER'}</span>
                  </button>
                )}

                {/* Left/Right step buttons */}
                {canScroll && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    <button
                      onClick={() => scrollStep('left')}
                      className="p-1.5 border border-white/40 hover:border-[#c4ffff] text-white hover:text-black hover:bg-[#c4ffff] transition-colors cursor-crosshair"
                      title={isES ? 'Desplazar izquierda' : 'Scroll left'}
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      onClick={() => scrollStep('right')}
                      className="p-1.5 border border-white/40 hover:border-[#c4ffff] text-white hover:text-black hover:bg-[#c4ffff] transition-colors cursor-crosshair"
                      title={isES ? 'Desplazar derecha' : 'Scroll right'}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Category / Sector Selector Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-3 bg-black/60 p-2 border border-white/20">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50 mr-1 font-bold whitespace-nowrap shrink-0">
                {isES ? 'SECTOR:' : 'SECTOR:'}
              </span>

              {/* ALL Collections Chip */}
              <button
                onClick={() => handleSectorChange('ALL')}
                className={`font-mono text-[9px] sm:text-[10px] md:text-xs uppercase px-2.5 sm:px-3 py-1.5 transition-all duration-200 cursor-crosshair flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  selectedSector === 'ALL'
                    ? 'bg-[#c4ffff] text-black font-extrabold border-2 border-white shadow-[0_0_15px_rgba(196,255,255,0.7)] tracking-wider scale-[1.02]'
                    : 'bg-black/80 text-white/70 border border-white/30 hover:border-white hover:text-white'
                }`}
              >
                <span>{selectedSector === 'ALL' ? '▪' : '>'}</span>
                <span>{isES ? 'TODOS (LOOKBOOK TOTAL)' : 'ALL (FULL ARCHIVE)'}</span>
              </button>

              {industryProjects.map((project, idx) => {
                const isSelected = selectedSector === idx;
                const cleanTitle = project.title.replace(/^[0-9]+ /, '');

                return (
                  <button
                    key={project.id}
                    onClick={() => handleSectorChange(idx)}
                    className={`font-mono text-[9px] sm:text-[10px] md:text-xs uppercase px-2.5 sm:px-3 py-1.5 transition-all duration-200 cursor-crosshair flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#c4ffff] text-black font-extrabold border-2 border-white shadow-[0_0_15px_rgba(196,255,255,0.7)] tracking-wider scale-[1.02]'
                        : 'bg-black/80 text-white/70 border border-white/30 hover:border-white hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? '▪' : '>'}</span>
                    <span>0{idx + 5} // {cleanTitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-tag filter strip */}
            {availableTags.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1.5 mb-3 border-b border-white/10">
                <span className="text-[9px] text-[#c4ffff] uppercase tracking-wider mr-2 shrink-0">
                  {isES ? 'FILTRO:' : 'FILTER:'}
                </span>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-2.5 py-0.5 text-[8px] sm:text-[9px] uppercase tracking-wider transition-colors border shrink-0 cursor-crosshair ${
                      activeTag === tag
                        ? 'bg-white text-black font-bold border-white'
                        : 'bg-black/40 text-white/60 border-white/20 hover:border-white/50 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* BENTO GRID HORIZONTAL SCROLL CONTAINER WITH INERTIA DRAG & DENSE AUTO FLOW */}
            <div className="relative border border-white/30 bg-black/40 p-2 sm:p-3 overflow-hidden">
              {/* Edge Gradient Scrims */}
              {canScroll && (
                <>
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/90 to-transparent z-10 hidden sm:block" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/90 to-transparent z-10 hidden sm:block" />
                </>
              )}

              {/* The Horizontal Scroll Container with overflow-x: scroll & scroll-behavior: smooth */}
              <div
                ref={scrollContainerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                className={`w-full overflow-x-auto scrollbar-hide py-1 px-0.5 will-change-transform snap-x snap-mandatory ${
                  isDragging ? 'cursor-grabbing select-none touch-none [scroll-snap-type:none]' : 'cursor-grab active:cursor-grabbing touch-pan-x [scroll-snap-type:x_mandatory]'
                }`}
                style={{
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  willChange: 'transform',
                  scrollSnapType: isDragging ? 'none' : 'x mandatory',
                }}
              >
                {/* CSS grid-auto-flow: dense Layout with masonry-fill pattern & dynamic span sizes */}
                <div
                  ref={bentoGridRef}
                  className="grid grid-rows-2 [grid-template-rows:masonry] h-[520px] sm:h-[580px] md:h-[620px] gap-3 sm:gap-4 auto-cols-max [grid-auto-flow:column_dense] [grid-auto-flow:dense] will-change-transform transition-transform duration-200 ease-out"
                  style={{
                    gridAutoFlow: 'column dense',
                    gridTemplateRows: 'masonry',
                    willChange: 'transform',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {displayedGarments.map((garment, idx) => {
                    const spanConfig = getBentoSpanByIndex(idx);
                    const isDownloaded = downloadSuccessId === garment.id;

                    return (
                      <div
                        key={garment.id}
                        onClick={() => handleGarmentClick(garment)}
                        className={`bento-grid-item group relative border border-white/30 hover:border-[#c4ffff] bg-neutral-950 overflow-hidden flex flex-col justify-between ${spanConfig.colSpan} ${spanConfig.rowSpan} ${spanConfig.widthClass} cursor-crosshair shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_20px_rgba(196,255,255,0.25)] snap-start shrink-0`}
                        style={{
                          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                          scrollSnapAlign: 'start',
                          scrollSnapStop: 'normal',
                        }}
                      >
                        {/* Background Garment Image */}
                        <div className="absolute inset-0 z-0 overflow-hidden bg-black flex items-center justify-center">
                          <img
                            src={garment.image}
                            alt={garment.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out select-none pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-85 group-hover:opacity-60 transition-opacity pointer-events-none" />
                        </div>

                        {/* Top Metadata Badges (No repeated tags) */}
                        <div className="relative z-10 p-2 sm:p-2.5 flex items-start justify-between gap-1 pointer-events-none">
                          <div className="bg-black/85 backdrop-blur-sm border border-white/30 px-2 py-0.5 text-xs sm:text-sm text-[#c4ffff] font-bold tracking-widest uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#c4ffff] rounded-full animate-pulse"></span>
                            <span>{garment.refCode}</span>
                          </div>

                          <span className="bg-black/80 border border-white/20 px-2 py-0.5 text-[10px] sm:text-xs text-white/80 uppercase font-mono">
                            {spanConfig.label}
                          </span>
                        </div>

                        {/* Bottom Information Panel */}
                        <div className="relative z-10 p-2.5 sm:p-3.5 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col gap-1.5 border-t border-white/10">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-[13px] text-[#c4ffff] tracking-widest uppercase font-bold truncate">
                              {garment.category.toUpperCase()}
                            </span>
                            {garment.tags && garment.tags[0] && (
                              <span className="text-xs text-white/60 uppercase truncate font-mono">
                                #{garment.tags[0]}
                              </span>
                            )}
                          </div>

                          <h3 className="text-white text-sm sm:text-base font-bold uppercase tracking-wider line-clamp-1 group-hover:text-[#c4ffff] transition-colors">
                            {isES && garment.nameEs ? garment.nameEs : garment.name}
                          </h3>

                          {garment.silhouette && (
                            <p className="text-xs sm:text-[13px] text-white/80 line-clamp-1 italic">
                              {garment.silhouette}
                            </p>
                          )}

                          {/* Footer Action Strip - Responsive inspect and tech sheet buttons */}
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1.5 text-xs">
                            <span className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider font-bold font-mono whitespace-nowrap shrink-0">
                              [IDX_{String(idx + 1).padStart(2, '0')}]
                            </span>

                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectedGarment(garment);
                                }}
                                className="cursor-target px-2 sm:px-2.5 py-1 border border-[#c4ffff]/80 hover:border-[#c4ffff] text-[#c4ffff] hover:bg-[#c4ffff] hover:text-black transition-colors uppercase text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0"
                                title={isES ? 'Ver información' : 'View info'}
                              >
                                <Maximize2 size={11} className="shrink-0" />
                                <span className="whitespace-nowrap">INFO</span>
                              </button>

                              {garment.techSheet && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDownloadTechSheet(garment, e)}
                                  className={`cursor-target px-2 sm:px-2.5 py-1 border transition-all uppercase text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                                    isDownloaded
                                      ? 'bg-green-500/20 border-green-400 text-green-300'
                                      : 'border-white/40 hover:border-[#c4ffff] text-white hover:text-[#c4ffff] bg-black/60'
                                  }`}
                                  title={isES ? 'Descargar Ficha Técnica (.txt)' : 'Download Tech Pack (.txt)'}
                                >
                                  {isDownloaded ? (
                                    <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                                  ) : (
                                    <FileText size={12} className="shrink-0" />
                                  )}
                                  <span className="whitespace-nowrap">
                                    {isDownloaded
                                      ? (isES ? 'DESCARGADO' : 'SAVED')
                                      : spanConfig.isLarge
                                      ? (isES ? 'FICHA TÉCNICA' : 'TECH SHEET')
                                      : (isES ? 'FICHA' : 'TECH')}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Scroll Status Bar */}
              <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap items-center justify-between text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c4ffff]"></span>
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {displayedGarments.length} {isES ? 'PRENDAS DENSE-PACKED' : 'DENSE-PACKED PIECES'}
                  </span>
                  <span>·</span>
                  <span className="text-white/50">CSS grid-auto-flow: dense</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#c4ffff] text-xs hidden sm:inline">
                    {isES ? '← ARRASTRA O USA LA RUEDA DEL RATÓN →' : '← DRAG OR USE MOUSE WHEEL TO SCROLL →'}
                  </span>
                  {activeSectorProject && (
                    <button
                      onClick={() => onSelectProject(activeSectorProject)}
                      className="text-white hover:text-[#c4ffff] underline font-bold text-xs cursor-crosshair"
                    >
                      {isES ? 'Ver en 3D' : 'View in 3D'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN GARMENT INSPECTION LIGHTBOX (PORTALED TO BODY WITH MAX Z-INDEX) */}
      {inspectedGarment &&
        createPortal(
          <div
            className="fixed inset-0 z-[2147483646] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 md:p-6"
            onClick={() => setInspectedGarment(null)}
          >
            {/* Cyber scanline backdrop */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2ZmMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-15 pointer-events-none" />

            {/* Left Prev Arrow Button */}
            {displayedGarments.length > 1 && (
              <div className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-[2147483647]">
                <button
                  type="button"
                  onClick={goToPrevGarment}
                  title={isES ? 'Prenda anterior (←)' : 'Previous piece (←)'}
                  className="cursor-target p-2.5 sm:p-3.5 bg-black/90 hover:bg-[#c4ffff] text-white hover:text-black border border-white/50 hover:border-[#c4ffff] transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <ChevronLeft size={26} className="sm:w-8 sm:h-8" />
                </button>
              </div>
            )}

            {/* Right Next Arrow Button */}
            {displayedGarments.length > 1 && (
              <div className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-[2147483647]">
                <button
                  type="button"
                  onClick={goToNextGarment}
                  title={isES ? 'Siguiente prenda (→)' : 'Next piece (→)'}
                  className="cursor-target p-2.5 sm:p-3.5 bg-black/90 hover:bg-[#c4ffff] text-white hover:text-black border border-white/50 hover:border-[#c4ffff] transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <ChevronRight size={26} className="sm:w-8 sm:h-8" />
                </button>
              </div>
            )}

            {/* Main Inspection Dialog */}
            <div
              className="relative w-full max-w-4xl bg-black border-2 border-white/60 p-5 sm:p-7 md:p-9 flex flex-col md:flex-row gap-6 sm:gap-8 shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto scrollbar-hide z-[2147483647]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-3 h-3 border-b-2 border-l-2 border-[#c4ffff] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-[#c4ffff] pointer-events-none" />

              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setInspectedGarment(null)}
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
                  <img
                    src={inspectedGarment.image}
                    alt={inspectedGarment.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-300 ease-out select-none ${
                      isZoomed ? 'scale-150 object-center' : 'scale-100'
                    }`}
                  />

                  {/* Zoom Badge Indicator */}
                  <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/85 border border-white/40 text-white px-2.5 py-1 text-xs font-mono flex items-center gap-1.5 pointer-events-none">
                    {isZoomed ? <ZoomOut size={12} /> : <ZoomIn size={12} />}
                    <span>{isZoomed ? (isES ? 'ALEJAR' : 'ZOOM OUT') : (isES ? 'AMPLIAR' : 'ZOOM IN')}</span>
                  </div>
                </div>

                {/* Sub-label under photo */}
                <div className="flex items-center justify-between text-xs font-mono text-white/60 px-1 pt-0.5">
                  <span className="font-bold">REF: {inspectedGarment.refCode}</span>
                  {currentGarmentIndex !== -1 && (
                    <span className="text-[#c4ffff] font-bold">
                      [ {String(currentGarmentIndex + 1).padStart(2, '0')} / {String(displayedGarments.length).padStart(2, '0')} ]
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Specification Dossier */}
              <div className="w-full md:w-1/2 flex flex-col justify-between gap-5 font-mono">
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-2 text-[#c4ffff] text-xs sm:text-sm tracking-widest uppercase font-bold">
                    <span className="w-2 h-2 bg-[#c4ffff] animate-pulse"></span>
                    <span>{inspectedGarment.refCode}</span>
                    <span>·</span>
                    <span>{inspectedGarment.category.toUpperCase()}</span>
                  </div>

                  <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wider leading-snug">
                    {isES && inspectedGarment.nameEs ? inspectedGarment.nameEs : inspectedGarment.name}
                  </h2>

                  {inspectedGarment.silhouette && (
                    <div className="p-3 bg-white/5 border-l-2 border-[#c4ffff] text-white/95 text-sm sm:text-base leading-relaxed">
                      <span className="block text-[10px] sm:text-xs text-[#c4ffff] uppercase tracking-widest mb-1 font-bold">
                        {isES ? 'SILUETA Y CONSTRUCCIÓN' : 'SILHOUETTE & DRAPE'}
                      </span>
                      {inspectedGarment.silhouette}
                    </div>
                  )}

                  {inspectedGarment.material && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest font-bold">
                        {isES ? 'COMPOSICIÓN TEXTIL' : 'TEXTILE COMPOSITION'}
                      </span>
                      <span className="text-white text-sm sm:text-base font-medium">{inspectedGarment.material}</span>
                    </div>
                  )}

                  {inspectedGarment.details && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest font-bold">
                        {isES ? 'ESPECIFICACIONES INDUSTRIALES' : 'INDUSTRIAL SPECIFICATIONS'}
                      </span>
                      <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                        {inspectedGarment.details}
                      </p>
                    </div>
                  )}

                  {inspectedGarment.techSheet && (
                    <div className="mt-2 p-3.5 border border-[#c4ffff]/60 bg-black/70 space-y-2.5">
                      <div className="flex items-center justify-between text-[#c4ffff] text-xs sm:text-sm font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <FileText size={14} />
                          {isES ? 'FICHA TÉCNICA OFICIAL DISPONIBLE' : 'OFFICIAL TECH PACK AVAILABLE'}
                        </span>
                        <span className="text-white/80">{inspectedGarment.techSheet.sheetId}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-white/80 pt-1.5 border-t border-white/10">
                        <div>
                          <span className="text-white/40 block text-[10px] sm:text-xs">FABRIC:</span>
                          <span className="font-bold">{inspectedGarment.techSheet.fabricCode}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px] sm:text-xs">WEIGHT:</span>
                          <span className="font-bold">{inspectedGarment.techSheet.weight}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDownloadTechSheet(inspectedGarment, e)}
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
                    CAD // ARCHIVE
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
