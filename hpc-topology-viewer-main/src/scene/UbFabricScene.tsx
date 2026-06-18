import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { Edges, Grid, Line, OrbitControls, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import ascendLogoUrl from '../assets/ascend-logo.svg';
import {
  OVERLAY_FOR_KIND,
  PARALLEL,
  cardById,
  cards,
  epNodeIds,
  links,
  linkById,
  nodeLinkById,
  nodeLinks,
  nodes,
  type FabricCard,
  type FabricLink,
  type FabricNode,
  type FabricNodeLink,
  type LinkKind,
  type NodeLinkKind,
  type OverlayKind,
} from './ubFabricData';

export type SceneTheme = 'light' | 'dark';
export type LinkStyle = 'flat' | 'band';
export type SceneVariant = 'default' | 'reference';

export interface LinkHoverTip {
  title: string;
  detail: string;
  meta: string;
  color: string;
}

export interface RenderSettings {
  zoom: number;
  distance: number;
  height: number;
  panY: number;
  keyLight: number;
  fillLight: number;
}

export const DEFAULT_SETTINGS: RenderSettings = {
  zoom: 300,
  distance: 1,
  height: 6.5,
  panY: 0,
  keyLight: 0.9,
  fillLight: 1.65,
};

const BASE_OPACITY = 0.3; // links rest faint; focus pops the related ones

export const LINK_COLOR: Record<LinkKind | NodeLinkKind, string> = {
  tp: '#38bdf8',
  dp: '#a78bfa',
  pp: '#4ade80',
  fabric: '#2563eb',
};
export const EP_COLOR = '#fbbf24';
export const NODE_LAYER_COLOR = '#2563eb';

// screen-space line width per kind (px). TP (intra-server) always renders as a
// thin line; DP/PP only use this when the cross-server style is set to 扁线.
const LINE_WIDTH: Record<LinkKind | NodeLinkKind, number> = { tp: 1.6, dp: 3.4, pp: 3.4, fabric: 1.4 };
// 3D flat-band width per kind (world units) — cross-server links are wide bands
const BAND_WIDTH: Record<LinkKind | NodeLinkKind, number> = { tp: 0.05, dp: 0.11, pp: 0.11, fabric: 0.045 };
// layer the kinds at slightly different heights so flat bands don't z-fight
const LINK_Y: Record<LinkKind, number> = { tp: 0.1, dp: 0.14, pp: 0.18 };

const WORLD_UP = new THREE.Vector3(0, 1, 0);

interface ThemePalette {
  background: string;
  trayEdge: string;
  grid: string;
  gridSection: string;
  boardFill: string;
  packageFill: string;
  peerFill: string;
  hoverFill: string;
  selectFill: string;
  outline: string;
  label: string;
}

const THEMES: Record<SceneTheme, ThemePalette> = {
  light: {
    background: '#eceef1',
    trayEdge: '#b7bcc6',
    grid: '#d4d8de',
    gridSection: '#c2c7cf',
    boardFill: '#f4f4f4',
    packageFill: '#e6e7ea',
    peerFill: '#eaf0f9',
    hoverFill: '#d6e4fb',
    selectFill: '#a9c8f8',
    outline: '#9aa1ab',
    label: '#6b7280',
  },
  dark: {
    background: '#0e1116',
    trayEdge: '#363d48',
    grid: '#222730',
    gridSection: '#2c323c',
    boardFill: '#2c313a',
    packageFill: '#383e48',
    peerFill: '#313742',
    hoverFill: '#2e405e',
    selectFill: '#3a5a8f',
    outline: '#525a66',
    label: '#aab2bd',
  },
};

const REFERENCE_THEMES: Record<SceneTheme, ThemePalette> = {
  light: {
    background: '#f7f9fc',
    trayEdge: '#b8c2d0',
    grid: '#e5e9f0',
    gridSection: '#d4dbe5',
    boardFill: '#fbfdff',
    packageFill: '#eef5ff',
    peerFill: '#f2f7ff',
    hoverFill: '#dfefff',
    selectFill: '#c5dcff',
    outline: '#9ca8b7',
    label: '#516172',
  },
  dark: {
    background: '#0c1118',
    trayEdge: '#3c4654',
    grid: '#1e2733',
    gridSection: '#2b3644',
    boardFill: '#f0f4f9',
    packageFill: '#dbe8f7',
    peerFill: '#cdddf0',
    hoverFill: '#b7d7ff',
    selectFill: '#8cbcff',
    outline: '#6a7686',
    label: '#d5dde8',
  },
};

function scenePalette(theme: SceneTheme, variant: SceneVariant) {
  return variant === 'reference' ? REFERENCE_THEMES[theme] : THEMES[theme];
}

export type CardVisualState = 'normal' | 'peer' | 'hover' | 'selected';

const BOARD: [number, number, number] = [0.42, 0.04, 0.3];
const PACKAGE: [number, number, number] = [0.2, 0.02, 0.16];
const NODE_BLOCK: [number, number, number] = [0.74, 0.08, 0.74];
const NODE_BLOCK_Y = 0.92;
const NODE_TOP_Y = NODE_BLOCK_Y + NODE_BLOCK[1] / 2;
const NODE_MID_Y = NODE_BLOCK_Y;
const NODE_LINK_Y: Record<NodeLinkKind, number> = { fabric: NODE_MID_Y - 0.012, dp: NODE_MID_Y, pp: NODE_MID_Y + 0.012 };
const NODE_BY_ID = new Map(nodes.map((node) => [node.id, node]));

// Ascend silkscreen logo laid flat on the package top face
function PackageLogo() {
  const texture = useLoader(THREE.TextureLoader, ascendLogoUrl);
  texture.anisotropy = 8;
  return (
    <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.17, 0.065]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function FabricCardMesh({
  card,
  theme,
  variant,
  state,
  onHover,
  onBlur,
  onSelect,
}: {
  card: FabricCard;
  theme: SceneTheme;
  variant: SceneVariant;
  state: CardVisualState;
  onHover: () => void;
  onBlur: () => void;
  onSelect: () => void;
}) {
  const pal = scenePalette(theme, variant);
  const boardFill =
    state === 'selected'
      ? pal.selectFill
      : state === 'hover'
        ? pal.hoverFill
        : state === 'peer'
          ? pal.peerFill
          : pal.boardFill;
  const outline = pal.outline;

  return (
    <group
      position={card.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        onBlur();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh castShadow={variant !== 'reference'}>
        <boxGeometry args={BOARD} />
        <meshStandardMaterial
          color={boardFill}
          metalness={variant === 'reference' ? 0.0 : 0.02}
          roughness={variant === 'reference' ? 0.72 : 0.95}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
        <Edges threshold={18} color={outline} lineWidth={variant === 'reference' ? 1.8 : 1.4} transparent opacity={variant === 'reference' ? 0.72 : 0.9} />
      </mesh>
      <mesh position={[0, 0.03, 0]} castShadow={variant !== 'reference'}>
        <boxGeometry args={PACKAGE} />
        <meshStandardMaterial
          color={pal.packageFill}
          metalness={variant === 'reference' ? 0.0 : 0.02}
          roughness={variant === 'reference' ? 0.66 : 0.92}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
        <Edges threshold={18} color={outline} lineWidth={1} transparent opacity={0.55} />
      </mesh>
      <Suspense fallback={null}>
        <PackageLogo />
      </Suspense>
    </group>
  );
}

// flat band orientation: width kept horizontal so the plane lies in the world and
// foreshortens with the isometric view (all links here are horizontal)
function bandTransform(a: THREE.Vector3, b: THREE.Vector3) {
  const dir = b.clone().sub(a);
  const len = dir.length() || 1e-3;
  dir.normalize();
  let d2 = new THREE.Vector3().crossVectors(WORLD_UP, dir);
  if (d2.lengthSq() < 1e-6) d2 = new THREE.Vector3(0, 0, 1);
  d2.y = 0;
  if (d2.lengthSq() < 1e-6) d2.set(1, 0, 0);
  d2.normalize();
  const d3 = new THREE.Vector3().crossVectors(dir, d2).normalize();
  const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, d2, d3));
  const pos = a.clone().add(b).multiplyScalar(0.5);
  return { pos, quat, len };
}

function linkEndpoints(link: FabricLink): [THREE.Vector3, THREE.Vector3] {
  const src = cardById.get(link.source)!;
  const dst = cardById.get(link.target)!;
  const y = LINK_Y[link.kind];
  return [
    new THREE.Vector3(src.position[0], y, src.position[2]),
    new THREE.Vector3(dst.position[0], y, dst.position[2]),
  ];
}

function nodeLinkEndpoints(link: FabricNodeLink): [THREE.Vector3, THREE.Vector3] {
  const src = NODE_BY_ID.get(link.source)!;
  const dst = NODE_BY_ID.get(link.target)!;
  const y = NODE_LINK_Y[link.kind];
  return [
    new THREE.Vector3(src.position[0], y, src.position[2]),
    new THREE.Vector3(dst.position[0], y, dst.position[2]),
  ];
}

function describeCardLink(link: FabricLink): LinkHoverTip {
  const src = cardById.get(link.source)!;
  const dst = cardById.get(link.target)!;
  return {
    title: `TP card link · rank_${src.rank} ↔ rank_${dst.rank}`,
    detail: `同一个 node 内的 TP 组通信。两端 rank 共享 D${src.d}/P${src.p}/C${src.c}，只改变 t 坐标，用于同一层内部的 tensor shard 协同，如 all-reduce / all-gather。`,
    meta: `${src.nodeId.toUpperCase()} · card layer · t${src.t} ↔ t${dst.t}`,
    color: LINK_COLOR[link.kind],
  };
}

function describeNodeLink(link: FabricNodeLink): LinkHoverTip {
  const src = NODE_BY_ID.get(link.source)!;
  const dst = NODE_BY_ID.get(link.target)!;
  if (link.kind === 'fabric') {
    return {
      title: `Fabric node link · ${src.id.toUpperCase()} ↔ ${dst.id.toUpperCase()}`,
      detail: '节点间基础可达性示意。4 个 node 在 Fabric layer 上两两相连，所以这里会看到 6 条边；它说明 node 之间可以通信，不代表某个训练并行组。',
      meta: `${src.label} ↔ ${dst.label} · node fabric`,
      color: LINK_COLOR.fabric,
    };
  }
  if (link.kind === 'dp') {
    return {
      title: `DP node link · ${src.id.toUpperCase()} ↔ ${dst.id.toUpperCase()}`,
      detail: `数据并行保持同一个 PP stage，只跨 DP replica 通信。这里 P${src.p} 不变，D${src.d} ↔ D${dst.d}，聚合 ${link.laneCount} 条同 t 的 rank lane，用于梯度 all-reduce。`,
      meta: `${link.label} · D axis / DP replica`,
      color: LINK_COLOR.dp,
    };
  }
  return {
    title: `PP node link · ${src.id.toUpperCase()} ↔ ${dst.id.toUpperCase()}`,
    detail: `流水线并行保持同一个 DP replica，只跨 PP stage 通信。这里 D${src.d} 不变，P${src.p} ↔ P${dst.p}，聚合 ${link.laneCount} 条同 t 的 rank lane，用于 activation / gradient send-recv。`,
    meta: `${link.label} · P axis / PP stage`,
    color: LINK_COLOR.pp,
  };
}

function describeNode(node: FabricNode): LinkHoverTip {
  const rangeStart = (node.d * PARALLEL.pp + node.p) * PARALLEL.tp;
  return {
    title: `Node block · ${node.id.toUpperCase()} ${node.label}`,
    detail: 'node 方块层表达节点之间的聚合通信视图。Fabric 表示 4 个 node 的基础可达性，DP/PP 表示 rank mesh 派生出的跨节点逻辑通信组。',
    meta: `rank ${rangeStart}-${rangeStart + 7} · card layer below handles intra-node TP`,
    color: NODE_LAYER_COLOR,
  };
}

function StraightLink({
  link,
  style,
  isActive,
  onHover,
  onBlur,
}: {
  link: FabricLink;
  style: LinkStyle;
  isActive: boolean;
  onHover: () => void;
  onBlur: () => void;
}) {
  const [a, b] = linkEndpoints(link);
  const color = LINK_COLOR[link.kind];

  const scale = isActive ? 1.7 : 1;
  const opacity = isActive ? 1 : BASE_OPACITY;
  const emissive = isActive ? 0.5 : 0;

  const { pos, quat, len } = bandTransform(a, b);
  const hover = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    onHover();
  };
  const blur = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    onBlur();
  };

  return (
    <group>
      <mesh position={pos} quaternion={quat} onPointerOver={hover} onPointerOut={blur}>
        <boxGeometry args={[len, 0.07, 0.07]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {link.kind === 'tp' || style === 'flat' ? (
        <Line points={[a, b]} color={color} lineWidth={LINE_WIDTH[link.kind] * scale} transparent opacity={opacity} />
      ) : (
        <mesh position={pos} quaternion={quat}>
          <planeGeometry args={[len, BAND_WIDTH[link.kind] * scale]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissive}
            roughness={0.45}
            metalness={0.05}
            side={THREE.DoubleSide}
            transparent
            opacity={opacity}
          />
        </mesh>
      )}
    </group>
  );
}

