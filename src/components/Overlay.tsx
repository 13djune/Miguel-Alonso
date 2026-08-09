import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Download, Eye, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LineSidebar from './LineSidebar';
import StarBorder from './StarBorder';
import AsciiTree from './AsciiTree';
import SystemLog from './SystemLog';
import { useTerminalAudio } from '../hooks/useTerminalAudio';



import { Project } from '../types';

interface OverlayProps {
  appMode?: "loading" | "terminal" | "universe";
  onEnterUniverse?: () => void;
  onOpenDesigner?: () => void;
  onSelectProject?: (index: number) => void;
  onOpenCollections?: () => void;
  activeUniverse?: 'all' | 'creative' | 'industry';
  onSetUniverse?: (universe: 'all' | 'creative' | 'industry') => void;
  projects?: Project[];
  selectedProject?: Project | null;
}

export default function Overlay({ appMode, onEnterUniverse, onOpenDesigner, onSelectProject, onOpenCollections, activeUniverse = 'all', onSetUniverse, projects = [], selectedProject = null }: OverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, language, toggleLanguage } = useLanguage();
  
  
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.animate-item', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5,
        onComplete: () => {
          gsap.to('.pulse-border', {
            borderColor: 'rgba(196, 255, 255, 0.6)',
            boxShadow: '0 0 15px rgba(196, 255, 255, 0.15)',
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            stagger: 0.2
          });
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col p-4 md:p-12 pointer-events-none relative z-10 overflow-hidden">
      
      {appMode === 'terminal' && <SystemLog />}
      

      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 px-4 pt-4 md:px-12 md:pt-12 flex flex-col md:flex-row justify-between items-start md:items-center animate-item border-b border-[#c4ffff]/30 pb-3 md:pb-6 gap-3 md:gap-0 z-50 pointer-events-none">
        <div className="absolute inset-0 bg-[#070707]/40 backdrop-blur-sm -z-10" />
        <div className="space-y-1 relative pl-2 md:pl-4 border-l-2 border-[#c4ffff]">
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tighter uppercase text-white shadow-[#c4ffff]/50 drop-shadow-md leading-none max-w-[280px] sm:max-w-none break-words whitespace-normal">
            {t('overlay.title')}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 pointer-events-auto">
            <p className="text-[9px] md:text-xs font-mono text-[#c4ffff] tracking-widest uppercase bg-[#c4ffff]/10 inline-block px-1.5 py-0.5 md:px-2 md:py-1 pointer-events-none">
              {t('overlay.subtitle')}
            </p>
            <StarBorder as="button" color="#c4ffff" speed="3s" className="cursor-target p-0 shrink-0 inline-block">
              <div 
                onClick={onOpenDesigner}
                className="font-mono text-[9px] md:text-[10px] font-bold px-3 py-1.5 text-black bg-[#c4ffff] hover:bg-white transition-colors uppercase cursor-crosshair flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-black animate-pulse"></span>
                {t('overlay.btn.profile')}
              </div>
            </StarBorder>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-row justify-between items-center w-full md:w-auto gap-2 sm:gap-4 md:gap-8 pt-2 md:pt-0">
          <nav className="flex flex-wrap sm:flex-nowrap gap-2 md:gap-8 text-[9px] md:text-xs font-mono uppercase tracking-widest text-gray-500 pointer-events-auto overflow-x-auto scrollbar-hide flex-1">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onOpenCollections?.(); }}
              className="cursor-target hover:text-[#c4ffff] hover:bg-[#c4ffff]/10 px-2 py-1 border border-transparent hover:border-[#c4ffff]/50 transition-all whitespace-nowrap"
            >[ {t('overlay.nav.collections')} ]</a>
            <a href="#" className="cursor-target hover:text-[#c4ffff] hover:bg-[#c4ffff]/10 px-2 py-1 border border-transparent hover:border-[#c4ffff]/50 transition-all whitespace-nowrap">[ {t('overlay.nav.concept')} ]</a>
            <a href="#" className="cursor-target hover:text-[#c4ffff] hover:bg-[#c4ffff]/10 px-2 py-1 border border-transparent hover:border-[#c4ffff]/50 transition-all whitespace-nowrap">[ {t('overlay.nav.archives')} ]</a>
            <a href="#" className="cursor-target text-black bg-[#c4ffff] px-2 py-1 font-bold whitespace-nowrap">[ {t('overlay.nav.universe')} ]</a>
          </nav>

          <StarBorder as="button" color="#c4ffff" speed="3s" className="cursor-target p-0 pointer-events-auto shrink-0">
            <div 
              onClick={toggleLanguage}
              className="font-mono text-[9px] md:text-[10px] font-bold px-3 py-1.5 md:px-4 md:py-2 text-[#c4ffff] hover:bg-[#c4ffff] hover:text-black transition-colors uppercase cursor-crosshair bg-black"
            >[ {language.toUpperCase()} ]</div>
          </StarBorder>
        </div>
      </header>
      {appMode === 'universe' && activeUniverse !== 'all' && (
        <div className="fixed top-24 md:top-32 left-4 md:left-12 font-mono text-[10px] md:text-[12px] tracking-widest uppercase opacity-80 pointer-events-none animate-item z-40" 
             style={{ color: activeUniverse === 'creative' ? '#ff3399' : '#00ffcc' }}>
          {activeUniverse === 'creative' ? '[ CREATIVE.SYS ]' : '[ INDUSTRY.SYS ]'}
        </div>
      )}


      {/* Main Content Layout */}
      <main className={`fixed inset-0 pt-24 pb-24 md:pt-32 md:pb-32 flex ${appMode === 'terminal' ? 'items-center justify-center' : 'items-center justify-end md:pr-12'} pointer-events-none z-40`}>
        <div className={` ${appMode === 'terminal' ? 'bg-black/95 backdrop-blur-xl p-4 md:p-10 shadow-[8px_8px_0px_rgba(196,255,255,0.2)] transform scale-100 mt-16 md:mt-0 w-[95vw] md:w-fit max-w-[95vw] overflow-x-auto' : 'hidden md:block mr-2 md:mr-4 bg-black/40 backdrop-blur-sm p-4 shadow-[4px_4px_0px_rgba(196,255,255,0.15)] max-w-[95vw] overflow-x-auto'} border border-[#c4ffff]/30 pointer-events-auto cursor-default transition-all duration-700 flex flex-col`}>
          <AsciiTree 
            appMode={appMode}
            onSetUniverse={onSetUniverse}
            onEnterUniverse={appMode === 'terminal' ? onEnterUniverse : undefined}
            onSelectProject={(idx) => {
              if (appMode === 'terminal' && onEnterUniverse) {
                onEnterUniverse();
              }
              if (onSelectProject) onSelectProject(idx);
            }} 
          />
        </div>
      </main>

      {/* Footer Timeline / Selection */}
      <footer className={`fixed bottom-0 left-0 right-0 px-4 pb-4 md:px-12 md:pb-12 flex-col md:flex-row md:items-center gap-4 md:gap-8 border-t border-[#c4ffff]/30 pt-4 animate-item z-50 pointer-events-none ${appMode === 'terminal' ? 'hidden' : 'flex'}`}>
        <div className="absolute inset-0 bg-[#070707]/40 backdrop-blur-sm -z-10" />
        <div className="hidden md:block absolute top-0 left-1/4 w-px h-2 bg-[#c4ffff]"></div>
        <div className="hidden md:block absolute top-0 left-2/4 w-px h-2 bg-[#c4ffff]"></div>
        <div className="hidden md:block absolute top-0 left-3/4 w-px h-2 bg-[#c4ffff]"></div>
        
        <div className="text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-widest text-black bg-[#c4ffff] px-3 py-1.5 flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping"></span>
          {t('overlay.target.select')}
        </div>

        <div className={`gap-2 sm:gap-x-4 md:gap-x-8 overflow-x-auto pb-2 md:pb-0 pointer-events-auto scrollbar-hide font-mono w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0 ${activeUniverse === "all" ? "grid grid-rows-2 grid-flow-col" : "flex"}`}>
          {projects.map((project, idx) => {
            const isCreative = idx < 4;
            const isIndustry = idx >= 4;
            if (activeUniverse !== 'all' && activeUniverse === 'creative' && !isCreative) return null;
            if (activeUniverse !== 'all' && activeUniverse === 'industry' && !isIndustry) return null;
            
            const isSelected = selectedProject?.id === project.id;
            
            return (
              <div 
                key={project.id}
                onClick={() => onSelectProject?.(idx)} 
                className={`cursor-target flex items-center gap-2 md:gap-3 cursor-pointer px-2 py-1 border transition-colors group shrink-0 ${isSelected ? 'text-[#c4ffff] border-[#c4ffff] hover:bg-[#c4ffff]/10 pulse-border' : 'text-gray-500 border-transparent hover:text-[#c4ffff] hover:border-[#c4ffff]/50'}`}
              >
                <span className={`text-[9px] md:text-[10px] font-bold ${isSelected ? 'group-hover:animate-pulse' : ''}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="text-[9px] md:text-[10px] tracking-widest uppercase whitespace-nowrap">
                  {project.title.replace(/^[0-9]+ /, '')}
                </span>
              </div>
            );
          })}
        </div>

        <div className="hidden md:flex ml-auto text-[10px] tracking-widest uppercase text-[#c4ffff] font-mono items-center gap-2 bg-[#c4ffff]/10 px-3 py-1 border border-[#c4ffff]/30 shrink-0">
          <span className="animate-pulse">_</span>
          <span>{t('overlay.target.inspect')}</span>
          <ArrowRight size={12} />
        </div>
      </footer>
    </div>
  );
}
