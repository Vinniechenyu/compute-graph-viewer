/* LinguaFlow · 语音能力：朗读（TTS）与跟读识别（ASR）+ 发音评分 */
window.LL_SPEECH = (function () {
  'use strict';

  const LOCALE = { en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' };
  const synth = window.speechSynthesis || null;
  let voices = [];
  function refreshVoices() { voices = synth ? synth.getVoices() : []; }
  if (synth) { refreshVoices(); synth.onvoiceschanged = refreshVoices; }

  function ttsAvailable() { return !!synth; }
  function asrAvailable() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }

  function pickVoice(locale) {
    if (!voices.length) refreshVoices();
    const exact = voices.find(v => v.lang && v.lang.replace('_', '-').toLowerCase() === locale.toLowerCase());
    if (exact) return exact;
    const base = locale.split('-')[0].toLowerCase();
    return voices.find(v => v.lang && v.lang.toLowerCase().indexOf(base) === 0) || null;
  }

  /* 朗读文本；返回 Promise，在朗读结束或失败时 resolve */
  function speak(text, lang, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      if (!synth || !text) { resolve(false); return; }
      try { synth.cancel(); } catch (e) {}
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LOCALE[lang] || lang || 'en-US';
      const v = pickVoice(u.lang);
      if (v) u.voice = v;
      u.rate = opts.rate || 0.95;
      u.pitch = opts.pitch || 1;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      // 某些浏览器在长文本时需分段，这里保持简单
      synth.speak(u);
      // 兜底：若浏览器不触发 onend
      setTimeout(() => resolve(true), Math.max(1500, (text.length || 10) * 140));
    });
  }
  function stop() { if (synth) { try { synth.cancel(); } catch (e) {} } }

  /* 启动一次识别；返回 { stop() }。onResult(transcript, confidence) */
  function recognize(lang, handlers) {
    handlers = handlers || {};
    const Impl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Impl) { handlers.onError && handlers.onError('unavailable'); return { supported: false, stop() {} }; }
    const rec = new Impl();
    rec.lang = LOCALE[lang] || 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = '';
    rec.onresult = e => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      finalText = text;
      handlers.onPartial && handlers.onPartial(text);
      if (e.results[e.results.length - 1].isFinal) {
        handlers.onResult && handlers.onResult(text.trim(), e.results[e.results.length - 1][0].confidence);
      }
    };
    rec.onerror = e => { handlers.onError && handlers.onError(e.error || 'error'); };
    rec.onend = () => { handlers.onEnd && handlers.onEnd(finalText.trim()); };
    try { rec.start(); } catch (e) { handlers.onError && handlers.onError('start-failed'); }
    return { supported: true, stop() { try { rec.stop(); } catch (e) {} } };
  }

  /* 归一化：中文/日文/韩文去空格与标点后按字符比较；拉丁语言按词比较 */
  function normalize(text, lang) {
    let t = (text || '').toLowerCase().trim();
    t = t.replace(/[。、！？…，．,.!?;:'"“”‘’（）()\[\]「」『』·\-—]/g, '');
    if (lang === 'en') return t.split(/\s+/).filter(Boolean);
    return t.replace(/\s+/g, '').split('');
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0]; dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const tmp = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return dp[n];
  }

  /* 返回 0~100 的相似度分数 */
  function score(target, said, lang) {
    const A = normalize(target, lang), B = normalize(said, lang);
    if (!A.length) return 0;
    if (!B.length) return 0;
    const dist = levenshtein(A, B);
    let sim = 1 - dist / Math.max(A.length, B.length);
    // 目标词全部命中时给予加成
    const hit = A.filter(tok => B.indexOf(tok) >= 0).length / A.length;
    sim = sim * 0.6 + hit * 0.4;
    return Math.max(0, Math.min(100, Math.round(sim * 100)));
  }

  function feedbackFor(pct) {
    if (pct >= 90) return { level: 'excellent', text: '发音非常标准，接近母语者水平！' };
    if (pct >= 75) return { level: 'good', text: '很不错，个别音素还需打磨。' };
    if (pct >= 55) return { level: 'fair', text: '基本可辨识，注意语速与连读。' };
    return { level: 'poor', text: '再听一次示范，跟着节奏慢慢读。' };
  }

  return { speak, stop, recognize, score, feedbackFor, ttsAvailable, asrAvailable, locale: LOCALE };
})();
