const fs = require('fs');

let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

const startIdx = code.indexOf('function CentralCore() {');
const endIdx = code.indexOf('export default function Universe');

if(startIdx !== -1 && endIdx !== -1) {
    const newCore = `function CentralCore() {
  const coreGroup = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (coreGroup.current) {
      const t = clock.getElapsedTime();
      coreGroup.current.rotation.x = t * 0.2;
      coreGroup.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={15} color="#ffffff" distance={40} decay={1.5} />
      <ambientLight intensity={1.5} />
      
      <group ref={coreGroup}>
        {/* Core solid center (shiny white, no bloom/glow) */}
        <mesh>
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
        </mesh>
        
        {/* Wireframe outer shell */}
        <mesh>
          <icosahedronGeometry args={[0.18, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.3} />
        </mesh>

        {/* Inner geometric rings */}
        <mesh rotation={[Math.PI/4, 0, 0]}>
          <torusGeometry args={[0.15, 0.005, 16, 64]} />
          <meshStandardMaterial color="#c4ffff" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, Math.PI/3, 0]}>
          <torusGeometry args={[0.16, 0.005, 16, 64]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

`;
    code = code.substring(0, startIdx) + newCore + code.substring(endIdx);
    fs.writeFileSync('src/components/Universe.tsx', code);
    console.log("Success replacing core");
} else {
    console.log("Failed to find boundaries");
}
