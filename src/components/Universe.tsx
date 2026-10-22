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
  appMode?: "loading" | "terminal" | "universe";
  isLight?: boolean;
}
function PointGlow({
  radius,
  count = 2000,
  color = "#ffffff",
  size = 0.04,
  isLight = false,
}: {
  radius: number;
  count?: number;
  color?: string;
  size?: number;
  isLight?: boolean;
}) {
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
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={isLight ? (color === "#ffffff" ? "#12121c" : color) : color}
        size={size}
        transparent
        opacity={isLight ? 0.75 : 0.6}
        depthWrite={false}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
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
  isLight = false,
}: {
  radius: number;
  segments?: number;
  opacity?: number;
  animate?: boolean;
  speed?: number;
  color?: string;
  isLight?: boolean;
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
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={segments + 1}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={isLight ? (color === "#ffffff" ? "#1a1a26" : color) : color}
          size={isLight ? 0.04 : 0.03}
          transparent
          opacity={isLight ? Math.min(1, opacity * 1.5) : opacity}
          sizeAttenuation={true}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
function ProjectNode({
  project,
  onClick,
  index,
  isSelected,
  selectedProjectId,
  onHoverChange,
  appMode,
  isLight = false,
}: {
  project: Project;
  onClick: () => void;
  index: number;
  isSelected?: boolean;
  selectedProjectId?: string;
  onHoverChange?: (hovered: boolean) => void;
  appMode?: "loading" | "terminal" | "universe";
  isLight?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMeshRef = useRef<THREE.Group>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const handleHoverIn = () => {
    if (appMode !== "universe") return;
    setHovered(true);
    onHoverChange?.(true);
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
    onHoverChange?.(false);
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
        if (appMode !== "universe") return;
        if (selectedProjectId && !isSelected) return;
        e.stopPropagation();
        if (e.delta <= 5) onClick();
      }}
      onPointerOver={(e) => {
        if (appMode !== "universe") return;
        if (selectedProjectId && !isSelected) return;
        e.stopPropagation();
        handleHoverIn();
      }}
      onPointerOut={(e) => {
        if (appMode !== "universe") return;
        if (selectedProjectId && !isSelected) return;
        handleHoverOut();
      }}
      onPointerDown={() => {
        if (appMode !== "universe") return;
        if (!(selectedProjectId && !isSelected)) setPressed(true);
      }}
      onPointerUp={() => {
        if (appMode !== "universe") return;
        if (!(selectedProjectId && !isSelected)) setPressed(false);
      }}
      onPointerCancel={() => {
        if (appMode !== "universe") return;
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
        {/* Core & Glow */}
        <group ref={glowMeshRef}>
          <PointGlow
            radius={0.8}
            count={400}
            color={isLight ? "#1a1a28" : "#ffffff"}
            size={0.03}
            isLight={isLight}
          />
          <PointGlow
            radius={0.2}
            count={150}
            color={isLight ? "#111118" : "#ffffff"}
            size={0.04}
            isLight={isLight}
          />
          <DottedRing
            radius={0.25}
            segments={80}
            opacity={0.6}
            animate={true}
            speed={0.5}
            color={isLight ? "#181824" : "#ffffff"}
            isLight={isLight}
          />
        </group>
        {/* Concentric rings to make it look like schematic */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <DottedRing
            radius={0.2}
            opacity={0.6}
            animate={true}
            speed={0.5}
            color={isLight ? "#181824" : "#ffffff"}
            isLight={isLight}
          />
          <DottedRing
            radius={0.35}
            opacity={0.4}
            animate={true}
            speed={-0.3}
            color={isLight ? "#2a2a38" : "#ffffff"}
            isLight={isLight}
          />
        </group>
      </group>
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
        <div
          ref={targetRef}
          className="font-mono whitespace-nowrap opacity-95 transition-opacity duration-300 pointer-events-none cursor-target"
          data-interactive="true"
          style={{ color: isLight ? "#000000" : "#ffffff" }}
        >
          <div className="flex flex-col text-[8px] md:text-[10px] tracking-widest relative">
            {isSelected && (
              <div
                className="absolute -inset-4 border border-dashed animate-[spin_10s_linear_infinite]"
                style={{ borderColor: isLight ? "#ffffff" : "#ffffff", opacity: 0.7 }}
              />
            )}
            <span
              className={`px-1 transition-colors border ${
                hovered
                  ? isLight
                    ? "bg-black text-white border-black font-bold shadow-[0_0_8px_rgba(255, 255, 255,0.4)]"
                    : "bg-white text-black border-white font-bold"
                  : isLight
                    ? "bg-white text-black border-black/80 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                    : "bg-black/60 text-white border-white/30"
              }`}
            >
              [ {project.title.replace(/^[0-9]+ /, "")} ]
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}
interface PlanetTrailProps {
  index: number;
  radiusX: number;
  radiusZ: number;
  orbitSpeed: number;
  isSelected?: boolean;
  isHovered?: boolean;
  dimmed?: boolean;
  isLight?: boolean;
}

function PlanetTrail({
  index,
  radiusX,
  radiusZ,
  orbitSpeed,
  isSelected,
  isHovered,
  dimmed,
  isLight = false,
}: PlanetTrailProps) {
  const lineGeoRef = useRef<THREE.BufferGeometry>(null);
  const lineGeo2Ref = useRef<THREE.BufferGeometry>(null);
  const pointsGeoRef = useRef<THREE.BufferGeometry>(null);
  const ticksGeoRef = useRef<THREE.BufferGeometry>(null);
  const entranceRef = useRef({ opacity: 1 });

  // Staggered entrance animation synchronized with the planet
  useEffect(() => {
    entranceRef.current.opacity = 1;
    gsap.to(entranceRef.current, {
      opacity: 1,
      duration: 0.8,
      delay: 0.15 + (index % 4) * 0.12,
      ease: "power2.out",
    });
  }, [index]);

  const LINE_COUNT = 60;
  const POINT_COUNT = 48;
  const TICK_COUNT = 6;

  const { linePositions, lineColors } = useMemo(() => {
    return {
      linePositions: new Float32Array(LINE_COUNT * 3),
      lineColors: new Float32Array(LINE_COUNT * 3),
    };
  }, [LINE_COUNT]);

  const { linePositions2, lineColors2 } = useMemo(() => {
    return {
      linePositions2: new Float32Array(LINE_COUNT * 3),
      lineColors2: new Float32Array(LINE_COUNT * 3),
    };
  }, [LINE_COUNT]);

  const { pointPositions, pointColors } = useMemo(() => {
    return {
      pointPositions: new Float32Array(POINT_COUNT * 3),
      pointColors: new Float32Array(POINT_COUNT * 3),
    };
  }, [POINT_COUNT]);

  const { tickPositions, tickColors } = useMemo(() => {
    return {
      tickPositions: new Float32Array(TICK_COUNT * 2 * 3),
      tickColors: new Float32Array(TICK_COUNT * 2 * 3),
    };
  }, [TICK_COUNT]);

  // Trail arc length scales with orbit speed to visually enhance speed differences
  const baseArc = Math.min(1.4, Math.max(0.65, orbitSpeed * 10.5));

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const t = elapsed * orbitSpeed + (index * Math.PI) / 2;
    const currentEntrance = entranceRef.current.opacity;
    if (currentEntrance <= 0.001) return;

    const hoverMult = isHovered ? 1.6 : isSelected ? 1.4 : 1.2;
    const dimMult = dimmed ? 0.25 : 1.0;
    const effectiveOpacity = Math.max(0.35, currentEntrance * hoverMult * dimMult);

    const trailArc = baseArc * (isHovered ? 1.25 : 1.0);

    // Color tones: Electric cobalt in light mode, cyan #ffffff in dark mode
    const headR = isLight ? (isHovered || isSelected ? 0.0 : 0.08) : (isHovered || isSelected ? 0.77 : 0.95);
    const headG = isLight ? (isHovered || isSelected ? 0.33 : 0.28) : (isHovered || isSelected ? 1.0 : 0.98);
    const headB = isLight ? (isHovered || isSelected ? 1.0 : 0.9) : 1.0;

    // 1. Continuous trailing geometric line ribbon (Core Line)
    if (lineGeoRef.current) {
      const posAttr = lineGeoRef.current.attributes.position as THREE.BufferAttribute;
      const colAttr = lineGeoRef.current.attributes.color as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      for (let i = 0; i < LINE_COUNT; i++) {
        const p = i / (LINE_COUNT - 1); // 0 at planet head, 1 at tail tip
        const angle = t - p * trailArc;
        const px = Math.cos(angle) * radiusX;
        const pz = Math.sin(angle) * radiusZ;

        posArr[i * 3] = px;
        posArr[i * 3 + 1] = 0;
        posArr[i * 3 + 2] = pz;

        // Vivid exponential distance falloff
        const fade = Math.pow(1.0 - p, 1.3) * 1.0 * effectiveOpacity;
        colArr[i * 3] = headR * fade;
        colArr[i * 3 + 1] = headG * fade;
        colArr[i * 3 + 2] = headB * fade;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    // 1b. Secondary parallel trail line (ensures visibility on high-DPI/mobile screens)
    if (lineGeo2Ref.current) {
      const posAttr2 = lineGeo2Ref.current.attributes.position as THREE.BufferAttribute;
      const colAttr2 = lineGeo2Ref.current.attributes.color as THREE.BufferAttribute;
      const posArr2 = posAttr2.array as Float32Array;
      const colArr2 = colAttr2.array as Float32Array;

      for (let i = 0; i < LINE_COUNT; i++) {
        const p = i / (LINE_COUNT - 1);
        const angle = t - p * trailArc;
        const px = Math.cos(angle) * (radiusX * 1.008);
        const pz = Math.sin(angle) * (radiusZ * 1.008);

        posArr2[i * 3] = px;
        posArr2[i * 3 + 1] = 0.02 * Math.sin(p * Math.PI);
        posArr2[i * 3 + 2] = pz;

        const fade = Math.pow(1.0 - p, 1.5) * 0.75 * effectiveOpacity;
        colArr2[i * 3] = (isLight ? 0.0 : 0.77) * fade;
        colArr2[i * 3 + 1] = (isLight ? 0.35 : 1.0) * fade;
        colArr2[i * 3 + 2] = 1.0 * fade;
      }
      posAttr2.needsUpdate = true;
      colAttr2.needsUpdate = true;
    }

    // 2. Trailing stardust / telemetry point cloud
    if (pointsGeoRef.current) {
      const pPosAttr = pointsGeoRef.current.attributes.position as THREE.BufferAttribute;
      const pColAttr = pointsGeoRef.current.attributes.color as THREE.BufferAttribute;
      const pPosArr = pPosAttr.array as Float32Array;
      const pColArr = pColAttr.array as Float32Array;

      for (let i = 0; i < POINT_COUNT; i++) {
        const p = (i + 0.5) / POINT_COUNT;
        const angle = t - p * trailArc;
        const px = Math.cos(angle) * radiusX;
        const pz = Math.sin(angle) * radiusZ;

        // Dispersion that gently fans out along the trail
        const nx = -Math.sin(angle);
        const nz = Math.cos(angle);
        const spread = p * 0.09;
        const latOffset = Math.sin(i * 4.31 + elapsed * 2.8) * spread;
        const yOffset = Math.cos(i * 3.73 + elapsed * 2.2) * (spread * 0.75);

        pPosArr[i * 3] = px + nx * latOffset;
        pPosArr[i * 3 + 1] = yOffset;
        pPosArr[i * 3 + 2] = pz + nz * latOffset;

        // Micro-twinkle + distance fade
        const twinkle = 0.85 + 0.15 * Math.sin(i * 3.14 + elapsed * 6.0);
        const pFade = Math.pow(1.0 - p, 1.35) * 1.0 * twinkle * effectiveOpacity;

        pColArr[i * 3] = headR * pFade;
        pColArr[i * 3 + 1] = headG * pFade;
        pColArr[i * 3 + 2] = headB * pFade;
      }
      pPosAttr.needsUpdate = true;
      pColAttr.needsUpdate = true;
    }

    // 3. Trailing telemetry radar ticks
    if (ticksGeoRef.current) {
      const tPosAttr = ticksGeoRef.current.attributes.position as THREE.BufferAttribute;
      const tColAttr = ticksGeoRef.current.attributes.color as THREE.BufferAttribute;
      const tPosArr = tPosAttr.array as Float32Array;
      const tColArr = tColAttr.array as Float32Array;

      for (let k = 0; k < TICK_COUNT; k++) {
        const p = (k + 1) / (TICK_COUNT + 1);
        const angle = t - p * trailArc;
        const px = Math.cos(angle) * radiusX;
        const pz = Math.sin(angle) * radiusZ;

        const nx = -Math.sin(angle);
        const nz = Math.cos(angle);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const tickLen = (isMobile ? 0.08 : 0.06) * (1.0 - p * 0.4);

        const vIdx = k * 2;
        // Point A
        tPosArr[vIdx * 3] = px + nx * tickLen;
        tPosArr[vIdx * 3 + 1] = 0;
        tPosArr[vIdx * 3 + 2] = pz + nz * tickLen;

        // Point B
        tPosArr[(vIdx + 1) * 3] = px - nx * tickLen;
        tPosArr[(vIdx + 1) * 3 + 1] = 0;
        tPosArr[(vIdx + 1) * 3 + 2] = pz - nz * tickLen;

        const tickFade = Math.pow(1.0 - p, 1.4) * 0.7 * effectiveOpacity;
        tColArr[vIdx * 3] = headR * tickFade;
        tColArr[vIdx * 3 + 1] = headG * tickFade;
        tColArr[vIdx * 3 + 2] = headB * tickFade;

        tColArr[(vIdx + 1) * 3] = headR * tickFade;
        tColArr[(vIdx + 1) * 3 + 1] = headG * tickFade;
        tColArr[(vIdx + 1) * 3 + 2] = headB * tickFade;
      }
      tPosAttr.needsUpdate = true;
      tColAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Primary Trailing Geometric Line Ribbon */}
      <line>
        <bufferGeometry ref={lineGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={LINE_COUNT}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={lineColors}
            count={LINE_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {/* Secondary Trailing Glow Line (reinforces visibility on mobile displays) */}
      <line>
        <bufferGeometry ref={lineGeo2Ref}>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions2}
            count={LINE_COUNT}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={lineColors2}
            count={LINE_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.65}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {/* Trailing Stardust / Telemetry Point Cloud */}
      <points>
        <bufferGeometry ref={pointsGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            array={pointPositions}
            count={POINT_COUNT}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={pointColors}
            count={POINT_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={typeof window !== 'undefined' && window.innerWidth < 768 ? 0.085 : 0.055}
          transparent
          opacity={0.95}
          sizeAttenuation={true}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Faint Trailing Telemetry Radar Ticks */}
      <lineSegments>
        <bufferGeometry ref={ticksGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            array={tickPositions}
            count={TICK_COUNT * 2}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={tickColors}
            count={TICK_COUNT * 2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.7}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
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
  appMode,
  isLight = false,
}: {
  index: number;
  project: Project;
  radius: number;
  onClick: () => void;
  isSelected?: boolean;
  isFocused?: boolean;
  selectedProjectId?: string;
  appMode?: "loading" | "terminal" | "universe";
  isLight?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animGroupRef = useRef<THREE.Group>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  // Staggered entrance animation for planets and orbit lines
  useEffect(() => {
    if (animGroupRef.current) {
      animGroupRef.current.scale.set(0, 0, 0);
      gsap.to(animGroupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.9,
        delay: 0.2 + (index % 4) * 0.16 + (index >= 4 ? 0.3 : 0),
        ease: "back.out(1.8)",
      });
    }
    if (pointsMatRef.current) {
      pointsMatRef.current.opacity = 0;
      gsap.to(pointsMatRef.current, {
        opacity: isLight ? 0.5 : 0.4,
        duration: 0.8,
        delay: 0.1 + (index % 4) * 0.16 + (index >= 4 ? 0.3 : 0),
        ease: "power2.out",
      });
    }
  }, [index, isLight]);

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
      {/* Faint fading geometric trail (trailing mesh ribbon + point cloud + telemetry radar ticks) */}
      <PlanetTrail
        index={index}
        radiusX={radiusX}
        radiusZ={radiusZ}
        orbitSpeed={orbitSpeed}
        isSelected={isSelected}
        isHovered={isHovered}
        dimmed={!!(selectedProjectId && !isSelected)}
        isLight={isLight}
      />

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={orbitPositions}
            count={orbitPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMatRef}
          color={isLight ? "#2a2b38" : "#ffffff"}
          size={isLight ? 0.045 : 0.04}
          transparent
          opacity={isLight ? 0.5 : 0.4}
          sizeAttenuation={true}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </points>
      <group ref={groupRef}>
        <group ref={animGroupRef}>
          <ProjectNode
            project={project}
            onClick={onClick}
            index={index}
            isSelected={isSelected}
            selectedProjectId={selectedProjectId}
            onHoverChange={setIsHovered}
            appMode={appMode}
            isLight={isLight}
          />
        </group>
      </group>
    </group>
  );
}
function CentralCore({ isLight = false }: { isLight?: boolean }) {
  const coreGroup = useRef<THREE.Group>(null);
  useEffect(() => {
    if (coreGroup.current) {
      coreGroup.current.scale.set(0, 0, 0);
      gsap.to(coreGroup.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.1,
        delay: 0.05,
        ease: "power3.out",
      });
    }
  }, []);
  return (
    <group>
      <pointLight
        position={[0, 0, 0]}
        intensity={isLight ? 1.2 : 2}
        color={isLight ? "#ffffff" : "#ffffff"}
        distance={30}
        decay={2}
      />
      <ambientLight intensity={isLight ? 0.8 : 0.5} />
      <group ref={coreGroup}>
        <group>
          <PointGlow
            radius={1.5}
            count={800}
            color={isLight ? "#1a1a26" : "#ffffff"}
            size={0.03}
            isLight={isLight}
          />
          <PointGlow
            radius={0.3}
            count={200}
            color={isLight ? "#111118" : "#ffffff"}
            size={0.05}
            isLight={isLight}
          />
        </group>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <DottedRing
            radius={0.4}
            opacity={0.8}
            animate={true}
            speed={0.4}
            color={isLight ? "#161622" : "#ffffff"}
            isLight={isLight}
          />
          <DottedRing
            radius={0.6}
            opacity={0.5}
            animate={true}
            speed={-0.2}
            color={isLight ? "#242434" : "#ffffff"}
            isLight={isLight}
          />
          <DottedRing
            radius={0.8}
            opacity={0.3}
            animate={true}
            speed={0.1}
            color={isLight ? "#323246" : "#ffffff"}
            isLight={isLight}
          />
        </group>
      </group>
    </group>
  );
}
export default function Universe({
  projects,
  onPlanetClick,
  selectedProject,
  activeUniverse = "all",
  appMode,
  isLight = false,
}: UniverseProps) {
  const radii = [1.0, 1.4, 1.8, 2.2];
  const creativeProjects = projects.slice(0, 4);
  const industryProjects = projects.slice(4, 8);
  return (
    <group position={[0, 0, 0]}>
      {activeUniverse === "all" && (
        <>
          <group position={[-5, 0, -2]}>
            <CentralCore isLight={isLight} />
            <Html
              position={[0, 1.4, 0]}
              center
              style={{
                pointerEvents: "none",
                opacity: selectedProject ? 0 : 1,
                display: selectedProject ? "none" : "block",
                transition: "opacity 0.2s",
              }}
            >
              <div
                className={`font-mono text-[9px] md:text-[11px] tracking-widest uppercase opacity-95 whitespace-nowrap px-2.5 py-1.5 border flex flex-col items-center select-none pointer-events-none ${
                  isLight
                    ? "bg-white/95 text-black border-black/80 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                    : "bg-black/90 text-white border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                }`}
              >
                <span className={`font-bold whitespace-nowrap ${isLight ? "text-black" : "text-white"}`}>
                  [ CREATIVE.SYS ]
                </span>
                <span className={`text-[7px] md:text-[8px] tracking-wider whitespace-nowrap ${isLight ? "text-black/70" : "text-white/80"}`}>
                  COORD: [-05.38, +00.42, -02.15] // 05.81 AU
                </span>
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
                appMode={appMode}
                isLight={isLight}
              />
            ))}
          </group>
          <group position={[5, 0, 2]}>
            <CentralCore isLight={isLight} />
            <Html
              position={[0, 1.4, 0]}
              center
              style={{
                pointerEvents: "none",
                opacity: selectedProject ? 0 : 1,
                display: selectedProject ? "none" : "block",
                transition: "opacity 0.2s",
              }}
            >
              <div
                className={`font-mono text-[9px] md:text-[11px] tracking-widest uppercase opacity-95 whitespace-nowrap px-2.5 py-1.5 border flex flex-col items-center select-none pointer-events-none ${
                  isLight
                    ? "bg-white/95 text-black border-black/80 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                    : "bg-black/90 text-white border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                }`}
              >
                <span className={`font-bold whitespace-nowrap ${isLight ? "text-black" : "text-white"}`}>
                  [ INDUSTRY.SYS ]
                </span>
                <span className={`text-[7px] md:text-[8px] tracking-wider whitespace-nowrap ${isLight ? "text-black/70" : "text-white/80"}`}>
                  COORD: [+05.41, -00.37, +02.08] // 05.80 AU
                </span>
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
                appMode={appMode}
                isLight={isLight}
              />
            ))}
          </group>
        </>
      )}
      {activeUniverse !== "all" && (
        <group position={[0, 0, 0]}>
          <CentralCore isLight={isLight} />
          <Html
            position={[0, 1.4, 0]}
            center
            style={{
              pointerEvents: "none",
              opacity: selectedProject ? 0 : 1,
              display: selectedProject ? "none" : "block",
              transition: "opacity 0.2s",
            }}
          >
            <div
              className={`font-mono text-[9px] md:text-[11px] tracking-widest uppercase opacity-95 whitespace-nowrap px-2.5 py-1.5 border flex flex-col items-center select-none pointer-events-none ${
                isLight
                  ? "bg-white/95 text-black border-black/80 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                  : "bg-black/90 text-white border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
              }`}
            >
              <span className={`font-bold whitespace-nowrap ${isLight ? "text-black" : "text-white"}`}>
                {activeUniverse === 'creative' ? '[ CREATIVE.SYS ]' : '[ INDUSTRY.SYS ]'}
              </span>
              <span className={`text-[7px] md:text-[8px] tracking-wider whitespace-nowrap ${isLight ? "text-black/70" : "text-white/80"}`}>
                {activeUniverse === 'creative'
                  ? 'COORD: [-05.38, +00.42, -02.15] // SECTOR_CR'
                  : 'COORD: [+05.41, -00.37, +02.08] // SECTOR_IN'}
              </span>
            </div>
          </Html>
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
              appMode={appMode}
              isLight={isLight}
            />
          ))}
        </group>
      )}
    </group>
  );
}
