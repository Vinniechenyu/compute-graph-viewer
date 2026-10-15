/* LinguaFlow · 课程组装器：把 LL_RAW 组装为 LL_DATA（语言 → 等级 → 单元 → 课时 → 练习） */
window.LL_DATA = (function () {
  'use strict';
  const RAW = window.LL_RAW || {};

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  const UNIT_META = {
    vocab: { title: '核心词汇', icon: '📖', desc: '高频词记忆卡片，支持间隔复习评级' },
    grammar: { title: '语法精讲', icon: '✍️', desc: '要点讲解 + 即时选择题检验' },
    listening: { title: '听力训练', icon: '🎧', desc: '语音播放 + 理解题，可反复精听' },
    speaking: { title: '口语跟读', icon: '🎙️', desc: '示范朗读 + 录音比对，练习发音' }
  };

  function buildLevel(lang, lv) {
    const full = RAW.vocab[lang] || [];
    const V = full.filter(x => x.lvl === lv.id);
    const G = (RAW.grammar[lang] || []).filter(x => x.lvl === lv.id);
    const L = (RAW.listening[lang] || []).filter(x => x.lvl === lv.id);
    const S = (RAW.speaking[lang] || []).filter(x => x.lvl === lv.id);

    const vocabLessons = chunk(V, 4).map((group, i) => ({
      id: `${lang}-${lv.id}-vocab-${i + 1}`,
      title: `词汇 · 第 ${i + 1} 组`,
      type: 'vocab',
      exercises: group.map((w, j) => ({
        type: 'vocab', lang,
        id: `${lang}-${lv.id}-vocab-${i + 1}-${j + 1}`,
        wordId: `${lang}-w-${full.indexOf(w)}`,
        word: w.word, reading: w.reading || '', meaning: w.meaning, example: w.example, exZh: w.exZh
      }))
    }));

    const grammarLessons = G.map((g, i) => ({
      id: `${lang}-${lv.id}-gram-${i + 1}`,
      title: g.point,
      type: 'grammar',
      exercises: g.quiz.map((q, j) => ({
        type: 'grammar', lang,
        id: `${lang}-${lv.id}-gram-${i + 1}-${j + 1}`,
        point: g.point, rule: g.rule, example: g.example, exZh: g.exZh,
        q: q.q, choices: q.choices, answer: q.answer, explain: q.explain
      }))
    }));

    const listeningLessons = L.map((l, i) => ({
      id: `${lang}-${lv.id}-lis-${i + 1}`,
      title: `听力 · 第 ${i + 1} 组`,
      type: 'listening',
      exercises: [{
        type: 'listening', lang,
        id: `${lang}-${lv.id}-lis-${i + 1}-1`,
        text: l.text, question: l.question, choices: l.choices, answer: l.answer
      }]
    }));

    const speakingLessons = S.map((s, i) => ({
      id: `${lang}-${lv.id}-spk-${i + 1}`,
      title: `跟读 · 第 ${i + 1} 组`,
      type: 'speaking',
      exercises: [{
        type: 'speaking', lang,
        id: `${lang}-${lv.id}-spk-${i + 1}-1`,
        text: s.text, translation: s.translation, phonetic: s.phonetic || '', reading: s.reading || ''
      }]
    }));

    const mkUnit = (key, lessons) => ({
      id: `${lang}-${lv.id}-${key}`,
      kind: key,
      title: UNIT_META[key].title,
      icon: UNIT_META[key].icon,
      desc: UNIT_META[key].desc,
      lessons
    });

    const units = [
      mkUnit('vocab', vocabLessons),
      mkUnit('grammar', grammarLessons),
      mkUnit('listening', listeningLessons),
      mkUnit('speaking', speakingLessons)
    ].filter(u => u.lessons.length);

    const lessons = units.reduce((acc, u) => acc.concat(u.lessons.map(ls => Object.assign({ unitId: u.id }, ls))), []);
    return { id: `${lang}-${lv.id}`, lang, level: lv.id, units, lessons };
  }

  const curriculum = {};
  (RAW.languages || []).forEach(lang => {
    curriculum[lang.code] = {};
    lang.levels.forEach(lv => { curriculum[lang.code][lv.id] = buildLevel(lang.code, lv); });
  });

  /* ---------------- 查询辅助 ---------------- */
  function getLanguage(code) { return (RAW.languages || []).find(l => l.code === code) || null; }
  function getLevels(code) { const l = getLanguage(code); return l ? l.levels : []; }
  function getLevelDef(code, lvl) { return getLevels(code).find(l => l.id === lvl) || null; }
  function getLevelTree(code, lvl) { return (curriculum[code] || {})[lvl] || null; }
  function getLesson(code, lvl, lessonId) {
    const tree = getLevelTree(code, lvl);
    if (!tree) return null;
    return tree.lessons.find(l => l.id === lessonId) || null;
  }
  function getUnitOfLesson(code, lvl, lessonId) {
    const tree = getLevelTree(code, lvl);
    if (!tree) return null;
    return tree.units.find(u => u.lessons.some(l => l.id === lessonId)) || null;
  }
  function masterWords(code) {
    return (RAW.vocab[code] || []).map((w, i) => Object.assign({ id: `${code}-w-${i}`, lang: code }, w));
  }
  function totalLessons() {
    let n = 0;
    Object.keys(curriculum).forEach(c => Object.keys(curriculum[c]).forEach(l => { n += curriculum[c][l].lessons.length; }));
    return n;
  }
  function practicePool(code, lvl, type) {
    const tree = getLevelTree(code, lvl);
    if (!tree) return [];
    const unit = tree.units.find(u => u.kind === type);
    if (!unit) return [];
    return unit.lessons.reduce((acc, l) => acc.concat(l.exercises), []);
  }

  return {
    languages: RAW.languages || [],
    curriculum,
    achievements: RAW.achievements || [],
    topics: RAW.topics || [],
    posts: RAW.posts || [],
    levelTypes: ['vocab', 'grammar', 'listening', 'speaking'],
    unitMeta: UNIT_META,
    getLanguage, getLevels, getLevelDef, getLevelTree, getLesson, getUnitOfLesson,
    masterWords, totalLessons, practicePool
  };
})();
