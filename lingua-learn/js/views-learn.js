/* LinguaFlow · 视图（学习侧）：首页 / 课程目录 / 课程详情 / 课时 */
window.LL_UI = (function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
  function langMeta(code) { return window.LL_DATA.getLanguage(code); }
  function avatar(name, color) { return '<div class="avatar" style="background:' + color + '">' + esc((name || '?').slice(0, 1)) + '</div>'; }
  function bar(value, cls) { return '<div class="bar ' + (cls || '') + '"><i style="width:' + Math.max(0, Math.min(100, value)) + '%"></i></div>'; }
  function ring(value, label) {
    const c = 2 * Math.PI * 72;
    return '<div class="ring"><svg width="168" height="168" viewBox="0 0 168 168">' +
      '<circle cx="84" cy="84" r="72" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="12"/>' +
      '<circle cx="84" cy="84" r="72" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + (c * (1 - Math.min(100, value) / 100)) + '"/>' +
      '</svg><div class="ring-label"><div><b>' + Math.round(value) + '%</b><span>' + esc(label) + '</span></div></div></div>';
  }
  function chip(text, cls) { return '<span class="chip ' + (cls || '') + '">' + esc(text) + '</span>'; }
  return { esc, pct, langMeta, avatar, bar, ring, chip };
})();

window.LL_VIEWS = window.LL_VIEWS || {};

