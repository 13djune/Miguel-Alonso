import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight, Compass } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import StarBorder from './StarBorder';
import AsciiTree from './AsciiTree';
import SystemLog from './SystemLog';
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

export default function Overlay({
  appMode,
  onEnterUniverse,
  onOpenDesigner,
  onSelectProject,
  onOpenCollections,
  activeUniverse = 'all',
  onSetUniverse,
  projects = [],
  selectedProject = null
}: OverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, language, toggleLanguage } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.animate-item', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
        onComplete: () => {
          gsap.to('.pulse-border', {
            borderColor: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.15)',
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
    <div ref={containerRef} className="w-full h-full flex flex-col p-3 md:p-8 pointer-events-none relative z-10 overflow-hidden">
      {appMode === 'terminal' && <SystemLog />}

      {/* TOP BAR: Telemetry, Target Select, Joined Universe & Mapa Buttons, Collections, Language Toggle */}
      <header className="fixed top-0 left-0 right-0 px-2 sm:px-4 md:px-8 py-1.5 sm:py-2 md:py-3 flex flex-row items-center justify-between border-b border-white animate-item z-50 pointer-events-none bg-[#070707]/80 backdrop-blur-md">
        <div className="absolute inset-0 bg-[#070707]/60 -z-10" />

        {/* Left: Target select & Unified Mapa Universo Button with Dropdown & Collections */}
        <div className="flex flex-row items-center gap-1.5 sm:gap-2.5 md:gap-4 pointer-events-auto shrink-0 flex-nowrap">
          {/* Target select badge */}
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-black bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 flex items-center gap-1.5 shrink-0 whitespace-nowrap pulse-tactile">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping"></span>
            <span className="hidden sm:inline">{t('overlay.target.select')}</span>
            <span className="sm:hidden">{language === 'es' ? 'OBJETIVO' : 'TARGET'}</span>
          </div>

          {/* Unified single [ MAPA_UNIVERSO ] button with centered dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                if (appMode === 'terminal' && onEnterUniverse) {
                  onEnterUniverse();
                }
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className={`cursor-crosshair font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 border border-white transition-colors whitespace-nowrap shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.15)] pulse-tactile ${
                isSidebarOpen
                  ? 'bg-[#c4ffff] text-black shadow-[0_0_15px_rgba(196,255,255,0.5)]'
                  : 'bg-black text-white hover:bg-white hover:text-black'
              }`}
              title={isSidebarOpen ? "Cerrar Mapa" : "Abrir Mapa Universo"}
            >
              <span className="hidden sm:inline">
                [ {isSidebarOpen
                  ? (language === 'es' ? 'CERRAR_MAPA' : 'CLOSE_MAP')
                  : t('overlay.nav.universe')} ]
              </span>
              <span className="sm:hidden">
                [ {isSidebarOpen
                  ? (language === 'es' ? 'CERRAR' : 'CLOSE')
                  : (language === 'es' ? 'MAPA' : 'MAP')} ]
              </span>
              <span className="text-[9px] sm:text-[10px]">
                {isSidebarOpen ? '▲' : '▼'}
              </span>
            </button>

            {/* Dropdown panel: Centered on screen, never cut off, completely scroll-free */}
            {isSidebarOpen && (
              <div
                id="sys-nav-modal"
                className="fixed sm:absolute top-12 sm:top-full left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2 mt-1 sm:mt-2 z-50 bg-black/95 border border-white p-2.5 sm:p-3.5 md:p-4 shadow-[0_0_35px_rgba(255,255,255,0.3)] w-[95vw] sm:w-[380px] md:w-[420px] max-w-[440px] overflow-hidden flex flex-col items-center gap-2 sm:gap-2.5 pointer-events-auto"
              >
                <div className="border-b border-white pb-1.5 flex justify-between items-center w-full">
                  <div className="font-mono text-xs sm:text-sm text-white uppercase tracking-widest flex items-center gap-2 truncate font-bold">
                    <span className="w-2 h-2 bg-[#c4ffff] animate-pulse shrink-0"></span>
                    <span className="truncate whitespace-nowrap">[ {language === 'es' ? 'MAPA_UNIVERSO // SYS.NAV' : 'UNIVERSE_MAP // SYS.NAV'} ]</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="font-mono text-xs sm:text-sm px-2 py-0.5 border border-white text-white hover:bg-white hover:text-black transition-colors cursor-crosshair shrink-0 pulse-tactile whitespace-nowrap"
                    title={language === 'es' ? 'Cerrar' : 'Close'}
                  >
                    [ ✕ ]
                  </button>
                </div>

                {/* Quick Universe Selectors - guaranteed single line and legible */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider w-full">
                  <button
                    onClick={() => onSetUniverse?.('all')}
                    className={`py-1.5 sm:py-2 px-1 sm:px-2 border transition-colors font-bold pulse-tactile text-center whitespace-nowrap truncate ${
                      activeUniverse === 'all'
                        ? 'bg-white text-black font-bold border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                        : 'bg-black text-white/80 border-white/30 hover:border-white'
                    }`}
                  >
                    [ {language === 'es' ? 'TODOS' : 'ALL'} ]
                  </button>
                  <button
                    onClick={() => onSetUniverse?.('creative')}
                    className={`py-1.5 sm:py-2 px-1 sm:px-2 border transition-colors font-bold pulse-tactile text-center whitespace-nowrap truncate ${
                      activeUniverse === 'creative'
                        ? 'bg-[#c4ffff] text-black font-bold border-[#c4ffff] shadow-[0_0_10px_rgba(196,255,255,0.5)]'
                        : 'bg-black text-white/80 border-white/30 hover:border-white'
                    }`}
                  >
                    [ {language === 'es' ? 'CREATIVO' : 'CREATIVE'} ]
                  </button>
                  <button
                    onClick={() => onSetUniverse?.('industry')}
                    className={`py-1.5 sm:py-2 px-1 sm:px-2 border transition-colors font-bold pulse-tactile text-center whitespace-nowrap truncate ${
                      activeUniverse === 'industry'
                        ? 'bg-[#c4ffff] text-black font-bold border-[#c4ffff] shadow-[0_0_10px_rgba(196,255,255,0.5)]'
                        : 'bg-black text-white/80 border-white/30 hover:border-white'
                    }`}
                  >
                    [ {language === 'es' ? 'INDUSTRIA' : 'INDUSTRY'} ]
                  </button>
                </div>

                {/* Interactive AsciiTree / Universe Map that adapts to the activeUniverse - strictly zero scroll */}
                <div className="pt-1 w-full flex justify-center overflow-hidden">
                  <AsciiTree
                    appMode="universe"
                    activeUniverse={activeUniverse}
                    onSetUniverse={onSetUniverse}
                    onSelectProject={(idx) => {
                      setIsSidebarOpen(false);
                      onSelectProject?.(idx);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collections Link - strictly kept inline with no wrap */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onOpenCollections?.();
            }}
            className="cursor-target hover:text-[#c4ffff] hover:bg-[#c4ffff]/10 px-1.5 sm:px-2.5 py-1 sm:py-1.5 border border-transparent hover:border-[#ffffff]/50 transition-all whitespace-nowrap text-white text-[10px] sm:text-xs font-mono uppercase tracking-wider shrink-0 pulse-tactile"
          >
            <span className="hidden sm:inline">[ {t('overlay.nav.collections')} ]</span>
            <span className="sm:hidden">[ {language === 'es' ? 'COLECCIONES' : 'COLLECTIONS'} ]</span>
          </a>
        </div>

        {/* Center: System Mode Indicator (Universe Mode) */}
        {appMode === 'universe' && (
          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] sm:text-xs tracking-widest uppercase text-white/90 bg-white/10 px-2.5 py-1 border border-white/30 shrink-0">
            <Compass size={12} className="text-[#c4ffff] animate-spin" style={{ animationDuration: '12s' }} />
            <span>
              SYS: {activeUniverse === 'all'
                ? (language === 'es' ? 'SYS.TODOS' : 'SYS.ALL')
                : activeUniverse === 'creative'
                  ? (language === 'es' ? 'CREATIVO.SYS' : 'CREATIVE.SYS')
                  : (language === 'es' ? 'INDUSTRIA.SYS' : 'INDUSTRY.SYS')}
            </span>
          </div>
        )}

        {/* Right: Language Switcher (swapped from bottom bar to header) */}
        <div className="flex items-center pointer-events-auto shrink-0">
          <StarBorder
            as="button"
            onClick={toggleLanguage}
            color="#c4ffff"
            speed="3s"
            className="cursor-crosshair p-0 pointer-events-auto shrink-0"
            title={language === 'es' ? 'Cambiar a Inglés' : 'Cambiar a Español'}
          >
            <div className="font-mono text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 text-white hover:bg-white hover:text-black transition-colors uppercase bg-black border border-white/60 hover:border-white whitespace-nowrap shadow-[0_0_10px_rgba(255,255,255,0.15)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span>
              <span>[ {language.toUpperCase()} ]</span>
            </div>
          </StarBorder>
        </div>
      </header>

      {/* Universe Active Tag (when single system filtered) */}
      {appMode === 'universe' && activeUniverse !== 'all' && (
        <div
          className="fixed top-14 md:top-20 left-3 md:left-8 font-mono text-[10px] sm:text-xs tracking-widest uppercase opacity-85 pointer-events-none animate-item z-40 bg-black/60 px-2.5 py-1 border border-white/20"
        >
          {activeUniverse === 'creative'
            ? (language === 'es' ? '[ SIS.CREATIVO // ACTIVO ]' : '[ CREATIVE.SYS // ACTIVE ]')
            : (language === 'es' ? '[ SIS.INDUSTRIA // ACTIVO ]' : '[ INDUSTRY.SYS // ACTIVE ]')}
        </div>
      )}

      {/* TERMINAL MODE (1st Menu): Safe vertical bounds between header and bottom terminal log */}
      {appMode === 'terminal' && (
        <main className="fixed inset-x-0 top-12 sm:top-14 bottom-24 sm:bottom-28 flex items-center justify-center pointer-events-none z-40 p-2 sm:p-4">
          <div
            id="terminal-modal"
            data-terminal="true"
            className="bg-black/95 p-3 sm:p-4 md:p-6 shadow-[8px_8px_0px_rgba(255,255,255,0.2)] border border-white pointer-events-auto cursor-default flex flex-col max-h-full overflow-y-auto w-[92vw] sm:w-[540px] md:w-[620px] lg:w-[680px] max-w-[95vw]"
          >
            <AsciiTree
              appMode="terminal"
              activeUniverse={activeUniverse}
              onSetUniverse={onSetUniverse}
              onEnterUniverse={onEnterUniverse}
              onSelectProject={(idx) => {
                if (onEnterUniverse) onEnterUniverse();
                if (onSelectProject) onSelectProject(idx);
              }}
            />
          </div>
        </main>
      )}

      {/* Real-time Telemetry Coords: positioned outside footer, floating above on the right */}
      <div
        id="debug-coords"
        className="fixed bottom-12 sm:bottom-14 md:bottom-16 right-2 sm:right-4 md:right-8 z-40 pointer-events-none text-[9px] sm:text-[10px] font-mono text-white opacity-90 tracking-wider bg-black/85 px-2 py-0.5 sm:py-1 border border-white/40 whitespace-nowrap shadow-[0_0_8px_rgba(255,255,255,0.2)] truncate max-w-[200px] sm:max-w-[320px] md:max-w-none"
      >
        {language === 'es' ? 'SIS.COORD' : 'SYS.COORDS'}
      </div>

      {/* BOTTOM BAR: Title, Subtitle, Profile & Inspect Hint */}
      <footer className="fixed bottom-0 left-0 right-0 px-2.5 sm:px-4 md:px-8 py-2 sm:py-2.5 md:pt-3 md:pb-4 flex flex-row justify-between items-center animate-item border-t border-white gap-2 z-50 pointer-events-none bg-[#070707]/90 backdrop-blur-md">
        <div className="absolute inset-0 bg-[#070707]/60 -z-10" />

        {/* Left: Designer Brand & Profile */}
        <div className="flex flex-row items-center gap-2 sm:gap-3 md:gap-4 relative pl-2 sm:pl-3 md:pl-4 border-l-2 border-white min-w-0">
          <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold tracking-wider sm:tracking-tight uppercase text-white shadow-[#ffffff]/50 drop-shadow-md leading-none whitespace-nowrap shrink-0">
            {t('overlay.title')}
          </h1>

          <p className="hidden md:inline-block text-[10px] sm:text-xs font-mono text-white tracking-widest uppercase bg-white/10 px-2 py-1 pointer-events-none border border-white whitespace-nowrap truncate max-w-[130px] sm:max-w-none">
            {t('overlay.subtitle')}
          </p>

          <button
            onClick={onOpenDesigner}
            className="pointer-events-auto font-mono text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-2.5 sm:py-1.5 text-black bg-white hover:bg-[#c4ffff] active:bg-[#c4ffff] transition-colors uppercase cursor-crosshair flex items-center gap-1.5 border border-white whitespace-nowrap shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.15)] pulse-tactile"
          >
            <span className="w-1.5 h-1.5 bg-black animate-pulse"></span>
            <span>{t('overlay.btn.profile')}</span>
          </button>
        </div>

        {/* Right: Inspect Target Hint (swapped from top bar to bottom bar) */}
        <div className="flex items-center justify-end pointer-events-auto shrink-0">
          {/* Desktop full hint */}
          <div className="hidden sm:flex text-[10px] md:text-xs tracking-wider md:tracking-widest uppercase text-white font-mono items-center gap-1.5 bg-black/80 px-2.5 py-1 sm:px-3 sm:py-1.5 border border-white/60 whitespace-nowrap shadow-[0_0_10px_rgba(255,255,255,0.15)] pointer-events-none">
            <span className="animate-pulse text-[#c4ffff]">_</span>
            <span>{t('overlay.target.inspect')}</span>
            <ArrowRight size={12} className="text-[#c4ffff] shrink-0" />
          </div>
          {/* Mobile compact hint */}
          <div className="sm:hidden text-[9px] font-mono tracking-wider uppercase text-white/90 flex items-center gap-1 bg-black/80 px-2 py-1 border border-white/40 whitespace-nowrap pointer-events-none shrink-0">
            <span className="text-[#c4ffff] animate-pulse">●</span>
            <span>{language === 'es' ? 'SIS 3D' : '3D SYS'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
