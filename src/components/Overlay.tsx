import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
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
  isLight?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
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
  selectedProject = null,
  isLight = false,
  theme = 'dark',
  onToggleTheme,
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

          {/* Show [ MAPA_CODEX ] and [ PROY3CTOS ] only on universe mode (not on home/terminal page) */}
          {appMode !== 'terminal' && (
            <>
              {/* Unified single [ VOID_MAP ] button with centered dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsSidebarOpen(!isSidebarOpen);
                  }}
                  className={`cursor-crosshair font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider px-1.5 py-1 flex items-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap shrink-0 bg-transparent border-0 shadow-none ${
                    isSidebarOpen
                      ? 'text-[#c4ffff] drop-shadow-[0_0_8px_rgba(196,255,255,0.8)]'
                      : 'text-white hover:text-[#c4ffff]'
                  }`}
                  title={isSidebarOpen ? (language === 'es' ? "Cerrar Mapa" : "Close Map") : (language === 'es' ? "Abrir VOID_MAP" : "Open VOID_MAP")}
                >
                  <span className="hidden sm:inline">
                    [ {isSidebarOpen
                      ? (language === 'es' ? 'CERRAR_MAPA' : 'CLOSE_MAP')
                      : 'VOID_MAP'} ]
                  </span>
                  <span className="sm:hidden">
                    [ {isSidebarOpen
                      ? (language === 'es' ? 'CERRAR' : 'CLOSE')
                      : 'VOID_MAP'} ]
                  </span>
                  <span className="text-[9px] sm:text-[10px]">
                    {isSidebarOpen ? '▲' : '▼'}
                  </span>
                </button>

                {/* Dropdown panel: Matching SYS.VOID CORE design, floating, zero-scroll */}
                {isSidebarOpen && (
                  <div
                    id="sys-nav-modal"
                    className="fixed sm:absolute top-12 sm:top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-1 sm:mt-2 z-50 bg-black/90 backdrop-blur-md border border-white/20 p-2 sm:p-2.5 shadow-[0_0_35px_rgba(0,0,0,0.9)] w-[95vw] sm:w-[440px] md:w-[460px] max-w-[480px] overflow-hidden flex flex-col items-center gap-1.5 pointer-events-auto"
                  >
                    <div className="border-b border-white/20 pb-1 flex justify-between items-center w-full px-1">
                      <div className="font-mono text-[11px] sm:text-xs text-white uppercase tracking-widest flex items-center gap-2 truncate font-bold">
                        <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse shrink-0"></span>
                        <span className="truncate whitespace-nowrap">[ VOID_MAP // SYS.NAV ]</span>
                      </div>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="font-mono text-xs px-1.5 py-0.5 text-white/70 hover:text-white transition-colors cursor-crosshair shrink-0 pulse-tactile whitespace-nowrap bg-transparent border-0"
                        title={language === 'es' ? 'Cerrar' : 'Close'}
                      >
                        [ ✕ ]
                      </button>
                    </div>

                    {/* Interactive VOID_MAP tree matching SYS.VOID CORE dropdown design */}
                    <div className="w-full flex justify-center overflow-hidden">
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

              {/* PROJECTS / PROYECTOS Button - clean borderless styling leaving brackets */}
              <a
                href="#"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenCollections?.();
                }}
                className="cursor-crosshair font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider px-1.5 py-1 flex items-center transition-colors whitespace-nowrap shrink-0 bg-transparent border-0 shadow-none text-white hover:text-[#c4ffff]"
                title={t('overlay.nav.collections')}
              >
                <span>[ {t('overlay.nav.collections')} ]</span>
              </a>
            </>
          )}
        </div>

        {/* Right: System Mode Indicator (Universe Mode) placed right next to Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto shrink-0">
          {appMode === 'universe' && (
            <div className="font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider px-1.5 py-1 flex items-center whitespace-nowrap shrink-0 bg-transparent border-0 shadow-none text-white">
              <span>
                SYS: {activeUniverse === 'all'
                  ? (language === 'es' ? 'SYS.TODOS' : 'SYS.ALL')
                  : activeUniverse === 'creative'
                    ? (language === 'es' ? 'CREATIVO.SYS' : 'CREATIVE.SYS')
                    : (language === 'es' ? 'INDUSTRIA.SYS' : 'INDUSTRY.SYS')}
              </span>
            </div>
          )}

          <button
            onClick={toggleLanguage}
            className="cursor-crosshair pointer-events-auto shrink-0 font-mono text-[10px] sm:text-xs font-bold px-1.5 py-1 text-white hover:text-[#c4ffff] transition-colors uppercase whitespace-nowrap flex items-center gap-1.5 bg-transparent border-0 shadow-none"
            title={language === 'es' ? 'Cambiar a Inglés' : 'Switch to Spanish'}
          >
            <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span>
            <span>[ {language.toUpperCase()} ]</span>
          </button>
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
        <main className="fixed inset-x-0 top-11 sm:top-12 bottom-16 sm:bottom-20 flex items-center justify-center pointer-events-none z-40 p-2 sm:p-3">
          <div
            id="terminal-modal"
            data-terminal="true"
            className="bg-transparent border-none shadow-none pointer-events-auto cursor-default flex flex-col w-[92vw] sm:w-[480px] md:w-[540px] lg:w-[580px] max-w-[95vw] items-center"
          >
            <AsciiTree
              appMode="terminal"
              activeUniverse={activeUniverse}
              onSetUniverse={onSetUniverse}
              onEnterUniverse={onEnterUniverse}
              onOpenDesigner={onOpenDesigner}
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
          {appMode === 'terminal' ? (
            <>
              <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold tracking-wider sm:tracking-tight uppercase text-white shadow-[#ffffff]/50 drop-shadow-md leading-none whitespace-nowrap shrink-0">
                {t('overlay.title')}
              </h1>

              <p className="hidden md:inline-block text-[10px] sm:text-xs font-mono text-white tracking-widest uppercase bg-white/10 px-2 py-1 pointer-events-none border border-white whitespace-nowrap truncate max-w-[130px] sm:max-w-none">
                {t('overlay.subtitle')}
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] sm:text-xs font-mono text-white tracking-widest uppercase bg-white/10 px-2 py-1 pointer-events-none border border-white whitespace-nowrap truncate max-w-[160px] sm:max-w-none">
                {t('overlay.subtitle')}
              </p>

              <button
                onClick={onOpenDesigner}
                className="cursor-crosshair pointer-events-auto shrink-0 font-mono text-[10px] sm:text-xs font-bold px-1.5 py-1 text-white hover:text-[#c4ffff] transition-colors uppercase whitespace-nowrap flex items-center gap-1.5 bg-transparent border-0 shadow-none"
                title={t('overlay.btn.profile')}
              >
                <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-pulse"></span>
                <span>[ {t('overlay.btn.profile')} ]</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Inspect Target Hint (swapped from top bar to bottom bar) */}
        <div className="flex items-center justify-end pointer-events-auto shrink-0">
          {/* Desktop full hint */}
          <div className="hidden sm:flex text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase text-white items-center gap-1.5 px-1.5 py-1 whitespace-nowrap pointer-events-none bg-transparent border-0 shadow-none">
            <span>{t('overlay.target.inspect')}</span>
            <ArrowRight size={12} className="text-[#c4ffff] shrink-0" />
          </div>
          {/* Mobile compact hint */}
          <div className="sm:hidden text-[9px] font-mono font-bold tracking-wider uppercase text-white flex items-center gap-1 px-1.5 py-1 whitespace-nowrap pointer-events-none bg-transparent border-0 shadow-none">
            <span>{language === 'es' ? 'SIS 3D' : '3D SYS'}</span>
            <ArrowRight size={10} className="text-[#c4ffff] shrink-0" />
          </div>
        </div>
      </footer>
    </div>
  );
}
