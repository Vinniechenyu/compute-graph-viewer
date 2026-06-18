import { Suspense, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Edges, Line, Text as DreiText } from '@react-three/drei';
import { dc } from '../codec';
import { TOK } from '../content';
import { Card910B, type CardState, type ClayTheme } from './Card910B';
import { buildTrainingSample, type OverlayMode, type SampleCard, type SampleNode } from './trainingSampleData';

const CARD_CODE = dc('OTEwQg==');
const HCCS = dc('SENDUw==');
const ROCE = dc('Um9DRQ==');

const PALETTE = {
  physical: '#7dd3fc',
  tensor: '#f59e0b',
  pipeline: '#4ade80',
  replica: '#c084fc',
} as const;

const SURFACE_THEME: Record<ClayTheme, {
  floor: string;
  floorGrid: string;
  cardHover: string;
  nodeFrame: string;
  nodeGhost: string;
  dim: string;
  accent: string;
  pointLight: string;
}> = {
  light: {
    floor: '#eef1f5',
    floorGrid: '#d9dee7',
    cardHover: '#425066',
    nodeFrame: '#8e98aa',
    nodeGhost: '#aab3c3',
    dim: '#657086',
    accent: '#1f2937',
    pointLight: '#ffffff',
  },
  dark: {
    floor: '#0f1013',
    floorGrid: '#1d2129',
    cardHover: '#d7dbe4',
    nodeFrame: '#5f6472',
    nodeGhost: '#9aa4b7',
    dim: '#8d95a7',
    accent: '#e5e7eb',
    pointLight: '#d7def9',
  },
};

const RING_ORDER = [0, 1, 3, 5, 7, 6, 4, 2];
const SAMPLE = buildTrainingSample();
const CARD_SCALE = 0.66;

function Text(props: ComponentProps<typeof DreiText>) {
  return <Suspense fallback={null}><DreiText {...props} /></Suspense>;
}

function FixedCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(8.4, 7.1, 8.4);
    camera.lookAt(0, 1.85, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function Floor({ sceneTheme }: { sceneTheme: ClayTheme }) {
  const surface = SURFACE_THEME[sceneTheme];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color={surface.floor} roughness={0.96} metalness={0.05} />
      </mesh>
      <gridHelper args={[18, 24, surface.floorGrid, surface.floorGrid]} position={[0, 0.002, 0]} />
    </group>
  );
}

function GhostFrame({
  size,
  position,
  color,
  opacity = 0.08,
  edgeOpacity = Math.min(0.26, opacity * 4),
}: {
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  opacity?: number;
  edgeOpacity?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.88} metalness={0.06} />
      <Edges color={color} threshold={18} transparent opacity={edgeOpacity} />
    </mesh>
  );
}

function Slab({
  size,
  position,
  color,
  edgeColor,
  emissive,
  emissiveIntensity = 0,
  opacity,
}: {
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  edgeColor?: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.62}
        metalness={0.22}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissiveIntensity}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
      {edgeColor ? <Edges color={edgeColor} threshold={18} /> : null}
    </mesh>
  );
}

function FlowLine({
  points,
  color,
  width,
  speed,
  opacity = 0.9,
}: {
  points: [number, number, number][];
  color: string;
  width: number;
  speed: number;
  opacity?: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useFrame((_, dt) => {
    if (ref.current?.material) {
      ref.current.material.dashOffset -= dt * speed;
    }
  });

  return (
    <Line
      ref={ref}
      points={points}
      color={color}
      lineWidth={width}
      transparent
      opacity={opacity}
      dashed
      dashSize={0.36}
      gapSize={0.22}
    />
  );
}

function CardShell({
  card,
  state,
  peer,
  sceneTheme,
  onSelect,
  onHoverInfo,
  onHoverState,
}: {
  card: SampleCard;
  state: CardState;
  peer: boolean;
  sceneTheme: ClayTheme;
  onSelect: (cardId: string) => void;
  onHoverInfo: (text: string | null) => void;
  onHoverState: (hovered: boolean) => void;
}) {
  const hoverText = `节点 ${card.nodeIndex} · 卡槽 ${card.slot} · ${TOK.ascend} ${CARD_CODE} · ${HCCS} 节点内互联 / ${ROCE} 节点间互联`;

  return (
    <group
      position={card.position}
      scale={CARD_SCALE}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(card.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHoverState(true);
        onHoverInfo(hoverText);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'default';
        onHoverState(false);
        onHoverInfo(null);
      }}
    >
      {peer ? (
        <GhostFrame
          size={[2.1, 0.2, 1.26]}
          position={[0, 0.07, 0]}
          color={PALETTE.replica}
          opacity={0.018}
          edgeOpacity={0.42}
        />
      ) : null}
      <Card910B
        style="clay"
        state={state}
        theme={sceneTheme}
        onSelect={() => onSelect(card.id)}
        onHover={() => {
          onHoverState(true);
          onHoverInfo(hoverText);
        }}
        onBlur={() => {
          onHoverState(false);
          onHoverInfo(null);
        }}
      />
    </group>
  );
}

