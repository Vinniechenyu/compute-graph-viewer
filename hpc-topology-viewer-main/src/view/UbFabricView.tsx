import { useState } from 'react';
import {
  DEFAULT_SETTINGS,
  EP_COLOR,
  LINK_COLOR,
  NODE_LAYER_COLOR,
  UbFabricCanvas,
  type LinkHoverTip,
  type LinkStyle,
  type RenderSettings,
  type SceneTheme,
} from '../scene/UbFabricScene';
import {
  PANGU_SAMPLE,
  PARALLEL,
  cardById,
  cards,
  expertBucketForRank,
  nodes,
  rankFormula,
  sampleShardForDp,
  stageBlockRange,
  type FabricCard,
  type FabricNode,
  type OverlayKind,
} from '../scene/ubFabricData';

const OVERLAY_DEFS: { id: OverlayKind; label: string }[] = [
  { id: 'tp', label: 'TP' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'dp', label: 'DP' },
  { id: 'pp', label: 'PP' },
  { id: 'ep', label: 'EP' },
  { id: 'slice', label: 'Slice' },
];

const LEGEND: { color: string; label: string; cube?: boolean }[] = [
  { color: NODE_LAYER_COLOR, label: 'Node 方块层 · 聚合跨节点通信' },
  { color: LINK_COLOR.tp, label: 'Card 层 · TP 机内 8 卡全互联' },
  { color: LINK_COLOR.fabric, label: 'Node Fabric · 4 node 全连接可达性（6 edges）' },
  { color: LINK_COLOR.dp, label: 'Node DP · 同 P 跨 D all-reduce（2 edges / 8 lanes）' },
  { color: LINK_COLOR.pp, label: 'Node PP · 同 D 跨 P send/recv（2 edges / 8 lanes）' },
  { color: EP_COLOR, label: 'EP 专家并行 · 专家桶（立方体）', cube: true },
  { color: '#f97316', label: 'Slice 单卡计算切片 · placement 说明' },
];

