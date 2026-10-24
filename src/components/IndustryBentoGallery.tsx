import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, X, Maximize2, Download, FileText, ChevronDown, ChevronUp, Layers, Compass, CheckCircle2, ZoomIn, ZoomOut } from 'lucide-react';
import { IndustryGarment } from '../types';
import { useLanguage } from '../context/LanguageContext';
import StarBorder from './StarBorder';
import GarmentLightboxModal from './GarmentLightboxModal';

interface IndustryBentoGalleryProps {
  garments: IndustryGarment[];
  availableFilterTags?: string[];
  projectTitle: string;
  isLight?: boolean;
}

export default function IndustryBentoGallery({
  garments,
  availableFilterTags,
  projectTitle,
  isLight = false,
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

  // Active image per card for garments with multiple photos
  const [activeCardImage, setActiveCardImage] = useState<Record<string, number>>({});
  const [inspectedImageIndex, setInspectedImageIndex] = useState<number>(0);

  // Full-screen interactive lightbox gallery (matching SYS.CREATIVE project galleries)
  const [lightboxGarment, setLightboxGarment] = useState<IndustryGarment | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number>(0);
  const [lightboxZoomLevel, setLightboxZoomLevel] = useState<number>(1);
  const [lightboxPanOffset, setLightboxPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLightboxPanning, setIsLightboxPanning] = useState<boolean>(false);
  const lightboxPanStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset zoom & inspected image when switching inspected garment
  useEffect(() => {
    setIsZoomed(false);
    setInspectedImageIndex(0);
  }, [selectedGarment?.id]);

  const openLightbox = (garment: IndustryGarment, initialIndex = 0, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxGarment(garment);
    setLightboxImageIndex(initialIndex);
    setLightboxZoomLevel(1);
    setLightboxPanOffset({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxGarment(null);
    setLightboxZoomLevel(1);
    setLightboxPanOffset({ x: 0, y: 0 });
  };

  const lightboxImages = useMemo(() => {
    if (!lightboxGarment) return [];
    return lightboxGarment.images && lightboxGarment.images.length > 0
      ? lightboxGarment.images
      : [lightboxGarment.image];
  }, [lightboxGarment]);

  const handleLightboxZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleLightboxZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setLightboxPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const resetLightboxZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxZoomLevel(1);
    setLightboxPanOffset({ x: 0, y: 0 });
  };

  const nextLightboxImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxImages.length <= 1) return;
    setLightboxImageIndex((prev) => (prev + 1) % lightboxImages.length);
    setLightboxZoomLevel(1);
    setLightboxPanOffset({ x: 0, y: 0 });
  };

  const prevLightboxImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxImages.length <= 1) return;
    setLightboxImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    setLightboxZoomLevel(1);
    setLightboxPanOffset({ x: 0, y: 0 });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxGarment) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage();
      } else if (e.key === '+' || e.key === '=') {
        handleLightboxZoomIn();
      } else if (e.key === '-') {
        handleLightboxZoomOut();
      } else if (e.key === '0') {
        resetLightboxZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxGarment, lightboxImages.length]);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setLightboxZoomLevel((prev) => Math.min(prev + 0.25, 4));
    } else {
      setLightboxZoomLevel((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setLightboxPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxZoomLevel > 1) {
      resetLightboxZoom();
    } else {
      setLightboxZoomLevel(2.2);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (lightboxZoomLevel <= 1) return;
    setIsLightboxPanning(true);
    lightboxPanStartRef.current = {
      x: e.clientX - lightboxPanOffset.x,
      y: e.clientY - lightboxPanOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isLightboxPanning || lightboxZoomLevel <= 1) return;
    setLightboxPanOffset({
      x: e.clientX - lightboxPanStartRef.current.x,
      y: e.clientY - lightboxPanStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsLightboxPanning(false);
  };

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

    const cardImages = garment.images && garment.images.length > 0 ? garment.images : [garment.image];
    const currentImgIdx = (activeCardImage[garment.id] || 0) % cardImages.length;
    const currentImgSrc = cardImages[currentImgIdx];

    return (
      <div
        key={garment.id}
        onClick={() => handleGarmentClick(garment)}
        className={`w-full ${
          isFullHeight ? 'h-full' : 'flex-1 min-h-0'
        } group relative border transition-all duration-300 flex flex-col overflow-hidden select-none cursor-target ${
          isLight
            ? 'border-black/30 hover:border-black bg-white hover:bg-neutral-50 shadow-[3px_3px_0px_rgba(0,0,0,0.8)] text-black'
            : 'border-white/40 hover:border-white bg-black/85 hover:bg-black/95 shadow-[4px_4px_0px_rgba(255,255,255,0.05)] hover:shadow-[0_0_22px_rgba(255, 255, 255,0.25)] text-white'
        }`}
      >
        {/* Top Header / Ref Tag */}
        <div className={`flex items-center justify-between p-2.5 sm:p-3 border-b text-xs sm:text-sm tracking-widest shrink-0 font-bold ${
          isLight ? 'border-black/20 bg-neutral-100 text-black' : 'border-white/20 bg-black/90 text-white/80'
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-1.5 h-1.5 animate-pulse shrink-0 ${isLight ? "bg-black" : "bg-white"}`}></span>
            <span className={`font-bold ${isLight ? "text-black" : "text-white"}`}>{garment.refCode}</span>
          </div>
          <div className={`tracking-wider text-[10px] sm:text-xs uppercase font-mono ${
            isLight ? 'text-black/60' : 'text-white/60'
          }`}>
            {isFullHeight ? 'LOOKBOOK // FULL' : 'DETAIL // STACK'}
          </div>
        </div>

        {/* Garment Image Frame with In-Card Gallery & Expandable Lightbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            openLightbox(garment, currentImgIdx, e);
          }}
          className={`w-full flex-1 relative overflow-hidden min-h-0 select-none cursor-zoom-in group/img ${
            isLight ? 'bg-neutral-100' : 'bg-neutral-950'
          }`}
          title={isES ? "Clic para desplegar galería completa" : "Click to deploy full gallery"}
        >
          {!hasError ? (
            <img
              src={currentImgSrc}
              alt={garment.name}
              draggable={false}
              referrerPolicy="no-referrer"
              onError={() => setImageErrors((prev) => ({ ...prev, [garment.id]: true }))}
              className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out select-none"
            />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${
              isLight ? 'bg-neutral-200 text-black/60' : 'bg-gradient-to-b from-neutral-900 to-black text-white/60'
            }`}>
              <Layers size={28} className={`mb-2 ${isLight ? 'text-black opacity-80' : 'text-white opacity-60'}`} />
              <span className={`text-[10px] font-bold tracking-widest uppercase ${
                isLight ? 'text-black/80' : 'text-white/80'
              }`}>
                {garment.refCode} // CAD.SPEC
              </span>
            </div>
          )}

          {/* Multiple Image In-Card Controls */}
          {cardImages.length > 1 && (
            <>
              {/* Prev / Next Arrows */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCardImage((prev) => ({
                    ...prev,
                    [garment.id]: (currentImgIdx - 1 + cardImages.length) % cardImages.length,
                  }));
                }}
                title={isES ? "Vista anterior" : "Previous view"}
                className={`cursor-target absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 border font-mono text-xs font-bold flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
                  isLight
                    ? 'bg-white/95 text-black hover:bg-black hover:text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)]'
                    : 'bg-black/90 text-white hover:bg-white hover:text-black border-white/70 shadow-[0_0_10px_rgba(0,0,0,0.9)]'
                }`}
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCardImage((prev) => ({
                    ...prev,
                    [garment.id]: (currentImgIdx + 1) % cardImages.length,
                  }));
                }}
                title={isES ? "Siguiente vista" : "Next view"}
                className={`cursor-target absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 border font-mono text-xs font-bold flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
                  isLight
                    ? 'bg-white/95 text-black hover:bg-black hover:text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)]'
                    : 'bg-black/90 text-white hover:bg-white hover:text-black border-white/70 shadow-[0_0_10px_rgba(0,0,0,0.9)]'
                }`}
              >
                &gt;
              </button>

              {/* View Selector Mini-Carousel (Bottom Left) */}
              <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 max-w-[80%] overflow-x-auto scrollbar-hide py-0.5">
                {cardImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardImage((prev) => ({ ...prev, [garment.id]: i }));
                    }}
                    title={isES ? `Ver foto ${(i + 1).toString().padStart(2, '0')}` : `View photo ${(i + 1).toString().padStart(2, '0')}`}
                    className={`cursor-target flex items-center gap-1 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold tracking-wider uppercase border transition-all shrink-0 ${
                      currentImgIdx === i
                        ? isLight
                          ? 'bg-black text-white border-black shadow-[1px_1px_0px_rgba(0,0,0,0.8)] scale-105'
                          : 'bg-white text-black border-white shadow-[0_0_8px_rgba(255,255,255,0.7)] scale-105'
                        : isLight
                        ? 'bg-white/90 text-black/70 border-black/30 hover:border-black hover:text-black'
                        : 'bg-black/80 text-white/70 border-white/30 hover:border-white hover:text-white'
                    }`}
                  >
                    <div className="w-2.5 h-3 overflow-hidden bg-neutral-900 border shrink-0">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span>{(i + 1).toString().padStart(2, '0')}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Expand Full Lightbox Gallery Button (Top Right) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(garment, currentImgIdx, e);
            }}
            className={`cursor-target cursor-crosshair pulse-tactile absolute top-2 right-2 z-20 px-2 py-0.5 border font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
              isLight
                ? 'bg-white/95 text-black border-black hover:bg-black hover:text-white shadow-[2px_2px_0px_rgba(0,0,0,0.8)]'
                : 'bg-black/90 text-white border-white/70 hover:bg-white hover:text-black shadow-[0_0_10px_rgba(0,0,0,0.8)]'
            }`}
            title={isES ? "Desplegar galería de imágenes" : "Open image gallery"}
          >
            <Maximize2 size={10} />
            <span>{isES ? 'GALERÍA' : 'GALLERY'}</span>
            {cardImages.length > 1 && <span>[{cardImages.length}]</span>}
          </button>

          {/* Scrim */}
          <div className={`absolute inset-0 transition-opacity pointer-events-none ${
            isLight
              ? 'bg-gradient-to-t from-white via-white/20 to-transparent opacity-60 group-hover:opacity-20'
              : 'bg-gradient-to-t from-black via-black/25 to-transparent opacity-80 group-hover:opacity-50'
          }`} />
        </div>

        {/* Garment Details & Actions (No repeated info or duplicate buttons) */}
        <div className={`p-2.5 sm:p-3 flex flex-col justify-between gap-1.5 shrink-0 border-t z-10 ${
          isLight ? 'bg-white border-black/15 text-black' : 'bg-black/90 border-white/10 text-white'
        }`}>
          <div className="flex flex-col">
            <h3 className={`text-sm sm:text-base font-bold uppercase tracking-wider line-clamp-1 transition-colors ${
              isLight ? 'text-black group-hover:text-black' : 'text-white group-hover:text-white'
            }`}>
              {isES && garment.nameEs ? garment.nameEs : garment.name}
            </h3>
            {garment.material && (
              <p className={`text-xs sm:text-[13px] truncate mt-0.5 font-mono ${
                isLight ? 'text-black/70' : 'text-white/70'
              }`}>
                {garment.material}
              </p>
            )}
          </div>

          <div className={`pt-2 border-t flex items-center justify-between gap-2 text-xs ${
            isLight ? 'border-black/10' : 'border-white/10'
          }`}>
            {/* Non-repeating category / silhouette badge */}
            <div className={`text-xs uppercase tracking-wider truncate font-mono ${
              isLight ? 'text-black/60' : 'text-white/60'
            }`}>
              {garment.silhouette ? (
                <span className="truncate">{garment.silhouette}</span>
              ) : (
                <span className={isLight ? 'text-black/40' : 'text-white/40'}>{garment.category}</span>
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
                className={`cursor-target px-2 sm:px-2.5 py-1 border transition-colors uppercase text-[10px] sm:text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  isLight
                    ? 'border-black bg-white text-black hover:bg-black hover:text-white'
                    : 'border-white/80 hover:border-white text-white hover:bg-white hover:text-black'
                }`}
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
                      ? isLight
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-white'
                      : isLight
                      ? 'border-black/40 hover:border-black text-black hover:bg-black/5 bg-white'
                      : 'border-white/40 hover:border-white text-white hover:text-white bg-black/60'
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
            className={`absolute inset-x-0 bottom-0 top-[35px] z-30 p-3 sm:p-4 border-t-2 flex flex-col justify-between overflow-y-auto animate-fade-in-up ${
              isLight
                ? 'bg-white/95 text-black border-black shadow-lg'
                : 'bg-black/95 text-white border-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <div className={`flex items-center justify-between pb-1.5 border-b ${
                isLight ? 'border-black/15' : 'border-white/20'
              }`}>
                <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  isLight ? "text-black" : "text-white"
                }`}>
                  <FileText size={11} />
                  {isES ? 'FICHA TÉCNICA INDUSTRIAL' : 'TECHNICAL SPEC SHEET'}
                </span>
                <button
                  onClick={(e) => toggleTechSheet(garment.id, e)}
                  className="cursor-target cursor-crosshair pulse-tactile border border-white bg-white text-black hover:bg-black hover:text-white font-mono text-[9px] font-bold px-1.5 py-0.5 leading-none transition-colors shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                  title={isES ? "Cerrar" : "Close"}
                >
                  [ X ]
                </button>
              </div>

              <div className={`text-[8px] sm:text-[9px] space-y-1 ${isLight ? 'text-black/80' : 'text-white/80'}`}>
                <div className="flex justify-between">
                  <span className={`uppercase ${isLight ? 'text-black/50' : 'text-white/50'}`}>TEJIDO:</span>
                  <span className={`font-bold ${isLight ? "text-black" : "text-white"}`}>{garment.techSheet.fabricCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`uppercase ${isLight ? 'text-black/50' : 'text-white/50'}`}>GRAMAJE:</span>
                  <span>{garment.techSheet.weight}</span>
                </div>
                <div className={`text-[8px] pt-1 border-t ${
                  isLight ? 'border-black/10 text-black/60' : 'border-white/10 text-white/60'
                }`}>
                  {garment.techSheet.composition}
                </div>
              </div>

              <div className={`p-1.5 border space-y-1 text-[8px] ${
                isLight ? 'bg-black/[0.03] border-black/10' : 'bg-white/5 border-white/10'
              }`}>
                {garment.techSheet.specs.slice(0, 3).map((s, sIdx) => (
                  <div key={sIdx} className="flex justify-between gap-1">
                    <span className={`truncate ${isLight ? 'text-black/50' : 'text-white/50'}`}>{s.label}:</span>
                    <span className={`font-medium truncate ${isLight ? 'text-black' : 'text-white'}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={(e) => handleDownloadTechSheet(garment, e)}
                className={`w-full py-1.5 font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                  isLight
                    ? 'bg-black hover:bg-black text-white shadow-[2px_2px_0px_rgba(0,0,0,0.8)]'
                    : 'bg-white hover:bg-white text-black shadow-[0_0_10px_rgba(255, 255, 255,0.4)]'
                }`}
              >
                {isDownloaded ? (
                  <>
                    <CheckCircle2 size={12} className={isLight ? 'text-white' : 'text-black'} />
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
        <div className={`absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
          isLight ? "bg-black" : "bg-white"
        }`} />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 font-mono select-none">
      {/* 1. TERMINAL CHIP-BASED FILTER SUBMENU */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-y py-3 px-2 sm:px-3 ${
        isLight ? 'border-black/20 bg-black/[0.03] text-black' : 'border-white/20 bg-black/60 text-white'
      }`}>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 animate-ping shrink-0 ${isLight ? "bg-black" : "bg-white"}`} />
          <span className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${
            isLight ? "text-black" : "text-white"
          }`}>
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
                    ? isLight
                      ? 'bg-black text-white font-extrabold border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] tracking-wider scale-[1.02]'
                      : 'bg-white text-black font-extrabold border-2 border-white shadow-[0_0_15px_rgba(255, 255, 255,0.8),inset_0_0_4px_rgba(0,0,0,0.3)] tracking-wider scale-[1.02]'
                    : isLight
                    ? 'bg-white text-black border border-black/30 hover:border-black hover:bg-black/5'
                    : 'bg-black/80 text-white/70 border border-white/30 hover:border-white hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={isActive ? (isLight ? 'text-white font-bold' : 'text-black font-bold') : (isLight ? 'text-black' : 'text-white opacity-70')}>
                  {isActive ? '▪' : '>'}
                </span>
                <span>{tag}</span>
                <span className={`text-[8px] sm:text-[9px] px-1 py-0.2 ${
                  isActive
                    ? isLight
                      ? 'bg-white text-black font-bold'
                      : 'bg-black text-white font-bold'
                    : isLight
                    ? 'text-black/50'
                    : 'text-white/50'
                }`}>
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
              className={`p-1.5 border transition-colors cursor-crosshair ${
                isLight
                  ? 'border-black/30 hover:border-black text-black hover:bg-black/10'
                  : 'border-white/40 hover:border-white text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              title={isES ? 'Desplazar derecha' : 'Scroll right'}
              className={`p-1.5 border transition-colors cursor-crosshair ${
                isLight
                  ? 'border-black/30 hover:border-black text-black hover:bg-black/10'
                  : 'border-white/40 hover:border-white text-white/80 hover:text-white hover:bg-white/10'
              }`}
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
            <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 hidden sm:block ${
              isLight ? 'bg-gradient-to-r from-white/90 to-transparent' : 'bg-gradient-to-r from-black/90 to-transparent'
            }`} />
            <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 hidden sm:block ${
              isLight ? 'bg-gradient-to-l from-white/90 to-transparent' : 'bg-gradient-to-l from-black/90 to-transparent'
            }`} />
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
      <div className={`flex items-center justify-between text-[8px] sm:text-[9px] px-1 pt-1 border-t ${
        isLight ? 'border-black/15 text-black/60' : 'border-white/10 text-white/50'
      }`}>
        <div className="flex items-center gap-1.5">
          <Compass size={11} className={isLight ? "text-black" : "text-white"} />
          <span>
            {isES
              ? `BENTO GRID // ${filteredGarments.length} PRENDAS EN ${projectTitle}`
              : `BENTO GRID // ${filteredGarments.length} PIECES IN ${projectTitle}`}
          </span>
        </div>
        <div className={`hidden sm:flex items-center gap-2 uppercase tracking-widest ${
          isLight ? "text-black" : "text-white"
        }`}>
          {canScroll ? (
            <span>{isES ? '↔ ARRASTRAR O SCROLL HORIZONTAL ↔' : '↔ CLICK & DRAG TO SCROLL ↔'}</span>
          ) : (
            <span className={isLight ? 'text-black/60' : 'text-white/60'}>
              {isES ? '✓ DISTRIBUCIÓN COMPLETA // 100% DINÁMICO' : '✓ BALANCED CONTAINER // 100% DYNAMIC'}
            </span>
          )}
        </div>
      </div>

      {/* 4. FULLSCREEN GARMENT INSPECTION LIGHTBOX (PORTALED TO ROOT BODY) */}
      {selectedGarment &&
        createPortal(
          <div
            className={`fixed inset-0 z-[99999] backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 ${
              isLight ? 'bg-black/40 text-black' : 'bg-black/95 text-white'
            }`}
            onClick={() => setSelectedGarment(null)}
          >
            {/* Background cyber scanlines */}
            <div className={`absolute inset-0 opacity-15 pointer-events-none ${isLight ? 'bg-cyber-grid' : ''}`} />

            {/* Left Prev Arrow Button */}
            {filteredGarments.length > 1 && (
              <div className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-[100000]">
                <button
                  type="button"
                  onClick={goToPrevGarment}
                  title={isES ? 'Prenda anterior (←)' : 'Previous garment (←)'}
                  className={`cursor-target p-2.5 sm:p-3.5 transition-all duration-200 ${
                    isLight
                      ? 'bg-white hover:bg-black text-black hover:text-white border border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]'
                      : 'bg-black/90 hover:bg-white text-white hover:text-black border border-white/50 hover:border-white shadow-[0_0_15px_rgba(0,0,0,0.8)]'
                  }`}
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
                  className={`cursor-target p-2.5 sm:p-3.5 transition-all duration-200 ${
                    isLight
                      ? 'bg-white hover:bg-black text-black hover:text-white border border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]'
                      : 'bg-black/90 hover:bg-white text-white hover:text-black border border-white/50 hover:border-white shadow-[0_0_15px_rgba(0,0,0,0.8)]'
                  }`}
                >
                  <ChevronRight size={26} className="sm:w-8 sm:h-8" />
                </button>
              </div>
            )}

            {/* Main Inspection Modal Dialog (Enlarged Monumental Size) */}
            <div
              className={`relative w-full max-w-6xl xl:max-w-7xl border-2 p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row gap-7 sm:gap-9 lg:gap-12 max-h-[94vh] overflow-y-auto scrollbar-hide z-[100001] ${
                isLight
                  ? 'bg-white border-black text-black shadow-[10px_10px_0px_rgba(0,0,0,0.9)]'
                  : 'bg-black border-white/60 text-white shadow-[0_0_60px_rgba(0,0,0,0.95)]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner Accents */}
              <div className={`absolute top-0 right-0 w-3.5 h-3.5 border-b-2 border-l-2 pointer-events-none ${
                isLight ? "border-black" : "border-white"
              }`} />
              <div className={`absolute bottom-0 left-0 w-3.5 h-3.5 border-t-2 border-r-2 pointer-events-none ${
                isLight ? "border-black" : "border-white"
              }`} />

              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setSelectedGarment(null)}
                className="cursor-target cursor-crosshair pulse-tactile absolute top-4 right-4 px-2.5 py-1.5 border border-white bg-white text-black hover:bg-black hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors z-20 shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                title={isES ? 'Cerrar (ESC)' : 'Close (ESC)'}
              >
                [ X ]
              </button>

              {/* Left Column: Image with Direct Fullscreen Open and Multi-Image Carousel */}
              {(() => {
                const inspectedImages = selectedGarment.images && selectedGarment.images.length > 0
                  ? selectedGarment.images
                  : [selectedGarment.image];
                const currentInspectedIdx = inspectedImageIndex % inspectedImages.length;
                const currentInspectedSrc = inspectedImages[currentInspectedIdx];

                return (
                  <div className="w-full lg:w-[50%] flex flex-col gap-3.5">
                    {/* Main Garment Preview Frame: Clicking opens fullscreen gallery */}
                    <div
                      className={`w-full aspect-[3/4] md:aspect-[4/5] lg:aspect-auto lg:h-[58vh] max-h-[64vh] relative border overflow-hidden flex items-center justify-center cursor-zoom-in group/main-preview ${
                        isLight ? 'bg-neutral-100 border-black/30' : 'bg-neutral-950 border-white/30'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(selectedGarment, currentInspectedIdx, e);
                      }}
                      title={isES ? "Clic para abrir en pantalla completa HD" : "Click to open in fullscreen HD"}
                    >
                      {!imageErrors[selectedGarment.id] ? (
                        <img
                          src={currentInspectedSrc}
                          alt={selectedGarment.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/main-preview:scale-105 transition-transform duration-500 ease-out select-none"
                        />
                      ) : (
                        <div className={`flex flex-col items-center justify-center p-6 text-center ${
                          isLight ? 'text-black/60' : 'text-white/60'
                        }`}>
                          <Layers size={44} className={`mb-3 ${isLight ? "text-black" : "text-white"}`} />
                          <span className={`text-xs uppercase font-bold ${isLight ? 'text-black' : 'text-white'}`}>
                            {selectedGarment.refCode} // CAD BLUEPRINT
                          </span>
                        </div>
                      )}

                      {/* Top-Left Look Index */}
                      <div className={`absolute top-3 left-3 z-10 border px-2.5 py-1 text-[10px] sm:text-xs font-mono font-bold tracking-wider pointer-events-none uppercase ${
                        isLight
                          ? 'bg-white/95 border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)]'
                          : 'bg-black/90 border-white/60 text-white shadow-[0_0_10px_rgba(0,0,0,0.8)]'
                      }`}>
                        LOOK {(currentInspectedIdx + 1).toString().padStart(2, '0')} / {inspectedImages.length.toString().padStart(2, '0')}
                      </div>

                      {/* Bottom-Left Fullscreen Click Indicator Badge */}
                      <div className={`absolute bottom-3 left-3 z-10 border px-3 py-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 pointer-events-none ${
                        isLight
                          ? 'bg-white/95 border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)]'
                          : 'bg-black/90 border-white/60 text-white shadow-[0_0_12px_rgba(0,0,0,0.8)]'
                      }`}>
                        <Maximize2 size={13} className="animate-pulse" />
                        <span>{isES ? 'CLICK // PANTALLA COMPLETA' : 'CLICK // FULLSCREEN'}</span>
                      </div>
                    </div>

                    {/* Multi-Image Thumbnail Carousel Filmstrip (Large pure thumbnails, no text) */}
                    {inspectedImages.length > 1 && (
                      <div className={`p-2 sm:p-2.5 border overflow-hidden ${
                        isLight ? 'border-black/20 bg-black/[0.02]' : 'border-white/20 bg-white/[0.02]'
                      }`}>
                        <div className="relative flex items-center gap-2">
                          {inspectedImages.length > 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedImageIndex((prev) => (prev - 1 + inspectedImages.length) % inspectedImages.length);
                              }}
                              title={isES ? "Imagen anterior" : "Previous image"}
                              className={`cursor-target p-2 border transition-all shrink-0 ${
                                isLight
                                  ? 'bg-white hover:bg-black text-black hover:text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)]'
                                  : 'bg-black/80 hover:bg-white text-white hover:text-black border-white/50 shadow-[0_0_8px_rgba(0,0,0,0.8)]'
                              }`}
                            >
                              <ChevronLeft size={18} />
                            </button>
                          )}

                          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1 w-full">
                            {inspectedImages.map((img, i) => {
                              const isSelected = currentInspectedIdx === i;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectedImageIndex(i);
                                  }}
                                  className={`cursor-target group/thumb relative flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 border transition-all overflow-hidden ${
                                    isSelected
                                      ? isLight
                                        ? 'border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.9)] scale-105 bg-white'
                                        : 'border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-105 bg-black'
                                      : isLight
                                      ? 'border border-black/30 hover:border-black opacity-75 hover:opacity-100 bg-neutral-100'
                                      : 'border border-white/30 hover:border-white opacity-65 hover:opacity-100 bg-neutral-900'
                                  }`}
                                >
                                  <img src={img} alt="" className="w-full h-full object-cover select-none" />
                                  <span className="absolute bottom-0 right-0 bg-black/85 text-[8px] font-mono text-white px-1.5 py-0.5 pointer-events-none">
                                    {(i + 1).toString().padStart(2, '0')}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {inspectedImages.length > 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedImageIndex((prev) => (prev + 1) % inspectedImages.length);
                              }}
                              title={isES ? "Siguiente imagen" : "Next image"}
                              className={`cursor-target p-2 border transition-all shrink-0 ${
                                isLight
                                  ? 'bg-white hover:bg-black text-black hover:text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)]'
                                  : 'bg-black/80 hover:bg-white text-white hover:text-black border-white/50 shadow-[0_0_8px_rgba(0,0,0,0.8)]'
                              }`}
                            >
                              <ChevronRight size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Deploy Fullscreen Lightbox Gallery Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(selectedGarment, currentInspectedIdx, e);
                      }}
                      className={`cursor-target cursor-crosshair pulse-tactile w-full py-2.5 sm:py-3 border font-mono text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all ${
                        isLight
                          ? 'bg-black text-white hover:bg-neutral-800 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.9)]'
                          : 'bg-white text-black hover:bg-neutral-200 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                      }`}
                      title={isES ? "Desplegar galería interactiva con zoom y navegación" : "Open interactive gallery with zoom & navigation"}
                    >
                      <Maximize2 size={15} />
                      <span>{isES ? 'ABRIR EN PANTALLA COMPLETA // GALERÍA HD [ZOOM]' : 'OPEN FULLSCREEN // HD GALLERY [ZOOM]'}</span>
                    </button>

                    {/* Sub-label under photo */}
                    <div className={`flex items-center justify-between text-xs font-mono px-1 pt-0.5 ${
                      isLight ? 'text-black/70' : 'text-white/60'
                    }`}>
                      <span className="font-bold">REF: {selectedGarment.refCode}</span>
                      {currentGarmentIndex !== -1 && (
                        <span className={`font-bold ${isLight ? "text-black" : "text-white"}`}>
                          [ {String(currentGarmentIndex + 1).padStart(2, '0')} / {String(filteredGarments.length).padStart(2, '0')} ]
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Right Column: Specification Dossier */}
              <div className="w-full md:w-1/2 flex flex-col justify-between gap-5 font-mono">
                <div className="flex flex-col gap-3.5">
                  <div className={`flex items-center gap-2 text-xs sm:text-sm tracking-widest uppercase font-bold ${
                    isLight ? "text-black" : "text-white"
                  }`}>
                    <span className={`w-2 h-2 animate-pulse ${isLight ? "bg-black" : "bg-white"}`}></span>
                    <span>{selectedGarment.refCode}</span>
                    <span>·</span>
                    <span>{selectedGarment.category.toUpperCase()}</span>
                  </div>

                  <h2 className={`text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wider leading-snug ${
                    isLight ? 'text-black' : 'text-white'
                  }`}>
                    {isES && selectedGarment.nameEs ? selectedGarment.nameEs : selectedGarment.name}
                  </h2>

                  {selectedGarment.silhouette && (
                    <div className={`p-3 border-l-2 text-sm sm:text-base leading-relaxed ${
                      isLight
                        ? 'bg-black/5 border-black text-black'
                        : 'bg-white/5 border-white text-white/95'
                    }`}>
                      <span className={`block text-[10px] sm:text-xs uppercase tracking-widest mb-1 font-bold ${
                        isLight ? "text-black" : "text-white"
                      }`}>
                        {isES ? 'SILUETA Y CONSTRUCCIÓN' : 'SILHOUETTE & DRAPE'}
                      </span>
                      {selectedGarment.silhouette}
                    </div>
                  )}

                  {selectedGarment.material && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${
                        isLight ? 'text-black/50' : 'text-white/50'
                      }`}>
                        {isES ? 'COMPOSICIÓN TEXTIL' : 'TEXTILE COMPOSITION'}
                      </span>
                      <span className={`text-sm sm:text-base font-medium ${isLight ? 'text-black' : 'text-white'}`}>
                        {selectedGarment.material}
                      </span>
                    </div>
                  )}

                  {selectedGarment.details && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${
                        isLight ? 'text-black/50' : 'text-white/50'
                      }`}>
                        {isES ? 'ESPECIFICACIONES INDUSTRIALES' : 'INDUSTRIAL SPECIFICATIONS'}
                      </span>
                      <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-black/85' : 'text-white/85'}`}>
                        {selectedGarment.details}
                      </p>
                    </div>
                  )}

                  {selectedGarment.techSheet && (
                    <div className={`mt-2 p-3.5 border space-y-2.5 ${
                      isLight
                        ? 'border-black/30 bg-black/5 text-black'
                        : 'border-white/60 bg-black/70 text-white'
                    }`}>
                      <div className={`flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider ${
                        isLight ? "text-black" : "text-white"
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <FileText size={14} />
                          {isES ? 'FICHA TÉCNICA OFICIAL DISPONIBLE' : 'OFFICIAL TECH PACK AVAILABLE'}
                        </span>
                        <span className={isLight ? 'text-black/80' : 'text-white/80'}>{selectedGarment.techSheet.sheetId}</span>
                      </div>

                      <div className={`grid grid-cols-2 gap-3 text-xs sm:text-sm pt-1.5 border-t ${
                        isLight ? 'border-black/10 text-black/80' : 'border-white/10 text-white/80'
                      }`}>
                        <div>
                          <span className={`block text-[10px] sm:text-xs ${isLight ? 'text-black/50' : 'text-white/40'}`}>FABRIC:</span>
                          <span className="font-bold">{selectedGarment.techSheet.fabricCode}</span>
                        </div>
                        <div>
                          <span className={`block text-[10px] sm:text-xs ${isLight ? 'text-black/50' : 'text-white/40'}`}>WEIGHT:</span>
                          <span className="font-bold">{selectedGarment.techSheet.weight}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDownloadTechSheet(selectedGarment, e)}
                        className={`cursor-target w-full mt-2 py-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                          isLight
                            ? 'bg-black text-white hover:bg-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]'
                            : 'bg-white hover:bg-white text-black shadow-[0_0_15px_rgba(255, 255, 255,0.4)]'
                        }`}
                      >
                        <Download size={15} />
                        <span>{isES ? 'DESCARGAR FICHA TÉCNICA COMPLETA (.TXT)' : 'DOWNLOAD FULL TECH PACK (.TXT)'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className={`pt-4 border-t flex items-center justify-between text-xs font-mono uppercase ${
                  isLight ? 'border-black/20 text-black/60' : 'border-white/20 text-white/50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span>{isES ? '[ESC] SALIR' : '[ESC] EXIT'}</span>
                    <span>·</span>
                    <span>{isES ? '[← →] NAVEGAR' : '[← →] NAVIGATE'}</span>
                  </div>
                  <span className={`tracking-widest text-[11px] font-bold ${
                    isLight ? "text-black" : "text-white"
                  }`}>
                    CAD // BLUEPRINT
                  </span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 5. FULLSCREEN INTERACTIVE LIGHTBOX GALLERY (PORTALED TO ROOT BODY) */}
      {lightboxGarment && (
        <GarmentLightboxModal
          garment={lightboxGarment}
          initialIndex={lightboxImageIndex}
          onClose={closeLightbox}
          isLight={isLight}
        />
      )}
    </div>
  );
}
