import LoaderFallback from "./LoaderFallback";
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

interface GarmentViewerProps {
  modelUrl?: string;
}

// Fallback abstract/stylized model if no URL is provided
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
      {/* Studio Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-5, 5, -5]} intensity={1} color="#b0c4de" />
      <directionalLight position={[0, -5, 5]} intensity={0.5} color="#ffb6c1" />
      
      <Suspense fallback={<LoaderFallback />}>
        <Center>
          <FallbackGarment />
        </Center>
      </Suspense>
      
      {/* Optimized controls for garment inspection */}
      <OrbitControls 
        makeDefault 
        autoRotate 
        autoRotateSpeed={0.5}
        minDistance={4}
        maxDistance={12}
        enablePan={false}
        minPolarAngle={Math.PI / 4} // Restrict looking directly from top
        maxPolarAngle={Math.PI / 1.5} // Restrict looking directly from bottom
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
