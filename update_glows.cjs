const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

// Smooth, more transparent planet radial gradient
code = code.replace(
`    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');`,
`    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.04)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.01)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');`
);

// Scale up the planet glow sprite slightly
code = code.replace(
  'gsap.to(glowMeshRef.current.scale, { x: 0.45, y: 0.45, z: 0.45, duration: 0.5, ease: "power2.out" });',
  'gsap.to(glowMeshRef.current.scale, { x: 0.55, y: 0.55, z: 0.55, duration: 0.5, ease: "power2.out" });'
);
code = code.replace(
  'gsap.to(glowMeshRef.current.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.1 });',
  'gsap.to(glowMeshRef.current.scale, { x: 0.35, y: 0.35, z: 0.35, duration: 0.1 });'
);
code = code.replace(
  'gsap.to(glowMeshRef.current.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.5 });',
  'gsap.to(glowMeshRef.current.scale, { x: 0.4, y: 0.4, z: 0.4, duration: 0.5 });'
);
code = code.replace(
  '<sprite ref={glowMeshRef} scale={[0.3, 0.3, 0.3]}>',
  '<sprite ref={glowMeshRef} scale={[0.4, 0.4, 0.4]}>'
);

// Tweak core transparency
code = code.replace(
  '<pointLight position={[0, 0, 0]} intensity={5} color="#ffffff" distance={40} decay={1.5} />',
  '<pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" distance={40} decay={1.5} />'
);
code = code.replace(
  '<meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.15} />',
  '<meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.05} />'
);
code = code.replace(
  '<meshStandardMaterial color="#c4ffff" metalness={0.8} roughness={0.2} />',
  '<meshStandardMaterial color="#c4ffff" metalness={0.8} roughness={0.2} transparent opacity={0.4} />'
);
code = code.replace(
  '<meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />',
  '<meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} transparent opacity={0.4} />'
);

fs.writeFileSync('src/components/Universe.tsx', code);
