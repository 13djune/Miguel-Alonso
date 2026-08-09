const fs = require('fs');

const asciiTreeCode = `import { useLanguage } from '../context/LanguageContext';

interface AsciiTreeProps {
  onSelectProject?: (index: number) => void;
  onSetUniverse?: (universe: 'creative' | 'industry') => void;
}

export default function AsciiTree({ onSelectProject, onSetUniverse }: AsciiTreeProps) {
  const { language } = useLanguage();
  const isES = language === 'es';

  return (
    <div className="font-mono text-[7px] md:text-[8px] leading-tight text-[#c4ffff] opacity-90 whitespace-pre pointer-events-auto overflow-x-auto">
      <div className="flex flex-col min-w-max">
        <span>╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗</span>
        <span>║                                                   <span className="cursor-pointer hover:bg-[#c4ffff] hover:text-black transition-colors px-1" onClick={() => { if (onSetUniverse) onSetUniverse('creative'); }}>[ SYS.VOID {isES ? 'NÚCLEO' : 'CORE'} ]</span>                                                 ║</span>
        <span>║                                              &gt;&gt; TERMINAL DE NAVEGACIÓN &lt;&lt;                                             ║</span>
        <span>╚═══════════════════════════════════════════════════════════╦═══════════════════════════════════════════════════════════╝</span>
        <span>                                                            ║</span>
        <span>                            ┌───────────────────────────────╨───────────────────────────────┐</span>
        <span>                            │                                                               │</span>
        <span>                            ▼                                                               ▼</span>
        <span>               ┌────────────────────────┐                                               ┌────────────────────────┐</span>
        <span>               │ <span className="cursor-pointer hover:bg-[#ff3399] hover:text-black transition-colors px-1" onClick={() => { if (onSetUniverse) onSetUniverse('creative'); }}>[ UNIVERSO: CREATIVO ]</span> │                                               │ <span className="cursor-pointer hover:bg-[#00ffcc] hover:text-black transition-colors px-1" onClick={() => { if (onSetUniverse) onSetUniverse('industry'); }}>[ UNIVERSO: INDUSTRIA]</span> │</span>
        <span>               └────────────┬───────────┘                                               └────────────┬───────────┘</span>
        <span>                            │                                                                        │</span>
        <span>      ┌──────────────┬──────┴───────┬──────────────┐                                  ┌──────────────┬──────┴───────┬──────────────┐</span>
        <span>      │              │              │              │                                  │              │              │              │</span>
        <span>      ▼              ▼              ▼              ▼                                  ▼              ▼              ▼              ▼</span>
        <span> &gt;<span className="cursor-pointer hover:bg-[#ff3399] hover:text-black transition-colors" onClick={() => onSelectProject?.(0)}>SYS.VOID</span>&lt;    &gt;<span className="cursor-pointer hover:bg-[#00ffcc] hover:text-black transition-colors" onClick={() => onSelectProject?.(1)}>NEO-GRAVITY</span>&lt;  &gt;<span className="cursor-pointer hover:bg-[#9933ff] hover:text-black transition-colors" onClick={() => onSelectProject?.(2)}>AURA-MESH</span>&lt;  &gt;<span className="cursor-pointer hover:bg-[#ffcc00] hover:text-black transition-colors" onClick={() => onSelectProject?.(3)}>LUMINO-WEAVE</span>&lt;                 &gt;<span className="cursor-pointer hover:bg-[#ff3333] hover:text-black transition-colors" onClick={() => onSelectProject?.(4)}>MONOLITHIC</span>&lt;   &gt;<span className="cursor-pointer hover:bg-[#33ff33] hover:text-black transition-colors" onClick={() => onSelectProject?.(5)}>EXO-ARMOR</span>&lt;    &gt;<span className="cursor-pointer hover:bg-[#ff9900] hover:text-black transition-colors" onClick={() => onSelectProject?.(6)}>MECHA-WEAR</span>&lt;   &gt;<span className="cursor-pointer hover:bg-[#33ccff] hover:text-black transition-colors" onClick={() => onSelectProject?.(7)}>SYNTH-SKIN</span>&lt;</span>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AsciiTree.tsx', asciiTreeCode);
