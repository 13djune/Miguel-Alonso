import IntroCurtain from "./components/IntroCurtain";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import * as THREE from "three";
import gsap from "gsap";
import Universe, { selectedPlanetWorldPos } from "./components/Universe";
import Overlay from "./components/Overlay";
import ProjectModal from "./components/ProjectModal";
import CollectionsView from "./components/CollectionsView";
import DesignerModal from "./components/DesignerModal";
import { Project } from "./types";
import { LanguageProvider } from "./context/LanguageContext";
import TargetCursor from "./components/TargetCursor";
import LoaderFallback from "./components/LoaderFallback";
import { Suspense } from "react";
import { INDUSTRY_PROJECTS } from "./data/industryProjects";
import { CREATIVE_PROJECTS } from "./data/creativeProjects";

function CameraDebug() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const el = document.getElementById("debug-coords");
    if (el) {
      el.innerText = `CAM: X:${camera.position.x.toFixed(2)} Y:${camera.position.y.toFixed(2)} Z:${camera.position.z.toFixed(2)} | PTR: X:${pointer.x.toFixed(2)} Y:${pointer.y.toFixed(2)}`;
    }
  });
  return null;
}

export const hoverState = { hovered: false };

function CameraController({
  selectedProject,
  activeUniverse,
}: {
  selectedProject: Project | null;
  activeUniverse: string;
}) {
  const { camera, controls } = useThree();
  const isFollowing = useRef(false);
  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!controls) return;
    const tl = gsap.timeline();

    if (selectedProject) {
      isFollowing.current = true;
    } else {
      isFollowing.current = false;
      const aspect =
        typeof window !== "undefined"
          ? window.innerWidth / Math.max(window.innerHeight, 1)
          : 1.6;
      const isMobile =
        window.innerWidth < 768 || window.innerHeight > window.innerWidth;

      // Calculate positions based on universe mode
      let targetX = -6;
      let targetY = 0;
      let targetZ = 0;

      let camX, camY, camZ;
      if (activeUniverse === "all") {
        // Balanced center between Creative (Z=-2, X=-11) and Industry (Z=+2, X=-1)
        // Perspective compensation: Industry is closer (+2Z), so camera at X=-4.8 gives equal framing to both systems
        camX = -4.8;
        camY = 2.2;
        camZ = Math.max(11.0, 16.0 / Math.min(aspect, 1.7));
      } else {
        camX = -6.0;
        camY = 2.0;
        camZ = Math.max(8.5, 11.5 / Math.min(aspect, 1.6));
      }

      if (isMobile) {
        camY *= 1.25;
        camZ *= 1.25;
      }

      tl.to(
        camera.position,
        {
          x: camX,
          y: camY,
          z: camZ,
          duration: 1.5,
          ease: "power3.inOut",
        },
        0,
      );

      tl.to(
        (controls as any).target,
        {
          x: targetX,
          y: targetY,
          z: targetZ,
          duration: 1.5,
          ease: "power3.inOut",
        },
        0,
      );
    }
  }, [selectedProject, camera, controls, activeUniverse]);

  useFrame(() => {
    if (isFollowing.current && controls) {
      const p = selectedPlanetWorldPos.current;
      targetLookAt.current.copy(p);
      // We want the camera to look at the planet, but from a comfortable distance and angle.
      // E.g., slightly above and back.
      targetCamPos.current.copy(p).add(new THREE.Vector3(-1.5, 0.5, 2.0));

      camera.position.lerp(targetCamPos.current, 0.03);
      (controls as any).target.lerp(targetLookAt.current, 0.03);
    }
  });

  return null;
}

const PROJECTS: Project[] = [
  ...CREATIVE_PROJECTS,
  ...INDUSTRY_PROJECTS,
];

function MovingStars() {
  const starsRef = useRef<THREE.Group>(null);

  // Stars are static now as requested
  useFrame(() => {
    // No rotation
  });

  return (
    <group ref={starsRef}>
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </group>
  );
}

