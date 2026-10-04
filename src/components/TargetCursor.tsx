import { useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import './TargetCursor.css';

export interface TargetCursorProps {
  targetSelector?: string;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  cursorColor?: string;
  cursorColorOnTarget?: string;
  appMode?: "loading" | "terminal" | "universe";
}

type CursorState = 'idle' | 'interaction';

const TargetCursor = ({
  targetSelector = 'a, button, [role="button"], .cursor-target, input, select, textarea, [data-interactive]',
  hideDefaultCursor = true,
  hoverDuration = 0.14,
  cursorColor = '#ffffff',
  cursorColorOnTarget = '#c4ffff',
  appMode
}: TargetCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<NodeListOf<Element> | null>(null);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 480;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return (hasTouchScreen && isSmallScreen) || mobileRegex.test(userAgent.toLowerCase());
  }, []);

  const constants = useMemo(
    () => ({
      cornerSize: 12,
      defaultSpread: 16,
    }),
    []
  );

  const pointerPos = useRef({ x: -100, y: -100 });
  const activeTargetRef = useRef<Element | null>(null);
  const clickedTargetRef = useRef<Element | null>(null);
  const stateRef = useRef<CursorState>('idle');
  const isVisibleRef = useRef(false);
  const xSetter = useRef<any>(null);
  const ySetter = useRef<any>(null);

  // Keep appMode in a ref so mode changes do not cause effect teardown
  const appModeRef = useRef(appMode);
  useEffect(() => {
    appModeRef.current = appMode;
  }, [appMode]);

  // Return corners to standard compact square reticle [ · ]
  const getDefaultCornerPositions = useCallback(() => {
    const { cornerSize, defaultSpread } = constants;
    return [
      { x: -defaultSpread, y: -defaultSpread },
      { x: defaultSpread - cornerSize, y: -defaultSpread },
      { x: defaultSpread - cornerSize, y: defaultSpread - cornerSize },
      { x: -defaultSpread, y: defaultSpread - cornerSize }
    ];
  }, [constants]);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    if (hideDefaultCursor) {
      document.body.classList.add('hide-cursor');
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');

    // High performance quickSetters directly moving cursor wrapper to pointer coordinates
    xSetter.current = gsap.quickSetter(cursor, 'x', 'px');
    ySetter.current = gsap.quickSetter(cursor, 'y', 'px');

    // Ensure zero rotation on the root cursor wrapper
    gsap.set(cursor, { rotation: 0, opacity: 0 });

    // Instantly initialize corners to exact default coordinates on mount
    const defaultPositions = getDefaultCornerPositions();
    Array.from(cornersRef.current).forEach((corner, i) => {
      gsap.set(corner, {
        x: defaultPositions[i].x,
        y: defaultPositions[i].y,
        borderColor: cursorColor
      });
    });

    if (dotRef.current) {
      gsap.set(dotRef.current, {
        backgroundColor: cursorColor,
        scale: 1
      });
    }

    stateRef.current = 'idle';
    activeTargetRef.current = null;
    clickedTargetRef.current = null;

    const setCursorToIdle = (immediately = false) => {
      stateRef.current = 'idle';
      activeTargetRef.current = null;

      if (!cursorRef.current || !cornersRef.current) return;

      const corners = Array.from(cornersRef.current);
      gsap.killTweensOf(corners);

      // Revert colors to standard white
      gsap.to(corners, {
        borderColor: cursorColor,
        duration: immediately ? 0.05 : 0.12,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      if (dotRef.current) {
        gsap.to(dotRef.current, {
          backgroundColor: cursorColor,
          scale: 1,
          duration: immediately ? 0.05 : 0.12,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // Snap corners back to default compact reticle
      const defaultPositions = getDefaultCornerPositions();
      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: defaultPositions[i].x,
          y: defaultPositions[i].y,
          duration: immediately ? 0.06 : 0.12,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    };

    const setCursorToInteraction = (target: Element) => {
      stateRef.current = 'interaction';
      activeTargetRef.current = target;

      if (!cursorRef.current || !cornersRef.current) return;

      const corners = Array.from(cornersRef.current);
      gsap.killTweensOf(corners);

      // Target colors
      gsap.to(corners, {
        borderColor: cursorColorOnTarget,
        duration: 0.12,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      if (dotRef.current) {
        gsap.to(dotRef.current, {
          backgroundColor: cursorColorOnTarget,
          scale: 1.25,
          duration: 0.12,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // Calculate corners relative to current pointer position
      const rect = target.getBoundingClientRect();
      const padding = 4;
      const cornerSize = constants.cornerSize;

      const targetCorners = [
        { x: rect.left - padding - pointerPos.current.x, y: rect.top - padding - pointerPos.current.y },
        { x: rect.right + padding - cornerSize - pointerPos.current.x, y: rect.top - padding - pointerPos.current.y },
        { x: rect.right + padding - cornerSize - pointerPos.current.x, y: rect.bottom + padding - cornerSize - pointerPos.current.y },
        { x: rect.left - padding - pointerPos.current.x, y: rect.bottom + padding - cornerSize - pointerPos.current.y }
      ];

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCorners[i].x,
          y: targetCorners[i].y,
          duration: hoverDuration,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    };

    // Update target corners as pointer moves within target
    const updateInteractionCorners = () => {
      if (stateRef.current !== 'interaction' || !activeTargetRef.current || !cornersRef.current) return;

      // Check if target is still in DOM
      if (!document.contains(activeTargetRef.current)) {
        setCursorToIdle(true);
        return;
      }

      const rect = activeTargetRef.current.getBoundingClientRect();
      const padding = 4;
      const cornerSize = constants.cornerSize;

      const targetCorners = [
        { x: rect.left - padding - pointerPos.current.x, y: rect.top - padding - pointerPos.current.y },
        { x: rect.right + padding - cornerSize - pointerPos.current.x, y: rect.top - padding - pointerPos.current.y },
        { x: rect.right + padding - cornerSize - pointerPos.current.x, y: rect.bottom + padding - cornerSize - pointerPos.current.y },
        { x: rect.left - padding - pointerPos.current.x, y: rect.bottom + padding - cornerSize - pointerPos.current.y }
      ];

      const corners = Array.from(cornersRef.current);
      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCorners[i].x,
          y: targetCorners[i].y,
          duration: 0.04,
          ease: 'none',
          overwrite: 'auto'
        });
      });
    };

    // 1. GLOBAL POINTERMOVE: Updates cursor position strictly to pointer
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      if (!isVisibleRef.current && cursorRef.current) {
        isVisibleRef.current = true;
        gsap.to(cursorRef.current, { opacity: 1, duration: 0.1, overwrite: 'auto' });
      }

      pointerPos.current = { x: e.clientX, y: e.clientY };
      if (xSetter.current && ySetter.current) {
        xSetter.current(e.clientX);
        ySetter.current(e.clientY);
      }

      // Check element under pointer
      const elUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
      if (!elUnderPointer) {
        if (stateRef.current === 'interaction') setCursorToIdle();
        return;
      }

      // If user moved away from clicked target, release clicked lock
      if (clickedTargetRef.current && !clickedTargetRef.current.contains(elUnderPointer)) {
        clickedTargetRef.current = null;
      }

      // In terminal mode, focus interaction on the terminal modal if present
      if (appModeRef.current === 'terminal') {
        const terminalEl = document.getElementById('terminal-modal');
        if (terminalEl && !terminalEl.contains(elUnderPointer)) {
          if (stateRef.current === 'interaction') setCursorToIdle();
          return;
        }
      }

      // Check if hovering an interactive target
      const interactiveEl = elUnderPointer.closest(targetSelector);

      if (interactiveEl && interactiveEl !== clickedTargetRef.current) {
        if (activeTargetRef.current !== interactiveEl) {
          setCursorToInteraction(interactiveEl);
        } else {
          updateInteractionCorners();
        }
      } else {
        if (stateRef.current === 'interaction') {
          setCursorToIdle();
        }
      }
    };

    // 2. IMMEDIATE RESET ON BUTTON CLICK / POINTERDOWN
    const handlePointerDown = (e: PointerEvent) => {
      const target = (e.target as Element)?.closest(targetSelector);
      if (target) {
        clickedTargetRef.current = target;
      }

      // Immediately reset corners to idle pointer reticle
      setCursorToIdle(true);

      // Subtle tactile feedback on dot
      if (dotRef.current) {
        gsap.fromTo(dotRef.current, { scale: 0.6 }, { scale: 1, duration: 0.15, ease: 'back.out(2)' });
      }
    };

    const handlePointerUp = () => {
      if (dotRef.current && stateRef.current === 'idle') {
        gsap.to(dotRef.current, { scale: 1, duration: 0.1 });
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest(targetSelector);
      if (target) {
        clickedTargetRef.current = target;
      }
      setCursorToIdle(true);
    };

    const handleScroll = () => {
      if (stateRef.current === 'interaction') {
        setCursorToIdle(true);
      }
    };

    const handlePointerLeave = () => {
      isVisibleRef.current = false;
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { opacity: 0, duration: 0.15, overwrite: 'auto' });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { capture: true });
    window.addEventListener('pointerup', handlePointerUp, { capture: true });
    window.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true } as any);
      window.removeEventListener('pointerup', handlePointerUp, { capture: true } as any);
      window.removeEventListener('click', handleClick, { capture: true } as any);
      window.removeEventListener('scroll', handleScroll);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);

      document.body.classList.remove('hide-cursor');
    };
  }, [
    isMobile,
    hideDefaultCursor,
    targetSelector,
    hoverDuration,
    cursorColor,
    cursorColorOnTarget,
    getDefaultCornerPositions,
    constants.cornerSize
  ]);

  if (isMobile) {
    return null;
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={cursorRef}
      className="target-cursor-wrapper"
    >
      <div
        ref={dotRef}
        className="target-cursor-dot"
        style={{ backgroundColor: cursorColor }}
      />
      <div
        className="target-cursor-corner corner-tl"
        style={{ borderColor: cursorColor }}
      />
      <div
        className="target-cursor-corner corner-tr"
        style={{ borderColor: cursorColor }}
      />
      <div
        className="target-cursor-corner corner-br"
        style={{ borderColor: cursorColor }}
      />
      <div
        className="target-cursor-corner corner-bl"
        style={{ borderColor: cursorColor }}
      />
    </div>,
    document.body
  );
};

export default TargetCursor;
