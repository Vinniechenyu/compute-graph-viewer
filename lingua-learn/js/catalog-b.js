/* LinguaFlow · 课程原始内容 B：语法库 */
window.LL_RAW = window.LL_RAW || {};

window.LL_RAW.grammar = {
  en: [
    { lvl: 'A1', point: 'be 动词 (am / is / are)', rule: '主语 + be + 表语。I 用 am，he/she/it 用 is，you/we/they 用 are。', example: 'She is a teacher.', exZh: '她是老师。', quiz: [
      { q: '选择正确的形式：He ___ my brother.', choices: ['is', 'am', 'are', 'be'], answer: 0, explain: 'He 是第三人称单数，用 is。' },
      { q: '选择正确的形式：I ___ from China.', choices: ['am', 'is', 'are', 'be'], answer: 0, explain: 'I 搭配 am。' }
    ] },
    { lvl: 'A1', point: '一般现在时', rule: '表示习惯或事实；第三人称单数动词加 -s/-es。', example: 'She works in a bank.', exZh: '她在银行工作。', quiz: [
      { q: 'He ___ English every day.', choices: ['study', 'studies', 'studying', 'studied'], answer: 1, explain: '第三人称单数 study→studies。' },
      { q: 'They ___ football on Sundays.', choices: ['plays', 'play', 'playing', 'played'], answer: 1, explain: '主语 they 用动词原形 play。' }
    ] },
    { lvl: 'A1', point: '冠词 a / an / the', rule: 'a 用于辅音音素前，an 用于元音音素前，the 表特指。', example: 'I saw an apple on the table.', exZh: '我看见桌上有个苹果。', quiz: [
      { q: 'She is ___ honest girl.', choices: ['a', 'an', 'the', '/'], answer: 1, explain: 'honest 以元音音素开头，用 an。' },
      { q: '___ sun rises in the east.', choices: ['A', 'An', 'The', '/'], answer: 2, explain: '独一无二的事物前用 the。' }
    ] },

    { lvl: 'A2', point: '一般过去时', rule: '表示过去发生的动作，规则动词加 -ed，不规则动词需记忆。', example: 'We visited the museum yesterday.', exZh: '我们昨天参观了博物馆。', quiz: [
      { q: 'He ___ to school by bike last week.', choices: ['go', 'goes', 'went', 'gone'], answer: 2, explain: 'last week 是过去时间，go 的过去式是 went。' },
      { q: 'She ___ her homework an hour ago.', choices: ['finish', 'finishes', 'finished', 'finishing'], answer: 2, explain: 'ago 表示过去，用过去式 finished。' }
    ] },
    { lvl: 'A2', point: '比较级', rule: '短形容词加 -er，长形容词前加 more，than 引出比较对象。', example: 'This book is more interesting than that one.', exZh: '这本书比那本更有趣。', quiz: [
      { q: 'He is ___ than his brother.', choices: ['tall', 'taller', 'tallest', 'more tall'], answer: 1, explain: 'tall 的比较级是 taller。' },
      { q: 'This is the ___ film I have ever seen.', choices: ['good', 'better', 'best', 'well'], answer: 2, explain: '最高级用 the best。' }
    ] },
    { lvl: 'A2', point: '现在完成时', rule: 'have/has + 过去分词，表示过去动作对现在的影响。', example: 'I have already finished my homework.', exZh: '我已经完成了作业。', quiz: [
      { q: 'She ___ never been to Japan.', choices: ['has', 'have', 'is', 'was'], answer: 0, explain: '第三人称单数用 has。' },
      { q: 'I ___ just eaten lunch.', choices: ['have', 'has', 'am', 'did'], answer: 0, explain: '主语 I 用 have。' }
    ] },

    { lvl: 'B1', point: '现在完成进行时', rule: 'have/has been + 现在分词，强调动作从过去持续到现在。', example: 'He has been studying Chinese for three years.', exZh: '他学中文已经三年了。', quiz: [
      { q: 'They ___ been waiting for an hour.', choices: ['has', 'have', 'is', 'are'], answer: 1, explain: '主语 they 用 have。' },
      { q: 'It ___ been raining since morning.', choices: ['have', 'has', 'is', 'was'], answer: 1, explain: '主语 it 用 has。' }
    ] },
    { lvl: 'B1', point: '定语从句', rule: '关系代词 who/which/that 引导定语从句，修饰前面的名词。', example: 'The man who lives next door is a doctor.', exZh: '住在隔壁的男人是医生。', quiz: [
      { q: 'This is the book ___ I bought yesterday.', choices: ['who', 'which', 'whose', 'whom'], answer: 1, explain: '先行词 book 是物，用 which。' },
      { q: 'The girl ___ hair is long is my sister.', choices: ['who', 'which', 'whose', 'that'], answer: 2, explain: '表示所属关系用 whose。' }
    ] },
    { lvl: 'B1', point: '被动语态', rule: 'be + 过去分词，主语是动作的承受者。', example: 'The bridge was built in 1990.', exZh: '这座桥建于 1990 年。', quiz: [
      { q: 'The letter ___ yesterday.', choices: ['sent', 'was sent', 'is sent', 'sends'], answer: 1, explain: '过去时的被动语态用 was + 过去分词。' },
      { q: 'English ___ all over the world.', choices: ['speaks', 'is spoken', 'spoken', 'speaking'], answer: 1, explain: '英语被说，用被动 is spoken。' }
    ] },

    { lvl: 'B2', point: '虚拟语气 (wish / if)', rule: 'wish 后接过去式表示与现在相反的愿望；if 条件句用过去式表示虚拟。', example: 'I wish I were taller.', exZh: '我希望我更高一些。', quiz: [
      { q: 'If I ___ you, I would accept the offer.', choices: ['am', 'was', 'were', 'be'], answer: 2, explain: '虚拟条件句中 be 动词用 were。' },
      { q: 'I wish I ___ more time.', choices: ['have', 'had', 'has', 'having'], answer: 1, explain: 'wish 后与现在相反用过去式 had。' }
    ] },
    { lvl: 'B2', point: '倒装句', rule: '否定词置于句首时，主句部分倒装。', example: 'Never have I seen such a beautiful view.', exZh: '我从未见过如此美景。', quiz: [
      { q: 'Hardly ___ the room when the phone rang.', choices: ['I had entered', 'had I entered', 'I entered', 'did I enter'], answer: 1, explain: 'Hardly 置首引起部分倒装。' },
      { q: 'Only then ___ the truth.', choices: ['he knew', 'did he know', 'he did know', 'knew he'], answer: 1, explain: 'Only 引导状语置首时倒装。' }
    ] },
    { lvl: 'B2', point: '分词短语', rule: '现在分词表主动或进行，过去分词表被动或完成。', example: 'Walking down the street, I met an old friend.', exZh: '走在街上时，我遇到了一位老朋友。', quiz: [
      { q: '___ the news, she burst into tears.', choices: ['Hearing', 'Heard', 'To hear', 'Hear'], answer: 0, explain: 'she 与 hear 是主动关系，用现在分词。' },
      { q: '___ in a hurry, the letter was full of mistakes.', choices: ['Writing', 'Written', 'To write', 'Write'], answer: 1, explain: 'letter 与 write 是被动关系，用过去分词。' }
    ] },

    { lvl: 'C1', point: '虚拟语气省略 if', rule: '虚拟条件句可省略 if，将 were/had/should 提前构成倒装。', example: 'Were I in your position, I would resign.', exZh: '如果我处在你的位置，我会辞职。', quiz: [
      { q: '___ it not been for your help, I would have failed.', choices: ['Had', 'Have', 'If', 'Were'], answer: 0, explain: '与过去相反的虚拟，省略 if 用 Had 置首。' },
      { q: '___ you change your mind, please let me know.', choices: ['Should', 'Would', 'Had', 'Were'], answer: 0, explain: 'Should 置首表示不太可能发生的将来虚拟。' }
    ] },
    { lvl: 'C1', point: '强调句', rule: 'It is/was ... that ... 结构用于强调句子的某一成分。', example: 'It was John that broke the window.', exZh: '是约翰打破了窗户。', quiz: [
      { q: '___ was in 1998 that he moved to London.', choices: ['This', 'That', 'It', 'There'], answer: 2, explain: '强调句固定结构 It was ... that ...。' },
      { q: 'It is you ___ I want to thank.', choices: ['who', 'which', 'whom it', 'that is'], answer: 0, explain: '强调人可用 who。' }
    ] },
    { lvl: 'C1', point: '情态动词完成式', rule: 'must have done 表示对过去的肯定推测；should have done 表示本应做而未做。', example: 'You should have told me earlier.', exZh: '你本该早点告诉我。', quiz: [
      { q: 'He looks tired; he ___ have worked all night.', choices: ['should', 'must', 'can', 'would'], answer: 1, explain: '对过去的肯定推测用 must have done。' },
      { q: 'I ___ have studied harder for the exam.', choices: ['must', 'should', 'can', 'will'], answer: 1, explain: '本应做而未做用 should have done。' }
    ] }
  ],
  ja: [
    { lvl: 'N5', point: 'です／ます 礼貌体', rule: '名词/形容词 + です，动词用 ます 形，构成礼貌表达。', example: '私は学生です。', exZh: '我是学生。', quiz: [
      { q: '私は毎日日本語を勉強___。', choices: ['する', 'します', 'した', 'して'], answer: 1, explain: '礼貌体用 します。' },
      { q: 'これは本___。', choices: ['だ', 'です', 'ます', 'の'], answer: 1, explain: '名词谓语礼貌体用 です。' }
    ] },
    { lvl: 'N5', point: '助词 は / が', rule: 'は 提示主题，が 强调主语或新信息。', example: '私は日本語が好きです。', exZh: '我喜欢日语。', quiz: [
      { q: '私___学生です。', choices: ['が', 'は', 'を', 'に'], answer: 1, explain: '提示主题用 は。' },
      { q: '部屋に犬___います。', choices: ['は', 'が', 'を', 'で'], answer: 1, explain: '新信息主语用 が。' }
    ] },
    { lvl: 'N5', point: '动词 て 形', rule: 'て 形用于请求、进行、连接等。', example: 'ここに名前を書いてください。', exZh: '请在这里写上名字。', quiz: [
      { q: '「食べる」的て形是___。', choices: ['食べて', '食べるて', '食べって', '食べんで'], answer: 0, explain: '一段动词 食べる→食べて。' },
      { q: '今、本を読ん___います。', choices: ['で', 'て', 'でて', 'んで'], answer: 1, explain: '読む→読んで，进行时 ～ています。' }
    ] },

    { lvl: 'N4', point: 'た形（过去式）', rule: '动词过去式（た形）表示已完成的动作。', example: '昨日、映画を見た。', exZh: '昨天看了电影。', quiz: [
      { q: '「飲む」的た形是___。', choices: ['飲いた', '飲んだ', '飲った', '飲むた'], answer: 1, explain: '飲む→飲んだ。' },
      { q: 'もう昼ごはんを___。', choices: ['食べる', '食べた', '食べます', '食べて'], answer: 1, explain: '已经吃过，用过去式 食べた。' }
    ] },
    { lvl: 'N4', point: '比较 より / のほうが', rule: 'A は B より … 表示 A 比 B 更…。', example: 'この本はあの本より面白いです。', exZh: '这本书比那本有趣。', quiz: [
      { q: '彼は弟___背が高い。', choices: ['まで', 'より', 'ほど', 'だけ'], answer: 1, explain: '比较用 より。' },
      { q: '映画は本___面白い。', choices: ['より', 'ほど', 'のほうが', 'ぐらい'], answer: 2, explain: 'A のほうが 表示 A 更…。' }
    ] },
    { lvl: 'N4', point: '愿望 ～たい / ～ほしい', rule: '动词ます形去掉ます + たい 表示想做某事；名词 + ほしい 表示想要某物。', example: '日本へ行きたいです。', exZh: '我想去日本。', quiz: [
      { q: '水が飲み___です。', choices: ['たい', 'たがる', 'ほしい', 'ましょう'], answer: 0, explain: '第一人称愿望用 ～たい。' },
      { q: 'カメラが___です。', choices: ['たい', 'ほしい', 'たがる', 'だろう'], answer: 1, explain: '想要物品用 ほしい。' }
    ] },

    { lvl: 'N3', point: '～ている（进行／状态）', rule: '表示动作正在进行，或动作结果状态的持续。', example: '彼は中国語を三年間勉強している。', exZh: '他学中文已经三年了。', quiz: [
      { q: '今、雨が降っ___。', choices: ['ている', 'た', 'ます', 'よう'], answer: 0, explain: '进行／持续用 ～ている。' },
      { q: '彼女は結婚し___。', choices: ['てある', 'ている', 'た', 'ます'], answer: 1, explain: '结果状态用 ～ている。' }
    ] },
    { lvl: 'N3', point: '被动形', rule: '动词未然形 + れる／られる 表示被动。', example: 'この橋は1990年に建てられた。', exZh: '这座桥建于 1990 年。', quiz: [
      { q: '「読む」的被动形是___。', choices: ['読まれる', '読みれる', '読される', '読れる'], answer: 0, explain: '五段动词 読む→読まれる。' },
      { q: 'この手紙は昨日___。', choices: ['送った', '送られた', '送る', '送って'], answer: 1, explain: '被动过去式 送られた。' }
    ] },
    { lvl: 'N3', point: '使役形', rule: '未然形 + せる／させる 表示让某人做某事。', example: '先生は学生に本を読ませた。', exZh: '老师让学生读书。', quiz: [
      { q: '「行く」的使役形是___。', choices: ['行かせる', '行きせる', '行くせる', '行けせる'], answer: 0, explain: '五段动词 行く→行かせる。' },
      { q: '母は私に野菜を___。', choices: ['食べた', '食べさせた', '食べられた', '食べる'], answer: 1, explain: '使役过去 食べさせた。' }
    ] },

    { lvl: 'N2', point: '～はずだ / ～わけだ', rule: 'はずだ 表示理应如此，わけだ 表示理所当然的结论。', example: '彼が来るはずだ。', exZh: '他应该会来。', quiz: [
      { q: '彼はもう着いた___。', choices: ['はずだ', 'わけがない', 'べきだ', 'ものだ'], answer: 0, explain: '根据推测理应如此用 はずだ。' },
      { q: '三年も勉強したから、上手な___。', choices: ['はずだ', 'わけだ', 'べきだ', 'らしい'], answer: 1, explain: '由前因得出当然结论用 わけだ。' }
    ] },
    { lvl: 'N2', point: '～に対して / ～について', rule: 'に対して 表示对象或对比，について 表示关于。', example: 'この問題について話しましょう。', exZh: '我们谈谈这个问题吧。', quiz: [
      { q: 'その件___説明してください。', choices: ['に対して', 'について', 'によって', 'として'], answer: 1, explain: '关于某事用 について。' },
      { q: '彼はお客様___丁寧だ。', choices: ['について', 'に対して', 'によって', 'とともに'], answer: 1, explain: '对…（对象）用 に対して。' }
    ] },
    { lvl: 'N2', point: '～ざるを得ない', rule: '表示不得不做某事。', example: '雨なので、中止せざるを得ない。', exZh: '因为下雨，不得不中止。', quiz: [
      { q: '規則だから従わ___。', choices: ['ざるを得ない', 'ない', 'なければ', 'ようがない'], answer: 0, explain: '不得不 用 ～ざるを得ない。' },
      { q: 'お金がないので、買わ___。', choices: ['ざるを得ない', 'ないはずだ', 'わけだ', 'べきだ'], answer: 0, explain: '没有钱，不得不 不买。' }
    ] },

    { lvl: 'N1', point: '～を余儀なくされる', rule: '表示被迫不得不（承受某事）。', example: '台風で延期を余儀なくされた。', exZh: '因台风被迫延期。', quiz: [
      { q: '経営難で閉店___。', choices: ['を余儀なくされた', 'を余儀なくさせた', 'ざるを得ない', 'に及んだ'], answer: 0, explain: '被迫 用 を余儀なくされる。' },
      { q: '事故で計画の変更___。', choices: ['を余儀なくされた', 'を余儀なくした', 'ざるを得なかった', 'に至った'], answer: 0, explain: '被动 余儀なくされた。' }
    ] },
    { lvl: 'N1', point: '～に足る / ～に堪える', rule: '表示值得、足以…。', example: '彼は信頼するに足る人物だ。', exZh: '他是值得信赖的人。', quiz: [
      { q: 'この本は読む___価値がある。', choices: ['に足る', 'に限る', 'に至る', 'に及ぶ'], answer: 0, explain: '值得 用 ～に足る。' },
      { q: '彼の演技は賞賛に___。', choices: ['足る', '堪えない', '限る', '至る'], answer: 0, explain: '足以值得赞赏 用 に足る。' }
    ] },
    { lvl: 'N1', point: '～べく / ～んがため', rule: 'べく 表示为了…（书面语），んがため 强调目的。', example: '彼は夢を実現すべく努力している。', exZh: '为了实现梦想而努力。', quiz: [
      { q: '試験に合格___、毎日勉強している。', choices: ['すべく', 'するべく', 'べくして', 'べからず'], answer: 0, explain: '为了… 用 すべく。' },
      { q: '真実を知ら___、彼は調査を続けた。', choices: ['んがため', 'べく', 'べからず', 'ずには'], answer: 0, explain: '为达目的 用 んがため。' }
    ] }
  ],
  ko: [
    { lvl: 'T1', point: '입니다 / 입니까? 正式礼貌体', rule: '名词 + 입니다 表示「是…」，입니까? 构成疑问。', example: '저는 학생입니다.', exZh: '我是学生。', quiz: [
      { q: '저는 매일 한국어를 공부___。', choices: ['해요', '합니다', '했어요', '하고'], answer: 1, explain: '正式礼貌体用 ㅂ니다 → 합니다。' },
      { q: '이것은 책___。', choices: ['이에요', '입니까', '입니다', '해요'], answer: 2, explain: '名词谓语正式体用 입니다。' }
    ] },
    { lvl: 'T1', point: '助词 은/는 与 이/가', rule: '은/는 提示主题，이/가 强调主语或新信息。', example: '저는 한국어를 좋아해요.', exZh: '我喜欢韩语。', quiz: [
      { q: '저___ 학생입니다.', choices: ['가', '는', '를', '에'], answer: 1, explain: '提示主题用 는（有收音用 은）。' },
      { q: '방에 개___ 있어요.', choices: ['는', '가', '를', '에서'], answer: 1, explain: '新信息主语用 가（有收音用 이）。' }
    ] },
    { lvl: 'T1', point: '动词敬语与时态', rule: '아/어요 表示现在时礼貌体，았/었어요 表示过去时。', example: '아침을 먹어요.', exZh: '吃早饭。', quiz: [
      { q: '어제 영화를 ___。', choices: ['봐요', '봤어요', '보고', '보는'], answer: 1, explain: '过去时用 봤어요。' },
      { q: '저는 물을 ___。', choices: ['마셨어요', '마시고', '마시는', '마시다'], answer: 0, explain: '过去时 마셨어요。' }
    ] },

    { lvl: 'T2', point: '过去时 았/었', rule: '动词词干 + 았/었어요 表示过去。', example: '어제 친구를 만났어요.', exZh: '昨天见了朋友。', quiz: [
      { q: '밥을 ___。', choices: ['먹어요', '먹었어요', '먹고', '먹는'], answer: 1, explain: '过去式 먹었어요。' },
      { q: '그는 학교에 ___。', choices: ['가요', '갔어요', '가고', '가는'], answer: 1, explain: '가다 的过去式 갔어요。' }
    ] },
    { lvl: 'T2', point: '比较 ～보다', rule: 'A는 B보다 … 表示 A 比 B 更…。', example: '이 책이 저 책보다 재미있어요.', exZh: '这本书比那本有趣。', quiz: [
      { q: '그는 동생___ 키가 커요.', choices: ['까지', '보다', '처럼', '만'], answer: 1, explain: '比较用 보다。' },
      { q: '영화가 책___ 더 재미있어요.', choices: ['보다', '처럼', '밖에', '마다'], answer: 0, explain: 'A가 B보다 更…。' }
    ] },
    { lvl: 'T2', point: '愿望 ～고 싶다', rule: '动词词干 + 고 싶다 表示想做某事。', example: '한국에 가고 싶어요.', exZh: '我想去韩国。', quiz: [
      { q: '물을 마시___。', choices: ['고 싶어요', '고 싶니다', '서', '면'], answer: 0, explain: '第一人称愿望用 고 싶어요。' },
      { q: '한국어를 배우___。', choices: ['고 싶어요', '기를 원해요', '어요', '면'], answer: 0, explain: '想做 用 배우고 싶어요。' }
    ] },

    { lvl: 'T3', point: '～고 있다 进行／持续', rule: '表示动作正在进行，或状态持续。', example: '그는 3년째 중국어를 공부하고 있어요.', exZh: '他学中文已经三年了。', quiz: [
      { q: '지금 비가 ___。', choices: ['오고 있어요', '왔어요', '와요', '오면'], answer: 0, explain: '进行用 고 있어요。' },
      { q: '그녀는 지금 책을 ___。', choices: ['읽었어요', '읽고 있어요', '읽어요', '읽으면'], answer: 1, explain: '正在读 用 읽고 있어요。' }
    ] },
    { lvl: 'T3', point: '被动 (이/히/리/기 / 되다)', rule: '动词 + 이/히/리/기 或 + 되다 构成被动。', example: '이 다리는 1990년에 지어졌어요.', exZh: '这座桥建于 1990 年。', quiz: [
      { q: '이 편지는 어제 ___。', choices: ['보냈어요', '보내졌어요', '보내요', '보내면'], answer: 1, explain: '被动过去 用 보내졌어요。' },
      { q: '문이 ___。', choices: ['닫았어요', '닫혔어요', '닫아요', '닫으면'], answer: 1, explain: '被动 用 닫혔어요。' }
    ] },
    { lvl: 'T3', point: '使役 ～게 하다', rule: '表示让某人做某事。', example: '선생님은 학생에게 책을 읽게 했어요.', exZh: '老师让学生读书。', quiz: [
      { q: '엄마는 저에게 채소를 ___。', choices: ['먹었어요', '먹게 했어요', '먹어요', '먹으면'], answer: 1, explain: '使役 用 먹게 했어요。' },
      { q: '선생님은 학생을 ___。', choices: ['웃었어요', '웃게 했어요', '웃어요', '웃으면'], answer: 1, explain: '使役 用 웃게 했어요。' }
    ] },

    { lvl: 'T4', point: '～ㄹ 수밖에 없다', rule: '表示不得不…、只能…。', example: '비가 와서 취소할 수밖에 없었어요.', exZh: '因为下雨不得不取消。', quiz: [
      { q: '규칙이라서 따라___。', choices: ['야 해요', 'ㄹ 수밖에 없어요', '면 돼요', '고 싶어요'], answer: 1, explain: '不得不 用 ㄹ 수밖에 없어요。' },
      { q: '돈이 없어서 사지 ___。', choices: ['않아요', 'ㄹ 수밖에 없어요', '고 싶어요', '면 돼요'], answer: 1, explain: '只能不买 用 ㄹ 수밖에 없어요。' }
    ] },
    { lvl: 'T4', point: '～에 대해', rule: '表示关于…、对…。', example: '이 문제에 대해 이야기해 봐요.', exZh: '我们谈谈这个问题吧。', quiz: [
      { q: '그 일___ 설명해 주세요.', choices: ['대해', '위해', '따라', '통해'], answer: 0, explain: '关于 用 에 대해。' },
      { q: '환경___ 관심이 많아요.', choices: ['에 대해', '에 의해', '에 비해', '에 따라'], answer: 0, explain: '对… 用 에 대해。' }
    ] },
    { lvl: 'T4', point: '～기 마련이다', rule: '表示必然如此、理所当然。', example: '노력하면 성공하기 마련이다.', exZh: '只要努力就必然会成功。', quiz: [
      { q: '변화는 누구에게나 일어나___。', choices: ['기 마련이에요', '면 돼요', '고 싶어요', 'ㄹ 수밖에 없어요'], answer: 0, explain: '必然 用 기 마련이다。' },
      { q: '처음엔 실수하___。', choices: ['기 마련이에요', '고 싶어요', '면 돼요', '지 않아요'], answer: 0, explain: '理所当然 用 기 마련이에요。' }
    ] },

    { lvl: 'T5', point: '～도록 하다', rule: '表示使得…、让…达到某状态。', example: '모두가 이용할 수 있도록 안내했어요.', exZh: '为了让所有人都能使用而做了引导。', quiz: [
      { q: '모두가 ___ 수 있도록 안내했어요.', choices: ['이용할', '이용해', '이용하고', '이용하'], answer: 0, explain: '도록 前用 ㄹ 수 있도록。' },
      { q: '실수가 ___ 마련이에요.', choices: ['생기기', '생기고', '생기면', '생겨서'], answer: 0, explain: '기 마련 前用名词化 기。' }
    ] },
    { lvl: 'T5', point: '～에 그치다 / ～에 이르다', rule: '表示范围：止于…／直至…。', example: '그 영향은 전국에 이르기까지 퍼졌어요.', exZh: '其影响扩散至全国。', quiz: [
      { q: '비용은 만 원___ 그쳤어요.', choices: ['에', '을', '이', '과'], answer: 0, explain: '止于 用 에 그치다。' },
      { q: '피해는 전국___ 이르렀어요.', choices: ['에', '을', '로', '과'], answer: 0, explain: '直至 用 에 이르다。' }
    ] },
    { lvl: 'T5', point: '～기 나름이다', rule: '表示取决于…。', example: '성공은 노력하기 나름이다.', exZh: '成功取决于努力。', quiz: [
      { q: '결과는 노력하기 ___。', choices: ['나름이에요', '마련이에요', '위해', '대해'], answer: 0, explain: '取决于 用 기 나름이다。' },
      { q: '성적은 공부하기 ___。', choices: ['나름이에요', '수밖에 없어요', '고 싶어요', '면 돼요'], answer: 0, explain: '取决于 用 기 나름이에요。' }
    ] }
  ]
};
