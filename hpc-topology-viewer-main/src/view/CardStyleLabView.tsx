import { useState } from 'react';
import { CardStylePreview, type StylePreviewMode } from '../scene/CardStyleLabScene';
import { CARD_STYLE_OPTIONS } from '../scene/GpuCardModel';

export function CardStyleLabView() {
  const [modes, setModes] = useState<Record<string, StylePreviewMode>>({
    'baseline-block': 'single',
    'ghost-cage': 'single',
    'compute-focus': 'single',
    'twin-rail': 'single',
  });

  return (
    <div className="lab-page">
      <header className="lab-toolbar">
        <div className="lab-toolbar-group lab-title">
          <strong>Ascend 910B card style lab</strong>
          <span>固定轴测 2.5D 对比页 · 四种 style · hover / click 交互检查</span>
        </div>

        <div className="lab-toolbar-sep" />

        <div className="lab-toolbar-group">
          <span className="lab-chip">Preview Gate</span>
          <span className="lab-chip">Orthographic axonometric</span>
          <span className="lab-chip">Interactive preview</span>
        </div>
      </header>

      <main className="lab-main">
        <section className="lab-intro">
          <div className="lab-intro-copy">
            上一版的问题是把 `normal / peer / selected` 一次性画在一起，用户在读状态，不是在选风格。这一版把状态变成交互行为：默认只看干净 style，悬浮看
            hover，点击看 selected，再用 `单卡 / 四卡` 切换判断近景与堆叠可读性。
          </div>
          <div className="lab-intro-meta">
            <span className="lab-chip">壳层复用 PTO design system</span>
            <span className="lab-chip">卡内部绘制属于 data-viz preview</span>
            <span className="lab-chip">主训练页暂未写入未批准样式</span>
          </div>
        </section>

        <section className="lab-grid" aria-label="card style options">
          {CARD_STYLE_OPTIONS.map((option) => (
            <article key={option.id} className="lab-card">
              <div className="lab-card-head">
                <div>
                  <h2>{option.title}</h2>
                  <div className="lab-card-copy">{option.summary}</div>
                </div>
                <div className="lab-badge-row">
                  <span className={`lab-badge ${option.badge === 'current' ? 'is-current' : 'is-candidate'}`}>
                    {option.badge === 'current' ? '当前基线' : '候选方案'}
                  </span>
                </div>
              </div>

              <div className="lab-control-row">
                <div className="lab-segmented" aria-label={`${option.title} preview mode`}>
                  {(['single', 'stack'] as StylePreviewMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={modes[option.id] === mode ? 'is-active' : undefined}
                      onClick={() => setModes((current) => ({ ...current, [option.id]: mode }))}
                    >
                      {mode === 'single' ? '单卡' : '四卡'}
                    </button>
                  ))}
                </div>
                <div className="lab-inline-note">悬浮看 hover，点击看 selected。</div>
              </div>

              <div className="lab-preview">
                <CardStylePreview variant={option.id} mode={modes[option.id]} />
              </div>

              <div className="lab-attribute-list">
                {option.traits.map((trait) => (
                  <div key={trait} className="lab-attribute">
                    {trait}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