function NodeEnvelope({
  node,
  active,
  sceneTheme,
}: {
  node: SampleNode;
  active: boolean;
  sceneTheme: ClayTheme;
}) {
  const surface = SURFACE_THEME[sceneTheme];

  return (
    <group position={node.position}>
      <GhostFrame size={node.frameSize} position={[0, node.frameSize[1] / 2, 0]} color={active ? surface.cardHover : surface.nodeFrame} opacity={0.025} edgeOpacity={active ? 0.26 : 0.12} />
      <GhostFrame size={[node.frameSize[0] * 0.84, node.frameSize[1] * 0.84, node.frameSize[2] * 0.72]} position={[0, node.frameSize[1] / 2 + 0.34, 0]} color={surface.nodeGhost} opacity={0.012} edgeOpacity={0.07} />
      <Text position={[0, node.frameSize[1] + 0.55, 0]} fontSize={0.22} color={active ? surface.accent : surface.dim} anchorX="center">
        {node.label}
      </Text>
      <Text position={[0, node.frameSize[1] + 0.22, 0]} fontSize={0.13} color={surface.dim} anchorX="center">
        {`8 × ${TOK.ascend} ${CARD_CODE}`}
      </Text>
    </group>
  );
}

function makeLoop(points: [number, number, number][]): [number, number, number][] {
  return [...points, points[0]];
}

function makeReplicaPath(slot: number): [number, number, number][] {
  const peers = SAMPLE.nodes
    .map((node) => SAMPLE.cardsByNode[node.id][slot])
    .map((card) => [card.port[0], card.port[1] + 0.05, card.port[2]] as [number, number, number]);
  return makeLoop(peers);
}

