import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import BrandLogo from './BrandLogo';

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
    <div ref={curtainRef} className="absolute inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden pointer-events-auto px-4">
      <div className="font-mono text-[#ffffff] text-xs md:text-sm tracking-widest uppercase flex flex-col items-center gap-4 relative z-10 w-full max-w-[500px]">
        <div>{t('loading.init')}</div>
        <div className="w-48 sm:w-60 h-1 bg-white/10 mt-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#ffffff] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 text-xs">{progress.toFixed(0)}%</div>
        
        {isReady && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="w-36 sm:w-44 md:w-48 max-w-[70vw] text-[#ffffff] vtc-effect flex items-center justify-center">
              <BrandLogo className="w-full h-auto text-white" />
            </div>
            <button 
              type="button"
              onClick={handleStart}
              className="px-6 py-2.5 border border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-black transition-all font-bold tracking-widest text-xs uppercase cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
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
