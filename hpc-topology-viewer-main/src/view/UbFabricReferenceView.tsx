import { useMemo, useState } from 'react';
import {
  DEFAULT_SETTINGS,
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

const SLIDERS: { key: keyof RenderSettings; label: string; min: number; max: number; step: number }[] = [
  { key: 'zoom', label: 'Zoom', min: 120, max: 340, step: 1 },
  { key: 'distance', label: 'Camera distance', min: 0.72, max: 1.7, step: 0.02 },
  { key: 'panY', label: 'Vertical pan', min: -3, max: 3, step: 0.1 },
  { key: 'height', label: 'Camera height', min: 4.2, max: 13, step: 0.1 },
  { key: 'keyLight', label: 'Key light', min: 0.3, max: 2.1, step: 0.05 },
  { key: 'fillLight', label: 'Ambient', min: 0.8, max: 2.4, step: 0.05 },
];

const REFERENCE_SETTINGS: RenderSettings = {
  ...DEFAULT_SETTINGS,
  zoom: 245,
  distance: 1,
  height: 6.2,
  panY: 0,
  keyLight: 1.05,
  fillLight: 1.85,
};

export function UbFabricReferenceView() {
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
  const [settings, setSettings] = useState<RenderSettings>(REFERENCE_SETTINGS);
  const [linkStyle, setLinkStyle] = useState<LinkStyle>('band');

  const focusCardId = selectedCardId ?? hoveredCardId;
  const focus = focusCardId ? cardById.get(focusCardId) ?? null : null;
  const activeNode = useMemo(() => (focus ? nodes.find((node) => node.id === focus.nodeId) ?? null : null), [focus]);

  return (
    <div className={`ubfr-page ubfr-theme-${theme}`}>
      <header className="ubfr-toolbar">
        <div className="ubfr-title">
          <strong>UB Fabric · Reference Render</strong>
          <span>{`white clay model · node layer + card layer · dp${PARALLEL.dp} pp${PARALLEL.pp} tp${PARALLEL.tp}`}</span>
        </div>

        <div className="ubfr-toolbar-actions">
          <button
            type="button"
            className={`btn btn-ghost btn-icon${meshOpen ? ' is-selected' : ''}`}
            aria-label="打开 mesh 推导"
            title="mesh 推导"
            onClick={() => setMeshOpen((open) => !open)}
          >
            <InfoIcon />
          </button>
          <button
            type="button"
            className={`btn btn-ghost btn-icon${railOpen ? ' is-selected' : ''}`}
            aria-label="打开 Inspector 设置"
            title="Inspector 设置"
            onClick={() => setRailOpen(true)}
          >
            <SettingsIcon />
          </button>
          <div className="segmented-control ubfr-layer-toggles" role="group" aria-label="overlay toggles">
            {OVERLAY_DEFS.map((ov) => (
              <button
                key={ov.id}
                type="button"
                className={`btn btn-ghost${overlays[ov.id] ? ' is-selected' : ''}`}
                onClick={() => setOverlays((cur) => ({ ...cur, [ov.id]: !cur[ov.id] }))}
              >
                {ov.label}
              </button>
            ))}
          </div>
          <div className="segmented-control ubfr-theme-toggle" role="group" aria-label="scene theme">
            {(['light', 'dark'] as SceneTheme[]).map((t) => (
              <button key={t} type="button" className={`btn btn-ghost${theme === t ? ' is-selected' : ''}`} onClick={() => setTheme(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="ubfr-stage">
        <UbFabricCanvas
          theme={theme}
          settings={settings}
          linkStyle={linkStyle}
          variant="reference"
          interaction={{
            selectedCardId,
            hoveredCardId,
            overlays,
            onHover: setHoveredCardId,
            onSelect: setSelectedCardId,
            onLinkTip: setLinkTip,
          }}
        />

        <div className="ubfr-chips" aria-label="scene summary">
          <span className="stat-chip">{nodes.length} node blocks</span>
          <span className="stat-chip">{cards.length} cards</span>
          <span className="stat-chip">midline links</span>
          <span className="stat-chip">callout labels</span>
        </div>

        <section className="ubfr-visual-note" aria-label="visual treatment">
          <strong>Reference treatment</strong>
          <span>white clay hardware, pale technical grid, blue-green semantic links, sparse callouts</span>
        </section>

        {meshOpen ? <RankMeshPanel focus={focus} activeNode={activeNode} onClose={() => setMeshOpen(false)} /> : null}
        {railOpen ? (
          <InspectorPanel
            focus={focus}
            settings={settings}
            linkStyle={linkStyle}
            onClose={() => setRailOpen(false)}
            onReset={() => setSettings(REFERENCE_SETTINGS)}
            onSettingsChange={setSettings}
            onLinkStyleChange={setLinkStyle}
          />
        ) : null}
        {overlays.slice ? <SlicePanel focus={focus} /> : null}
        {linkTip ? <LinkHoverTipPanel tip={linkTip} /> : null}
      </main>
    </div>
  );
}

function RankMeshPanel({ focus, activeNode, onClose }: { focus: FabricCard | null; activeNode: FabricNode | null; onClose: () => void }) {
  return (
    <section className="panel-shell ubfr-floating-panel ubfr-mesh-panel" aria-label="rank mesh 推导">
      <div className="panel-shell-header">
        <div>
          <div className="panel-shell-meta">rank mesh</div>
          <div className="panel-shell-title">DP / PP / TP 坐标推导</div>
        </div>
        <button type="button" className="btn btn-ghost btn-icon panel-shell-close" aria-label="关闭 mesh 推导" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="panel-shell-body ubfr-panel-body">
        <div className="ubfr-formula">
          <span>{`dp${PARALLEL.dp} x pp${PARALLEL.pp} x cp${PARALLEL.cp} x tp${PARALLEL.tp} = ${cards.length}`}</span>
          <code>rank=((d*pp+p)*cp+c)*tp+t</code>
        </div>
        <div className="ubfr-mesh-grid" role="img" aria-label="2 by 2 DP and PP grid">
          {nodes.map((node) => {
            const range = rankRangeForNode(node);
            const active = activeNode?.id === node.id;
            return (
              <div key={node.id} className={`ubfr-mesh-cell${active ? ' is-active' : ''}`}>
                <strong>{node.id.toUpperCase()}</strong>
                <span>{`D${node.d} / P${node.p}`}</span>
                <em>{`rank ${range.start}-${range.end}`}</em>
              </div>
            );
          })}
        </div>
        <div className="ubfr-focus-note">
          {focus ? (
            <>
              <strong>{`rank_${focus.rank}`}</strong>
              <span>{`${rankFormula(focus)} = ${focus.rank}`}</span>
              <em>{`node ${focus.nodeId.toUpperCase()} · d${focus.d} p${focus.p} c${focus.c} t${focus.t}`}</em>
            </>
          ) : (
            <span>悬浮或点击任意 card，查看它在 rank mesh 里的坐标。</span>
          )}
        </div>
      </div>
    </section>
  );
}

function InspectorPanel({
  focus,
  settings,
  linkStyle,
  onClose,
  onReset,
  onSettingsChange,
  onLinkStyleChange,
}: {
  focus: FabricCard | null;
  settings: RenderSettings;
  linkStyle: LinkStyle;
  onClose: () => void;
  onReset: () => void;
  onSettingsChange: (next: RenderSettings) => void;
  onLinkStyleChange: (next: LinkStyle) => void;
}) {
  return (
    <aside className="panel-shell ubfr-inspector" aria-label="Inspector">
      <div className="panel-shell-header">
        <div>
          <div className="panel-shell-meta">settings</div>
          <div className="panel-shell-title">Inspector</div>
        </div>
        <button type="button" className="btn btn-ghost btn-icon panel-shell-close" aria-label="关闭 Inspector" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="panel-shell-body ubfr-panel-body">
        <section className="ubfr-inspector-section">
          <h2>Selection</h2>
          {focus ? (
            <div className="ubfr-kv">
              <span>Global rank</span>
              <strong>{`rank_${focus.rank}`}</strong>
              <span>Device</span>
              <strong>{`910B_${focus.rank}`}</strong>
              <span>Coordinates</span>
              <strong>{`d${focus.d} p${focus.p} c${focus.c} t${focus.t}`}</strong>
              <span>Node layer</span>
              <strong>{`${focus.nodeId.toUpperCase()} · ${focus.nodeLabel}`}</strong>
              <span>EP bucket</span>
              <strong>{formatExpertBucket(focus)}</strong>
            </div>
          ) : (
            <p className="ubfr-muted">Hover or click a card to inspect a rank.</p>
          )}
        </section>

        <section className="ubfr-inspector-section">
          <h2>Line style</h2>
          <div className="segmented-control ubfr-full-toggle" role="group" aria-label="link style">
            {([
              { id: 'flat', label: 'Flat' },
              { id: 'band', label: 'Band' },
            ] as { id: LinkStyle; label: string }[]).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`btn btn-ghost${linkStyle === opt.id ? ' is-selected' : ''}`}
                onClick={() => onLinkStyleChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section className="ubfr-inspector-section">
          <div className="ubfr-section-head">
            <h2>Camera</h2>
            <button type="button" className="btn btn-ghost" onClick={onReset}>
              Reset
            </button>
          </div>
          <div className="ubfr-sliders">
            {SLIDERS.map((slider) => (
              <label key={slider.key} className="ubfr-slider">
                <span>
                  {slider.label}
                  <em>{settings[slider.key].toFixed(slider.step < 1 ? 2 : 0)}</em>
                </span>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={settings[slider.key]}
                  onChange={(event) => onSettingsChange({ ...settings, [slider.key]: Number(event.target.value) })}
                />
              </label>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function SlicePanel({ focus }: { focus: FabricCard | null }) {
  if (!focus) {
    return (
      <section className="panel-shell panel-shell-quiet ubfr-floating-panel ubfr-slice-panel" aria-label="single card slice">
        <div className="panel-shell-body ubfr-slice-empty">
          <strong>单卡计算切片</strong>
          <span>选择一张 card 查看 PP / TP / DP / EP placement 投影。</span>
        </div>
      </section>
    );
  }

  const blockRange = stageBlockRange(focus.p);
  const sampleShard = sampleShardForDp(focus.d);
  const bucket = expertBucketForRank(focus.rank);
  return (
    <section className="panel-shell panel-shell-quiet ubfr-floating-panel ubfr-slice-panel" aria-label="single card slice">
      <div className="panel-shell-body ubfr-slice-body">
        <div className="ubfr-slice-head">
          <strong>{`rank_${focus.rank}`}</strong>
          <span>{`d${focus.d} · p${focus.p} · c${focus.c} · t${focus.t}`}</span>
        </div>
        <div className="ubfr-slice-list">
          <span>PP</span>
          <strong>{`Decoder ${blockRange.start}-${blockRange.end}`}</strong>
          <span>TP</span>
          <strong>{`${focus.t + 1}/${PARALLEL.tp} shard`}</strong>
          <span>DP</span>
          <strong>{`samples ${sampleShard.start}-${sampleShard.end}`}</strong>
          <span>EP</span>
          <strong>{`E${bucket.start}-E${bucket.end}`}</strong>
        </div>
        <em>{`${PANGU_SAMPLE.decoderBlocks} blocks · ${PANGU_SAMPLE.routedExperts} routed experts`}</em>
      </div>
    </section>
  );
}

function LinkHoverTipPanel({ tip }: { tip: LinkHoverTip }) {
  return (
    <section className="panel-shell ubfr-link-tip" aria-label="link explanation">
      <div className="ubfr-link-tip-head">
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

function InfoIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.3l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.12.37.39.68.73.86.23.1.48.14.73.14H21a2 2 0 1 1 0 4h-.09c-.63 0-1.2.36-1.51 1Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
