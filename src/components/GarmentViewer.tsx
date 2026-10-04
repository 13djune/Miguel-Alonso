import LoaderFallback from "./LoaderFallback";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface GarmentViewerProps {
  modelUrl?: string;
}

// Componente que carga el modelo y usa el CDN de Google para decodificar Draco
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(
    url,
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
  );
  return <primitive object={scene} />;
}

function FallbackGarment() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
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
    <Canvas
      camera={{ position: [0, 0, 8], fov: 40 }}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        depth: true,
        stencil: false,
      }}
      dpr={1}
    >
      {/* Iluminación controlada por código */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={2} />
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
        minDistance={1.2}
        maxDistance={15}
        enableZoom={true}
        zoomSpeed={1.2}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
