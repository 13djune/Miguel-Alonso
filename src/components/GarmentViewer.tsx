import LoaderFallback from "./LoaderFallback";
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, MeshWobbleMaterial, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

interface GarmentViewerProps {
  modelUrl?: string;
}

// Component to load actual GLTF if provided
import { KTX2Loader } from 'three-stdlib';
import { DRACOLoader } from 'three-stdlib';

// Optimized GLTF loader with DRACO and KTX2 support


function GarmentModel({ url }: { url: string }) {
  const { scene } = useGLTF(url, true, true, (loader) => {
    // Configure DRACO
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    // Configure KTX2 (requires WebGL context, so usually done globally or via useThree)
    // Here we set up the basis for it.
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/');
    loader.setKTX2Loader(ktx2Loader);
  });
  
  return <primitive object={scene} scale={2} />;
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
      
      {/* HDRi Environment for realistic reflections */}
      
      
      <Suspense fallback={<LoaderFallback />}>
        <Center>
          {modelUrl && modelUrl !== '/models/garment.gltf' ? (
            <GarmentModel url={modelUrl} />
          ) : (
            <FallbackGarment />
          )}
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
