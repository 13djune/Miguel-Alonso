const fs = require('fs');

// 1. App.tsx - Update camera positions (Initial and CameraController)
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/camera=\{\{ position: \[-6, \(typeof window !== 'undefined' \&\& window.innerWidth < 768\) \? 7\.0 : 4\.0, \(typeof window !== 'undefined' \&\& window.innerWidth < 768\) \? 32\.0 : 16\.0\], fov: 45 \}\}/g, 
"camera={{ position: [-10.8, (typeof window !== 'undefined' && window.innerWidth < 768) ? 12.6 : 7.2, (typeof window !== 'undefined' && window.innerWidth < 768) ? 57.6 : 28.8], fov: 45 }}");

// Update CameraController target coordinates
appCode = appCode.replace(/x: -6,\s*y: isMobile \? 7\.0 : 4\.0,\s*z: isMobile \? 32\.0 : 16\.0,/g, 
"x: -10.8,\n        y: isMobile ? 12.6 : 7.2,\n        z: isMobile ? 57.6 : 28.8,");
fs.writeFileSync('src/App.tsx', appCode);

// 2. GarmentViewer.tsx - Paste user code but align colors to White/Cyan theme
const garmentViewerCode = `import LoaderFallback from "./LoaderFallback";
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface GarmentViewerProps {
  modelUrl?: string;
}

// Componente que carga el modelo y usa el CDN de Google para decodificar Draco
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  return <primitive object={scene} />;
}

function FallbackGarment() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial 
          color="#111111" 
          roughness={0.2} 
          metalness={0.8}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.05, 1.55, 1.05]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
    </group>
  );
}

export default function GarmentViewer({ modelUrl }: GarmentViewerProps) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 8], fov: 40 }} gl={{ antialias: true, powerPreference: 'high-performance' }} dpr={[1, 1.5]}>
      {/* Iluminación controlada por código */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-5, 5, -5]} intensity={1} color="#ffffff" />
      <directionalLight position={[0, -5, 5]} intensity={0.5} color="#c4ffff" />
      
      <Suspense fallback={<LoaderFallback />}>
        <Center>
          {modelUrl ? <Model url={modelUrl} /> : <FallbackGarment />}
        </Center>
      </Suspense>
      
      <OrbitControls 
        makeDefault 
        autoRotate 
        autoRotateSpeed={0.5}
        minDistance={4}
        maxDistance={12}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
`;
fs.writeFileSync('src/components/GarmentViewer.tsx', garmentViewerCode);
