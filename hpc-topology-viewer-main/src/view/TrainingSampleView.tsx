import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { dc } from '../codec';
import { TOK } from '../content';
import type { ClayTheme } from '../scene/Card910B';
import { TrainingSampleScene } from '../scene/TrainingSampleScene';
import { buildTrainingSample, type OverlayMode } from '../scene/trainingSampleData';

const CARD_CODE = dc('OTEwQg==');
const PANGU = dc('55uY5Y+k');
const HCCS = dc('SENDUw==');
const ROCE = dc('Um9DRQ==');

const SAMPLE = buildTrainingSample();

const OVERLAYS: { id: OverlayMode; label: string; description: string }[] = [
  { id: 'physical', label: '物理互联', description: `显示单卡端口、${HCCS} 节点内域与 ${ROCE} 节点间出口。` },
  { id: 'tensor', label: '张量并行', description: '把每个 8 卡节点切成两个 4 卡组，模拟盘古训练第一版的张量并行域。' },
  { id: 'pipeline', label: '流水线', description: '按 4 个节点顺序串成一条 stage 路径，作为后续盘古 PP 可视化骨架。' },
];

const LEGEND_ROWS = [
  { color: '#7dd3fc', label: `卡内 + ${HCCS} 互联` },
  { color: '#c084fc', label: '同槽位副本路径' },
  { color: '#f59e0b', label: '4 卡张量并行组' },
  { color: '#4ade80', label: `${ROCE} / pipeline` },
];

const SCENE_THEMES: { id: ClayTheme; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function TrainingSampleView() {
  const [overlay, setOverlay] = useState<OverlayMode>('physical');
  const [sceneTheme, setSceneTheme] = useState<ClayTheme>('light');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<string | null>(null);

  const selectedCard = useMemo(
    () => SAMPLE.cards.find((card) => card.id === selectedCardId) ?? null,
    [selectedCardId],
  );

  const overlayMeta = OVERLAYS.find((item) => item.id === overlay)!;
  const sceneBackground = sceneTheme === 'light' ? '#f1f3f6' : '#0d0f14';
  const sceneFog = sceneTheme === 'light' ? '#f1f3f6' : '#0d0f14';

  return (
    <div className="sample-page">
      <header className="sample-toolbar">
        <div className="sample-toolbar-group sample-title">
          <strong>{`${TOK.ascend} ${CARD_CODE} training sample`}</strong>
          <span>{`${PANGU} 训练可视化预览页 · 固定 2.5D · 32 卡 sample`}</span>
        </div>

        <div className="sample-toolbar-sep" />

        <div className="sample-toolbar-group">
          <span className="sample-chip">{SAMPLE.sampleLabel}</span>
          <span className="sample-chip">4 nodes</span>
          <span className="sample-chip">8 cards / node</span>
        </div>

        <div className="sample-toolbar-sep" />

        <div className="sample-toolbar-group sample-segmented" aria-label="overlay switch">
          {OVERLAYS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === overlay ? 'is-active' : undefined}
              onClick={() => setOverlay(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="sample-toolbar-group sample-segmented" aria-label="render theme switch">
          {SCENE_THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === sceneTheme ? 'is-active' : undefined}
              onClick={() => setSceneTheme(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="sample-main">
        <section className="sample-canvas-panel" data-scene-theme={sceneTheme}>
          <Canvas
            orthographic
            shadows
            dpr={[1, 2]}
            camera={{ position: [8.4, 7.1, 8.4], zoom: 72, near: 0.1, far: 100 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: sceneTheme === 'light' ? 1 : 0.95,
              powerPreference: 'high-performance',
            }}
            onCreated={({ gl }) => {
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              gl.domElement.addEventListener('webglcontextlost', (event) => event.preventDefault(), false);
            }}
          >
            <color attach="background" args={[sceneBackground]} />
            <fog attach="fog" args={[sceneFog, 18, 34]} />
            <TrainingSampleScene
              overlay={overlay}
              sceneTheme={sceneTheme}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
              onHoverInfo={setHoverInfo}
            />
          </Canvas>

          {hoverInfo ? (
            <div className="sample-overlay-card sample-hoverbar">{hoverInfo}</div>
          ) : null}

          <div className="sample-overlay-card sample-legend">
            <div className="sample-legend-title">Legend</div>
            <div className="sample-legend-list">
              {LEGEND_ROWS.map((row) => (
                <div key={row.label} className="sample-legend-row">
                  <span className="sample-swatch" style={{ background: row.color }} />
                  <span>{row.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="sample-rail">
          <section className="sample-panel">
            <h2>{overlayMeta.label}</h2>
            <div className="sample-panel-copy">{overlayMeta.description}</div>

            <dl className="sample-panel-list">
              <div>
                <dt>Sample 假设</dt>
                <dd>{`4 个训练节点，每节点 8 张 ${TOK.ascend} ${CARD_CODE}。`}</dd>
              </div>
              <div>
                <dt>节点内</dt>
                <dd>{`${HCCS} 域；点击单卡时高亮其余 7 张卡的直接关系。`}</dd>
              </div>
              <div>
                <dt>节点间</dt>
                <dd>{`${ROCE} scale-out；后续盘古训练的 DP / PP 叠加在这层。`}</dd>
              </div>
            </dl>
          </section>

          <section className="sample-panel sample-stack">
            <div>
              <h3>当前选中</h3>
              <div className="sample-panel-copy">
                {selectedCard
                  ? `节点 ${selectedCard.nodeIndex} · 卡槽 ${selectedCard.slot} · tensor group ${selectedCard.tensorGroup}`
                  : '未选中单卡。点击场景中的卡，查看卡内结构、同节点直接关系和跨节点同槽位副本路径。'}
              </div>
            </div>

            <div>
              <h3>后续盘古训练接入</h3>
              <div className="sample-note">
                <strong>这版先把物理骨架做稳。</strong>
                后续只需要在当前页面继续挂 `rank → card`、`TP group`、`PP stage`、`DP replica`、`AllReduce ring`
                五类数据，不需要重做场景结构。
              </div>
            </div>
          </section>

          <section className="sample-panel">
            <h3>第一版范围</h3>
            <div className="sample-panel-copy">
              这页只覆盖 `卡内` 和 `卡之间`。机柜、交换柜、超节点级拓扑先不展开，避免第一版把层次做乱。
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
