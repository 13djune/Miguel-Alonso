import IntroCurtain from './components/IntroCurtain';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import * as THREE from 'three';
import gsap from 'gsap';
import Universe, { selectedPlanetWorldPos } from './components/Universe';
import Overlay from './components/Overlay';
import ProjectModal from './components/ProjectModal';
import CollectionsView from './components/CollectionsView';
import DesignerModal from './components/DesignerModal';
import { Project } from './types';
import { LanguageProvider } from './context/LanguageContext';
import TargetCursor from './components/TargetCursor';
import LoaderFallback from "./components/LoaderFallback";
import { Suspense } from "react";


function CameraDebug() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const el = document.getElementById('debug-coords');
    if (el) {
      el.innerText = `CAM: X:${camera.position.x.toFixed(2)} Y:${camera.position.y.toFixed(2)} Z:${camera.position.z.toFixed(2)} | PTR: X:${pointer.x.toFixed(2)} Y:${pointer.y.toFixed(2)}`;
    }
  });
  return null;
}

export const hoverState = { hovered: false };

function CameraController({ selectedProject }: { selectedProject: Project | null }) {
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
      tl.to(camera.position, {
        x: -6,
        y: 1.0,
        z: 5.0,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
      
      tl.to((controls as any).target, {
        x: -6,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
    }
  }, [selectedProject, camera, controls]);

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
  // UNIVERSO 1: CREATIVE
  {
    id: '1',
    title: '01 SYS.VOID',
    description: 'An exploration of empty space and negative volumes in modern tailoring.',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-8, -4, 0],
    color: '#ff3399',
    distort: 0.2,
    tags: ['AVANT-GARDE', 'MINIMALISM', 'DECONSTRUCTION'],
    tools: ['CLO 3D', 'MARVELOUS DESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 CONCEPT', content: 'SYS.VOID explores the tension between presence and absence.' },
      { id: 'sec-2', title: '02 MATERIALITY', content: 'Utilizing next-generation memory polymers and ultra-lightweight organza.' }
    ]
  },
  {
    id: '2',
    title: '02 NEO-GRAVITY',
    description: 'A study on weightless forms and suspended silhouettes.',
    images: [
      'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-5, 4, -5],
    color: '#00ffcc',
    distort: 0.4,
    tags: ['WEIGHTLESS', 'SUSPENDED', 'FUTURISM'],
    tools: ['CINEMA 4D', 'SUBSTANCE DESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 ZERO-G DYNAMICS', content: 'Designed for environments with altered gravitational states.' },
      { id: 'sec-2', title: '02 ADAPTIVE FIBERS', content: 'Smart textiles embedded with micro-actuators.' }
    ]
  },
  {
    id: '3',
    title: '03 AURA-MESH',
    description: 'Ethereal digital meshes intersecting with human anatomy.',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-10, 2, -2],
    color: '#9933ff',
    distort: 0.3,
    tags: ['ETHEREAL', 'DIGITAL', 'MESH'],
    tools: ['BLENDER', 'MARVELOUS DESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 DIGITAL AURA', content: 'Translucent meshes acting as a second skin.' }
    ]
  },
  {
    id: '4',
    title: '04 LUMINO-WEAVE',
    description: 'Biometric responsive light-emitting textiles.',
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-6, 6, 2],
    color: '#ffcc00',
    distort: 0.5,
    tags: ['BIOMETRIC', 'LUMINOUS', 'TEXTILE'],
    tools: ['TOUCHDESIGNER', 'CLO 3D'],
    sections: [
      { id: 'sec-1', title: '01 BIO-REACTION', content: 'Fabric illuminates based on heart rate.' }
    ]
  },
  // UNIVERSO 2: INDUSTRY
  {
    id: '5',
    title: '05 MONOLITHIC',
    description: 'Structural garments inspired by brutalist architecture and geometric volumes.',
    images: [
      'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800'
    ],
    position: [8, -3, 2],
    color: '#ff3333',
    distort: 0.1,
    tags: ['BRUTALISM', 'GEOMETRY', 'URBAN'],
    tools: ['BLENDER', 'UNREAL ENGINE'],
    sections: [
      { id: 'sec-1', title: '01 BRUTALIST', content: 'Inspired by raw concrete and monolithic architecture.' }
    ]
  },
  {
    id: '6',
    title: '06 EXO-ARMOR',
    description: 'Tactical defense layering with high-tensile carbon polymers.',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800'
    ],
    position: [6, 3, -6],
    color: '#33ff33',
    distort: 0.3,
    tags: ['TACTICAL', 'DEFENSE', 'ARMOR'],
    tools: ['CLO 3D', 'TOUCHDESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 TACTICAL LAYERING', content: 'A modular defense system composed of high-tensile carbon polymers.' }
    ]
  },
  {
    id: '7',
    title: '07 MECHA-WEAR',
    description: 'Industrial-grade exoskeleton integrated streetwear.',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&q=80&w=800'
    ],
    position: [10, 5, 0],
    color: '#ff9900',
    distort: 0.2,
    tags: ['MECHA', 'INDUSTRIAL', 'STREET'],
    tools: ['ZBRUSH', 'MAYA'],
    sections: [
      { id: 'sec-1', title: '01 EXOSKELETON', content: 'Mechanical supports woven into daily wear.' }
    ]
  },
  {
    id: '8',
    title: '08 SYNTH-SKIN',
    description: 'Synthetic protective layering for extreme environments.',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
    ],
    position: [5, -6, -3],
    color: '#33ccff',
    distort: 0.4,
    tags: ['SYNTHETIC', 'PROTECTIVE', 'EXTREME'],
    tools: ['MARVELOUS DESIGNER', 'KEYSHOT'],
    sections: [
      { id: 'sec-1', title: '01 ALL-WEATHER', content: 'Adapts to extreme temperatures autonomously.' }
    ]
  }
];

