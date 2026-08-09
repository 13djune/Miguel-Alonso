import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

        const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && cursorInnerRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: 'power2.out',
        });
        gsap.to(cursorInnerRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0,
        });
      }
      
      const target = e.target as HTMLElement;
      const isInteractiveDOM = target?.closest?.('button, a, .cursor-target, [role="button"]');
      const isPlanet = document.body.style.cursor === 'crosshair' || document.body.style.cursor === 'pointer';
      
      if (isInteractiveDOM || isPlanet) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    

    

    window.addEventListener('mousemove', handleMouseMove);
    

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      
      
    };
  }, []);

  return (
    <>
      {/* Outer Technical Frame */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9999] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
      >
        <div 
          className={`w-full h-full relative transition-all duration-200 ${
            isHovering ? 'scale-125 rotate-90 opacity-100 text-[#c4ffff]' : 'scale-100 rotate-0 opacity-70 text-white'
          }`}
        >
          {/* Crosshairs lines */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-current" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3 bg-current" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-px bg-current" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-px bg-current" />
          
          {/* Corner borders for more HUD feel */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />
        </div>
      </div>
      {/* Inner Dot */}
      <div 
        ref={cursorInnerRef}
        className={`fixed top-0 left-0 w-1 h-1 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-screen transition-colors ${isHovering ? 'bg-[#c4ffff]' : 'bg-white'}`}
      />
    </>
  );
}
