import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

interface AsciiTreeProps {
  appMode?: "loading" | "terminal" | "universe";
  onSelectProject?: (index: number) => void;
  onSetUniverse?: (universe: 'all' | 'creative' | 'industry') => void;
  onEnterUniverse?: () => void;
}

const Clickable = ({ text, onClick, color = "#c4ffff" }: { text: string, onClick: () => void, color?: string }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span 
      className="cursor-pointer transition-colors inline-block whitespace-pre" 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        backgroundColor: hovered ? color : 'transparent',
        color: hovered ? '#000' : 'inherit'
      }}
    >{text}</span>
  );
};

export default function AsciiTree({ appMode, onSelectProject, onSetUniverse, onEnterUniverse }: AsciiTreeProps) {
  const { language } = useLanguage();
  const isES = language === 'es';
  
  const handleNucleo = () => {
    if (onSetUniverse) onSetUniverse('all');
    if (onEnterUniverse) onEnterUniverse();
  };
  
  const handleCreative = () => {
    if (onSetUniverse) onSetUniverse('creative');
    if (onEnterUniverse) onEnterUniverse();
  };
  
  const handleIndustry = () => {
    if (onSetUniverse) onSetUniverse('industry');
    if (onEnterUniverse) onEnterUniverse();
  };
  
  const handleProject = (idx: number) => {
    if (onSelectProject) onSelectProject(idx);
    if (onEnterUniverse) onEnterUniverse();
  };

  if (appMode === 'terminal') {
    return (
      <div className="font-mono font-light text-[8px] sm:text-[10px] md:text-[12px] xl:text-[14px] leading-tight text-[#c4ffff] opacity-90 pointer-events-auto overflow-y-auto overflow-x-auto scrollbar-hide flex justify-center w-full max-h-[60vh] md:max-h-[75vh]">
        <div className="flex flex-col items-center w-full max-w-[1200px] pb-4 px-2 md:px-8">
          <div className="text-center whitespace-pre relative pb-4 z-10">
            <span>{"┌─────────────────────┐\n"}</span>
            <span>{"│ "}{isES ? <Clickable text="[ SYS.VOID NÚCLEO ]" onClick={handleNucleo} color="#c4ffff" /> : <Clickable text="[  SYS.VOID CORE  ]" onClick={handleNucleo} color="#c4ffff" />}{" │\n"}</span>
            <span>{"└──────────┬──────────┘\n"}</span>
            <div className="absolute bottom-0 left-1/2 w-px h-4 bg-[#c4ffff] -translate-x-1/2"></div>
          </div>
          
          <div className="flex flex-col xl:flex-row w-full justify-center gap-8 xl:gap-16 relative">
            <div className="hidden xl:block absolute top-0 left-1/4 right-1/4 border-t border-[#c4ffff]"></div>
            <div className="hidden xl:block absolute top-0 left-1/4 w-px h-4 bg-[#c4ffff]"></div>
            <div className="hidden xl:block absolute top-0 right-1/4 w-px h-4 bg-[#c4ffff]"></div>
            
            {/* Creative Universe */}
            <div className="flex flex-col items-center flex-1 xl:mt-4">
              <div className="text-center whitespace-pre relative pb-4">
                <span>{"┌──────────────────────┐\n"}</span>
                <span>{"│  "}{isES ? <Clickable text="[ UNIV: CREATIVO ]" onClick={handleCreative} color="#ff3399" /> : <Clickable text="[ UNIV: CREATIVE ]" onClick={handleCreative} color="#ff3399" />}{"  │\n"}</span>
                <span>{"└──────────┬───────────┘\n"}</span>
                <div className="absolute bottom-0 left-1/2 w-px h-4 bg-[#c4ffff] -translate-x-1/2"></div>
              </div>
              
              <div className="relative w-full mt-2">
                <div className="absolute top-0 left-[12.5%] right-[12.5%] md:left-[12.5%] md:right-[12.5%] border-t border-[#c4ffff]"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 text-center pt-4">
                  {[
                    { id: 0, text: 'SYS.VOID', color: '#ff3399' },
                    { id: 1, text: 'NEO-GRAV', color: '#00ffcc' },
                    { id: 2, text: 'AURA-MSH', color: '#9933ff' },
                    { id: 3, text: 'LUMINO-W', color: '#ffcc00' }
                  ].map((p, i) => (
                    <div key={p.id} className="relative flex flex-col items-center">
                      <div className="hidden md:block absolute top-[-1rem] left-1/2 w-px h-4 bg-[#c4ffff] -translate-x-1/2"></div>
                      <div className="hidden md:block absolute top-[-0.25rem] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px]">▼</div>
                      <span className="whitespace-nowrap px-1">&gt;<Clickable text={p.text} onClick={() => handleProject(p.id)} color={p.color} />&lt;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Industry Universe */}
            <div className="flex flex-col items-center flex-1 xl:mt-4">
              <div className="text-center whitespace-pre relative pb-4">
                <span>{"┌──────────────────────┐\n"}</span>
                <span>{"│  "}{isES ? <Clickable text="[ UNIV: INDUSTRIA]" onClick={handleIndustry} color="#00ffcc" /> : <Clickable text="[ UNIV: INDUSTRY ]" onClick={handleIndustry} color="#00ffcc" />}{"  │\n"}</span>
                <span>{"└──────────┬───────────┘\n"}</span>
                <div className="absolute bottom-0 left-1/2 w-px h-4 bg-[#c4ffff] -translate-x-1/2"></div>
              </div>
              
              <div className="relative w-full mt-2">
                <div className="absolute top-0 left-[12.5%] right-[12.5%] md:left-[12.5%] md:right-[12.5%] border-t border-[#c4ffff]"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 text-center pt-4">
                  {[
                    { id: 4, text: 'MONOLITH', color: '#ff3333' },
                    { id: 5, text: 'EXO-ARMR', color: '#33ff33' },
                    { id: 6, text: 'MECHA-WR', color: '#ff9900' },
                    { id: 7, text: 'SYNTH-SK', color: '#33ccff' }
                  ].map((p, i) => (
                    <div key={p.id} className="relative flex flex-col items-center">
                      <div className="hidden md:block absolute top-[-1rem] left-1/2 w-px h-4 bg-[#c4ffff] -translate-x-1/2"></div>
                      <div className="hidden md:block absolute top-[-0.25rem] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px]">▼</div>
                      <span className="whitespace-nowrap px-1">&gt;<Clickable text={p.text} onClick={() => handleProject(p.id)} color={p.color} />&lt;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono font-light text-[7px] sm:text-[9px] md:text-[11px] xl:text-[13px] leading-tight text-[#c4ffff] opacity-90 whitespace-pre pointer-events-auto overflow-x-auto scrollbar-hide flex justify-center w-full max-w-full">
      <div className="flex flex-col min-w-max pb-4">
        <span>{"┌─────────────────────┐"}</span>
        <span>{"│ "}{isES ? <Clickable text="[ SYS.VOID NÚCLEO ]" onClick={handleNucleo} color="#c4ffff" /> : <Clickable text="[  SYS.VOID CORE  ]" onClick={handleNucleo} color="#c4ffff" />}{" │"}</span>
        <span>{"└─┬───────────────────┘"}</span>
        <span>{"  │"}</span>
        <span>{"  ├─ "}{isES ? <Clickable text="[ UNIV: CREATIVO ]" onClick={handleCreative} color="#ff3399" /> : <Clickable text="[ UNIV: CREATIVE ]" onClick={handleCreative} color="#ff3399" />}</span>
        <span>{"  │"}</span>
        <span>{"  │  ├─ "}&gt;<Clickable text="SYS.VOID" onClick={() => handleProject(0)} color="#ff3399" />&lt;</span>
        <span>{"  │  ├─ "}&gt;<Clickable text="NEO-GRAVITY" onClick={() => handleProject(1)} color="#00ffcc" />&lt;</span>
        <span>{"  │  ├─ "}&gt;<Clickable text="AURA-MESH" onClick={() => handleProject(2)} color="#9933ff" />&lt;</span>
        <span>{"  │  └─ "}&gt;<Clickable text="LUMINO-WEAVE" onClick={() => handleProject(3)} color="#ffcc00" />&lt;</span>
        <span>{"  │"}</span>
        <span>{"  └─ "}{isES ? <Clickable text="[ UNIV: INDUSTRIA]" onClick={handleIndustry} color="#00ffcc" /> : <Clickable text="[ UNIV: INDUSTRY ]" onClick={handleIndustry} color="#00ffcc" />}</span>
        <span>{"     "}</span>
        <span>{"     ├─ "}&gt;<Clickable text="MONOLITHIC" onClick={() => handleProject(4)} color="#ff3333" />&lt;</span>
        <span>{"     ├─ "}&gt;<Clickable text="EXO-ARMOR" onClick={() => handleProject(5)} color="#33ff33" />&lt;</span>
        <span>{"     ├─ "}&gt;<Clickable text="MECHA-WEAR" onClick={() => handleProject(6)} color="#ff9900" />&lt;</span>
        <span>{"     └─ "}&gt;<Clickable text="SYNTH-SKIN" onClick={() => handleProject(7)} color="#33ccff" />&lt;</span>
      </div>
    </div>
  );
}
