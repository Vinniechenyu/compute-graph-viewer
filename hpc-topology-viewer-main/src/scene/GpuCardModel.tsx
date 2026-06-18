import { Edges, Line } from '@react-three/drei';

export type CardVisualVariant = 'baseline-block' | 'ghost-cage' | 'compute-focus' | 'twin-rail';
export type CardVisualState = 'normal' | 'hover' | 'selected';

export interface CardStyleOption {
  id: CardVisualVariant;
  title: string;
  summary: string;
  traits: string[];
  badge: 'current' | 'candidate';
}

const OUTLINE = '#dbe6ff';
const BODY = '#16181d';
const BODY_TOP = '#242833';
const BODY_EDGE = '#0c0f13';
const GHOST = 'rgba(201, 213, 231, 0.48)';
const CORE = '#d8f1ff';
const BUS = '#8ad7ff';
const SPINE = '#8cf0b7';

export const CARD_STYLE_OPTIONS: CardStyleOption[] = [
  {
    id: 'baseline-block',
    title: 'A. 基线块体',
    summary: '更接近当前实现，保留明显的实体厚度，适合先做保守收敛。',
    traits: [
      '优点：迁移到主页面最直接。',
      '优点：卡的实体感稳定，不容易显得飘。',
      '风险：远景缩小时仍然略重。',
    ],
    badge: 'current',
  },
  {
    id: 'ghost-cage',
    title: 'B. 线框骨架',
    summary: '把体块压低，优先保轮廓和结构线，最接近纯 outliner 的气质。',
    traits: [
      '优点：轮廓最清楚。',
      '优点：和互联关系线叠加时最不容易脏。',
      '风险：实体感最弱。',
    ],
    badge: 'candidate',
  },
  {
    id: 'compute-focus',
    title: 'C. 核心聚焦',
    summary: '把计算核心和两侧存储带明确分开，优先服务“卡内结构”表达。',
    traits: [
      '优点：最适合后续挂热点和利用率。',
      '优点：卡内结构识别度高。',
      '风险：互联感没有双轨方案强。',
    ],
    badge: 'candidate',
  },
  {
    id: 'twin-rail',
    title: 'D. 双轨互联',
    summary: '在卡体上方保留两条清晰总线，兼顾卡轮廓和“这是一张训练卡”的互联感。',
    traits: [
      '优点：卡体和互联语义最平衡。',
      '优点：后续接 HCCS / RoCE 关系会更顺。',
      '风险：总线高亮要严格克制。',
    ],
    badge: 'candidate',
  },
];

function Block({
  size,
  position = [0, 0, 0],
  color,
  edgeColor = OUTLINE,
  opacity = 1,
  emissive,
  emissiveIntensity = 0,
}: {
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  edgeColor?: string;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.7}
        metalness={0.14}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissiveIntensity}
      />
      <Edges color={edgeColor} threshold={18} />
    </mesh>
  );
}

function UBracket({ position }: { position: [number, number, number] }) {
  const [x, y, z] = position;

  return (
    <Line
      points={[
        [x - 0.08, y, z - 0.045],
        [x - 0.08, y + 0.06, z - 0.045],
        [x + 0.08, y + 0.06, z - 0.045],
        [x + 0.08, y, z - 0.045],
      ]}
      color={OUTLINE}
      lineWidth={1}
      transparent
      opacity={0.9}
    />
  );
}

function TopBrackets() {
  return (
    <>
      <UBracket position={[-0.42, 0.12, -0.19]} />
      <UBracket position={[0.12, 0.12, -0.19]} />
      <UBracket position={[-0.42, 0.12, 0.19]} />
      <UBracket position={[0.12, 0.12, 0.19]} />
    </>
  );
}

function BaselineInternals() {
  return (
    <>
      <Block size={[1.02, 0.14, 0.44]} position={[0, 0.1, 0]} color={BODY_TOP} edgeColor={GHOST} opacity={0.45} />
      <Block size={[0.46, 0.1, 0.18]} position={[0, 0.11, 0]} color={CORE} edgeColor={BUS} opacity={0.7} />
      {[-0.32, 0.32].flatMap((x) => [-0.18, 0.18].map((z) => (
        <Block key={`${x}-${z}`} size={[0.14, 0.08, 0.08]} position={[x, 0.12, z]} color={BODY_TOP} edgeColor={OUTLINE} opacity={0.78} />
      )))}
      <Block size={[0.28, 0.04, 0.1]} position={[0.48, 0.1, 0.22]} color={BUS} edgeColor={BUS} opacity={0.86} />
    </>
  );
}

