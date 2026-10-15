/* LinguaFlow · 课程原始内容 C：听力 / 口语 / 成就 / 社区主题与种子帖 */
window.LL_RAW = window.LL_RAW || {};

window.LL_RAW.listening = {
  en: [
    { lvl: 'A1', text: 'Hello, my name is Tom. I am from Canada.', question: 'Where is Tom from?', choices: ['Canada', 'China', 'Japan', 'England'], answer: 0 },
    { lvl: 'A1', text: 'I usually get up at seven and eat breakfast at seven thirty.', question: 'What time does the speaker eat breakfast?', choices: ['7:00', '7:30', '8:00', '6:30'], answer: 1 },
    { lvl: 'A2', text: 'Last weekend I went to the beach with my family. The weather was sunny and warm.', question: 'How was the weather at the beach?', choices: ['Rainy', 'Sunny', 'Cold', 'Windy'], answer: 1 },
    { lvl: 'A2', text: 'Excuse me, could you tell me how to get to the train station?', question: 'What is the speaker looking for?', choices: ['A hotel', 'The train station', 'A restaurant', 'A bank'], answer: 1 },
    { lvl: 'B1', text: 'Although it was raining heavily, we decided to continue our hike because we had prepared raincoats.', question: 'Why did they continue the hike?', choices: ['They had raincoats', 'The rain stopped', 'They were lost', 'They liked rain'], answer: 0 },
    { lvl: 'B1', text: 'The company announced that it will hire fifty new engineers by the end of the year.', question: 'How many engineers will the company hire?', choices: ['15', '5', '50', '500'], answer: 2 },
    { lvl: 'B2', text: 'The professor argued that the proposal, though innovative, was not economically feasible given the current budget constraints.', question: "What is the professor's main concern?", choices: ['Innovation', 'Economic feasibility', 'Budget cuts', 'Timing'], answer: 1 },
    { lvl: 'B2', text: "Despite substantial investment, the project's results were ambiguous and failed to undermine the rival's position.", question: "What do we know about the project's results?", choices: ['Very clear', 'Ambiguous', 'Successful', 'Profitable'], answer: 1 },
    { lvl: 'C1', text: 'Had the committee scrutinized the data more pragmatically, they might have mitigated the risks that diverged from their forecasts.', question: 'What might have reduced the risks?', choices: ['More funding', 'A more pragmatic review', 'Faster decisions', 'New members'], answer: 1 },
    { lvl: 'C1', text: "The candid manager was paramount in ensuring that ubiquitous flaws did not undermine the team's credibility.", question: "What was the manager's key quality?", choices: ['Candor', 'Ambition', 'Caution', 'Charisma'], answer: 0 }
  ],
  ja: [
    { lvl: 'N5', text: 'こんにちは、私は田中です。東京から来ました。', question: '田中さんはどこから来ましたか。', choices: ['東京', '大阪', '京都', '名古屋'], answer: 0 },
    { lvl: 'N5', text: '毎朝七時に起きて、七時半に朝ごはんを食べます。', question: '朝ごはんは何時ですか。', choices: ['7時', '7時半', '8時', '6時半'], answer: 1 },
    { lvl: 'N4', text: '先週の週末、家族と海へ行きました。天気は晴れで暖かかったです。', question: '天気はどうでしたか。', choices: ['雨', '晴れ', '寒い', '風'], answer: 1 },
    { lvl: 'N4', text: 'すみません、駅へはどう行けばいいですか。', question: '話している人は何を探していますか。', choices: ['ホテル', '駅', 'レストラン', '銀行'], answer: 1 },
    { lvl: 'N3', text: '雨が強く降っていましたが、レインコートを用意していたので、ハイキングを続けることにしました。', question: 'なぜ続けることにしましたか。', choices: ['レインコートがあった', '雨がやんだ', '道に迷った', '雨が好き'], answer: 0 },
    { lvl: 'N3', text: '会社は年末までに五十人の新しいエンジニアを採用すると発表しました。', question: '何人のエンジニアを採用しますか。', choices: ['15人', '5人', '50人', '500人'], answer: 2 },
    { lvl: 'N2', text: '教授は、その提案は革新的だが、現在の予算制約を考えると経済的に実現可能ではないと主張した。', question: '教授の主な懸念は何ですか。', choices: ['革新性', '経済的な実現可能性', '予算削減', '時期'], answer: 1 },
    { lvl: 'N2', text: '多大な投資にもかかわらず、プロジェクトの結果は曖昧で、競合他社の立場を損なうことはできなかった。', question: '結果について何が分かりますか。', choices: ['非常に明確', '曖昧', '成功', '利益'], answer: 1 },
    { lvl: 'N1', text: '委員会がもっと現実的にデータを精査していれば、予測から食い違うリスクを緩和できたかもしれない。', question: '何がリスクを減らせたかもしれませんか。', choices: ['もっと資金', 'より現実的な検討', '迅速な決定', '新しいメンバー'], answer: 1 },
    { lvl: 'N1', text: '率直な上司のおかげで、普遍的な欠陥がチームの信頼を損なうことはなかった。', question: '上司の重要な資質は何ですか。', choices: ['率直さ', '野心', '慎重さ', 'カリスマ'], answer: 0 }
  ],
  ko: [
    { lvl: 'T1', text: '안녕하세요, 저는 김민수입니다. 서울에서 왔어요.', question: '민수 씨는 어디에서 왔어요?', choices: ['서울', '부산', '대구', '인천'], answer: 0 },
    { lvl: 'T1', text: '저는 매일 일곱 시에 일어나서 일곱 시 반에 아침을 먹어요.', question: '아침은 몇 시예요?', choices: ['7시', '7시 반', '8시', '6시 반'], answer: 1 },
    { lvl: 'T2', text: '지난 주말에 가족과 바다에 갔어요. 날씨는 맑고 따뜻했어요.', question: '날씨는 어땠어요?', choices: ['비', '맑음', '추움', '바람'], answer: 1 },
    { lvl: 'T2', text: '실례합니다, 기차역에 어떻게 가요?', question: '무엇을 찾고 있어요?', choices: ['호텔', '기차역', '식당', '은행'], answer: 1 },
    { lvl: 'T3', text: '비가 많이 왔지만 우비를 준비했기 때문에 등산을 계속하기로 했어요.', question: '왜 계속하기로 했어요?', choices: ['우비가 있어서', '비가 그쳐서', '길을 잃어서', '비를 좋아해서'], answer: 0 },
    { lvl: 'T3', text: '회사는 올해 말까지 새로운 엔지니어 50명을 채용한다고 발표했어요.', question: '몇 명을 채용해요?', choices: ['15명', '5명', '50명', '500명'], answer: 2 },
    { lvl: 'T4', text: '교수는 그 제안이 혁신적이지만 현재 예산 제약을 고려하면 경제적으로 실행 가능하지 않다고 주장했어요.', question: '교수의 주된 우려는?', choices: ['혁신성', '경제적 실행 가능성', '예산 삭감', '시기'], answer: 1 },
    { lvl: 'T4', text: '막대한 투자에도 불구하고 결과는 모호했고 경쟁사의 입지를 약화시키지 못했어요.', question: '결과는 어땠어요?', choices: ['매우 명확', '모호함', '성공', '이익'], answer: 1 },
    { lvl: 'T5', text: '위원회가 더 실용적으로 데이터를 검토했더라면 예측에서 엇갈린 위험을 완화할 수 있었을 거예요.', question: '무엇이 위험을 줄일 수 있었을까요?', choices: ['더 많은 자금', '더 실용적인 검토', '빠른 결정', '새 위원'], answer: 1 },
    { lvl: 'T5', text: '솔직한 상사 덕분에 보편적인 결함이 팀의 신뢰를 약화시키지 않았어요.', question: '상사의 중요한 자질은?', choices: ['솔직함', '야망', '신중함', '카리스마'], answer: 0 }
  ]
};

