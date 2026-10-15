/* LinguaFlow · 视图（进阶侧）：练习中心 / 进度看板 / 学习路径 / 社区 / 成就 / 个人中心 */
(function () {
  'use strict';
  const U = window.LL_UI, D = window.LL_DATA, ST = window.LL_STORE, R = window.LL_RECOMMEND;
  const esc = U.esc;
  const MODULES = [
    { id: 'vocab', icon: '📖', name: '单词记忆', desc: '记忆卡片 + 间隔复习，稳扎稳打积累词汇', bg: '#eef0ff', fg: '#4a4ac4' },
    { id: 'grammar', icon: '✍️', name: '语法练习', desc: '要点讲解配套选择题，即时解析纠错', bg: '#fdeef6', fg: '#c2410c' },
    { id: 'speaking', icon: '🎙️', name: '口语跟读', desc: '示范朗读 + 录音评分，练就地道发音', bg: '#e6f6ee', fg: '#1f9d63' },
    { id: 'listening', icon: '🎧', name: '听力训练', desc: '可反复精听的语音理解题，磨耳朵', bg: '#fdf3e0', fg: '#d98a11' }
  ];

  function langLevelOptions(selLang, selLevel) {
    let html = '';
    D.languages.forEach(l => {
      l.levels.forEach(lv => {
        const sel = (l.code === selLang && lv.id === selLevel) ? ' selected' : '';
        html += '<option value="' + l.code + '|' + lv.id + '"' + sel + '>' + l.flag + ' ' + esc(l.name) + ' · ' + esc(lv.label) + '</option>';
      });
    });
    return html;
  }

  /* ================= 练习中心 ================= */
  LL_VIEWS.practice = {
    meta: (params) => {
      if (params.module) {
        const m = MODULES.find(x => x.id === params.module) || MODULES[0];
        return { title: m.name, sub: '专项强化练习' };
      }
      const l = D.getLanguage(params.lang || ST.progress().primaryLang);
      return { title: '练习中心', sub: '四大互动模块，随时开练' };
    },
    render(el, params, app) {
      const p = ST.progress();
      const lang = params.lang || p.primaryLang;
      const level = params.level || p.primaryLevel;
      if (params.module) { renderSession(el, lang, level, params.module, app); return; }

      const l = D.getLanguage(lang), lv = D.getLevelDef(lang, level);
      const due = R.dueWords(p, lang).length;
      const bt = p.stats.byType;
      const cards = MODULES.map(m => {
        const s = bt[m.id] || { a: 0, c: 0 };
        const acc = s.a ? Math.round(s.c / s.a * 100) + '%' : '—';
        return '<a class="module-card cardlink" href="#/practice/' + lang + '/' + level + '/' + m.id + '">' +
          '<div class="module-ico" style="background:' + m.bg + ';color:' + m.fg + '">' + m.icon + '</div>' +
          '<div class="grow"><h4>' + m.name + '</h4><p>' + m.desc + '</p>' +
            '<div class="row" style="margin-top:8px">' + U.chip('累计 ' + s.a + ' 题') + U.chip('正确率 ' + acc, s.a && s.c / s.a >= .8 ? 'chip-ok' : '') + '</div>' +
          '</div>' +
        '</a>';
      }).join('');

      el.innerHTML =
        '<div class="card card-pad row-between wrap">' +
          '<div><h3 style="font-size:17px">' + l.flag + ' ' + esc(l.name) + ' · ' + esc(lv.label) + ' ' + esc(lv.name) + '</h3>' +
            '<p class="muted" style="margin-top:4px">' + (due ? '有 ' + due + ' 个单词等待复习，先清一波再拓展。' : '暂无到期复习词，可自由选择模块强化。') + '</p></div>' +
          '<div class="field" style="min-width:260px"><label>切换语言 / 等级</label>' +
            '<select id="sw">' + langLevelOptions(lang, level) + '</select></div>' +
        '</div>' +
        '<div class="module-grid" style="margin-top:20px">' + cards + '</div>';

      el.querySelector('#sw').onchange = ev => {
        const [a, b] = ev.target.value.split('|');
        location.hash = '#/practice/' + a + '/' + b;
      };
    }
  };

  function practiceExercises(lang, level, module) {
    const pool = D.practicePool(lang, level, module).slice();
    // 补充同语言其它等级的同类练习，避免高等级池子过小
    if (pool.length < 6) {
      D.getLevels(lang).forEach(lv => { D.practicePool(lang, lv.id, module).forEach(e => pool.push(e)); });
    }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    return pool.slice(0, Math.min(8, pool.length));
  }

  function renderSession(el, lang, level, module, app) {
    const m = MODULES.find(x => x.id === module) || MODULES[0];
    const ex = practiceExercises(lang, level, module);
    const l = D.getLanguage(lang), lv = D.getLevelDef(lang, level);
    el.innerHTML =
      '<a class="more" href="#/practice/' + lang + '/' + level + '">← 返回练习中心</a>' +
      '<div class="card card-pad" style="margin-top:12px">' +
        '<div class="row-between wrap"><div><h3 style="font-size:17px">' + m.icon + ' ' + m.name + ' · 专项练习</h3>' +
        '<p class="muted" style="margin-top:4px">' + l.flag + ' ' + esc(l.name) + ' · ' + esc(lv.label) + ' · 共 ' + ex.length + ' 题</p></div>' +
        '<span class="chip chip-brand">不计入课程进度</span></div>' +
      '</div>' +
      '<div class="player-main" id="pstage" style="margin-top:16px"></div>';
    window.LL_PLAYER.mount(el.querySelector('#pstage'), {
      lang, level, exercises: ex, mode: 'practice',
      onComplete(score, total) {
        window.LL_APP.refreshChrome();
        window.LL_APP.toast('练习完成：' + score + '/' + total, score === total ? 'ok' : '');
      },
      onExit() { location.hash = '#/practice/' + lang + '/' + level; },
      onExitLabel: '返回练习中心'
    });
  }

  /* ================= 进度看板 ================= */
  LL_VIEWS.progress = {
    meta: () => ({ title: '学习进度', sub: '数据驱动的学习复盘' }),
    render(el) {
      const p = ST.progress();
      const snap = ST.statsSnapshot();
      const acc = R.accuracy(p.stats);
      const days = [];
      for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = ST.todayKey(d); days.push({ k, label: (d.getMonth() + 1) + '/' + d.getDate(), xp: p.days[k] || 0 }); }
      const maxXp = Math.max(10, ...days.map(d => d.xp));
      const bars = days.map(d => '<div class="col"><b>' + (d.xp || '') + '</b><i style="height:' + (d.xp / maxXp * 100) + '%"></i><span>' + d.label + '</span></div>').join('');

      const skills = MODULES.map(m => {
        const s = p.stats.byType[m.id] || { a: 0, c: 0 };
        const a = s.a ? Math.round(s.c / s.a * 100) : 0;
        return '<div class="skill-row"><div class="row-between"><b>' + m.icon + ' ' + m.name + '</b><span>' + s.c + '/' + s.a + ' · ' + (s.a ? a + '%' : '未练习') + '</span></div>' + U.bar(a, s.a && a >= 80 ? 'ok' : '') + '</div>';
      }).join('');

      const langRows = D.languages.map(l => {
        const s = p.stats.byLang[l.code] || { answered: 0, correct: 0, lessons: 0 };
        const a = s.answered ? Math.round(s.correct / s.answered * 100) : 0;
        return '<div class="row-between" style="padding:12px 0;border-bottom:1px solid var(--surface-2)">' +
          '<div class="row">' + '<span style="font-size:22px">' + l.flag + '</span><div><b>' + esc(l.name) + '</b><div class="muted">' + s.lessons + ' 课时 · ' + s.answered + ' 题</div></div></div>' +
          '<div style="width:160px">' + U.bar(a, a >= 80 ? 'ok' : '') + '<div class="muted" style="text-align:right;margin-top:4px">' + (s.answered ? a + '%' : '—') + '</div></div>' +
        '</div>';
      }).join('');

      const acts = p.activity.slice(0, 8).map(a =>
        '<div class="row" style="padding:8px 0;border-bottom:1px solid var(--surface-2)"><span>' + a.icon + '</span>' +
        '<span class="grow" style="font-size:14px">' + esc(a.text) + '</span>' +
        '<span class="muted">' + timeAgo(a.ts) + '</span></div>').join('') || '<div class="muted">暂无记录</div>';

      el.innerHTML =
        '<div class="kpi-grid">' +
          kpi('累计经验', p.xp, 'XP') + kpi('连续打卡', p.streak, '天') + kpi('整体正确率', acc, '%') + kpi('掌握单词', snap.vocabMastered, '个') +
        '</div>' +
        '<div class="card chart-card" style="margin-top:20px"><div class="row-between"><h3 style="font-size:16px">近 7 天学习强度</h3><span class="chip">每日目标 ' + p.goal + ' XP</span></div>' +
          '<div class="bars">' + bars + '</div></div>' +
        '<div class="grid" style="grid-template-columns:1fr 1fr;margin-top:20px">' +
          '<div class="card card-pad"><h3 style="font-size:16px;margin-bottom:16px">模块熟练度</h3><div class="skill-rows">' + skills + '</div></div>' +
          '<div class="card card-pad"><h3 style="font-size:16px;margin-bottom:8px">分语种表现</h3>' + langRows + '</div>' +
        '</div>' +
        '<div class="card card-pad" style="margin-top:20px"><h3 style="font-size:16px;margin-bottom:6px">最近动态</h3>' + acts + '</div>';
    }
  };
  function kpi(k, v, u) { return '<div class="kpi"><div class="k">' + k + '</div><div class="v">' + v + ' <small style="font-size:14px;color:var(--fg-3)">' + u + '</small></div></div>'; }
  function timeAgo(ts) {
    const d = Date.now() - ts, m = Math.floor(d / 60000);
    if (m < 1) return '刚刚'; if (m < 60) return m + ' 分钟前';
    const h = Math.floor(m / 60); if (h < 24) return h + ' 小时前';
    return Math.floor(h / 24) + ' 天前';
  }

  /* ================= 个性化学习路径 ================= */
  LL_VIEWS.path = {
    meta: () => ({ title: '个性化学习路径', sub: '根据你的数据实时生成' }),
    render(el) {
      const p = ST.progress();
      const rec = R.build(p);
      const l = D.getLanguage(rec.lang), lv = D.getLevelDef(rec.lang, rec.level);
      const lp = R.levelProgress(rec.lang, rec.level, p);
      const items = rec.items.map((it, i) =>
        '<div class="path-item ' + (i === 0 ? 'why' : '') + '">' +
          '<div class="node">' + it.icon + '</div>' +
          '<div class="grow"><b>' + esc(it.title) + '</b><p class="muted" style="margin-top:2px">' + esc(it.reason) + '</p></div>' +
          '<a class="btn ' + (i === 0 ? 'btn-primary' : 'btn-ghost') + ' btn-sm" href="' + U.actionHref(it.action) + '">' + esc(it.cta) + '</a>' +
        '</div>').join('');

      el.innerHTML =
        '<div class="hero" style="background:linear-gradient(135deg,#4a4ac4,#6a4fc4 50%,#c2410c)">' +
          '<div><h2>为 ' + esc(ST.current().name) + ' 定制</h2>' +
            '<p>当前主线：' + l.flag + ' ' + esc(l.name) + ' · ' + esc(lv.label + ' ' + lv.name) + '，已完成 ' + lp.pct + '%。推荐引擎综合间隔复习到期量、模块正确率、每日目标达成情况与跨语种拓展机会，实时排序给出下一步。</p></div>' +
          '<div class="hero-ring">' + U.ring(lp.pct, '当前等级') + '</div>' +
        '</div>' +
        '<div class="section-title"><h3>推荐行动</h3><span class="chip chip-brand">共 ' + rec.items.length + ' 项</span></div>' +
        '<div class="path-list">' + items + '</div>' +
        '<div class="card card-pad" style="margin-top:20px;background:var(--surface-2)">' +
          '<h4 style="font-size:14px">🔍 推荐依据</h4>' +
          '<div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:12px">' +
            '<div><b style="font-size:13px">间隔复习</b><p class="muted">' + rec.dueCount + ' 个词到期或未掌握，优先级最高。</p></div>' +
            '<div><b style="font-size:13px">薄弱技能</b><p class="muted">当前最弱模块：' + R.SKILL_LABEL[rec.weakest] + '。</p></div>' +
            '<div><b style="font-size:13px">目标达成</b><p class="muted">今日 ' + rec.today.xp + ' / ' + rec.today.goal + ' XP。</p></div>' +
          '</div>' +
        '</div>';
    }
  };

  /* ================= 社区 ================= */
  let communityFilter = null;
  LL_VIEWS.community = {
    meta: () => ({ title: '共学社区', sub: '和同好一起坚持' }),
    render(el, params, app) {
      el.innerHTML =
        '<div class="feed"><div>' +
          '<div class="card card-pad composer" style="margin-bottom:20px">' +
            '<div class="row" style="margin-bottom:10px">' + U.avatar(ST.current().name, ST.current().color) +
              '<div class="field grow"><label>发布动态</label><textarea id="pbody2" placeholder="分享今天的学习心得、打卡或请教问题…"></textarea></div></div>' +
            '<div class="row-between wrap" style="margin-top:10px">' +
              '<div class="field" style="min-width:180px"><label>话题</label><select id="ptopic">' + D.topics.map(t => '<option>' + esc(t) + '</option>').join('') + '</select></div>' +
              '<button class="btn btn-primary" id="publish">发布动态</button>' +
            '</div>' +
          '</div>' +
          '<div id="feedbox"></div>' +
        '</div><div class="stack">' +
          '<div class="card card-pad"><h4 style="font-size:14px;margin-bottom:8px">热门话题</h4><div class="topic-list" id="topics">' +
            '<div class="topic" data-topic=""><span>全部动态</span><span class="n" id="allcount">' + ST.allPosts().length + '</span></div>' +
            D.topics.map(t => '<div class="topic" data-topic="' + esc(t) + '"><span>#' + esc(t) + '</span><span class="n">›</span></div>').join('') +
          '</div></div>' +
          '<div class="card card-pad"><h4 style="font-size:14px;margin-bottom:8px">🏆 经验排行榜</h4><div id="lb"></div></div>' +
        '</div></div>';

      const feedBox = el.querySelector('#feedbox');
      function renderFeed() {
        const allcount = el.querySelector('#allcount');
        if (allcount) allcount.textContent = ST.allPosts().length;
        const list = ST.allPosts().filter(p => !communityFilter || p.topic === communityFilter);
        if (!list.length) { feedBox.innerHTML = '<div class="card card-pad empty">该话题下还没有动态</div>'; return; }
        feedBox.innerHTML = '<div class="card card-pad">' + list.map(p =>
          '<div class="post">' +
            '<div class="post-head">' + U.avatar(p.author, p.color) +
              '<div><b style="font-size:14px">' + esc(p.author) + '</b><div class="meta">#' + esc(p.topic) + ' · ' + esc(p.time || timeAgo(p.ts || Date.now())) + '</div></div>' +
              (p.seeded ? '' : '<span class="chip chip-brand" style="margin-left:auto">我发布的</span>') +
            '</div>' +
            '<div class="post-body">' + esc(p.body) + '</div>' +
            '<div class="post-actions">' +
              '<button class="' + (ST.isLiked(p.id) ? 'on' : '') + '" data-like="' + p.id + '">👍 ' + ST.likeCount(p) + '</button>' +
              '<button data-reply="' + p.id + '">💬 回应</button>' +
            '</div>' +
          '</div>').join('') + '</div>';
        feedBox.querySelectorAll('[data-like]').forEach(b => b.onclick = () => { ST.toggleLike(b.getAttribute('data-like')); renderFeed(); });
        feedBox.querySelectorAll('[data-reply]').forEach(b => b.onclick = () => { document.getElementById('pbody2').focus(); window.LL_APP.toast('在输入框写下你的回应吧'); });
      }
      renderFeed();

      el.querySelector('#topics').onclick = ev => {
        const t = ev.target.closest('.topic'); if (!t) return;
        communityFilter = t.getAttribute('data-topic') || null;
        el.querySelectorAll('.topic').forEach(x => x.style.background = '');
        t.style.background = 'var(--brand-soft)';
        renderFeed();
      };
      el.querySelector('#publish').onclick = () => {
        const body = el.querySelector('#pbody2').value;
        const topic = el.querySelector('#ptopic').value;
        const fresh = ST.addPost(topic, body);
        if (!body.trim()) { window.LL_APP.toast('写点什么再发布吧', 'no'); return; }
        el.querySelector('#pbody2').value = '';
        fresh.forEach(a => window.LL_APP.toast('🏅 解锁成就：' + a.title, 'gold'));
        window.LL_APP.refreshChrome();
        window.LL_APP.toast('已发布，经验 +15', 'ok');
        renderFeed(); renderLb();
      };
      const lb = el.querySelector('#lb');
      function renderLb() {
        const rows = ST.leaderboard();
        lb.innerHTML = rows.map((r, i) =>
          '<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--surface-2)' + (r.me ? ';background:var(--brand-soft);border-radius:8px;padding:8px 10px' : '') + '">' +
            '<div class="row"><span style="width:22px;font-weight:800;color:var(--fg-3)">' + (i + 1) + '</span>' + U.avatar(r.name, r.color) +
              '<div><b style="font-size:14px">' + esc(r.name) + (r.me ? ' （我）' : '') + '</b><div class="muted">连续 ' + r.streak + ' 天</div></div></div>' +
            '<b>' + r.xp + '</b>' +
          '</div>').join('');
      }
      renderLb();
    }
  };

  /* ================= 成就 ================= */
  LL_VIEWS.achievements = {
    meta: () => ({ title: '成就徽章', sub: '坚持就有奖励' }),
    render(el) {
      const list = ST.achievementList();
      const unlocked = list.filter(x => x.unlocked).length;
      const grid = list.map(x =>
        '<div class="ach ' + (x.unlocked ? 'on' : '') + '">' +
          '<div class="medal">' + x.a.icon + '</div>' +
          '<h4>' + esc(x.a.title) + '</h4><p>' + esc(x.a.desc) + '</p>' +
          (x.unlocked ? '<div class="chip chip-warn" style="margin-top:8px">已解锁</div>' : '<div class="chip" style="margin-top:8px">未解锁</div>') +
          (x.a.xp ? '<p style="margin-top:6px">+' + x.a.xp + ' XP</p>' : '') +
        '</div>').join('');
      const rows = ST.leaderboard().map((r, i) =>
        '<div class="row-between" style="padding:10px 0;border-bottom:1px solid var(--surface-2)' + (r.me ? ';background:var(--brand-soft);border-radius:8px;padding:10px' : '') + '">' +
          '<div class="row"><span style="width:24px;font-weight:800;color:var(--fg-3)">' + (i + 1) + '</span>' + U.avatar(r.name, r.color) +
            '<b>' + esc(r.name) + '</b></div><b>' + r.xp + ' XP</b></div>').join('');
      el.innerHTML =
        '<div class="card card-pad row-between wrap">' +
          '<div><h3 style="font-size:17px">已解锁 ' + unlocked + ' / ' + list.length + ' 枚徽章</h3>' +
          '<p class="muted" style="margin-top:4px">完成课程、连续打卡、掌握词汇都会触发成就，解锁即奖励经验值。</p></div>' +
          '<div style="width:240px">' + U.bar(U.pct(unlocked, list.length), 'pink') + '</div>' +
        '</div>' +
        '<div class="section-title"><h3>徽章墙</h3></div>' +
        '<div class="ach-grid">' + grid + '</div>' +
        '<div class="section-title"><h3>经验排行榜</h3></div>' +
        '<div class="card card-pad">' + rows + '</div>';
    }
  };

  /* ================= 个人中心 ================= */
  LL_VIEWS.profile = {
    meta: () => ({ title: '个人中心', sub: '账号与学习偏好' }),
    render(el, params, app) {
      const u = ST.current(), p = ST.progress();
      const snap = ST.statsSnapshot();
      const opts = D.getLevels(p.primaryLang).map(lv => '<option value="' + lv.id + '"' + (lv.id === p.primaryLevel ? ' selected' : '') + '>' + esc(lv.label) + ' ' + esc(lv.name) + '</option>').join('');
      el.innerHTML =
        '<div class="card card-pad row-between wrap">' +
          '<div class="row">' + U.avatar(u.name, u.color) +
            '<div><h3 style="font-size:18px">' + esc(u.name) + '</h3><div class="muted">' + esc(u.email) + ' · 加入于 ' + new Date(p.createdAt).toLocaleDateString('zh-CN') + '</div></div></div>' +
          '<div class="row">' + U.chip(p.xp + ' XP', 'chip-brand') + U.chip('连续 ' + p.streak + ' 天', 'chip-warn') + '</div>' +
        '</div>' +
        '<div class="grid" style="grid-template-columns:1fr 1fr;margin-top:20px">' +
          '<div class="card card-pad"><h3 style="font-size:16px;margin-bottom:14px">学习偏好</h3>' +
            '<div class="field" style="margin-bottom:12px"><label>主攻语言</label><select id="plang">' +
              D.languages.map(l => '<option value="' + l.code + '"' + (l.code === p.primaryLang ? ' selected' : '') + '>' + l.flag + ' ' + esc(l.name) + '</option>').join('') + '</select></div>' +
            '<div class="field" style="margin-bottom:12px"><label>当前等级</label><select id="plevel">' + opts + '</select></div>' +
            '<div class="field" style="margin-bottom:14px"><label>每日目标（经验值）</label><select id="pgoal">' +
              [10, 20, 30, 50, 80].map(g => '<option value="' + g + '"' + (g === p.goal ? ' selected' : '') + '>' + g + ' XP' + (g === 20 ? '（轻松）' : g === 50 ? '（进阶）' : '') + '</option>').join('') + '</select></div>' +
            '<button class="btn btn-primary btn-block" id="save">保存偏好</button>' +
          '</div>' +
          '<div class="card card-pad"><h3 style="font-size:16px;margin-bottom:14px">学习概览</h3>' +
            '<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--surface-2)"><span>完成课时</span><b>' + Object.keys(p.lessons).length + '</b></div>' +
            '<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--surface-2)"><span>累计作答</span><b>' + p.stats.answered + '</b></div>' +
            '<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--surface-2)"><span>整体正确率</span><b>' + R.accuracy(p.stats) + '%</b></div>' +
            '<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--surface-2)"><span>掌握单词</span><b>' + snap.vocabMastered + '</b></div>' +
            '<div class="row-between" style="padding:8px 0"><span>解锁成就</span><b>' + Object.keys(p.unlocked).length + ' 枚</b></div>' +
            '<button class="btn btn-ghost btn-block btn-danger" id="wipe" style="margin-top:16px">清除本地学习数据</button>' +
          '</div>' +
        '</div>';

      el.querySelector('#plang').onchange = ev => {
        const code = ev.target.value;
        el.querySelector('#plevel').innerHTML = D.getLevels(code).map(lv => '<option value="' + lv.id + '">' + esc(lv.label) + ' ' + esc(lv.name) + '</option>').join('');
      };
      el.querySelector('#save').onclick = () => {
        ST.setPrimary(el.querySelector('#plang').value, el.querySelector('#plevel').value);
        ST.setGoal(parseInt(el.querySelector('#pgoal').value, 10));
        window.LL_APP.toast('已保存学习偏好', 'ok');
        window.LL_APP.refreshChrome();
        location.reload();
      };
      el.querySelector('#wipe').onclick = () => {
        if (confirm('确定清除本地全部学习数据？该操作不可恢复。')) { ST.resetLocal(); location.reload(); }
      };
    }
  };
})();
