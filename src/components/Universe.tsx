import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Project } from "../types";
import { hoverState } from "../App";

export const selectedPlanetWorldPos = { current: new THREE.Vector3() };

// Reusable module-level Three.js vectors and helpers to avoid GC stutter
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _norm1 = new THREE.Vector3();
const _norm2 = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3(1, 0, 0);
const _tempVec = new THREE.Vector3();

export interface OrbitConfig {
  radiusX: number;
  radiusZ: number;
  tiltX: number;
  tiltZ: number;
  rotY: number;
  speed: number;
}

/**
 * Strictly non-overlapping planetary orbit specifications:
 * Orbit 0 (closest to sun):   [1.60, 1.82] AU
 * Orbit 1 (second planet):    [2.25, 2.52] AU -> 0.43 AU clear margin outside Orbit 0 (no overlap at any point)
 * Orbit 2 (third planet):     [2.95, 3.30] AU -> 0.43 AU clear margin outside Orbit 1 (no overlap at any point)
 * Orbit 3 (outermost planet): [3.75, 4.18] AU -> 0.45 AU clear margin outside Orbit 2 (no overlap at any point)
 */
export const ORBIT_CONFIGS: OrbitConfig[] = [
  { radiusX: 1.82, radiusZ: 1.60, tiltX: 0.11, tiltZ: 0.07, rotY: 0.0, speed: 0.12 },
  { radiusX: 2.52, radiusZ: 2.25, tiltX: -0.09, tiltZ: 0.06, rotY: 0.85, speed: 0.086 },
  { radiusX: 3.30, radiusZ: 2.95, tiltX: 0.08, tiltZ: -0.06, rotY: 1.70, speed: 0.064 },
  { radiusX: 4.18, radiusZ: 3.75, tiltX: -0.07, tiltZ: -0.05, rotY: 2.55, speed: 0.048 },
];

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

/**
 * Reactive atmospheric halo that deforms toward a neighboring planet when in close proximity,
 * creating an organic tidal bridge/flare between the two bodies.
 */
