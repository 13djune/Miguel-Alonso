import { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { useLanguage } from '../context/LanguageContext';

export default function LoadingOverlay({ onComplete }: { onComplete: () => void }) {
  const { progress } = useProgress();
  const [stage, setStage] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    // Artificial minimum loading time for brutalist effect
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 1600);
    const t3 = setTimeout(() => {
      if (progress === 100) {
        setStage(3);
        setTimeout(onComplete, 600);
      }
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [progress, onComplete]);

  // Ensure it completes if progress reaches 100 after timeouts
  useEffect(() => {
    if (stage === 2 && progress === 100) {
      setStage(3);
      setTimeout(onComplete, 600);
    }
  }, [progress, stage, onComplete]);

  return (
    <div className="absolute inset-0 z-[1000] bg-black flex flex-col justify-center items-center text-white font-mono p-8 pointer-events-none">
      <div className="w-full max-w-md border-2 border-white/30 p-6 flex flex-col gap-4 relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />
        
        <h2 className="text-xl font-bold tracking-widest text-red-500 uppercase animate-pulse">
          {t('loading.init')}
        </h2>
        
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>{t('loading.assets')}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full h-4 border border-white/30 p-0.5">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-xs opacity-50">
          <span className={stage >= 1 ? 'text-white' : ''}>&gt; ESTABLISHING_ORBITS... {stage >= 1 ? '[OK]' : ''}</span>
          <span className={stage >= 2 ? 'text-white' : ''}>&gt; CALIBRATING_PHYSICS... {stage >= 2 ? '[OK]' : ''}</span>
          <span className={stage >= 3 ? 'text-green-500 opacity-100 font-bold' : ''}>
            {stage >= 3 ? `> ${t('loading.complete')}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
