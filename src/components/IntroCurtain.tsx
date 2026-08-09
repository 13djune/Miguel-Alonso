import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';

export default function IntroCurtain({ onComplete }: { onComplete?: () => void }) {
  const curtainRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        // Do not auto-start. Let user click.
        setIsReady(true);
      }
      setProgress(currentProgress);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (onComplete) onComplete();
    if (curtainRef.current) {
      gsap.to(curtainRef.current, {
        yPercent: -100,
        duration: 1.5,
        ease: 'power4.inOut'
      });
    }
  };

  return (
    <div ref={curtainRef} className="absolute inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden pointer-events-auto">
      <div className="font-mono text-[#c4ffff] text-xs md:text-sm tracking-widest uppercase flex flex-col items-center gap-4 relative z-10">
        <div>{t('loading.init')}</div>
        <div className="w-48 h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#c4ffff] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs">{progress.toFixed(0)}%</div>
        
        {isReady && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="text-[#c4ffff] animate-pulse vtc-effect mix-blend-screen">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32"><path fill="currentColor" d="M30.47 9.15H32v1.52h-1.53Zm0-4.58H32V6.1h-1.53Zm0-4.57H32v1.53h-1.53Zm-1.52 13.72h1.52v1.52h-1.52Zm0-7.62h1.52v1.52h-1.52Zm0-4.57h1.52v1.52h-1.52Zm-1.52 13.71h1.52v1.53h-1.52Zm0-7.62h1.52v1.53h-1.52Zm0-4.57h1.52v1.52h-1.52ZM25.9 16.77h1.53v3.04H25.9Zm0-6.1h1.53v1.52H25.9Zm0-6.1h1.53V6.1H25.9Zm0-4.57h1.53v1.53H25.9Zm-1.52 19.81h1.52v3.05h-1.52Zm0-7.62h1.52v1.53h-1.52Zm0-6.09h1.52v1.52h-1.52Zm0-4.57h1.52v1.52h-1.52Zm-1.53 21.33h1.53v3.05h-1.53Zm0-19.81h1.53v1.52h-1.53Zm-1.52 12.19h1.52v1.53h-1.52Zm0-6.09h1.52v1.52h-1.52Zm0-9.15h1.52v1.53h-1.52Zm-1.52 25.91h3.04v1.52h-3.04Zm0-21.34h1.52V6.1h-1.52Zm0-3.04h1.52v1.52h-1.52Zm-1.53 25.9h1.53v1.53h-1.53Zm0-15.24h1.53v1.53h-1.53Zm-1.52-4.57h1.52v1.53h-1.52Zm0-6.09h1.52v1.52h-1.52Zm-1.52 27.43h3.04v1.52h-3.04Zm0-19.81h1.52v1.52h-1.52Zm-1.53-6.1h3.05v1.52h-3.05ZM9.14 30.48h6.1V32h-6.1Zm3.05-25.91h1.52V6.1h-1.52ZM9.14 6.1h3.05v1.52H9.14Zm6.1 21.33v-1.52h1.52v-1.53h1.52v-1.52h1.53v-6.09h-1.53v-1.53h-1.52v-1.52h-1.52v-1.53h-6.1v1.53H7.62v1.52H6.09v1.53H4.57v6.09h1.52v1.52h1.53v1.53h1.52v1.52Zm-3.05-12.19h3.05v1.53h1.52v1.52h1.52v3.05h-1.52v-3.05h-1.52v-1.52h-3.05ZM4.57 28.96h4.57v1.52H4.57ZM6.09 7.62h3.05v1.53H6.09ZM4.57 9.15h1.52v1.52H4.57ZM3.05 27.43h1.52v1.53H3.05Zm0-16.76h1.52v1.52H3.05ZM1.52 24.38h1.53v3.05H1.52Zm0-12.19h1.53v3.05H1.52ZM0 15.24h1.52v9.14H0Z"/></svg>
            </div>
            <button 
              onClick={handleStart}
              className="px-6 py-2 border border-[#c4ffff] text-[#c4ffff] hover:bg-[#c4ffff] hover:text-black transition-colors font-bold tracking-widest text-xs uppercase cursor-pointer"
            >
              [ {language === 'es' ? 'INICIAR_SISTEMA' : 'START_SYSTEM'} ]
            </button>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none"></div>
      <div className="scanlines pointer-events-none"></div>
    </div>
  );
}
