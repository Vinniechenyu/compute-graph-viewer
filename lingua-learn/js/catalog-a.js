/* LinguaFlow · 课程原始内容 A：语言定义 + 词库
   暴露 window.LL_RAW，由 curriculum.js 组装为 LL_DATA。 */
window.LL_RAW = window.LL_RAW || {};

window.LL_RAW.languages = [
  {
    code: 'en', name: '英语', native: 'English', flag: '🇬🇧', tts: 'en-US',
    scale: 'CEFR', accent: '#5b5bd6',
    levels: [
      { id: 'A1', label: 'A1', name: '入门', desc: '问候、数字与日常基础表达' },
      { id: 'A2', label: 'A2', name: '初级', desc: '旅行、天气与简单交际' },
      { id: 'B1', label: 'B1', name: '中级', desc: '观点表达、工作与学习场景' },
      { id: 'B2', label: 'B2', name: '中高级', desc: '抽象话题与议论文本理解' },
      { id: 'C1', label: 'C1', name: '高级', desc: '学术与专业语域精读' }
    ]
  },
  {
    code: 'ja', name: '日语', native: '日本語', flag: '🇯🇵', tts: 'ja-JP',
    scale: 'JLPT', accent: '#e0599a',
    levels: [
      { id: 'N5', label: 'N5', name: '入门', desc: '五十音与基本句型' },
      { id: 'N4', label: 'N4', name: '初级', desc: '日常生活会话' },
      { id: 'N3', label: 'N3', name: '中级', desc: '被动／使役与书面表达' },
      { id: 'N2', label: 'N2', name: '中高级', desc: '抽象表达与新闻阅读' },
      { id: 'N1', label: 'N1', name: '高级', desc: '学术文体与惯用句型' }
    ]
  },
  {
    code: 'ko', name: '韩语', native: '한국어', flag: '🇰🇷', tts: 'ko-KR',
    scale: 'TOPIK', accent: '#1f9d63',
    levels: [
      { id: 'T1', label: 'TOPIK 1', name: '入门', desc: '谚音与基本敬语' },
      { id: 'T2', label: 'TOPIK 2', name: '初级', desc: '日常会话与过去时' },
      { id: 'T3', label: 'TOPIK 3', name: '中级', desc: '被动／使役与长句' },
      { id: 'T4', label: 'TOPIK 4', name: '中高级', desc: '抽象表达与逻辑衔接' },
      { id: 'T5', label: 'TOPIK 5', name: '高级', desc: '专业语域与惯用表达' }
    ]
  }
];

