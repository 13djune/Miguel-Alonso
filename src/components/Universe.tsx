import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line, Points } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Project } from '../types';
import { hoverState } from '../App';


const createGlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
};
const glowTexture = createGlowTexture();
export const selectedPlanetWorldPos = { current: new THREE.Vector3() };

interface UniverseProps {
  projects: Project[];
  onPlanetClick: (project: Project) => void;
  selectedProject?: Project | null;
  activeUniverse?: 'all' | 'creative' | 'industry';
}

function ProjectNode({ project, onClick, index, isSelected, selectedProjectId }: { project: Project, onClick: () => void, index: number, isSelected?: boolean, selectedProjectId?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowMaterialRef = useRef<THREE.SpriteMaterial>(null);
  const glowMeshRef = useRef<THREE.Sprite>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  
  const handleHoverIn = () => {
    setHovered(true);
    hoverState.hovered = true;
    document.body.style.cursor = 'crosshair';
    if (targetRef.current) {
       window.dispatchEvent(new CustomEvent('cursor-lock', {
          detail: { target: targetRef.current }
       }));
    }
  };

  const handleHoverOut = () => {
    setHovered(false);
    setPressed(false);
    hoverState.hovered = false;
    document.body.style.cursor = 'auto';
    window.dispatchEvent(new CustomEvent('cursor-unlock', {
      detail: { target: targetRef.current }
    }));
  };

  const planetRingPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * 0.18, 0, Math.sin(angle) * 0.18));
    }
    return pts;
  }, []);
  
  useEffect(() => {
    if (groupRef.current && materialRef.current && glowMaterialRef.current && glowMeshRef.current) {
      if (pressed) {
        gsap.to(groupRef.current.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 0.1, ease: 'power2.out' });
        gsap.to(materialRef.current, { emissiveIntensity: 0.8, duration: 0.1 });
        gsap.to(glowMaterialRef.current, { opacity: 0.8, duration: 0.1 });
        gsap.to(glowMeshRef.current.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.1 });
      } else if (hovered) {
        gsap.to(groupRef.current.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.5, ease: 'back.out(1.5)' });
        gsap.to(materialRef.current, { emissiveIntensity: 0.6, duration: 0.3 });
        gsap.to(glowMaterialRef.current, { opacity: 0.4, duration: 0.3 });
        gsap.to(glowMeshRef.current.scale, { x: 0.45, y: 0.45, z: 0.45, duration: 0.5, ease: "power2.out" });
      } else {
        gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power3.out' });
        gsap.to(materialRef.current, { emissiveIntensity: 0.1, duration: 0.3 });
        gsap.to(glowMaterialRef.current, { opacity: 0.15, duration: 0.3 });
        gsap.to(glowMeshRef.current.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.5 });
      }
    }
  }, [hovered, pressed]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
      groupRef.current.rotation.x = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group 
      position={[0, 0, 0]} 
      onClick={(e) => {
        if (selectedProjectId && !isSelected) return;
        e.stopPropagation();
        if (e.delta <= 5) onClick();
      }}
      onPointerOver={(e) => {
        if (selectedProjectId && !isSelected) return;
        e.stopPropagation();
        setHovered(true);
        hoverState.hovered = true;
        document.body.style.cursor = 'crosshair';
        if (targetRef.current) window.dispatchEvent(new CustomEvent('cursor-lock', { detail: { target: targetRef.current } }));
      }}
      onPointerOut={() => {
        if (selectedProjectId && !isSelected) return;
        setHovered(false);
        setPressed(false);
        hoverState.hovered = false;
        document.body.style.cursor = 'auto';
        window.dispatchEvent(new CustomEvent('cursor-unlock', { detail: { target: targetRef.current } }));
      }}
      onPointerDown={() => { if (!(selectedProjectId && !isSelected)) setPressed(true); }}
      onPointerUp={() => { if (!(selectedProjectId && !isSelected)) setPressed(false); }}
      onPointerCancel={() => { if (!(selectedProjectId && !isSelected)) setPressed(false); }}
    >
      

      <group ref={groupRef}>
        {/* Invisible Hit Area for easier clicking/hovering */}
        <mesh visible={false}>
          <sphereGeometry args={[0.6, 16, 16]} />
        </mesh>
        {/* Shiny polygonal reflective core */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial 
            ref={materialRef}
            color="#222222" 
            emissive={project.color}
            emissiveIntensity={(selectedProjectId && !isSelected) ? 0.02 : (isSelected ? 0.4 : 0.1)}
            metalness={1}
            roughness={0.2}
            flatShading={true}
          />
        </mesh>
        
        {/* Glow - fading sprite */}
        <sprite ref={glowMeshRef} scale={[0.3, 0.3, 0.3]}>
          <spriteMaterial ref={glowMaterialRef} map={glowTexture} color={project.color} transparent opacity={(selectedProjectId && !isSelected) ? 0.05 : 0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>

        {/* Dotted sphere */}
        <points>
          <sphereGeometry args={[0.14, 24, 24]} />
          <pointsMaterial color={project.color} size={0.008} transparent opacity={0.4} sizeAttenuation={true} />
        </points>

        {/* Planet ring */}
        <Line points={planetRingPoints} color={project.color} dashed={true} dashScale={1} dashSize={0.05} gapSize={0.05} transparent opacity={0.5} lineWidth={1} />
        
        {/* Target Brackets when hovered */}
        {(hovered || isSelected) && (
          <Html center style={{ pointerEvents: 'none' }}>
            <div className="w-16 h-16 border opacity-50 border-dashed animate-spin-slow" style={{ borderColor: project.color }}></div>
          </Html>
        )}
      </group>

      {/* Mobile/Touch Label Reference */}
      <Html center>
        <div 
          ref={targetRef} 
          className="w-16 h-16 rounded-full pointer-events-none"
        />
      </Html>

      <Html 
        position={[0, 0, 0]}
        center
        zIndexRange={[100, 5]} 
        style={{ 
          transition: 'opacity 0.3s, color 0.3s', 
          opacity: (selectedProjectId && !isSelected) ? 0.1 : (hovered || isSelected) ? 1 : 0.8, 
          pointerEvents: (selectedProjectId && !isSelected) ? "none" : "auto", cursor: "pointer",
          color: (hovered || isSelected) ? project.color : 'white'
        }}
      >
        <div 
          tabIndex={0}
          onPointerEnter={() => handleHoverIn()} 
          onPointerLeave={() => handleHoverOut()} 
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClick(); } }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onFocus={(e) => { handleHoverIn(); }}
          onBlur={(e) => { handleHoverOut(); }} 
          className="flex flex-col items-center justify-center rounded-sm transition-all duration-300"
          style={{ 
            border: hovered || isSelected ? `1px solid ${project.color}` : '1px solid transparent',
            backgroundColor: hovered || isSelected ? 'rgba(0,0,0,0.4)' : 'transparent',
            boxShadow: hovered || isSelected ? `0 0 15px ${project.color}33 inset, 0 0 10px ${project.color}33` : 'none',
            width: '90px',
            height: '90px',
            transform: 'translateY(10px)' 
          }}>
          <div className="mt-auto mb-2 text-[8px] md:text-[9px] font-mono tracking-widest whitespace-nowrap uppercase border bg-black/80 px-1.5 py-0.5 backdrop-blur-md transition-all duration-300" 
               style={{ 
                 borderColor: (hovered || isSelected) ? project.color : 'rgba(255, 255, 255, 0.2)',
                 boxShadow: (hovered || isSelected) ? `0 0 8px ${project.color}66` : 'none',
               }}>
            [ {project.title.replace(/^[0-9]+ /, '')} ]
          </div>
        </div>
      </Html>
    </group>
  );
}

