const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

const bracketsCode = `{/* Corner brackets when selected/hovered like in image */}
            {(isSelected || hovered) && (
              <div className="absolute -inset-2 pointer-events-none opacity-80">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: "#c4ffff" }}></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: "#c4ffff" }}></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: "#c4ffff" }}></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: "#c4ffff" }}></div>
              </div>
            )}`;

code = code.replace(bracketsCode, '{/* Corner brackets removed */}');

// The original may have different spacing. Let's just use regex.
code = code.replace(/\{\/\* Corner brackets[\s\S]*?<\div>\s*\}\)/g, '{/* Extra corners removed */}');

fs.writeFileSync('src/components/Universe.tsx', code);
