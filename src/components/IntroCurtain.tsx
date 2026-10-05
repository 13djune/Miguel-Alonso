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
      // Progressive tactile boot loading steps
      currentProgress += Math.random() * 2.2 + 0.9;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        // Do not auto-start. Let user click.
        setIsReady(true);
      }
      setProgress(currentProgress);
    }, 45);
    
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

  const norm = Math.min(1, Math.max(0, progress / 100));
  const bootDuration = `${(0.08 + Math.pow(norm, 2.4) * 3.92).toFixed(2)}s`;

  return (
    <div ref={curtainRef} className="absolute inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden pointer-events-auto px-4 select-none">
      {/* Central anchor keeping the logo perfectly centered on the screen */}
      <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-[500px]">
        {/* LOGO: Pulso de gloom e intensidad sincronizado con la barra de carga */}
        <div 
          className={`w-36 sm:w-44 md:w-48 max-w-[70vw] text-[#ffffff] flex items-center justify-center ${isReady ? 'vtc-effect' : 'vtc-booting'}`}
          style={!isReady ? ({
            '--boot-norm': norm.toFixed(3),
            '--boot-duration': bootDuration,
          } as React.CSSProperties) : undefined}
        >
          <BrandLogo className="w-full h-auto text-white" />
        </div>

        {/* ELEMENTOS POR DEBAJO DEL LOGO */}
        <div className="absolute top-full mt-5 flex flex-col items-center gap-2 w-full font-mono text-[#ffffff]">
          {/* TEXTO INICIALIZANDO NÚCLEO: Situado justo entre el logo y la barra de carga */}
          <div className="text-xs md:text-sm tracking-widest uppercase text-center whitespace-nowrap animate-pulse mb-1">
            {t('loading.init')}
          </div>

          {/* Barra de progreso */}
          <div className="w-48 sm:w-60 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ffffff] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Porcentaje justo debajo de la barra */}
          <div className="text-xs tracking-widest mt-1">
            {progress.toFixed(0)}%
          </div>

          {/* Botón de interacción INICIAR sistema debajo de todo lo demás */}
          <div className="mt-4 flex items-center justify-center min-h-[44px]">
            {isReady && (
              <button 
                type="button"
                onClick={handleStart}
                className="px-6 py-2.5 border border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-black transition-all font-bold tracking-widest text-xs uppercase cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] animate-fade-in"
              >
                [ {language === 'es' ? 'INICIAR_SISTEMA' : 'START_SYSTEM'} ]
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none"></div>
      <div className="scanlines pointer-events-none"></div>
    </div>
  );
}
