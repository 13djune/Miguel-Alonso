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
import Universe from './components/Universe';
import Overlay from './components/Overlay';
import ProjectModal from './components/ProjectModal';
import DesignerModal from './components/DesignerModal';
import { Project } from './types';
import { LanguageProvider } from './context/LanguageContext';
import TargetCursor from './components/TargetCursor';
import LoaderFallback from "./components/LoaderFallback";
import { Suspense } from "react";

export const hoverState = { hovered: false };

function CameraController({ selectedProject }: { selectedProject: Project | null }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (!controls) return;
    const tl = gsap.timeline();
    
    if (selectedProject) {
      // Planet position relative to its group position [-6, 0, 0]
      const targetPos = new THREE.Vector3(
        -6 + selectedProject.position[0],
        0,
        selectedProject.position[2]
      );
      
      const camOffset = new THREE.Vector3(0, 0, 5); // Close to the planet
      const finalCamPos = targetPos.clone().add(camOffset);
      
      tl.to(camera.position, {
        x: finalCamPos.x,
        y: finalCamPos.y,
        z: finalCamPos.z,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
      
      tl.to((controls as any).target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
    } else {
      tl.to(camera.position, {
        x: 0,
        y: 8,
        z: 20,
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
  
  return null;
}
function DynamicBloom() {
  const bloomRef = useRef<any>(null);
  useFrame(() => {



    if (bloomRef.current) {
      const targetIntensity = hoverState.hovered ? 3.0 : 1.5;
      const targetThreshold = hoverState.hovered ? 0.05 : 0.2;
      
      bloomRef.current.intensity = THREE.MathUtils.lerp(bloomRef.current.intensity, targetIntensity, 0.1);
      if (bloomRef.current.luminanceMaterial) {
        bloomRef.current.luminanceMaterial.threshold = THREE.MathUtils.lerp(bloomRef.current.luminanceMaterial.threshold, targetThreshold, 0.1);
      }
    }
  });

  return <Bloom ref={bloomRef} luminanceThreshold={0.2} mipmapBlur intensity={1.5} />;
}

function MovingStars() {
  const starsRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      starsRef.current.rotation.x = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={2} />
    </group>
  );
}

const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'SYS.VOID',
    description: 'Protocol 04: Industrial framework meets synthetic materials.',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
    ],
    position: [7, 3, 2],
    color: '#ff003c', // Cyber red
    distort: 0.0,
    tags: ['INDUSTRIAL', 'SYNTHETIC', 'ARMOR'],
    tools: ['CLO 3D', 'SUBSTANCE PAINTER'],
    sections: [
      { id: 'sec-1', title: '01 CONTEXT', content: 'The Void protocol was designed in response to the increasing need for resilient synthetic materials in high-stress urban environments. With global temperatures and atmospheric density fluctuating, this collection aims to provide a reliable external shell without compromising mobility.' },
      { id: 'sec-2', title: '02 MATERIALITY', content: 'Utilizing carbon-nanotube woven fabrics integrated with reactive smart polymers that harden upon impact. The inner lining consists of a thermo-regulating mesh that constantly adapts to the wearer\'s body temperature, ensuring survival in extreme conditions.' },
      { id: 'sec-3', title: '03 SILHOUETTE', content: 'Exaggerated proportions obscure the human form, offering a protective shell that redefines anatomical boundaries. The oversized yoke and elongated sleeves serve as both armor and an architectural statement against the elements.' }
    ],
    hotspots: {
      0: [
        { x: 30, y: 40, title: 'SYNTHETIC YOKE', description: 'Reinforced shoulder structure providing structural integrity.' },
        { x: 60, y: 70, title: 'THERMAL VENTING', description: 'Micro-perforations allowing heat dissipation in extreme conditions.' }
      ],
      1: [
        { x: 50, y: 30, title: 'OPTICAL MASK', description: 'Polarized visor integration to shield from harsh UV radiation.' }
      ]
    }
  },
  {
    id: '2',
    title: 'NEO-GRAVITY',
    description: 'Heavy architectural constructions resisting standard atmospheric pressure.',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1571512503254-8c85779ec461?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-5, -4, -6],
    color: '#00ff00', // Neon green
    distort: 0.0,
    tags: ['ZERO-G', 'COMPRESSION', 'TECHNICAL'],
    tools: ['MARVELOUS DESIGNER', 'CINEMA 4D'],
    sections: [
      { id: 'sec-1', title: '01 GRAVITY SHIELD', content: 'Engineered for environments with non-standard gravitational pull, this collection features weighted hems and rigid structures that prevent the garments from floating or losing shape in zero-G or low-G environments.' },
      { id: 'sec-2', title: '02 COMPRESSION ZONES', content: 'Strategic compression bands are woven into the torso and extremities to maintain blood circulation when atmospheric pressure drops. The visual language is highly technical, with visible seams indicating the pressure nodes.' },
      { id: 'sec-3', title: '03 DEPLOYABLE ANCHORS', content: 'The outerwear includes deployable magnetic anchors at the cuffs and collar, allowing the wearer to secure themselves to metallic surfaces, blending survival gear with avant-garde aesthetics.' }
    ],
    hotspots: {
      0: [
        { x: 45, y: 60, title: 'WEIGHTED HEM', description: 'Lead-lined hem to maintain structure.' }
      ]
    }
  },
  {
    id: '3',
    title: 'MONOLITHIC',
    description: 'Brutalist structures adapted for human anatomical interfacing.',
    images: [
      'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800'
    ],
    position: [-8, 5, 4],
    color: '#00ccff', // Cyan
    distort: 0.0,
    tags: ['BRUTALIST', 'GEOMETRIC', 'MODULAR'],
    tools: ['BLENDER', 'UNREAL ENGINE'],
    sections: [
      { id: 'sec-1', title: '01 BRUTALIST', content: 'Inspired by raw concrete and monolithic architecture, translated into wearable textile forms. The garments feature stiffened panels that mimic the uncompromising lines of brutalist structures.' },
      { id: 'sec-2', title: '02 ACOUSTIC DAMPENING', content: 'The dense, multi-layered fabric acts as an acoustic shield, isolating the wearer from the chaotic noise of mega-cities. Each piece functions as a personal sanctuary.' },
      { id: 'sec-3', title: '03 MODULARITY', content: 'Large geometric blocks can be detached or reconfigured, allowing the silhouette to shift from a towering monolith to a more streamlined, functional uniform.' }
    ]
  },
  {
    id: '4',
    title: 'EXO-ARMOR',
    description: 'Tactical defense layering with high-tensile carbon polymers.',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800'
    ],
    position: [6, -6, 9],
    color: '#ffaa00', // Orange
    distort: 0.0,
    tags: ['TACTICAL', 'STEALTH', 'KINETIC'],
    tools: ['CLO 3D', 'TOUCHDESIGNER'],
    sections: [
      { id: 'sec-1', title: '01 TACTICAL LAYERING', content: 'A modular defense system composed of high-tensile carbon polymers. Designed for mobility and impact resistance in hostile territories.' },
      { id: 'sec-2', title: '02 KINETIC ABSORPTION', content: 'The outer shell features hexagonal kinetic absorbers that distribute blunt force across the entire garment, neutralizing impacts.' },
      { id: 'sec-3', title: '03 STEALTH INTEGRATION', content: 'While visually aggressive, the materials incorporate radar-absorbent threading, making the wearer virtually invisible to standard scanning technologies.' }
    ],
  }
];

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalActive, setModalActive] = useState(false);
  const [designerModalActive, setDesignerModalActive] = useState(false);
  
  
  

  const universeContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handlePlanetClick = (project: Project) => {
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

        <IntroCurtain />

        <TargetCursor cursorColor="#ccff00" cursorColorOnTarget="#ffffff" />
        
        {/* Scanlines Effect */}
        <div className="scanlines"></div>

        {/* Cyber Brutalist Grid */}
        <div className="absolute inset-0 bg-cyber-grid z-0 pointer-events-none"></div>

        {/* 3D Scene Wrapper for Animation */}
        <div ref={universeContainerRef} className="absolute inset-0 z-0 origin-center will-change-transform">
          <Canvas 
            camera={{ position: [0, 8, 20], fov: 45 }} 
            style={{ width: '100vw', height: '100vh' }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            <CameraController selectedProject={selectedProject} />
            
            <Suspense fallback={<LoaderFallback />}>
              <MovingStars />
              <group position={[-6, 0, 0]}>
                <Universe projects={PROJECTS} onPlanetClick={handlePlanetClick} />
              </group>
            </Suspense>
            
            <EffectComposer>
              <DynamicBloom />
            </EffectComposer>
            <OrbitControls 
              enablePan={false}
              enableZoom={!modalActive}
              maxDistance={40}
              minDistance={3}
              makeDefault
              autoRotate={!selectedProject}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        {/* Overlay UI */}
        <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${modalActive ? 'opacity-0' : 'opacity-100'}`}>
          <Overlay onOpenDesigner={() => setDesignerModalActive(true)} onSelectProject={(index) => handlePlanetClick(PROJECTS[index])} />
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
      </div>
    </LanguageProvider>
  );
}