(function () {
  'use strict';
  const U = window.LL_UI, D = window.LL_DATA, ST = window.LL_STORE, R = window.LL_RECOMMEND;
  const esc = U.esc;

  function levelStatus(lang, level, p) {
    return R.levelProgress(lang, level, p);
  }

  /* ================= 首页 ================= */
  LL_VIEWS.home = {
    meta: () => ({ title: '学习首页', sub: '今天也要坚持学一点' }),
    render(el, params, app) {
      const p = ST.progress(), user = ST.current();
      const rec = R.build(p);
      const langMeta = U.langMeta(rec.lang);
      const lp = levelStatus(rec.lang, rec.level, p);
      const gate = R.goalToday(p);
      const totalLessons = Object.keys(p.lessons).length;
      const mastered = ST.statsSnapshot().vocabMastered;
      const continueItem = rec.items.find(i => i.id === 'continue') || rec.items[0];

      let recCards = rec.items.slice(0, 3).map(it =>
        '<div class="path-item">' +
          '<div class="node">' + it.icon + '</div>' +
          '<div class="grow"><b>' + esc(it.title) + '</b><p class="muted" style="margin-top:2px">' + esc(it.reason) + '</p></div>' +
          '<a class="btn btn-primary btn-sm" href="' + actionHref(it.action) + '">' + esc(it.cta) + '</a>' +
        '</div>').join('');

      const langCards = D.languages.map(l => {
        const stat = p.stats.byLang[l.code] || { lessons: 0, answered: 0, correct: 0 };
        const lv = l.code === rec.lang ? rec.level : l.levels[0].id;
        const prog = levelStatus(l.code, lv, p);
        const started = stat.lessons > 0;
        return '<a class="lang-card cardlink" href="#/course/' + l.code + '/' + lv + '">' +
          '<div class="lang-flag">' + l.flag + '</div>' +
          '<div><h4>' + esc(l.name) + '</h4><div class="native">' + esc(l.native) + ' · ' + esc(l.scale) + '</div></div>' +
          U.bar(started ? prog.pct : 0) +
          '<div class="meta">' + U.chip(started ? '学习中 · ' + stat.lessons + ' 课时' : '尚未开始', started ? 'chip-brand' : '') + U.chip(l.levels.length + ' 个等级') + '</div>' +
        '</a>';
      }).join('');

      el.innerHTML =
        '<div class="hero">' +
          '<div>' +
            '<h2>' + greeting() + '，' + esc(user.name) + ' 👋</h2>' +
            '<p>' + esc(rec.pickReason || ('你正在学习 ' + (langMeta ? langMeta.name : '') + ' · ' + rec.level + '，当前等级已完成 ' + lp.pct + '%，继续保持节奏。')) + '</p>' +
            '<div class="hero-actions">' +
              (continueItem ? '<a class="btn btn-primary btn-lg" href="' + actionHref(continueItem.action) + '">' + continueItem.icon + ' ' + esc(continueItem.cta) + '</a>' : '') +
              '<a class="btn btn-ghost btn-lg" href="#/path">查看学习路径</a>' +
            '</div>' +
          '</div>' +
          '<div class="hero-ring">' + U.ring(gate.pct, '今日目标') + '</div>' +
        '</div>' +

        '<div class="stat-grid" style="margin-top:24px">' +
          statBox('累计经验', p.xp, 'XP') +
          statBox('连续打卡', p.streak, '天') +
          statBox('完成课时', totalLessons, '节') +
          statBox('掌握单词', mastered, '个') +
        '</div>' +

        '<div class="section-title"><h3>今日学习建议</h3><a class="more" href="#/path">全部推荐 →</a></div>' +
        '<div class="path-list">' + recCards + '</div>' +

        '<div class="section-title"><h3>我的语言</h3><a class="more" href="#/courses">全部课程 →</a></div>' +
        '<div class="lang-grid">' + langCards + '</div>';
    }
  };

  function greeting() { const h = new Date().getHours(); return h < 6 ? '凌晨好' : h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好'; }
  function statBox(k, v, unit) { return '<div class="stat-box"><div class="k">' + k + '</div><div class="v">' + v + ' <small>' + unit + '</small></div></div>'; }

  function actionHref(a) {
    if (!a) return '#/courses';
    if (a.type === 'lesson') return '#/lesson/' + a.lang + '/' + a.level + '/' + a.lessonId;
    if (a.type === 'practice') return '#/practice/' + a.lang + '/' + a.level + '/' + a.module;
    if (a.type === 'course') return '#/course/' + a.lang + '/' + a.level;
    return '#/courses';
  }
  window.LL_UI.actionHref = actionHref;

  /* ================= 课程目录 ================= */
  LL_VIEWS.courses = {
    meta: () => ({ title: '课程目录', sub: '三大语种 · 分级进阶体系' }),
    render(el) {
      const p = ST.progress();
      const blocks = D.languages.map(l => {
        const rows = l.levels.map(lv => {
          const prog = levelStatus(l.code, lv.id, p);
          const started = prog.done > 0;
          return '<a class="lesson-row cardlink" href="#/course/' + l.code + '/' + lv.id + '" style="border-top:1px solid var(--surface-2)">' +
            '<span class="lesson-dot" style="width:30px;height:30px;border-radius:8px;font-size:12px">' + esc(lv.label) + '</span>' +
            '<div class="grow"><div class="t">' + esc(lv.name) + ' · ' + esc(lv.desc) + '</div>' +
              '<div class="d">' + prog.total + ' 课时' + (started ? ' · 已完成 ' + prog.done + ' 节' : '') + '</div></div>' +
            '<div class="unit-prog">' + U.bar(prog.pct, started ? 'ok' : '') + '<div class="muted" style="text-align:right;margin-top:4px">' + prog.pct + '%</div></div>' +
          '</a>';
        }).join('');
        const stat = p.stats.byLang[l.code] || { answered: 0, correct: 0 };
        return '<div class="unit" style="margin-bottom:20px">' +
          '<div class="unit-head" style="background:linear-gradient(90deg,' + l.accent + '14,transparent)">' +
            '<div class="unit-idx" style="background:' + l.accent + '1f;color:' + l.accent + ';font-size:20px">' + l.flag + '</div>' +
            '<div class="grow"><h4>' + esc(l.name) + '　<span class="muted" style="font-weight:500">' + esc(l.native) + '</span></h4>' +
              '<p>' + esc(l.scale) + ' 分级 · 共 ' + l.levels.length + ' 个等级 · ' + (stat.answered ? '累计作答 ' + stat.answered + ' 题' : '尚未开始学习') + '</p></div>' +
          '</div>' + rows +
        '</div>';
      }).join('');
      el.innerHTML = blocks;
    }
  };

  /* ================= 课程详情（等级 → 单元 → 课时） ================= */
  LL_VIEWS.course = {
    meta: (params) => {
      const l = D.getLanguage(params.lang), lv = D.getLevelDef(params.lang, params.level);
      return { title: (l ? l.name : '') + ' · ' + (lv ? lv.label + ' ' + lv.name : ''), sub: lv ? lv.desc : '' };
    },
    render(el, params) {
      const { lang, level } = params;
      const l = D.getLanguage(lang), lv = D.getLevelDef(lang, level);
      const tree = D.getLevelTree(lang, level);
      const p = ST.progress();
      if (!tree) { el.innerHTML = '<div class="empty">课程不存在</div>'; return; }

      const rail = D.getLevels(lang).map(x => {
        const prog = levelStatus(lang, x.id, p);
        return '<a class="level-btn cardlink ' + (x.id === level ? 'active' : '') + '" href="#/course/' + lang + '/' + x.id + '">' +
          esc(x.label) + '<span class="sub">' + esc(x.name) + ' · ' + prog.pct + '%</span></a>';
      }).join('');

      const units = tree.units.map((u, ui) => {
        const done = u.lessons.filter(ls => p.lessons[ls.id]).length;
        const prog = U.pct(done, u.lessons.length);
        const rows = u.lessons.map((ls, li) => {
          const st = p.lessons[ls.id];
          const cls = st ? 'done' : (done === li ? 'current' : '');
          return '<a class="lesson-row cardlink ' + cls + '" href="#/lesson/' + lang + '/' + level + '/' + ls.id + '">' +
            '<span class="lesson-dot">' + (st ? '✓' : (li + 1)) + '</span>' +
            '<div class="grow"><div class="t">' + esc(ls.title) + '</div>' +
              '<div class="d">' + LL_PLAYER.LABEL[ls.type] + ' · ' + ls.exercises.length + ' 题' + (st ? ' · 得分 ' + st.score + '/' + st.total : '') + '</div></div>' +
            '<span class="muted">' + (st ? '已学' : '开始') + ' →</span>' +
          '</a>';
        }).join('');
        return '<div class="unit">' +
          '<div class="unit-head">' +
            '<div class="unit-idx">' + (ui + 1) + '</div>' +
            '<div class="grow"><h4>' + u.icon + ' ' + esc(u.title) + '</h4><p>' + esc(u.desc) + '</p></div>' +
            '<div class="unit-prog">' + U.bar(prog, prog === 100 ? 'ok' : '') + '<div class="muted" style="text-align:right;margin-top:4px">' + done + '/' + u.lessons.length + '</div></div>' +
          '</div>' +
          '<div class="lesson-list">' + rows + '</div>' +
        '</div>';
      }).join('');

      el.innerHTML =
        '<div class="catalog">' +
          '<div class="level-rail">' +
            '<div class="muted" style="padding:0 4px 6px">选择等级（' + esc(l.scale) + '）</div>' + rail +
          '</div>' +
          '<div class="unit-list">' + units + '</div>' +
        '</div>';
    }
  };

  /* ================= 课时（播放器 + 侧栏） ================= */
  LL_VIEWS.lesson = {
    meta: (params) => {
      const ls = D.getLesson(params.lang, params.level, params.lessonId);
      return { title: ls ? ls.title : '课时', sub: (D.getLevelDef(params.lang, params.level) || {}).label || '' };
    },
    render(el, params, app) {
      const { lang, level, lessonId } = params;
      const ls = D.getLesson(lang, level, lessonId);
      const tree = D.getLevelTree(lang, level);
      if (!ls || !tree) { el.innerHTML = '<div class="empty">课时不存在</div>'; return; }
      const unit = D.getUnitOfLesson(lang, level, lessonId);
      const posInUnit = unit.lessons.indexOf(ls);
      const lv = D.getLevelDef(lang, level);

      const sideTips = {
        vocab: '先回忆释义，再翻卡核对。凭第一印象点「认识 / 模糊 / 不认识」，间隔复习算法会自动安排下次出现时机。',
        grammar: '先读要点讲解，再做选择题。答错时务必看解析，理解规则背后的逻辑。',
        listening: '第一遍抓大意，第二遍核对细节。允许反复精听，直到能复述关键信息。',
        speaking: '先听示范，注意语调与连读，再点麦克风跟读。分数 ≥ 75 视为通过。'
      }[ls.type];

      const vocabHint = ls.type === 'vocab'
        ? '<div class="card card-pad"><h4 style="font-size:14px;margin-bottom:8px">本课词汇</h4>' +
          ls.exercises.map(e => '<div class="row-between" style="padding:4px 0"><b>' + esc(e.word) + '</b><span class="muted">' + esc(e.meaning) + '</span></div>').join('') + '</div>'
        : '';

      el.innerHTML =
        '<div class="player">' +
          '<div class="player-main" id="lesson-stage"></div>' +
          '<div class="player-side">' +
            '<div class="card card-pad">' +
              '<div class="row-between"><h4 style="font-size:15px">' + esc(unit.title) + '</h4><span class="chip chip-brand">' + esc(lv.label) + '</span></div>' +
              '<p class="muted" style="margin-top:6px">' + esc(lv.name) + ' · 本单元第 ' + (posInUnit + 1) + '/' + unit.lessons.length + ' 课</p>' +
              '<div style="margin-top:10px">' + U.bar(U.pct(posInUnit, unit.lessons.length), 'pink') + '</div>' +
              '<div style="margin-top:14px" class="stack">' +
                unit.lessons.map(x => '<a class="lesson-row cardlink ' + (x.id === lessonId ? 'current' : (ST.progress().lessons[x.id] ? 'done' : '')) + '" style="padding:8px 10px;border-radius:8px" href="#/lesson/' + lang + '/' + level + '/' + x.id + '">' +
                  '<span class="lesson-dot" style="width:18px;height:18px;font-size:10px">' + (x.id === lessonId ? '▶' : '·') + '</span>' +
                  '<span class="t" style="font-size:13px">' + esc(x.title) + '</span></a>').join('') +
              '</div>' +
            '</div>' +
            vocabHint +
            '<div class="card card-pad" style="background:var(--brand-soft);border-color:#d9dbff">' +
              '<h4 style="font-size:14px">💡 学习提示</h4><p class="muted" style="margin-top:6px;line-height:1.7">' + esc(sideTips) + '</p>' +
            '</div>' +
          '</div>' +
        '</div>';

      const stage = el.querySelector('#lesson-stage');
      LL_PLAYER.mount(stage, {
        lang, level, lessonId,
        exercises: ls.exercises,
        onComplete(score, total) {
          const fresh = ST.completeLesson(lang, lessonId, score, total) || [];
          window.LL_APP.refreshChrome();
          fresh.forEach(a => window.LL_APP.toast('🏅 解锁成就：' + a.title, 'gold'));
          window.LL_APP.toast('本课完成：' + score + '/' + total + '，获得经验 +' + (score === total ? 30 : 18), score === total ? 'ok' : '');
        },
        onExit() { location.hash = '#/course/' + lang + '/' + level; },
        onExitLabel: '返回课程'
      });
      window.LL_APP.refreshChrome();
    }
  };
})();
