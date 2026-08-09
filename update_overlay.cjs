const fs = require('fs');

let code = fs.readFileSync('src/components/Overlay.tsx', 'utf8');

code = code.replace(
  'export default function Overlay({ onOpenDesigner, onSelectProject, onOpenCollections }: OverlayProps) {',
  'interface OverlayProps {\n  appMode?: "loading" | "terminal" | "universe";\n  onEnterUniverse?: () => void;\n  onOpenDesigner?: () => void;\n  onSelectProject?: (index: number) => void;\n  onOpenCollections?: () => void;\n}\n\nexport default function Overlay({ appMode, onEnterUniverse, onOpenDesigner, onSelectProject, onOpenCollections }: OverlayProps) {'
);

// Remove the old interface OverlayProps if it exists
code = code.replace(
  'interface OverlayProps {\n  onOpenDesigner?: () => void;\n  onSelectProject?: (index: number) => void;\n  onOpenCollections?: () => void;\n}',
  ''
);

// We need to hide the footer and center the AsciiTree if appMode === 'terminal'
code = code.replace(
`      {/* Main Content Layout */}
      <main className="flex-1 flex items-end md:items-center justify-end mt-4 md:mt-8 w-full pb-4 md:pb-0 pointer-events-none">
        <div className="hidden md:block animate-item mr-12 bg-black/40 backdrop-blur-sm border border-[#c4ffff]/30 p-4 shadow-[4px_4px_0px_rgba(196,255,255,0.15)] pointer-events-auto cursor-default">
          <AsciiTree onSelectProject={onSelectProject} />
        </div>
      </main>

      {/* Footer Timeline / Selection */}
      <footer className="mt-4 md:mt-12 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-t border-[#c4ffff]/30 pt-4 animate-item relative">`,
`      {/* Main Content Layout */}
      <main className={\`flex-1 flex \${appMode === 'terminal' ? 'items-center justify-center' : 'items-end md:items-center justify-end'} mt-4 md:mt-8 w-full pb-4 md:pb-0 pointer-events-none\`}>
        <div className={\`animate-item \${appMode === 'terminal' ? 'bg-black/60 backdrop-blur-md p-8 shadow-[8px_8px_0px_rgba(196,255,255,0.2)] transform scale-125' : 'hidden md:block mr-12 bg-black/40 backdrop-blur-sm p-4 shadow-[4px_4px_0px_rgba(196,255,255,0.15)]'} border border-[#c4ffff]/30 pointer-events-auto cursor-default transition-all duration-700\`}>
          <AsciiTree onSelectProject={(idx) => {
            if (appMode === 'terminal' && onEnterUniverse) {
              onEnterUniverse();
            }
            if (onSelectProject) onSelectProject(idx);
          }} />
        </div>
      </main>

      {/* Footer Timeline / Selection */}
      <footer className={\`mt-4 md:mt-12 flex-col md:flex-row md:items-center gap-4 md:gap-8 border-t border-[#c4ffff]/30 pt-4 animate-item relative \${appMode === 'terminal' ? 'hidden' : 'flex'}\`}>`
);

fs.writeFileSync('src/components/Overlay.tsx', code);
