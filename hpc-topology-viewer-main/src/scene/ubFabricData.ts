// 32-card UB fabric sample, FLAT 2x4 grid per node (8 cards on one level).
// Connectivity is derived from a real rank mesh: dp=2 · pp=2 · cp=1 · tp=8 → 32.
//   rank = ((d·pp + p)·cp + c)·tp + t
// Mapping (see knowledge.md): 8 cards in a server = one TP group (UB high-bw);
// DP group = same (p,t) across d; PP = same (d,t) across p.

export type LinkKind = 'tp' | 'dp' | 'pp';
export type NodeLinkKind = Exclude<LinkKind, 'tp'> | 'fabric';
export type OverlayKind = 'tp' | 'dp' | 'pp' | 'fabric' | 'ep' | 'slice';

export interface FabricNode {
  id: string;
  label: string;
  d: number;
  p: number;
  position: [number, number, number];
}

export interface FabricCard {
  id: string;
  nodeId: string;
  nodeLabel: string;
  d: number;
  p: number;
  c: number;
  t: number;
  rank: number;
  position: [number, number, number];
}

export interface FabricLink {
  id: string;
  source: string;
  target: string;
  kind: LinkKind;
}

export interface FabricNodeLink {
  id: string;
  source: string;
  target: string;
  kind: NodeLinkKind;
  laneCount: number;
  label: string;
}

export const PARALLEL = { dp: 2, pp: 2, cp: 1, tp: 8 } as const;
export const PANGU_SAMPLE = {
  decoderBlocks: 61,
  routedExperts: 256,
  stepBatchSamples: 32,
} as const;

const BASE_Y = 0.06;
const COL_PITCH = 0.56;
const ROW_PITCH = 0.42;

const NODE_DEFS: FabricNode[] = [
  { id: 'n0', label: 'D0 · P0', d: 0, p: 0, position: [-1.05, 0, -1.2] },
  { id: 'n1', label: 'D0 · P1', d: 0, p: 1, position: [1.05, 0, -1.2] },
  { id: 'n2', label: 'D1 · P0', d: 1, p: 0, position: [-1.05, 0, 1.2] },
  { id: 'n3', label: 'D1 · P1', d: 1, p: 1, position: [1.05, 0, 1.2] },
];

export const nodes: FabricNode[] = NODE_DEFS;

const cardId = (nodeId: string, t: number) => `${nodeId}-t${t}`;

export const cards: FabricCard[] = NODE_DEFS.flatMap((node) =>
  Array.from({ length: PARALLEL.tp }, (_, t) => {
    const col = t % 2;
    const row = Math.floor(t / 2);
    const lx = (col - 0.5) * COL_PITCH;
    const lz = (row - 1.5) * ROW_PITCH;
    const rank = (node.d * PARALLEL.pp + node.p) * PARALLEL.tp + t;
    return {
      id: cardId(node.id, t),
      nodeId: node.id,
      nodeLabel: node.label,
      d: node.d,
      p: node.p,
      c: 0,
      t,
      rank,
      position: [node.position[0] + lx, BASE_Y, node.position[2] + lz] as [number, number, number],
    };
  }),
);

export const cardById = new Map(cards.map((card) => [card.id, card]));

// TP group: full mesh among the 8 cards inside each server (all-to-all)
const tpLinks: FabricLink[] = NODE_DEFS.flatMap((node) => {
  const out: FabricLink[] = [];
  for (let i = 0; i < PARALLEL.tp; i += 1) {
    for (let j = i + 1; j < PARALLEL.tp; j += 1) {
      out.push({ id: `tp-${node.id}-${i}-${j}`, source: cardId(node.id, i), target: cardId(node.id, j), kind: 'tp' });
    }
  }
  return out;
});

// helper: pair the two nodes that share a coordinate
function nodePairsBy(key: (n: FabricNode) => number): [FabricNode, FabricNode][] {
  const groups = new Map<number, FabricNode[]>();
  NODE_DEFS.forEach((n) => {
    const k = key(n);
    groups.set(k, [...(groups.get(k) ?? []), n]);
  });
  return [...groups.values()].filter((g) => g.length === 2).map((g) => [g[0], g[1]] as [FabricNode, FabricNode]);
}

