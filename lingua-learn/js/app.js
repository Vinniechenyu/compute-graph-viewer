/* LinguaFlow · 应用引导：认证、路由、顶栏与侧栏外壳 */
(function () {
  'use strict';
  const ST = window.LL_STORE, D = window.LL_DATA, V = window.LL_VIEWS, R = window.LL_RECOMMEND;
  const esc = window.LL_UI.esc;

  const NAV = [
    { key: 'home', icon: '🏠', label: '学习首页', href: '#/' },
    { key: 'courses', icon: '📚', label: '课程目录', href: '#/courses' },
    { key: 'practice', icon: '🎯', label: '练习中心', href: '#/practice' },
    { key: 'path', icon: '🧭', label: '学习路径', href: '#/path' },
    { key: 'progress', icon: '📈', label: '学习进度', href: '#/progress' },
    { key: 'community', icon: '💬', label: '共学社区', href: '#/community' },
    { key: 'achievements', icon: '🏅', label: '成就徽章', href: '#/achievements' },
    { key: 'profile', icon: '👤', label: '个人中心', href: '#/profile' }
  ];

  const app = {};

  /* ---------------- 外壳 ---------------- */
  function renderNav(active) {
    document.getElementById('main-nav').innerHTML = NAV.map(n =>
      '<a href="' + n.href + '" class="' + (n.key === active ? 'active' : '') + '"><span class="ico">' + n.icon + '</span>' + n.label + '</a>'
    ).join('');
  }
  function refreshChrome() {
    const u = ST.current(); if (!u) return;
    document.getElementById('sidebar-user').innerHTML =
      window.LL_UI.avatar(u.name, u.color) +
      '<div class="user-meta"><b>' + esc(u.name) + '</b><span>' + esc(D.getLanguage(u.progress.primaryLang).name) + ' · ' + esc(u.progress.primaryLevel) + '</span></div>';
    const p = ST.progress(), gate = R.goalToday(p);
    document.getElementById('topbar-stats').innerHTML =
      '<span class="stat-pill">⭐ ' + p.xp + ' XP</span>' +
      '<span class="stat-pill">🔥 ' + p.streak + ' 天</span>' +
      '<span class="stat-pill">🎯 ' + gate.xp + '/' + p.goal + '</span>';
  }
  function setTitle(title, sub) {
    document.getElementById('page-title').textContent = title || '';
    document.getElementById('page-sub').textContent = sub || '';
  }
  app.refreshChrome = refreshChrome;

  function toast(msg, kind) {
    const layer = document.getElementById('toast-layer');
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    layer.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 2000);
    setTimeout(() => t.remove(), 2500);
  }
  app.toast = toast;

  window.LL_APP = app;

  /* ---------------- 认证 ---------------- */
  function showAuth() {
    document.getElementById('app-shell').hidden = true;
    const root = document.getElementById('auth-root');
    root.hidden = false;
    root.innerHTML =
      '<div class="auth-card">' +
        '<div class="auth-side">' +
          '<div class="brand"><span class="brand-mark">语</span><span class="brand-text" style="color:#fff">LinguaFlow</span></div>' +
          '<h2>沉浸式多语种<br>学习平台</h2>' +
          '<ul>' +
            '<li><span class="b">1</span><div>分级课程体系，英语 / 日语 / 韩语三大语种，CEFR · JLPT · TOPIK 对标进阶</div></li>' +
            '<li><span class="b">2</span><div>单词记忆、语法练习、口语跟读、听力训练四大互动模块</div></li>' +
            '<li><span class="b">3</span><div>间隔复习 + 学习进度追踪 + 个性化路径推荐</div></li>' +
            '<li><span class="b">4</span><div>共学社区与成就徽章，让坚持看得见</div></li>' +
          '</ul>' +
        '</div>' +
        '<div class="auth-main">' +
          '<div class="auth-tabs"><button data-tab="login" class="active">登录</button><button data-tab="reg">注册</button></div>' +
          '<div id="auth-err" class="auth-error"></div>' +
          '<div id="auth-fields"></div>' +
          '<div id="auth-actions"></div>' +
          '<div class="auth-hint">数据保存在浏览器本地（localStorage），仅用于演示。</div>' +
        '</div>' +
      '</div>';

    let tab = 'login';
    const fields = root.querySelector('#auth-fields');
    const actions = root.querySelector('#auth-actions');
    const err = root.querySelector('#auth-err');

    function renderFields() {
      if (tab === 'login') {
        fields.innerHTML =
          label('邮箱', '<input id="f-email" type="email" placeholder="you@example.com" autocomplete="username">') +
          label('密码', '<input id="f-pass" type="password" placeholder="至少 6 位" autocomplete="current-password">');
        actions.innerHTML = '<button class="btn btn-primary btn-block btn-lg" id="do-login">登录</button>' +
          '<button class="btn btn-ghost btn-block" id="do-demo" style="margin-top:10px">使用体验账号进入（含演示数据）</button>';
        actions.querySelector('#do-login').onclick = () => {
          try { ST.login(val('f-email'), val('f-pass')); enter(); }
          catch (e) { err.textContent = e.message; }
        };
        actions.querySelector('#do-demo').onclick = () => { ST.loginDemo(); enter(); };
      } else {
        fields.innerHTML =
          label('昵称', '<input id="f-name" type="text" placeholder="怎么称呼你？">') +
          label('邮箱', '<input id="f-email" type="email" placeholder="you@example.com">') +
          label('密码', '<input id="f-pass" type="password" placeholder="至少 6 位">') +
          '<div class="row" style="gap:12px">' +
            '<div class="field grow"><label>想学的语言</label><select id="f-lang">' +
              D.languages.map(l => '<option value="' + l.code + '">' + l.flag + ' ' + esc(l.name) + '</option>').join('') + '</select></div>' +
            '<div class="field grow"><label>当前等级</label><select id="f-level"></select></div>' +
          '</div>' +
          '<div class="field"><label>每日目标</label><select id="f-goal"><option value="10">10 XP · 轻量</option><option value="20" selected>20 XP · 常规</option><option value="30">30 XP · 认真</option><option value="50">50 XP · 进阶</option></select></div>';
        const langSel = fields.querySelector('#f-lang'), lvlSel = fields.querySelector('#f-level');
        function fillLevels() { lvlSel.innerHTML = D.getLevels(langSel.value).map(lv => '<option value="' + lv.id + '">' + esc(lv.label) + ' ' + esc(lv.name) + '</option>').join(''); }
        langSel.onchange = fillLevels; fillLevels();
        actions.innerHTML = '<button class="btn btn-primary btn-block btn-lg" id="do-reg">创建账号并开始学习</button>';
        actions.querySelector('#do-reg').onclick = () => {
          try {
            ST.register({ name: val('f-name'), email: val('f-email'), password: val('f-pass'), lang: langSel.value, level: lvlSel.value, goal: parseInt(fields.querySelector('#f-goal').value, 10) });
            enter();
          } catch (e) { err.textContent = e.message; }
        };
      }
    }
    function label(t, html) { return '<div class="field"><label>' + t + '</label>' + html + '</div>'; }
    function val(id) { const el = root.querySelector('#' + id); return el ? el.value : ''; }

    root.querySelectorAll('.auth-tabs button').forEach(b => b.onclick = () => {
      tab = b.getAttribute('data-tab'); err.textContent = '';
      root.querySelectorAll('.auth-tabs button').forEach(x => x.classList.toggle('active', x === b));
      renderFields();
    });
    renderFields();
  }

  function enter() {
    document.getElementById('auth-root').hidden = true;
    document.getElementById('app-shell').hidden = false;
    if (location.hash === '' || location.hash === '#') location.hash = '#/';
    else route();
    if (location.hash === '#/') route();
    refreshChrome();
    toast('欢迎回来，' + ST.current().name + '！', 'ok');
  }

  /* ---------------- 路由 ---------------- */
  function route() {
    if (!ST.isLoggedIn()) { showAuth(); return; }
    document.getElementById('app-shell').hidden = false;
    document.getElementById('auth-root').hidden = true;
    const seg = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    let name = seg[0] || 'home';
    if (name === 'login') { location.hash = '#/'; return; }
    const map = {
      home: { v: V.home, p: {} },
      courses: { v: V.courses, p: {} },
      course: { v: V.course, p: { lang: seg[1], level: seg[2] } },
      lesson: { v: V.lesson, p: { lang: seg[1], level: seg[2], lessonId: seg[3] } },
      practice: { v: V.practice, p: { lang: seg[1], level: seg[2], module: seg[3] } },
      progress: { v: V.progress, p: {} },
      path: { v: V.path, p: {} },
      community: { v: V.community, p: {} },
      achievements: { v: V.achievements, p: {} },
      profile: { v: V.profile, p: {} }
    };
    const r = map[name] || map.home;
    if (!map[name]) name = 'home';
    const meta = r.v.meta ? r.v.meta(r.p) : { title: '', sub: '' };
    setTitle(meta.title, meta.sub);
    renderNav(name);
    const view = document.getElementById('view');
    view.innerHTML = '';
    try { r.v.render(view, r.p, app); }
    catch (e) { console.error(e); view.innerHTML = '<div class="empty"><div class="big">⚠️</div><p>页面渲染出错：' + esc(e.message) + '</p></div>'; }
    refreshChrome();
    window.scrollTo(0, 0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout-btn').onclick = () => { ST.logout(); location.hash = ''; showAuth(); };
    window.addEventListener('hashchange', route);
    route();
  });
})();
