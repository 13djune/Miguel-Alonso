const fs = require('fs');

const p = (n) => " ".repeat(n);

const makeClickable = (text, onClickFn) => 
  `<span className="cursor-pointer hover:bg-[#c4ffff] hover:text-black transition-colors" onClick={${onClickFn}}>${text}</span>`;

const nucleoClick = `handleNucleo`;
const creativeClick = `handleCreative`;
const industryClick = `handleIndustry`;
const pClick = (n) => `() => handleProject(${n})`;

let vLines = [];
vLines.push("╔════════════════════════════════════════════╗");
vLines.push("║            " + "{isES ? makeClickable('[ SYS.VOID NÚCLEO ]', handleNucleo) : makeClickable('[ SYS.VOID CORE   ]', handleNucleo)}" + "             ║");
vLines.push("║         " + "{isES ? '>> ENLACE DE NAVEGACIÓN <<' : '>> NAVIGATION LINK <<     '}" + "         ║");
vLines.push("╚════════════════════════╦═══════════════════╝");
vLines.push("                         ║");
vLines.push("                         ╠══════ " + "{isES ? makeClickable('[ UNIVERSO: CREATIVO ]', handleCreative) : makeClickable('[ UNIV: CREATIVE     ]', handleCreative)}");
vLines.push("                         ║");
vLines.push("                         ║  ╠═══ &gt;" + makeClickable("SYS.VOID", pClick(0)) + "&lt;");
vLines.push("                         ║  ╠═══ &gt;" + makeClickable("NEO-GRAVITY", pClick(1)) + "&lt;");
vLines.push("                         ║  ╠═══ &gt;" + makeClickable("AURA-MESH", pClick(2)) + "&lt;");
vLines.push("                         ║  ╚═══ &gt;" + makeClickable("LUMINO-WEAVE", pClick(3)) + "&lt;");
vLines.push("                         ║");
vLines.push("                         ╚══════ " + "{isES ? makeClickable('[ UNIVERSO: INDUSTRIA ]', handleIndustry) : makeClickable('[ UNIV: INDUSTRY      ]', handleIndustry)}");
vLines.push("");
vLines.push("                            ╠═══ &gt;" + makeClickable("MONOLITHIC", pClick(4)) + "&lt;");
vLines.push("                            ╠═══ &gt;" + makeClickable("EXO-ARMOR", pClick(5)) + "&lt;");
vLines.push("                            ╠═══ &gt;" + makeClickable("MECHA-WEAR", pClick(6)) + "&lt;");
vLines.push("                            ╚═══ &gt;" + makeClickable("SYNTH-SKIN", pClick(7)) + "&lt;");

let hLines = [];
hLines.push("╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗");
hLines.push("║                                         " + "{isES ? makeClickable('[ SYS.VOID NÚCLEO ]', handleNucleo) : makeClickable('[ SYS.VOID CORE   ]', handleNucleo)}" + "                                          ║");
hLines.push("║                                      " + "{isES ? '>> TERMINAL DE NAVEGACIÓN <<' : '>> NAVIGATION TERMINAL <<   '}" + "                                     ║");
hLines.push("╚═══════════════════════════════════════════════════╦══════════════════════════════════════════════════╝");
hLines.push("                                                    ║");
hLines.push("                           ┌────────────────────────╨────────────────────────┐");
hLines.push("                           │                                                 │");
hLines.push("                           ▼                                                 ▼");
hLines.push("              ┌────────────────────────┐                        ┌────────────────────────┐");
hLines.push("              │ " + "{isES ? makeClickable('[ UNIVERSO: CREATIVO ]', handleCreative) : makeClickable('[ UNIV: CREATIVE     ]', handleCreative)}" + " │                        │ " + "{isES ? makeClickable('[ UNIVERSO: INDUSTRIA ]', handleIndustry) : makeClickable('[ UNIV: INDUSTRY      ]', handleIndustry)}" + " │");
hLines.push("              └────────────┬───────────┘                        └────────────┬───────────┘");
hLines.push("                           │                                                 │");
hLines.push("         ┌───────────┬─────┴─────┬───────────┐             ┌───────────┬─────┴─────┬───────────┐");
hLines.push("         │           │           │           │             │           │           │           │");
hLines.push("         ▼           ▼           ▼           ▼             ▼           ▼           ▼           ▼");
hLines.push("      &gt;" + makeClickable("SYS.VOID", pClick(0)) + "&lt;   &gt;" + makeClickable("NEO-GRAV", pClick(1)) + "&lt;   &gt;" + makeClickable("AURA-MSH", pClick(2)) + "&lt;   &gt;" + makeClickable("LUMINO-W", pClick(3)) + "&lt;          &gt;" + makeClickable("MONOLITH", pClick(4)) + "&lt;   &gt;" + makeClickable("EXO-ARMR", pClick(5)) + "&lt;   &gt;" + makeClickable("MECHA-WR", pClick(6)) + "&lt;   &gt;" + makeClickable("SYNTH-SK", pClick(7)) + "&lt;");

const component = `import { useLanguage } from '../context/LanguageContext';

interface AsciiTreeProps {
  appMode?: "loading" | "terminal" | "universe";
  onSelectProject?: (index: number) => void;
  onSetUniverse?: (universe: 'all' | 'creative' | 'industry') => void;
  onEnterUniverse?: () => void;
}

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
  
  const makeClickable = (text: string, onClickFn: () => void) => (
    <span className="cursor-pointer hover:bg-[#c4ffff] hover:text-black transition-colors" onClick={(e) => { e.stopPropagation(); onClickFn(); }}>{text}</span>
  );

  if (appMode === 'terminal') {
    return (
      <div className="font-mono text-[8px] sm:text-[10px] md:text-[14px] leading-tight text-[#c4ffff] opacity-90 whitespace-pre pointer-events-auto overflow-x-auto scrollbar-hide">
        <div className="flex flex-col min-w-max pb-4">
${hLines.map(l => '          <span>' + l + '</span>').join('\n')}
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono text-[8px] sm:text-[10px] md:text-[12px] leading-tight text-[#c4ffff] opacity-90 whitespace-pre pointer-events-auto overflow-x-auto scrollbar-hide">
      <div className="flex flex-col min-w-max pb-4">
${vLines.map(l => '        <span>' + l + '</span>').join('\n')}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AsciiTree.tsx', component);
console.log("Done");