function OrbitGroup({ project, radius, onClick, index, isSelected, isFocused, selectedProjectId }: { project: Project, radius: number, onClick: () => void, index: number, isSelected?: boolean, isFocused?: boolean, selectedProjectId?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitSpeed = 0.08 + (index * 0.03);
  
  // Elliptical orbit to match the screenshot
  const radiusX = radius;
  const radiusZ = radius * 0.6; // Flatten it more

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radiusX, 0, Math.sin(angle) * radiusZ));
    }
    return pts;
  }, [radiusX, radiusZ]);

  // Distinct tilt for each orbit to form the atom shape
  const tiltX = (index % 2 === 0 ? 1 : -1) * (Math.PI / 8 + index * 0.1);
  const tiltZ = (index % 3 === 0 ? 1 : -1) * (Math.PI / 12 + index * 0.05);
  const rotY = (index * Math.PI) / 1.5;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Move planet along the ellipse
      const t = clock.getElapsedTime() * orbitSpeed + (index * Math.PI / 2);
      const x = Math.cos(t) * radiusX;
      const z = Math.sin(t) * radiusZ;
      groupRef.current.position.set(x, 0, z);
      
      if (isSelected) {
        groupRef.current.getWorldPosition(selectedPlanetWorldPos.current);
      }
    }
  });

  return (
    <group rotation={[tiltX, rotY, tiltZ]}>
      <Line points={points} color="#c4ffff" dashed={true} dashScale={1} dashSize={0.1} gapSize={0.05} transparent opacity={0.3} lineWidth={1} />
      
      {/* NO connecting line */}

      <group ref={groupRef}>
        <ProjectNode project={project} onClick={onClick} index={index} isSelected={isSelected} selectedProjectId={selectedProjectId} />
      </group>
    </group>
  );
}

