import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';

export default function IntroCurtain() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setIsReady(true), 400);
      }
      setProgress(currentProgress);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isReady && curtainRef.current) {
      gsap.to(curtainRef.current, {
        yPercent: -100,
        duration: 1.5,
        ease: 'power4.inOut',
      });
    }
  }, [isReady]);

  return (
    <div ref={curtainRef} className="absolute inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden pointer-events-none">
      <div className="font-mono text-[#ccff00] text-xs md:text-sm tracking-widest uppercase flex flex-col items-center gap-4">
        <div>{t('loading.init')}</div>
        <div className="w-48 h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#ccff00] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs">{progress.toFixed(0)}%</div>
      </div>
      <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
      <div className="scanlines"></div>
    </div>
  );
}