window.LL_RAW.speaking = {
  en: [
    { lvl: 'A1', text: 'Nice to meet you.', translation: '很高兴认识你。', phonetic: 'naɪs tə miːt juː' },
    { lvl: 'A1', text: 'How are you today?', translation: '你今天怎么样？', phonetic: 'haʊ ɑːr juː təˈdeɪ' },
    { lvl: 'A2', text: 'Could you repeat that, please?', translation: '能请你再说一遍吗？', phonetic: 'kʊd juː rɪˈpiːt ðæt pliːz' },
    { lvl: 'A2', text: 'I would like a cup of coffee.', translation: '我想要一杯咖啡。', phonetic: 'aɪ wʊd laɪk ə kʌp əv ˈkɒfi' },
    { lvl: 'B1', text: 'I really appreciate your help.', translation: '我非常感激你的帮助。', phonetic: 'aɪ ˈrɪəli əˈpriːʃieɪt jɔːr help' },
    { lvl: 'B1', text: 'This is a great opportunity for us.', translation: '这对我们来说是个好机会。', phonetic: 'ðɪs ɪz ə ɡreɪt ˌɒpəˈtjuːnəti fɔːr ʌs' },
    { lvl: 'B2', text: 'The plan is technically feasible.', translation: '这个计划在技术上是可行的。', phonetic: 'ðə plæn ɪz ˈteknɪkli ˈfiːzəbl' },
    { lvl: 'B2', text: 'Change is inevitable, so we must adapt.', translation: '变化不可避免，所以我们必须适应。', phonetic: 'tʃeɪndʒ ɪz ɪnˈevɪtəbl soʊ wiː mʌst əˈdæpt' },
    { lvl: 'C1', text: 'Safety should always be paramount.', translation: '安全应当始终是第一位的。', phonetic: 'ˈseɪfti ʃʊd ˈɔːlweɪz biː ˈpærəmaʊnt' },
    { lvl: 'C1', text: 'Keep your summary succinct and clear.', translation: '让你的总结简洁明了。', phonetic: 'kiːp jɔːr ˈsʌməri səkˈsɪŋkt ænd klɪr' }
  ],
  ja: [
    { lvl: 'N5', text: 'はじめまして、よろしくお願いします。', translation: '初次见面，请多关照。', phonetic: 'hajimemashite yoroshiku onegaishimasu' },
    { lvl: 'N5', text: '今日はいい天気ですね。', translation: '今天天气真好。', phonetic: 'kyou wa ii tenki desu ne' },
    { lvl: 'N4', text: 'もう一度言っていただけますか。', translation: '能请您再说一遍吗？', phonetic: 'mou ichido itte itadakemasu ka' },
    { lvl: 'N4', text: 'コーヒーを一杯ください。', translation: '请给我一杯咖啡。', phonetic: 'koohii wo ippai kudasai' },
    { lvl: 'N3', text: 'ご協力に感謝します。', translation: '感谢您的协助。', phonetic: 'go kyouryoku ni kansha shimasu' },
    { lvl: 'N3', text: 'これは私たちにとって大きなチャンスです。', translation: '这对我们来说是个大机会。', phonetic: 'kore wa watashitachi ni totte ookina chansu desu' },
    { lvl: 'N2', text: 'その計画は技術的に実現可能です。', translation: '那个计划在技术上是可行的。', phonetic: 'sono keikaku wa gijutsuteki ni jitsugen kanou desu' },
    { lvl: 'N2', text: '変化は避けられません。だから適応しなければなりません。', translation: '变化无法避免，所以必须适应。', phonetic: 'henka wa sakeraremasen dakara tekiou shinakereba narimasen' },
    { lvl: 'N1', text: '安全は常に最重要です。', translation: '安全始终是最重要的。', phonetic: 'anzen wa tsune ni saijuuyou desu' },
    { lvl: 'N1', text: '要約は簡潔にまとめてください。', translation: '请把总结简洁地归纳。', phonetic: 'youyaku wa kenketsu ni matomete kudasai' }
  ],
  ko: [
    { lvl: 'T1', text: '안녕하세요, 만나서 반갑습니다.', translation: '你好，很高兴见到你。', phonetic: 'annyeonghaseyo, mannaseo bangapseumnida' },
    { lvl: 'T1', text: '오늘 날씨가 정말 좋네요.', translation: '今天天气真好。', phonetic: 'oneul nalssiga jeongmal jonneyo' },
    { lvl: 'T2', text: '다시 한 번 말씀해 주시겠어요?', translation: '能请您再说一遍吗？', phonetic: 'dasi han beon malsseumhae jusigesseoyo' },
    { lvl: 'T2', text: '커피 한 잔 주세요.', translation: '请给我一杯咖啡。', phonetic: 'keopi han jan juseyo' },
    { lvl: 'T3', text: '도와주셔서 감사합니다.', translation: '谢谢您的帮助。', phonetic: 'dowajusyeoseo gamsahamnida' },
    { lvl: 'T3', text: '이건 우리에게 큰 기회예요.', translation: '这对我们来说是个大机会。', phonetic: 'igeon uriege keun gihoeyeyo' },
    { lvl: 'T4', text: '그 계획은 기술적으로 실행 가능해요.', translation: '那个计划在技术上是可行的。', phonetic: 'geu gyehoekkeun gisuljeogeuro silhaeng ganeunghaeyo' },
    { lvl: 'T4', text: '변화는 불가피하니 적응해야 해요.', translation: '变化不可避免，所以必须适应。', phonetic: 'byeonhwaneun bulgapihani jeogeunghaeya haeyo' },
    { lvl: 'T5', text: '안전이 항상 가장 중요해요.', translation: '安全始终是最重要的。', phonetic: 'anjeoni hangsang gajang jungyohaeyo' },
    { lvl: 'T5', text: '요약을 간결하게 정리해 주세요.', translation: '请把总结简洁地整理。', phonetic: 'yoyageul gangyeolhage jeongrihae juseyo' }
  ]
};

