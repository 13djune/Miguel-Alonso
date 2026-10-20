import LoaderFallback from "./LoaderFallback";
import { Suspense, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import P3rmfrstPointCloud from "./P3rmfrstPointCloud";

interface GarmentViewerProps {
  modelUrl?: string;
  projectId?: string;
  projectTitle?: string;
}

// Component that loads GLTF model with Draco decoder CDN
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

export default function GarmentViewer({
  modelUrl,
  projectId,
  projectTitle = "",
}: GarmentViewerProps) {
  const isP3rmfrst =
    projectId === "2" ||
    projectTitle.toUpperCase().includes("P3RMFRST") ||
    projectTitle.toUpperCase().includes("PERMAFROST");

  const [colorMode, setColorMode] = useState<"real" | "cyber" | "matrix">("real");
  const [enableScan, setEnableScan] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden group">
      {/* HUD Quick Bar for P3RMFRST Point Cloud Controls */}
      {isP3rmfrst && (
        <div className="absolute top-2 right-2 z-30 flex flex-wrap items-center justify-end gap-1.5 pointer-events-auto">
          {/* Mode selectors */}
          <div className="flex items-center bg-black/85 border border-white/40 p-0.5 shadow-[0_0_10px_rgba(0,0,0,0.8)] font-mono text-[8px] sm:text-[9px]">
            <button
              type="button"
              onClick={() => setColorMode("real")}
              className={`px-1.5 py-0.5 transition-colors uppercase font-bold cursor-crosshair ${
                colorMode === "real"
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              }`}
              title="Paleta original stone/bone de la foto"
            >
              [ REAL ]
            </button>
            <button
              type="button"
              onClick={() => setColorMode("cyber")}
              className={`px-1.5 py-0.5 transition-colors uppercase font-bold cursor-crosshair ${
                colorMode === "cyber"
                  ? "bg-[#c4ffff] text-black"
                  : "text-white/70 hover:text-white"
              }`}
              title="Escaner cian holográfico"
            >
              [ CYBER ]
            </button>
            <button
              type="button"
              onClick={() => setColorMode("matrix")}
              className={`px-1.5 py-0.5 transition-colors uppercase font-bold cursor-crosshair ${
                colorMode === "matrix"
                  ? "bg-[#00ff88] text-black"
                  : "text-white/70 hover:text-white"
              }`}
              title="Matriz digital verde"
            >
              [ MATRIX ]
            </button>
          </div>

          {/* Laser Scan toggle */}
          <button
            type="button"
            onClick={() => setEnableScan((prev) => !prev)}
            className={`font-mono text-[8px] sm:text-[9px] px-1.5 py-1 border transition-colors uppercase cursor-crosshair font-bold shadow-[0_0_10px_rgba(0,0,0,0.8)] ${
              enableScan
                ? "bg-white text-black border-white"
                : "bg-black/85 text-white/60 border-white/30 hover:border-white"
            }`}
            title="Activar/desactivar barrido láser de escaneo"
          >
            {enableScan ? "[ SCAN: ON ]" : "[ SCAN: OFF ]"}
          </button>

          {/* Auto Rotate toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`font-mono text-[8px] sm:text-[9px] px-1.5 py-1 border transition-colors uppercase cursor-crosshair font-bold shadow-[0_0_10px_rgba(0,0,0,0.8)] ${
              autoRotate
                ? "bg-white text-black border-white"
                : "bg-black/85 text-white/60 border-white/30 hover:border-white"
            }`}
            title="Activar/pausar rotación automática"
          >
            {autoRotate ? "[ ROT: ON ]" : "[ ROT: OFF ]"}
          </button>

          {/* Reset Camera View */}
          <button
            type="button"
            onClick={resetCamera}
            className="font-mono text-[8px] sm:text-[9px] px-1.5 py-1 border border-white/40 bg-black/85 text-white hover:bg-white hover:text-black transition-colors uppercase cursor-crosshair font-bold shadow-[0_0_10px_rgba(0,0,0,0.8)]"
            title="Restablecer posición de cámara"
          >
            [ ⟲ RESET ]
          </button>
        </div>
      )}

      {/* Point Cloud Telemetry Badge in bottom-left */}
      {isP3rmfrst && (
        <div className="absolute bottom-2 left-2 z-30 pointer-events-none font-mono text-[8px] sm:text-[9px] text-white/75 bg-black/80 px-2 py-1 border border-white/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,0,0,0.8)]">
          <span className="w-1.5 h-1.5 bg-[#c4ffff] animate-ping"></span>
          <span>[ 3D POINT CLOUD: 36,400 PTS // P3RMFRST LOOK ]</span>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 42 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          depth: true,
          stencil: false,
        }}
        dpr={1}
      >
        {/* Controlled Code Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.8} />
        <directionalLight position={[-5, 5, -5]} intensity={0.9} color="#ffffff" />
        <directionalLight position={[0, -5, 5]} intensity={0.4} color="#c4ffff" />

        <Suspense fallback={<LoaderFallback />}>
          <Center>
            {isP3rmfrst ? (
              <P3rmfrstPointCloud
                colorMode={colorMode}
                enableScan={enableScan}
              />
            ) : modelUrl ? (
              <Model url={modelUrl} />
            ) : (
              <FallbackGarment />
            )}
          </Center>
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={0.65}
          minDistance={1.4}
          maxDistance={9}
          enableZoom={true}
          zoomSpeed={1.1}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.65}
          dampingFactor={0.06}
        />
      </Canvas>
    </div>
  );
}
