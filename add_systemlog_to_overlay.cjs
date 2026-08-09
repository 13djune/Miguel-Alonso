const fs = require('fs');

let code = fs.readFileSync('src/components/Overlay.tsx', 'utf8');

code = code.replace(
  'import AsciiTree from \'./AsciiTree\';',
  'import AsciiTree from \'./AsciiTree\';\nimport SystemLog from \'./SystemLog\';\nimport { useTerminalAudio } from \'../hooks/useTerminalAudio\';'
);

code = code.replace(
  '  const { t, language, toggleLanguage } = useLanguage();',
  '  const { t, language, toggleLanguage } = useLanguage();\n  \n  useTerminalAudio(appMode === \'terminal\');'
);

code = code.replace(
  '{/* Header / Navigation */}',
  '{appMode === \'terminal\' && <SystemLog />}\n\n      {/* Header / Navigation */}'
);

// ALSO, let's fix the AsciiTree positioning when appMode === 'terminal' so it doesn't get hidden.
code = code.replace(
  '      <main className={`flex-1 flex ${appMode === \'terminal\' ? \'items-center justify-center\' : \'items-end md:items-center justify-end\'} mt-4 md:mt-8 w-full pb-4 md:pb-0 pointer-events-none`}>',
  '      <main className={`flex-1 flex ${appMode === \'terminal\' ? \'items-center justify-center\' : \'items-end md:items-center justify-end\'} mt-4 md:mt-8 w-full pb-4 md:pb-0 pointer-events-none`}>'
);

code = code.replace(
  '        <div className={`animate-item ${appMode === \'terminal\' ? \'bg-black/60 backdrop-blur-md p-8 shadow-[8px_8px_0px_rgba(196,255,255,0.2)] transform scale-125\' : \'hidden md:block mr-12 bg-black/40 backdrop-blur-sm p-4 shadow-[4px_4px_0px_rgba(196,255,255,0.15)]\'} border border-[#c4ffff]/30 pointer-events-auto cursor-default transition-all duration-700`}>',
  '        <div className={`animate-item ${appMode === \'terminal\' ? \'bg-black/60 backdrop-blur-md p-4 md:p-8 shadow-[8px_8px_0px_rgba(196,255,255,0.2)] transform md:scale-125 mt-16 md:mt-0\' : \'hidden md:block mr-12 bg-black/40 backdrop-blur-sm p-4 shadow-[4px_4px_0px_rgba(196,255,255,0.15)]\'} border border-[#c4ffff]/30 pointer-events-auto cursor-default transition-all duration-700`}>'
);

fs.writeFileSync('src/components/Overlay.tsx', code);