/* 成就：check(ctx) 接收 {progress, stats}，返回是否达成 */
window.LL_RAW.achievements = [
  { id: 'first_lesson', icon: '🎯', title: '初次启程', desc: '完成第一节课', xp: 20, check: c => c.progress.totals.lessons >= 1 },
  { id: 'streak_3', icon: '🔥', title: '坚持不懈', desc: '连续打卡 3 天', xp: 50, check: c => c.progress.streak >= 3 },
  { id: 'streak_7', icon: '🗓️', title: '一周不辍', desc: '连续打卡 7 天', xp: 120, check: c => c.progress.streak >= 7 },
  { id: 'vocab_20', icon: '📚', title: '词汇达人', desc: '掌握 20 个单词', xp: 60, check: c => c.stats.vocabMastered >= 20 },
  { id: 'vocab_50', icon: '🏆', title: '词汇大师', desc: '掌握 50 个单词', xp: 150, check: c => c.stats.vocabMastered >= 50 },
  { id: 'grammar_10', icon: '✍️', title: '语法能手', desc: '完成 10 道语法练习', xp: 60, check: c => c.stats.byType.grammar.answered >= 10 },
  { id: 'speaking_10', icon: '🎙️', title: '口语新星', desc: '完成 10 次口语跟读', xp: 80, check: c => c.stats.byType.speaking.answered >= 10 },
  { id: 'listening_10', icon: '🎧', title: '听力敏锐', desc: '完成 10 次听力训练', xp: 80, check: c => c.stats.byType.listening.answered >= 10 },
  { id: 'lesson_10', icon: '🌊', title: '学海无涯', desc: '完成 10 节课', xp: 100, check: c => c.progress.totals.lessons >= 10 },
  { id: 'polyglot', icon: '🌍', title: '多语通才', desc: '同时学习 2 种以上语言', xp: 120, check: c => c.stats.languages >= 2 },
  { id: 'perfect', icon: '💯', title: '满分表现', desc: '一次练习全部答对', xp: 40, check: c => c.stats.perfectRuns >= 1 },
  { id: 'xp_500', icon: '⭐', title: '经验丰富', desc: '累计获得 500 经验', xp: 0, check: c => c.progress.xp >= 500 },
  { id: 'community_1', icon: '💬', title: '社区之星', desc: '发布一条社区动态', xp: 30, check: c => c.stats.posts >= 1 }
];

