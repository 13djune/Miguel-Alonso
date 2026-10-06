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
        backgroundColor: isLit ? '#c4ffff' : 'transparent',
        color: isLit ? '#000000' : 'inherit',
        boxShadow: isLit ? '0 0 10px rgba(196, 255, 255, 0.7)' : 'none',
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
    { id: 2, num: '03', title: 'ALPHEGOR 0.1' },
    { id: 3, num: '04', title: 'ALPHEGOR 0.2' },
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
      {/* Root Node: Core / System Title */}
      <div className="flex flex-col items-center text-center">
        <span>{"┌───────────────────────┐"}</span>
        <span>
          {"│  "}
          <Clickable
            text={
              activeUniverse === 'all'
                ? (isES ? "[ SYS.VOID NÚCLEO ]" : "[  SYS.VOID CORE  ]")
                : activeUniverse === 'creative'
                  ? (isES ? "[ SYS: CREATIVO ]" : "[ SYS: CREATIVE ]")
                  : (isES ? "[ SYS: INDUSTRIA ]" : "[ SYS: INDUSTRY ]")
            }
            onClick={
              activeUniverse === 'all'
                ? handleNucleo
                : activeUniverse === 'creative'
                  ? handleCreative
                  : handleIndustry
            }
            color={activeUniverse === 'all' ? "#ffffff" : "#c4ffff"}
            className="font-bold tracking-wider"
            title={
              activeUniverse === 'all'
                ? (isES ? "Acceder a ambos sistemas" : "Access both systems")
                : activeUniverse === 'creative'
                  ? (isES ? "Sistema creativo" : "Creative system")
                  : (isES ? "Sistema industria" : "Industry system")
            }
          />
          {"  │"}
        </span>
        <span>{"└───────────┬───────────┘"}</span>
        <span className="text-white/70">{"            │"}</span>
      </div>

      {/* Vertical Branches */}
      <div className="flex flex-col w-full max-w-[340px] px-2 sm:px-4">
        {/* If ALL: Show both systems with full branches */}
        {activeUniverse === 'all' && (
          <>
            {/* Creative Branch */}
            <div className="flex items-center">
              <span className="text-[#c4ffff] font-bold select-none whitespace-pre">{"  ├──► "}</span>
              <Clickable
                text={isES ? "[ SYS: CREATIVO ]" : "[ SYS: CREATIVE ]"}
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
                <ProjectItem
                  num={p.num}
                  title={p.title}
                  onClick={() => handleProject(p.id)}
                  tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
                />
              </div>
            ))}

            {/* Stem between universes */}
            <span className="text-white/60 whitespace-pre">{"  │"}</span>

            {/* Industry Branch */}
            <div className="flex items-center">
              <span className="text-[#c4ffff] font-bold select-none whitespace-pre">{"  └──► "}</span>
              <Clickable
                text={isES ? "[ SYS: INDUSTRIA ]" : "[ SYS: INDUSTRY ]"}
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
                <ProjectItem
                  num={p.num}
                  title={p.title}
                  onClick={() => handleProject(p.id)}
                  tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
                />
              </div>
            ))}
          </>
        )}

        {/* If CREATIVE ONLY: Show ONLY creative projects */}
        {activeUniverse === 'creative' && (
          <>
            {creativeProjects.map((p, idx) => (
              <div key={p.id} className="flex items-center">
                <span className="text-[#c4ffff] font-bold select-none whitespace-pre">
                  {idx === creativeProjects.length - 1 ? "  └──► " : "  ├──► "}
                </span>
                <ProjectItem
                  num={p.num}
                  title={p.title}
                  onClick={() => handleProject(p.id)}
                  tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
                />
              </div>
            ))}
          </>
        )}

        {/* If INDUSTRY ONLY: Show ONLY industry projects */}
        {activeUniverse === 'industry' && (
          <>
            {industryProjects.map((p, idx) => (
              <div key={p.id} className="flex items-center">
                <span className="text-[#c4ffff] font-bold select-none whitespace-pre">
                  {idx === industryProjects.length - 1 ? "  └──► " : "  ├──► "}
                </span>
                <ProjectItem
                  num={p.num}
                  title={p.title}
                  onClick={() => handleProject(p.id)}
                  tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
                />
              </div>
            ))}
          </>
        )}
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
            text={
              activeUniverse === 'all'
                ? (isES ? "[ SYS.VOID NÚCLEO ]" : "[  SYS.VOID CORE  ]")
                : activeUniverse === 'creative'
                  ? (isES ? "[ SYS: CREATIVO ]" : "[ SYS: CREATIVE ]")
                  : (isES ? "[ SYS: INDUSTRIA ]" : "[ SYS: INDUSTRY ]")
            }
            onClick={
              activeUniverse === 'all'
                ? handleNucleo
                : activeUniverse === 'creative'
                  ? handleCreative
                  : handleIndustry
            }
            color={activeUniverse === 'all' ? "#ffffff" : "#c4ffff"}
            className="font-bold tracking-wider text-sm text-white"
            title={
              activeUniverse === 'all'
                ? (isES ? "Acceder a ambos sistemas en 3D" : "Access both 3D systems")
                : activeUniverse === 'creative'
                  ? (isES ? "Sistema creativo en 3D" : "Creative system in 3D")
                  : (isES ? "Sistema industria en 3D" : "Industry system in 3D")
            }
          />
          {"  │"}
        </span>
        <span>{"└───────────┬───────────┘"}</span>
        <span className="text-white/70">{"            │"}</span>
      </div>

      {activeUniverse === 'all' && (
        <>
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

          {/* Dual Column Layout: Left Creative & Right Industry */}
          <div className="grid grid-cols-2 gap-8 lg:gap-12 w-full max-w-[580px] lg:max-w-[620px] mt-1 px-4">
            {/* Left Column: Creative Universe */}
            <div className="flex flex-col">
              <div className="pb-1">
                <Clickable
                  text={isES ? "[ SYS: CREATIVO ]" : "[ SYS: CREATIVE ]"}
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
                  <ProjectItem
                    num={p.num}
                    title={p.title}
                    onClick={() => handleProject(p.id)}
                    tooltip={isES ? `Inspeccionar ${p.title}` : `Inspect ${p.title}`}
                  />
                </div>
              ))}
            </div>

            {/* Right Column: Industry Universe */}
            <div className="flex flex-col">
              <div className="pb-1">
                <Clickable
                  text={isES ? "[ SYS: INDUSTRIA ]" : "[ SYS: INDUSTRY ]"}
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
        </>
      )}

      {activeUniverse === 'creative' && (
        <div className="flex flex-col items-center mt-1">
          <span className="text-[#c4ffff] font-bold select-none">{"▼"}</span>
          <div className="flex flex-col mt-1 px-4">
            {creativeProjects.map((p, idx) => (
              <div key={p.id} className="flex items-center pl-1 whitespace-nowrap">
                <span className="text-[#c4ffff] font-bold select-none mr-1.5 whitespace-pre">
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
        </div>
      )}

      {activeUniverse === 'industry' && (
        <div className="flex flex-col items-center mt-1">
          <span className="text-[#c4ffff] font-bold select-none">{"▼"}</span>
          <div className="flex flex-col mt-1 px-4">
            {industryProjects.map((p, idx) => (
              <div key={p.id} className="flex items-center pl-1 whitespace-nowrap">
                <span className="text-[#c4ffff] font-bold select-none mr-1.5 whitespace-pre">
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
      )}
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