export function TrainingSampleScene({
  overlay,
  sceneTheme,
  selectedCardId,
  onSelectCard,
  onHoverInfo,
}: {
  overlay: OverlayMode;
  sceneTheme: ClayTheme;
  selectedCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
  onHoverInfo: (text: string | null) => void;
}) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const surface = SURFACE_THEME[sceneTheme];

  const activeCardId = hoveredCardId ?? selectedCardId;
  const activeCard = activeCardId ? SAMPLE.cards.find((card) => card.id === activeCardId) ?? null : null;

  const activeNode = activeCard ? SAMPLE.nodes[activeCard.nodeIndex] : null;
  const activeNodeCards = activeCard ? SAMPLE.cardsByNode[activeCard.nodeId] : [];
  const replicaPeers = useMemo(() => {
    if (!activeCard) {
      return new Set<string>();
    }

    return new Set(
      SAMPLE.nodes
        .map((node) => SAMPLE.cardsByNode[node.id][activeCard.slot].id)
        .filter((cardId) => cardId !== activeCard.id),
    );
  }, [activeCard]);

  const activePeerSegments = useMemo(() => {
    if (!activeCard) {
      return [] as [number, number, number][][];
    }

    return activeNodeCards
      .filter((card) => card.id !== activeCard.id)
      .map((card) => [
        [activeCard.port[0], activeCard.port[1] + 0.02, activeCard.port[2]],
        [card.port[0], card.port[1] + 0.02, card.port[2]],
      ] as [number, number, number][]);
  }, [activeCard, activeNodeCards]);

  const activeReplicaPath = useMemo(() => (activeCard ? makeReplicaPath(activeCard.slot) : null), [activeCard]);

  return (
    <group
      onPointerMissed={() => {
        onSelectCard(null);
        onHoverInfo(null);
      }}
    >
      <FixedCamera />
      <Floor sceneTheme={sceneTheme} />

      <ambientLight intensity={sceneTheme === 'light' ? 1.28 : 1.1} />
      <directionalLight
        position={[8, 16, 6]}
        intensity={sceneTheme === 'light' ? 0.95 : 1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <pointLight position={[0, 12, 0]} intensity={sceneTheme === 'light' ? 0.45 : 0.8} color={surface.pointLight} />

      <GhostFrame size={[12.6, 5.4, 7.2]} position={[0, 2.7, 0]} color={surface.nodeGhost} opacity={0.008} edgeOpacity={0.045} />

      {SAMPLE.nodes.map((node) => {
        const nodeCards = SAMPLE.cardsByNode[node.id];
        const ringPoints = makeLoop(RING_ORDER.map((slot) => {
          const card = nodeCards[slot];
          return [card.port[0], card.port[1] + 0.06, card.port[2]] as [number, number, number];
        }));
        const tensorA = makeLoop(nodeCards.slice(0, 4).map((card) => [card.port[0], card.port[1] + 0.18, card.port[2]] as [number, number, number]));
        const tensorB = makeLoop(nodeCards.slice(4).map((card) => [card.port[0], card.port[1] + 0.18, card.port[2]] as [number, number, number]));
        const nodeIsActive = activeNode?.id === node.id;

        return (
          <group key={node.id}>
            <NodeEnvelope node={node} active={nodeIsActive} sceneTheme={sceneTheme} />

            {nodeCards.map((card) => {
              const cardState: CardState =
                selectedCardId === card.id ? 'selected' : hoveredCardId === card.id ? 'hover' : 'normal';

              return (
                <group key={card.id}>
                  <Line
                    points={[
                      [card.position[0], card.position[1] + 0.12, card.position[2]],
                      [card.core[0], card.core[1] + 0.12, card.core[2]],
                    ]}
                    color={PALETTE.physical}
                    lineWidth={1}
                    transparent
                    opacity={0.24}
                  />
                  <Line
                    points={[
                      [card.port[0], card.port[1], card.port[2]],
                      [node.hub[0], node.hub[1], node.hub[2]],
                    ]}
                    color={PALETTE.physical}
                    lineWidth={activeCard?.id === card.id ? 2.4 : 1.1}
                    transparent
                    opacity={activeCard?.id === card.id ? 0.9 : 0.18}
                  />
                  <CardShell
                    card={card}
                    state={cardState}
                    peer={replicaPeers.has(card.id)}
                    sceneTheme={sceneTheme}
                    onSelect={(cardId) => onSelectCard(cardId)}
                    onHoverInfo={onHoverInfo}
                    onHoverState={(hovered) => setHoveredCardId(hovered ? card.id : null)}
                  />
                </group>
              );
            })}

            <Slab
              size={[1.2, 0.12, 0.44]}
              position={node.hub}
              color={PALETTE.physical}
              opacity={0.74}
              edgeColor={nodeIsActive ? surface.cardHover : PALETTE.physical}
            />
            <Text position={[node.hub[0], node.hub[1] + 0.3, node.hub[2]]} fontSize={0.14} color={PALETTE.physical} anchorX="center">
              {`${HCCS} node fabric`}
            </Text>

            <Slab
              size={[1.8, 0.12, 0.5]}
              position={node.egress}
              color={PALETTE.pipeline}
              opacity={0.56}
              edgeColor={overlay === 'pipeline' ? surface.cardHover : PALETTE.pipeline}
            />
            <Line
              points={[
                [node.hub[0], node.hub[1] + 0.08, node.hub[2]],
                [node.egress[0], node.egress[1] - 0.08, node.egress[2]],
              ]}
              color={PALETTE.pipeline}
              lineWidth={1.6}
              transparent
              opacity={0.34}
            />
            <Text position={[node.egress[0], node.egress[1] + 0.28, node.egress[2]]} fontSize={0.14} color={PALETTE.pipeline} anchorX="center">
              {`${ROCE} scale-out`}
            </Text>

            {overlay === 'physical' || (overlay === 'pipeline' && nodeIsActive) ? (
              <Line
                points={ringPoints}
                color={PALETTE.physical}
                lineWidth={nodeIsActive ? 2.5 : 1.2}
                transparent
                opacity={nodeIsActive ? 0.72 : 0.2}
              />
            ) : null}

            {overlay === 'tensor' ? (
              <>
                <FlowLine points={tensorA} color={PALETTE.tensor} width={2.4} speed={1.1} opacity={0.82} />
                <FlowLine points={tensorB} color={PALETTE.tensor} width={2.4} speed={1.1} opacity={0.82} />
              </>
            ) : null}
          </group>
        );
      })}

      {overlay === 'pipeline' ? (
        <FlowLine
          points={SAMPLE.pipelineOrder.map((nodeId) => {
            const node = SAMPLE.nodes.find((entry) => entry.id === nodeId)!;
            return [node.egress[0], node.egress[1] + 0.26, node.egress[2]] as [number, number, number];
          })}
          color={PALETTE.pipeline}
          width={3}
          speed={1.4}
        />
      ) : null}

      {activePeerSegments.map((segment, index) => (
        <Line
          key={`peer-${index}`}
          points={segment}
          color={PALETTE.physical}
          lineWidth={1.7}
          transparent
          opacity={0.68}
        />
      ))}

      {activeReplicaPath ? (
        <Line
          points={activeReplicaPath}
          color={PALETTE.replica}
          lineWidth={1.8}
          transparent
          opacity={0.66}
          dashed
          dashScale={8}
          dashSize={0.26}
          gapSize={0.16}
        />
      ) : null}

      <Text position={[0, 0.1, 6.2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.18} color={surface.dim} anchorX="center">
        {`${TOK.ascend} ${CARD_CODE} · 32-card sample · 4 nodes × 8 cards · fixed 2.5D`}
      </Text>
    </group>
  );
}
