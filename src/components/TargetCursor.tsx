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
  targetSelector = 'a, button, [role="button"], [role="tab"], [role="link"], [role="menuitem"], [role="checkbox"], .cursor-target, .cursor-crosshair, .cursor-pointer, .star-border-container, .pulse-tactile, [data-interactive], [data-clickable], .radar-vertex-hitbox, .radar-vertex-group, input, select, textarea',
  hideDefaultCursor = true,
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
      targetPadding: 4,
    }),
    []
  );

  const pointerPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const currentDot = useRef({ x: 0, y: 0 });
  const currentCorners = useRef([
    { x: -16, y: -16 },
    { x: 4, y: -16 },
    { x: 4, y: 4 },
    { x: -16, y: 4 }
  ]);

  const activeTargetRef = useRef<Element | null>(null);
  const stateRef = useRef<CursorState>('idle');
  const isVisibleRef = useRef(false);
  const is3DLockRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const xSetter = useRef<any>(null);
  const ySetter = useRef<any>(null);
  const dotXSetter = useRef<any>(null);
  const dotYSetter = useRef<any>(null);

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

    // High performance quickSetters directly moving elements on GPU
    xSetter.current = gsap.quickSetter(cursor, 'x', 'px');
    ySetter.current = gsap.quickSetter(cursor, 'y', 'px');

    if (dotRef.current) {
      dotXSetter.current = gsap.quickSetter(dotRef.current, 'x', 'px');
      dotYSetter.current = gsap.quickSetter(dotRef.current, 'y', 'px');
    }

    const cornerXSetters = Array.from(cornersRef.current).map(c => gsap.quickSetter(c, 'x', 'px'));
    const cornerYSetters = Array.from(cornersRef.current).map(c => gsap.quickSetter(c, 'y', 'px'));

    // Ensure zero rotation on the root cursor wrapper
    gsap.set(cursor, { rotation: 0, opacity: 0 });

    // Instantly initialize corners to exact default coordinates on mount
    const defaultPositions = getDefaultCornerPositions();
    currentCorners.current = defaultPositions.map(p => ({ ...p }));
    Array.from(cornersRef.current).forEach((corner, i) => {
      cornerXSetters[i](defaultPositions[i].x);
      cornerYSetters[i](defaultPositions[i].y);
      gsap.set(corner, { borderColor: cursorColor });
    });

    if (dotRef.current) {
      gsap.set(dotRef.current, {
        backgroundColor: cursorColor,
        scale: 1
      });
      dotXSetter.current(0);
      dotYSetter.current(0);
    }

    stateRef.current = 'idle';
    activeTargetRef.current = null;
    is3DLockRef.current = false;

    // Transition visual theme to interaction (cyan color + glow)
    const applyInteractionStyles = () => {
      if (!cornersRef.current || !dotRef.current) return;
      Array.from(cornersRef.current).forEach(corner => {
        (corner as HTMLElement).style.borderColor = cursorColorOnTarget;
        (corner as HTMLElement).style.filter = 'drop-shadow(0 0 4px rgba(196, 255, 255, 0.7))';
      });
      (dotRef.current as HTMLElement).style.backgroundColor = cursorColorOnTarget;
      (dotRef.current as HTMLElement).style.filter = 'drop-shadow(0 0 5px rgba(196, 255, 255, 0.9))';
      gsap.to(dotRef.current, { scale: 1.35, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
    };

    // Transition visual theme to idle (white color)
    const applyIdleStyles = () => {
      if (!cornersRef.current || !dotRef.current) return;
      Array.from(cornersRef.current).forEach(corner => {
        (corner as HTMLElement).style.borderColor = cursorColor;
        (corner as HTMLElement).style.filter = 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))';
      });
      (dotRef.current as HTMLElement).style.backgroundColor = cursorColor;
      (dotRef.current as HTMLElement).style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))';
      gsap.to(dotRef.current, { scale: 1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
    };

    const setCursorToInteraction = (target: Element, is3D = false) => {
      if (activeTargetRef.current === target && stateRef.current === 'interaction') return;
      stateRef.current = 'interaction';
      activeTargetRef.current = target;
      is3DLockRef.current = is3D;
      applyInteractionStyles();
    };

    const setCursorToIdle = () => {
      if (stateRef.current === 'idle') return;
      stateRef.current = 'idle';
      activeTargetRef.current = null;
      is3DLockRef.current = false;
      applyIdleStyles();
    };

    // MAIN FLUID PHYSICS LOOP (continuous LERP on requestAnimationFrame)
    const updateCursorPhysics = () => {
      const isInteracting = stateRef.current === 'interaction' && activeTargetRef.current && document.contains(activeTargetRef.current);

      let desiredX = pointerPos.current.x;
      let desiredY = pointerPos.current.y;
      let desiredDotX = 0;
      let desiredDotY = 0;
      let targetCornerPos = defaultPositions;

      if (isInteracting && activeTargetRef.current) {
        const rect = activeTargetRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const targetCenterX = rect.left + rect.width / 2;
          const targetCenterY = rect.top + rect.height / 2;

          // Magnetic suction: 88% pulled towards target center, 12% slight elastic pointer give
          desiredX = targetCenterX + (pointerPos.current.x - targetCenterX) * 0.12;
          desiredY = targetCenterY + (pointerPos.current.y - targetCenterY) * 0.12;

          // Inner dot tactile displacement inside the magnetic box
          desiredDotX = (pointerPos.current.x - targetCenterX) * 0.22;
          desiredDotY = (pointerPos.current.y - targetCenterY) * 0.22;

          // Corners wrap around element with 4px padding
          const padding = constants.targetPadding;
          const cornerSize = constants.cornerSize;
          const wHalf = rect.width / 2 + padding;
          const hHalf = rect.height / 2 + padding;

          targetCornerPos = [
            { x: -wHalf, y: -hHalf },
            { x: wHalf - cornerSize, y: -hHalf },
            { x: wHalf - cornerSize, y: hHalf - cornerSize },
            { x: -wHalf, y: hHalf - cornerSize }
          ];
        } else {
          setCursorToIdle();
        }
      } else if (stateRef.current === 'interaction') {
        // Target was removed from DOM (e.g. modal closed)
        setCursorToIdle();
      }

      // Buttery-smooth spring / damping coefficients
      const wrapperLerp = isInteracting ? 0.25 : 0.45;
      const cornerLerp = isInteracting ? 0.22 : 0.28;
      const dotLerp = 0.35;

      // Update cursor wrapper position
      currentPos.current.x += (desiredX - currentPos.current.x) * wrapperLerp;
      currentPos.current.y += (desiredY - currentPos.current.y) * wrapperLerp;

      // Update inner dot offset
      currentDot.current.x += (desiredDotX - currentDot.current.x) * dotLerp;
      currentDot.current.y += (desiredDotY - currentDot.current.y) * dotLerp;

      // Update each corner with independent smooth spring interpolation
      for (let i = 0; i < 4; i++) {
        currentCorners.current[i].x += (targetCornerPos[i].x - currentCorners.current[i].x) * cornerLerp;
        currentCorners.current[i].y += (targetCornerPos[i].y - currentCorners.current[i].y) * cornerLerp;
      }

      // High-performance GPU render via quickSetter
      if (xSetter.current && ySetter.current) {
        xSetter.current(currentPos.current.x);
        ySetter.current(currentPos.current.y);
      }

      if (dotXSetter.current && dotYSetter.current) {
        dotXSetter.current(currentDot.current.x);
        dotYSetter.current(currentDot.current.y);
      }

      for (let i = 0; i < 4; i++) {
        cornerXSetters[i](currentCorners.current[i].x);
        cornerYSetters[i](currentCorners.current[i].y);
      }

      rafIdRef.current = requestAnimationFrame(updateCursorPhysics);
    };

    // Start RAF loop
    rafIdRef.current = requestAnimationFrame(updateCursorPhysics);

    // Universal interactive target finder: catches buttons, links, cards, icons, tabs, radar points, modals
    const findInteractiveElement = (el: Element | null): Element | null => {
      if (!el || el === document.body || el === document.documentElement) return null;

      // 1. Check direct selector match
      const matched = el.closest(targetSelector);
      if (matched) {
        if (!matched.hasAttribute('disabled') && matched.getAttribute('aria-disabled') !== 'true') {
          const rect = matched.getBoundingClientRect();
          if (rect.width > 4 && rect.height > 4 && rect.width < window.innerWidth * 0.95 && rect.height < window.innerHeight * 0.95) {
            return matched;
          }
        }
      }

      // 2. Walk up DOM tree checking pointer cursor, onclick, data-interactive
      let curr: Element | null = el;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (
          curr.hasAttribute('onclick') ||
          curr.getAttribute('data-interactive') === 'true' ||
          curr.classList.contains('cursor-target') ||
          curr.classList.contains('cursor-crosshair') ||
          curr.classList.contains('cursor-pointer') ||
          curr.classList.contains('star-border-container') ||
          curr.classList.contains('pulse-tactile')
        ) {
          const rect = curr.getBoundingClientRect();
          if (rect.width > 4 && rect.height > 4 && rect.width < window.innerWidth * 0.95 && rect.height < window.innerHeight * 0.95) {
            return curr;
          }
        }

        try {
          const style = window.getComputedStyle(curr);
          if (style.cursor === 'pointer' || style.cursor === 'crosshair') {
            const rect = curr.getBoundingClientRect();
            if (rect.width > 6 && rect.height > 6 && rect.width < window.innerWidth * 0.95 && rect.height < window.innerHeight * 0.95) {
              return curr;
            }
          }
        } catch (e) {}

        curr = curr.parentElement;
      }

      return null;
    };

    // 1. POINTER MOVE
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      if (!isVisibleRef.current && cursorRef.current) {
        isVisibleRef.current = true;
        currentPos.current = { x: e.clientX, y: e.clientY };
        gsap.to(cursorRef.current, { opacity: 1, duration: 0.1, overwrite: 'auto' });
      }

      pointerPos.current = { x: e.clientX, y: e.clientY };

      // If locked by 3D planet event, keep lock unless pointer moved far away from planet
      if (is3DLockRef.current && activeTargetRef.current) {
        const rect = activeTargetRef.current.getBoundingClientRect();
        const dist = Math.hypot(
          pointerPos.current.x - (rect.left + rect.width / 2),
          pointerPos.current.y - (rect.top + rect.height / 2)
        );
        if (dist > Math.max(rect.width, rect.height) + 100) {
          setCursorToIdle();
        }
        return;
      }

      // Check element under pointer
      const elUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
      if (!elUnderPointer) {
        if (stateRef.current === 'interaction') setCursorToIdle();
        return;
      }

      // In terminal mode, focus interaction on terminal modal if present
      if (appModeRef.current === 'terminal') {
        const terminalEl = document.getElementById('terminal-modal');
        if (terminalEl && !terminalEl.contains(elUnderPointer)) {
          if (stateRef.current === 'interaction') setCursorToIdle();
          return;
        }
      }

      // Check if hovering an interactive target
      const interactiveEl = findInteractiveElement(elUnderPointer);

      if (interactiveEl) {
        setCursorToInteraction(interactiveEl);
      } else {
        if (stateRef.current === 'interaction' && !is3DLockRef.current) {
          setCursorToIdle();
        }
      }
    };

    // 2. 3D PLANET CURSOR LOCK EVENTS (from Universe.tsx)
    const handleCursorLock = (e: Event) => {
      const customEvent = e as CustomEvent;
      const target = customEvent.detail?.target as Element;
      if (target) {
        setCursorToInteraction(target, true);
      }
    };

    const handleCursorUnlock = () => {
      if (stateRef.current === 'interaction') {
        setCursorToIdle();
      }
    };

    // 3. TACTILE CLICK / POINTERDOWN (Keeps magnetic lock intact, gives elastic pulse)
    const handlePointerDown = () => {
      if (dotRef.current) {
        gsap.fromTo(
          dotRef.current,
          { scale: 0.6 },
          { scale: stateRef.current === 'interaction' ? 1.35 : 1, duration: 0.2, ease: 'back.out(2)' }
        );
      }
    };

    const handleScroll = () => {
      if (stateRef.current === 'interaction' && !is3DLockRef.current) {
        // While scrolling, verify if element is still under mouse
        const el = document.elementFromPoint(pointerPos.current.x, pointerPos.current.y);
        const interactive = findInteractiveElement(el);
        if (!interactive) {
          setCursorToIdle();
        }
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
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('cursor-lock', handleCursorLock);
    window.addEventListener('cursor-unlock', handleCursorUnlock);
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true } as any);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cursor-lock', handleCursorLock);
      window.removeEventListener('cursor-unlock', handleCursorUnlock);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);

      document.body.classList.remove('hide-cursor');
    };
  }, [
    isMobile,
    hideDefaultCursor,
    targetSelector,
    cursorColor,
    cursorColorOnTarget,
    getDefaultCornerPositions,
    constants
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
