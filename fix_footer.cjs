const fs = require('fs');
let overlay = fs.readFileSync('src/components/Overlay.tsx', 'utf8');

const regex = /<div className="hidden md:flex ml-auto items-center gap-4 pointer-events-auto">\s*<div className="text-\[10px\] tracking-widest uppercase text-white font-mono flex items-center gap-2 bg-white\/10 px-3 py-1 border border-white shrink-0 pointer-events-none">\s*<span className="animate-pulse">_<\/span>\s*<span>\{t\('overlay.target.inspect'\)\}<\/span>\s*<ArrowRight size=\{12\} \/>\s*<\/div>\s*<\/div>/;

const newFooterContent = `<div className="hidden md:flex flex-col ml-auto items-end gap-1.5 pointer-events-auto">
          <div className="text-[10px] tracking-widest uppercase text-white font-mono flex items-center gap-2 bg-white/10 px-3 py-1 border border-white shrink-0 pointer-events-none">
            <span className="animate-pulse">_</span>
            <span>{t('overlay.target.inspect')}</span>
            <ArrowRight size={12} />
          </div>
          <div id="debug-coords" className="text-[8px] md:text-[9px] font-mono text-[#ffffff] pointer-events-none opacity-60 tracking-wider"></div>
        </div>`;

overlay = overlay.replace(regex, newFooterContent);
fs.writeFileSync('src/components/Overlay.tsx', overlay);
console.log("Footer fixed");