interface SliderDef {
  key: keyof RenderSettings;
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderDef[] = [
  { key: 'zoom', label: '相机 Zoom', min: 48, max: 340, step: 1 },
  { key: 'distance', label: '相机远近', min: 0.6, max: 1.8, step: 0.02 },
  { key: 'panY', label: '画面上下', min: -4, max: 4, step: 0.1 },
  { key: 'height', label: '相机高度 (角度)', min: 3, max: 14, step: 0.1 },
  { key: 'keyLight', label: '主光亮度', min: 0, max: 2, step: 0.05 },
  { key: 'fillLight', label: '环境亮度', min: 0, max: 2, step: 0.05 },
];

export function UbFabricView() {
  const [theme, setTheme] = useState<SceneTheme>('light');
  const [overlays, setOverlays] = useState<Record<OverlayKind, boolean>>({
    tp: true,
    fabric: true,
    dp: true,
    pp: true,
    ep: false,
    slice: true,
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [linkTip, setLinkTip] = useState<LinkHoverTip | null>(null);
  const [meshOpen, setMeshOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [settings, setSettings] = useState<RenderSettings>(DEFAULT_SETTINGS);
  const [linkStyle, setLinkStyle] = useState<LinkStyle>('band');

  const focusCard = selectedCardId ?? hoveredCardId;
  const focus = focusCard ? cardById.get(focusCard) ?? null : null;

  return (
    <div className={`ubf-page ubf-theme-${theme}`}>
      <header className="ubf-toolbar">
        <div className="ubf-title">
          <strong>UB Fabric · 32 卡卡间互联</strong>
          <span>{`正交 3D · node 方块层 + card 层 · dp${PARALLEL.dp}·pp${PARALLEL.pp}·tp${PARALLEL.tp} rank mesh`}</span>
        </div>

        <div className="ubf-toolbar-right">
          <button
            type="button"
            className={`ubf-icon-btn${meshOpen ? ' is-active' : ''}`}
            aria-label="打开 rank mesh 推导"
            title="rank mesh 推导"
            onClick={() => setMeshOpen((open) => !open)}
          >
            i
          </button>
          <button
            type="button"
            className={`ubf-icon-btn${railOpen ? ' is-active' : ''}`}
            aria-label="打开 Inspector 设置"
            title="Inspector 设置"
            onClick={() => setRailOpen(true)}
          >
            ⚙
          </button>
          <div className="ubf-seg" role="group" aria-label="overlay toggles">
            {OVERLAY_DEFS.map((ov) => (
              <button
                key={ov.id}
                type="button"
                className={overlays[ov.id] ? 'is-active' : undefined}
                onClick={() => setOverlays((cur) => ({ ...cur, [ov.id]: !cur[ov.id] }))}
              >
                {ov.label}
              </button>
            ))}
          </div>
          <div className="ubf-seg" role="group" aria-label="scene theme">
            {(['light', 'dark'] as SceneTheme[]).map((t) => (
              <button key={t} type="button" className={theme === t ? 'is-active' : undefined} onClick={() => setTheme(t)}>
                {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="ubf-body">
        <main className="ubf-canvas">
          <UbFabricCanvas
            theme={theme}
            settings={settings}
            linkStyle={linkStyle}
            interaction={{
              selectedCardId,
              hoveredCardId,
              overlays,
              onHover: setHoveredCardId,
              onSelect: setSelectedCardId,
              onLinkTip: setLinkTip,
            }}
          />
          <div className="ubf-meta">
            <span className="ubf-chip">{nodes.length} nodes</span>
            <span className="ubf-chip">{cards.length} cards</span>
            <span className="ubf-chip">node fabric</span>
            <span className="ubf-chip">node DP/PP</span>
            <span className="ubf-chip">card TP</span>
            <span className="ubf-chip">orthographic 3D</span>
          </div>
          {meshOpen ? <RankMeshInset focus={focus} onClose={() => setMeshOpen(false)} /> : null}
          {overlays.slice ? <ComputeSliceCard focus={focus} /> : null}
          {linkTip ? <LinkHoverTipPanel tip={linkTip} /> : null}
        </main>

        {railOpen ? <aside className="ubf-rail">
          <div className="ubf-rail-head">
            <strong>Inspector</strong>
            <button type="button" className="ubf-close-btn" aria-label="关闭 Inspector" onClick={() => setRailOpen(false)}>
              ×
            </button>
          </div>
          <section className="ubf-card">
            <h2>Inspector</h2>
            {focus ? (
              <div className="ubf-inspect">
                <div className="ubf-inspect-row">
                  <span>Global rank</span>
                  <strong>{`rank_${focus.rank}`}</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>Device</span>
                  <strong>{`910B_${focus.rank}`}</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>并行坐标</span>
                  <strong>{`d${focus.d} · p${focus.p} · c${focus.c} · t${focus.t}`}</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>TP 组</span>
                  <strong>{`${focus.nodeLabel} · card layer · 8 卡`}</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>Node 层</span>
                  <strong>{`${focus.nodeId.toUpperCase()} · fabric + DP/PP 聚合边`}</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>DP 副本</span>
                  <strong>{`DP${focus.d}`}</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>PP stage</span>
                  <strong>{`PP${focus.p}`}</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>TP shard</span>
                  <strong>{`${focus.t + 1}/${PARALLEL.tp}`}</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>CP shard</span>
                  <strong>CP0 · 未切上下文</strong>
                </div>
                <div className="ubf-inspect-row">
                  <span>EP bucket</span>
                  <strong>{formatExpertBucket(focus)}</strong>
                </div>
                <div className="ubf-inspect-note">
                  Fabric 表达 4 个 node 的全连接可达性；DP/PP 表达 rank mesh 派生的训练并行逻辑组，所以各只有 2 条聚合边。card 层只承载节点内 TP 通信。坐标由 rank mesh 公式 rank=((d·pp+p)·cp+c)·tp+t 派生，不等同于真实物理线缆路径。
                </div>
              </div>
            ) : (
              <div className="ubf-inspect-empty">悬浮或点击任意卡查看详情</div>
            )}
          </section>

          <section className="ubf-card">
            <h2>Legend</h2>
            <div className="ubf-legend">
              {LEGEND.map((item) => (
                <div key={item.label} className="ubf-legend-row">
                  <span className={`ubf-swatch${item.cube ? ' is-cube' : ''}`} style={{ background: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ubf-card">
            <div className="ubf-card-head">
              <h2>渲染设置</h2>
              <button type="button" className="ubf-reset" onClick={() => setSettings(DEFAULT_SETTINGS)}>
                重置
              </button>
            </div>
            <div className="ubf-field">
              <span className="ubf-field-label">Node 层连线样式 (DP/PP)</span>
              <div className="ubf-seg ubf-seg-sm" role="group" aria-label="link style">
                {([
                  { id: 'flat', label: '扁线' },
                  { id: 'band', label: '扁带' },
                ] as { id: LinkStyle; label: string }[]).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={linkStyle === opt.id ? 'is-active' : undefined}
                    onClick={() => setLinkStyle(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ubf-sliders">
              {SLIDERS.map((s) => (
                <label key={s.key} className="ubf-slider">
                  <span className="ubf-slider-label">
                    {s.label}
                    <em>{settings[s.key].toFixed(s.step < 1 ? 2 : 0)}</em>
                  </span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={settings[s.key]}
                    onChange={(e) => setSettings((cur) => ({ ...cur, [s.key]: Number(e.target.value) }))}
                  />
                </label>
              ))}
            </div>
          </section>
        </aside> : null}
      </div>
    </div>
  );
}

function LinkHoverTipPanel({ tip }: { tip: LinkHoverTip }) {
  return (
    <section className="ubf-link-tip" aria-label="link hover explanation">
      <div className="ubf-link-tip-head">
        <span style={{ background: tip.color }} />
        <strong>{tip.title}</strong>
      </div>
      <p>{tip.detail}</p>
      <em>{tip.meta}</em>
    </section>
  );
}

function rankRangeForNode(node: FabricNode) {
  const start = (node.d * PARALLEL.pp + node.p) * PARALLEL.tp;
  return { start, end: start + PARALLEL.tp - 1 };
}

function formatExpertBucket(card: FabricCard) {
  const bucket = expertBucketForRank(card.rank);
  return `E${bucket.start}-E${bucket.end}`;
}

function stageText(card: FabricCard) {
  const range = stageBlockRange(card.p);
  const parts: string[] = [];
  if (card.p === 0) parts.push('Embedding');
  parts.push(`Decoder blocks ${range.start}-${range.end}`);
  if (card.p === PARALLEL.pp - 1) parts.push('Final Norm / LM Head');
  return parts.join(' + ');
}

function RankMeshInset({ focus, onClose }: { focus: FabricCard | null; onClose: () => void }) {
  return (
    <section className="ubf-mesh-inset" aria-label="rank mesh 推导">
      <div className="ubf-overlay-head">
        <div className="ubf-overlay-kicker">rank mesh 推导</div>
        <button type="button" className="ubf-close-btn" aria-label="关闭 rank mesh 推导" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="ubf-mesh-formula">
        <span>{`dp${PARALLEL.dp} × pp${PARALLEL.pp} × cp${PARALLEL.cp} × tp${PARALLEL.tp} = ${cards.length}`}</span>
        <code>rank=((d·pp+p)·cp+c)·tp+t</code>
      </div>
      <div className="ubf-mesh-grid" role="img" aria-label="2 by 2 DP and PP grid">
        {nodes.map((node) => {
          const range = rankRangeForNode(node);
          const active = focus?.nodeId === node.id;
          return (
            <div key={node.id} className={`ubf-mesh-cell${active ? ' is-active' : ''}`}>
              <strong>{node.id.toUpperCase()}</strong>
              <span>{`D${node.d} / P${node.p}`}</span>
              <em>{`rank ${range.start}-${range.end}`}</em>
            </div>
          );
        })}
      </div>
      <div className="ubf-mesh-focus">
        {focus ? (
          <>
            <strong>{`rank_${focus.rank}`}</strong>
            <span>{`${rankFormula(focus)} = ${focus.rank}`}</span>
            <em>{`d${focus.d} / p${focus.p} / c${focus.c} / t${focus.t}`}</em>
          </>
        ) : (
          <span>悬浮或点击一张卡，查看该 rank 的坐标推导。</span>
        )}
      </div>
    </section>
  );
}

function ComputeSliceCard({ focus }: { focus: FabricCard | null }) {
  if (!focus) {
    return (
      <section className="ubf-slice-card ubf-slice-empty" aria-label="单卡计算切片">
        <div className="ubf-overlay-kicker">单卡计算切片</div>
        <strong>选择一张卡查看 placement 投影</strong>
        <span>Slice layer 只解释卡内计算语义，不表示物理互联路径。</span>
      </section>
    );
  }

  const blockRange = stageBlockRange(focus.p);
  const sampleShard = sampleShardForDp(focus.d);
  const bucket = expertBucketForRank(focus.rank);
  const runtime = ['recv act', 'forward blocks', 'MoE all-to-all', 'backward', 'DP all-reduce'];

  return (
    <section className="ubf-slice-card" aria-label="单卡计算切片">
      <div className="ubf-overlay-kicker">单卡计算切片 · derived</div>
      <div className="ubf-slice-head">
        <strong>{`rank_${focus.rank} / 910B_${focus.rank}`}</strong>
        <span>{`d${focus.d} · p${focus.p} · c${focus.c} · t${focus.t}`}</span>
      </div>
      <div className="ubf-slice-rows">
        <div>
          <span>PP</span>
          <strong>{`PP${focus.p} · ${stageText(focus)}`}</strong>
        </div>
        <div>
          <span>TP</span>
          <strong>{`第 ${focus.t + 1}/${PARALLEL.tp} 片 · QKV / Out / FFN shard`}</strong>
        </div>
        <div>
          <span>CP</span>
          <strong>CP0 · 本样例不切上下文</strong>
        </div>
        <div>
          <span>DP</span>
          <strong>{`samples ${sampleShard.start}-${sampleShard.end}`}</strong>
        </div>
        <div>
          <span>EP</span>
          <strong>{`E${bucket.start}-E${bucket.end} · ${bucket.perRank} experts / rank`}</strong>
        </div>
      </div>
      <div className="ubf-slice-block">
        <span>{`Decoder block range ${blockRange.start}-${blockRange.end}`}</span>
        <em>{`openPangu sample: ${PANGU_SAMPLE.decoderBlocks} blocks / ${PANGU_SAMPLE.routedExperts} routed experts`}</em>
      </div>
      <div className="ubf-slice-flow">
        {runtime.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
