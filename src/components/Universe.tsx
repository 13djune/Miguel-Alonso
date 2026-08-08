import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Project } from '../types';
import { hoverState } from '../App';

interface UniverseProps {
  projects: Project[];
  onPlanetClick: (project: Project) => void;
}

const sharedIcosahedron = new THREE.IcosahedronGeometry(1.5, 0);
const sharedEdgesGeometry = new THREE.EdgesGeometry(sharedIcosahedron, 15);

function ProjectNode({ project, onClick }: { project: Project, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  useEffect(() => {
    if (meshRef.current && materialRef.current) {
      if (pressed) {
        gsap.to(meshRef.current.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 0.1, ease: 'power2.out' });
        gsap.to(materialRef.current, { emissiveIntensity: 1.0, duration: 0.1 });
      } else if (hovered) {
        gsap.to(meshRef.current.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.5, ease: 'back.out(1.5)' });
        gsap.to(materialRef.current, { emissiveIntensity: 0.8, duration: 0.3 });
      } else {
        gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power3.out' });
        gsap.to(materialRef.current, { emissiveIntensity: 0, duration: 0.3 });
      }
    }
  }, [hovered, pressed]);

  return (
    <group 
      position={[project.position[0], 0, project.position[2]]} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        hoverState.hovered = true;
        document.body.style.cursor = 'crosshair';
        
        if (targetRef.current) {
           window.dispatchEvent(new CustomEvent('cursor-lock', {
             detail: { target: targetRef.current }
           }));
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        setPressed(false);
        hoverState.hovered = false;
        document.body.style.cursor = 'auto';
        
        window.dispatchEvent(new CustomEvent('cursor-unlock', {
          detail: { target: targetRef.current }
        }));
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        setPressed(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setPressed(false);
      }}
      onPointerCancel={() => {
        setPressed(false);
      }}
    >
      <mesh>
        <sphereGeometry args={[4.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    <mesh 
      ref={meshRef}
      
      geometry={sharedIcosahedron}
    >
      <meshStandardMaterial 
        ref={materialRef}
        color="#000000" 
        emissive={project.color}
        emissiveIntensity={0}
        metalness={0.9}
        roughness={0.1}
        flatShading
      />
      <Edges scale={1.05} threshold={15} color={project.color} />
      
      {/* Mobile/Touch Label */}
      <Html center>
        <div 
          ref={targetRef} 
          className="w-16 h-16 rounded-full pointer-events-none"
        />
      </Html>
      <Html 
        position={[0, 2.5, 0]} 
        center 
        style={{ 
          transition: 'all 0.3s', 
          opacity: hovered ? 1 : 0.4, 
          transform: `scale(${hovered ? 1.2 : 1})`,
          pointerEvents: 'none' 
        }}
      >
        <div className="flex flex-col items-center">
          <div className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest bg-black/80 backdrop-blur-sm border border-[#ccff00]/30 px-3 py-1.5 text-[#ccff00] whitespace-nowrap shadow-[0_0_10px_rgba(204,255,0,0.2)]">
            {project.title}
          </div>
          <div className="w-px h-6 bg-gradient-to-b from-[#ccff00]/50 to-transparent"></div>
        </div>
      </Html>
    </mesh>
    </group>
  );
}

function OrbitGroup({ project, radius, onClick }: { project: Project, radius: number, onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitSpeed = 0.2 + (Number(project.id) * 0.05); // different speed for each orbit

  // Use the planet's Y position to tilt the orbit
  const tiltX = (project.position[1] / radius) * 0.5;
  const tiltZ = (project.position[1] / radius) * 0.5;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * orbitSpeed;
    }
  });

  return (
    <group rotation={[tiltX, 0, tiltZ]}>
      <group ref={groupRef}>
        {/* Architectural Orbit */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
          <meshBasicMaterial color="#ccff00" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>

        {/* Interactive Project Monolith */}
        <ProjectNode project={project} onClick={onClick} />
      </group>
    </group>
  );
}

export default function Universe({ projects, onPlanetClick }: UniverseProps) {
  return (
    <group>
      {/* Central Structure */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#ccff00" distance={50} />
      <mesh position={[0,0,0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#ccff00" wireframe />
      </mesh>
      
      {/* Central Data Core Aura */}
      <mesh position={[0,0,0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ccff00" transparent opacity={0.05} />
      </mesh>
      
      {projects.map((project) => {
        const radius = Math.sqrt(project.position[0]**2 + project.position[2]**2);
        return <OrbitGroup key={project.id} project={project} radius={radius} onClick={() => onPlanetClick(project)} />;
      })}
    </group>
  );
}
