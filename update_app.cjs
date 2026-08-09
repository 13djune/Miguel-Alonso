const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add activeUniverse state
if (!code.includes('activeUniverse')) {
  code = code.replace(
    "const [appMode, setAppMode] = useState<'loading' | 'terminal' | 'universe'>('loading');",
    "const [appMode, setAppMode] = useState<'loading' | 'terminal' | 'universe'>('loading');\n  const [activeUniverse, setActiveUniverse] = useState<'creative' | 'industry'>('creative');"
  );
  
  // Pass to Universe
  code = code.replace(
    '<Universe projects={PROJECTS} onPlanetClick={handlePlanetClick} selectedProject={selectedProject} />',
    '<Universe projects={PROJECTS} onPlanetClick={handlePlanetClick} selectedProject={selectedProject} activeUniverse={activeUniverse} />'
  );
  
  // Pass to Overlay
  code = code.replace(
    '<Overlay appMode={appMode} onEnterUniverse={() => setAppMode(\'universe\')} onOpenDesigner={() => setDesignerModalActive(true)} onSelectProject={(index) => handlePlanetClick(PROJECTS[index])} onOpenCollections={() => setCollectionsModalActive(true)} />',
    '<Overlay appMode={appMode} activeUniverse={activeUniverse} onSetUniverse={setActiveUniverse} onEnterUniverse={() => setAppMode(\'universe\')} onOpenDesigner={() => setDesignerModalActive(true)} onSelectProject={(index) => handlePlanetClick(PROJECTS[index])} onOpenCollections={() => setCollectionsModalActive(true)} />'
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