function NodeLayerLink({
  link,
  style,
  isActive,
  onHover,
  onBlur,
}: {
  link: FabricNodeLink;
  style: LinkStyle;
  isActive: boolean;
  onHover: () => void;
  onBlur: () => void;
}) {
  const [a, b] = nodeLinkEndpoints(link);
  const color = LINK_COLOR[link.kind];

  const isFabric = link.kind === 'fabric';
  const scale = isActive ? (isFabric ? 1.3 : 1.55) : 1;
  const opacity = isActive ? (isFabric ? 0.58 : 0.92) : isFabric ? 0.18 : 0.34;
  const emissive = isActive ? (isFabric ? 0.2 : 0.45) : 0;
  const { pos, quat, len } = bandTransform(a, b);
  const hover = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    onHover();
  };
  const blur = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    onBlur();
  };

  return (
    <group>
      <mesh position={pos} quaternion={quat} onPointerOver={hover} onPointerOut={blur}>
        <boxGeometry args={[len, 0.1, 0.12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {style === 'flat' || isFabric ? (
        <Line points={[a, b]} color={color} lineWidth={LINE_WIDTH[link.kind] * scale} transparent opacity={opacity} />
      ) : (
        <mesh position={pos} quaternion={quat}>
          <planeGeometry args={[len, BAND_WIDTH[link.kind] * scale]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissive}
            roughness={0.4}
            metalness={0.05}
            side={THREE.DoubleSide}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

type NodeVisualState = 'normal' | 'active' | 'hover';

function NodeLayerBlock({
  node,
  theme,
  variant,
  state,
  onHover,
  onBlur,
}: {
  node: FabricNode;
  theme: SceneTheme;
  variant: SceneVariant;
  state: NodeVisualState;
  onHover: () => void;
  onBlur: () => void;
}) {
  const pal = scenePalette(theme, variant);
  const labelColor = state === 'normal' ? pal.label : NODE_LAYER_COLOR;
  const texture = useMemo(() => makeLabelTexture(`${node.id.toUpperCase()}  ${node.label}`, labelColor), [labelColor, node.id, node.label]);
  const fill =
    variant === 'reference'
      ? state === 'hover'
        ? theme === 'dark'
          ? '#bfd7ff'
          : '#d9eaff'
        : state === 'active'
          ? theme === 'dark'
            ? '#d5e5fb'
            : '#e7f1ff'
          : theme === 'dark'
            ? '#e9eef5'
            : '#ffffff'
      : state === 'hover'
      ? theme === 'dark'
        ? '#315d9f'
        : '#bfdbfe'
      : state === 'active'
        ? theme === 'dark'
          ? '#253b66'
          : '#dbeafe'
        : theme === 'dark'
          ? '#1d2534'
          : '#dbe9fb';
  return (
    <group position={[node.position[0], 0, node.position[2]]}>
      <Line
        points={[
          [0, 0.13, 0],
          [0, NODE_BLOCK_Y - 0.06, 0],
        ]}
        color={state === 'normal' ? pal.trayEdge : NODE_LAYER_COLOR}
        lineWidth={1.1}
        transparent
        opacity={state === 'normal' ? 0.28 : 0.6}
        dashed
        dashSize={0.06}
        gapSize={0.05}
      />
      <mesh
        position={[0, NODE_BLOCK_Y, 0]}
        castShadow={variant !== 'reference'}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          onHover();
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
          onBlur();
        }}
      >
        <boxGeometry args={NODE_BLOCK} />
        <meshStandardMaterial color={fill} metalness={variant === 'reference' ? 0.01 : 0.08} roughness={variant === 'reference' ? 0.64 : 0.78} transparent={false} opacity={1} depthWrite />
        <Edges
          threshold={18}
          color={state === 'normal' ? pal.trayEdge : NODE_LAYER_COLOR}
          lineWidth={variant === 'reference' ? (state === 'normal' ? 1.8 : 2.4) : state === 'normal' ? 1.4 : 2}
          transparent
          opacity={variant === 'reference' ? 0.72 : 0.88}
        />
      </mesh>
      <mesh position={[0, NODE_BLOCK_Y + 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.63, 0.14]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function NodeLayer({
  theme,
  variant,
  focusNodeId,
  hoveredNodeId,
  hoverNodeIds,
  onHoverNode,
  onTip,
}: {
  theme: SceneTheme;
  variant: SceneVariant;
  focusNodeId: string | null;
  hoveredNodeId: string | null;
  hoverNodeIds: Set<string>;
  onHoverNode: (id: string | null) => void;
  onTip: (tip: LinkHoverTip | null) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        const state: NodeVisualState =
          hoveredNodeId === node.id ? 'hover' : focusNodeId === node.id || hoverNodeIds.has(node.id) ? 'active' : 'normal';
        return (
          <NodeLayerBlock
            key={node.id}
            node={node}
            theme={theme}
            variant={variant}
            state={state}
            onHover={() => {
              onHoverNode(node.id);
              onTip(describeNode(node));
            }}
            onBlur={() => {
              onHoverNode(null);
              onTip(null);
            }}
          />
        );
      })}
    </>
  );
}

function AxisLabel({
  text,
  color,
  position,
  size,
  rotationZ = 0,
  tip,
  onTip,
}: {
  text: string;
  color: string;
  position: [number, number, number];
  size: [number, number];
  rotationZ?: number;
  tip?: LinkHoverTip;
  onTip?: (tip: LinkHoverTip | null) => void;
}) {
  const texture = useMemo(() => makeLabelTexture(text, color), [color, text]);
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, rotationZ]}
      onPointerOver={(e) => {
        if (!tip || !onTip) return;
        e.stopPropagation();
        document.body.style.cursor = 'help';
        onTip(tip);
      }}
      onPointerOut={(e) => {
        if (!tip || !onTip) return;
        e.stopPropagation();
        document.body.style.cursor = 'default';
        onTip(null);
      }}
    >
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function AxisLabels({ onTip }: { onTip: (tip: LinkHoverTip | null) => void }) {
  const pTip: LinkHoverTip = {
    title: 'P axis · PP stage',
    detail: 'P 轴横向表示 Pipeline Parallel stage。PP 连线保持 D 不变、跨 P 通信，所以同一行里的 node 会通过 PP send/recv 连接。',
    meta: 'PP rule: same D, cross P',
    color: LINK_COLOR.pp,
  };
  const dTip: LinkHoverTip = {
    title: 'D axis · DP replica',
    detail: 'D 轴纵向表示 Data Parallel replica。DP 连线保持 P 不变、跨 D 通信，所以同一列里的 node 会通过 DP all-reduce 连接。',
    meta: 'DP rule: same P, cross D',
    color: LINK_COLOR.dp,
  };
  return (
    <group>
      <AxisLabel
        text="P axis · PP stage"
        color={LINK_COLOR.pp}
        position={[0, NODE_TOP_Y + 0.08, -2.19]}
        size={[1.0, 0.16]}
        tip={pTip}
        onTip={onTip}
      />
      <AxisLabel
        text="D axis · DP replica"
        color={LINK_COLOR.dp}
        position={[-1.9, NODE_TOP_Y + 0.08, 0]}
        size={[1.03, 0.16]}
        rotationZ={Math.PI / 2}
        tip={dTip}
        onTip={onTip}
      />
      <Line points={[[-1.05, NODE_MID_Y, -2.08], [1.05, NODE_MID_Y, -2.08]]} color={LINK_COLOR.pp} lineWidth={1.1} transparent opacity={0.65} />
      <Line points={[[-1.8, NODE_MID_Y, -1.2], [-1.8, NODE_MID_Y, 1.2]]} color={LINK_COLOR.dp} lineWidth={1.1} transparent opacity={0.65} />
      <mesh position={[1.18, NODE_MID_Y, -2.08]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.12, 3]} />
        <meshBasicMaterial color={LINK_COLOR.pp} transparent opacity={0.75} />
      </mesh>
      <mesh position={[-1.8, NODE_MID_Y, 1.34]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.04, 0.12, 3]} />
        <meshBasicMaterial color={LINK_COLOR.dp} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

// EP / MoE expert buckets: a cube floating above each server's grid
function EPGroups() {
  const y = 1.68;
  return (
    <>
      {nodes
        .filter((n) => epNodeIds.includes(n.id))
        .map((node) => (
          <group key={node.id}>
            <mesh position={[node.position[0], y, node.position[2]]}>
              <boxGeometry args={[0.42, 0.34, 0.42]} />
              <meshStandardMaterial color={EP_COLOR} emissive={EP_COLOR} emissiveIntensity={0.32} roughness={0.5} transparent opacity={0.32} />
              <Edges threshold={18} color={EP_COLOR} lineWidth={2.2} transparent opacity={0.95} />
            </mesh>
            <Line
              points={[
                [node.position[0], 0.1, node.position[2]],
                [node.position[0], y - 0.17, node.position[2]],
              ]}
              color={EP_COLOR}
              lineWidth={1.6}
              transparent
              opacity={0.6}
              dashed
              dashSize={0.06}
              gapSize={0.05}
            />
          </group>
        ))}
    </>
  );
}

function makeLabelTexture(text: string, color: string, fontSize = 60, fontWeight = 600): THREE.CanvasTexture {
  const W = 640;
  const H = 144;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} ${fontSize}px "PingFang SC", "Noto Sans SC", "Microsoft YaHei", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2 + 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function NodeTrays({ theme, variant }: { theme: SceneTheme; variant: SceneVariant }) {
  const pal = scenePalette(theme, variant);
  const hx = 0.62;
  const hz = 0.92;
  const y = 0.004;
  return (
    <>
      {nodes.map((node) => {
        const [cx, , cz] = node.position;
        const rect: [number, number, number][] = [
          [cx - hx, y, cz - hz],
          [cx + hx, y, cz - hz],
          [cx + hx, y, cz + hz],
          [cx - hx, y, cz + hz],
          [cx - hx, y, cz - hz],
        ];
        return <Line key={node.id} points={rect} color={pal.trayEdge} lineWidth={variant === 'reference' ? 1.9 : 1.6} transparent opacity={variant === 'reference' ? 0.82 : 0.7} />;
      })}
    </>
  );
}

function ReferenceZoneLabel({ text, position, color }: { text: string; position: [number, number, number]; color: string }) {
  const texture = useMemo(() => makeLabelTexture(text, color, 34, 700), [color, text]);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.16, 0.15]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ReferenceFoundation({ theme }: { theme: SceneTheme }) {
  const pal = scenePalette(theme, 'reference');
  const panelFill = theme === 'dark' ? '#172234' : '#edf3fa';
  const accentFill = theme === 'dark' ? '#0d5c8b' : '#d8effb';
  return (
    <group>
      <mesh position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.1, 5.8]} />
        <meshStandardMaterial color={panelFill} roughness={0.86} transparent opacity={theme === 'dark' ? 0.38 : 0.72} />
      </mesh>
      <mesh position={[0, -0.028, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 1.55]} />
        <meshBasicMaterial color={accentFill} transparent opacity={theme === 'dark' ? 0.16 : 0.32} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.027, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 1.55]} />
        <meshBasicMaterial color={accentFill} transparent opacity={theme === 'dark' ? 0.12 : 0.24} depthWrite={false} />
      </mesh>
      <ReferenceZoneLabel text="D0 row · PP stages" position={[0, 0.012, -2.14]} color={pal.label} />
      <ReferenceZoneLabel text="D1 row · PP stages" position={[0, 0.012, 0.28]} color={pal.label} />
      <ReferenceZoneLabel text="node layer aggregates traffic" position={[0, 1.08, -2.36]} color={NODE_LAYER_COLOR} />
    </group>
  );
}