function GhostCageInternals() {
  return (
    <>
      <Block size={[1.14, 0.18, 0.54]} position={[0, 0.14, 0]} color={BODY_TOP} edgeColor={GHOST} opacity={0.12} />
      <Block size={[0.8, 0.12, 0.32]} position={[0, 0.14, 0]} color={BODY_TOP} edgeColor={OUTLINE} opacity={0.08} />
      <Block size={[0.42, 0.08, 0.16]} position={[0, 0.12, 0]} color={CORE} edgeColor={BUS} opacity={0.82} />
      <Line
        points={[
          [-0.52, 0.18, -0.22],
          [0.52, 0.18, -0.22],
          [0.52, 0.18, 0.22],
          [-0.52, 0.18, 0.22],
          [-0.52, 0.18, -0.22],
        ]}
        color={OUTLINE}
        lineWidth={1.1}
        transparent
        opacity={0.7}
      />
      <Line
        points={[
          [-0.44, 0.08, 0.24],
          [-0.1, 0.18, 0.24],
          [0.1, 0.18, 0.24],
          [0.44, 0.08, 0.24],
        ]}
        color={BUS}
        lineWidth={1.3}
        transparent
        opacity={0.78}
      />
    </>
  );
}

function ComputeFocusInternals() {
  return (
    <>
      <Block size={[1.08, 0.04, 0.16]} position={[0, 0.21, 0]} color={SPINE} edgeColor={SPINE} opacity={0.84} />
      <Block size={[0.56, 0.11, 0.28]} position={[0, 0.11, 0]} color={CORE} edgeColor={BUS} opacity={0.86} />
      <Block size={[0.18, 0.08, 0.46]} position={[-0.34, 0.11, 0]} color={BODY_TOP} edgeColor={OUTLINE} opacity={0.52} />
      <Block size={[0.18, 0.08, 0.46]} position={[0.34, 0.11, 0]} color={BODY_TOP} edgeColor={OUTLINE} opacity={0.52} />
      <Block size={[0.22, 0.04, 0.09]} position={[0.52, 0.1, 0.22]} color={BUS} edgeColor={BUS} opacity={0.88} />
    </>
  );
}

function TwinRailInternals() {
  return (
    <>
      <Block size={[0.9, 0.05, 0.12]} position={[0, 0.22, -0.18]} color={SPINE} edgeColor={SPINE} opacity={0.86} />
      <Block size={[0.9, 0.05, 0.12]} position={[0, 0.22, 0.18]} color={BUS} edgeColor={BUS} opacity={0.86} />
      <Block size={[0.22, 0.04, 0.42]} position={[0, 0.16, 0]} color={BODY_TOP} edgeColor={OUTLINE} opacity={0.34} />
      <Block size={[0.44, 0.1, 0.18]} position={[0, 0.11, 0]} color={CORE} edgeColor={OUTLINE} opacity={0.8} />
      <Line
        points={[
          [-0.34, 0.22, -0.18],
          [-0.12, 0.12, 0],
          [0.12, 0.12, 0],
          [0.34, 0.22, 0.18],
        ]}
        color={OUTLINE}
        lineWidth={1.2}
        transparent
        opacity={0.75}
      />
    </>
  );
}

function VariantInternals({ variant }: { variant: CardVisualVariant }) {
  switch (variant) {
    case 'ghost-cage':
      return <GhostCageInternals />;
    case 'compute-focus':
      return <ComputeFocusInternals />;
    case 'twin-rail':
      return <TwinRailInternals />;
    case 'baseline-block':
    default:
      return <BaselineInternals />;
  }
}

export function GpuCardModel({
  variant,
  state = 'normal',
  position = [0, 0, 0],
  scale = 1,
  onSelect,
  onHover,
  onBlur,
}: {
  variant: CardVisualVariant;
  state?: CardVisualState;
  position?: [number, number, number];
  scale?: number;
  onSelect?: () => void;
  onHover?: () => void;
  onBlur?: () => void;
}) {
  const edgeColor = state === 'selected' ? BUS : state === 'hover' ? '#c7f0ff' : BODY_EDGE;
  const cageColor = state === 'selected' ? BUS : state === 'hover' ? '#dff6ff' : OUTLINE;
  const emissive = state === 'selected' ? BUS : state === 'hover' ? '#9fe7ff' : undefined;
  const emissiveIntensity = state === 'selected' ? 0.18 : state === 'hover' ? 0.08 : 0;

  return (
    <group
      position={position}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover?.();
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'default';
        onBlur?.();
      }}
    >
      <Block
        size={[1.48, 0.16, 0.72]}
        color={BODY}
        edgeColor={edgeColor}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
      <Block size={[1.48, 0.04, 0.72]} position={[0, 0.1, 0]} color={BODY_TOP} edgeColor={cageColor} opacity={0.92} />
      <Block size={[1.52, 0.26, 0.76]} position={[0, 0.12, 0]} color={BODY_TOP} edgeColor={cageColor} opacity={0.08} />
      <VariantInternals variant={variant} />
      <TopBrackets />
    </group>
  );
}
