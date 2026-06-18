import { useState } from 'react';
import { RenderStyleCanvas } from '../scene/RenderStyleScene';
import type { CardState, ClayTheme, RenderStyle } from '../scene/Card910B';

interface StyleDef {
  id: RenderStyle;
  title: string;
  summary: string;
}

const STYLES: StyleDef[] = [
  {
    id: 'pbr',
    title: 'A. 拟真 PBR',
    summary: '金属/粗糙度材质 + 程序化环境反射 + 软接触阴影，最接近产品渲染图。',
  },
  {
    id: 'flat',
    title: 'B. 扁平等距',
    summary: 'Lambert 纯色块面 + 细描边，无高光渐变，信息识别度最高。',
  },
  {
    id: 'blueprint',
    title: 'C. 技术线框 / 蓝图',
    summary: '半透明体 + 高亮轮廓线 + 蓝图网格，结构线优先，叠加关系时最干净。',
  },
  {
    id: 'clay',
    title: 'D. 白膜 + 外框',
    summary: '白色 clay 材质 + 暗色外框描边，建模软件白模质感，专注形体与体量。',
  },
];

const STATE_LABEL: Record<CardState, string> = {
  normal: 'NORMAL',
  hover: 'HOVER',
  selected: 'SELECTED',
};

function StylePanel({ def }: { def: StyleDef }) {
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [theme, setTheme] = useState<ClayTheme>('light');
  const state: CardState = selected ? 'selected' : hovered ? 'hover' : 'normal';
  const themed = def.id === 'clay';

  return (
    <article className="rs-card" data-style={def.id}>
      <div className="rs-card-head">
        <div>
          <h2>{def.title}</h2>
          <p className="rs-card-copy">{def.summary}</p>
        </div>
        <div className="rs-head-controls">
          {themed ? (
            <div className="rs-seg" role="group" aria-label="clay theme">
              {(['light', 'dark'] as ClayTheme[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={theme === t ? 'is-active' : undefined}
                  onClick={() => setTheme(t)}
                >
                  {t === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          ) : null}
          <span className={`rs-state rs-state-${state}`}>{STATE_LABEL[state]}</span>
        </div>
      </div>

      <div className={`rs-preview rs-preview-${def.id}`} data-theme={themed ? theme : undefined}>
        <RenderStyleCanvas
          style={def.id}
          state={state}
          theme={theme}
          onSelect={() => setSelected((v) => !v)}
          onHover={() => setHovered(true)}
          onBlur={() => setHovered(false)}
        />
      </div>

      <div className="rs-card-foot">
        <span className="rs-chip">悬浮抬升 · 点击选中</span>
        {selected ? (
          <button type="button" className="rs-clear" onClick={() => setSelected(false)}>
            取消选中
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function RenderStyleTestView() {
  return (
    <div className="rs-page">
      <header className="rs-toolbar">
        <div className="rs-title">
          <strong>910B 卡 · 3D 渲染风格测试</strong>
          <span>固定轴测 2.5D · 同一几何体 × 四种渲染管线 · hover / select 交互</span>
        </div>
        <div className="rs-toolbar-tags">
          <span className="rs-chip">Orthographic 2.5D</span>
          <span className="rs-chip">Three.js / R3F</span>
          <span className="rs-chip">raycast hover · click select</span>
        </div>
      </header>

      <main className="rs-grid">
        {STYLES.map((def) => (
          <StylePanel key={def.id} def={def} />
        ))}
      </main>
    </div>
  );
}