function CentralCore() {
  const coreGroup = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (coreGroup.current) {
      const t = clock.getElapsedTime();
      coreGroup.current.rotation.x = t * 0.2;
      coreGroup.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={4} color="#ffffff" distance={40} decay={1.5} />
      <ambientLight intensity={1.5} />
      
      <group ref={coreGroup}>
        {/* Core solid center (shiny white, no bloom/glow) */}
        <mesh>
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
        </mesh>
        
        {/* Wireframe outer shell */}
        <mesh>
          <icosahedronGeometry args={[0.18, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.15} />
        </mesh>

        {/* Inner geometric rings */}
        <mesh rotation={[Math.PI/4, 0, 0]}>
          <torusGeometry args={[0.15, 0.005, 16, 64]} />
          <meshStandardMaterial color="#c4ffff" metalness={0.8} roughness={0.2} transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[0, Math.PI/3, 0]}>
          <torusGeometry args={[0.16, 0.005, 16, 64]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export default function Universe({ projects, onPlanetClick, selectedProject, activeUniverse = 'all' }: UniverseProps) {
  const radii = [1.0, 1.4, 1.8, 2.2];
  
  const creativeProjects = projects.slice(0, 4);
  const industryProjects = projects.slice(4, 8);
  
  return (
    <group position={[0, 0, 0]}>
      {activeUniverse === 'all' && (
        <>
          <group position={[-2.5, 0, -1]}>
            <CentralCore />
            <Html position={[0, -2.5, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="font-mono text-[#ff3399] text-[10px] tracking-widest uppercase opacity-70 whitespace-nowrap">
                [ CREATIVE.SYS ]
              </div>
            </Html>
            {creativeProjects.map((project, idx) => (
              <OrbitGroup 
                key={project.id} 
                index={idx} 
                project={project} 
                radius={radii[idx % radii.length]} 
                onClick={() => onPlanetClick(project)} 
                isSelected={selectedProject?.id === project.id} 
                isFocused={selectedProject?.id === project.id}
                selectedProjectId={selectedProject?.id}
              />
            ))}
          </group>

          <group position={[2.5, 0, 1]}>
            <CentralCore />
            <Html position={[0, -2.5, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="font-mono text-[#00ffcc] text-[10px] tracking-widest uppercase opacity-70 whitespace-nowrap">
                [ INDUSTRY.SYS ]
              </div>
            </Html>
            {industryProjects.map((project, idx) => (
              <OrbitGroup 
                key={project.id} 
                index={idx + 4} 
                project={project} 
                radius={radii[idx % radii.length]} 
                onClick={() => onPlanetClick(project)} 
                isSelected={selectedProject?.id === project.id} 
                isFocused={selectedProject?.id === project.id}
                selectedProjectId={selectedProject?.id}
              />
            ))}
          </group>
          <Line points={[new THREE.Vector3(-2.5, 0, -1), new THREE.Vector3(2.5, 0, 1)]} color="#c4ffff" dashed={true} dashScale={2} dashSize={0.2} gapSize={0.1} transparent opacity={0.2} lineWidth={1} />
        </>
      )}

      {activeUniverse !== 'all' && (
        <group position={[0, 0, 0]}>
          <CentralCore />
          {(activeUniverse === 'creative' ? creativeProjects : industryProjects).map((project, idx) => {
            const startIndex = activeUniverse === 'creative' ? 0 : 4;
            return <OrbitGroup 
              key={project.id} 
              index={idx + startIndex} 
              project={project} 
              radius={radii[idx % radii.length]} 
              onClick={() => onPlanetClick(project)} 
              isSelected={selectedProject?.id === project.id} 
              isFocused={selectedProject?.id === project.id}
              selectedProjectId={selectedProject?.id}
            />;
          })}
        </group>
      )}
    </group>
  );
}