function ReactiveAtmosphereHalo({
  reaction,
  isLight = false,
}: {
  reaction?: { intensity: number; direction: THREE.Vector3 };
  isLight?: boolean;
}) {
  const count = 90;
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const basePositions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 0.55 + Math.random() * 0.35;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  const dynamicPositions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(({ clock }) => {
    if (!geoRef.current) return;
    const intensity = reaction?.intensity || 0;
    const dir = reaction?.direction;
    const elapsed = clock.getElapsedTime();

    const posAttr = geoRef.current.attributes.position as THREE.BufferAttribute;
    const colAttr = geoRef.current.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    const baseR = isLight ? 0.0 : 0.77;
    const baseG = isLight ? 0.33 : 1.0;
    const baseB = 1.0;

    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      if (intensity > 0.01 && dir) {
        // Dot product between particle position and neighbor direction
        const dot = bx * dir.x + by * dir.y + bz * dir.z;
        const stretch = Math.max(0, dot) * intensity * 0.55;
        // Tidal flare pull toward neighbor with micro-twinkle
        const ripple = Math.sin(elapsed * 4.0 + i) * 0.04 * intensity;
        posArr[i * 3] = bx + dir.x * (stretch + ripple);
        posArr[i * 3 + 1] = by + dir.y * (stretch + ripple);
        posArr[i * 3 + 2] = bz + dir.z * (stretch + ripple);

        // Excited color emission
        const exc = 0.5 + intensity * 0.5;
        colArr[i * 3] = Math.min(1.0, baseR * exc + (isLight ? 0 : 0.2));
        colArr[i * 3 + 1] = Math.min(1.0, baseG * exc + (isLight ? 0 : 0.2));
        colArr[i * 3 + 2] = Math.min(1.0, baseB * exc);
      } else {
        // Calm resting state
        posArr[i * 3] = bx;
        posArr[i * 3 + 1] = by;
        posArr[i * 3 + 2] = bz;

        colArr[i * 3] = baseR * 0.4;
        colArr[i * 3 + 1] = baseG * 0.4;
        colArr[i * 3 + 2] = baseB * 0.4;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    if (matRef.current) {
      matRef.current.opacity = isLight
        ? 0.45 + intensity * 0.45
        : 0.35 + intensity * 0.65;
    }
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attach="attributes-position"
          array={dynamicPositions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        vertexColors
        size={isLight ? 0.045 : 0.04}
        transparent
        opacity={0.35}
        sizeAttenuation={true}
        depthWrite={false}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
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
  reaction,
}: {
  project: Project;
  onClick: () => void;
  index: number;
  isSelected?: boolean;
  selectedProjectId?: string;
  onHoverChange?: (hovered: boolean) => void;
  appMode?: "loading" | "terminal" | "universe";
  isLight?: boolean;
  reaction?: { intensity: number; direction: THREE.Vector3 };
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

  const reactionIntensity = reaction?.intensity || 0;

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
      <group ref={groupRef}>
        {/* Invisible Hit Area */}
        <mesh visible={false}>
          <sphereGeometry args={[0.6, 16, 16]} />
        </mesh>

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
            opacity={0.6 + reactionIntensity * 0.3}
            animate={true}
            speed={0.5 + reactionIntensity * 1.5}
            color={isLight ? "#181824" : reactionIntensity > 0.2 ? "#c4ffff" : "#ffffff"}
            isLight={isLight}
          />
          {/* Dynamic Reactive Atmospheric Flare */}
          <ReactiveAtmosphereHalo reaction={reaction} isLight={isLight} />
        </group>

        {/* Concentric rings schematic */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <DottedRing
            radius={0.2}
            opacity={0.6}
            animate={true}
            speed={0.5 + reactionIntensity * 1.2}
            color={isLight ? "#181824" : "#ffffff"}
            isLight={isLight}
          />
          <DottedRing
            radius={0.35}
            opacity={0.4 + reactionIntensity * 0.3}
            animate={true}
            speed={-0.3 - reactionIntensity * 0.8}
            color={isLight ? "#2a2a38" : reactionIntensity > 0.2 ? "#88ffff" : "#ffffff"}
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
                style={{ borderColor: isLight ? "#0055ff" : "#c4ffff", opacity: 0.7 }}
              />
            )}
            <span
              className={`px-1 transition-colors border ${
                hovered
                  ? isLight
                    ? "bg-[#0055ff] text-white border-[#0055ff] font-bold shadow-[0_0_8px_rgba(0,85,255,0.4)]"
                    : "bg-[#c4ffff] text-black border-[#c4ffff] font-bold"
                  : reactionIntensity > 0.35
                    ? isLight
                      ? "bg-[#0055ff]/20 text-black border-[#0055ff] font-semibold"
                      : "bg-[#c4ffff]/20 text-[#c4ffff] border-[#c4ffff]/60 font-semibold shadow-[0_0_10px_rgba(196,255,255,0.4)]"
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

  const baseArc = Math.min(1.4, Math.max(0.65, orbitSpeed * 10.5));

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const t = elapsed * orbitSpeed + ((index % 4) * Math.PI) / 2;
    const currentEntrance = entranceRef.current.opacity;
    if (currentEntrance <= 0.001) return;

    const hoverMult = isHovered ? 1.6 : isSelected ? 1.4 : 1.2;
    const dimMult = dimmed ? 0.25 : 1.0;
    const effectiveOpacity = Math.max(0.35, currentEntrance * hoverMult * dimMult);
    const trailArc = baseArc * (isHovered ? 1.25 : 1.0);

    const headR = isLight ? (isHovered || isSelected ? 0.0 : 0.08) : (isHovered || isSelected ? 0.77 : 0.95);
    const headG = isLight ? (isHovered || isSelected ? 0.33 : 0.28) : (isHovered || isSelected ? 1.0 : 0.98);
    const headB = isLight ? (isHovered || isSelected ? 1.0 : 0.9) : 1.0;

    // 1. Continuous trailing geometric line ribbon
    if (lineGeoRef.current) {
      const posAttr = lineGeoRef.current.attributes.position as THREE.BufferAttribute;
      const colAttr = lineGeoRef.current.attributes.color as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      for (let i = 0; i < LINE_COUNT; i++) {
        const p = i / (LINE_COUNT - 1);
        const angle = t - p * trailArc;
        const px = Math.cos(angle) * radiusX;
        const pz = Math.sin(angle) * radiusZ;

        posArr[i * 3] = px;
        posArr[i * 3 + 1] = 0;
        posArr[i * 3 + 2] = pz;

        const fade = Math.pow(1.0 - p, 1.3) * 1.0 * effectiveOpacity;
        colArr[i * 3] = headR * fade;
        colArr[i * 3 + 1] = headG * fade;
        colArr[i * 3 + 2] = headB * fade;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    // 1b. Secondary parallel trail line
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

    // 2. Trailing stardust telemetry point cloud
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

        const spread = p * 0.09;
        const latOffset = Math.sin(i * 4.31 + elapsed * 2.8) * spread;
        const yOffset = Math.cos(i * 3.73 + elapsed * 2.2) * (spread * 0.75);

        const nx = -Math.sin(angle);
        const nz = Math.cos(angle);

        pPosArr[i * 3] = px + nx * latOffset;
        pPosArr[i * 3 + 1] = yOffset;
        pPosArr[i * 3 + 2] = pz + nz * latOffset;

        const twinkle = 0.85 + 0.15 * Math.sin(i * 3.14 + elapsed * 6.0);
        const pFade = Math.pow(1.0 - p, 1.35) * 1.0 * twinkle * effectiveOpacity;

        pColArr[i * 3] = headR * pFade;
        pColArr[i * 3 + 1] = headG * pFade;
        pColArr[i * 3 + 2] = headB * pFade;
      }
      pPosAttr.needsUpdate = true;
      pColAttr.needsUpdate = true;
    }

    // 3. Trailing radar ticks
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
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const tickLen = (isMobile ? 0.08 : 0.06) * (1.0 - p * 0.4);

        const vIdx = k * 2;
        tPosArr[vIdx * 3] = px + nx * tickLen;
        tPosArr[vIdx * 3 + 1] = 0;
        tPosArr[vIdx * 3 + 2] = pz + nz * tickLen;

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
          size={typeof window !== "undefined" && window.innerWidth < 768 ? 0.085 : 0.055}
          transparent
          opacity={0.95}
          sizeAttenuation={true}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

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
  localIndex,
  project,
  config,
  scale = 1.0,
  onClick,
  isSelected,
  selectedProjectId,
  appMode,
  isLight = false,
  onUpdatePosition,
  reaction,
}: {
  index: number;
  localIndex: number;
  project: Project;
  config: OrbitConfig;
  scale?: number;
  onClick: () => void;
  isSelected?: boolean;
  selectedProjectId?: string;
  appMode?: "loading" | "terminal" | "universe";
  isLight?: boolean;
  onUpdatePosition?: (localIdx: number, pos: THREE.Vector3) => void;
  reaction?: { intensity: number; direction: THREE.Vector3 };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animGroupRef = useRef<THREE.Group>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);

  const radiusX = config.radiusX * scale;
  const radiusZ = config.radiusZ * scale;
  const orbitSpeed = config.speed;
  const tiltX = config.tiltX;
  const tiltZ = config.tiltZ;
  const rotY = config.rotY;

  const orbitEuler = useMemo(() => new THREE.Euler(tiltX, rotY, tiltZ), [tiltX, rotY, tiltZ]);

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

  useEffect(() => {
    if (animGroupRef.current) {
      animGroupRef.current.scale.set(0, 0, 0);
      gsap.to(animGroupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.9,
        delay: 0.2 + (localIndex % 4) * 0.16,
        ease: "back.out(1.8)",
      });
    }
    if (pointsMatRef.current) {
      pointsMatRef.current.opacity = 0;
      gsap.to(pointsMatRef.current, {
        opacity: isLight ? 0.5 : 0.4,
        duration: 0.8,
        delay: 0.1 + (localIndex % 4) * 0.16,
        ease: "power2.out",
      });
    }
  }, [localIndex, isLight]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * orbitSpeed + (localIndex * Math.PI) / 2;
      const x = Math.cos(t) * radiusX;
      const z = Math.sin(t) * radiusZ;
      groupRef.current.position.set(x, 0, z);

      // Report position in system space to parent system
      if (onUpdatePosition) {
        _tempVec.set(x, 0, z).applyEuler(orbitEuler);
        onUpdatePosition(localIndex, _tempVec);
      }

      if (isSelected) {
        groupRef.current.getWorldPosition(selectedPlanetWorldPos.current);
      }
    }
  });

  return (
    <group rotation={[tiltX, rotY, tiltZ]}>
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
            reaction={reaction}
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
        color={isLight ? "#0055ff" : "#ffffff"}
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

/**
 * Dynamic Intertwined Particle Entanglement Bridge:
 * When two planets pass close to each other in their orbits, particles are exchanged
 * across a double-helix braided stream flowing in opposite directions between the two planets.
 * Braided quantum filaments and sparkling Lagrange nodes reinforce the real-time interaction.
 */
function PlanetaryEntanglementBridge({
  planetPositions,
  onUpdateReactions,
  scale = 1.0,
  isLight = false,
}: {
  planetPositions: React.MutableRefObject<THREE.Vector3[]>;
  onUpdateReactions: (reactions: { intensity: number; direction: THREE.Vector3 }[]) => void;
  scale?: number;
  isLight?: boolean;
}) {
  const pointsGeoRef = useRef<THREE.BufferGeometry>(null);
  const linesGeoRef = useRef<THREE.BufferGeometry>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);
  const linesMatRef = useRef<THREE.LineBasicMaterial>(null);

  const localReactions = useRef<{ intensity: number; direction: THREE.Vector3 }[]>([
    { intensity: 0, direction: new THREE.Vector3() },
    { intensity: 0, direction: new THREE.Vector3() },
    { intensity: 0, direction: new THREE.Vector3() },
    { intensity: 0, direction: new THREE.Vector3() },
  ]);

  const MAX_ACTIVE_PAIRS = 2;
  const STREAM_A_COUNT = 85;
  const STREAM_B_COUNT = 85;
  const SPARKLE_COUNT = 30;
  const PARTICLES_PER_PAIR = STREAM_A_COUNT + STREAM_B_COUNT + SPARKLE_COUNT; // 200
  const TOTAL_POINTS = MAX_ACTIVE_PAIRS * PARTICLES_PER_PAIR; // 400

  const LINES_PER_PAIR = 16;
  const TOTAL_LINE_VERTICES = MAX_ACTIVE_PAIRS * LINES_PER_PAIR * 2; // 64

  const pointPositions = useMemo(() => new Float32Array(TOTAL_POINTS * 3), [TOTAL_POINTS]);
  const pointColors = useMemo(() => new Float32Array(TOTAL_POINTS * 3), [TOTAL_POINTS]);

  const linePositions = useMemo(() => new Float32Array(TOTAL_LINE_VERTICES * 3), [TOTAL_LINE_VERTICES]);
  const lineColors = useMemo(() => new Float32Array(TOTAL_LINE_VERTICES * 3), [TOTAL_LINE_VERTICES]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const positions = planetPositions.current;
    const threshold = 1.95 * scale;
    const minDist = 0.45 * scale;

    // Reset local reaction states
    for (let i = 0; i < 4; i++) {
      localReactions.current[i].intensity = 0;
      localReactions.current[i].direction.set(0, 0, 0);
    }

    // Detect all proximity pairs among the 4 planets in this system
    interface ActivePair {
      a: number;
      b: number;
      dist: number;
      intensity: number;
    }
    const activePairs: ActivePair[] = [];

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const d = positions[i].distanceTo(positions[j]);
        if (d < threshold && d > 0.05) {
          const proximity = Math.min(1.0, Math.max(0.0, (threshold - d) / (threshold - minDist)));
          const intensity = Math.pow(proximity, 1.25);
          activePairs.push({ a: i, b: j, dist: d, intensity });

          // Update planet A reaction
          if (intensity > localReactions.current[i].intensity) {
            localReactions.current[i].intensity = intensity;
            localReactions.current[i].direction.subVectors(positions[j], positions[i]).normalize();
          }
          // Update planet B reaction
          if (intensity > localReactions.current[j].intensity) {
            localReactions.current[j].intensity = intensity;
            localReactions.current[j].direction.subVectors(positions[i], positions[j]).normalize();
          }
        }
      }
    }

    onUpdateReactions(localReactions.current);

    // Sort by intensity descending so the strongest interactions take priority
    activePairs.sort((p1, p2) => p2.intensity - p1.intensity);

    if (pointsGeoRef.current && linesGeoRef.current) {
      const pPosAttr = pointsGeoRef.current.attributes.position as THREE.BufferAttribute;
      const pColAttr = pointsGeoRef.current.attributes.color as THREE.BufferAttribute;
      const pPosArr = pPosAttr.array as Float32Array;
      const pColArr = pColAttr.array as Float32Array;

      const lPosAttr = linesGeoRef.current.attributes.position as THREE.BufferAttribute;
      const lColAttr = linesGeoRef.current.attributes.color as THREE.BufferAttribute;
      const lPosArr = lPosAttr.array as Float32Array;
      const lColArr = lColAttr.array as Float32Array;

      let pointIdx = 0;
      let lineVertexIdx = 0;

      const pairCount = Math.min(activePairs.length, MAX_ACTIVE_PAIRS);

      for (let p = 0; p < pairCount; p++) {
        const pair = activePairs[p];
        const pA = positions[pair.a];
        const pB = positions[pair.b];
        const intensity = pair.intensity;

        _vecA.copy(pA);
        _vecB.copy(pB);
        _dir.subVectors(_vecB, _vecA).normalize();

        // Compute orthonormal coordinate frame for helical spirals
        if (Math.abs(_dir.y) < 0.92) {
          _norm1.crossVectors(_dir, _up).normalize();
        } else {
          _norm1.crossVectors(_dir, _right).normalize();
        }
        _norm2.crossVectors(_dir, _norm1).normalize();

        const speed = 0.55;
        const spinSpeed = 2.4;
        const envelopeRadius = (0.28 * scale) * (0.4 + 0.6 * intensity);

        // STREAM 1: Planet A -> Planet B (Flowing outward from A to B)
        for (let k = 0; k < STREAM_A_COUNT; k++) {
          const u = k / STREAM_A_COUNT;
          const s = (u + elapsed * speed) % 1.0; // [0..1]
          const spiralAngle = 2 * Math.PI * (2.4 * s + elapsed * spinSpeed);
          const r = Math.sin(Math.PI * s) * envelopeRadius * (0.85 + 0.15 * Math.sin(3 * Math.PI * s));

          const offX = r * (Math.cos(spiralAngle) * _norm1.x + Math.sin(spiralAngle) * _norm2.x);
          const offY = r * (Math.cos(spiralAngle) * _norm1.y + Math.sin(spiralAngle) * _norm2.y);
          const offZ = r * (Math.cos(spiralAngle) * _norm1.z + Math.sin(spiralAngle) * _norm2.z);

          const px = _vecA.x + s * (_vecB.x - _vecA.x) + offX;
          const py = _vecA.y + s * (_vecB.y - _vecA.y) + offY;
          const pz = _vecA.z + s * (_vecB.z - _vecA.z) + offZ;

          pPosArr[pointIdx * 3] = px;
          pPosArr[pointIdx * 3 + 1] = py;
          pPosArr[pointIdx * 3 + 2] = pz;

          // Glowing electric cyan-white or cobalt-violet
          const fade = Math.sin(Math.PI * s) * intensity;
          const rCol = isLight ? 0.0 : 0.77 + 0.23 * (1.0 - s);
          const gCol = isLight ? 0.33 * fade : 1.0 * fade;
          const bCol = (isLight ? 1.0 : 1.0) * fade;

          pColArr[pointIdx * 3] = rCol;
          pColArr[pointIdx * 3 + 1] = gCol;
          pColArr[pointIdx * 3 + 2] = bCol;

          pointIdx++;
        }

        // STREAM 2: Planet B -> Planet A (Flowing opposite, intertwined in counter-helix)
        for (let k = 0; k < STREAM_B_COUNT; k++) {
          const u = (k + 0.5) / STREAM_B_COUNT;
          const s = (u + elapsed * speed) % 1.0;
          // Counter-clockwise spin offset by half-turn (pi) to weave between Stream 1
          const spiralAngle = 2 * Math.PI * (-2.4 * s - elapsed * spinSpeed + 0.5);
          const r = Math.sin(Math.PI * s) * envelopeRadius * (0.85 + 0.15 * Math.sin(3 * Math.PI * s));

          const offX = r * (Math.cos(spiralAngle) * _norm1.x + Math.sin(spiralAngle) * _norm2.x);
          const offY = r * (Math.cos(spiralAngle) * _norm1.y + Math.sin(spiralAngle) * _norm2.y);
          const offZ = r * (Math.cos(spiralAngle) * _norm1.z + Math.sin(spiralAngle) * _norm2.z);

          const px = _vecB.x - s * (_vecB.x - _vecA.x) + offX;
          const py = _vecB.y - s * (_vecB.y - _vecA.y) + offY;
          const pz = _vecB.z - s * (_vecB.z - _vecA.z) + offZ;

          pPosArr[pointIdx * 3] = px;
          pPosArr[pointIdx * 3 + 1] = py;
          pPosArr[pointIdx * 3 + 2] = pz;

          const fade = Math.sin(Math.PI * s) * intensity;
          const rCol = isLight ? 0.12 * fade : 0.65 * fade;
          const gCol = isLight ? 0.28 * fade : 0.95 * fade;
          const bCol = (isLight ? 0.95 : 1.0) * fade;

          pColArr[pointIdx * 3] = rCol;
          pColArr[pointIdx * 3 + 1] = gCol;
          pColArr[pointIdx * 3 + 2] = bCol;

          pointIdx++;
        }

        // LAGRANGE CUSPS & TRANSFER SPARKLES
        for (let k = 0; k < SPARKLE_COUNT; k++) {
          const atA = k % 2 === 0;
          const center = atA ? _vecA : _vecB;
          const sign = atA ? 1 : -1;
          const subPhase = ((k * 0.37 + elapsed * 1.5) % 1.0);
          const distAlong = subPhase * 0.3 * sign;

          const swirlAngle = elapsed * 3.5 + k * 1.25;
          const swirlR = 0.12 * (1.0 - subPhase * 0.5) * scale;

          pPosArr[pointIdx * 3] = center.x + _dir.x * distAlong + Math.cos(swirlAngle) * _norm1.x * swirlR;
          pPosArr[pointIdx * 3 + 1] = center.y + _dir.y * distAlong + Math.sin(swirlAngle) * _norm2.y * swirlR;
          pPosArr[pointIdx * 3 + 2] = center.z + _dir.z * distAlong + Math.cos(swirlAngle) * _norm1.z * swirlR;

          const sparkleAlpha = (0.7 + 0.3 * Math.sin(k * 4.2 + elapsed * 8.0)) * intensity;
          pColArr[pointIdx * 3] = (isLight ? 0.0 : 1.0) * sparkleAlpha;
          pColArr[pointIdx * 3 + 1] = (isLight ? 0.33 : 1.0) * sparkleAlpha;
          pColArr[pointIdx * 3 + 2] = sparkleAlpha;

          pointIdx++;
        }

        // BRAIDED QUANTUM ENERGY FILAMENTS (connecting the double-helix)
        for (let m = 0; m < LINES_PER_PAIR; m++) {
          const s = (m + 0.5) / LINES_PER_PAIR;
          const a1 = 2 * Math.PI * (2.4 * s + elapsed * spinSpeed);
          const a2 = 2 * Math.PI * (-2.4 * (1 - s) - elapsed * spinSpeed + 0.5);
          const r = Math.sin(Math.PI * s) * envelopeRadius;

          // Helix 1 point
          const x1 = _vecA.x + s * (_vecB.x - _vecA.x) + r * (Math.cos(a1) * _norm1.x + Math.sin(a1) * _norm2.x);
          const y1 = _vecA.y + s * (_vecB.y - _vecA.y) + r * (Math.cos(a1) * _norm1.y + Math.sin(a1) * _norm2.y);
          const z1 = _vecA.z + s * (_vecB.z - _vecA.z) + r * (Math.cos(a1) * _norm1.z + Math.sin(a1) * _norm2.z);

          // Helix 2 point
          const x2 = _vecA.x + s * (_vecB.x - _vecA.x) + r * (Math.cos(a2) * _norm1.x + Math.sin(a2) * _norm2.x);
          const y2 = _vecA.y + s * (_vecB.y - _vecA.y) + r * (Math.cos(a2) * _norm1.y + Math.sin(a2) * _norm2.y);
          const z2 = _vecA.z + s * (_vecB.z - _vecA.z) + r * (Math.cos(a2) * _norm1.z + Math.sin(a2) * _norm2.z);

          lPosArr[lineVertexIdx * 3] = x1;
          lPosArr[lineVertexIdx * 3 + 1] = y1;
          lPosArr[lineVertexIdx * 3 + 2] = z1;

          lPosArr[(lineVertexIdx + 1) * 3] = x2;
          lPosArr[(lineVertexIdx + 1) * 3 + 1] = y2;
          lPosArr[(lineVertexIdx + 1) * 3 + 2] = z2;

          const lineFade = Math.sin(Math.PI * s) * intensity * 0.65;
          const lR = isLight ? 0.0 : 0.77 * lineFade;
          const lG = isLight ? 0.33 * lineFade : 1.0 * lineFade;
          const lB = 1.0 * lineFade;

          lColArr[lineVertexIdx * 3] = lR;
          lColArr[lineVertexIdx * 3 + 1] = lG;
          lColArr[lineVertexIdx * 3 + 2] = lB;

          lColArr[(lineVertexIdx + 1) * 3] = lR;
          lColArr[(lineVertexIdx + 1) * 3 + 1] = lG;
          lColArr[(lineVertexIdx + 1) * 3 + 2] = lB;

          lineVertexIdx += 2;
        }
      }

      // Zero out unused points
      while (pointIdx < TOTAL_POINTS) {
        pPosArr[pointIdx * 3] = 0;
        pPosArr[pointIdx * 3 + 1] = 0;
        pPosArr[pointIdx * 3 + 2] = 0;
        pColArr[pointIdx * 3] = 0;
        pColArr[pointIdx * 3 + 1] = 0;
        pColArr[pointIdx * 3 + 2] = 0;
        pointIdx++;
      }

      // Zero out unused lines
      while (lineVertexIdx < TOTAL_LINE_VERTICES) {
        lPosArr[lineVertexIdx * 3] = 0;
        lPosArr[lineVertexIdx * 3 + 1] = 0;
        lPosArr[lineVertexIdx * 3 + 2] = 0;
        lColArr[lineVertexIdx * 3] = 0;
        lColArr[lineVertexIdx * 3 + 1] = 0;
        lColArr[lineVertexIdx * 3 + 2] = 0;
        lineVertexIdx++;
      }

      pPosAttr.needsUpdate = true;
      pColAttr.needsUpdate = true;
      lPosAttr.needsUpdate = true;
      lColAttr.needsUpdate = true;
    }

    if (pointsMatRef.current) {
      const maxInt = activePairs.length > 0 ? activePairs[0].intensity : 0;
      pointsMatRef.current.opacity = Math.max(0, maxInt * 0.95);
    }
    if (linesMatRef.current) {
      const maxInt = activePairs.length > 0 ? activePairs[0].intensity : 0;
      linesMatRef.current.opacity = Math.max(0, maxInt * 0.7);
    }
  });

  return (
    <group>
      <points>
        <bufferGeometry ref={pointsGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            array={pointPositions}
            count={TOTAL_POINTS}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={pointColors}
            count={TOTAL_POINTS}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMatRef}
          vertexColors
          size={isLight ? 0.055 : 0.05}
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation={true}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </points>

      <lineSegments>
        <bufferGeometry ref={linesGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={TOTAL_LINE_VERTICES}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={lineColors}
            count={TOTAL_LINE_VERTICES}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={linesMatRef}
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

interface PlanetarySystemProps {
  projects: Project[];
  startIndex: number;
  systemName: string;
  coordText: string;
  position: [number, number, number];
  scale?: number;
  onPlanetClick: (project: Project) => void;
  selectedProject?: Project | null;
  appMode?: "loading" | "terminal" | "universe";
  isLight?: boolean;
}

function PlanetarySystem({
  projects,
  startIndex,
  systemName,
  coordText,
  position,
  scale = 1.0,
  onPlanetClick,
  selectedProject,
  appMode,
  isLight = false,
}: PlanetarySystemProps) {
  // Store live positions of each planet inside this system
  const planetPositions = useRef<THREE.Vector3[]>([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]);

  const [reactions, setReactions] = useState<{ intensity: number; direction: THREE.Vector3 }[]>([
    { intensity: 0, direction: new THREE.Vector3() },
    { intensity: 0, direction: new THREE.Vector3() },
    { intensity: 0, direction: new THREE.Vector3() },
    { intensity: 0, direction: new THREE.Vector3() },
  ]);

  const handleUpdatePosition = (localIdx: number, pos: THREE.Vector3) => {
    if (planetPositions.current[localIdx]) {
      planetPositions.current[localIdx].copy(pos);
    }
  };

  const handleUpdateReactions = (latestReactions: { intensity: number; direction: THREE.Vector3 }[]) => {
    // Keep reactions synchronized for ProjectNode halo rendering
    setReactions((prev) => {
      let changed = false;
      for (let i = 0; i < 4; i++) {
        if (
          Math.abs(prev[i].intensity - latestReactions[i].intensity) > 0.05 ||
          prev[i].intensity !== latestReactions[i].intensity
        ) {
          changed = true;
          break;
        }
      }
      return changed
        ? latestReactions.map((r) => ({ intensity: r.intensity, direction: r.direction.clone() }))
        : prev;
    });
  };

  return (
    <group position={position}>
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
          <span className={`font-bold whitespace-nowrap ${isLight ? "text-[#0055ff]" : "text-[#c4ffff]"}`}>
            {systemName}
          </span>
          <span
            className={`text-[7px] md:text-[8px] tracking-wider whitespace-nowrap ${
              isLight ? "text-black/70" : "text-white/80"
            }`}
          >
            {coordText}
          </span>
        </div>
      </Html>

      {/* Planetary Orbits (Guaranteed 100% non-overlapping) */}
      {projects.map((project, idx) => (
        <OrbitGroup
          key={project.id}
          index={startIndex + idx}
          localIndex={idx}
          project={project}
          config={ORBIT_CONFIGS[idx % ORBIT_CONFIGS.length]}
          scale={scale}
          onClick={() => onPlanetClick(project)}
          isSelected={selectedProject?.id === project.id}
          selectedProjectId={selectedProject?.id}
          appMode={appMode}
          isLight={isLight}
          onUpdatePosition={handleUpdatePosition}
          reaction={reactions[idx]}
        />
      ))}

      {/* Intertwined Particle Bridge between close planets */}
      <PlanetaryEntanglementBridge
        planetPositions={planetPositions}
        onUpdateReactions={handleUpdateReactions}
        scale={scale}
        isLight={isLight}
      />
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
  const creativeProjects = projects.slice(0, 4);
  const industryProjects = projects.slice(4, 8);

  return (
    <group position={[0, 0, 0]}>
      {activeUniverse === "all" && (
        <>
          <PlanetarySystem
            projects={creativeProjects}
            startIndex={0}
            systemName="[ CREATIVE.SYS ]"
            coordText="COORD: [-05.38, +00.42, -02.15] // 05.81 AU"
            position={[-5, 0, -2]}
            scale={1.0}
            onPlanetClick={onPlanetClick}
            selectedProject={selectedProject}
            appMode={appMode}
            isLight={isLight}
          />
          <PlanetarySystem
            projects={industryProjects}
            startIndex={4}
            systemName="[ INDUSTRY.SYS ]"
            coordText="COORD: [+05.41, -00.37, +02.08] // 05.80 AU"
            position={[5, 0, 2]}
            scale={1.0}
            onPlanetClick={onPlanetClick}
            selectedProject={selectedProject}
            appMode={appMode}
            isLight={isLight}
          />
        </>
      )}

      {activeUniverse !== "all" && (
        <PlanetarySystem
          projects={activeUniverse === "creative" ? creativeProjects : industryProjects}
          startIndex={activeUniverse === "creative" ? 0 : 4}
          systemName={activeUniverse === "creative" ? "[ CREATIVE.SYS ]" : "[ INDUSTRY.SYS ]"}
          coordText={
            activeUniverse === "creative"
              ? "COORD: [-05.38, +00.42, -02.15] // SECTOR_CR"
              : "COORD: [+05.41, -00.37, +02.08] // SECTOR_IN"
          }
          position={[0, 0, 0]}
          scale={1.25}
          onPlanetClick={onPlanetClick}
          selectedProject={selectedProject}
          appMode={appMode}
          isLight={isLight}
        />
      )}
    </group>
  );
}
