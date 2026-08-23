import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Project } from "../types";
import { hoverState } from "../App";
const createGlowTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(250, 248, 237, 1)");
    /* intense core */ gradient.addColorStop(0.1, "rgba(250, 248, 237, 0.8)");
    gradient.addColorStop(0.3, "rgba(250, 248, 237, 0.3)");
    gradient.addColorStop(0.6, "rgba(250, 248, 237, 0.05)");
    gradient.addColorStop(1, "rgba(250, 248, 237, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }
  return new THREE.CanvasTexture(canvas);
};
const glowTexture = createGlowTexture();
export const selectedPlanetWorldPos = { current: new THREE.Vector3() };
interface UniverseProps {
  projects: Project[];
  onPlanetClick: (project: Project) => void;
  selectedProject?: Project | null;
  activeUniverse?: "all" | "creative" | "industry";
}
function PointGlow({ radius, count = 2000, color = "#ffffff", size = 0.04 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.random() * radius;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [radius, count]);
  return (
    <points>
      {" "}
      <bufferGeometry>
        {" "}
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />{" "}
      </bufferGeometry>{" "}
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />{" "}
    </points>
  );
}
function DottedRing({
  radius,
  segments = 120,
  opacity = 0.4,
  animate = false,
  speed = 0.2,
  color = "#ffffff",
}) {
  const positions = useMemo(() => {
    const pos = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [radius, segments]);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (animate && ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * speed;
    }
  });
  return (
    <group ref={ref}>
      {" "}
      <points>
        {" "}
        <bufferGeometry>
          {" "}
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={segments + 1}
            itemSize={3}
          />{" "}
        </bufferGeometry>{" "}
        <pointsMaterial
          color={color}
          size={0.03}
          transparent
          opacity={opacity}
          sizeAttenuation={true}
        />{" "}
      </points>{" "}
    </group>
  );
}
function ProjectNode({
  project,
  onClick,
  index,
  isSelected,
  selectedProjectId,
}: {
  project: Project;
  onClick: () => void;
  index: number;
  isSelected?: boolean;
  selectedProjectId?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMeshRef = useRef<THREE.Group>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const handleHoverIn = () => {
    setHovered(true);
    hoverState.hovered = true;
    document.body.style.cursor = "crosshair";
    if (targetRef.current) {
      window.dispatchEvent(
        new CustomEvent("cursor-lock", {
          detail: { target: targetRef.current },
        }),
      );
    }
  };
  const handleHoverOut = () => {
    setHovered(false);
    setPressed(false);
    hoverState.hovered = false;
    document.body.style.cursor = "auto";
    window.dispatchEvent(
      new CustomEvent("cursor-unlock", {
        detail: { target: targetRef.current },
      }),
    );
  };
  useEffect(() => {
    if (groupRef.current && glowMeshRef.current) {
      if (pressed) {
        gsap.to(groupRef.current.scale, {
          x: 0.8,
          y: 0.8,
          z: 0.8,
          duration: 0.1,
          ease: "power2.out",
        });
        gsap.to(glowMeshRef.current.scale, {
          x: 0.8,
          y: 0.8,
          z: 0.8,
          duration: 0.1,
        });
      } else if (hovered || isSelected) {
        gsap.to(groupRef.current.scale, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 0.5,
          ease: "back.out(1.5)",
        });
        gsap.to(glowMeshRef.current.scale, {
          x: 1.4,
          y: 1.4,
          z: 1.4,
          duration: 0.5,
          ease: "power2.out",
        });
      } else {
        gsap.to(groupRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.5,
          ease: "power3.out",
        });
        gsap.to(glowMeshRef.current.scale, {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 0.5,
        });
      }
    }
  }, [hovered, pressed, isSelected]);
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
        handleHoverIn();
      }}
      onPointerOut={(e) => {
        if (selectedProjectId && !isSelected) return;
        handleHoverOut();
      }}
      onPointerDown={() => {
        if (!(selectedProjectId && !isSelected)) setPressed(true);
      }}
      onPointerUp={() => {
        if (!(selectedProjectId && !isSelected)) setPressed(false);
      }}
      onPointerCancel={() => {
        if (!(selectedProjectId && !isSelected)) setPressed(false);
      }}
    >
      {" "}
      <group ref={groupRef}>
        {" "}
        {/* Invisible Hit Area */}{" "}
        <mesh visible={false}>
          {" "}
          <sphereGeometry args={[0.6, 16, 16]} />{" "}
        </mesh>{" "}
        {/* Core & Glow */}{" "}
        <group ref={glowMeshRef}>
          {" "}
          <PointGlow
            radius={0.8}
            count={400}
            color="#ffffff"
            size={0.03}
          />{" "}
          <PointGlow radius={0.2} count={150} color="#ffffff" size={0.04} />{" "}
          <DottedRing
            radius={0.25}
            segments={80}
            opacity={0.6}
            animate={true}
            speed={0.5}
            color="#ffffff"
          />{" "}
        </group>{" "}
        {/* Concentric rings to make it look like schematic */}{" "}
        <group rotation={[Math.PI / 2, 0, 0]}>
          {" "}
          <DottedRing
            radius={0.2}
            opacity={0.6}
            animate={true}
            speed={0.5}
            color="#ffffff"
          />{" "}
          <DottedRing
            radius={0.35}
            opacity={0.4}
            animate={true}
            speed={-0.3}
            color="#ffffff"
          />{" "}
        </group>{" "}
      </group>{" "}
      <Html
        position={[0.4, 0.4, 0]}
        center
        style={{
          pointerEvents: "none",
          opacity: selectedProjectId && !isSelected ? 0 : 1,
          display: selectedProjectId && !isSelected ? "none" : "block",
          transition: "opacity 0.2s",
        }}
      >
        {" "}
        <div
          ref={targetRef}
          className="font-mono whitespace-nowrap opacity-90 transition-opacity duration-300 pointer-events-none"
          style={{ color: "#ffffff" }}
        >
          {" "}
          <div className="flex flex-col text-[8px] md:text-[10px] tracking-widest relative">
            {" "}
            {isSelected && (
              <div
                className="absolute -inset-4 border border-dashed animate-[spin_10s_linear_infinite]"
                style={{ borderColor: "#c4ffff", opacity: 0.5 }}
              />
            )}{" "}
            {/* Corner brackets removed */}{" "}
            <span
              className={`px-1 transition-colors ${hovered ? "bg-[#c4ffff] text-black font-bold" : "bg-black/50"}`}
            >
              [ {project.title.replace(/^[0-9]+ /, "")} ]
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </Html>{" "}
    </group>
  );
}
function OrbitGroup({
  index,
  project,
  radius,
  onClick,
  isSelected,
  isFocused,
  selectedProjectId,
}: {
  index: number;
  project: Project;
  radius: number;
  onClick: () => void;
  isSelected?: boolean;
  isFocused?: boolean;
  selectedProjectId?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitSpeed = (0.04 / (radius * 0.5)) * (1 + (index % 5) * 0.45);
  /* Varied speeds */ const radiusX = radius * 2.5;
  const radiusZ = radius * 1.5;
  const orbitPositions = useMemo(() => {
    const segments = 180;
    const pos = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radiusX;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = Math.sin(angle) * radiusZ;
    }
    return pos;
  }, [radiusX, radiusZ]);
  const tiltX = (index % 2 === 0 ? 1 : -1) * (Math.PI / 8 + index * 0.1);
  const tiltZ = (index % 3 === 0 ? 1 : -1) * (Math.PI / 12 + index * 0.05);
  const rotY = (index * Math.PI) / 1.5;
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * orbitSpeed + (index * Math.PI) / 2;
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
      {" "}
      <points>
        {" "}
        <bufferGeometry>
          {" "}
          <bufferAttribute
            attach="attributes-position"
            array={orbitPositions}
            count={orbitPositions.length / 3}
            itemSize={3}
          />{" "}
        </bufferGeometry>{" "}
        <pointsMaterial
          color="#ffffff"
          size={0.04}
          transparent
          opacity={0.4}
          sizeAttenuation={true}
        />{" "}
      </points>{" "}
      <group ref={groupRef}>
        {" "}
        <ProjectNode
          project={project}
          onClick={onClick}
          index={index}
          isSelected={isSelected}
          selectedProjectId={selectedProjectId}
        />{" "}
      </group>{" "}
    </group>
  );
}
function CentralCore() {
  const coreGroup = useRef<THREE.Group>(null);
  return (
    <group>
      {" "}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color="#ffffff"
        distance={30}
        decay={2}
      />{" "}
      <ambientLight intensity={0.5} />{" "}
      <group ref={coreGroup}>
        {" "}
        <group>
          {" "}
          <PointGlow
            radius={1.5}
            count={800}
            color="#ffffff"
            size={0.03}
          />{" "}
          <PointGlow
            radius={0.3}
            count={200}
            color="#ffffff"
            size={0.05}
          />{" "}
        </group>{" "}
        <group rotation={[Math.PI / 2, 0, 0]}>
          {" "}
          <DottedRing
            radius={0.4}
            opacity={0.8}
            animate={true}
            speed={0.4}
            color="#ffffff"
          />{" "}
          <DottedRing
            radius={0.6}
            opacity={0.5}
            animate={true}
            speed={-0.2}
            color="#ffffff"
          />{" "}
          <DottedRing
            radius={0.8}
            opacity={0.3}
            animate={true}
            speed={0.1}
            color="#ffffff"
          />{" "}
        </group>{" "}
      </group>{" "}
    </group>
  );
}
export default function Universe({
  projects,
  onPlanetClick,
  selectedProject,
  activeUniverse = "all",
}: UniverseProps) {
  const radii = [1.0, 1.4, 1.8, 2.2];
  const creativeProjects = projects.slice(0, 4);
  const industryProjects = projects.slice(4, 8);
  return (
    <group position={[0, 0, 0]}>
      {" "}
      {activeUniverse === "all" && (
        <>
          {" "}
          <group position={[-5, 0, -2]}>
            {" "}
            <CentralCore />{" "}
            <Html
              position={[0, 1.2, 0]}
              center
              style={{
                pointerEvents: "none",
                opacity: selectedProject ? 0 : 1,
                display: selectedProject ? "none" : "block",
                transition: "opacity 0.2s",
              }}
            >
              {" "}
              <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">
                {" "}
                [ CREATIVE.SYS ]{" "}
              </div>{" "}
            </Html>{" "}
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
            ))}{" "}
          </group>{" "}
          <group position={[5, 0, 2]}>
            {" "}
            <CentralCore />{" "}
            <Html
              position={[0, 1.2, 0]}
              center
              style={{
                pointerEvents: "none",
                opacity: selectedProject ? 0 : 1,
                display: selectedProject ? "none" : "block",
                transition: "opacity 0.2s",
              }}
            >
              {" "}
              <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">
                {" "}
                [ INDUSTRY.SYS ]{" "}
              </div>{" "}
            </Html>{" "}
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
            ))}{" "}
          </group>{" "}
        </>
      )}{" "}
      {activeUniverse !== "all" && (
        <group position={[0, 0, 0]}>
          {" "}
          <CentralCore />{" "}
          <Html
            position={[0, 1.2, 0]}
            center
            style={{
              pointerEvents: "none",
              opacity: selectedProject ? 0 : 1,
              display: selectedProject ? "none" : "block",
              transition: "opacity 0.2s",
            }}
          >
            {" "}
            <div className="font-mono text-white text-[10px] tracking-widest uppercase opacity-80 whitespace-nowrap bg-black/50 px-1 border border-white/20">
              {" "}
              [ SYS_CORE ]{" "}
            </div>{" "}
          </Html>{" "}
          {(activeUniverse === "creative"
            ? creativeProjects
            : industryProjects
          ).map((project, idx) => (
            <OrbitGroup
              key={project.id}
              index={idx + (activeUniverse === "creative" ? 0 : 4)}
              project={project}
              radius={radii[idx % radii.length] * 1.5}
              onClick={() => onPlanetClick(project)}
              isSelected={selectedProject?.id === project.id}
              isFocused={selectedProject?.id === project.id}
              selectedProjectId={selectedProject?.id}
            />
          ))}{" "}
        </group>
      )}{" "}
    </group>
  );
}
