import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

interface AsciiTreeProps {
  appMode?: "loading" | "terminal" | "universe";
  activeUniverse?: 'all' | 'creative' | 'industry';
  onSelectProject?: (index: number) => void;
  onSetUniverse?: (universe: 'all' | 'creative' | 'industry') => void;
  onEnterUniverse?: () => void;
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
            : '#c4ffff'
          : 'transparent',
        color: active || hovered ? '#000000' : 'inherit',
        boxShadow: active || hovered ? '0 0 10px rgba(196, 255, 255, 0.7)' : 'none',
      }}
    >
      {text}
    </span>
  );
};

export default function AsciiTree({
  appMode,
  activeUniverse = 'all',
  onSelectProject,
  onSetUniverse,
  onEnterUniverse,
}: AsciiTreeProps) {
  const { language } = useLanguage();
  const isES = language === 'es';

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
    { id: 2, num: '03', title: 'AURA-MESH' },
    { id: 3, num: '04', title: 'LUMINO-WEAVE' },
  ];

  const industryProjects = [
    { id: 4, num: '05', title: 'LOOK-BOOK' },
    { id: 5, num: '06', title: isES ? 'PANTALONES' : 'TROUSERS' },
    { id: 6, num: '07', title: 'OUTERWEAR' },
    { id: 7, num: '08', title: isES ? 'ACCESORIOS' : 'ACCESSORIES' },
  ];

  // 1. MOBILE / DROPDOWN VERTICAL SCHEMATIC
  const verticalTree = (
    <div
      className={`font-mono text-white opacity-95 whitespace-pre pointer-events-auto overflow-hidden flex flex-col items-center w-full select-none ${
        isUniverseMode
          ? 'text-[10px] sm:text-[11px] leading-[1.35]'
          : 'text-xs leading-normal sm:leading-relaxed md:hidden'
      }`}
    >
      {/* Root Node: Core */}
      <div className="flex flex-col items-center text-center">
        <span>{"┌───────────────────────┐"}</span>
        <span>
          {"│  "}
          <Clickable
            text={isES ? "[ SYS.VOID NÚCLEO ]" : "[  SYS.VOID CORE  ]"}
            onClick={handleNucleo}
            color="#ffffff"
            className="font-bold tracking-wider"
            title={isES ? "Acceder a ambos sistemas" : "Access both systems"}
          />
          {"  │"}
        </span>
        <span>{"└───────────┬───────────┘"}</span>
        <span className="text-white/70">{"            │"}</span>
      </div>

      {/* Vertical Branches */}
      <div className="flex flex-col w-full max-w-[340px] px-2 sm:px-4">
        {/* Creative Branch */}
        <div className="flex items-center">
          <span className="text-[#c4ffff] font-bold select-none whitespace-pre">{"  ├──► "}</span>
          <Clickable
            text={isES ? "[ UNIV: CREATIVO ]" : "[ UNIV: CREATIVE ]"}
            onClick={handleCreative}
            color="#c4ffff"
            className="font-bold tracking-wider text-xs text-[#c4ffff]"
            title={isES ? "Acceder al sistema creativo" : "Access creative system"}
          />
        </div>
        <span className="text-white/60 whitespace-pre">{"  │    │"}</span>

        {creativeProjects.map((p, idx) => (
          <div key={p.id} className="flex items-center">
            <span className="text-[#c4ffff] font-bold select-none whitespace-pre">
              {idx === creativeProjects.length - 1 ? "  │    └──► " : "  │    ├──► "}
            </span>
            <span className="text-white/50 text-[10px] select-none mr-1.5">{p.num} //</span>
            <Clickable
              text={p.title}
              onClick={() => handleProject(p.id)}
              color="#c4ffff"
              className="font-medium hover:font-bold"
              title={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
            />
          </div>
        ))}

        {/* Stem between universes */}
        <span className="text-white/60 whitespace-pre">{"  │"}</span>

        {/* Industry Branch */}
        <div className="flex items-center">
          <span className="text-[#c4ffff] font-bold select-none whitespace-pre">{"  └──► "}</span>
          <Clickable
            text={isES ? "[ UNIV: INDUSTRIA ]" : "[ UNIV: INDUSTRY ]"}
            onClick={handleIndustry}
            color="#c4ffff"
            className="font-bold tracking-wider text-xs text-[#c4ffff]"
            title={isES ? "Acceder al sistema industria" : "Access industry system"}
          />
        </div>
        <span className="text-white/60 whitespace-pre">{"       │"}</span>

        {industryProjects.map((p, idx) => (
          <div key={p.id} className="flex items-center">
            <span className="text-[#c4ffff] font-bold select-none whitespace-pre">
              {idx === industryProjects.length - 1 ? "       └──► " : "       ├──► "}
            </span>
            <span className="text-white/50 text-[10px] select-none mr-1.5">{p.num} //</span>
            <Clickable
              text={p.title}
              onClick={() => handleProject(p.id)}
              color="#c4ffff"
              className="font-medium hover:font-bold"
              title={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // 2. DESKTOP HORIZONTAL SCHEMATIC (Shown ONLY on desktop in terminal mode)
  const desktopHorizontalTree = (
    <div className="hidden md:flex font-mono text-xs md:text-[13px] leading-relaxed text-white opacity-95 pointer-events-auto flex-col items-center w-full select-none py-2">
      {/* Centered Root Core Node */}
      <div className="flex flex-col items-center text-center">
        <span>{"┌───────────────────────┐"}</span>
        <span>
          {"│  "}
          <Clickable
            text={isES ? "[ SYS.VOID NÚCLEO ]" : "[  SYS.VOID CORE  ]"}
            onClick={handleNucleo}
            color="#ffffff"
            className="font-bold tracking-wider text-sm text-white"
            title={isES ? "Acceder a ambos sistemas en 3D" : "Access both 3D systems"}
          />
          {"  │"}
        </span>
        <span>{"└───────────┬───────────┘"}</span>
        <span className="text-white/70">{"            │"}</span>
      </div>

      {/* Horizontal Branching Connector */}
      <div className="w-full max-w-[540px] lg:max-w-[580px] flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-10 lg:px-12 text-white/60 select-none">
          <span>{"┌────────────────"}</span>
          <span>{"┴"}</span>
          <span>{"────────────────┐"}</span>
        </div>
        <div className="w-full flex items-center justify-between px-10 lg:px-12 text-[#c4ffff] font-bold select-none">
          <span>{"▼"}</span>
          <span>{"▼"}</span>
        </div>
      </div>

      {/* Dual Column Layout: Left Creative & Right Industry (No box borders, clean schematic) */}
      <div className="grid grid-cols-2 gap-8 lg:gap-12 w-full max-w-[580px] lg:max-w-[620px] mt-1 px-4">
        {/* Left Column: Creative Universe */}
        <div className="flex flex-col">
          <div className="pb-1">
            <Clickable
              text={isES ? "[ UNIV: CREATIVO ]" : "[ UNIV: CREATIVE ]"}
              onClick={handleCreative}
              color="#c4ffff"
              className="font-bold tracking-wider text-xs md:text-sm text-[#c4ffff]"
              title={isES ? "Acceder al sistema creativo en 3D" : "Access creative system in 3D"}
            />
          </div>
          <span className="text-white/60 pl-1 whitespace-pre">{"│"}</span>
          {creativeProjects.map((p, idx) => (
            <div key={p.id} className="flex items-center pl-1 whitespace-nowrap">
              <span className="text-[#c4ffff] font-bold select-none mr-1.5 whitespace-pre">
                {idx === creativeProjects.length - 1 ? "└──►" : "├──►"}
              </span>
              <span className="text-white/50 text-[11px] select-none mr-1.5">{p.num} //</span>
              <Clickable
                text={p.title}
                onClick={() => handleProject(p.id)}
                color="#c4ffff"
                className="font-medium hover:font-bold"
                title={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
              />
            </div>
          ))}
        </div>

        {/* Right Column: Industry Universe */}
        <div className="flex flex-col">
          <div className="pb-1">
            <Clickable
              text={isES ? "[ UNIV: INDUSTRIA ]" : "[ UNIV: INDUSTRY ]"}
              onClick={handleIndustry}
              color="#c4ffff"
              className="font-bold tracking-wider text-xs md:text-sm text-[#c4ffff]"
              title={isES ? "Acceder al sistema industria en 3D" : "Access industry system in 3D"}
            />
          </div>
          <span className="text-white/60 pl-1 whitespace-pre">{"│"}</span>
          {industryProjects.map((p, idx) => (
            <div key={p.id} className="flex items-center pl-1 whitespace-nowrap">
              <span className="text-[#c4ffff] font-bold select-none mr-1.5 whitespace-pre">
                {idx === industryProjects.length - 1 ? "└──►" : "├──►"}
              </span>
              <span className="text-white/50 text-[11px] select-none mr-1.5">{p.num} //</span>
              <Clickable
                text={p.title}
                onClick={() => handleProject(p.id)}
                color="#c4ffff"
                className="font-medium hover:font-bold"
                title={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (appMode === 'terminal') {
    return (
      <>
        {verticalTree}
        {desktopHorizontalTree}
      </>
    );
  }

  return verticalTree;
}