function DynamicBloom({
  selectedProject,
}: {
  selectedProject: Project | null;
}) {
  const bloomRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (bloomRef.current) {
      let targetIntensity = 0.6; // Reduced base intensity
      let targetThreshold = 0.6; // Higher threshold so only very bright things bloom

      if (selectedProject) {
        // CRT Flicker effect
        const flicker =
          Math.sin(clock.elapsedTime * 60) * 0.15 +
          Math.sin(clock.elapsedTime * 14) * 0.1 +
          Math.random() * 0.05;
        targetIntensity = 0.9 + flicker * 0.5;
        targetThreshold = 0.8;
      }

      bloomRef.current.intensity = THREE.MathUtils.lerp(
        bloomRef.current.intensity,
        targetIntensity,
        0.2,
      );
      bloomRef.current.luminanceThreshold = THREE.MathUtils.lerp(
        bloomRef.current.luminanceThreshold,
        targetThreshold,
        0.2,
      );
    }
  });

  return (
    <Bloom
      ref={bloomRef}
      luminanceThreshold={0.3}
      luminanceSmoothing={0.9}
      intensity={1.2}
      mipmapBlur
    />
  );
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalActive, setModalActive] = useState(false);
  const [designerModalActive, setDesignerModalActive] = useState(false);
  const [collectionsModalActive, setCollectionsModalActive] = useState(false);
  const [appMode, setAppMode] = useState<"loading" | "terminal" | "universe">(
    "loading",
  );
  const [activeUniverse, setActiveUniverse] = useState<
    "all" | "creative" | "industry"
  >("all");

  const universeContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handlePlanetClick = (project: Project) => {
    setAppMode("universe");
    setModalActive(true);
    setSelectedProject(project);

    if (modalContainerRef.current) {
      gsap.fromTo(
        modalContainerRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.2,
        },
      );
    }
  };

  const handleCloseModal = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setModalActive(false);
        setSelectedProject(null);
      },
    });

    if (modalContainerRef.current) {
      tl.to(
        modalContainerRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.95,
          duration: 0.6,
          ease: "power3.inOut",
        },
        0,
      );
    }
  };

  const handleNextProject = () => {
    if (!selectedProject) return;
    const currentIndex = PROJECTS.findIndex((p) => p.id === selectedProject.id);
    const nextIndex = (currentIndex + 1) % PROJECTS.length;
    setSelectedProject(PROJECTS[nextIndex]);
  };

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const currentIndex = PROJECTS.findIndex((p) => p.id === selectedProject.id);
    const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length;
    setSelectedProject(PROJECTS[prevIndex]);
  };

  return (
    <LanguageProvider>
      <div className="w-full h-[100dvh] min-h-screen bg-black overflow-hidden relative font-sans text-white select-none">
        <IntroCurtain onComplete={() => setAppMode("terminal")} />

        {/* Cyber Brutalist Grid */}
        <div className="absolute inset-0 bg-cyber-grid z-0 pointer-events-none"></div>
        <div className="tv-dot-overlay"></div>

        {/* 3D Scene Wrapper for Animation */}
        <div
          ref={universeContainerRef}
          className={`absolute inset-0 z-0 origin-center will-change-[opacity,transform] transition-opacity duration-700 ease-in-out ${appMode === "universe" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Canvas
            camera={{
              position: [
                -4.8,
                typeof window !== "undefined" && window.innerWidth < 768
                  ? 3.2
                  : 2.2,
                typeof window !== "undefined"
                  ? Math.max(
                      11.0,
                      16.0 /
                        Math.min(
                          window.innerWidth / Math.max(window.innerHeight, 1),
                          1.7,
                        ),
                    ) * (window.innerWidth < 768 ? 1.25 : 1)
                  : 12.0,
              ],
              fov: 45,
            }}
            style={{ width: "100vw", height: "100vh" }}
            gl={{ antialias: false, powerPreference: "high-performance" }}
            dpr={1}
          >
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            <CameraController
              selectedProject={selectedProject}
              activeUniverse={activeUniverse}
            />
            <CameraDebug />

            <Suspense fallback={<LoaderFallback />}>
              <MovingStars />
              <group position={[-6, 0, 0]}>
                <Universe
                  projects={PROJECTS}
                  onPlanetClick={handlePlanetClick}
                  selectedProject={selectedProject}
                  activeUniverse={activeUniverse}
                  appMode={appMode}
                />
              </group>
            </Suspense>
            {/* Effect Composer (Bloom) disabled for massive performance boost */}

            <OrbitControls
              enablePan={false}
              enableZoom={!modalActive}
              minDistance={2}
              maxDistance={activeUniverse === "all" ? 35 : 25}
              makeDefault
              autoRotate={false}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        {/* Overlay UI */}
        <div
          className={`absolute inset-0 z-10 pointer-events-none will-change-[opacity] transition-opacity duration-700 ease-in-out ${modalActive ? "opacity-0" : "opacity-100"}`}
        >
          {appMode !== "loading" && (
            <Overlay
              appMode={appMode}
              activeUniverse={activeUniverse}
              onSetUniverse={setActiveUniverse}
              projects={PROJECTS}
              selectedProject={selectedProject}
              onEnterUniverse={() => setAppMode("universe")}
              onOpenDesigner={() => setDesignerModalActive(true)}
              onSelectProject={(index) => handlePlanetClick(PROJECTS[index])}
              onOpenCollections={() => setCollectionsModalActive(true)}
            />
          )}
        </div>

        {/* Project Modal */}
        <div
          ref={modalContainerRef}
          className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center will-change-[opacity,transform]"
          style={{ opacity: 0, visibility: modalActive ? "visible" : "hidden" }}
        >
          <div className="w-full h-full pointer-events-auto">
            {selectedProject && (
              <ProjectModal
                project={selectedProject}
                onClose={handleCloseModal}
                onNextProject={handleNextProject}
                onPrevProject={handlePrevProject}
                currentProjectIndex={PROJECTS.findIndex(
                  (p) => p.id === selectedProject.id,
                )}
                totalProjects={PROJECTS.length}
              />
            )}
          </div>
        </div>

        {/* Designer Modal */}
        {designerModalActive && (
          <DesignerModal onClose={() => setDesignerModalActive(false)} />
        )}

        {/* Collections Modal */}
        {collectionsModalActive && (
          <CollectionsView
            projects={PROJECTS}
            onClose={() => setCollectionsModalActive(false)}
            onSelectProject={(project) => {
              setCollectionsModalActive(false);
              handlePlanetClick(project);
            }}
          />
        )}
      </div>
      <TargetCursor appMode={appMode} />
    </LanguageProvider>
  );
}
