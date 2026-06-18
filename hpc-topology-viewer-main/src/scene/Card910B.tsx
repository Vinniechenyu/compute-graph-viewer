import { Suspense, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import ascendLogoUrl from '../assets/ascend-logo.svg';

export type RenderStyle = 'pbr' | 'flat' | 'blueprint' | 'clay';
export type CardState = 'normal' | 'hover' | 'selected';
export type ClayTheme = 'light' | 'dark';

type Role = 'pcb' | 'substrate' | 'die' | 'hbm' | 'caps' | 'connector';

interface Part {
  role: Role;
  size: [number, number, number];
  position: [number, number, number];
}

// Simplified Ascend 910B card: PCB board + a single thin package block.
const ALL_PARTS: Part[] = [
  { role: 'pcb', size: [2.0, 0.06, 1.16], position: [0, 0.03, 0] },
  // lifted a hair (bottom at 0.064 vs board top 0.06) so the contact-edge ring
  // doesn't z-fight with the board top face and stays visible
  { role: 'die', size: [0.8, 0.06, 0.8], position: [0, 0.094, 0] },
];

// package top face (die center y + half height) — where the silkscreen logo sits
const DIE_TOP_Y = 0.094 + 0.03;

const PBR_MAT: Record<Role, { color: string; metalness: number; roughness: number }> = {
  pcb: { color: '#123524', metalness: 0.06, roughness: 0.8 },
  substrate: { color: '#23272f', metalness: 0.22, roughness: 0.62 },
  die: { color: '#2c3140', metalness: 0.58, roughness: 0.26 },
  hbm: { color: '#3a3f4a', metalness: 0.62, roughness: 0.34 },
  caps: { color: '#aab0bb', metalness: 0.72, roughness: 0.4 },
  connector: { color: '#d8b15a', metalness: 0.95, roughness: 0.24 },
};

const FLAT_COLOR: Record<Role, string> = {
  pcb: '#1f9d72',
  substrate: '#3a4150',
  die: '#4c6ef5',
  hbm: '#748ffc',
  caps: '#ffd43b',
  connector: '#fab005',
};

const FLAT_EDGE = '#0f1a2b';
// board (pcb) and package block carry different clay fills:
// light → board lighter than package; dark → board deeper than package.
const CLAY_BODY: Record<ClayTheme, { pcb: string; die: string }> = {
  light: { pcb: '#f8f8f8', die: '#f4f4f4' },
  dark: { pcb: '#22262d', die: '#383e48' },
};
const CLAY_SELECTED = '#4f8ef7';
const BP_BODY = '#15315a';

interface Visual {
  showEdges: boolean;
  edgeColor: string;
  edgeOpacity: number;
  edgeWidth: number;
  emissive: string;
  emissiveIntensity: number;
}

function styleVisual(style: RenderStyle, state: CardState, theme: ClayTheme): Visual {
  const accent = state === 'selected';
  const hover = state === 'hover';

  switch (style) {
    case 'pbr':
      return {
        showEdges: accent || hover,
        edgeColor: accent ? '#5bd1ff' : '#9fe7ff',
        edgeOpacity: accent ? 0.9 : 0.5,
        edgeWidth: 1.4,
        emissive: '#3bc9ff',
        emissiveIntensity: accent ? 0.34 : hover ? 0.12 : 0,
      };
    case 'flat':
      return {
        showEdges: true,
        edgeColor: accent ? '#4dabf7' : hover ? '#3a4250' : FLAT_EDGE,
        edgeOpacity: accent ? 1 : 0.55,
        edgeWidth: accent ? 1.8 : 1.2,
        emissive: '#4dabf7',
        emissiveIntensity: accent ? 0.18 : 0,
      };
    case 'blueprint':
      return {
        showEdges: true,
        edgeColor: accent ? '#ffffff' : hover ? '#9fe0ff' : '#4aa8e0',
        edgeOpacity: accent ? 1 : hover ? 0.92 : 0.72,
        edgeWidth: accent ? 1.8 : 1.2,
        emissive: '#000000',
        emissiveIntensity: 0,
      };
    case 'clay':
    default: {
      // selected is expressed by turning the fill blue (see clayBody),
      // the edge color stays the same gray.
      const baseEdge = theme === 'dark' ? '#767d88' : '#aab0ba';
      const hoverEdge = theme === 'dark' ? '#9aa1ab' : '#7c828d';
      return {
        showEdges: true,
        edgeColor: hover ? hoverEdge : baseEdge,
        edgeOpacity: 0.85,
        edgeWidth: 2,
        emissive: '#000000',
        emissiveIntensity: 0,
      };
    }
  }
}

function PartMesh({
  part,
  style,
  vis,
  clayTheme,
  claySelected,
}: {
  part: Part;
  style: RenderStyle;
  vis: Visual;
  clayTheme: ClayTheme;
  claySelected: boolean;
}) {
  const edges = vis.showEdges ? (
    <Edges threshold={18} color={vis.edgeColor} transparent opacity={vis.edgeOpacity} lineWidth={vis.edgeWidth} />
  ) : null;

  let material: JSX.Element;
  switch (style) {
    case 'pbr': {
      const m = PBR_MAT[part.role];
      material = (
        <meshStandardMaterial
          color={m.color}
          metalness={m.metalness}
          roughness={m.roughness}
          emissive={vis.emissive}
          emissiveIntensity={vis.emissiveIntensity}
        />
      );
      break;
    }
    case 'flat':
      material = (
        <meshLambertMaterial
          color={FLAT_COLOR[part.role]}
          emissive={vis.emissive}
          emissiveIntensity={vis.emissiveIntensity}
        />
      );
      break;
    case 'blueprint':
      material = <meshBasicMaterial color={BP_BODY} transparent opacity={0.1} />;
      break;
    case 'clay':
    default: {
      const clayColor = claySelected
        ? CLAY_SELECTED
        : CLAY_BODY[clayTheme][part.role === 'pcb' ? 'pcb' : 'die'];
      material = (
        <meshStandardMaterial
          color={clayColor}
          metalness={0.02}
          roughness={0.95}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      );
      break;
    }
  }

  return (
    <mesh position={part.position} castShadow={style === 'pbr' || style === 'clay'}>
      <boxGeometry args={part.size} />
      {material}
      {edges}
    </mesh>
  );
}

// Ascend/CANN silkscreen logo laid flat on the package top face.
function PackageLogo() {
  const texture = useLoader(THREE.TextureLoader, ascendLogoUrl);
  texture.anisotropy = 8;
  return (
    <mesh position={[0, DIE_TOP_Y + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.62, 0.236]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

export function Card910B({
  style,
  state,
  theme = 'light',
  onSelect,
  onHover,
  onBlur,
}: {
  style: RenderStyle;
  state: CardState;
  theme?: ClayTheme;
  onSelect: () => void;
  onHover: () => void;
  onBlur: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const vis = styleVisual(style, state, theme);
  const liftTarget = state === 'hover' ? 0.16 : state === 'selected' ? 0.08 : 0;

  useFrame(() => {
    if (!group.current) return;
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, liftTarget, 0.16);
  });

  return (
    <group
      ref={group}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover();
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'default';
        onBlur();
      }}
    >
      {ALL_PARTS.map((part, i) => (
        <PartMesh
          key={`${part.role}-${i}`}
          part={part}
          style={style}
          vis={vis}
          clayTheme={theme}
          claySelected={state === 'selected'}
        />
      ))}
      {style !== 'blueprint' ? (
        <Suspense fallback={null}>
          <PackageLogo />
        </Suspense>
      ) : null}
    </group>
  );
}