function CameraRig({ settings }: { settings: RenderSettings }) {
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;
  useEffect(() => {
    const d = 7.5 * settings.distance;
    const targetY = 0.2 + settings.panY;
    camera.position.set(d, settings.height + settings.panY, d);
    camera.zoom = settings.zoom;
    camera.lookAt(0, targetY, 0);
    camera.updateProjectionMatrix();
  }, [camera, settings.distance, settings.height, settings.panY, settings.zoom]);
  return null;
}

function CameraControls({ settings, variant }: { settings: RenderSettings; variant: SceneVariant }) {
  return (
    <OrbitControls
      makeDefault
      target={[0, 0.2 + settings.panY, 0]}
      enablePan={false}
      enableZoom={false}
      enableRotate
      enableDamping={variant !== 'reference'}
      dampingFactor={variant === 'reference' ? 0 : 0.08}
      rotateSpeed={0.65}
    />
  );
}

export interface FabricInteraction {
  selectedCardId: string | null;
  hoveredCardId: string | null;
  overlays: Record<OverlayKind, boolean>;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  onLinkTip: (tip: LinkHoverTip | null) => void;
}

function cardState(
  card: FabricCard,
  selectedCardId: string | null,
  hoveredCardId: string | null,
  linkHoverCards: Set<string>,
): CardVisualState {
  if (selectedCardId === card.id) return 'selected';
  if (hoveredCardId === card.id) return 'hover';
  if (linkHoverCards.has(card.id)) return 'hover';
  if (selectedCardId) {
    const sel = cardById.get(selectedCardId);
    if (sel && sel.nodeId === card.nodeId) return 'peer';
  }
  return 'normal';
}

