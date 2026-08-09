const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

// Update UniverseProps
code = code.replace(
  'interface UniverseProps {\n  projects: Project[];\n  onPlanetClick: (project: Project) => void;\n  selectedProject?: Project | null;\n}',
  'interface UniverseProps {\n  projects: Project[];\n  onPlanetClick: (project: Project) => void;\n  selectedProject?: Project | null;\n  activeUniverse?: \'creative\' | \'industry\';\n}'
);

// Update Universe component
const oldUniverse = `export default function Universe({ projects, onPlanetClick, selectedProject }: UniverseProps) {
  const radii = [1.0, 1.4, 1.8, 2.2];
  
  const creativeProjects = projects.slice(0, 4);
  const industryProjects = projects.slice(4, 8);
  
  return (
    <group>
      {/* Creative Universe */}
      <group position={[-2.5, 0, -1]}>
        <CentralCore />
        <Html position={[0, -2.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="font-mono text-[#ff3399] text-[10px] tracking-widest uppercase opacity-70 whitespace-nowrap">
            [ CREATIVE.SYS ]
          </div>
        </Html>
        {creativeProjects.map((project, idx) => {
          const radius = radii[idx % radii.length];
          return <OrbitGroup key={project.id} index={idx} project={project} radius={radius} onClick={() => onPlanetClick(project)} isSelected={selectedProject?.id === project.id} />;
        })}
      </group>

      {/* Industry Universe */}
      <group position={[2.5, 0, 1]}>
        <CentralCore />
        <Html position={[0, -2.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="font-mono text-[#00ffcc] text-[10px] tracking-widest uppercase opacity-70 whitespace-nowrap">
            [ INDUSTRY.SYS ]
          </div>
        </Html>
        {industryProjects.map((project, idx) => {
          const radius = radii[idx % radii.length];
          // We add 4 to idx for visual variety in orbit tilt/speed based on index logic in OrbitGroup
          return <OrbitGroup key={project.id} index={idx + 4} project={project} radius={radius} onClick={() => onPlanetClick(project)} isSelected={selectedProject?.id === project.id} />;
        })}
      </group>
      
      {/* Connection between universes */}
      <Line points={[new THREE.Vector3(-2.5, 0, -1), new THREE.Vector3(2.5, 0, 1)]} color="#c4ffff" dashed={true} dashScale={2} dashSize={0.2} gapSize={0.1} transparent opacity={0.2} lineWidth={1} />
    </group>
  );
}`;

const newUniverse = `export default function Universe({ projects, onPlanetClick, selectedProject, activeUniverse = 'creative' }: UniverseProps) {
  const radii = [1.0, 1.4, 1.8, 2.2];
  
  const creativeProjects = projects.slice(0, 4);
  const industryProjects = projects.slice(4, 8);
  
  const activeProjects = activeUniverse === 'creative' ? creativeProjects : industryProjects;
  const labelColor = activeUniverse === 'creative' ? '#ff3399' : '#00ffcc';
  const labelText = activeUniverse === 'creative' ? '[ CREATIVE.SYS ]' : '[ INDUSTRY.SYS ]';
  const startIndex = activeUniverse === 'creative' ? 0 : 4;
  
  return (
    <group position={[0, 0, 0]}>
      <CentralCore />
      <Html position={[0, -2.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="font-mono text-[10px] tracking-widest uppercase opacity-70 whitespace-nowrap" style={{ color: labelColor }}>
          {labelText}
        </div>
      </Html>
      {activeProjects.map((project, idx) => {
        const radius = radii[idx % radii.length];
        return <OrbitGroup 
          key={project.id} 
          index={idx + startIndex} 
          project={project} 
          radius={radius} 
          onClick={() => onPlanetClick(project)} 
          isSelected={selectedProject?.id === project.id} 
          isFocused={selectedProject?.id === project.id}
          selectedProjectId={selectedProject?.id}
        />;
      })}
    </group>
  );
}`;

code = code.replace(oldUniverse, newUniverse);

fs.writeFileSync('src/components/Universe.tsx', code);