window.LL_RAW.topics = ['英语打卡', '日语五十音', '韩语口语', '语法答疑', '背单词', '每日一句', '学习搭子', '资源分享'];

window.LL_RAW.posts = [
  { author: 'Yuki_李', avatar: '#5b5bd6', topic: '日语五十音', body: '五十音终于全部背完了！分享一个方法：每天只学一行，用「跟读 + 默写」两步走，一周就稳了。', likes: 24, time: '2 小时前', seededLikes: 24 },
  { author: 'Kevin.W', avatar: '#e0599a', topic: '英语打卡', body: 'Day 46 打卡。今天练了 B2 的定语从句，错了两题，都是 whose 和 which 混了，记笔记了。', likes: 18, time: '5 小时前', seededLikes: 18 },
  { author: '韩语小鹿', avatar: '#1f9d63', topic: '韩语口语', body: '口语跟读功能太好玩了，跟着系统读「안녕하세요」被打了 92 分，发音真的有进步。', likes: 31, time: '昨天', seededLikes: 31 },
  { author: 'LinguaFlow 助手', avatar: '#d99b11', topic: '每日一句', body: '每日一句：The best time to plant a tree was 20 years ago. The second best time is now. ——种树最好的时间是二十年前，其次是现在。', likes: 42, time: '昨天', seededLikes: 42 },
  { author: 'Anna_陈', avatar: '#6a4fc4', topic: '学习搭子', body: '有没有一起冲 C1 的同学？想找个搭子每天互相监督，打卡 30 天。', likes: 12, time: '2 天前', seededLikes: 12 }
];