window.LL_RAW.vocab = {
  en: [
    { lvl: 'A1', word: 'hello', meaning: '你好', example: 'Hello, nice to meet you.', exZh: '你好，很高兴认识你。' },
    { lvl: 'A1', word: 'water', meaning: '水', example: 'Can I have a glass of water?', exZh: '我可以要一杯水吗？' },
    { lvl: 'A1', word: 'book', meaning: '书', example: 'This book is very interesting.', exZh: '这本书很有趣。' },
    { lvl: 'A1', word: 'friend', meaning: '朋友', example: 'She is my best friend.', exZh: '她是我最好的朋友。' },
    { lvl: 'A1', word: 'school', meaning: '学校', example: 'I go to school by bus.', exZh: '我坐公交车去学校。' },
    { lvl: 'A1', word: 'family', meaning: '家庭', example: 'My family is quite big.', exZh: '我的家庭很大。' },
    { lvl: 'A1', word: 'eat', meaning: '吃', example: 'We eat breakfast at seven.', exZh: '我们七点吃早饭。' },
    { lvl: 'A1', word: 'house', meaning: '房子', example: 'They live in a small house.', exZh: '他们住在一栋小房子里。' },

    { lvl: 'A2', word: 'travel', meaning: '旅行', example: 'We will travel to Japan next month.', exZh: '下个月我们要去日本旅行。' },
    { lvl: 'A2', word: 'weather', meaning: '天气', example: 'The weather is nice today.', exZh: '今天天气很好。' },
    { lvl: 'A2', word: 'healthy', meaning: '健康的', example: 'Eating vegetables keeps you healthy.', exZh: '吃蔬菜让你保持健康。' },
    { lvl: 'A2', word: 'decide', meaning: '决定', example: 'I decided to learn English.', exZh: '我决定学英语。' },
    { lvl: 'A2', word: 'borrow', meaning: '借', example: 'Can I borrow your pen?', exZh: '我能借你的笔吗？' },
    { lvl: 'A2', word: 'invite', meaning: '邀请', example: 'He invited me to his party.', exZh: '他邀请我参加他的聚会。' },
    { lvl: 'A2', word: 'improve', meaning: '提高', example: 'Reading helps improve your English.', exZh: '阅读有助于提高你的英语。' },
    { lvl: 'A2', word: 'neighbor', meaning: '邻居', example: 'Our neighbor is very friendly.', exZh: '我们的邻居很友好。' },

    { lvl: 'B1', word: 'achieve', meaning: '实现', example: 'She achieved her goal at last.', exZh: '她终于实现了目标。' },
    { lvl: 'B1', word: 'environment', meaning: '环境', example: 'We should protect the environment.', exZh: '我们应该保护环境。' },
    { lvl: 'B1', word: 'opportunity', meaning: '机会', example: 'This is a great opportunity to learn.', exZh: '这是一个学习的好机会。' },
    { lvl: 'B1', word: 'responsible', meaning: '负责的', example: 'He is responsible for the project.', exZh: '他负责这个项目。' },
    { lvl: 'B1', word: 'appreciate', meaning: '感激', example: 'I really appreciate your help.', exZh: '我非常感激你的帮助。' },
    { lvl: 'B1', word: 'persuade', meaning: '说服', example: 'She persuaded me to join the club.', exZh: '她说服我加入了俱乐部。' },
    { lvl: 'B1', word: 'convenient', meaning: '方便的', example: 'Online shopping is very convenient.', exZh: '网上购物非常方便。' },
    { lvl: 'B1', word: 'resource', meaning: '资源', example: 'The website is a useful resource.', exZh: '这个网站是有用的资源。' },

    { lvl: 'B2', word: 'ambiguous', meaning: '模棱两可的', example: 'His answer was ambiguous.', exZh: '他的回答模棱两可。' },
    { lvl: 'B2', word: 'comprehensive', meaning: '全面的', example: 'The report is comprehensive.', exZh: '这份报告很全面。' },
    { lvl: 'B2', word: 'deteriorate', meaning: '恶化', example: 'Her health deteriorated quickly.', exZh: '她的健康迅速恶化。' },
    { lvl: 'B2', word: 'inevitable', meaning: '不可避免的', example: 'Change is inevitable.', exZh: '变化是不可避免的。' },
    { lvl: 'B2', word: 'substantial', meaning: '大量的', example: 'They made a substantial profit.', exZh: '他们获得了可观的利润。' },
    { lvl: 'B2', word: 'undermine', meaning: '削弱', example: 'The scandal undermined his reputation.', exZh: '这起丑闻削弱了他的声誉。' },
    { lvl: 'B2', word: 'feasible', meaning: '可行的', example: 'The plan is technically feasible.', exZh: '这个计划在技术上是可行的。' },
    { lvl: 'B2', word: 'scrutinize', meaning: '仔细审查', example: 'The committee scrutinized the budget.', exZh: '委员会仔细审查了预算。' },

    { lvl: 'C1', word: 'ubiquitous', meaning: '无处不在的', example: 'Smartphones are ubiquitous today.', exZh: '如今智能手机无处不在。' },
    { lvl: 'C1', word: 'pragmatic', meaning: '务实的', example: 'She took a pragmatic approach.', exZh: '她采取了务实的方法。' },
    { lvl: 'C1', word: 'candid', meaning: '坦率的', example: 'He gave a candid opinion.', exZh: '他给出了坦率的意见。' },
    { lvl: 'C1', word: 'mitigate', meaning: '减轻', example: 'We must mitigate the risks.', exZh: '我们必须减轻风险。' },
    { lvl: 'C1', word: 'succinct', meaning: '简洁的', example: 'Keep your summary succinct.', exZh: '请让你的总结简洁。' },
    { lvl: 'C1', word: 'discern', meaning: '辨别', example: 'It is hard to discern the truth.', exZh: '很难辨别真相。' },
    { lvl: 'C1', word: 'paramount', meaning: '至关重要的', example: 'Safety is paramount.', exZh: '安全至关重要。' },
    { lvl: 'C1', word: 'diverge', meaning: '分歧', example: 'Our views diverge on this issue.', exZh: '我们在这个问题上意见分歧。' }
  ],
  ja: [
    { lvl: 'N5', word: 'ありがとう', reading: 'arigatou', meaning: '谢谢', example: '手伝ってくれて、ありがとう。', exZh: '谢谢你帮我。' },
    { lvl: 'N5', word: '水', reading: 'みず mizu', meaning: '水', example: '水を一杯ください。', exZh: '请给我一杯水。' },
    { lvl: 'N5', word: '本', reading: 'ほん hon', meaning: '书', example: 'この本はとても面白いです。', exZh: '这本书很有趣。' },
    { lvl: 'N5', word: '学校', reading: 'がっこう gakkou', meaning: '学校', example: 'バスで学校へ行きます。', exZh: '坐公交车去学校。' },
    { lvl: 'N5', word: '友達', reading: 'ともだち tomodachi', meaning: '朋友', example: '彼女は私の一番の友達です。', exZh: '她是我最好的朋友。' },
    { lvl: 'N5', word: '食べる', reading: 'たべる taberu', meaning: '吃', example: '朝ごはんを七時に食べます。', exZh: '七点吃早饭。' },
    { lvl: 'N5', word: '家', reading: 'いえ ie', meaning: '家', example: '彼らは小さな家に住んでいます。', exZh: '他们住在小房子里。' },
    { lvl: 'N5', word: '朝', reading: 'あさ asa', meaning: '早上', example: '毎朝、散歩をします。', exZh: '每天早上散步。' },

    { lvl: 'N4', word: '旅行', reading: 'りょこう ryokou', meaning: '旅行', example: '来月、日本へ旅行に行きます。', exZh: '下个月去日本旅行。' },
    { lvl: 'N4', word: '天気', reading: 'てんき tenki', meaning: '天气', example: '今日はいい天気ですね。', exZh: '今天天气真好。' },
    { lvl: 'N4', word: '健康', reading: 'けんこう kenkou', meaning: '健康', example: '野菜を食べると健康になります。', exZh: '吃蔬菜会变得健康。' },
    { lvl: 'N4', word: '決める', reading: 'きめる kimeru', meaning: '决定', example: '英語を勉強すると決めました。', exZh: '我决定学英语。' },
    { lvl: 'N4', word: '借りる', reading: 'かりる kariru', meaning: '借', example: 'ペンを借りてもいいですか。', exZh: '能借你的笔吗？' },
    { lvl: 'N4', word: '招待する', reading: 'しょうたいする shoutai', meaning: '邀请', example: '彼は私をパーティーに招待してくれました。', exZh: '他邀请我参加聚会。' },
    { lvl: 'N4', word: '上手', reading: 'じょうず jouzu', meaning: '擅长', example: '彼女は料理が上手です。', exZh: '她擅长做饭。' },
    { lvl: 'N4', word: '隣', reading: 'となり tonari', meaning: '邻居', example: '隣の人はとても親切です。', exZh: '邻居很亲切。' },

    { lvl: 'N3', word: '経験', reading: 'けいけん keiken', meaning: '经验', example: '海外で働いた経験があります。', exZh: '我有在海外工作的经验。' },
    { lvl: 'N3', word: '環境', reading: 'かんきょう kankyou', meaning: '环境', example: '環境を守るべきです。', exZh: '应该保护环境。' },
    { lvl: 'N3', word: '機会', reading: 'きかい kikai', meaning: '机会', example: 'これは勉強するいい機会です。', exZh: '这是个学习的好机会。' },
    { lvl: 'N3', word: '責任', reading: 'せきにん sekinin', meaning: '责任', example: '彼はこのプロジェクトの責任者です。', exZh: '他是这个项目的负责人。' },
    { lvl: 'N3', word: '感謝', reading: 'かんしゃ kansha', meaning: '感激', example: 'ご協力に感謝します。', exZh: '感谢您的协助。' },
    { lvl: 'N3', word: '説得', reading: 'せっとく settoku', meaning: '说服', example: '彼女は私を説得してクラブに入れました。', exZh: '她说服我加入了社团。' },
    { lvl: 'N3', word: '便利', reading: 'べんり benri', meaning: '方便', example: 'ネット通販はとても便利です。', exZh: '网上购物非常方便。' },
    { lvl: 'N3', word: '資源', reading: 'しげん shigen', meaning: '资源', example: 'このサイトは役に立つ資源です。', exZh: '这个网站是有用的资源。' },

    { lvl: 'N2', word: '曖昧', reading: 'あいまい aimai', meaning: '模棱两可', example: '彼の答えは曖昧でした。', exZh: '他的回答模棱两可。' },
    { lvl: 'N2', word: '総合的', reading: 'そうごうてき sougouteki', meaning: '全面的', example: 'この報告書は総合的に優れています。', exZh: '这份报告很全面。' },
    { lvl: 'N2', word: '悪化する', reading: 'あっかする akkasuru', meaning: '恶化', example: '彼女の健康は急速に悪化しました。', exZh: '她的健康迅速恶化。' },
    { lvl: 'N2', word: '必然的', reading: 'ひつぜんてき hitsuzenteki', meaning: '不可避免的', example: '変化は必然的です。', exZh: '变化是不可避免的。' },
    { lvl: 'N2', word: '大幅な', reading: 'おおはばな oohabana', meaning: '大幅的', example: '彼らは大幅な利益を得ました。', exZh: '他们获得了可观的利润。' },
    { lvl: 'N2', word: '損なう', reading: 'そこなう sokonau', meaning: '损害', example: 'そのスキャンダルは彼の評判を損ないました。', exZh: '那起丑闻损害了他的声誉。' },
    { lvl: 'N2', word: '可能', reading: 'かのう kanou', meaning: '可行的', example: 'その計画は技術的に可能です。', exZh: '那个计划在技术上是可行的。' },
    { lvl: 'N2', word: '精査する', reading: 'せいさする seisasuru', meaning: '仔细审查', example: '委員会は予算を精査しました。', exZh: '委员会仔细审查了预算。' },

    { lvl: 'N1', word: '普遍的', reading: 'ふへんてき fuhenteki', meaning: '无处不在的', example: 'スマホは今日、普遍的です。', exZh: '如今智能手机无处不在。' },
    { lvl: 'N1', word: '現実的', reading: 'げんじつてき genjitsuteki', meaning: '务实的', example: '彼女は現実的な方法を取りました。', exZh: '她采取了务实的方法。' },
    { lvl: 'N1', word: '率直', reading: 'そっちょく sotchoku', meaning: '坦率的', example: '彼は率直な意見を述べました。', exZh: '他给出了坦率的意见。' },
    { lvl: 'N1', word: '緩和する', reading: 'かんわする kanwasuru', meaning: '减轻', example: 'リスクを緩和しなければなりません。', exZh: '必须减轻风险。' },
    { lvl: 'N1', word: '簡潔', reading: 'けんけつ kenketsu', meaning: '简洁的', example: '要約は簡潔にしてください。', exZh: '请让总结简洁。' },
    { lvl: 'N1', word: '見分ける', reading: 'みわける miwakeru', meaning: '辨别', example: '真実を見分けるのは難しいです。', exZh: '很难辨别真相。' },
    { lvl: 'N1', word: '最重要', reading: 'さいじゅうよう saijuuyou', meaning: '至关重要的', example: '安全が最重要です。', exZh: '安全至关重要。' },
    { lvl: 'N1', word: '食い違う', reading: 'くいちがう kuichigau', meaning: '分歧', example: 'この問題で意見が食い違っています。', exZh: '在这个问题上意见分歧。' }
  ],
  ko: [
    { lvl: 'T1', word: '안녕하세요', reading: 'annyeonghaseyo', meaning: '你好', example: '안녕하세요, 만나서 반갑습니다.', exZh: '你好，很高兴见到你。' },
    { lvl: 'T1', word: '물', reading: 'mul', meaning: '水', example: '물 한 잔 주세요.', exZh: '请给我一杯水。' },
    { lvl: 'T1', word: '책', reading: 'chaek', meaning: '书', example: '이 책은 아주 재미있어요.', exZh: '这本书很有趣。' },
    { lvl: 'T1', word: '학교', reading: 'hakgyo', meaning: '学校', example: '버스를 타고 학교에 가요.', exZh: '坐公交车去学校。' },
    { lvl: 'T1', word: '친구', reading: 'chingu', meaning: '朋友', example: '그녀는 제 가장 친한 친구예요.', exZh: '她是我最好的朋友。' },
    { lvl: 'T1', word: '먹다', reading: 'meokda', meaning: '吃', example: '아침을 일곱 시에 먹어요.', exZh: '七点吃早饭。' },
    { lvl: 'T1', word: '집', reading: 'jip', meaning: '家', example: '그들은 작은 집에 살아요.', exZh: '他们住在小房子里。' },
    { lvl: 'T1', word: '아침', reading: 'achim', meaning: '早上', example: '매일 아침 산책을 해요.', exZh: '每天早上散步。' },

    { lvl: 'T2', word: '여행', reading: 'yeohaeng', meaning: '旅行', example: '다음 달에 일본으로 여행을 가요.', exZh: '下个月去日本旅行。' },
    { lvl: 'T2', word: '날씨', reading: 'nalssi', meaning: '天气', example: '오늘 날씨가 좋네요.', exZh: '今天天气真好。' },
    { lvl: 'T2', word: '건강', reading: 'geongang', meaning: '健康', example: '채소를 먹으면 건강해져요.', exZh: '吃蔬菜会变健康。' },
    { lvl: 'T2', word: '결정하다', reading: 'gyeoljeonghada', meaning: '决定', example: '영어를 배우기로 결정했어요.', exZh: '我决定学英语。' },
    { lvl: 'T2', word: '빌리다', reading: 'billida', meaning: '借', example: '펜 좀 빌려도 될까요?', exZh: '能借一下笔吗？' },
    { lvl: 'T2', word: '초대하다', reading: 'chodaehada', meaning: '邀请', example: '그가 저를 파티에 초대했어요.', exZh: '他邀请我参加聚会。' },
    { lvl: 'T2', word: '늘다', reading: 'neulda', meaning: '提高', example: '독서는 영어 실력을 늘리는 데 도움이 돼요.', exZh: '阅读有助于提高英语水平。' },
    { lvl: 'T2', word: '이웃', reading: 'iut', meaning: '邻居', example: '우리 이웃은 아주 친절해요.', exZh: '我们的邻居很亲切。' },

    { lvl: 'T3', word: '경험', reading: 'gyeongheom', meaning: '经验', example: '해외에서 일한 경험이 있어요.', exZh: '我有在海外工作的经验。' },
    { lvl: 'T3', word: '환경', reading: 'hwangyeong', meaning: '环境', example: '환경을 보호해야 해요.', exZh: '应该保护环境。' },
    { lvl: 'T3', word: '기회', reading: 'gihoe', meaning: '机会', example: '이건 공부할 좋은 기회예요.', exZh: '这是个学习的好机会。' },
    { lvl: 'T3', word: '책임', reading: 'chaegim', meaning: '责任', example: '그는 이 프로젝트의 책임자예요.', exZh: '他是这个项目的负责人。' },
    { lvl: 'T3', word: '감사하다', reading: 'gamsahada', meaning: '感谢', example: '도와주셔서 감사합니다.', exZh: '谢谢您的帮助。' },
    { lvl: 'T3', word: '설득하다', reading: 'seoldeukhada', meaning: '说服', example: '그녀가 저를 설득해서 동아리에 가입했어요.', exZh: '她说服我加入了社团。' },
    { lvl: 'T3', word: '편리하다', reading: 'pyeonlihada', meaning: '方便', example: '온라인 쇼핑은 아주 편리해요.', exZh: '网上购物非常方便。' },
    { lvl: 'T3', word: '자원', reading: 'jawon', meaning: '资源', example: '이 사이트는 유용한 자원이에요.', exZh: '这个网站是有用的资源。' },

    { lvl: 'T4', word: '모호하다', reading: 'mohohada', meaning: '模棱两可', example: '그의 대답은 모호했어요.', exZh: '他的回答模棱两可。' },
    { lvl: 'T4', word: '종합적', reading: 'jonghapjeok', meaning: '全面的', example: '이 보고서는 종합적으로 우수해요.', exZh: '这份报告很全面。' },
    { lvl: 'T4', word: '악화되다', reading: 'akwadoeda', meaning: '恶化', example: '그녀의 건강이 빠르게 악화됐어요.', exZh: '她的健康迅速恶化。' },
    { lvl: 'T4', word: '불가피하다', reading: 'bulgapihada', meaning: '不可避免的', example: '변화는 불가피해요.', exZh: '变化是不可避免的。' },
    { lvl: 'T4', word: '상당하다', reading: 'sangdanghada', meaning: '大量的', example: '그들은 상당한 이익을 얻었어요.', exZh: '他们获得了可观的利润。' },
    { lvl: 'T4', word: '약화시키다', reading: 'yakhwasikida', meaning: '削弱', example: '그 스캔들이 그의 명성을 약화시켰어요.', exZh: '那起丑闻削弱了他的声誉。' },
    { lvl: 'T4', word: '검토하다', reading: 'geomtohada', meaning: '审查', example: '위원회는 예산을 면밀히 검토했어요.', exZh: '委员会仔细审查了预算。' },
    { lvl: 'T4', word: '실행하다', reading: 'silhaenghada', meaning: '执行', example: '그 계획은 기술적으로 실행 가능해요.', exZh: '那个计划在技术上是可行的。' },

    { lvl: 'T5', word: '보편적', reading: 'bopyeonjeok', meaning: '无处不在的', example: '스마트폰은 오늘날 보편적이에요.', exZh: '如今智能手机无处不在。' },
    { lvl: 'T5', word: '실용적', reading: 'siryongjeok', meaning: '务实的', example: '그녀는 실용적인 접근을 했어요.', exZh: '她采取了务实的方法。' },
    { lvl: 'T5', word: '솔직하다', reading: 'soljikhada', meaning: '坦率的', example: '그는 솔직한 의견을 줬어요.', exZh: '他给出了坦率的意见。' },
    { lvl: 'T5', word: '완화하다', reading: 'wanhwahada', meaning: '减轻', example: '우리는 위험을 완화해야 해요.', exZh: '我们必须减轻风险。' },
    { lvl: 'T5', word: '간결하다', reading: 'gangyeolhada', meaning: '简洁的', example: '요약을 간결하게 해 주세요.', exZh: '请让总结简洁。' },
    { lvl: 'T5', word: '분별하다', reading: 'bunbyeolhada', meaning: '辨别', example: '진실을 분별하기 어려워요.', exZh: '很难辨别真相。' },
    { lvl: 'T5', word: '중요하다', reading: 'jungyohada', meaning: '至关重要的', example: '안전이 가장 중요해요.', exZh: '安全至关重要。' },
    { lvl: 'T5', word: '엇갈리다', reading: 'eotgallida', meaning: '分歧', example: '이 문제에 대해 의견이 엇갈려요.', exZh: '在这个问题上意见分歧。' }
  ]
};