function MovingStars() {
  const starsRef = useRef<THREE.Group>(null);
  
  // Stars are static now as requested
  useFrame(() => {
    // No rotation
  });

  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}


function DynamicBloom({ selectedProject }: { selectedProject: Project | null }) {
  const bloomRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (bloomRef.current) {
      let targetIntensity = 0.6; // Reduced base intensity
      let targetThreshold = 0.6; // Higher threshold so only very bright things bloom
      
      if (selectedProject) {
        // CRT Flicker effect
        const flicker = Math.sin(clock.elapsedTime * 60) * 0.15 + Math.sin(clock.elapsedTime * 14) * 0.1 + Math.random() * 0.05;
        targetIntensity = 0.9 + flicker * 0.5;
        targetThreshold = 0.8;
      }
      
      bloomRef.current.intensity = THREE.MathUtils.lerp(bloomRef.current.intensity, targetIntensity, 0.2);
      bloomRef.current.luminanceThreshold = THREE.MathUtils.lerp(bloomRef.current.luminanceThreshold, targetThreshold, 0.2);
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
  const [appMode, setAppMode] = useState<'loading' | 'terminal' | 'universe'>('loading');
  const [activeUniverse, setActiveUniverse] = useState<'all' | 'creative' | 'industry'>('all');
  
  
  

  const universeContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handlePlanetClick = (project: Project) => {
    setAppMode('universe');
    setModalActive(true);
    setSelectedProject(project);
    
    if (modalContainerRef.current) {
      gsap.fromTo(modalContainerRef.current, 
        { opacity: 0, rotationX: 10 },
        { opacity: 1, rotationX: 0, duration: 1.5, ease: 'power3.out', delay: 0.2 }
      );
    }
  };

  const handleCloseModal = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setModalActive(false);
        setSelectedProject(null);
      }
    });

    if (modalContainerRef.current) {
      tl.to(modalContainerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power3.inOut'
      }, 0);
    }
  };

  const handleNextProject = () => {
    if (!selectedProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === selectedProject.id);
    const nextIndex = (currentIndex + 1) % PROJECTS.length;
    setSelectedProject(PROJECTS[nextIndex]);
  };

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === selectedProject.id);
    const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length;
    setSelectedProject(PROJECTS[prevIndex]);
  };

  return (
    <LanguageProvider>
      <div className="w-full h-screen bg-black overflow-hidden relative font-sans text-white">

        <IntroCurtain onComplete={() => setAppMode('terminal')} />

        <TargetCursor cursorColor="#c4ffff" cursorColorOnTarget="#ffffff" />
        
        <div id="debug-coords" className="absolute bottom-4 right-4 text-[10px] font-mono text-[#c4ffff] pointer-events-none z-50 opacity-60 text-right tracking-wider"></div>
        {/* Scanlines Effect */}
        <div className="scanlines pointer-events-none"></div>

        {/* Cyber Brutalist Grid */}
        <div className="absolute inset-0 bg-cyber-grid z-0 pointer-events-none"></div>

        {/* 3D Scene Wrapper for Animation */}
        <div ref={universeContainerRef} className={`absolute inset-0 z-0 origin-center will-change-transform transition-opacity duration-1000 ${appMode === 'universe' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Canvas 
            camera={{ position: [-6, 1.0, 5.0], fov: 45 }} 
            style={{ width: '100vw', height: '100vh' }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            <CameraController selectedProject={selectedProject} />
            <CameraDebug />
            
            <Suspense fallback={<LoaderFallback />}>
              <MovingStars />
              <group position={[-6, 0, 0]}>
                <Universe projects={PROJECTS} onPlanetClick={handlePlanetClick} selectedProject={selectedProject} activeUniverse={activeUniverse} />
              </group>
            </Suspense>
            <EffectComposer>
              <DynamicBloom selectedProject={selectedProject} />
            </EffectComposer>
            
            
            <OrbitControls 
              enablePan={false}
              enableZoom={!modalActive}
              minDistance={2}
              maxDistance={16}
              makeDefault
              autoRotate={false}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        {/* Overlay UI */}
        <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${modalActive ? 'opacity-0' : 'opacity-100'}`}>
          {appMode !== 'loading' && (
          <Overlay appMode={appMode} activeUniverse={activeUniverse} onSetUniverse={setActiveUniverse} projects={PROJECTS} selectedProject={selectedProject} onEnterUniverse={() => setAppMode('universe')} onOpenDesigner={() => setDesignerModalActive(true)} onSelectProject={(index) => handlePlanetClick(PROJECTS[index])} onOpenCollections={() => setCollectionsModalActive(true)} />
          )}
        </div>

        {/* Project Modal */}
        <div 
          ref={modalContainerRef} 
          className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          style={{ opacity: 0, visibility: modalActive ? 'visible' : 'hidden' }}
        >
          <div className="w-full h-full pointer-events-auto">
            {selectedProject && (
              <ProjectModal 
                project={selectedProject} 
                onClose={handleCloseModal}
                onNextProject={handleNextProject}
                onPrevProject={handlePrevProject}
                currentProjectIndex={PROJECTS.findIndex(p => p.id === selectedProject.id)}
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
    </LanguageProvider>
  );
}