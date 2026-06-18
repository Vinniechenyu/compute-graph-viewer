export type OverlayMode = 'physical' | 'tensor' | 'pipeline';

export interface SampleNode {
  id: string;
  label: string;
  index: number;
  position: [number, number, number];
  frameSize: [number, number, number];
  hub: [number, number, number];
  egress: [number, number, number];
}

export interface SampleCard {
  id: string;
  nodeId: string;
  nodeIndex: number;
  slot: number;
  tensorGroup: 0 | 1;
  label: string;
  position: [number, number, number];
  port: [number, number, number];
  core: [number, number, number];
}

export interface SampleTopology {
  nodes: SampleNode[];
  cards: SampleCard[];
  cardsByNode: Record<string, SampleCard[]>;
  pipelineOrder: string[];
  sampleLabel: string;
}

const NODE_POSITIONS: [number, number, number][] = [
  [-3.15, 0, -1.95],
  [3.15, 0, -1.95],
  [-3.15, 0, 1.95],
  [3.15, 0, 1.95],
];

const FRAME_SIZE: [number, number, number] = [3.25, 3.7, 2.25];
const PIPELINE_ORDER = ['node-0', 'node-1', 'node-3', 'node-2'];

function add(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function buildTrainingSample(): SampleTopology {
  const nodes: SampleNode[] = NODE_POSITIONS.map((position, index) => ({
    id: `node-${index}`,
    label: `Node ${index}`,
    index,
    position,
    frameSize: FRAME_SIZE,
    hub: add(position, [0, 3.05, 0.14]),
    egress: add(position, [0, 3.7, 0.14]),
  }));

  const cards: SampleCard[] = [];
  const cardsByNode: Record<string, SampleCard[]> = {};

  for (const node of nodes) {
    const localCards: SampleCard[] = [];
    for (let slot = 0; slot < 8; slot += 1) {
      const row = Math.floor(slot / 2);
      const col = slot % 2;
      const localPos: [number, number, number] = [
        col === 0 ? -0.86 : 0.62,
        0.42 + row * 0.56,
        col === 0 ? -0.42 + row * 0.04 : 0.48 + row * 0.04,
      ];
      const position = add(node.position, localPos);
      const card: SampleCard = {
        id: `${node.id}-card-${slot}`,
        nodeId: node.id,
        nodeIndex: node.index,
        slot,
        tensorGroup: slot < 4 ? 0 : 1,
        label: `N${node.index} · C${slot}`,
        position,
        port: add(position, [0.62, 0.12, 0.39]),
        core: add(position, [0, 0.08, 0]),
      };
      localCards.push(card);
      cards.push(card);
    }
    cardsByNode[node.id] = localCards;
  }

  return {
    nodes,
    cards,
    cardsByNode,
    pipelineOrder: PIPELINE_ORDER,
    sampleLabel: '32-card sample',
  };
}
