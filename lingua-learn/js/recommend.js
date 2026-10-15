/* LinguaFlow · 个性化学习路径推荐引擎
   基于：间隔复习到期词、技能正确率、进度连续性、每日目标、跨语言拓展。 */
window.LL_RECOMMEND = (function () {
  'use strict';
  const D = window.LL_DATA;

  function nextLesson(lang, level, progress) {
    const tree = D.getLevelTree(lang, level);
    if (!tree) return null;
    return tree.lessons.find(l => !progress.lessons[l.id]) || null;
  }

  function levelProgress(lang, level, progress) {
    const tree = D.getLevelTree(lang, level);
    if (!tree || !tree.lessons.length) return { done: 0, total: 0, pct: 0 };
    const done = tree.lessons.filter(l => progress.lessons[l.id]).length;
    return { done, total: tree.lessons.length, pct: Math.round(done / tree.lessons.length * 100) };
  }

  function accuracy(stats) {
    return stats.answered ? Math.round(stats.correct / stats.answered * 100) : 0;
  }

  function weakestSkill(progress) {
    const bt = progress.stats.byType;
    const rows = Object.keys(bt).map(k => ({ skill: k, a: bt[k].a, c: bt[k].c, acc: bt[k].a ? bt[k].c / bt[k].a : null }));
    const tried = rows.filter(r => r.a >= 3);
    if (!tried.length) return rows[0].skill;
    return tried.sort((a, b) => a.acc - b.acc)[0].skill;
  }

  const SKILL_LABEL = { vocab: '单词记忆', grammar: '语法练习', speaking: '口语跟读', listening: '听力训练' };

  function dueWords(progress, lang) {
    const now = Date.now();
    return Object.keys(progress.words).filter(id => {
      if (lang && id.indexOf(lang + '-') !== 0) return false;
      const w = progress.words[id];
      return !w.due || w.due <= now || w.box < 3;
    });
  }

  function goalToday(progress) {
    const xp = progress.days[LL_STORE.todayKey()] || 0;
    return { xp, goal: progress.goal, pct: Math.min(100, Math.round(xp / progress.goal * 100)) };
  }

  function build(progress) {
    const items = [];
    const lang = progress.primaryLang || 'en';
    const level = progress.primaryLevel || (D.getLevels(lang)[0] || {}).id;
    const langMeta = D.getLanguage(lang);
    const due = dueWords(progress);
    const gate = goalToday(progress);

    // 1) 到期复习
    if (due.length) {
      items.push({
        id: 'review', icon: '🔁', priority: 1,
        title: `复习 ${due.length} 个到期单词`,
        reason: '间隔复习算法判定这些词即将遗忘，现在复习收益最高。',
        cta: '开始复习',
        action: { type: 'practice', lang, level, module: 'vocab' }
      });
    }

    // 2) 继续主线课程
    const nl = nextLesson(lang, level, progress);
    const lp = levelProgress(lang, level, progress);
    if (nl) {
      items.push({
        id: 'continue', icon: '▶️', priority: 2,
        title: `继续《${nl.title}》`,
        reason: `${langMeta ? langMeta.name : lang} · ${level} 已完成 ${lp.pct}%，按顺序推进下一课。`,
        cta: '继续学习',
        action: { type: 'lesson', lang, level, lessonId: nl.id }
      });
    }

    // 3) 补强最弱技能
    const weak = weakestSkill(progress);
    const wa = progress.stats.byType[weak];
    items.push({
      id: 'weak', icon: '🎯', priority: 3,
      title: `补强${SKILL_LABEL[weak]}`,
      reason: wa.a >= 3 ? `该模块正确率仅 ${accuracy({ answered: wa.a, correct: wa.c })}%，是当前短板。` : '还没有该模块的练习记录，先建立基线。',
      cta: '去练习',
      action: { type: 'practice', lang, level, module: weak }
    });

    // 4) 今日目标未完成
    if (gate.pct < 100) {
      items.push({
        id: 'goal', icon: '⏱️', priority: 4,
        title: `今日目标还差 ${Math.max(0, gate.goal - gate.xp)} 经验`,
        reason: `今日已完成 ${gate.xp} / ${gate.goal} 经验。再完成一节短课即可达标。`,
        cta: '冲刺目标',
        action: { type: 'practice', lang, level, module: 'grammar' }
      });
    }

    // 5) 等级推进 / 跨语言拓展
    if (lp.pct >= 80 && lp.total) {
      const levels = D.getLevels(lang);
      const idx = levels.findIndex(l => l.id === level);
      const next = levels[idx + 1];
      if (next) items.push({
        id: 'next-level', icon: '🚀', priority: 5,
        title: `挑战 ${langMeta.name} ${next.label}（${next.name}）`,
        reason: `当前等级已完成 ${lp.pct}%，建议升级到「${next.desc}」。`,
        cta: '查看课程',
        action: { type: 'course', lang, level: next.id }
      });
    } else {
      const other = D.languages.find(l => !progress.stats.byLang[l.code] || progress.stats.byLang[l.code].lessons === 0);
      if (other) items.push({
        id: 'new-lang', icon: '🌍', priority: 6,
        title: `拓展新语种：${other.name}`,
        reason: `你还没有开始学${other.name}，同时学两门语言有助于建立语感迁移。`,
        cta: '了解一下',
        action: { type: 'course', lang: other.code, level: other.levels[0].id }
      });
    }

    return {
      lang, level, items: items.sort((a, b) => a.priority - b.priority),
      weakest: weak, dueCount: due.length, today: gate
    };
  }

  return { build, weakestSkill, nextLesson, levelProgress, goalToday, dueWords, SKILL_LABEL, accuracy };
})();
