import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface P3rmfrstPointCloudProps {
  colorMode?: "real" | "cyber" | "matrix";
  enableScan?: boolean;
}

/**
 * Procedural High-Fidelity 3D Point Cloud Generator for P3RMFRST
 * Faithful to the 3-view reference image:
 * - High tunnel hood with angular peak visor and face cowl mask
 * - Drop-shoulder capelet / mantle overlay
 * - Monolithic full-length duster trench coat with rear walking slit & center zip
 * - Heavy articulated tactical gloves with gauntlet cuffs & emblem
 * - Chunky expedition subzero lug sole boots
 */
export default function P3rmfrstPointCloud({
  colorMode = "real",
  enableScan = true,
}: P3rmfrstPointCloudProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const scanPlaneRef = useRef<number>(-1.6);

  // Generate 36,000 accurate surface points for the look
  const { positions, baseColors, cyberColors, matrixColors, originalY } = useMemo(() => {
    const pts: number[] = [];
    const colReal: number[] = [];
    const colCyber: number[] = [];
    const colMatrix: number[] = [];
    const origY: number[] = [];

    const addPoint = (
      x: number,
      y: number,
      z: number,
      rgbReal: [number, number, number],
      rgbCyber: [number, number, number] = [0.77, 1.0, 1.0],
      rgbMatrix: [number, number, number] = [0.15, 0.95, 0.6]
    ) => {
      // Micro-jitter for organic cloth feel
      const jitter = 0.005;
      const jx = x + (Math.random() - 0.5) * jitter;
      const jy = y + (Math.random() - 0.5) * jitter;
      const jz = z + (Math.random() - 0.5) * jitter;

      pts.push(jx, jy, jz);
      origY.push(jy);

      // Micro shade variation
      const shade = 0.92 + Math.random() * 0.16;
      colReal.push(
        Math.min(1, rgbReal[0] * shade),
        Math.min(1, rgbReal[1] * shade),
        Math.min(1, rgbReal[2] * shade)
      );
      colCyber.push(rgbCyber[0], rgbCyber[1], rgbCyber[2]);
      colMatrix.push(rgbMatrix[0], rgbMatrix[1], rgbMatrix[2]);
    };

    // Color definitions based on reference image
    const FABRIC_STONE: [number, number, number] = [0.85, 0.83, 0.79];
    const FABRIC_DARK: [number, number, number] = [0.65, 0.63, 0.60];
    const FABRIC_CREASE: [number, number, number] = [0.45, 0.44, 0.42];
    const HARDWARE_ZIP: [number, number, number] = [0.95, 0.98, 1.0];
    const GLOVE_LEATHER: [number, number, number] = [0.72, 0.70, 0.66];
    const GLOVE_DARK: [number, number, number] = [0.35, 0.35, 0.36];
    const SOLE_BLACK: [number, number, number] = [0.22, 0.22, 0.24];

    // 1. HOOD (Tunnel Balaclava Hood with peak visor)
    const HOOD_POINTS = 5500;
    for (let i = 0; i < HOOD_POINTS; i++) {
      const v = Math.random();
      const y = 1.15 + v * 0.45; // 1.15 to 1.60
      const angle = (Math.random() - 0.5) * Math.PI * 1.85; // almost full wrap

      // Hood shape radius
      const progress = (y - 1.15) / 0.45;
      const radX = 0.22 + Math.sin(progress * Math.PI) * 0.08;
      const radZ = 0.26 + Math.sin(progress * Math.PI) * 0.09;

      // Forward beak/visor peak at top-front
      let visorPeak = 0;
      if (Math.cos(angle) > 0 && y > 1.35) {
        visorPeak = Math.pow((y - 1.35) / 0.25, 1.2) * Math.cos(angle) * 0.12;
      }

      const x = Math.sin(angle) * radX;
      let z = Math.cos(angle) * radZ + visorPeak;

      // Flatten or push back of hood slightly
      if (z < 0) z *= 1.05;

      addPoint(x, y, z, progress > 0.85 ? FABRIC_DARK : FABRIC_STONE, [0.8, 1.0, 1.0]);
    }

    // 2. FACE MASK / COWL (High front cover over nose & mouth)
    const MASK_POINTS = 2800;
    for (let i = 0; i < MASK_POINTS; i++) {
      const u = Math.random();
      const v = Math.random();
      const y = 1.08 + v * 0.26; // 1.08 to 1.34
      // Covers front arc from -75 deg to +75 deg
      const angle = (u - 0.5) * (Math.PI * 0.85);

      const rad = 0.21 + (y - 1.08) * 0.14; // flares outward towards collar top
      const x = Math.sin(angle) * rad;
      const z = Math.cos(angle) * rad * 1.12;

      // Slight vertical seam along center of cowl
      const isCenter = Math.abs(x) < 0.015;
      addPoint(x, y, z, isCenter ? HARDWARE_ZIP : FABRIC_STONE, [0.77, 1.0, 1.0]);
    }

    // 2B. EYE RECESS (Dark shadow under the hood visor)
    const EYE_POINTS = 600;
    for (let i = 0; i < EYE_POINTS; i++) {
      const x = (Math.random() - 0.5) * 0.22;
      const y = 1.32 + Math.random() * 0.06;
      const z = 0.14 + (Math.random() - 0.5) * 0.03; // recessed inside
      addPoint(x, y, z, [0.15, 0.15, 0.16], [0.3, 0.6, 0.9]);
    }

    // 3. STRUCTURED SHOULDERS & CAPELET / DROP SHOULDER MANTLE
    const CAPELET_POINTS = 4800;
    for (let i = 0; i < CAPELET_POINTS; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const t = Math.random(); // 0 = inner neck, 1 = outer shoulder tip
      const s = Math.random(); // front-to-back depth

      const x = side * (0.22 + t * 0.44); // 0.22 to 0.66 broad
      const y = 1.20 - t * 0.24 - Math.pow(t, 2) * 0.05; // sloping down
      const z = (s - 0.5) * (0.44 - t * 0.12);

      // Knife-edge angular bottom rim
      const isEdge = t > 0.92;
      addPoint(x, y, z, isEdge ? FABRIC_CREASE : FABRIC_STONE, [0.9, 1.0, 1.0]);
    }

    // 4. MAIN MONOLITHIC COAT (A-Line Duster Trench from Neck to Floor)
    const COAT_POINTS = 14000;
    for (let i = 0; i < COAT_POINTS; i++) {
      const v = Math.random();
      const y = -1.35 + v * 2.45; // -1.35 (floor) to 1.10 (neck)
      const normY = (y - (-1.35)) / 2.45; // 0 at hem, 1 at neck

      const angle = Math.random() * Math.PI * 2;

      // A-line expansion: wider at bottom (rad ~ 0.48), narrower at chest (rad ~ 0.26)
      const radBaseX = 0.48 - normY * 0.22;
      const radBaseZ = 0.38 - normY * 0.16;

      // Architectural drape folds (sculptural vertical ripples)
      const fold = Math.sin(angle * 5 + normY * 1.5) * 0.025;
      const radX = radBaseX + fold;
      const radZ = radBaseZ + fold;

      let x = Math.sin(angle) * radX;
      let z = Math.cos(angle) * radZ;

      // REAR WALKING VENT / SLIT
      // From y: -1.35 up to y: -0.55 at the back (z < 0), split the coat into two flaps
      if (z < -0.15 && y < -0.55) {
        if (Math.abs(x) < 0.035) {
          // Inside the slit gap, omit point or push to sides
          x += (x >= 0 ? 0.035 : -0.035);
        }
      }

      // Check if point is on front center zipper line
      const isFrontSeam = z > 0 && Math.abs(x) < 0.016;
      const isHem = y < -1.30;

      const col = isFrontSeam
        ? HARDWARE_ZIP
        : isHem
        ? FABRIC_DARK
        : fold < -0.01
        ? FABRIC_CREASE
        : FABRIC_STONE;

      addPoint(x, y, z, col, isFrontSeam ? [1.0, 1.0, 1.0] : [0.77, 1.0, 1.0]);
    }

    // 5. CENTER ZIPPER TRACK & PULL
    for (let i = 0; i < 600; i++) {
      const y = -1.35 + (i / 600) * 2.45;
      const normY = (y - (-1.35)) / 2.45;
      const rz = (0.38 - normY * 0.16) * 1.01;
      addPoint((Math.random() - 0.5) * 0.01, y, rz, HARDWARE_ZIP, [1, 1, 1]);
    }

    // 6. SLEEVES & ARMS (Under the shoulder capelet)
    const SLEEVE_POINTS = 3800;
    for (let i = 0; i < SLEEVE_POINTS; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const t = Math.random(); // 0 at shoulder, 1 at wrist
      const angle = Math.random() * Math.PI * 2;

      // Natural sleeve curve slightly forward and outward
      const sx = side * (0.48 + Math.sin(t * Math.PI * 0.5) * 0.12);
      const sy = 0.95 - t * 0.90; // 0.95 down to 0.05
      const sz = 0.02 + t * 0.05;

      const rad = 0.12 - t * 0.025 + Math.sin(t * Math.PI * 4) * 0.01; // fabric wrinkles
      const x = sx + Math.cos(angle) * rad;
      const y = sy;
      const z = sz + Math.sin(angle) * rad;

      addPoint(x, y, z, FABRIC_STONE, [0.77, 1.0, 1.0]);
    }

    // 7. HEAVY TACTICAL GAUNTLET GLOVES (with knuckle armor & wrist emblem "3")
    const GLOVE_POINTS = 3200;
    for (let i = 0; i < GLOVE_POINTS; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const u = Math.random();
      const v = Math.random();

      // Wrist Cuff to Fingertips: y from 0.06 down to -0.42
      const y = 0.06 - u * 0.48;

      let x = side * (0.58 + (Math.random() - 0.5) * 0.08);
      let z = 0.06 + (Math.random() - 0.5) * 0.07;

      let col = GLOVE_LEATHER;

      // Knuckle protector pad at y ~ -0.15
      if (y > -0.18 && y < -0.13 && z > 0.08) {
        z += 0.025; // raised knuckle guard
        col = GLOVE_DARK;
      }

      // Circular Badge with emblem "3" on lateral wrist
      if (y > -0.04 && y < 0.04 && Math.abs(x) > 0.60) {
        col = HARDWARE_ZIP; // distinctive bright emblem
      }

      // Fingers separation
      if (y < -0.24) {
        // slight curl inward
        z += Math.pow(((-y) - 0.24) / 0.18, 1.5) * 0.04;
      }

      addPoint(x, y, z, col, [0.9, 0.95, 1.0]);
    }

    // 8. CHUNKY EXPEDITION LUG SOLE BOOTS
    const BOOT_POINTS = 2400;
    for (let i = 0; i < BOOT_POINTS; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const t = Math.random(); // 0 heel, 1 toe
      const y = -1.58 + Math.random() * 0.24; // -1.58 to -1.34

      const bx = side * 0.21 + (Math.random() - 0.5) * 0.12;
      const bz = -0.06 + t * 0.32; // elongated foot

      const isSole = y < -1.50;
      addPoint(
        bx,
        y,
        bz,
        isSole ? SOLE_BLACK : [0.38, 0.38, 0.40],
        isSole ? [0.2, 0.4, 0.6] : [0.6, 0.8, 1.0]
      );
    }

    return {
      positions: new Float32Array(pts),
      baseColors: new Float32Array(colReal),
      cyberColors: new Float32Array(colCyber),
      matrixColors: new Float32Array(colMatrix),
      originalY: origY,
    };
  }, []);

  // Dynamic animation loop:
  // - Laser scanline sweeps vertically, illuminating points near the beam
  // - Subtle organic breathing / floating pulse
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const colorsAttr = geom.getAttribute("color") as THREE.BufferAttribute;
    if (!colorsAttr) return;

    const time = state.clock.getElapsedTime();

    if (enableScan) {
      // Sweep scan plane between y: -1.6 and +1.6
      scanPlaneRef.current += delta * 1.2;
      if (scanPlaneRef.current > 1.7) {
        scanPlaneRef.current = -1.7;
      }
    }

    const scanY = scanPlaneRef.current;
    const activeColorSource =
      colorMode === "cyber"
        ? cyberColors
        : colorMode === "matrix"
        ? matrixColors
        : baseColors;

    const colors = colorsAttr.array as Float32Array;
    const len = originalY.length;

    for (let i = 0; i < len; i++) {
      const y = originalY[i];
      const i3 = i * 3;

      let r = activeColorSource[i3];
      let g = activeColorSource[i3 + 1];
      let b = activeColorSource[i3 + 2];

      if (enableScan) {
        // Distance to laser scan plane
        const dist = Math.abs(y - scanY);
        if (dist < 0.14) {
          const intensity = 1 - dist / 0.14;
          // Glow boost in cyan/white
          r = THREE.MathUtils.lerp(r, 0.85, intensity * 0.95);
          g = THREE.MathUtils.lerp(g, 1.0, intensity * 0.98);
          b = THREE.MathUtils.lerp(b, 1.0, intensity * 1.0);
        }
      }

      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;
    }

    colorsAttr.needsUpdate = true;

    // Subtle gentle ambient float rotation
    pointsRef.current.rotation.y = Math.sin(time * 0.4) * 0.05;
  });

  return (
    <group position={[0, -0.05, 0]}>
      {/* 3D Point Cloud Mesh */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[baseColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.024}
          vertexColors
          transparent
          opacity={0.92}
          sizeAttenuation
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </points>

      {/* Cybernetic Ground Radar Disc */}
      <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.95, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>

      {/* Inner Radar Crosshairs */}
      <mesh position={[0, -1.595, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.02, 0.55, 4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