function allNodePairs(): [FabricNode, FabricNode][] {
  const out: [FabricNode, FabricNode][] = [];
  for (let i = 0; i < NODE_DEFS.length; i += 1) {
    for (let j = i + 1; j < NODE_DEFS.length; j += 1) out.push([NODE_DEFS[i], NODE_DEFS[j]]);
  }
  return out;
}

// Card-layer links only show intra-node communication. Inter-node DP/PP traffic
// is aggregated at the node layer below.
export const links: FabricLink[] = tpLinks;
export const linkById = new Map(links.map((link) => [link.id, link]));

// Node-layer DP group: same (p,t) across d. A single node-to-node edge represents
// the 8 per-rank lanes that previously appeared as card-to-card links.
const dpNodeLinks: FabricNodeLink[] = nodePairsBy((n) => n.p).map(([a, b]) => ({
  id: `dp-${a.id}${b.id}`,
  source: a.id,
  target: b.id,
  kind: 'dp',
  laneCount: PARALLEL.tp,
  label: `same P${a.p} · ${PARALLEL.tp} rank lanes`,
}));

// Node-layer PP group: same (d,t) across p, aggregated by node pair.
const ppNodeLinks: FabricNodeLink[] = nodePairsBy((n) => n.d).map(([a, b]) => ({
  id: `pp-${a.id}${b.id}`,
  source: a.id,
  target: b.id,
  kind: 'pp',
  laneCount: PARALLEL.tp,
  label: `same D${a.d} · ${PARALLEL.tp} rank lanes`,
}));

// Node fabric/reachability layer: a neutral all-node mesh. This is deliberately
// separate from DP/PP logical training groups.
const fabricNodeLinks: FabricNodeLink[] = allNodePairs().map(([a, b]) => ({
  id: `fabric-${a.id}${b.id}`,
  source: a.id,
  target: b.id,
  kind: 'fabric',
  laneCount: 1,
  label: 'node fabric reachability',
}));

export const nodeLinks: FabricNodeLink[] = [...fabricNodeLinks, ...dpNodeLinks, ...ppNodeLinks];
export const nodeLinkById = new Map(nodeLinks.map((link) => [link.id, link]));

export const OVERLAY_FOR_KIND: Record<LinkKind | NodeLinkKind, OverlayKind> = { tp: 'tp', dp: 'dp', pp: 'pp', fabric: 'fabric' };

// EP buckets: each server holds a slice of the MoE experts (256 experts / 32 ranks
// → 8 per card). Represented as a cube above each node's grid.
export const epNodeIds: string[] = NODE_DEFS.map((n) => n.id);

export function stageBlockRange(p: number) {
  const base = Math.floor(PANGU_SAMPLE.decoderBlocks / PARALLEL.pp);
  const remainder = PANGU_SAMPLE.decoderBlocks % PARALLEL.pp;
  const count = base + (p < remainder ? 1 : 0);
  let start = 0;
  for (let i = 0; i < p; i += 1) start += base + (i < remainder ? 1 : 0);
  return { start, end: start + count - 1, count };
}

export function expertBucketForRank(rank: number) {
  const perRank = Math.ceil(PANGU_SAMPLE.routedExperts / cards.length);
  const start = rank * perRank;
  return {
    start,
    end: Math.min(PANGU_SAMPLE.routedExperts - 1, start + perRank - 1),
    perRank,
  };
}

export function sampleShardForDp(d: number) {
  const perDp = Math.ceil(PANGU_SAMPLE.stepBatchSamples / PARALLEL.dp);
  const start = d * perDp;
  return {
    start,
    end: Math.min(PANGU_SAMPLE.stepBatchSamples - 1, start + perDp - 1),
    perDp,
  };
}

export function rankFormula(card: FabricCard) {
  return `((${card.d} * ${PARALLEL.pp} + ${card.p}) * ${PARALLEL.cp} + ${card.c}) * ${PARALLEL.tp} + ${card.t}`;
}
