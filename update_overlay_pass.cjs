const fs = require('fs');

let code = fs.readFileSync('src/components/Overlay.tsx', 'utf8');

code = code.replace(
`          <AsciiTree onSelectProject={(idx) => {
            if (appMode === 'terminal' && onEnterUniverse) {
              onEnterUniverse();
            }
            if (onSelectProject) onSelectProject(idx);
          }} />`,
`          <AsciiTree 
            onEnterUniverse={appMode === 'terminal' ? onEnterUniverse : undefined}
            onSelectProject={(idx) => {
              if (appMode === 'terminal' && onEnterUniverse) {
                onEnterUniverse();
              }
              if (onSelectProject) onSelectProject(idx);
            }} 
          />`
);

fs.writeFileSync('src/components/Overlay.tsx', code);