const EMPTY_SET = new Set<string>();

export function UbFabricCanvas({
  theme,
  settings,
  linkStyle,
  interaction,
  variant = 'default',
}: {
  theme: SceneTheme;
  settings: RenderSettings;
  linkStyle: LinkStyle;
  interaction: FabricInteraction;
  variant?: SceneVariant;
}) {
  const pal = scenePalette(theme, variant);
  const { selectedCardId, hoveredCardId, overlays } = interaction;
  const [hoverLinkId, setHoverLinkId] = useState<string | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [hoverNodeLinkId, setHoverNodeLinkId] = useState<string | null>(null);

  const hoverLink = hoverLinkId ? linkById.get(hoverLinkId) ?? null : null;
  const hoverNodeLink = hoverNodeLinkId ? nodeLinkById.get(hoverNodeLinkId) ?? null : null;
  const hoverNodeLinkNodes = hoverNodeLink ? new Set([hoverNodeLink.source, hoverNodeLink.target]) : EMPTY_SET;
  const linkHoverCards = useMemo(() => {
    if (!hoverLink && !hoverNodeLink) return EMPTY_SET;
    const out = new Set<string>();
    if (hoverLink) {
      out.add(hoverLink.source);
      out.add(hoverLink.target);
    }
    if (hoverNodeLink) {
      cards.forEach((card) => {
        if (card.nodeId === hoverNodeLink.source || card.nodeId === hoverNodeLink.target) out.add(card.id);
      });
    }
    return out;
  }, [hoverLink, hoverNodeLink]);
  const focusCardId = selectedCardId ?? hoveredCardId;
  const focusNodeId = focusCardId ? cardById.get(focusCardId)?.nodeId ?? null : null;
  const activeNodeId = focusNodeId ?? hoverNodeId;

  return (
    <Canvas
      shadows={variant !== 'reference'}
      dpr={variant === 'reference' ? 1 : [1, 2]}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping, powerPreference: 'high-performance' }}
      onPointerMissed={() => interaction.onSelect(null)}
    >
      <OrthographicCamera makeDefault position={[7.5, 6.5, 7.5]} zoom={110} near={0.1} far={120} />
      <CameraRig settings={settings} />
      <CameraControls settings={settings} variant={variant} />
      <color attach="background" args={[pal.background]} />

      <hemisphereLight args={['#ffffff', theme === 'dark' ? '#10131a' : '#c4cad4', settings.fillLight]} />
      <directionalLight position={[5, 9, 4]} intensity={settings.keyLight} castShadow={variant !== 'reference'} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 5, -3]} intensity={settings.keyLight * 0.4} />

      {variant === 'reference' ? <ReferenceFoundation theme={theme} /> : null}

      <Grid
        position={[0, -0.02, 0]}
        args={[26, 26]}
        cellSize={0.6}
        cellColor={pal.grid}
        sectionSize={3}
        sectionColor={pal.gridSection}
        fadeDistance={26}
        fadeStrength={1.5}
        infiniteGrid
      />

      <NodeTrays theme={theme} variant={variant} />

      {links.map((link) => {
        if (!overlays[OVERLAY_FOR_KIND[link.kind]]) return null;
        const isActive =
          hoverLinkId === link.id || (focusCardId != null && (link.source === focusCardId || link.target === focusCardId));
        return (
          <StraightLink
            key={link.id}
            link={link}
            style={linkStyle}
            isActive={isActive}
            onHover={() => {
              setHoverLinkId(link.id);
              interaction.onLinkTip(describeCardLink(link));
            }}
            onBlur={() => {
              setHoverLinkId((cur) => (cur === link.id ? null : cur));
              interaction.onLinkTip(null);
            }}
          />
        );
      })}

      {cards.map((card) => (
          <FabricCardMesh
            key={card.id}
            card={card}
            theme={theme}
            variant={variant}
            state={cardState(card, selectedCardId, hoveredCardId, linkHoverCards)}
          onHover={() => interaction.onHover(card.id)}
          onBlur={() => interaction.onHover(null)}
          onSelect={() => interaction.onSelect(selectedCardId === card.id ? null : card.id)}
        />
      ))}

      <NodeLayer
        theme={theme}
        variant={variant}
        focusNodeId={focusNodeId}
        hoveredNodeId={hoverNodeId}
        hoverNodeIds={hoverNodeLinkNodes}
        onHoverNode={setHoverNodeId}
        onTip={interaction.onLinkTip}
      />
      <AxisLabels onTip={interaction.onLinkTip} />

      {nodeLinks.map((link) => {
        if (!overlays[OVERLAY_FOR_KIND[link.kind]]) return null;
        const touchesActiveNode = activeNodeId != null && (link.source === activeNodeId || link.target === activeNodeId);
        const isActive = hoverNodeLinkId === link.id || touchesActiveNode;
        return (
          <NodeLayerLink
            key={link.id}
            link={link}
            style={linkStyle}
            isActive={isActive}
            onHover={() => {
              setHoverNodeLinkId(link.id);
              interaction.onLinkTip(describeNodeLink(link));
            }}
            onBlur={() => {
              setHoverNodeLinkId((cur) => (cur === link.id ? null : cur));
              interaction.onLinkTip(null);
            }}
          />
        );
      })}

      {overlays.ep ? <EPGroups /> : null}
    </Canvas>
  );
}
