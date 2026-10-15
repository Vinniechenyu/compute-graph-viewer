/* LinguaFlow · 互动练习播放器：单词记忆 / 语法练习 / 听力训练 / 口语跟读 */
window.LL_PLAYER = (function () {
  'use strict';
  const S = window.LL_SPEECH, ST = window.LL_STORE;
  const LABEL = { vocab: '单词记忆', grammar: '语法练习', listening: '听力训练', speaking: '口语跟读' };
  const ICON = { vocab: '📖', grammar: '✍️', listening: '🎧', speaking: '🎙️' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function fontClass(lang) { return lang === 'ja' ? 'jp' : lang === 'ko' ? 'ko' : ''; }

  function mount(container, opts) {
    const ex = (opts.exercises || []).slice();
    const total = ex.length;
    const state = { idx: 0, score: 0, results: [] };
    if (!total) { container.innerHTML = '<div class="empty"><div class="big">🎈</div><p>暂无可练习的内容</p></div>'; return; }

    container.innerHTML =
      '<div class="player-head">' +
        '<span class="exercise-type"><span class="dot" id="picon">' + ICON[ex[0].type] + '</span><span id="plabel">' + LABEL[ex[0].type] + '</span></span>' +
        '<div class="lesson-steps" id="psteps"></div>' +
      '</div>' +
      '<div class="player-body" id="pbody"></div>' +
      '<div class="player-foot"><div id="pfeed" class="grow"></div><div id="pact" class="row"></div></div>';

    const $body = container.querySelector('#pbody');
    const $feed = container.querySelector('#pfeed');
    const $act = container.querySelector('#pact');
    const $steps = container.querySelector('#psteps');
    const $icon = container.querySelector('#picon');
    const $label = container.querySelector('#plabel');

    function renderSteps() {
      let html = '';
      for (let i = 0; i < total; i++) html += '<span class="step-dot ' + (i < state.idx ? 'done' : i === state.idx ? 'active' : '') + '"></span>';
      $steps.innerHTML = html;
    }
    function clearAct() { $act.innerHTML = ''; }
    function feedback(kind, html) { $feed.innerHTML = '<div class="feedback ' + kind + '">' + html + '</div>'; }
    function clearFeed() { $feed.innerHTML = ''; }
    function addBtn(label, cls, onClick) {
      const b = document.createElement('button');
      b.className = 'btn ' + (cls || 'btn-primary');
      b.textContent = label;
      b.onclick = onClick;
      $act.appendChild(b);
      return b;
    }

    function next() {
      state.idx++;
      if (state.idx >= total) { summary(); return; }
      render();
    }

    function render() {
      const e = ex[state.idx];
      $icon.textContent = ICON[e.type]; $label.textContent = LABEL[e.type];
      clearFeed(); clearAct(); renderSteps();
      $body.innerHTML = '';
      if (e.type === 'vocab') renderVocab(e);
      else if (e.type === 'grammar') renderGrammar(e);
      else if (e.type === 'listening') renderListening(e);
      else if (e.type === 'speaking') renderSpeaking(e);
    }

    /* ---------- 单词记忆：卡片翻转 + SRS 评级 ---------- */
    function renderVocab(e) {
      const fc = fontClass(e.lang);
      $body.innerHTML =
        '<div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:10px">' +
          '<div class="prompt-word ' + fc + '">' + esc(e.word) + '</div>' +
          (e.reading ? '<div class="prompt-reading">' + esc(e.reading) + '</div>' : '') +
          '<button class="btn btn-ghost btn-sm" id="pvtts">🔊 朗读</button>' +
          '<div class="flashcard" id="pcard"><div class="hint">点击卡片查看释义与例句</div></div>' +
        '</div>';
      $body.querySelector('#pvtts').onclick = ev => { ev.stopPropagation(); S.speak(e.word, e.lang); };
      const card = $body.querySelector('#pcard');
      let revealed = false;
      card.onclick = () => {
        if (revealed) return;
        revealed = true;
        card.classList.add('revealed');
        card.innerHTML = '<div style="text-align:center">' +
          '<div style="font-size:26px;font-weight:800">' + esc(e.meaning) + '</div>' +
          '<div style="margin-top:14px;font-size:15px;color:var(--fg-2)">' + esc(e.example) + '</div>' +
          '<div style="margin-top:4px;font-size:13px;color:var(--fg-3)">' + esc(e.exZh) + '</div>' +
        '</div>';
        clearAct();
        addBtn('认识', 'btn-ok', () => rate(e, 'good'));
        addBtn('模糊', 'btn-ghost', () => rate(e, 'ok'));
        addBtn('不认识', 'btn-ghost', () => rate(e, 'bad'));
      };
    }
    function rate(e, rating) {
      const good = rating === 'good';
      S.speak(e.word, e.lang);
      if (good) state.score++;
      state.results.push({ id: e.id, correct: good });
      const fresh = ST.rateWord(e.wordId || e.id, rating, e.lang) || [];
      if (fresh.length) fresh.forEach(a => window.LL_APP.toast('🏅 解锁成就：' + a.title, 'gold'));
      feedback(good ? 'ok' : 'no', good ? '👍 已记住，进入下一个' : '已加入复习队列');
      clearAct();
      setTimeout(next, good ? 380 : 700);
    }

    /* ---------- 语法练习：讲解 + 选择题 ---------- */
    function renderGrammar(e) {
      $body.innerHTML =
        '<div style="width:min(560px,100%);text-align:left;display:flex;flex-direction:column;gap:12px">' +
          '<div class="card card-pad" style="background:var(--brand-soft);border-color:#d9dbff">' +
            '<div class="chip chip-brand" style="margin-bottom:8px">语法要点</div>' +
            '<h4 style="font-size:16px">' + esc(e.point) + '</h4>' +
            '<p style="margin-top:6px;font-size:14px;color:var(--fg-2)">' + esc(e.rule) + '</p>' +
            '<p style="margin-top:8px;font-size:14px">' + esc(e.example) + '<span class="muted">　' + esc(e.exZh) + '</span></p>' +
          '</div>' +
          '<div style="text-align:center;font-size:16px;font-weight:700;margin-top:4px">' + esc(e.q) + '</div>' +
          '<div class="choice-list" id="pchoices"></div>' +
        '</div>';
      const box = $body.querySelector('#pchoices');
      const keys = ['A', 'B', 'C', 'D'];
      let answered = false;
      e.choices.forEach((c, i) => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.innerHTML = '<span class="key">' + keys[i] + '</span><span>' + esc(c) + '</span>';
        b.onclick = () => {
          if (answered) return; answered = true;
          const ok = i === e.answer;
          b.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) box.children[e.answer].classList.add('correct');
          state.results.push({ id: e.id, correct: ok });
          if (ok) state.score++;
          ST.recordAnswer(e.lang, 'grammar', ok);
          ST.commit();
          const fresh = ST.checkAchievements();
          fresh.forEach(a => window.LL_APP.toast('🏅 解锁成就：' + a.title, 'gold'));
          feedback(ok ? 'ok' : 'no', (ok ? '✅ 回答正确　' : '❌ 正确答案：' + esc(e.choices[e.answer]) + '　') + '<span class="exp">' + esc(e.explain) + '</span>');
          clearAct();
          addBtn(state.idx + 1 >= total ? '完成练习' : '下一题', 'btn-primary', next);
        };
        box.appendChild(b);
      });
      addBtn('跳过本题', 'btn-ghost', () => { state.results.push({ id: e.id, correct: false }); next(); });
    }

    /* ---------- 听力训练：语音播放 + 理解题 ---------- */
    function renderListening(e) {
      let plays = 0;
      $body.innerHTML =
        '<div style="width:min(560px,100%);display:flex;flex-direction:column;gap:14px;align-items:center">' +
          '<button class="mic-btn" id="plisten" style="width:80px;height:80px;font-size:28px">🔊</button>' +
          '<div class="muted" id="pplayinfo">点击播放音频（可反复精听）</div>' +
          '<div style="font-size:16px;font-weight:700">' + esc(e.question) + '</div>' +
          '<div class="choice-list" id="pchoices" style="text-align:left"></div>' +
        '</div>';
      const info = $body.querySelector('#pplayinfo');
      const btn = $body.querySelector('#plisten');
      btn.onclick = () => { plays++; info.textContent = '已播放 ' + plays + ' 次' + (plays >= 3 ? '（已精听多次）' : ''); S.speak(e.text, e.lang, { rate: plays > 1 ? 0.8 : 0.95 }); };
      const box = $body.querySelector('#pchoices');
      const keys = ['A', 'B', 'C', 'D'];
      let answered = false;
      e.choices.forEach((c, i) => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.innerHTML = '<span class="key">' + keys[i] + '</span><span>' + esc(c) + '</span>';
        b.onclick = () => {
          if (answered) return; answered = true;
          const ok = i === e.answer;
          b.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) box.children[e.answer].classList.add('correct');
          state.results.push({ id: e.id, correct: ok });
          if (ok) state.score++;
          ST.recordAnswer(e.lang, 'listening', ok);
          ST.commit();
          ST.checkAchievements().forEach(a => window.LL_APP.toast('🏅 解锁成就：' + a.title, 'gold'));
          feedback(ok ? 'ok' : 'no', (ok ? '✅ 听懂啦　' : '❌ 再看一眼　') + '<span class="exp">原文：' + esc(e.text) + '</span>');
          clearAct();
          addBtn(state.idx + 1 >= total ? '完成练习' : '下一题', 'btn-primary', next);
        };
        box.appendChild(b);
      });
    }

    /* ---------- 口语跟读：示范 + 录音比对 ---------- */
    function renderSpeaking(e) {
      const fc = fontClass(e.lang);
      $body.innerHTML =
        '<div class="speak-stage" style="width:min(560px,100%)">' +
          '<div class="chip chip-pink">跟读下面这句话</div>' +
          '<div style="font-size:26px;font-weight:800" class="' + fc + '">' + esc(e.text) + '</div>' +
          (e.phonetic ? '<div class="prompt-reading">' + esc(e.phonetic) + '</div>' : '') +
          '<div class="muted">' + esc(e.translation) + '</div>' +
          '<div class="row" style="gap:12px;margin-top:6px">' +
            '<button class="btn btn-ghost" id="pmodel">🔊 听示范</button>' +
            '<button class="mic-btn" id="pmic" style="width:72px;height:72px;font-size:26px">🎙️</button>' +
          '</div>' +
          '<div class="muted" id="pheard"></div>' +
          '<div id="pscore"></div>' +
        '</div>';
      const heard = $body.querySelector('#pheard');
      const mic = $body.querySelector('#pmic');
      const scoreBox = $body.querySelector('#pscore');
      $body.querySelector('#pmodel').onclick = () => S.speak(e.text, e.lang, { rate: 0.85 });

      let answered = false;
      function finish(pct, saidText) {
        if (answered) return; answered = true;
        const fb = S.feedbackFor(pct);
        const ok = pct >= 75;
        if (ok) state.score++;
        state.results.push({ id: e.id, correct: ok });
        ST.recordAnswer(e.lang, 'speaking', ok);
        ST.commit();
        ST.checkAchievements().forEach(a => window.LL_APP.toast('🏅 解锁成就：' + a.title, 'gold'));
        scoreBox.innerHTML = '<div style="font-size:40px;font-weight:800;color:' + (ok ? 'var(--ok)' : 'var(--warn)') + '">' + pct + '<small style="font-size:16px">分</small></div>';
        if (saidText) heard.textContent = '识别到：' + saidText;
        feedback(ok ? 'ok' : 'no', esc(fb.text));
        clearAct();
        addBtn('再读一次', 'btn-ghost', () => { answered = false; scoreBox.innerHTML = ''; heard.textContent = ''; clearFeed(); clearAct(); renderSpeaking(e); });
        addBtn(state.idx + 1 >= total ? '完成练习' : '下一题', 'btn-primary', next);
      }

      if (!S.asrAvailable()) {
        mic.onclick = () => {
          S.speak(e.text, e.lang, { rate: 0.85 });
          feedback('no', '当前浏览器不支持语音识别，请跟随示范朗读后自我评估。');
          clearAct();
          addBtn('读得很准 👍', 'btn-ok', () => finish(92, ''));
          addBtn('还需要练习', 'btn-ghost', () => finish(60, ''));
        };
        return;
      }
      mic.onclick = () => {
        mic.classList.add('listening');
        heard.textContent = '正在聆听…';
        S.speak(e.text, e.lang, { rate: 0.85 });
        const ctrl = S.recognize(e.lang, {
          onPartial: t => { heard.textContent = '识别中：' + t; },
          onResult: (t) => { mic.classList.remove('listening'); finish(S.score(e.text, t, e.lang), t); },
          onError: () => {
            mic.classList.remove('listening');
            feedback('no', '未能获取麦克风（可能被浏览器拦截），已切换为自我评估。');
            clearAct();
            addBtn('读得很准 👍', 'btn-ok', () => finish(90, ''));
            addBtn('还需要练习', 'btn-ghost', () => finish(58, ''));
          },
          onEnd: () => mic.classList.remove('listening')
        });
        if (!ctrl.supported) mic.classList.remove('listening');
      };
    }

    /* ---------- 结算 ---------- */
    function summary() {
      const pct = Math.round(state.score / total * 100);
      $icon.textContent = '🏁'; $label.textContent = '本课完成';
      $body.innerHTML = '<div style="text-align:center">' +
        '<div style="font-size:56px">' + (pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪') + '</div>' +
        '<div style="font-size:30px;font-weight:800;margin-top:8px">' + state.score + ' / ' + total + '</div>' +
        '<div class="muted" style="margin-top:6px">正确率 ' + pct + '%</div>' +
      '</div>';
      clearFeed(); clearAct();
      addBtn('再练一次', 'btn-ghost', () => { state.idx = 0; state.score = 0; state.results = []; render(); });
      if (opts.onRepeat) { /* 视图自行处理 */ }
      if (opts.onComplete) {
        const b = addBtn(opts.onExitLabel || '返回课程', 'btn-primary', () => opts.onExit && opts.onExit());
        opts.onComplete(state.score, total);
      } else {
        addBtn('返回', 'btn-primary', () => opts.onExit && opts.onExit());
      }
    }

    render();
  }

  return { mount, LABEL, ICON };
})();
