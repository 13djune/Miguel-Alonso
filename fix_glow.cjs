const fs = require('fs');

// Fix Universe.tsx
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

// Replace glowTexture sprite completely with PointGlow
const pointGlowComponent = `function PointGlow({ radius, count = 2000, color = "#c4ffff", size = 0.04 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // linear random for radius clusters points at the center naturally
      // creating a gradient dot glow
      const r = Math.random() * radius;
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [radius, count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation={true} />
    </points>
  );
}`;

code = code.replace(/function DottedRing/, pointGlowComponent + '\n\nfunction DottedRing');

// In ProjectNode, replace <mesh> inner core and <sprite> glow
// Find where it's injected
const projectNodeRegex = /\{(\/\* Core \*\/)\}[\s\S]*?<sprite ref=\{glowMeshRef\} scale=\{\[1\.0, 1\.0, 1\.0\]\}>[\s\S]*?<\/sprite>/m;
code = code.replace(projectNodeRegex, 
  `{/* Core & Glow */}
        <group ref={glowMeshRef}>
          <PointGlow radius={0.8} count={1500} color={project.color} size={0.03} />
          <PointGlow radius={0.2} count={500} color={project.color} size={0.04} />
        </group>`);

// In CentralCore, replace <mesh> inner core and <sprite> glow
const centralCoreRegex = /<mesh>\s*<sphereGeometry args=\{\[0\.15, 16, 16\]\} \/>\s*<meshBasicMaterial color="#c4ffff" \/>\s*<\/mesh>\s*<sprite scale=\{\[2\.5, 2\.5, 2\.5\]\}>[\s\S]*?<\/sprite>/m;
code = code.replace(centralCoreRegex, 
  `<group>
          <PointGlow radius={1.5} count={3000} color="#c4ffff" size={0.03} />
          <PointGlow radius={0.3} count={800} color="#c4ffff" size={0.05} />
        </group>`);

fs.writeFileSync('src/components/Universe.tsx', code);

// ----------------------------------------------------
// Fix DesignerModal.tsx Tools and Skills
let designer = fs.readFileSync('src/components/DesignerModal.tsx', 'utf8');

const oldSkills = `  const skillsData = [
    { subject: t('skill.3d'), A: 95, fullMark: 100 },
    { subject: t('skill.pattern'), A: 90, fullMark: 100 },
    { subject: t('skill.render'), A: 85, fullMark: 100 },
    { subject: t('skill.anim'), A: 75, fullMark: 100 },
    { subject: t('skill.texture'), A: 85, fullMark: 100 },
    { subject: t('skill.art'), A: 90, fullMark: 100 },
  ];`;
const newSkills = `  const skillsData = [
    { subject: 'Modelado 3D', A: 4, fullMark: 5 },
    { subject: 'Patronaje', A: 4.2, fullMark: 5 },
    { subject: 'Renderizado', A: 4, fullMark: 5 },
    { subject: 'Animación', A: 2, fullMark: 5 },
    { subject: 'Texturizado', A: 3.8, fullMark: 5 },
    { subject: 'Dir. de Arte', A: 3.8, fullMark: 5 },
  ];`;
designer = designer.replace(oldSkills, newSkills);

designer = designer.replace(/domain=\{\[0, 100\]\}/, 'domain={[0, 5]}');

const oldTools = `            {[
              'CLO 3D', 'MARVELOUS DESIGNER', 'BLENDER', 'CINEMA 4D',
              'UNREAL ENGINE', 'SUBSTANCE PAINTER', 'REACT THREE FIBER', 'TOUCHDESIGNER'
            ]`;
const newTools = `            {[
              'CLO 3D', 'BLENDER', 'MARVELOUS DESIGNER', 'ADOBE SUITE', 'NOMAD SCULPT', 'FIGMA WEAVY'
            ]`;
designer = designer.replace(oldTools, newTools);

fs.writeFileSync('src/components/DesignerModal.tsx', designer);
