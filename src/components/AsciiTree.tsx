import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

interface AsciiTreeProps {
  appMode?: "loading" | "terminal" | "universe";
  activeUniverse?: 'all' | 'creative' | 'industry';
  onSelectProject?: (index: number) => void;
  onSetUniverse?: (universe: 'all' | 'creative' | 'industry') => void;
  onEnterUniverse?: () => void;
  onOpenDesigner?: () => void;
}

const Clickable = ({
  text,
  onClick,
  color = "#ffffff",
  className = "",
  title,
}: {
  text: string;
  onClick: () => void;
  color?: string;
  className?: string;
  title?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <span
      title={title}
      className={`cursor-crosshair transition-colors duration-150 inline select-none whitespace-pre ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        backgroundColor: active || hovered
          ? color === '#ffffff'
            ? '#ffffff'
            : '#ffffff'
          : 'transparent',
        color: active || hovered ? '#000000' : 'inherit',
        boxShadow: active || hovered ? '0 0 10px rgba(255, 255, 255, 0.7)' : 'none',
      }}
    >
      {text}
    </span>
  );
};

const ProjectItem = ({
  num,
  title,
  onClick,
  tooltip,
}: {
  num: string;
  title: string;
  onClick: () => void;
  tooltip?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const isLit = hovered || active;

  return (
    <span
      title={tooltip}
      className="cursor-crosshair transition-colors duration-150 inline-flex items-center select-none whitespace-pre px-1 py-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        backgroundColor: isLit ? '#ffffff' : 'transparent',
        color: isLit ? '#000000' : 'inherit',
        boxShadow: isLit ? '0 0 10px rgba(255, 255, 255, 0.7)' : 'none',
      }}
    >
      <span
        className={`mr-1.5 transition-colors duration-150 ${
          isLit ? 'text-black font-bold' : 'text-white/50 text-[10px]'
        }`}
      >
        {num} //
      </span>
      <span className={isLit ? 'font-bold text-black' : 'font-medium'}>
        {title}
      </span>
    </span>
  );
};

/**
 * MainMenuButton: High-impact cyber-brutalist ASCII-framed button.
 * Used for both [ SYS.VOID CORE ] and [ PERFIL // VER PERFIL ] to ensure
 * they share the exact same structural design, typography, borders, and tactile interactions.
 */
const MainMenuButton = ({
  title,
  actionLabel,
  icon,
  onClick,
  isOpen,
  tooltip,
}: {
  title: string;
  actionLabel?: string;
  icon: string;
  onClick: () => void;
  isOpen?: boolean;
  tooltip?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const isLit = hovered || active || isOpen;

  return (
    <button
      type="button"
      title={tooltip}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      className="cursor-crosshair w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] select-none transition-all duration-200 flex flex-col items-center group font-mono pulse-tactile text-left"
    >
      {/* Top ASCII border line with corners */}
      <div
        className={`w-full flex items-center justify-between transition-colors duration-150 text-[10px] sm:text-xs select-none ${
          isLit ? 'text-white' : 'text-white/60'
        }`}
      >
        <span>┌</span>
        <span className="flex-1 border-t border-current mx-0.5 opacity-70"></span>
        <span>┐</span>
      </div>

      {/* Center content row with side vertical borders */}
      <div
        className={`w-full flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 sm:py-2 transition-all duration-200 border-x select-none ${
          isLit
            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255, 255, 255,0.7)]'
            : 'bg-black/90 text-white border-white/70 group-hover:border-white'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0 transition-colors ${
              isLit ? 'bg-black' : 'bg-[#ffffff] animate-pulse'
            }`}
          />
          <span className="font-bold text-[11px] sm:text-xs md:text-[13px] tracking-wider uppercase truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {actionLabel && (
            <span
              className={`text-[8px] sm:text-[9px] tracking-wider uppercase hidden sm:inline transition-colors font-semibold ${
                isLit ? 'text-black/80' : 'text-white/50'
              }`}
            >
              {actionLabel}
            </span>
          )}
          <span
            className={`font-mono text-[10px] sm:text-xs font-bold px-1.5 py-0.5 border transition-all ${
              isLit
                ? 'border-black text-black bg-black/10'
                : 'border-white/50 text-[#ffffff] bg-white/5 group-hover:border-white'
            }`}
          >
            {icon}
          </span>
        </div>
      </div>

      {/* Bottom ASCII border line with corners */}
      <div
        className={`w-full flex items-center justify-between transition-colors duration-150 text-[10px] sm:text-xs select-none ${
          isLit ? 'text-white' : 'text-white/60'
        }`}
      >
        <span>└</span>
        <span className="flex-1 border-b border-current mx-0.5 opacity-70"></span>
        <span>┘</span>
      </div>
    </button>
  );
};

export default function AsciiTree({
  appMode,
  activeUniverse = 'all',
  onSelectProject,
  onSetUniverse,
  onEnterUniverse,
  onOpenDesigner,
}: AsciiTreeProps) {
  const { language } = useLanguage();
  const isES = language === 'es';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Clicking NÚCLEO goes directly to the 2 systems in 3D
  const handleNucleo = () => {
    if (onSetUniverse) onSetUniverse('all');
    if (onEnterUniverse) onEnterUniverse();
  };

  // Clicking CREATIVO goes directly to the creative universe in 3D
  const handleCreative = () => {
    if (onSetUniverse) onSetUniverse('creative');
    if (onEnterUniverse) onEnterUniverse();
  };

  // Clicking INDUSTRIA goes directly to the industry universe in 3D
  const handleIndustry = () => {
    if (onSetUniverse) onSetUniverse('industry');
    if (onEnterUniverse) onEnterUniverse();
  };

  // Clicking a project selects it and enters 3D universe directly
  const handleProject = (idx: number) => {
    if (onSetUniverse) {
      onSetUniverse(idx < 4 ? 'creative' : 'industry');
    }
    if (onEnterUniverse) onEnterUniverse();
    if (onSelectProject) onSelectProject(idx);
  };

  const isUniverseMode = appMode === 'universe';

  const creativeProjects = [
    { id: 0, num: '01', title: 'REGNUM' },
    { id: 1, num: '02', title: 'P3RMFRST' },
    { id: 2, num: '03', title: 'ALPHEGOR 0.1' },
    { id: 3, num: '04', title: 'ALPHEGOR 0.2' },
  ];

  const industryProjects = [
    { id: 4, num: '05', title: 'LOOK-BOOK' },
    { id: 5, num: '06', title: isES ? 'PANTALONES' : 'TROUSERS' },
    { id: 6, num: '07', title: 'OUTERWEAR' },
    { id: 7, num: '08', title: isES ? 'ACCESORIOS' : 'ACCESSORIES' },
  ];

  // Shared branching dropdown content - identical for both SYS.VOID CORE on home and VOID_MAP in 3D map
  const renderBranches = (isUniverseDropdown = false) => (
    <div className="w-full flex flex-col items-center select-none font-mono">
      {/* Top stem */}
      <div className="flex flex-col items-center text-white/60 font-mono text-[10px] select-none leading-none my-0.5">
        <span>│</span>
        <span className="text-[#ffffff] font-bold">▼</span>
      </div>

      {/* Quick Explore 3D Portfolio Button */}
      <button
        type="button"
        onClick={handleNucleo}
        className={`font-mono text-[10px] sm:text-xs font-bold tracking-wider px-2.5 sm:px-3 py-1 sm:py-1.5 border uppercase flex items-center justify-center gap-1.5 w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] pulse-tactile my-0.5 cursor-crosshair transition-all ${
          activeUniverse === 'all' && isUniverseDropdown
            ? 'bg-[#ffffff] text-black border-[#ffffff] shadow-[0_0_15px_rgba(255, 255, 255,0.7)]'
            : 'border-[#ffffff] bg-black/90 text-[#ffffff] hover:bg-[#ffffff] hover:text-black shadow-[0_0_10px_rgba(255, 255, 255,0.25)] hover:shadow-[0_0_15px_rgba(255, 255, 255,0.6)]'
        }`}
        title={isES ? "Acceder al portfolio en 3D" : "Access 3D portfolio"}
      >
        <span className="w-1.5 h-1.5 bg-current animate-ping"></span>
        <span>{isES ? '[ ✦ EXPLORAR TODO EL PORTFOLIO 3D ]' : '[ ✦ EXPLORE FULL 3D PORTFOLIO ]'}</span>
      </button>
      <span className="text-[8px] sm:text-[9px] font-mono text-white/60 bg-black/60 px-2 py-0.5 tracking-wider uppercase text-center mb-0.5 select-none border border-white/10">
        {isES ? '> ACCESO DIRECTO // NAVEGACIÓN LIBRE' : '> DIRECT ACCESS // FREE NAVIGATION'}
      </span>

      {/* Desktop Branching (Side-by-side columns) */}
      <div className="hidden md:flex flex-col items-center w-full max-w-[440px]">
        <div className="w-full flex flex-col items-center select-none leading-none my-0.5">
          <span className="text-white/60 font-mono text-[10px]">{"│"}</span>
          <div className="w-full flex items-center justify-between px-8 text-white/60 font-mono text-[10px]">
            <span>{"┌────────────────"}</span>
            <span>{"┴"}</span>
            <span>{"────────────────┐"}</span>
          </div>
          <div className="w-full flex items-center justify-between px-8 text-[#ffffff] font-bold font-mono text-[10px]">
            <span>{"▼"}</span>
            <span>{"▼"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full px-1 font-mono text-[10px] sm:text-[11px]">
          {/* Left: Creative */}
          <div
            className={`flex flex-col bg-black/90 backdrop-blur-md p-1.5 sm:p-2 border transition-all ${
              activeUniverse === 'creative' && isUniverseDropdown
                ? 'border-[#ffffff] shadow-[0_0_20px_rgba(255, 255, 255,0.35)]'
                : 'border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-0.5 mb-1">
              <Clickable
                text={isES ? "[ SYS: CREATIVO ]" : "[ SYS: CREATIVE ]"}
                onClick={handleCreative}
                color="#ffffff"
                className={`font-bold tracking-wider text-[11px] ${
                  activeUniverse === 'creative' && isUniverseDropdown ? 'text-[#ffffff] underline' : 'text-[#ffffff]'
                }`}
                title={isES ? "Acceder al sistema creativo en 3D" : "Access creative system in 3D"}
              />
              <span className="text-[8px] text-white/50 uppercase">
                {isES ? 'MODA' : 'FASHION'}
              </span>
            </div>
            {creativeProjects.map((p, idx) => (
              <div key={p.id} className="flex items-center py-0.25 whitespace-nowrap">
                <span className="text-[#ffffff] font-bold select-none mr-1 text-[10px]">
                  {idx === creativeProjects.length - 1 ? "└──►" : "├──►"}
                </span>
                <ProjectItem
                  num={p.num}
                  title={p.title}
                  onClick={() => handleProject(p.id)}
                  tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
                />
              </div>
            ))}
          </div>

          {/* Right: Industry */}
          <div
            className={`flex flex-col bg-black/90 backdrop-blur-md p-1.5 sm:p-2 border transition-all ${
              activeUniverse === 'industry' && isUniverseDropdown
                ? 'border-[#ffffff] shadow-[0_0_20px_rgba(255, 255, 255,0.35)]'
                : 'border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-0.5 mb-1">
              <Clickable
                text={isES ? "[ SYS: INDUSTRIA ]" : "[ SYS: INDUSTRY ]"}
                onClick={handleIndustry}
                color="#ffffff"
                className={`font-bold tracking-wider text-[11px] ${
                  activeUniverse === 'industry' && isUniverseDropdown ? 'text-[#ffffff] underline' : 'text-[#ffffff]'
                }`}
                title={isES ? "Acceder al sistema industria en 3D" : "Access industry system in 3D"}
              />
              <span className="text-[8px] text-white/50 uppercase">
                {isES ? 'CAD/TECH' : 'CAD/TECH'}
              </span>
            </div>
            {industryProjects.map((p, idx) => (
              <div key={p.id} className="flex items-center py-0.25 whitespace-nowrap">
                <span className="text-[#ffffff] font-bold select-none mr-1 text-[10px]">
                  {idx === industryProjects.length - 1 ? "└──►" : "├──►"}
                </span>
                <ProjectItem
                  num={p.num}
                  title={p.title}
                  onClick={() => handleProject(p.id)}
                  tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Branching (Stacked lists) */}
      <div className="md:hidden flex flex-col w-full max-w-[320px] px-2 py-1.5 bg-black/90 backdrop-blur-md border border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-mono text-[10px] sm:text-[11px] mt-0.5 select-none">
        {/* Creative branch */}
        <div className="flex items-center mt-0.5">
          <span className="text-[#ffffff] font-bold mr-1">├──►</span>
          <Clickable
            text={isES ? "[ SYS: CREATIVO ]" : "[ SYS: CREATIVE ]"}
            onClick={handleCreative}
            color="#ffffff"
            className="font-bold tracking-wider text-[11px] text-[#ffffff]"
            title={isES ? "Acceder al sistema creativo" : "Access creative system"}
          />
        </div>
        {creativeProjects.map((p, idx) => (
          <div key={p.id} className="flex items-center pl-3 py-0.25">
            <span className="text-[#ffffff] font-bold mr-1 text-[10px]">
              {idx === creativeProjects.length - 1 ? "└──►" : "├──►"}
            </span>
            <ProjectItem
              num={p.num}
              title={p.title}
              onClick={() => handleProject(p.id)}
              tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
            />
          </div>
        ))}

        {/* Industry branch */}
        <div className="flex items-center mt-1">
          <span className="text-[#ffffff] font-bold mr-1">└──►</span>
          <Clickable
            text={isES ? "[ SYS: INDUSTRIA ]" : "[ SYS: INDUSTRY ]"}
            onClick={handleIndustry}
            color="#ffffff"
            className="font-bold tracking-wider text-[11px] text-[#ffffff]"
            title={isES ? "Acceder al sistema industria" : "Access industry system"}
          />
        </div>
        {industryProjects.map((p, idx) => (
          <div key={p.id} className="flex items-center pl-3 py-0.25">
            <span className="text-[#ffffff] font-bold mr-1 text-[10px]">
              {idx === industryProjects.length - 1 ? "└──►" : "├──►"}
            </span>
            <ProjectItem
              num={p.num}
              title={p.title}
              onClick={() => handleProject(p.id)}
              tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // 2. TERMINAL SCREEN: Intuitive Portfolio Hub
  // Features SYS.VOID CORE, an expanding dropdown that displaces the PERFIL button downwards,
  // with identical button design for SYS.VOID and PERFIL.
  if (appMode === 'terminal') {
    return (
      <div className="w-full flex flex-col items-center select-none py-0.5">
        {/* Terminal Header Info */}
        <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] flex items-center justify-between border-b border-white/30 pb-1 mb-2 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-white/80">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#ffffff] animate-pulse"></span>
            <span className="font-bold text-white">[ SYS.TERMINAL // CORE ]</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] text-white/60">
            <span>DIR: 01</span>
            <span>//</span>
            <span className="text-[#ffffff] font-bold">ONLINE</span>
          </div>
        </div>

        {/* Central Vertical Stack: SYS.VOID CORE -> Dropdown (displaces down) -> PERFIL */}
        <div className="w-full flex flex-col items-center">
          {/* 1. Primary Button: SYS.VOID CORE */}
          <MainMenuButton
            title={isES ? '[ SYS.VOID NÚCLEO ]' : '[ SYS.VOID CORE ]'}
            actionLabel={isES ? (isDropdownOpen ? 'CERRAR' : 'DESPLEGAR') : (isDropdownOpen ? 'CLOSE' : 'EXPAND')}
            icon={isDropdownOpen ? '▲' : '▼'}
            isOpen={isDropdownOpen}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            tooltip={isES ? 'Desplegar navegación del universo 3D' : 'Expand 3D universe navigation'}
          />

          {/* 2. Collapsible Dropdown: Unfolds downwards, smoothly displacing the button below */}
          <div
            className={`w-full overflow-hidden transition-all duration-400 ease-in-out flex flex-col items-center ${
              isDropdownOpen
                ? 'max-h-[500px] opacity-100 my-1 scale-100'
                : 'max-h-0 opacity-0 my-0 scale-95 pointer-events-none'
            }`}
          >
            {renderBranches(false)}

            {/* Stem connecting downwards to the displaced Profile button */}
            <div className="flex flex-col items-center text-white/60 font-mono text-[10px] select-none leading-none my-0.5">
              <span>│</span>
              <span className="text-[#ffffff] font-bold">▼</span>
            </div>
          </div>

          {/* Stem when closed */}
          {!isDropdownOpen && (
            <div className="flex flex-col items-center text-white/50 font-mono text-[10px] select-none my-1">
              <span>│</span>
            </div>
          )}

          {/* 3. Secondary Button: PERFIL (Same design as SYS.VOID CORE, displaced downwards when dropdown expands) */}
          <MainMenuButton
            title={isES ? '[ PERFIL // VER PERFIL ]' : '[ PROFILE // VIEW PROFILE ]'}
            actionLabel={isES ? 'EL_DISEÑADOR' : 'THE_DESIGNER'}
            icon="→"
            onClick={() => {
              if (onOpenDesigner) onOpenDesigner();
            }}
            tooltip={isES ? 'Abrir perfil del diseñador Miguel Alonso' : 'Open designer profile for Miguel Alonso'}
          />
        </div>

        {/* Bottom Helper Hint */}
        <div className="mt-2 pt-1 border-t border-white/20 w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] text-center font-mono text-[8px] sm:text-[9px] text-white/50 tracking-wider uppercase select-none">
          {isES
            ? '> CLICK EN SYS.VOID PARA DESPLEGAR PROYECTOS // PERFIL PARA DATOS'
            : '> CLICK SYS.VOID TO EXPAND PROJECTS // PROFILE FOR DETAILS'}
        </div>
      </div>
    );
  }

  // 3. UNIVERSE / VOID_MAP DROPDOWN: Uses the exact same dropdown design as SYS.VOID CORE
  return renderBranches(true);
}
