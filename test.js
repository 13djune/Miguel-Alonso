const code = `
      <main className={\`fixed inset-0 pt-24 pb-24 md:pt-32 md:pb-32 flex \${appMode === 'terminal' ? 'items-center justify-center' : 'items-center justify-end md:pr-12'} pointer-events-none z-40 overflow-hidden\`}>
        <div className={\`relative flex items-center transition-transform duration-500 ease-in-out \${appMode !== 'terminal' && !isSidebarOpen ? 'translate-x-[calc(100%+2rem)]' : 'translate-x-0'}\`}>
          {appMode !== 'terminal' && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="pointer-events-auto absolute right-full mr-2 md:mr-4 bg-white text-black font-mono font-bold text-xs px-2 py-8 hover:bg-gray-200 border border-white z-50 cursor-crosshair shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            >
              {isSidebarOpen ? '▶' : '◀'}
            </button>
          )}
          <div className={\` \${appMode === 'terminal' ? 'bg-black/95 backdrop-blur-xl p-4 md:p-10 shadow-[8px_8px_0px_rgba(255, 255, 255,0.2)] transform scale-100 mt-16 md:mt-0 w-[95vw] md:w-fit max-w-[95vw] overflow-x-auto' : 'hidden md:block mr-2 md:mr-4 bg-black/40 backdrop-blur-sm p-4 shadow-[4px_4px_0px_rgba(255, 255, 255,0.15)] max-w-[95vw] overflow-x-auto'} border border-white/30 pointer-events-auto cursor-default flex flex-col\`}>
`;
console.log(code);
