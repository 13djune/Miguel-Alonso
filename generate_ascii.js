const fs = require('fs');

const nucleoText = "{isES ? '[ SYS.VOID NÚCLEO ]' : '[ SYS.VOID CORE   ]'}";
const terminalNav = "{isES ? '>> TERMINAL DE NAVEGACIÓN <<' : '>> NAVIGATION TERMINAL <<   '}";
const creativeText = "{isES ? '[ UNIV: CREATIVO  ]' : '[ UNIV: CREATIVE  ]'}";
const industryText = "{isES ? '[ UNIV: INDUSTRIA ]' : '[ UNIV: INDUSTRY  ]'}";
const universeNav = "{isES ? '>> ENLACE DE NAVEGACIÓN <<' : '>> NAVIGATION LINK <<     '}";

const p = (n) => " ".repeat(n);

let lines = [];
lines.push("╔" + "═".repeat(119) + "╗");
lines.push("║" + p(50) + '<span className="cursor-pointer hover:bg-[#c4ffff] hover:text-black transition-colors" onClick={handleNucleo}>' + nucleoText + '</span>' + p(50) + "║");
lines.push("║" + p(46) + terminalNav + p(46) + "║");
lines.push("╚" + "═".repeat(59) + "╦" + "═".repeat(59) + "╝");
lines.push(p(60) + "║");
lines.push(p(30) + "┌" + "─".repeat(29) + "╨" + "─".repeat(29) + "┐");
lines.push(p(30) + "│" + p(59) + "│");
lines.push(p(30) + "▼" + p(59) + "▼");
lines.push(p(19) + "┌─────────────────────┐" + p(37) + "┌─────────────────────┐");
lines.push(p(19) + '│ <span className="cursor-pointer hover:bg-[#ff3399] hover:text-black transition-colors" onClick={handleCreative}>' + creativeText + '</span> │' + p(37) + '│ <span className="cursor-pointer hover:bg-[#00ffcc] hover:text-black transition-colors" onClick={handleIndustry}>' + industryText + '</span> │');
lines.push(p(19) + "└──────────┬──────────┘" + p(37) + "└──────────┬──────────┘");
lines.push(p(30) + "│" + p(59) + "│");
lines.push(p(13) + "┌──────────┬─────┴─────┬──────────┐" + p(25) + "┌──────────┬─────┴─────┬──────────┐");
lines.push(p(13) + "│          │           │          │" + p(25) + "│          │           │          │");
lines.push(p(13) + "▼          ▼           ▼          ▼" + p(25) + "▼          ▼           ▼          ▼");

const p0 = '<span className="cursor-pointer hover:bg-[#ff3399] hover:text-black transition-colors" onClick={() => handleProject(0)}>SYS.VOID</span>';
const p1 = '<span className="cursor-pointer hover:bg-[#00ffcc] hover:text-black transition-colors" onClick={() => handleProject(1)}>NEO-GRAV</span>';
const p2 = '<span className="cursor-pointer hover:bg-[#9933ff] hover:text-black transition-colors" onClick={() => handleProject(2)}>AURA-MSH</span>';
const p3 = '<span className="cursor-pointer hover:bg-[#ffcc00] hover:text-black transition-colors" onClick={() => handleProject(3)}>LUMINO-W</span>';

const p4 = '<span className="cursor-pointer hover:bg-[#ff3333] hover:text-black transition-colors" onClick={() => handleProject(4)}>MONOLITH</span>';
const p5 = '<span className="cursor-pointer hover:bg-[#33ff33] hover:text-black transition-colors" onClick={() => handleProject(5)}>EXO-ARMR</span>';
const p6 = '<span className="cursor-pointer hover:bg-[#ff9900] hover:text-black transition-colors" onClick={() => handleProject(6)}>MECHA-WR</span>';
const p7 = '<span className="cursor-pointer hover:bg-[#33ccff] hover:text-black transition-colors" onClick={() => handleProject(7)}>SYNTH-SK</span>';

