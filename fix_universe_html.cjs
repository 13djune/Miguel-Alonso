const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

// Fix ProjectNode Html
code = code.replace(
  '<Html position={[0.4, 0.4, 0]} center style={{ pointerEvents: \'none\' }}>',
  '<Html position={[0.4, 0.4, 0]} center style={{ pointerEvents: \'none\', opacity: (selectedProjectId && !isSelected) ? 0 : 1, display: (selectedProjectId && !isSelected) ? "none" : "block", transition: "opacity 0.2s" }}>'
);

// Fix Universe CentralCore Html for [ CREATIVE.SYS ]
code = code.replace(
  '<Html position={[0, 1.2, 0]} center style={{ pointerEvents: \'none\' }}>\n              <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">\n                [ CREATIVE.SYS ]\n              </div>\n            </Html>',
  '<Html position={[0, 1.2, 0]} center style={{ pointerEvents: \'none\', opacity: selectedProject ? 0 : 1, display: selectedProject ? "none" : "block", transition: "opacity 0.2s" }}>\n              <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">\n                [ CREATIVE.SYS ]\n              </div>\n            </Html>'
);

// Fix Universe CentralCore Html for [ INDUSTRY.SYS ]
code = code.replace(
  '<Html position={[0, 1.2, 0]} center style={{ pointerEvents: \'none\' }}>\n              <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">\n                [ INDUSTRY.SYS ]\n              </div>\n            </Html>',
  '<Html position={[0, 1.2, 0]} center style={{ pointerEvents: \'none\', opacity: selectedProject ? 0 : 1, display: selectedProject ? "none" : "block", transition: "opacity 0.2s" }}>\n              <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">\n                [ INDUSTRY.SYS ]\n              </div>\n            </Html>'
);

// Fix Universe CentralCore Html for [ SYS_CORE ]
code = code.replace(
  '<Html position={[0, 1.2, 0]} center style={{ pointerEvents: \'none\' }}>\n              <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">\n                [ SYS_CORE ]\n              </div>\n            </Html>',
  '<Html position={[0, 1.2, 0]} center style={{ pointerEvents: \'none\', opacity: selectedProject ? 0 : 1, display: selectedProject ? "none" : "block", transition: "opacity 0.2s" }}>\n              <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">\n                [ SYS_CORE ]\n              </div>\n            </Html>'
);

fs.writeFileSync('src/components/Universe.tsx', code);
