/* LinguaFlow · 本地持久化 / 用户认证 / 学习进度引擎
   localStorage 单库存储：{ users: [...], session: uid }，每个 user 内嵌 progress。 */
window.LL_STORE = (function () {
  'use strict';
  const DB_KEY = 'linguaflow.db.v1';
  const COLORS = ['#5b5bd6', '#e0599a', '#1f9d63', '#d98a11', '#6a4fc4', '#2f7fd0', '#c2410c', '#0e7490'];

  /* 排行榜陪跑选手（用于激励系统展示） */
  const RIVALS = [
    { name: 'Yuki_李', xp: 1680, streak: 23, color: '#e0599a' },
    { name: 'Kevin.W', xp: 1420, streak: 46, color: '#2f7fd0' },
    { name: '韩语小鹿', xp: 1210, streak: 12, color: '#1f9d63' },
    { name: 'Anna_陈', xp: 980, streak: 9, color: '#6a4fc4' },
    { name: 'Marco.G', xp: 760, streak: 5, color: '#d98a11' }
  ];

  let DB = null;

  function load() {
    if (DB) return DB;
    try { DB = JSON.parse(localStorage.getItem(DB_KEY)) || null; } catch (e) { DB = null; }
    if (!DB || !Array.isArray(DB.users)) DB = { users: [], session: null };
    return DB;
  }
  function persist() { try { localStorage.setItem(DB_KEY, JSON.stringify(DB)); } catch (e) {} }

  function uid() { return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function todayKey(d) { const t = d || new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
  function dayOffset(a, b) {
    const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }
  function hash(str) { // 仅用于本地演示，非安全加密
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(36);
  }
  function colorFor(seed) { let n = 0; for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % COLORS.length; return COLORS[n]; }

  function defaultProgress(onboard) {
    onboard = onboard || {};
    return {
      createdAt: Date.now(),
      xp: 0,
      streak: 0,
      lastActive: null,
      goal: onboard.goal || 20,
      primaryLang: onboard.lang || 'en',
      primaryLevel: onboard.level || 'A1',
      lessons: {},          // lessonId -> { ts, score, total }
      words: {},            // wordId -> { box, due, seen, correct }
      stats: {
        answered: 0, correct: 0, perfectRuns: 0,
        byType: { vocab: { a: 0, c: 0 }, grammar: { a: 0, c: 0 }, listening: { a: 0, c: 0 }, speaking: { a: 0, c: 0 } },
        byLang: {},         // lang -> { answered, correct, lessons }
      },
      days: {},             // 'YYYY-MM-DD' -> xp
      activity: [],         // [{ ts, text, icon }]
      unlocked: {},         // achievementId -> ts
      posts: [],            // 用户发布的帖子
      likes: []             // 用户点赞的种子帖 id
    };
  }

  /* ---------------- 认证 ---------------- */
  function register(info) {
    load();
    const email = (info.email || '').trim().toLowerCase();
    if (!info.name || !email || !info.password) throw new Error('请填写完整信息');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('邮箱格式不正确');
    if (DB.users.some(u => u.email === email)) throw new Error('该邮箱已注册，请直接登录');
    if ((info.password || '').length < 6) throw new Error('密码至少 6 位');
    const user = {
      id: uid(), name: info.name.trim(), email,
      pass: hash(email + '::' + info.password),
      color: colorFor(email),
      progress: defaultProgress({ lang: info.lang, level: info.level, goal: info.goal })
    };
    DB.users.push(user);
    DB.session = user.id;
    persist();
    return user;
  }

  function login(email, password) {
    load();
    email = (email || '').trim().toLowerCase();
    const user = DB.users.find(u => u.email === email);
    if (!user) throw new Error('账号不存在，请先注册');
    if (user.pass !== hash(email + '::' + password)) throw new Error('密码不正确');
    DB.session = user.id;
    persist();
    return user;
  }

  function loginDemo() {
    load();
    let user = DB.users.find(u => u.email === 'demo@linguaflow.io');
    if (!user) {
      user = {
        id: uid(), name: '体验同学', email: 'demo@linguaflow.io',
        pass: hash('demo@linguaflow.io::demo123'), color: '#5b5bd6',
        progress: defaultProgress({ lang: 'ja', level: 'N4', goal: 30 })
      };
      seedDemo(user);
      DB.users.push(user);
    }
    DB.session = user.id;
    persist();
    return user;
  }

  function seedDemo(user) {
    const p = user.progress;
    p.xp = 640; p.streak = 6;
    const dates = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dates.push(todayKey(d)); }
    dates.forEach((k, i) => { p.days[k] = 20 + Math.round(Math.sin(i) * 10) + i * 4; });
    p.lastActive = todayKey();
    ['ja-N4-vocab-1', 'ja-N4-vocab-2', 'ja-N4-gram-1', 'ja-N4-lis-1'].forEach(id => { p.lessons[id] = { ts: Date.now(), score: 4, total: 4 }; });
    ['en-A2-vocab-1', 'en-A2-lis-1'].forEach(id => { p.lessons[id] = { ts: Date.now(), score: 3, total: 4 }; });
    for (let i = 0; i < 22; i++) p.words['ja-w-' + i] = { box: 3 + (i % 3), due: Date.now(), seen: 4, correct: 3 };
    for (let i = 0; i < 9; i++) p.words['en-w-' + i] = { box: 3 + (i % 2), due: Date.now(), seen: 3, correct: 3 };
    p.stats.answered = 96; p.stats.correct = 81; p.stats.perfectRuns = 5;
    p.stats.byType.grammar = { a: 24, c: 20 };
    p.stats.byType.listening = { a: 14, c: 11 };
    p.stats.byType.speaking = { a: 12, c: 10 };
    p.stats.byType.vocab = { a: 46, c: 40 };
    p.stats.byLang = { ja: { answered: 60, correct: 51, lessons: 4 }, en: { answered: 36, correct: 30, lessons: 2 } };
    p.activity = [
      { ts: Date.now() - 3600e3, icon: '📖', text: '完成《词汇 · 第 2 组》' },
      { ts: Date.now() - 7200e3, icon: '🎧', text: '完成 1 次听力训练' },
      { ts: Date.now() - 86400e3, icon: '🔥', text: '连续打卡 6 天' }
    ];
    ['first_lesson', 'streak_3', 'vocab_20', 'grammar_10', 'perfect'].forEach(id => { p.unlocked[id] = Date.now(); });
    // 让演示账号的等级进度看起来自然
    p.primaryLang = 'ja'; p.primaryLevel = 'N4';
  }

  function logout() { load(); DB.session = null; persist(); }
  function current() { load(); return DB.users.find(u => u.id === DB.session) || null; }
  function isLoggedIn() { return !!current(); }

  /* ---------------- 进度读写 ---------------- */
  function progress() {
    const u = current();
    if (!u) return null;
    if (!u.progress) u.progress = defaultProgress({});
    return u.progress;
  }
  function commit() { load(); persist(); }

  function touchStreak() {
    const p = progress(); if (!p) return;
    const today = todayKey();
    if (p.lastActive === today) return;
    if (p.lastActive && dayOffset(p.lastActive, today) === 1) p.streak += 1;
    else p.streak = 1;
    p.lastActive = today;
  }
  function addXp(n) {
    const p = progress(); if (!p) return;
    p.xp += n;
    const t = todayKey();
    p.days[t] = (p.days[t] || 0) + n;
  }
  function logActivity(icon, text) {
    const p = progress(); if (!p) return;
    p.activity.unshift({ ts: Date.now(), icon, text });
    if (p.activity.length > 40) p.activity.length = 40;
  }

  const XP = { vocab: { good: 8, ok: 4, bad: 1 }, grammar: 10, listening: 10, speaking: 12 };

  function recordAnswer(lang, type, correct) {
    const p = progress(); if (!p) return;
    p.stats.answered += 1;
    if (correct) p.stats.correct += 1;
    const bt = p.stats.byType[type] || (p.stats.byType[type] = { a: 0, c: 0 });
    bt.a += 1; if (correct) bt.c += 1;
    const bl = p.stats.byLang[lang] || (p.stats.byLang[lang] = { answered: 0, correct: 0, lessons: 0 });
    bl.answered += 1; if (correct) bl.correct += 1;
  }

  function rateWord(wordId, rating, lang) {
    const p = progress(); if (!p) return;
    const w = p.words[wordId] || { box: 1, due: 0, seen: 0, correct: 0 };
    w.seen += 1;
    if (rating === 'good') { w.box = Math.min(5, w.box + 1); w.correct += 1; }
    else if (rating === 'bad') { w.box = Math.max(1, w.box - 1); }
    const intervals = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 15 };
    w.due = Date.now() + (intervals[w.box] || 1) * 86400e3;
    p.words[wordId] = w;
    recordAnswer(lang || p.primaryLang, 'vocab', rating === 'good');
    addXp(XP.vocab[rating] || 1);
    touchStreak();
    logActivity('📖', rating === 'good' ? '记住了 1 个单词' : '复习了 1 个单词');
    commit();
    return checkAchievements();
  }

  function completeLesson(lang, lessonId, score, total) {
    const p = progress(); if (!p) return [];
    const first = !p.lessons[lessonId];
    p.lessons[lessonId] = { ts: Date.now(), score, total };
    const bl = p.stats.byLang[lang] || (p.stats.byLang[lang] = { answered: 0, correct: 0, lessons: 0 });
    if (first) bl.lessons += 1;
    if (score === total && total > 0) p.stats.perfectRuns += 1;
    addXp(score === total ? 30 : 18);
    touchStreak();
    logActivity('✅', '完成《' + (score === total ? '满分' : '') + '课时》');
    commit();
    return checkAchievements();
  }

  function setPrimary(lang, level) {
    const p = progress(); if (!p) return;
    p.primaryLang = lang; if (level) p.primaryLevel = level;
    commit();
  }
  function setGoal(g) { const p = progress(); if (!p) return; p.goal = g; commit(); }

  /* ---------------- 社区 ---------------- */
  function seedPostId(i) { return 'seed-' + i; }
  function allPosts() {
    const seeded = (window.LL_DATA.posts || []).map((p, i) => ({
      id: seedPostId(i), seeded: true, author: p.author, color: p.avatar, topic: p.topic,
      body: p.body, time: p.time, baseLikes: p.seededLikes || p.likes || 0
    }));
    const u = current();
    const mine = u ? (u.progress.posts || []).map(p => Object.assign({ seeded: false, color: u.color, author: u.name }, p)) : [];
    return mine.concat(seeded);
  }
  function toggleLike(postId) {
    const p = progress(); if (!p) return;
    const i = p.likes.indexOf(postId);
    if (i >= 0) p.likes.splice(i, 1); else p.likes.push(postId);
    commit();
  }
  function addPost(topic, body) {
    const p = progress(); if (!p) return [];
    body = (body || '').trim();
    if (!body) return [];
    p.posts.unshift({ id: 'p_' + Date.now().toString(36), topic: topic || '每日一句', body, ts: Date.now(), likes: 0 });
    addXp(15); touchStreak();
    logActivity('💬', '发布了一条社区动态');
    commit();
    return checkAchievements();
  }
  function likeCount(post) {
    const p = progress();
    const mine = p && p.likes.indexOf(post.id) >= 0 ? 1 : 0;
    return (post.baseLikes || post.likes || 0) + mine;
  }
  function isLiked(postId) { const p = progress(); return !!(p && p.likes.indexOf(postId) >= 0); }

  /* ---------------- 成就 ---------------- */
  function statsSnapshot() {
    const p = progress();
    if (!p) return { vocabMastered: 0, byType: { vocab: {}, grammar: {}, listening: {}, speaking: {} }, languages: 0, perfectRuns: 0, posts: 0 };
    let mastered = 0;
    Object.keys(p.words).forEach(k => { if (p.words[k].box >= 3) mastered += 1; });
    const langs = Object.keys(p.stats.byLang).filter(k => p.stats.byLang[k].lessons > 0).length;
    return { vocabMastered: mastered, byType: p.stats.byType, languages: langs, perfectRuns: p.stats.perfectRuns, posts: (p.posts || []).length };
  }
  function checkAchievements() {
    const p = progress(); if (!p) return [];
    const ctx = { progress: { xp: p.xp, streak: p.streak, totals: { lessons: Object.keys(p.lessons).length } }, stats: statsSnapshot() };
    const fresh = [];
    (window.LL_DATA.achievements || []).forEach(a => {
      if (p.unlocked[a.id]) return;
      let ok = false;
      try { ok = !!a.check(ctx); } catch (e) { ok = false; }
      if (ok) { p.unlocked[a.id] = Date.now(); if (a.xp) addXp(a.xp); fresh.push(a); }
    });
    if (fresh.length) persist();
    return fresh;
  }
  function achievementList() {
    const p = progress();
    return (window.LL_DATA.achievements || []).map(a => ({ a, unlocked: !!(p && p.unlocked[a.id]) }));
  }

  function leaderboard() {
    const rows = RIVALS.map(r => ({ name: r.name, color: r.color, xp: r.xp, streak: r.streak, me: false }));
    const u = current();
    if (u) rows.push({ name: u.name, color: u.color, xp: u.progress.xp, streak: u.progress.streak, me: true });
    return rows.sort((a, b) => b.xp - a.xp);
  }

  function resetLocal() { DB = { users: [], session: null }; persist(); }

  return {
    register, login, loginDemo, logout, current, isLoggedIn,
    progress, commit, setPrimary, setGoal,
    rateWord, completeLesson, recordAnswer,
    allPosts, addPost, toggleLike, likeCount, isLiked,
    achievementList, checkAchievements, statsSnapshot, leaderboard,
    todayKey, resetLocal
  };
})();