const leftItems = "&gt;" + p0 + "&lt;  &gt;" + p1 + "&lt;  &gt;" + p2 + "&lt;  &gt;" + p3 + "&lt;";
const rightItems = "&gt;" + p4 + "&lt;  &gt;" + p5 + "&lt;  &gt;" + p6 + "&lt;  &gt;" + p7 + "&lt;";

lines.push(p(8) + leftItems + p(15) + rightItems);

let vLines = [];
vLines.push("┌──────────────────────────────────────────────────┐");
vLines.push("│               <span className=\"cursor-pointer hover:bg-[#c4ffff] hover:text-black transition-colors\" onClick={handleNucleo}>" + nucleoText + "</span>                │");
vLines.push("│            " + universeNav + "            │");
vLines.push("└─────────────────────────┬────────────────────────┘");
vLines.push("                          │");
vLines.push("                          ├────────── <span className=\"cursor-pointer hover:bg-[#ff3399] hover:text-black transition-colors\" onClick={handleCreative}>" + creativeText + "</span>");
vLines.push("                          │");
vLines.push("                          │     ├──── &gt;<span className=\"cursor-pointer hover:bg-[#ff3399] hover:text-black transition-colors\" onClick={() => handleProject(0)}>SYS.VOID</span>&lt;");
vLines.push("                          │     ├──── &gt;<span className=\"cursor-pointer hover:bg-[#00ffcc] hover:text-black transition-colors\" onClick={() => handleProject(1)}>NEO-GRAVITY</span>&lt;");
vLines.push("                          │     ├──── &gt;<span className=\"cursor-pointer hover:bg-[#9933ff] hover:text-black transition-colors\" onClick={() => handleProject(2)}>AURA-MESH</span>&lt;");
vLines.push("                          │     └──── &gt;<span className=\"cursor-pointer hover:bg-[#ffcc00] hover:text-black transition-colors\" onClick={() => handleProject(3)}>LUMINO-WEAVE</span>&lt;");
vLines.push("                          │");
vLines.push("                          └────────── <span className=\"cursor-pointer hover:bg-[#00ffcc] hover:text-black transition-colors\" onClick={handleIndustry}>" + industryText + "</span>");
vLines.push("                                ");
vLines.push("                                ├──── &gt;<span className=\"cursor-pointer hover:bg-[#ff3333] hover:text-black transition-colors\" onClick={() => handleProject(4)}>MONOLITHIC</span>&lt;");
vLines.push("                                ├──── &gt;<span className=\"cursor-pointer hover:bg-[#33ff33] hover:text-black transition-colors\" onClick={() => handleProject(5)}>EXO-ARMOR</span>&lt;");
vLines.push("                                ├──── &gt;<span className=\"cursor-pointer hover:bg-[#ff9900] hover:text-black transition-colors\" onClick={() => handleProject(6)}>MECHA-WEAR</span>&lt;");
vLines.push("                                └──── &gt;<span className=\"cursor-pointer hover:bg-[#33ccff] hover:text-black transition-colors\" onClick={() => handleProject(7)}>SYNTH-SKIN</span>&lt;");

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

  if (appMode === 'terminal') {
    return (
      <div className="font-mono text-[5px] sm:text-[6px] md:text-[8px] leading-tight text-[#c4ffff] opacity-90 whitespace-pre pointer-events-auto overflow-x-auto scrollbar-hide">
        <div className="flex flex-col min-w-max">
${lines.map(l => '          <span>' + l + '</span>').join('\n')}
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono text-[6px] md:text-[8px] leading-tight text-[#c4ffff] opacity-90 whitespace-pre pointer-events-auto overflow-x-auto scrollbar-hide">
      <div className="flex flex-col min-w-max">
${vLines.map(l => '        <span>' + l + '</span>').join('\n')}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AsciiTree.tsx', component);
console.log("Generated AsciiTree.tsx");
