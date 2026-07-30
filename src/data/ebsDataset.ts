import { EBSPassage } from '../types';

export const INITIAL_EBS_DATASET: EBSPassage[] = [
  // ================= [ 실전모의고사 3회 ] =================
  {
    id: "26053-0198",
    lesson: "실전 3회",
    itemNo: "29번",
    type: "어법성 판단",
    title: "리얼리즘 소설에 대한 허구적 성격과 진실성",
    passage: `Most literary theorists would not regard realist fiction as a lie, though neither of course would they take it to be true. Lies are designed to deceive, whereas Lord of the Flies (A) [is / does] not. Nobody is really asking us to believe that Captain Ahab died leashed to a whale called Moby-Dick. It has also been claimed (B) [that / what] propositions in fiction are neither true nor false because they are not really propositions at all. They simply have the grammatical appearance of them. They are present to pull their weight in a fictional world, not as scraps of real-life information. Even if a piece of fiction is factually accurate down to the last detail, the fact that we call it fiction in the first place (C) [means / meaning] that its factual truth or falsehood is irrelevant. Taking a real-life report without altering a word and calling it a novel or short story changes the relationship of the reader to the text. Among other things, it invites the reader to look for some general moral truth in the work, rather than taking it simply as a specific account with no deeper implications.`,
    translation: `대부분의 문학 이론가들은 리얼리즘 소설을 거짓말로 보지 않겠지만, 물론 그것이 진실이라고 생각하지도 않을 것이다. 거짓말은 속이도록 설계된 반면, '파리대왕'은 그렇지 않다(is not). 누구도 Captain Ahab이 Moby-Dick이라는 고래에 묶여 죽었다는 것을 우리에게 정말 믿으라고 요구하지 않는다. 허구 속의 명제는 실제로 명제가 아니기 때문에 참도 거짓도 아니라는 주장도 제기되어 왔다(that). 그것들은 단순히 명제의 문법적 외양만을 가지고 있을 뿐이다. 그것들은 실제 삶의 정보의 조각으로서가 아니라 허구의 세계에서 제 역할을 다하기 위해 존재한다. 허구의 한 작품이 마지막 세부 사항까지 사실적으로 정확하다 할지라도, 우리가 그것을 애초에 허구라고 부른다는 사실 자체가 그것의 사실적 참이나 거짓이 무관함을 의미한다(means). 단 한 단어도 바꾸지 않고 실제 보고서를 가져와 소설이나 단편 소설이라고 부르는 것은 텍스트에 대한 독자의 관계를 바꾼다. 무엇보다도, 그것은 독자로 하여금 더 깊은 함의가 없는 단순한 특정 설명으로 받아들이기보다 작품 속에서 어떤 일반적인 도덕적 진실을 찾도록 유도한다.`,
    options: [
      "① is …… that …… means",
      "② is …… that …… meaning",
      "③ is …… what …… means",
      "④ does …… that …… means",
      "⑤ does …… what …… meaning"
    ],
    answerIndex: 0,
    explanation: "(A) 대동사 자리로 앞의 is designed to deceive를 받아서 is가 들어갑니다.\n(B) 가주어 It에 대응하여 propositions in fiction... 완벽한 절을 이끄는 진주어 접속사 that이 적절합니다.\n(C) 문장의 주어는 the fact이며, 단수 주어에 호응하는 본동사 means가 필요합니다.",
    syntaxNotes: [
      "...whereas Lord of the Flies (A) is not [designed to deceive]. (is는 앞절의 is designed를 받는 대동사 구문입니다.)",
      "It has also been claimed (B) that [propositions in fiction are neither true nor false...]. (It은 가주어, that절은 진주어입니다.)",
      "the fact [that we call it fiction in the first place] (C) means [that its factual truth or falsehood is irrelevant]. (the fact가 주어, means가 본동사입니다.)"
    ],
    vocabList: [
      { word: "literary theorist", meaning: "문학 이론가" },
      { word: "deceive", meaning: "속이다" },
      { word: "leash", meaning: "줄에 매어 두다" },
      { word: "proposition", meaning: "명제, 주법적 진술" },
      { word: "grammatical", meaning: "문법적인" },
      { word: "pull one's weight", meaning: "제 역할을 다하다" },
      { word: "irrelevant", meaning: "무관한, 상관없는" },
      { word: "implication", meaning: "함의, 암시" }
    ]
  },
  {
    id: "26053-0199",
    lesson: "실전 3회",
    itemNo: "30번",
    type: "어휘 판단",
    title: "놀이와 고된 연습의 관계 및 몰입의 조건",
    passage: `When it comes to activities requiring developmental skill, the idea of work proves interesting. Musicians play music, but most also appreciate that skill development, especially for instrumental music, ① requires practice. And while musical practice need not be the kind of drudgery it too often is (thanks to unimaginative music teaching), technical development ② rarely occurs without effort. For the early twentieth-century play movement writer Henry Curtis, the desire to play provides the incentive for work: “No one can become an expert in such a game as baseball without persistent and often disagreeable practice. Play furnishes an adequate ③ motive for this practice.” The important question here is whether a person (usually a child) views “disagreeable practice” in activities such as sports or the arts as a form of delayed reward (where the ends ④ justify the means, as it were) or as a form of activity distortion. Aristotle, for example, recognized that when a concern for meeting standards becomes ⑤ moderate, the play element disappears, and play is converted into work.`,
    translation: `발달적 기술을 요하는 활동에 있어서 일이라는 개념은 흥미롭게 다가온다. 음악가들은 음악을 연주하지만, 대다수는 특히 기악 연주 시 기술 발달이 연습을 필요로 한다는 것을 알고 있다. 음악 연습이 상상력 없는 음악 지도 때문에 너무 자주 그렇듯이 고역일 필요는 없지만, 기술적 발달은 노력 없이 거의 일어나지 않는다. 20세기 초 놀이 운동가인 Henry Curtis에게 놀고자 하는 욕구는 일에 대한 동기를 제공한다: "지속적이고 때로는 유쾌하지 않은 연습 없이 야구와 같은 경기에서 전문가가 될 수는 없다. 놀이는 이러한 연습에 적절한 동기를 제공한다." 여기서 중요한 질문은 한 사람(보통 아이)이 스포츠나 예술 같은 활동에서 "유쾌하지 않은 연습"을 유예된 보상의 한 형태로 보느냐, 아니면 활동의 왜곡으로 보느냐이다. 예를 들어 아리스토텔레스는 기준을 충족하려는 관심이 지나치게 커질 때(moderate -> excessive 등) 놀이 요소가 사라지고 놀이가 일로 변환된다는 점을 인식했다.`,
    options: [
      "① requires",
      "② rarely",
      "③ motive",
      "④ justify",
      "⑤ moderate"
    ],
    answerIndex: 4,
    explanation: "기준이나 표준을 맞추려는 관심이 '과도해질(excessive)' 때 놀이 고유의 즐거운 요소가 사라지고 고역스러운 '일'로 변한다는 문맥이므로, ⑤의 moderate(절제된, 온건한)는 어색하며 excessive 등의 어휘로 수정해야 합니다.",
    syntaxNotes: [
      "When it comes to activities [requiring developmental skill]... (When it comes to ~는 '~에 관한 한'을 뜻하는 전치사적 표현입니다.)",
      "...whether a person views 'disagreeable practice' ... as a form of delayed reward [where the ends justify the means]... (view A as B 구문과 관계부사 where절이 결합되어 있습니다.)"
    ],
    vocabList: [
      { word: "developmental skill", meaning: "발달적 기술" },
      { word: "drudgery", meaning: "고된 일, 고역" },
      { word: "unimaginative", meaning: "상상력이 부족한" },
      { word: "incentive", meaning: "동기, 유인" },
      { word: "persistent", meaning: "끈질긴, 지속적인" },
      { word: "disagreeable", meaning: "불쾌한, 싫은" },
      { word: "furnish", meaning: "제공하다" },
      { word: "distortion", meaning: "왜곡" },
      { word: "justify", meaning: "정당화하다" }
    ]
  },
  {
    id: "26053-0200",
    lesson: "실전 3회",
    itemNo: "31번",
    type: "빈칸 추론",
    title: "분산된 지능과 협력을 통한 인간의 적응적 성공",
    passage: `The idea that nature and culture are connected is widely accepted among both anthropologists and cognitive scientists; it is almost a commonplace. What makes us special, or the key to our success, is not what is inside us, so to speak, in our brains, but rather the ways that we have learned to ________________________, the strategies of distributed intelligence that we have mastered, our tools and technologies. On its own, the human individual is a naked ape who would probably not fare much better than a baby if plopped down in the deserts of Australasia or the jungles of South America. But dressed, equipped, trained, armed with the lore of a community, and accompanied by others, the human being is indomitable. We are the smartest species there is, but not because you and I are so smart. It is the work of the 'we' that explains human adaptive success.`,
    translation: `자연과 문화가 연결되어 있다는 생각은 인류학자들과 인지과학자들 사이에서 널리 받아들여지고 있으며, 이는 거의 상식에 가깝다. 우리를 특별하게 만드는 것, 즉 우리 성공의 열쇠는 말하자면 우리 내부, 즉 뇌 속에 있는 것이 아니라 우리가 '협력하는(cooperate)' 법을 배운 방식, 우리가 습득한 분산된 지능의 전략, 우리의 도구와 기술이다. 인간 개별 독립체 그 자체만으로는 오스트랄라시아의 사막이나 남미의 정글에 떨어뜨려지면 아기보다 나을 것이 없는 벌거벗은 원숭이에 불과하다. 하지만 옷을 입고, 장비를 갖추고, 훈련받고, 공동체의 구전 지식으로 무장하고, 다른 이들과 동행할 때 인간은 굴복시킬 수 없는 존재가 된다. 우리는 존재하는 가장 스마트한 종이지만, 당신과 내가 그렇게 똑똑해서가 아니다. 인간의 적응적 성공을 설명하는 것은 바로 '우리'라는 집단의 작용이다.`,
    options: [
      "① innovate",
      "② compete",
      "③ prioritize",
      "④ cooperate",
      "⑤ investigate"
    ],
    answerIndex: 3,
    explanation: "인간 개개인은 약하지만 공동체의 지식, 분산된 지능, 동행하는 타인들과의 집단적 결속('the work of the we')을 통해 성공했다는 내용이므로, 빈칸에는 'cooperate(협력하다)'가 가장 적절합니다.",
    syntaxNotes: [
      "What makes us special ... is not [what is inside us], but rather [the ways that we have learned to cooperate]... (not A but B 구문으로 'A가 아니라 B'를 강조합니다.)",
      "It is [the work of the 'we'] that explains human adaptive success. (It - that 강조구문으로 'the work of the we'를 강조하고 있습니다.)"
    ],
    vocabList: [
      { word: "anthropologist", meaning: "인류학자" },
      { word: "cognitive scientist", meaning: "인지과학자" },
      { word: "commonplace", meaning: "흔한 일, 상식" },
      { word: "distributed intelligence", meaning: "분산된 지능" },
      { word: "plop", meaning: "쿵 떨어뜨리다" },
      { word: "indomitable", meaning: "굴복시키지 못할, 불굴의" },
      { word: "adaptive success", meaning: "적응적 성공" },
      { word: "cooperate", meaning: "협력하다" }
    ]
  },
  {
    id: "26053-0201",
    lesson: "실전 3회",
    itemNo: "32번",
    type: "빈칸 추론",
    title: "과거 기후 데이터 복원을 통한 미래 기후 예측의 중요성",
    passage: `Reconstructing past climate conditions is essential for understanding the mechanisms driving global climate change. Paleoclimatologists use proxies—such as ice cores, tree rings, and ocean sediments—to infer temperatures and atmospheric compositions from thousands or even millions of years ago. These natural archives provide a baseline against which modern climatic shifts can be measured. Without this historical perspective, it would be virtually impossible to determine whether current global warming trends are unprecedented or merely part of natural climatic oscillations. Furthermore, long-term climate records allow scientists to test and refine computer models that forecast future environmental scenarios. Ultimately, analyzing past climate data enables researchers to ________________________ with greater accuracy and confidence.`,
    translation: `과거 기후 조건을 복원하는 것은 지구 기후 변화를 이끄는 메커니즘을 이해하는 데 필수적이다. 고기후학자들은 빙하 코어, 나이테, 해양 침전물과 같은 프록시(대리 지표)를 사용하여 수천 년 또는 수백만 년 전의 온도와 대기 조성을 추정한다. 이러한 자연의 기록보관소는 현대 기후 변화를 측정할 수 있는 기준선(baseline)을 제공한다. 이러한 역사적 관점이 없다면 현재의 지구 온난화 경향이 전례가 없는 것인지 아니면 단순히 자연적 기후 진동의 일부인지 판단하는 것이 사실상 불가능할 것이다. 나아가 장기 기후 기록은 과학자들이 미래 환경 시나리오를 예측하는 컴퓨터 모델을 검증하고 개선할 수 있게 해준다. 궁극적으로 과거 기후 데이터를 분석하는 것은 연구자들이 더 높은 정확성과 신뢰성으로 ________________________ 수 있게 해준다.`,
    options: [
      "① forecast potential climate trajectories",
      "② preserve endangered marine ecosystems",
      "③ accelerate renewable energy development",
      "④ reduce industrial carbon emissions",
      "⑤ ignore short-term weather fluctuations"
    ],
    answerIndex: 0,
    explanation: "과거 기후 프록시 데이터(빙하 코어, 나이테 등)를 통해 기후의 변화 패턴과 기준선을 파악하고 컴퓨터 시뮬레이션 모델을 정교화함으로써, 미래의 환경 및 기후 변화 궤적을 더 정확하게 예측할 수 있다는 내용이므로 빈칸에는 ① '잠재적인 기후 궤적을 예측하다(forecast potential climate trajectories)'가 들어가는 것이 가장 적절합니다.",
    syntaxNotes: [
      "Paleoclimatologists use proxies ... [to infer temperatures and atmospheric compositions...]. (to infer는 목적을 나타내는 부사적 용법의 부정사입니다.)",
      "Without this historical perspective, it would be virtually impossible [to determine whether current global warming trends are unprecedented...]. (가정법 과거 구문 [Without = If it were not for]과 가주어-진주어 구문이 결합되어 있습니다.)"
    ],
    vocabList: [
      { word: "paleoclimatologist", meaning: "고기후학자" },
      { word: "proxy", meaning: "대리 지표, 프록시" },
      { word: "sediment", meaning: "침전물, 퇴적물" },
      { word: "baseline", meaning: "기준선, 기준점" },
      { word: "unprecedented", meaning: "전례 없는" },
      { word: "oscillation", meaning: "변동, 진동" },
      { word: "trajectory", meaning: "궤적, 경로" }
    ]
  },
  {
    id: "26053-0202",
    lesson: "실전 3회",
    itemNo: "33번",
    type: "빈칸 추론",
    title: "과학적 발견에서 가설의 우연적 검증과 열린 탐색 자세",
    passage: `Serendipity plays a significant role in scientific discovery, but it rarely favors an unprepared mind. Great breakthroughs often occur when scientists notice unexpected anomalies during routine experiments. Instead of discarding strange results as mere errors, perceptive researchers investigate the underlying causes. This process requires a delicate balance between theoretical rigor and cognitive flexibility. If scientists strictly adhere to pre-existing hypotheses without room for surprise, they risk missing revolutionary insights. As Louis Pasteur famously remarked, chance favors only the prepared mind. Therefore, progress in science relies not only on systematic hypothesis testing, but also on the willingness of researchers to ________________________.`,
    translation: `우연한 발견(세렌디피티)은 과학적 발견에서 중요한 역할을 하지만, 준비되지 않은 마음에는 거의 찾아오지 않는다. 위대한 획기적 발판은 대개 과학자들이 일상적인 실험 중에 예상치 못한 이상 현상(anomalies)을 포착할 때 발생한다. 통찰력 있는 연구자들은 이상한 결과를 단지 오류로 치부해 버리는 대신, 그 근본 원인을 탐구한다. 이 과정은 이론적 엄격함과 인지적 유연성 사이의 미묘한 균형을 필요로 한다. 만약 과학자들이 뜻밖의 결과에 대한 여지 없이 기존 가설에만 엄격하게 집착한다면, 혁신적인 통찰을 놓칠 위험이 있다. 루이 파스퇴르가 유명하게 말했듯, 기회는 준비된 마음만을 따르는 법이다. 따라서 과학의 발전은 체계적인 가설 검증뿐만 아니라 연구자들이 ________________________ 기꺼이 하는 태도에 의존한다.`,
    options: [
      "① stick strictly to original experimental protocols",
      "② embrace unexpected findings and alter their perspective",
      "③ avoid collaborating with scientists from other fields",
      "④ publish results immediately without peer review",
      "⑤ rely solely on computer-simulated models"
    ],
    answerIndex: 1,
    explanation: "과학적 혁신은 단순한 체계적 가설 검증뿐만 아니라, 예상치 못한 이상 결과(anomalies)나 우연한 일탈을 관찰했을 때 이를 버리지 않고 인지적 유연성을 가지고 탐구하려는 태도에서 비롯된다는 글의 중심 내용입니다. 따라서 빈칸에는 ② '예상치 못한 발견을 포용하고 관점을 바꾸다(embrace unexpected findings and alter their perspective)'가 가장 적절합니다.",
    syntaxNotes: [
      "Instead of discarding strange results as mere errors, perceptive researchers investigate... (Instead of ~ing 구문으로 '~하는 대신에'를 나타냅니다.)",
      "If scientists strictly adhere to pre-existing hypotheses ..., they risk [missing revolutionary insights]. (risk + 동명사 구문으로 '~할 위험을 무릅쓰다'를 뜻합니다.)"
    ],
    vocabList: [
      { word: "serendipity", meaning: "우연한 발견, 세렌디피티" },
      { word: "anomaly", meaning: "이상 현상, 변칙" },
      { word: "discard", meaning: "버리다, 치우다" },
      { word: "perceptive", meaning: "통찰력 있는, 감각이 예리한" },
      { word: "adhere to", meaning: "~에 고수하다, 집착하다" },
      { word: "cognitive flexibility", meaning: "인지적 유연성" }
    ]
  },
  {
    id: "26053-0203",
    lesson: "실전 3회",
    itemNo: "34번",
    type: "빈칸 추론",
    title: "디지털 환경에서 아카이브 보존과 디지털 휘발성",
    passage: `In the digital age, information appears virtually indestructible because digital files can be copied indefinitely without degradation. However, digital preservation presents a paradox: digital formats become obsolete far more rapidly than physical paper or stone inscriptions. Software updates, hardware evolution, and cloud platform closures constantly threaten the accessibility of digital records. Without active migration and digital curation, data stored on obsolete magnetic tapes or outdated file formats can become completely unreadable within just a decade or two. Consequently, preserving digital heritage requires continuous maintenance rather than passive storage, demonstrating that digital longevity actually depends on ________________________.`,
    translation: `디지털 시대에는 디지털 파일이 품질 저하 없이 무한히 복사될 수 있기 때문에 정보가 사실상 파괴 불가능해 보인다. 그러나 디지털 보존은 하나의 역설을 제시한다. 디지털 포맷은 종이나 석판 각인보다 훨씬 빠르게 진부화(노후화)된다. 소프트웨어 업데이트, 하드웨어 진화, 클라우드 플랫폼 폐쇄는 디지털 기록의 접근성을 끊임없이 위협한다. 적극적인 데이터 이전과 디지털 큐레이션이 없다면 구식 자기 테이프나 진부한 파일 형식에 저장된 데이터는 단 10~20년 만에 완전히 읽을 수 없게 될 수 있다. 결과적으로 디지털 유산을 보존하는 것은 수동적 보관이 아닌 지속적인 관리를 필요로 하며, 이는 디지털 데이터의 수명이 실제로 ________________________에 달려 있음을 보여준다.`,
    options: [
      "① the physical strength of storage media",
      "② constant human intervention and technical updates",
      "③ stopping technological advancement altogether",
      "④ restricting public access to online databases",
      "⑤ relying exclusively on offline paper archives"
    ],
    answerIndex: 1,
    explanation: "디지털 데이터는 영구 보존이 가능해 보이지만, 포맷과 하드웨어의 빠른 노후화 때문에 수동적 저장에 그치지 않고 인간의 지속적인 데이터 이전, 큐레이션, 관리가 이루어져야만 데이터가 지속될 수 있다는 내용입니다. 따라서 빈칸에는 ② '지속적인 인간의 개입과 기술적 업데이트(constant human intervention and technical updates)'가 적절합니다.",
    syntaxNotes: [
      "...digital formats become obsolete far more rapidly [than physical paper or stone inscriptions]. (비교급 far more ~ than 구문으로 far가 비교급을 강조합니다.)",
      "Without active migration and digital curation, data [stored on obsolete magnetic tapes...] can become completely unreadable... (stored는 과거분사로 data를 후의수식합니다.)"
    ],
    vocabList: [
      { word: "indestructible", meaning: "파괴할 수 없는" },
      { word: "degradation", meaning: "품질 저하, 쇠퇴" },
      { word: "obsolete", meaning: "구식의, 더 이상 안 쓰이는" },
      { word: "inscription", meaning: "비문, 각인" },
      { word: "curation", meaning: "큐레이션, 수집 관리" },
      { word: "longevity", meaning: "수명, 장수" }
    ]
  },
  {
    id: "26053-0204",
    lesson: "실전 3회",
    itemNo: "35번",
    type: "무관한 문장",
    title: "시각적 착시(Optical Illusions)와 뇌의 인지 해석 과정",
    passage: `Optical illusions occur when there is a mismatch between physical reality and our visual perception. These visual phenomena provide valuable insights into how the brain processes sensory input. ① Rather than acting like a simple camera recording raw light, the brain actively interprets visual information based on context, expectation, and past experience. ② For instance, when looking at ambiguous geometric patterns, the brain makes educated guesses to construct a coherent three-dimensional representation. ③ Geometric art has gained popularity in modern interior design due to its clean lines and aesthetic simplicity. ④ This reconstructive process explains why two people can view the exact same image yet perceive dramatically different shapes or shades. ⑤ Thus, optical illusions highlight the active, constructive nature of human perception rather than passive reception.`,
    translation: `시각적 착시(Optical illusions)는 물리적 현실과 우리의 시각적 지각 사이에 불일치가 있을 때 발생한다. 이러한 시각적 현상은 뇌가 감각 입력을 어떻게 처리하는지에 대한 귀중한 통찰을 제공한다. ① 뇌는 빛 그대로를 기록하는 단순한 카메라처럼 작동하기보다는 맥락, 기대, 과거 경험에 기반하여 시각 정보를 적극적으로 해석한다. ② 예를 들어 기하학적 모호 패턴을 볼 때, 뇌는 일관된 3차원 표현을 구성하기 위해 박식한 추측을 한다. ③ (기하학적 미술은 깔끔한 선과 미학적 단순함 덕분에 현대 인테리어 디자인에서 인기를 얻었다.) ④ 이러한 재구성 과정은 왜 두 사람이 완전히 동일한 이미지를 보면서도 극적으로 다른 모양이나 명암을 인지할 수 있는지를 설명해 준다. ⑤ 따라서 시각적 착시는 수동적인 수용이 아닌 인간 지각의 능동적이고 구성적인 본질을 부각시킨다.`,
    options: [
      "① Rather than acting like a simple camera...",
      "② For instance, when looking at ambiguous...",
      "③ Geometric art has gained popularity in modern interior design...",
      "④ This reconstructive process explains why two people...",
      "⑤ Thus, optical illusions highlight the active..."
    ],
    answerIndex: 2,
    explanation: "착시 현상을 통해 뇌가 감각 정보를 수동적으로 받아들이지 않고 주관적 맥락과 기대에 따라 능동적으로 재구성한다는 인지적 기제를 설명하는 글입니다. ③번 문장은 현대 인테리어 디자인에서의 기하학 예술의 인기에 관한 내용으로, 뇌의 시각 지각 처리 기제라는 전체 흐름에서 벗어나므로 무관한 문장입니다.",
    syntaxNotes: [
      "Rather than acting like a simple camera ..., the brain actively interprets visual information... (Rather than + 동명사 구문입니다.)",
      "This reconstructive process explains [why two people can view the exact same image yet perceive dramatically different shapes...]. (explains의 목적어로 간접의문문 why절이 쓰였습니다.)"
    ],
    vocabList: [
      { word: "optical illusion", meaning: "시각적 착시" },
      { word: "mismatch", meaning: "부조화, 불일치" },
      { word: "sensory input", meaning: "감각 입력" },
      { word: "ambiguous", meaning: "모호한, 다의적인" },
      { word: "coherent", meaning: "일관성 있는, 통일된" },
      { word: "reconstructive", meaning: "재구성적인" }
    ]
  },
  {
    id: "26053-0205",
    lesson: "실전 3회",
    itemNo: "36번",
    type: "글의 순서",
    title: "도시 열섬 현상(Urban Heat Island Effect)과 녹지 조성",
    passage: `The Urban Heat Island (UHI) effect is a phenomenon where urban areas experience significantly higher temperatures than surrounding rural areas. This temperature disparity is primarily caused by dense concentrations of concrete, asphalt, and tall buildings that absorb and retain solar heat.

(A) In addition to structural heat absorption, human activities such as industrial machinery, vehicle emissions, and air conditioning systems generate substantial waste heat, further intensifying urban warming.
(B) To mitigate these elevated temperatures, urban planners are increasingly implementing green infrastructure solutions. Planting trees, installing green roofs, and expanding public parks help cool cities through shade and evapotranspiration.
(C) These natural cooling mechanisms not only lower ambient air temperatures but also reduce energy consumption needed for cooling buildings during hot summer months.`,
    translation: `도시 열섬(UHI) 현상은 도시 지역이 주변 시골 지역보다 현저히 높은 기온을 겪는 현상이다. 이러한 온도 차이는 주로 태양열을 흡수하고 보유하는 콘크리트, 아스팔트, 높은 건물의 조밀한 집약 때문에 발생한다.

(A) 구조적 열 흡수에 더해, 산업 기계, 자동차 배가스, 에어컨 시스템과 같은 인간 활동은 상당한 인공 폐열을 발생시켜 도시 온난화를 더욱 심화시킨다.
(B) 이러한 상승된 온도를 완화하기 위해 도시 계획가들은 녹색 기반 시설 솔루션을 점점 더 도입하고 있다. 나무를 심고, 옥상 정원을 설치하고, 공공 공원을 확장하는 것은 그늘과 증발산 작용을 통해 도시를 식히는 데 도움이 된다.
(C) 이러한 자연적 냉각 메커니즘은 주변 공기 온도를 낮출 뿐만 아니라 더운 여름철 동안 건물을 냉각하는 데 필요한 에너지 소비도 줄여준다.`,
    options: [
      "① (A) - (C) - (B)",
      "② (B) - (A) - (C)",
      "③ (B) - (C) - (A)",
      "④ (A) - (B) - (C)",
      "⑤ (C) - (A) - (B)"
    ],
    answerIndex: 3,
    explanation: "주어진 글에서 도시 열섬 현상의 일차적 원인(건물/도로의 열 흡수)을 제시한 후, 'In addition to structural heat absorption'이라는 연결어를 통해 추가 원인(인공 폐열 발생)을 설명하는 (A)가 이어집니다. 그 후 이러한 열섬 현상을 해결하기 위한 완화책으로 녹지 조성을 언급하는 (B)가 오고, (B)의 녹지 메커니즘을 'These natural cooling mechanisms'로 받아 에너지 절감 효과를 덧붙이는 (C)로 마무리되는 ④ (A) - (B) - (C) 가 올바른 순서입니다.",
    syntaxNotes: [
      "The Urban Heat Island (UHI) effect is a phenomenon [where urban areas experience significantly higher temperatures...]. (관계부사 where절이 선행사 phenomenon을 수식합니다.)",
      "These natural cooling mechanisms [not only lower ambient air temperatures but also reduce energy consumption...]. (not only A but also B 구문으로 동사 lower와 reduce가 병렬 연결되었습니다.)"
    ],
    vocabList: [
      { word: "urban heat island", meaning: "도시 열섬" },
      { word: "disparity", meaning: "격차, 불균형" },
      { word: "mitigate", meaning: "완화하다, 줄이다" },
      { word: "evapotranspiration", meaning: "증발산(증발+증산 작용)" },
      { word: "ambient", meaning: "주위의, 잔잔한" }
    ]
  },
  {
    id: "26053-0206",
    lesson: "실전 3회",
    itemNo: "37번",
    type: "글의 순서",
    title: "소리(음향) 전달과 매질의 밀도 차이",
    passage: `Sound travels as mechanical waves through different physical mediums, requiring matter to transmit its vibrational energy. The speed at which sound travels depends heavily on the density and elasticity of the medium.

(A) In solids, such as iron or wood, molecules are tightly packed together, allowing acoustic vibrations to pass rapidly from one particle to the next. Consequently, sound moves much faster through solids than through liquids or gases.
(B) Gases, on the other hand, have widely spaced molecules, which results in slower wave transmission. Air, for example, conducts sound at roughly 343 meters per second, a fraction of its speed in steel.
(C) Understanding these transmission differences is crucial for acoustic engineering. Engineers design noise barrier walls and soundproofing materials by choosing substances that absorb or reflect specific vibrational frequencies.`,
    translation: `소리는 다양한 물리적 매질을 통해 기계적 파동으로 이동하며, 진동 에너지를 전달하기 위해 물질을 필요로 한다. 소리가 이동하는 속도는 매질의 밀도와 탄성에 크게 의존한다.

(A) 철이나 나무 같은 고체에서는 분자들이 빽빽하게 뭉쳐 있어서 음향 진동이 한 입자에서 다음 입자로 빠르게 전달될 수 있다. 결과적으로 소리는 액체나 기체보다 고체를 통해 훨씬 빠르게 이동한다.
(B) 반면에 기체는 분자 간격이 넓게 떨어져 있어서 더 느린 파동 전달을 초래한다. 예를 들어 공기는 소리를 초당 약 343미터로 전달하는데, 이는 강철에서의 속도의 극히 일부분에 불과하다.
(C) 이러한 전달 차이를 이해하는 것은 음향 공학에서 매우 중요하다. 엔지니어들은 특정 진동 주파수를 흡수하거나 반사하는 물질을 선택하여 방음벽과 음향 차단 재료를 설계한다.`,
    options: [
      "① (A) - (B) - (C)",
      "② (A) - (C) - (B)",
      "③ (B) - (A) - (C)",
      "④ (B) - (C) - (A)",
      "⑤ (C) - (A) - (B)"
    ],
    answerIndex: 0,
    explanation: "소리의 전파가 매질의 밀도에 의존한다는 주어진 글 뒤에, 밀도가 높은 고체에서의 빠른 소리 전파를 설명하는 (A)가 오고, 'Gases, on the other hand'로 대조하며 밀도가 낮은 기체에서의 느린 소리 전파를 다루는 (B)가 이어지며, 이러한 매질별 전달 차이(these transmission differences)를 음향 공학의 방음 재료 설계에 응용함을 정리하는 (C)로 끝맺는 ① (A) - (B) - (C) 가 올바른 순서입니다.",
    syntaxNotes: [
      "The speed [at which sound travels] depends heavily on the density... (전치사+관계대명사 at which 구문이 speed를 수식합니다.)",
      "In solids ..., molecules are tightly packed together, [allowing acoustic vibrations to pass rapidly...]. (allowing은 결과를 나타내는 분사구문이며 allow + O + to V 형식을 취합니다.)"
    ],
    vocabList: [
      { word: "medium", meaning: "매질, 수단" },
      { word: "vibrational energy", meaning: "진동 에너지" },
      { word: "acoustic", meaning: "음향의, 소리의" },
      { word: "elasticity", meaning: "탄성, 탄력성" },
      { word: "soundproofing", meaning: "방음, 차음" }
    ]
  },
  {
    id: "26053-0207",
    lesson: "실전 3회",
    itemNo: "38번",
    type: "문장 삽입",
    title: "동물 무리의 동기화된 집단 행동과 상명하달식 리더의 부재",
    passage: `Flocks of birds and schools of fish display astonishing coordination during collective movement. Thousands of individuals move in perfect unison, changing direction instantaneously without colliding. ( ① ) Early naturalists believed these movements were orchestrated by a designated group leader sending signals. ( ② ) Modern computational models reveal that complex collective behavior emerges from simple, local interaction rules followed by each individual. ( ③ ) Each bird or fish simply adjusts its velocity based on its immediate neighbors, maintaining a minimum distance while matching speed and alignment. ( ④ ) No central control or master mind is required to achieve this harmonious group flight. ( ⑤ ) Consequently, even minor local adjustments by a few individuals can ripple rapidly through the entire group, giving the illusion of a single conscious entity.`,
    boxSentence: `Recent mathematical simulations have disproved this top-down command theory, demonstrating that no leader is necessary.`,
    translation: `새 떼와 물고기 떼는 집단 이동 동안 놀라운 조화를 보여준다. 수천 마리의 개체들이 충돌 없이 즉각 방향을 바꾸며 완벽한 일치 속에서 움직인다. ( ① ) 초기 자연학자들은 이러한 움직임이 신호를 보내는 지정된 집단 리더에 의해 지휘된다고 믿었다. <u class="font-bold underline decoration-blue-500">[최근의 수학적 시뮬레이션은 이러한 상명하달식 명령 이론이 틀렸음을 입증하며, 리더가 전혀 필요하지 않음을 보여주었다.]</u> ( ② ) 현대의 컴퓨터 모델은 복잡한 집단 행동이 각 개체가 따르는 단순하고 국소적인 상호작용 규칙에서 출현함을 밝혀낸다. ( ③ ) 각 새나 물고기는 속도와 정렬을 맞추면서 최소 거리를 유지한 채, 가장 가까운 이웃들에 기반해 자신의 속도를 조절할 뿐이다. ( ④ ) 이러한 조화로운 집단 비행을 달성하는 데 중앙 통제나 총괄 지휘자는 필요하지 않다. ( ⑤ ) 결과적으로 몇몇 개체의 작은 국소적 조절조차 집단 전체로 신속히 파급되어 하나의 단일한 의식적 존재라는 착각을 준다.`,
    options: [
      "①",
      "②",
      "③",
      "④",
      "⑤"
    ],
    answerIndex: 1,
    explanation: "①번 위치 바로 앞의 'Early naturalists believed these movements were orchestrated by a designated group leader...'는 과거의 리더 존재설(상명하달식 이론)을 언급합니다. 박스 문장의 'this top-down command theory'는 바로 이 과거 자연학자들의 이론을 지칭하므로 박스 문장은 ②번 위치에 들어가야 하며, ②번 뒤에서 리더 없이 자율적으로 나타나는 현대의 복잡계 계산 모델(computational models)로 논지가 자연스럽게 이어집니다.",
    syntaxNotes: [
      "Recent mathematical simulations have disproved this top-down command theory, [demonstrating that no leader is necessary]. (demonstrating은 결과를 설명하는 분사구문입니다.)",
      "No central control or master mind is required [to achieve this harmonious group flight]. (to achieve는 목적을 나타내는 부사적 용법의 부정사입니다.)"
    ],
    vocabList: [
      { word: "unison", meaning: "조화, 일치" },
      { word: "orchestrate", meaning: "조직화하다, 지휘하다" },
      { word: "top-down", meaning: "상명하달식의" },
      { word: "ripple", meaning: "잔물결을 이루다, 파급되다" },
      { word: "entity", meaning: "독립체, 존재" }
    ]
  },
  {
    id: "26053-0208",
    lesson: "실전 3회",
    itemNo: "39번",
    type: "문장 삽입",
    title: "경제적 인센티브와 내재적 동기(Intrinsic Motivation)의 상충",
    passage: `Offering financial incentives is a standard managerial strategy used to boost performance and encourage productivity. Employers assume that monetary rewards will naturally motivate workers to put forth extra effort. ( ① ) In many routine tasks, financial bonuses do indeed lead to higher output and speed. ( ② ) However, when tasks require creative problem-solving or intrinsic interest, cash rewards can produce unexpected negative consequences. ( ③ ) Psychological research indicates that introducing extrinsic rewards for inherently satisfying tasks can reduce an individual's internal drive, a phenomenon known as the overjustification effect. ( ④ ) When people begin to view an activity as a means to earn money rather than a source of personal fulfillment, their engagement often declines once the reward is removed. ( ⑤ ) Thus, organizations must carefully evaluate task characteristics before applying financial incentives.`,
    boxSentence: `This external pressure often crowds out genuine enthusiasm, making the task feel like a burdensome obligation rather than a rewarding pursuit.`,
    translation: `금전적 인센티브를 제공하는 것은 성과를 올리고 생산성을 독려하기 위해 사용되는 표준적인 경영 전략이다. 고용주들은 금전적 보상이 근로자들로 하여금 자연스럽게 추가적인 노력을 기울이도록 동기부여할 것이라고 가정한다. ( ① ) 많은 정형화된 업무에서 금전적 보너스는 실제로 더 높은 산출량과 속도로 이어진다. ( ② ) 하지만 업무가 창의적인 문제 해결이나 내재적 흥미를 필요로 할 때, 현금 보상은 예상치 못한 부작용을 낳을 수 있다. ( ③ ) 심리학 연구는 본질적으로 만족스러운 업무에 외재적 보상을 도입하는 것이 개인이 가진 내부 동기를 감소시킬 수 있음을 보여주며, 이는 과잉 정당화 효과(overjustification effect)로 알려진 현상이다. <u class="font-bold underline decoration-blue-500">[이러한 외적 압박은 흔히 진정한 열정을 밀어내어, 그 업무를 보람 있는 추구라기보다는 부담스러운 의무처럼 느끼게 만든다.]</u> ( ④ ) 사람들이 어떤 활동을 개인적 성취의 원천이라기보다는 돈을 벌기 위한 수단으로 보기 시작할 때, 보상이 제거되면 그들의 참여도는 흔히 감소한다. ( ⑤ ) 따라서 조직은 금전적 인센티브를 적용하기 전에 업무 특성을 신중히 평가해야 한다.`,
    options: [
      "①",
      "②",
      "③",
      "④",
      "⑤"
    ],
    answerIndex: 3,
    explanation: "③번 위치 뒤의 문장에서 외재적 보상이 내재적 동기를 떨어뜨리는 '과잉 정당화 효과'를 언급하고 있습니다. 박스 문장의 'This external pressure'는 바로 이 외재적 보상으로 인한 외적 압박을 가리키며, 순수한 열정을 밀어내고 과업을 부담스러운 의무로 느끼게 만든다는 부연을 제공하므로 ④번 위치에 들어가는 것이 가장 자연스럽습니다.",
    syntaxNotes: [
      "Psychological research indicates [that introducing extrinsic rewards for inherently satisfying tasks can reduce an individual's internal drive]... (that절이 indicates의 목적어 역할을 합니다.)",
      "This external pressure often crowds out genuine enthusiasm, [making the task feel like a burdensome obligation...]. (making은 결과를 나타내는 분사구문이며 make + O + OC[동사원형] 구조입니다.)"
    ],
    vocabList: [
      { word: "extrinsic reward", meaning: "외재적 보상" },
      { word: "overjustification effect", meaning: "과잉 정당화 효과" },
      { word: "crowd out", meaning: "밀어내다, 제쳐놓다" },
      { word: "burdensome", meaning: "부담스러운" },
      { word: "fulfillment", meaning: "성취, 충족" }
    ]
  },
  {
    id: "26053-0209",
    lesson: "실전 3회",
    itemNo: "40번",
    type: "요약문 완성",
    title: "식물의 휘발성 유기화합물(VOCs)을 통한 방어 및 화학적 대화",
    passage: `When plants are attacked by herbivorous insects, they do not suffer passively. Instead, they emit airborne chemical signals known as volatile organic compounds (VOCs). These chemical messages serve a dual function in plant defense strategy. First, they alert neighboring plants of the same or different species to the presence of predators, prompting them to preemptively produce defensive toxins or bitter chemicals in their leaves. Second, VOCs act as chemical distress calls that attract natural predators of the attacking insects, such as parasitic wasps or predatory mites. Through this intricate chemical communication network, plants coordinate collective defenses and recruit external bodyguard species to ensure survival.`,
    summarySentence: `Plants attacked by pests release airborne chemicals that (A) [warn] neighboring plants to activate defenses and simultaneously (B) [attract] natural predators to eliminate the threat.`,
    translation: `식물이 초식 곤충에게 공격받을 때, 식물들은 수동적으로 고통받지만은 않는다. 대신 식물은 휘발성 유기화합물(VOCs)로 알려진 공기 중 화학 신호를 방출한다. 이러한 화학적 메시지는 식물의 방어 전략에서 두 가지 기능을 수행한다. 첫째, 이 신호는 같은 종이나 다른 종의 이웃 식물들에게 포식자의 존재를 알리어, 잎에 방어용 독소나 쓴 화학 물질을 선제적으로 생성하도록 유도한다. 둘째, VOCs는 기생 벌이나 포식성 응애와 같이 공격하는 곤충의 천적을 유인하는 화학적 구조 요청 역할을 한다. 이러한 복잡한 화학적 커뮤니케이션 네트워크를 통해 식물은 집단 방어를 조율하고 외부 보디가드 종을 모집하여 생존을 확보한다.

[요약문] 해충의 공격을 받은 식물은 공기 중 화학 물질을 방출하여 이웃 식물들이 방어를 활성화하도록 (A) 경고하고(warn), 동시에 위협을 제거하기 위해 천적을 (B) 유인한다(attract).`,
    options: [
      "① warn …… attract",
      "② mislead …… repel",
      "③ stimulate …… ignore",
      "④ shield …… expose",
      "⑤ warn …… disperse"
    ],
    answerIndex: 0,
    explanation: "(A) 공격을 받은 식물은 이웃 식물들에게 해충의 존재를 알려 방어 독소를 미리 만들도록 '경고(warn)'합니다.\n(B) 동시에 공격하는 곤충의 천적(기생 벌 등)을 '유인(attract)'하여 해충을 제거하게 하므로 ①번이 정답입니다.",
    syntaxNotes: [
      "First, they alert neighboring plants ..., [prompting them to preemptively produce defensive toxins...]. (prompting은 분사구문이며 prompt + O + to V 구조를 취합니다.)",
      "Second, VOCs act as chemical distress calls [that attract natural predators of the attacking insects...]. (주격 관계대명사절이 distress calls를 수식합니다.)"
    ],
    vocabList: [
      { word: "herbivorous", meaning: "초식성의" },
      { word: "volatile organic compounds (VOCs)", meaning: "휘발성 유기화합물" },
      { word: "preemptively", meaning: "선제적으로" },
      { word: "distress call", meaning: "구조 요청 신호" },
      { word: "intricate", meaning: "복잡한, 얽힌" }
    ]
  },
  {
    id: "26053-0210",
    lesson: "실전 3회",
    itemNo: "41-42번",
    type: "장문 독해",
    title: "실패에 대한 두려움 극복과 혁신을 위한 성장 마인드셋",
    passage: `In modern corporate and educational environments, failure is often treated as something to be avoided at all costs. Traditional evaluation systems reward error-free performance and penalize mistakes, creating a culture dominated by risk aversion. However, this obsessive focus on perfection severely restricts innovation. When individuals are terrified of making mistakes, they naturally gravitate toward safe, familiar solutions rather than experimenting with novel ideas.

Psychologist Carol Dweck's research on mindsets highlights the contrast between a fixed mindset and a growth mindset. Individuals with a fixed mindset view intelligence and ability as static traits. For them, failure is a humiliating proof of inadequacy. Consequently, they avoid challenges that might jeopardize their reputation. In contrast, those with a growth mindset view setbacks as valuable learning opportunities essential for mastery. Leading tech companies now cultivate "fail-safe" cultures where thoughtful risk-taking is celebrated. By treating failure as (e) <u class="font-semibold underline decoration-rose-500">useless</u> [-> informative / valuable] feedback rather than a final judgment, organizations unlock employee creativity and maintain long-term competitiveness.`,
    translation: `현대의 기업 및 교육 환경에서 실패는 흔히 무슨 수를 써서라도 피해야 할 것으로 취급된다. 전통적인 평가 시스템은 오류 없는 성과에 보상하고 실수를 처벌하여 위험 회피가 지배하는 문화를 조성한다. 그러나 완벽주의에 대한 이러한 집착은 혁신을 심각하게 제한한다. 개인들이 실수하는 것을 극도로 두려워할 때, 그들은 참신한 아이디어를 실험하기보다 자연스럽게 안전하고 익숙한 해결책으로 끌리게 된다.

심리학자 Carol Dweck의 마인드셋 연구는 고정 마인드셋과 성장 마인드셋 간의 대조를 부각한다. 고정 마인드셋을 가진 개인들은 지능과 능력을 정적인 특성으로 본다. 그들에게 실패는 불충분함을 보여주는 굴욕적인 증거다. 결과적으로 그들은 자신의 평판을 위협할 수 있는 도전을 피한다. 반면에 성장 마인드셋을 가진 이들은 숙달에 필수적인 가치 있는 배움의 기회로 실패를 바라본다. 선도적인 기술 기업들은 이제 사려 깊은 위험 감수가 찬사 받는 문화('실패를 허용하는' 문화)를 가꾼다. 실패를 최종적 심판이 아닌 (e) 유용한/가치 있는(informative/valuable) 피드백으로 취급함으로써, 조직은 직원들의 창의성을 해방하고 장기적 경쟁력을 유지한다.`,
    options: [
      "41번 제목: ① Reframing Failure: The Catalyst for Innovation and Growth",
      "42번 어휘: ⑤ (e) useless -> informative / valuable"
    ],
    answerIndex: 1,
    explanation: "41번: 실패를 두려워할 대상이 아니라 가치 있는 피드백이자 성장의 촉매제로 재정의하는 것이 혁신의 열쇠라는 내용이므로 ① 'Reframing Failure: The Catalyst for Innovation and Growth'가 정답입니다.\n42번: 글의 마지막 문장은 실패를 가치 있고 유익한 피드백으로 바라보아야 조직의 창의성이 촉진된다는 맥락이므로 (e)의 useless(무용한)는 맥락상 어색하며 informative 또는 valuable 등으로 바뀌어야 합니다.",
    syntaxNotes: [
      "...creating a culture [dominated by risk aversion]. (과거분사구 dominated가 culture를 후위수식합니다.)",
      "By treating failure as informative feedback ..., organizations unlock employee creativity... (By + -ing 구문으로 '~함으로써'라는 수단을 나타냅니다.)"
    ],
    vocabList: [
      { word: "risk aversion", meaning: "위험 회피" },
      { word: "gravitate toward", meaning: "~로 끌리다, 경향을 보이다" },
      { word: "fixed mindset", meaning: "고정 마인드셋" },
      { word: "growth mindset", meaning: "성장 마인드셋" },
      { word: "jeopardize", meaning: "위험에 빠뜨리다" },
      { word: "informative", meaning: "유익한, 정보를 주는" }
    ]
  },
  {
    id: "26053-0212",
    lesson: "실전 3회",
    itemNo: "43-45번",
    type: "장문 독해",
    title: "바이올린 제작자 Matteo와 제자 Leo의 섬세한 목재 조각과 장인정신",
    passage: `(A) Matteo was a master violin maker in Cremona, Italy, renowned for crafting instruments with exceptional acoustic warmth. His young apprentice, Leo, had spent two years learning the fundamentals of wood selection and tool maintenance. One morning, Matteo handed Leo a piece of aged spruce wood for the front plate of a new violin. "Today, Leo, you will carve the delicate arching curves," Matteo said. (a) He watched closely as Leo picked up the gouge tool.

(C) Leo began carving with great enthusiasm, eager to demonstrate his skill. However, in his haste to finish the top plate, his hand slipped, cutting slightly too deep into the center of the wood. Leo gasped, realizing (c) he had ruined the piece. Frustrated and ashamed, he bowed his head, expecting a harsh reprimand from his master.

(D) Matteo walked over, picked up the marked wood, and examined the deep groove. Instead of scolding the boy, (d) he smiled gently. "Wood has its own memory and grain, Leo. A master craftsman does not throw away a mistake; he adapts his design to work with the wood's natural character." Matteo guided Leo's hands, showing him how to adjust the surrounding thickness to balance the acoustic resonance.

(B) Working together through the afternoon, they transformed the altered wood into a soundboard with a uniquely rich tone. Months later, when a famous soloist played the finished violin, its sound was hailed as extraordinarily sweet and warm. Leo looked at Matteo with tears of gratitude. "(b) You taught me that perfection comes not from never making mistakes, but from learning how to restore harmony," Leo whispered. Matteo beamed with pride at his apprentice's growth.`,
    translation: `(A) Matteo는 이탈리아 크레모나의 거장 바이올린 제작자로, 뛰어난 음향적 따뜻함을 지닌 악기를 제작하는 것으로 유명했다. 그의 어린 도제 Leo는 목재 선택과 도구 관리의 기초를 배우며 2년을 보냈다. 어느 날 아침, Matteo는 새 바이올린의 전면 판에 쓸 오랫동안 건조된 가문비나무 조각을 Leo에게 건넸다. "오늘 Leo, 너는 섬세한 아치형 곡선을 조각할 거란다." Matteo가 말했다. (a) 그는 Leo가 끌 도구를 집어 들 때 유심히 지켜보았다.

(C) Leo는 자신의 실력을 보여주고 싶은 마음에 열정적으로 조각하기 시작했다. 그러나 상판을 서둘러 마무리지으려다 그의 손이 미끄러져 목재 중앙을 너무 깊게 깎아 버렸다. Leo는 (c) 자신이 목재를 망쳤다는 것을 깨닫고 헉 하고 숨을 내쉬었다. 자책감과 부끄러움에 그는 스승의 혹독한 책망을 예상하며 고개를 숙였다.

(D) Matteo가 걸어와 흠집이 난 목재를 집어 들고 깊은 홈을 살펴보았다. 아이를 혼내는 대신, (d) 그는 다정하게 미소를 지었다. "나무에는 고유한 기억과 결이 있단다, Leo. 거장 장인은 실수를 버리지 않는다. 나무의 자연스러운 특성에 맞추어 디자인을 조정하는 법이지." Matteo는 Leo의 손을 이끌어, 음향적 울림의 균형을 맞추기 위해 주변 두께를 조절하는 방법을 보여주었다.

(B) 오후 내내 함께 작업하면서, 그들은 변형된 목재를 독특하고 풍부한 음색을 지닌 울림판으로 바꾸어 놓았다. 수개월 후 유명한 독주자가 완성된 바이올린을 연주했을 때, 그 소리는 엄청나게 감미롭고 따뜻하다고 찬사를 받았다. Leo는 감사의 눈물을 흘리며 Matteo를 바라보았다. "(b) 스승님은 완벽함이란 결코 실수를 하지 않는 데서 오는 것이 아니라, 어떻게 조화를 회복하는지 배우는 데서 온다는 것을 가르쳐 주셨어요." Leo가 속삭였다. Matteo는 제자의 성장에 자랑스러운 미소를 지었다.`,
    options: [
      "43번 글의 순서: ③ (C) - (D) - (B)",
      "44번 지칭 추론: ④ (d)는 스승 Matteo, 나머지는 (a,b,c) 제자 Leo",
      "45번 내용 불일치: ⑤ Leo는 실수를 한 후 스승에게 야단을 맞고 목재를 버렸다. (X -> 야단맞지 않고 디자인을 수정함)"
    ],
    answerIndex: 0,
    explanation: "43번: 목재 조각 과제를 부여받는 (A) -> 서두르다 목재에 흠집을 내어 실의에 빠지는 (C) -> 스승 Matteo가 다가와 목재의 결을 살려 디자인을 조절하도록 지도하는 (D) -> 완성된 바이올린이 훌륭한 소리를 내고 제자가 조화의 교훈을 깨닫는 (B)로 연결되므로 ③ (C) - (D) - (B) 가 정답입니다.\n44번: (a), (b), (c)는 제자 Leo를 지칭하지만, (d)는 스승 Matteo를 지칭하므로 ④번이 정답입니다.\n45번: Matteo는 제자 Leo를 혼내지 않고 목재의 결을 활용하도록 가르쳤으므로 ⑤번 설명은 내용과 일치하지 않습니다.",
    syntaxNotes: [
      "...renowned for crafting instruments [with exceptional acoustic warmth]. (renowned for ~는 '~로 유명한'을 뜻하는 형용사구입니다.)",
      "Instead of scolding the boy, he smiled gently. (Instead of + -ing 구문입니다.)"
    ],
    vocabList: [
      { word: "apprentice", meaning: "도제, 견습생" },
      { word: "spruce wood", meaning: "가문비나무 목재" },
      { word: "gouge", meaning: "홈을 파는 끌" },
      { word: "reprimand", meaning: "비난, 책망" },
      { word: "resonance", meaning: "울림, 공명" }
    ]
  },

  // ================= [ 실전모의고사 4회(1) ] =================
  {
    id: "26053-0233",
    lesson: "실전 4회(1)",
    itemNo: "19번",
    type: "심경 변화",
    title: "삼림 감시원 Sergei의 고립과 구출",
    passage: `Sergei was a forest ranger in a Siberian forest. He protected wild animals and drove poachers away. One day, while following the trail of a wounded wild animal, he got caught in a sudden blizzard and lost his way. Cold and trembling, he suddenly found himself staring into yellow eyes. At least ten wolves had surrounded him, and his heart sank. The animals he had protected for decades now seemed ready to end his life. One of the wolves approached him and just stood calmly in front of him. Sergei recognized a large scar on the right front paw. It was the wolf he had rescued from a poacher’s trap and nursed back to health. The wolf moved its head as if to tell him to follow. As Sergei moved alongside it, he recognized the familiar path to his cabin. The wolves slowly turned and disappeared into the forest. Sergei stood there watching them, feeling his tension give way to a deep sense of gratitude.`,
    translation: `Sergei는 시베리아 숲의 삼림 감시원이었다. 그는 야생 동물을 보호하고 밀렵꾼을 쫓아냈다. 어느 날, 부상당한 야생 동물의 자취를 쫓던 중, 그는 갑작스러운 눈보라를 만나 길을 잃었다. 춥고 떨리며, 그는 갑자기 노란 눈동자를 마주하게 되었다. 적어도 열 마리의 늑대가 그를 둘러싸고 있었고, 그의 가슴은 철렁 내려앉았다. 수십 년간 자신이 보호해 온 동물들이 이제 자신의 삶을 끝낼 준비가 된 것처럼 보였다. 늑대 중 한 마리가 그에게 다가와 조용히 그의 앞에 섰다. Sergei는 오른쪽 앞발의 큰 흉터를 알아보았다. 밀렵꾼의 덫에서 구출해 간호해 주었던 바로 그 늑대였다. 늑대는 마치 따라오라는 듯 머리를 움직였다. Sergei가 늑대 옆을 따라 이동하자, 자신의 오두막으로 향하는 익숙한 길을 알아보았다. 늑대들은 천천히 돌아서서 숲 속으로 사라졌다. Sergei는 긴장감이 깊은 감사의 감정으로 바뀌는 것을 느끼며 그들을 바라보며 서 있었다.`,
    options: [
      "① bored → excited",
      "② fearful → thankful",
      "③ confident → nervous",
      "④ embarrassed → angry",
      "⑤ thrilled → disappointed"
    ],
    answerIndex: 1,
    explanation: "늑대 무리에게 둘러싸여 가슴이 철렁 내려앉았으나(fearful), 예전에 자신이 구해주었던 늑대의 도움으로 무사히 오두막으로 돌아와 감사함을 느끼게 되었으므로(thankful), 심경 변화로는 ② '두려운 → 감사하는'이 가장 적절합니다.",
    syntaxNotes: [
      "...he got caught in a sudden blizzard and lost his way. (got caught와 lost가 과거동사로 병렬 연결되어 있습니다.)",
      "Sergei stood there watching them, [feeling his tension give way to a deep sense of gratitude]. (feeling은 분사구문이며 his tension이 give way to로 이행함을 표현합니다.)"
    ],
    vocabList: [
      { word: "forest ranger", meaning: "삼림 감시원" },
      { word: "poacher", meaning: "밀렵꾼" },
      { word: "blizzard", meaning: "눈보라" },
      { word: "nurse back to health", meaning: "간호하여 건강을 회복시키다" },
      { word: "give way to", meaning: "~로 대체되다, ~에 양보하다" }
    ]
  },
  {
    id: "26053-0234",
    lesson: "실전 4회(1)",
    itemNo: "20번",
    type: "필자의 주장",
    title: "AI 기반 교육 기술의 인적 대안 확보 필요성",
    passage: `It is not always possible or desirable to allow people to “opt out” of the use of digital tools. For example, the use of data in contributing to the improvement of education, particularly of disadvantaged groups, relies on a comprehensive participation in data gathering. It is also not practical for families to individually opt out of digital solutions chosen by educational institutions to support their children’s learning. This does not mean that human alternatives should not continue to be considered. For example, evaluations that are high stakes for learners or teachers require a human alternative. While it has been shown that AI-enabled remote proctoring can help students take exams or tests remotely when in-presence exams are very difficult to offer, their continued use should include an alternative human proctoring option given that students from different households have very different levels of connectivity, living space and examination conditions when at home. Jurisdictions should thus consider whether human alternatives to AI-enabled technology should be provided, when appropriate.`,
    translation: `디지털 도구 사용을 거부(opt out)할 수 있게 하는 것이 항상 가능하거나 바람직한 것은 아니다. 예를 들어, 취약 계층의 교육 향상에 기여하는 데이터 활용은 종합적인 데이터 수집 참여에 의존한다. 또한 가정이 개별적으로 교육 기관이 선택한 디지털 솔루션을 거부하는 것도 현실적이지 않다. 그렇다고 해서 인간에 의한 대안이 계속 고려되지 않아야 한다는 뜻은 아니다. 학습자나 교사에게 중요도가 높은 평가에는 인간 대안이 필요하다. AI 기반 원격 시험 감독이 유용하다 할지라도, 학생들의 가정 환경과 접속 수준이 다르므로 대안적인 인간 감독 옵션이 포함되어야 한다. 따라서 관할 기관은 적절한 경우 AI 기반 기술에 대한 인간 대안이 제공되어야 하는지 고려해야 한다.`,
    options: [
      "① 학습을 지원하기 위한 디지털 도구의 사용은 제한적이어야 한다.",
      "② 교육 현장에서 AI를 사용할 때는 전문가의 판단이 선행되어야 한다.",
      "③ 디지털 도구의 교육적 사용을 위한 데이터 수집을 거부해서는 안 된다.",
      "④ 원격 시험의 공정성을 위해 AI 감시 시스템으로 평가 체계를 전환해야 한다.",
      "⑤ AI 기반 교육에서도 AI 대신 사람을 선택할 수 있는 대안이 제공되어야 한다."
    ],
    answerIndex: 4,
    explanation: "AI 기반 교육 도구나 감시 기술이 활성화되더라도 평가 및 시험 과정에서 인간 대안(human alternative)이 옵션으로 제공되어야 한다는 내용이므로 ⑤가 정답입니다.",
    syntaxNotes: [
      "This does not mean [that human alternatives should not continue to be considered]. (mean의 목적어로 접속사 that절이 사용되었습니다.)",
      "...their continued use should include an alternative human proctoring option [given that students from different households have very different levels...]. (given that은 '~라는 점을 감안할 때'의 접속사 표현입니다.)"
    ],
    vocabList: [
      { word: "opt out", meaning: "거부하다, 참여하지 않다" },
      { word: "disadvantaged", meaning: "혜택을 받지 못하는, 취약한" },
      { word: "proctoring", meaning: "시험 감독" },
      { word: "jurisdiction", meaning: "관할 기관, 사법권" }
    ]
  },
  {
    id: "26053-0235",
    lesson: "실전 4회(1)",
    itemNo: "21번",
    type: "함축 의미 추론",
    title: "고층 빌딩 건축 디자인이 초래하는 사회·환경적 문제",
    passage: `From the thirty-fifth floor of a downtown office tower that dominates the new Atlanta skyline, one can see two problems that all architects of high-rise buildings face. The question is how to bring the thing to an end gracefully before gravity and money do so. Some architects just quit, hence the flat roof. But most decorate the finale in various ways with one kind of flourish or another, each somewhat more outlandish than the one built the year before. The result, what some call “an interesting skyline,” is a kind of fever chart of the collected psyches of architects and their clients that shape the modern megalopolis. <u class="font-bold underline decoration-blue-500">The results, however, are more than just show.</u> These are the buildings that contribute greatly to traffic jams, poverty, climatic change, pollution, loss of biodiversity, and land degradation. If less visually dramatic, the same could be said of the designers of the modern suburb and shopping mall. In both cases the problem is that the art and science of architecture and related applied disciplines has been limited by narrow gauge thinking.`,
    translation: `새로운 애틀랜타 스카이라인을 압도하는 도심 오피스 타워 35층에서 고층 빌딩의 모든 건축가가 직면하는 두 가지 문제를 볼 수 있다. 문제는 중력과 돈이 마감하기 전에 어떻게 건물을 우아하게 마무리할 것인가이다. 일부는 그냥 평평한 지붕으로 마감하지만, 대다수는 화려하고 기이하게 장식한다. 그 결과물은 건축가와 건축주의 집단적 심리가 반영된 스카이라인이 된다. <u class="font-bold underline">그러나 그 결과는 단지 구경거리에 그치지 않는다.</u> 이 건물들은 교통 체증, 가난, 기후 변화, 오염, 생물 다양성 손실 및 토지 황폐화에 크게 기여하는 빌딩들이다. 서구 외곽 도시 및 쇼핑몰 디자인도 마찬가지이다. 두 경우 모두 건축이라는 예술과 과학이 좁은 식견에 갇혀있다는 점이 문제이다.`,
    options: [
      "① The buildings are visually impressive but structurally unstable.",
      "② The high-rise buildings cause serious social issues beyond their eye-catching design.",
      "③ The dramatic appearance of the buildings symbolizes a corporation’s financial power.",
      "④ The buildings are primarily marketing tools designed to attract attention.",
      "⑤ The visually pleasing skyline offers greater economic benefits."
    ],
    answerIndex: 1,
    explanation: "밑줄 친 부분은 화려한 스카이라인을 자랑하는 고층 건물들이 눈에 보이는 외관상의 화려함에 그치는 것이 아니라 교통 체증, 환경 오염, 토지 황폐화 등 심각한 사회적·환경적 폐해를 초래함을 의미하므로 ②가 정답입니다.",
    syntaxNotes: [
      "The result ... is a kind of fever chart of the collected psyches of architects ... [that shape the modern megalopolis]. (관계대명사절이 architects and their clients를 수식합니다.)",
      "These are the buildings [that contribute greatly to traffic jams, poverty, climatic change...]. (주격 관계대명사절이 선행사 buildings를 설명합니다.)"
    ],
    vocabList: [
      { word: "outlandish", meaning: "기이한, 이상한" },
      { word: "megalopolis", meaning: "메갈로폴리스, 거대도시" },
      { word: "degradation", meaning: "황폐화, 저하" },
      { word: "applied discipline", meaning: "응용 학문 분야" }
    ]
  },
  {
    id: "26053-0236",
    lesson: "실전 4회(1)",
    itemNo: "22번",
    type: "글의 요지",
    title: "아동기 자연과의 교감 감소와 그 영향",
    passage: `Direct and personal interaction with nature is diminishing, in an ongoing alienation termed the “extinction of experience.” Its causes are loss of opportunity (e.g., space and time for exploring nature) and loss of orientation (e.g., positive feelings and attitudes towards nature). Loss of orientation is particularly relevant for biology education because educational programs can develop and foster secondary school students’ positive feelings and attitudes towards nature. Concerning positive attitudes towards nature, research has focused mainly on nature connectedness, which is a multi-dimensional psychological trait that refers to a person’s belief about the extent to which they are part of nature, their emotional relationship with nature, and their experience with it. For school-aged children, nature connectedness declines after early childhood before recovering in adulthood. This is problematic because for school-aged children nature connectedness predicts interest in participating in nature-based activities, and high levels of nature connectedness are associated with pro-environmental behavior.`,
    translation: `자연과의 직접적이고 개인적인 상호작용은 '경험의 소멸'이라고 불리는 소외 속에서 줄어들고 있다. 원인은 기회의 상실과 방향성의 상실이다. 방향성의 상실은 생물학 교육과 연관이 깊은데, 교육 프로그램을 통해 중등학생들의 자연에 대한 긍정적 태도를 함양할 수 있기 때문이다. 연구는 자연과의 연결감에 집중해 왔다. 학령기 아동의 경우 유아기 이후 자연 연결감이 감소했다가 성인기에 회복된다. 이는 학령기 아동의 자연 연결감이 친환경적 행동과 관련되어 있다는 점에서 문제가 된다.`,
    options: [
      "① 생명에 대한 존중감 함양은 생물학 교육 목표의 핵심이다.",
      "② 개인이 갖는 자연 연결감 회복을 위해 도심 녹지화가 중요하다.",
      "③ 전 연령대에서 자연과의 교감 경험은 심리적 안정에 필수적이다.",
      "④ 디지털 문화로 인한 직접 경험의 소멸이 미성숙한 성인을 만들고 있다.",
      "⑤ 자연을 접하는 경험 부족으로 학령기 아동의 자연 연결감이 약해지고 있다."
    ],
    answerIndex: 4,
    explanation: "자연을 탐험하고 직접 접하는 경험이 줄어듦에 따라 학령기 아동의 자연 연결감이 약해지고 이것이 친환경적 행동 감소로 이어진다는 요지이므로 ⑤가 정답입니다.",
    syntaxNotes: [
      "...nature connectedness, [which is a multi-dimensional psychological trait {that refers to a person's belief...}]. (계속적 용법의 관계대명사 which 안에 주격 관계대명사절 that이 들어있습니다.)"
    ],
    vocabList: [
      { word: "alienation", meaning: "소외" },
      { word: "extinction of experience", meaning: "경험의 소멸" },
      { word: "nature connectedness", meaning: "자연 연결감" },
      { word: "pro-environmental", meaning: "친환경적인" }
    ]
  },
  {
    id: "26053-0243",
    lesson: "실전 4회(1)",
    itemNo: "29번",
    type: "어법성 판단",
    title: "자비심(Self-compassion)과 타인에 대한 친절",
    passage: `For a start, self-compassion can put you in a position where you have the energy to treat other people kindly. It’s rather like that instruction you get on planes ① <u class="font-semibold underline decoration-slate-400">that</u> you should put your own oxygen mask on first, before helping others. You’re better able to assist someone else if you’re not worrying about yourself. Of course, that is not to say that people who tend to neglect their own well-being ② <u class="font-semibold underline decoration-slate-400">are</u> incapable of kindness. In fact, in the Kindness Test, we found that people with depression can be notably kind, with participants who said they had mental health difficulties ③ <u class="font-semibold underline decoration-rose-500">indicate</u> [-> indicating] they were more likely than non-depressed people to donate their time to help others. But the fact is these respondents have ④ <u class="font-semibold underline decoration-slate-400">such</u> difficult lives that they are required to work very hard to show altruism. It doesn’t always follow of course, but people who are able to be kind to themselves, who are less oppressed by self-criticism, can find themselves in a psychological state ⑤ <u class="font-semibold underline decoration-slate-400">where</u> it’s easier to think of others.`,
    translation: `우선, 자기 자비(self-compassion)는 타인을 친절하게 대할 수 있는 에너지를 갖는 위치에 당신을 올려놓는다. 그것은 타인을 돕기 전에 자신의 산소 마스크를 먼저 착용해야 한다는 비행기 지시문과 비슷하다. 스스로에 대해 걱정하지 않을 때 타인을 더 잘 도울 수 있다. 자기 자신의 안녕을 소홀히 하는 사람들이 친절을 베풀 수 없다는 것은 아니다. 실제로 연구에서 우울증을 앓는 사람들도 매우 친절할 수 있음이 밝혀졌으며, 정신 건강에 어려움이 있다고 말한 참가자들이 비우울증 사람들보다 도움을 주고자 시간을 기부할 가능성이 높음을 '보여주었다(indicating)'. 그러나 자기 자신에게 자비로운 사람들은 타인을 더 쉽게 배려할 수 있는 심리 상태에 도달한다.`,
    options: [
      "① that",
      "② are",
      "③ indicate",
      "④ such",
      "⑤ where"
    ],
    answerIndex: 2,
    explanation: "③의 indicate 구문은 'with + 목적어 + 분사' 구문에서 participants who said... 를 목적어로 받아 의미상 능동인 현재분사 indicating으로 바뀌어야 합니다.",
    syntaxNotes: [
      "...with participants [who said they had mental health difficulties] indicating [they were more likely...]. (with + 목적어 + 분사구문 구조입니다.)",
      "...respondents have such difficult lives that they are required to work... (such ~ that ... 구문으로 '너무 ~해서 ...하다'를 뜻합니다.)"
    ],
    vocabList: [
      { word: "self-compassion", meaning: "자기 자비, 자신을 불쌍히 여김" },
      { word: "incapable", meaning: "~을 할 수 없는" },
      { word: "notably", meaning: "현저하게, 특히" },
      { word: "altruism", meaning: "이타주의" },
      { word: "oppress", meaning: "압박하다, 억누르다" }
    ]
  },
  {
    id: "26053-0244",
    lesson: "실전 4회(1)",
    itemNo: "30번",
    type: "어휘 판단",
    title: "타인의 공격적 의도 인식과 인지적 편향",
    passage: `Unfortunately, mental health professionals and lay persons alike often fail to recognize the aggressive agendas and actions of others for what they really are. This is largely because we’ve been pre-programmed to believe that people only (A) [exhibit / suppress] problem behaviors when they’re “troubled” inside or anxious about something. We’ve also been taught that people aggress only when they’re attacked in some way. So, even when our gut tells us that somebody is attacking us and for no good reason, or merely trying to overpower us, we don’t readily accept the notions. We usually start to wonder what’s bothering the person so badly “underneath it all” that’s making them act in such a (B) [disturbing / reassuring] way. We may even wonder what we may have said or done that “threatened” them. We may try to analyze the situation to death instead of simply responding to the attack. We almost (C) [always / never] think that the person is simply fighting to get something they want, to have their way with us, or gain the upper hand.`,
    translation: `불행히도 정신 건강 전문가와 일반인 모두 타인의 공격적인 의도와 행동을 그대로 인식하지 못할 때가 많다. 이는 우리가 사람들이 내부적으로 괴롭거나 불안할 때만 문제 행동을 (A) 드러낸다(exhibit)고 믿도록 미리 프로그래밍되어 있기 때문이다. 누군가 무이유로 우리를 공격할 때조차도 우리는 상대를 의심하기보다 상대를 그렇게 (B) 충격적인/심란한(disturbing) 방식으로 행동하게 만든 내면의 원인을 찾으려 한다. 우리는 그 사람이 단지 자신이 원하는 것을 얻으려고 공격하고 있다는 생각을 거의 (C) 하지 못한다(never).`,
    options: [
      "① exhibit …… disturbing …… always",
      "② exhibit …… reassuring …… always",
      "③ exhibit …… disturbing …… never",
      "④ suppress …… reassuring …… never",
      "⑤ suppress …… disturbing …… never"
    ],
    answerIndex: 2,
    explanation: "(A) 문제 행동을 억제하는 것이 아니라 '표출하다/드러내다(exhibit)'의 문맥입니다.\n(B) 타인의 행동은 사람을 불안하게 하거나 충격을 주므로 'disturbing'이 적절합니다.\n(C) 상대가 단순히 주도권을 잡으려 싸우는 것이라는 합리적 생각을 거의 하지 못한다는 문맥이므로 'never'가 올바릅니다.",
    syntaxNotes: [
      "...we've been pre-programmed to believe [that people only exhibit problem behaviors when...]. (believe의 목적어절 접속사 that입니다.)",
      "We almost never think [that the person is simply fighting to get something...]. (never think that 구문입니다.)"
    ],
    vocabList: [
      { word: "lay person", meaning: "비전문가, 일반인" },
      { word: "agenda", meaning: "의도, 안건" },
      { word: "exhibit", meaning: "드러내다, 표출하다" },
      { word: "disturbing", meaning: "충격적인, 심란하게 하는" },
      { word: "gain the upper hand", meaning: "우위를 점하다" }
    ]
  },

  // ================= [ 실전모의고사 4회(2) ] =================
  {
    id: "26053-0245",
    lesson: "실전 4회(2)",
    itemNo: "31번",
    type: "빈칸 추론",
    title: "리얼리티 TV 시청의 이중적 반응과 모순적 경험",
    passage: `Audiences have a general understanding of reality TV’s presentation of real people and their experiences in an entertainment frame. This creates a ________________________ viewing experience. On the one hand, viewers criticize reality programmes for being sensational and staged. They criticize themselves for watching reality programmes, for consuming what they perceive as fast food television. On the other hand, there are aspects of reality TV they like. For example, the attractions of reality TV include crossing boundaries between fact and fiction, a playful approach to ordinary people and celebrities, the spectacle of negative emotions, the intensity of experiences. There are certain kinds of reality programmes that are perceived as ‘good’ because they are so ‘bad’, inviting ‘a guilty pleasure’ in watching them. And there are also certain kinds of programmes that are perceived as ‘good’ because they deal with particular issues in a way that viewers can relate to in their everyday lives. Reality genre work highlights the dreamlike quality of watching reality TV, and how viewers reflect on the lighter and darker sides of the reality experience.`,
    translation: `관객들은 오락이라는 틀 안에서 실제 인물과 그들의 경험을 전달하는 리얼리티 TV에 대해 일반적인 이해를 가지고 있다. 이는 '모순적인(contradictory)' 시청 경험을 창출한다. 한편으로 시청자들은 리얼리티 프로그램이 자극적이고 연출되었다고 비판하며 패스트푸드 텔레비전을 소비한다고 스스로를 자책한다. 다른 한편으로 사실과 픽션의 경계를 넘나들고 부정적 감정의 볼거리를 제공하는 등 좋아하는 측면도 존재한다. 나쁘기 때문에 좋게 인식되어 길티 플레저(죄책감을 느끼면서도 즐기는 것)를 유발하기도 한다.`,
    options: [
      "① rational",
      "② rewarding",
      "③ predictable",
      "④ conventional",
      "⑤ contradictory"
    ],
    answerIndex: 4,
    explanation: "비판하면서도 즐겨보는 시청자들의 양가적이고 상반된 반응을 설명하고 있으므로, 빈칸에는 ⑤ 'contradictory(모순적인)'가 들어가야 합니다.",
    syntaxNotes: [
      "On the one hand, viewers criticize ... On the other hand, there are aspects... (On the one hand - On the other hand 구문으로 상반된 입장을 대조합니다.)",
      "There are certain kinds of reality programmes [that are perceived as 'good' because they are so 'bad']... (주격 관계대명사절입니다.)"
    ],
    vocabList: [
      { word: "sensational", meaning: "자극적인" },
      { word: "staged", meaning: "연출된" },
      { word: "guilty pleasure", meaning: "죄책감을 느끼면서도 즐기는 것" },
      { word: "contradictory", meaning: "모순적인" }
    ]
  },
  {
    id: "26053-0246",
    lesson: "실전 4회(2)",
    itemNo: "32번",
    type: "빈칸 추론",
    title: "경제 및 생태 시스템에서 다양성의 단기적 이점",
    passage: `Diversity can have short-term benefits, expressed most clearly in evolutionary systems where negative frequency-dependent selection dominates (i.e., the higher the frequency of a trait, the lower its fitness). Economic systems are a good example. Take the pork industry. If the number of farms is high enough so that the production of pigs exceeds the capacity of slaughterhouses to process them, then the success of each farmer will decline. If there are more slaughterhouses than needed given the production of pigs, then the slaughter businesses will suffer as well. For both, fitness declines with increasing prevalence, and the system as a whole is most economically productive when all the parts are present in appropriate amounts. These system parts can extend to include feed suppliers, distributors, and butchers, among others. A strikingly similar dynamic is at play in ecosystems, where a diverse mix of plant species (assuming they are all appropriate to the local climate and soil) is typically more productive in terms of biomass than a monoculture or a mix of just a couple of species. In these cases, a benefit of diversity derives not from fueling evolutionary change, but from ________________________.`,
    translation: `다양성은 단기적인 이점을 가질 수 있다. 양돈 산업을 예로 들어보자. 농가 수가 너무 많아 돼지 생산량이 도축장의 처리 능력을 초과하면 개별 농가의 성공은 하락한다. 반대로 도축장이 너무 많으면 도축업이 타격을 입는다. 상호 적정 비율을 이룰 때 생산성이 최적화된다. 식물 종이 다양한 생태계가 단일 재배보다 바이오매스 생산성이 높은 것과 같다. 이 경우 다양성의 이점은 진화적 변화를 촉진하는 데서 오는 것이 아니라 '한정된 자원의 활용을 최적화하는 것(optimizing the use of limiting resources)'에서 유래한다.`,
    options: [
      "① optimizing the use of limiting resources",
      "② maximizing the speed of biomass growth",
      "③ reducing the population of certain species",
      "④ encouraging rapid competition between all species",
      "⑤ increasing the predictability of ecological interactions"
    ],
    answerIndex: 0,
    explanation: "양돈 산업과 식물 생태계 예시 모두 요소들이 적정 균형을 이루어 한정된 자원의 이용을 최적화할 때 전체 시스템의 생산성이 극대화된다는 내용이므로 ①이 정답입니다.",
    syntaxNotes: [
      "...the system as a whole is most economically productive [when all the parts are present in appropriate amounts]. (when 조건절입니다.)",
      "In these cases, a benefit of diversity derives not from A, but from B. (not from A but from B 구문입니다.)"
    ],
    vocabList: [
      { word: "frequency-dependent", meaning: "빈도 의존적인" },
      { word: "slaughterhouse", meaning: "도축장" },
      { word: "monoculture", meaning: "단일 종 재배" },
      { word: "optimize", meaning: "최적화하다" }
    ]
  },
  {
    id: "26053-0247",
    lesson: "실전 4회(2)",
    itemNo: "33번",
    type: "빈칸 추론",
    title: "동물의 모방 동기 파악의 어려움",
    passage: `A variety of tests have been devised to test for imitation in animals. Using the so-called do-as-I-do test, a human trainer performs a novel action, and the animal is expected to copy it. Successful performance on this test has been demonstrated with two chimpanzees who copied such actions as touching the back of their head or clapping their hands. A parrot has also performed well on this test. By way of example, the trainer would repeatedly enter the room where the parrot was housed and perform an action while speaking a word. The trainer might nod his head while saying, “Nod.” After an incubation period of several months, the parrot was observed to perform the action spontaneously while saying the relevant word. An intriguing feature of these experiments is that the parrot never received a reward for imitating and, although the chimpanzees occasionally received a reward to sustain their interest in the task, it was not dependent on how well the response matched the observed action. Thus, the reasons for the observed imitation ________________________.`,
    translation: `동물의 모방을 테스트하기 위한 다양한 시험이 개발되었다. 트레이너가 행동을 보여주고 동물이 이를 따라 하도록 한다. 앵무새는 수개월의 숙성 기간 후 "Nod"라고 말하며 자발적으로 고개를 끄덕였다. 흥미로운 점은 앵무새가 모방에 대해 보상을 전혀 받지 않았고, 침팬지 역시 보상이 수행의 정확도에 의존하지 않았다는 것이다. 따라서 관찰된 모방의 원인이나 동기는 '파악하기 어렵다(are hard to identify)'.`,
    options: [
      "① are hard to identify",
      "② differ across species",
      "③ stem from a craving for rewards",
      "④ depend on how appropriate the reward is",
      "⑤ relate to an emotionally stable environment"
    ],
    answerIndex: 0,
    explanation: "보상 때문이 아님에도 동물이 인간의 행동을 모방하는 현상이 관찰되었으므로, 그 구체적인 이유나 원인을 쉽게 단정하기 어렵다는 의미인 ①이 정답입니다.",
    syntaxNotes: [
      "...the parrot was observed [to perform the action spontaneously]... (수동태 + to부정사 구조입니다.)",
      "...it was not dependent on [how well the response matched the observed action]. (간접의문사절 how well...이 전치사 on의 목적어로 쓰였습니다.)"
    ],
    vocabList: [
      { word: "imitation", meaning: "모방" },
      { word: "incubation period", meaning: "잠복기, 숙성 기간" },
      { word: "spontaneously", meaning: "자발적으로" },
      { word: "intriguing", meaning: "흥미로운" }
    ]
  },
  {
    id: "26053-0248",
    lesson: "실전 4회(2)",
    itemNo: "34번",
    type: "빈칸 추론",
    title: "시(Poetry)의 특수성: 단어와 의미의 불가분성",
    passage: `Poems are peculiar because they are so particular, at least that is the story. If this is true, then when we change the words of a poem or shift their order, we make a new poem. Poems seem to be radically and essentially defined by their words. Ordinary, everyday sentences, on the other hand, are not defined by their words in this way, but by the thoughts they express. We say something one way, then we say it another, trying to get it right or trying to discover what we mean. In our ordinary lives with language, what we say is not (always) equivalent to what we mean. And once we understand what someone else means, we often forget what was said and how it was said; it is the meaning that matters. Sentences dissolve in our grasping of them. Poems are not like that. We may never know what a poem means, and yet we can be held by its particular words. With poems, ________________________. A poem seems bound tightly to the particularity of its words.`,
    translation: `시는 매우 특수하기 때문에 독특하다. 시의 단어를 바꾸거나 순서를 바꾸면 새로운 시가 된다. 시는 단어 자체에 의해 본질적으로 정의된다. 반면 일상 문장은 단어가 아니라 표현하는 생각에 의해 정의된다. 일상 대화에서는 의미를 이해하면 어떤 단어로 말했는지는 잊혀진다. 시는 다르다. 의미를 완전히 알지 못해도 특정 단어 자체에 매료될 수 있다. 시에 있어서는 '말해진(서술된) 것은 의미하는 바 속으로 사라져 용해되지 않는다(what is said (or written) does not dissolve in what is meant)'. 시는 단어의 특수성에 단단히 결합되어 있다.`,
    options: [
      "① what is said (or written) does not dissolve in what is meant",
      "② we rely on contexts (or discourse) to determine the meaning of a word",
      "③ the novelty of word order (or structure) dissolves with repeated recitation",
      "④ the intentions (or messages) of poets can vary depending on the contexts",
      "⑤ meaning overrides wording (or phrasing) and can be rephrased without loss"
    ],
    answerIndex: 0,
    explanation: "일상 문장은 의미가 파악되면 단어가 사라져 버리지만(dissolve), 시에서는 단어 하나하나가 독립된 특수성을 유지하며 그 자체로 존재하므로 ①이 정답입니다.",
    syntaxNotes: [
      "...it is the meaning [that matters]. (It - that 강조구문입니다.)",
      "Sentences dissolve in our grasping of them. (grasping은 명사적 동명사로 '파악, 이해'의 뜻입니다.)"
    ],
    vocabList: [
      { word: "peculiar", meaning: "독특한, 기이한" },
      { word: "equivalent", meaning: "동등한" },
      { word: "dissolve", meaning: "녹다, 사라지다" },
      { word: "particularity", meaning: "특수성" }
    ]
  },
  {
    id: "26053-0249",
    lesson: "실전 4회(2)",
    itemNo: "35번",
    type: "무관한 문장",
    title: "테니스에서 스트로크 생체역학(Biomechanics)의 중요성",
    passage: `The realm of biomechanics within tennis poses significant challenges. It begins with the player keenly observing the ball’s departure from their opponent’s racket, discerning its speed, spin, trajectory and precise position. ① In response, the athlete must rapidly adjust their body orientation to avoid the incoming ball. ② As the player prepares to make contact, their entire body engages in motion, synchronized with the ball’s movement across two linear dimensions and potential rotational spin, while the racket also comes into play. ③ Within half a second, the player must orchestrate all these motions so that they hit the ball as near to the racket’s centre as possible, causing it to spin, travel at the appropriate speed and return in the desired direction. ④ The efforts the player puts into mental strength training play a more decisive role in achieving desirable development than those focused on enhancing biomechanics. ⑤ This proves beyond a reasonable doubt that biomechanics plays a critical role in a tennis player’s stroke production.`,
    translation: `테니스에서 생체역학의 영역은 상당한 과제를 제안한다. 상대 라켓에서 공이 출발하는 속도, 스핀, 궤적을 관찰하는 것에서 시작한다. 공과 접촉할 준비를 하면서 전신이 공의 움직임과 동기화되어 움직인다. 0.5초 이내에 모든 움직임을 조직화하여 공을 정확히 맞추어야 한다. ④ (정신력 훈련에 쏟는 노력이 생체역학 강화 노력보다 더 결정적인 역할을 한다.) ⑤ 이것은 생체역학이 테니스 선수의 스트로크 생산에 결정적 역할을 함을 증명한다.`,
    options: [
      "① In response, the athlete must rapidly adjust...",
      "② As the player prepares to make contact...",
      "③ Within half a second, the player must orchestrate...",
      "④ The efforts the player puts into mental strength training...",
      "⑤ This proves beyond a reasonable doubt that biomechanics..."
    ],
    answerIndex: 3,
    explanation: "전체 글은 테니스 스트로크 시 공을 맞추기 위한 전신의 생체역학적(biomechanics) 움직임과 정교한 신체 컨트롤을 설명하고 있는데, ④번은 갑자기 정신력 훈련(mental strength training)이 더 중요하다고 주장하므로 흐름에 어긋납니다.",
    syntaxNotes: [
      "...discerning its speed, spin, trajectory and precise position. (discerning은 현재분사 구문입니다.)",
      "...so that they hit the ball as near to the racket's centre as possible... (so that은 목적 접속사입니다.)"
    ],
    vocabList: [
      { word: "biomechanics", meaning: "생체역학" },
      { word: "trajectory", meaning: "궤적" },
      { word: "synchronize", meaning: "동기화하다" },
      { word: "orchestrate", meaning: "조직화하다, 조정하다" }
    ]
  },
  {
    id: "26053-0250",
    lesson: "실전 4회(2)",
    itemNo: "36번",
    type: "글의 순서",
    title: "초가공식품(Ultra-Processed Foods)과 장내 미생물 다양성 감소",
    passage: `Ultra-processed foods have become a staple in many modern diets, loved for their convenience and taste. Yet, the long-term effects of consuming these foods are increasingly concerning health professionals. Tim Spector, a professor of genetic epidemiology, conducted an experiment with his son, Tom, who ate only ultra-processed food for ten days.

(A) The results were dramatic: in just ten days, Tom lost around 1,400 species of gut bacteria, about 40% of his total microbial diversity. This rapid decline highlighted how sensitive the gut microbiome is to dietary changes and raised concerns about the potential health implications of such diets.
(B) He aimed to observe the impact of a diet high in ultra-processed foods on gut health. Tom’s diet consisted of fast food, sugary drinks, and processed snacks. Throughout the study, his gut bacteria were monitored through stool samples.
(C) Spector’s experiment vividly illustrated the negative effects of ultra-processed foods on gut health. It served as a stark reminder of the importance of eating a balanced diet rich in whole foods to support a diverse and healthy gut microbiome.`,
    translation: `초가공식품은 편의성과 맛 덕분에 현대 식단의 주식이 되었다. 그러나 이러한 식품 소비의 장기적 영향은 건강 전문가들의 우려를 사고 있다. 유전 역학 교수인 Tim Spector는 10일 동안 초가공식품만 먹는 실험을 아들 Tom과 함께 진행했다.

(B) 그는 초가공식품 비율이 높은 식단이 장 건강에 미치는 영향을 관찰하고자 했다. Tom의 식단은 패스트푸드, 설탕 음료, 가공 스낵으로 구성되었다. 연구 기간 동안 그의 장내 세균은 대변 샘플을 통해 모니터링되었다.
(A) 결과는 극적이었다. 단 10일 만에 Tom은 전체 미생물 다양성의 약 40%에 해당하는 1,400종의 장내 세균을 잃었다. 이러한 급격한 감소는 장내 마이크로바이옴이 식단 변화에 얼마나 민감한지를 보여주었다.
(C) Spector의 실험은 초가공식품이 장 건강에 미치는 부정적 영향을 생생하게 보여주었다. 이는 건강한 장내 마이크로바이옴을 지원하기 위해 자연식품이 풍부한 균형 잡힌 식단을 먹는 것의 중요성을 일깨워주었다.`,
    options: [
      "① (A) - (C) - (B)",
      "② (B) - (A) - (C)",
      "③ (B) - (C) - (A)",
      "④ (C) - (A) - (B)",
      "⑤ (C) - (B) - (A)"
    ],
    answerIndex: 1,
    explanation: "주어진 글에서 Tim Spector 교수가 아들 Tom과 함께 진행한 10일간의 초가공식품 식단 실험을 소개한 후, 실험의 구체적 내용과 식단 구성을 설명하는 (B)가 먼저 오고, 10일 후 장내 미생물의 40%가 손실되었다는 극적인 결과가 제시되는 (A)가 이어지며, 이 실험의 시사점과 결론을 정리하는 (C)로 마무리되는 ② (B) - (A) - (C) 가 올바른 순서입니다.",
    syntaxNotes: [
      "...Tim Spector ... conducted an experiment with his son, Tom, [who ate only ultra-processed food for ten days]. (계속적 용법의 관계대명사 who절입니다.)",
      "This rapid decline highlighted [how sensitive the gut microbiome is to dietary changes]... (how + 형용사 + 주어 + 동사의 간접의문문 구문입니다.)"
    ],
    vocabList: [
      { word: "ultra-processed food", meaning: "초가공식품" },
      { word: "genetic epidemiology", meaning: "유전 역학" },
      { word: "microbial diversity", meaning: "미생물 다양성" },
      { word: "gut microbiome", meaning: "장내 마이크로바이옴(미생물 생태계)" },
      { word: "stool sample", meaning: "대변 샘플" }
    ]
  },
  {
    id: "26053-0251",
    lesson: "실전 4회(2)",
    itemNo: "37번",
    type: "글의 순서",
    title: "주간/야간 온도 차이에 따른 식물 생장 반응 (DIF 원리)",
    passage: `Plant growth responses to temperature are influenced by the difference between day and night temperatures, known as the day-night temperature differential (DIF). The DIF plays a critical role in shaping plant morphology, particularly stem elongation.

(A) This technique allows growers to manage plant height without relying heavily on chemical growth regulators, promoting more sustainable agricultural practices. Understanding and applying DIF principles enables precise control over crop development, benefiting both commercial production and environmental sustainability.
(B) A positive DIF, where daytime temperatures are higher than nighttime temperatures, generally promotes stem elongation, resulting in taller plants. Conversely, a negative DIF, with nighttime temperatures exceeding daytime temperatures, suppresses stem elongation, leading to shorter, more compact plants.
(C) Research by Poiré and colleagues demonstrated that manipulating day and night temperatures can effectively control plant architecture. By adjusting these temperatures, growers can achieve desired plant forms, such as compact ornamental plants or taller crops, depending on agricultural goals.`,
    translation: `온도에 대한 식물의 성장 반응은 주간 온도와 야간 온도의 차이인 주야간 온도차(DIF)의 영향을 받는다. DIF는 식물의 형태, 특히 줄기 신장을 형성하는 데 결정적인 역할을 한다.

(B) 주간 온도가 야간 온도보다 높은 양의 DIF는 일반적으로 줄기 신장을 촉진하여 키가 더 큰 식물을 만든다. 반대로, 야간 온도가 주간 온도를 초과하는 음의 DIF는 줄기 신장을 억제하여 더 작고 조밀한 식물을 만든다.
(C) Poiré와 동료들의 연구는 주간 및 야간 온도를 조절함으로써 식물의 형태 구조를 효과적으로 제어할 수 있음을 보여주었다. 온도를 조절함으로써 재배자는 관상용 식물이나 키가 큰 작물 등 원하는 식물 형태를 얻을 수 있다.
(A) 이 기술은 재배자가 화학 성장 조절제에 크게 의존하지 않고도 식물 높이를 관리할 수 있게 해주어 지속 가능한 농업 실천을 촉진한다.`,
    options: [
      "① (A) - (C) - (B)",
      "② (B) - (C) - (A)",
      "③ (B) - (A) - (C)",
      "④ (C) - (A) - (B)",
      "⑤ (C) - (B) - (A)"
    ],
    answerIndex: 1,
    explanation: "DIF(주야간 온도차)의 개념을 제시한 주어진 글 뒤에, 양의 DIF와 음의 DIF의 개념 및 신장 효과를 구체적으로 설명하는 (B)가 이어지고, Poiré의 연구를 통해 이를 농업에 응용할 수 있음을 보여주는 (C)가 오며, '이 기술(This technique)'로 응용 효과와 친환경적 이점을 정리하는 (A)로 마무리되는 ② (B) - (C) - (A) 가 올바른 순서입니다.",
    syntaxNotes: [
      "A positive DIF, [where daytime temperatures are higher than nighttime temperatures], generally promotes... (관계부사 where절이 선행사 a positive DIF를 부연 설명합니다.)",
      "Conversely, a negative DIF ... suppresses stem elongation, [leading to shorter, more compact plants]. (leading to는 결과를 나타내는 분사구문입니다.)"
    ],
    vocabList: [
      { word: "temperature differential (DIF)", meaning: "주야간 온도차" },
      { word: "morphology", meaning: "형태학, 식물 형태" },
      { word: "stem elongation", meaning: "줄기 신장(길이 성장)" },
      { word: "compact", meaning: "조밀한, 아담한" },
      { word: "growth regulator", meaning: "성장 조절제" }
    ]
  },
  {
    id: "26053-0252",
    lesson: "실전 4회(2)",
    itemNo: "38번",
    type: "문장 삽입",
    title: "18세기 조소(Ridicule) 문화와 모차르트 음악의 음고 유희",
    passage: `Eighteenth-century society was fascinated by ridicule, banter, and raillery. It was a time when satire and wit flourished in literature, theater, and social gatherings. People took delight in teasing and mocking the absurdities of human nature and societal norms. ( ① ) In his comic operas, Mozart frequently used musical devices to poke fun at the characters and their flaws. ( ② ) For instance, in *The Marriage of Figaro*, he manipulated pitch, rhythm, and dynamics to create comedic effects that mirrored the witty dialogue. ( ③ ) A high pitch might be used to exaggerate a character’s panic or absurdity, while a sudden drop in pitch could signal a moment of foolish realization. ( ④ ) Through these subtle musical cues, Mozart invited the audience to share in the joke, turning pitch into a tool for social commentary and entertainment. ( ⑤ ) Thus, pitch in eighteenth-century music was not merely a structural element but a reflection of the prevailing cultural fondness for ridicule.`,
    boxSentence: `This habit of ridicule was so deeply embedded in eighteenth-century culture that composers like Mozart incorporated it into their musical compositions.`,
    translation: `18세기 사회는 조소, 짓궂은 농담, 그리고 비꼬기에 매료되었다. 문학, 연극, 사회적 모임에서 풍자와 재치가 번성했던 시기였다. 사람들은 인간 본성과 사회적 규범의 불합리함을 놀리고 야유하는 데서 즐거움을 찾았다. <u class="font-bold underline decoration-blue-500">[이러한 조소의 습관은 18세기 문화에 매우 깊이 자리 잡고 있어서 모차르트와 같은 작곡가들은 이를 자신의 음악 작품에 도입했다.]</u> ( ① ) 그의 코믹 오페라에서 모차르트는 등장인물과 그들의 결점을 놀리기 위해 음악적 장치를 자주 사용했다. ( ② ) 예를 들어 <피가로의 결혼>에서 그는 재치 있는 대사를 반영하는 희극적 효과를 창출하기 위해 음고, 리듬, 강약을 조절했다. ( ③ ) 높은 음고는 등장인물의 공황이나 황당함을 부풀리는 데 쓰일 수 있고, 음고의 갑작스러운 하강은 어리석은 깨달음의 순간을 알릴 수 있었다. ( ④ ) 이러한 미묘한 음악적 신호를 통해 모차르트는 관객을 농담에 참여시켜 음고를 사회적 비평과 오락의 도구로 탈바꿈시켰다. ( ⑤ ) 따라서 18세기 음악에서 음고는 단순한 구조적 요소가 아니라 조소에 대한 당대의 문화적 기호를 반영하는 것이었다.`,
    options: [
      "①",
      "②",
      "③",
      "④",
      "⑤"
    ],
    answerIndex: 0,
    explanation: "박스 문장의 'This habit of ridicule(이러한 조소 습관)'은 주어진 글의 마지막 문장에 설명된 '인간 본성과 사회 규범의 불합리함을 놀리고 야유하는 문화'를 가리키며, 박스 문장에서 언급된 '모차르트와 같은 작곡가들의 음악 작품 반영'이 ①번 위치 뒤의 'In his comic operas, Mozart...'로 자연스럽게 연결되므로 ①번 위치가 정답입니다.",
    syntaxNotes: [
      "This habit of ridicule was so deeply embedded ... that composers like Mozart incorporated it... (so ~ that ... 구문으로 '너무 ~해서 ...하다'를 뜻합니다.)",
      "A high pitch might be used to exaggerate ..., [while a sudden drop in pitch could signal...]. (while은 대조를 나타내는 접속사입니다.)"
    ],
    vocabList: [
      { word: "raillery", meaning: "시달림, 짓궂은 농담" },
      { word: "embedded", meaning: "깊이 박힌, 정착된" },
      { word: "incorporate", meaning: "통합하다, 반영하다" },
      { word: "poke fun at", meaning: "~을 조롱하다, 희화화하다" },
      { word: "dynamics", meaning: "강약, 음량 변화" }
    ]
  },
  {
    id: "26053-0253",
    lesson: "실전 4회(2)",
    itemNo: "39번",
    type: "문장 삽입",
    title: "사냥개의 전신 가리킴과 인간의 지시적 가리킴의 차이",
    passage: `Pointing is a fundamental form of communication shared by humans and certain animals, yet the mechanisms behind it differ significantly. In hunting dogs, pointing is an instinctual, whole-body posture: the dog freezes, aligning its nose, body, and tail toward the game. ( ① ) This whole-body alignment communicates the location of prey to the hunter through a rigid physical orientation. ( ② ) Unlike the dog’s posture, which freezes the whole body, human pointing is flexible and can be directed toward abstract ideas, distant objects, or specific details. ( ③ ) Furthermore, human pointing is deeply embedded in shared intentionality; it assumes that the observer will follow the pointer’s gaze or finger to understand the intended message. ( ④ ) While a dog’s point is an automatic response driven by hunting instincts, human pointing is a cognitive tool for joint attention and social interaction. ( ⑤ ) Thus, despite outward similarities in directing attention, pointing in dogs and humans serves entirely different evolutionary functions.`,
    boxSentence: `Human pointing, by contrast, relies on a distinct indexical gesture—typically extending an index finger—to single out an object or location.`,
    translation: `가리키기(pointing)는 인간과 특정 동물이 공유하는 커뮤니케이션의 기본 형태지만, 그 뒤에 있는 메커니즘은 크게 다르다. 사냥개에게 가리키기는 본능적인 전신 자세이다. 개는 사냥감을 향해 코, 몸, 꼬리를 일직선으로 정렬한 채 멈춰 선다. ( ① ) 이러한 전신 정렬은 경직된 신체 방향성을 통해 사냥꾼에게 먹잇감의 위치를 전달한다. <u class="font-bold underline decoration-blue-500">[대조적으로, 인간의 가리키기는 물체나 위치를 지적하기 위해 보통 집게손가락을 뻗는 독특한 지시적 제스처에 의존한다.]</u> ( ② ) 전신을 고정하는 개의 자세와 달리, 인간의 가리키기는 유연하며 추상적 아이디어나 먼 물체, 특정 세부 사항을 향할 수 있다. ( ③ ) 나아가 인간의 가리키기는 공유된 의도성에 깊이 뿌리내리고 있다. ( ④ ) 개의 가리키기는 사냥 본능에 의해 구동되는 자동 반응인 반면, 인간의 가리키기는 공동 주의와 사회적 상호작용을 위한 인지적 도구이다. ( ⑤ ) 따라서 주의를 돌리는 외견상 유사성에도 불구하고 개와 인간의 가리키기는 완전히 다른 진화적 기능을 수행한다.`,
    options: [
      "①",
      "②",
      "③",
      "④",
      "⑤"
    ],
    answerIndex: 1,
    explanation: "박스 문장은 'Human pointing, by contrast(대조적으로 인간의 가리키기는)'로 시작하여 인간의 손가락 지시 제스처를 언급합니다. ①번 뒤의 사냥개의 전신 가리킴 설명이 끝난 뒤, 인간의 지시 제스처를 도입하는 박스 문장이 ②번 위치에 들어가고, ②번 뒤의 'Unlike the dog's posture... human pointing is flexible'로 자연스럽게 이어지므로 ②번 위치가 정답입니다.",
    syntaxNotes: [
      "...pointing is an instinctual, whole-body posture: the dog freezes, [aligning its nose, body, and tail...]. (aligning은 주어 the dog의 상태를 나타내는 분사구문입니다.)",
      "Human pointing, by contrast, relies on a distinct indexical gesture ... [to single out an object or location]. (to single out은 목적을 나타내는 부사적 용법의 부정사입니다.)"
    ],
    vocabList: [
      { word: "indexical gesture", meaning: "지시적 제스처" },
      { word: "single out", meaning: "지목하다, 가려내다" },
      { word: "game", meaning: "사냥감" },
      { word: "shared intentionality", meaning: "공유된 의도성" },
      { word: "joint attention", meaning: "공동 주의" }
    ]
  },
  {
    id: "26053-0254",
    lesson: "실전 4회(2)",
    itemNo: "40번",
    type: "요약문 완성",
    title: "로봇과 AI 시스템에 대한 인간의 의인화(Anthropomorphisation)",
    passage: `Anthropomorphisation—the tendency to attribute human traits, emotions, or intentions to non-human entities—is a powerful psychological phenomenon commonly observed in human interactions with technology. Studies based on the "Media Equation" framework demonstrate that people naturally treat computers, robots, and AI systems as if they were real human beings, even when they know these entities lack consciousness. For instance, when a robot displays subtle social cues, such as making eye contact or offering polite greetings, users tend to respond with social norms like politeness, empathy, and reciprocity. This subconscious anthropomorphism occurs because the human brain evolved in an environment where social signals were exclusively human. As a result, when modern technology mimics these cues, our brains automatically activate social interaction scripts, leading us to perceive machines as social partners rather than inanimate tools.`,
    summarySentence: `People naturally (A) [attribute] human characteristics to technology due to subtle social cues, treating machines as social partners through (B) [automatic] psychological responses.`,
    translation: `의인화(비인간 존재에 인간의 특성, 감정, 의도를 부여하는 경향)는 인간과 기술의 상호작용에서 흔히 관찰되는 강력한 심리적 현상이다. "미디어 방정식" 프레임워크에 기반한 연구들은 사람들이 컴퓨터, 로봇, AI 시스템이 의식이 없음을 알면서도 마치 실제 인간인 것처럼 자연스럽게 대한다는 것을 보여준다. 예를 들어 로봇이 눈맞춤이나 정중한 인사를 건네는 등 미세한 사회적 신호를 보여줄 때, 사용자들은 공손함, 공감, 상호성과 같은 사회적 규범으로 반응하는 경향이 있다. 이러한 잠재의식적 의인화는 인간의 뇌가 사회적 신호가 오직 인간의 것이었던 환경에서 진화했기 때문에 발생한다. 결과적으로 현대 기술이 이러한 신호를 흉내 낼 때 우리의 뇌는 자동적으로 사회적 상호작용 스크립트를 활성화하여 기계를 무생물 도구가 아닌 사회적 파트너로 인식하게 만든다.

[요약문] 사람들은 미세한 사회적 신호로 인해 기술에 인간적 특성을 자연스럽게 (A) 부여하며(attribute), (B) 자동적인(automatic) 심리적 반응을 통해 기계를 사회적 파트너로 대한다.`,
    options: [
      "① attribute …… automatic",
      "② assign …… deliberate",
      "③ deny …… instinctual",
      "④ detach …… emotional",
      "⑤ attribute …… calculated"
    ],
    answerIndex: 0,
    explanation: "(A) 인간의 특성이나 감정을 비인간 기술에 부여하므로 'attribute(부여하다)'가 적절합니다.\n(B) 뇌가 사회적 상호작용 스크립트를 무의식적/자동적으로 활성화하므로 'automatic(자동적인)'이 적절합니다.",
    syntaxNotes: [
      "...people naturally treat computers ... [as if they were real human beings]... (as if + 가정법 과거 구문입니다.)",
      "...leading us to perceive machines as social partners [rather than inanimate tools]. (lead + 목적어 + to부정사 구문 및 rather than 구문입니다.)"
    ],
    vocabList: [
      { word: "anthropomorphisation", meaning: "의인화" },
      { word: "attribute A to B", meaning: "A를 B의 탓/특성으로 돌리다(부여하다)" },
      { word: "reciprocity", meaning: "상호성, 호혜성" },
      { word: "inanimate", meaning: "무생물의" }
    ]
  },
  {
    id: "26053-0255",
    lesson: "실전 4회(2)",
    itemNo: "41-42번",
    type: "장문 독해",
    title: "서비스 기술자의 작업 품질(Quality)과 속도(Speed) 간의 균형",
    passage: `Service technicians often face a fundamental conflict between work quality and quantity. On the one hand, completing a high volume of repair jobs quickly is crucial for customer satisfaction and business profitability. On the other hand, rushing through tasks can lead to errors, incomplete repairs, and customer dissatisfaction. Management expert W. Edwards Deming emphasized that focus solely on quantity often degrades quality, creating long-term costs that far outweigh short-term speed gains. Conversely, an exclusive focus on quality without regard for efficiency can result in backlogs, high costs, and frustrated clients awaiting service.

To resolve this conflict, leading organizations implement standardized processes and continuous training that enable technicians to work both efficiently and accurately. As Mahatma Gandhi famously observed, "Speed is useful only if you are running in the right direction." In a service context, "the right direction" means delivering high-quality repairs; speed without quality is merely moving fast toward failure. Thus, successful service management requires establishing performance metrics that balance speed with quality, ensuring that technicians are rewarded not just for the (e) <u class="font-semibold underline decoration-rose-500">number</u> [-> quality / accuracy] of jobs completed, but for doing them right the first time.`,
    translation: `서비스 기술자들은 종종 작업의 품질(Quality)과 양(Quantity) 사이의 근본적인 갈등에 직면한다. 한편으로는 대량의 수리 작업을 신속하게 완료하는 것이 고객 만족과 기업 수익성에 매우 중요하다. 다른 한편으로는 작업을 서두르면 오류, 미완성 수리, 고객 불만족으로 이어질 수 있다. 경영 전문가 W. Edwards Deming은 양에만 집중하는 것이 품질을 떨어뜨려 단기적 속도 이득보다 훨씬 큰 장기적 비용을 발생시킨다고 강조했다. 반대로 효율성을 고려하지 않고 품질에만 전념하면 정체, 높은 비용, 서비스를 기다리는 고객의 좌절을 초래할 수 있다.

이러한 갈등을 해결하기 위해 선도적 기업들은 기술자가 효율적이면서도 정확하게 일할 수 있도록 표준화된 프로세스와 지속적 교육을 시행한다. 마하트마 간디가 말했듯이 "속도는 올바른 방향으로 달리고 있을 때만 유용하다." 서비스 맥락에서 "올바른 방향"은 고품질의 수리를 제공하는 것을 의미한다. 품질 없는 속도는 단지 실패를 향해 빠르게 이동하는 것에 불과하다. 따라서 성공적인 서비스 관리는 속도와 품질의 균형을 맞추는 성과 지표를 확립하여, 기술자가 완료한 작업의 단순 '수/양(number)'이 아니라 처음부터 올바르게 작업한 '품질/정확성(quality)'에 대해 보상받도록 보장해야 한다.`,
    options: [
      "41번 제목: ① Balancing Speed and Precision in Service Management",
      "42번 문맥상 어색한 어휘: ⑤ (e) number -> quality / accuracy"
    ],
    answerIndex: 1,
    explanation: "41번: 서비스 관리에 있어서 작업 속도와 정확성/품질의 균형을 맞추는 것이 핵심 주제이므로 ① 'Balancing Speed and Precision in Service Management'가 정답입니다.\n42번: 글의 마무리는 기술자들에게 단순히 완료된 작업의 '수(number)'에만 보상하는 것이 아니라 '품질(quality)'이나 '정확성(accuracy)'에 보상해야 한다는 문맥이므로 (e)의 number는 문맥상 어색하며 quality 등으로 대체되어야 합니다.",
    syntaxNotes: [
      "...creating long-term costs [that far outweigh short-term speed gains]. (주격 관계대명사절이 선행사 costs를 수식합니다.)",
      "...ensuring that technicians are rewarded [not just for A, but for B]. (not just A but B 구문입니다.)"
    ],
    vocabList: [
      { word: "technician", meaning: "기술자, 수리 기사" },
      { word: "profitability", meaning: "수익성" },
      { word: "degrade", meaning: "저하시키다, 떨어뜨리다" },
      { word: "outweigh", meaning: "~보다 더 크다/중요하다" },
      { word: "backlog", meaning: "밀린 일, 정체" }
    ]
  },
  {
    id: "26053-0257",
    lesson: "실전 4회(2)",
    itemNo: "43-45번",
    type: "장문 독해",
    title: "육상 선수 Grace와 코치 Stella의 계주 경기와 팀워크",
    passage: `(A) Grace was a talented sprinter on the Polish Falcons track team, known for her explosive speed in the 200-meter event. Her coach, Stella, had spent months preparing Grace and her teammates for the upcoming state championship relay. As the anchor runner for the 4x100-meter relay, Grace carried the team's hopes for a gold medal. During the final practice session before the meet, Coach Stella watched intently as Grace practiced her baton handoffs. (a) She noticed that Grace was starting her acceleration slightly too early, forcing her teammate to stretch dangerously far to hand over the baton.

(C) Stella called Grace over to the side of the track. "Grace, your speed is incredible, but in a relay, timing and trust matter more than individual pace," (c) she explained gently. Grace nodded, though inner frustration clouded her expression. She felt that running faster was always the solution. Stella placed a hand on Grace's shoulder and said, "Remember, the baton travels faster when both runners move as one. Trust your teammate's signal." Grace took a deep breath, realizing that her eagerness had threatened the team's synchronization.

(D) The next day at the championship meet, the atmosphere was electric. The first three runners executed their legs brilliantly, bringing the Polish Falcons into second place as Grace prepared for the final handoff. As her teammate rounded the final turn, Grace waited for the precise visual mark Stella had trained her to watch. Rather than rushing ahead, (d) she timed her acceleration perfectly. The baton passed smoothly into Grace's palm without a single hitch, and she burst down the home stretch, crossing the finish line first to secure the championship.

(B) As the crowd cheered, Grace turned and embraced her teammates and Coach Stella. "You did it, Grace!" Stella exclaimed with a proud smile. Grace shook her head and replied, "(b) We did it, Coach. You taught me that victory belongs to the whole team, not just the fastest runner." Stella beamed, knowing that Grace had learned a lesson far more valuable than any trophy—the true power of teamwork and trust.`,
    translation: `(A) Grace는 Polish Falcons 육상 팀의 재능 있는 단거리 선수로, 200m 종목의 폭발적인 스피드로 유명했다. 그녀의 코치 Stella는 다가오는 주 챔피언십 계주를 위해 Grace와 팀원들을 수개월간 준비시켰다. 4x100m 계주의 마지막 주자(앵커)로서 Grace는 금메달에 대한 팀의 기대를 가슴에 품고 있었다. 대회를 앞둔 마지막 연습 세션 동안, Stella 코치는 Grace가 바통 터치를 연습하는 모습을 유심히 지켜보았다. (a) 그녀(Stella)는 Grace가 너무 일찍 가속을 시작하여 팀원이 바통을 넘겨주기 위해 위험할 정도로 멀리 팔을 뻗어야 한다는 점을 알아차렸다.

(C) Stella는 Grace를 트랙 옆으로 불렀다. "Grace, 너의 스피드는 놀랍지만, 계주에서는 개인의 페이스보다 타이밍과 신뢰가 더 중요하단다." (c) 그녀(Stella)는 다정하게 설명했다. 내면의 답답함이 표정을 어둡게 했지만 Grace는 고개를 끄덕였다. 그녀는 더 빠르게 달리는 것이 언제나 해결책이라고 생각했다. Stella는 Grace의 어깨에 손을 얹고 말했다. "두 주자가 하나로 움직일 때 바통이 더 빨리 나아간다는 걸 기억하렴. 팀원의 신호를 믿으렴." Grace는 깊은 숨을 쉬며 자신의 조급함이 팀의 호흡을 위협했음을 깨달았다.

(D) 다음 날 챔피언십 대회에서 분위기는 열광적이었다. 처음 세 명의 주자가 훌륭하게 자신의 구간을 달려, Grace가 마지막 바통 터치를 준비할 때 Polish Falcons 팀을 2위로 올려놓았다. 팀원이 마지막 코너를 돌 때 Grace는 Stella가 지켜보도록 훈련시킨 정확한 시각적 표식을 기다렸다. 성급히 앞으로 달려나가는 대신, (d) 그녀(Grace)는 가속 타이밍을 완벽하게 맞추었다. 바통은 걸림돌 없이 Grace의 손바닥으로 부드럽게 전달되었고, 그녀는 결승선을 향해 힘차게 달려 1위로 결승선을 통과하며 우승을 확정 지었다.

(B) 관중들이 환호하자 Grace는 돌아서서 팀원들과 Stella 코치를 껴안았다. "네가 해냈구나, Grace!" Stella가 자랑스러운 미소로 외쳤다. Grace는 고개를 저으며 대답했다. "(b) 우리가 해낸 거예요, 코치님. 승리는 단지 가장 빠른 주자가 아니라 팀 전체의 것이라는 걸 가르쳐 주셨잖아요." Stella는 Grace가 어떤 트로피보다 훨씬 더 가치 있는 교훈, 즉 팀워크와 신뢰의 진정한 힘을 배웠다는 것을 알고 미소를 지었다.`,
    options: [
      "43번 글의 순서: ③ (C) - (D) - (B)",
      "44번 지칭 추론: ④ (d)는 Grace, 나머지는 (a,b,c) 코치 Stella",
      "45번 내용 불일치: ⑤ Grace는 챔피언십 대회에서 바통을 받기 전 조급하게 앞으로 달려나갔다. (X -> 시각적 표식을 기다려 가속 타이밍을 맞춤)"
    ],
    answerIndex: 0,
    explanation: "43번: 연습 도중 바통 터치 문제 지적(A) -> 코치의 조언과 Grace의 깨달음(C) -> 대회 당일 완벽한 타이밍의 바통 전달과 우승(D) -> 팀원 및 코치와의 기쁨 분배 및 팀워크 교훈 체득(B)으로 연결되므로 ③ (C) - (D) - (B) 가 정답입니다.\n44번: (a), (b), (c)는 코치 Stella를 지칭하지만, (d)는 선수 Grace를 지칭하므로 ④번이 정답입니다.\n45번: Grace는 성급하게 앞으로 나가지 않고 지정된 표식을 기다려 완벽한 타이밍에 가속했으므로 ⑤번 설명이 글의 내용과 일치하지 않습니다.",
    syntaxNotes: [
      "...forcing her teammate [to stretch dangerously far to hand over the baton]. (force + 목적어 + to부정사 구문입니다.)",
      "The baton passed smoothly into Grace's palm ..., and she burst down ..., [crossing the finish line first to secure the championship]. (crossing은 연속 동작을 나타내는 분사구문입니다.)"
    ],
    vocabList: [
      { word: "anchor runner", meaning: "앵커 러너, 계주의 마지막 주자" },
      { word: "handoff", meaning: "(바통) 인계, 전달" },
      { word: "synchronization", meaning: "동기화, 호흡 맞춤" },
      { word: "home stretch", meaning: "결승 직전의 직선 코스" }
    ]
  },

  // ================= [ 실전모의고사 5회(1) ] =================
  {
    id: "26053-0278",
    lesson: "실전 5회(1)",
    itemNo: "19번",
    type: "심경 변화",
    title: "피아노 연주 경연에서의 긴장 완화와 만족감",
    passage: `Pushing myself out of my chair, I felt my thighs cling to the wood. I brushed past another contestant on the stairs and tried to smile, but my mouth was dry. And now, I realized, my hands were sopping wet. When I sat on the piano bench, I became aware that my knees were knocking and my feet were shaking. I waited for the shaking to die, and when it didn’t, I closed my eyes and tried to remember what my piano teacher once suggested: an image of myself playing for a barnyard full of animals. And then I leaned in and, with a grace note transition from D sharp to E, jumped into what I liked to think of as a horse race. My brain was jumping as fast as my fingers and my hands knew the rules and miraculously obeyed. It sounded good, I realized, maybe better than good. If I could keep playing at this speed, the air might even dry my hands.`,
    translation: `의자에서 몸을 일으키며 나는 허벅지가 나무에 달라붙는 것을 느꼈다. 계단에서 다른 참가자를 지나치며 미소를 지으려 했지만 입안이 바짝 말라 있었다. 손은 흠뻑 젖어 있었다. 피아노 의자에 앉았을 때 무릎이 부딪치고 발이 떨리고 있음을 알았다. 떨림이 가라앉기를 기다렸고, 선생님이 조언해 준 동물들로 가득 찬 농장에서 연주하는 이미지를 떠올렸다. 마침내 연주에 빠져들었고 손가락은 규칙을 알아차리듯 기적처럼 말을 들었다. 연주가 훌륭하게 들렸다.`,
    options: [
      "① bored → grateful",
      "② relaxed → amused",
      "③ excited → regretful",
      "④ nervous → satisfied",
      "⑤ frustrated → determined"
    ],
    answerIndex: 3,
    explanation: "무릎이 떨리고 입이 마르며 무대 위에서 극도로 긴장했다가(nervous), 연주가 성공적으로 흐르면서 만족감과 기쁨을 느끼게 되므로(satisfied) ④가 정답입니다.",
    syntaxNotes: [
      "When I sat on the piano bench, I became aware [that my knees were knocking...]. (that절은 형용사 aware의 보어로 쓰인 명사절입니다.)",
      "My brain was jumping as fast as my fingers and my hands knew the rules... (as ~ as 동급비교 구문입니다.)"
    ],
    vocabList: [
      { word: "sopping wet", meaning: "흠뻑 젖은" },
      { word: "grace note", meaning: "꾸밈음" },
      { word: "miraculously", meaning: "기적적으로" }
    ]
  },
  {
    id: "26053-0279",
    lesson: "실전 5회(1)",
    itemNo: "20번",
    type: "필자의 주장",
    title: "분석적 고정관념을 벗어나 가능성의 영역으로 시선 확장하기",
    passage: `So often we get stuck in the same little loop because, even though there is a bigger arena to play in, we don’t see it. And if you don’t see it, it doesn’t exist for you. Probability keeps us confined to a 3-D world, while abundance flows outside those boundaries, and your ability to access richness, in all its interpretations and forms, requires you to shift your focus from the analytical to the magical realm of possibility. Full stop. And when you do that, you will inevitably start to see what you didn’t see before. The movie of your life will shift from black and white to Technicolor, like when Dorothy walks out of her Kansas house into the Land of Oz. And as you move forward on your own yellow brick road, you’ll feel yourself lining up with possibility. You’ll feel yourself align with a new truth: all potentials exist. And what happened before won’t necessarily predict what comes next. Click your heels and repeat after me: I want to go home to infinite possibility.`,
    translation: `우리는 시야가 좁아져 더 큰 무대가 있음에도 이를 보지 못하고 동일한 고리에 갇히곤 한다. 확률은 우리를 3차원 세계에 가두지만, 풍요로움은 그 경계 외부에서 흐른다. 무한한 가능성의 풍요로움에 접근하려면 당신의 초점을 '분석적인 사고에서 가능성의 영역으로' 옮겨야 한다. 그렇게 할 때 인생이라는 영화가 흑백에서 천연색으로 바뀔 것이다.`,
    options: [
      "① 더 큰 무대로 나아가기 위해서는 큰 손실도 감수할 수 있어야 한다.",
      "② 잠재성을 일깨우려면 다른 사람은 알 수 없는 자기 모습을 봐야 한다.",
      "③ 미래를 준비하려면 과거의 경험과 확률에 기반한 예측을 해 보아야 한다.",
      "④ 무한한 가능성에 닿으려면 분석적 사고에서 가능성의 영역으로 시선을 옮겨야 한다.",
      "⑤ 진정한 자아실현을 위해서는 객관적 분석을 통해 세상을 정확히 이해해야 한다."
    ],
    answerIndex: 3,
    explanation: "과거의 확률이나 분석적 사고 방식에 갇히지 말고 무한한 가능성의 영역으로 시선을 옮기라는 주장이므로 ④가 정답입니다.",
    syntaxNotes: [
      "...requires you [to shift your focus from the analytical to the magical realm of possibility]. (require + 목적어 + to부정사 구조입니다.)",
      "And what happened before won't necessarily predict [what comes next]. (what 관계대명사절 두 개가 사용되었습니다.)"
    ],
    vocabList: [
      { word: "confined", meaning: "갇힌, 제한된" },
      { word: "abundance", meaning: "풍요로움" },
      { word: "inevitably", meaning: "필연적으로" },
      { word: "align with", meaning: "~와 부합하다, 일치하다" }
    ]
  },
  {
    id: "26053-0280",
    lesson: "실전 5회(1)",
    itemNo: "21번",
    type: "함축 의미 추론",
    title: "AI 기술에 관한 과장된 약속과 낙관적 예측",
    passage: `Much of what you hear about AI is riddled with fake news, often subtle, preying on awe or fear to capture your attention or to sell a product. The entire history of AI has been soaked with over-inflated promises and hopes, not so unlike those in stock markets that lead to bursting bubbles. The big downs in this rollercoaster ride were the ‘AI winters’ of the 1970s and 1980s, where funding, along with the reputation of AI, collapsed. As a result, AI became a dirty word for quite some time. For instance, when the supercomputer Watson was created in 2011, IBM did not call it AI but ‘cognitive computing’, fearing that otherwise no one would take Watson seriously. Since then, we have seen true advances in deep neural networks and computing power, but also unqualified, glorified claims about the general superiority of technologies over humans. Many of these tall tales are motivated by making profit, getting funding or wishful thinking. Promises about the future are cheap but hard to evaluate. <u class="font-bold underline decoration-blue-500">One can always say, if it’s not now, it will be soon.</u>`,
    translation: `AI에 관해 듣는 내용의 대부분은 가짜 뉴스나 과장으로 가득 차 있다. AI의 전 역사는 거품을 일으키는 주식 시장처럼 지나치게 부풀려진 약속과 희망으로 젖어 있었다. 1970년대와 80년대 AI 겨울 동안 투자가 축소되었고 AI라는 단어조차 외면받았다. 최근 기술적 진보가 있었지만, 여전히 이윤 창출이나 자금 조달을 목적으로 한 자격 없는 과장된 주장들이 무수하다. 미래에 대한 약속은 비용이 들지 않지만 검증하기 어렵다. <u class="font-bold underline">지금이 아니라면 곧 이루어질 것이라고 누구나 항상 말할 수 있다.</u>`,
    options: [
      "① AI development is limited by a lack of collaboration among researchers.",
      "② Although technology is advancing rapidly, expectations for AI remain low.",
      "③ People increasingly depend on AI due to stock market instability.",
      "④ Unprovable optimistic predictions about AI are often easily made.",
      "⑤ The superiority of today’s technology will shape the future."
    ],
    answerIndex: 3,
    explanation: "밑줄 친 문장은 입증할 수 없는 AI에 대한 낙관적이고 과장된 미래 예측들이 아무런 책임감 없이 손쉽게 이루어지고 있음을 비꼬는 말이므로 ④가 정답입니다.",
    syntaxNotes: [
      "The entire history of AI has been soaked with over-inflated promises ... [that lead to bursting bubbles]. (주격 관계대명사절입니다.)",
      "...fearing [that otherwise no one would take Watson seriously]. (fearing은 현재분사구문이며 that절을 목적어로 가집니다.)"
    ],
    vocabList: [
      { word: "riddled with", meaning: "~로 가득 찬" },
      { word: "over-inflated", meaning: "지나치게 부풀려진" },
      { word: "tall tale", meaning: "믿기 어려운 과장된 이야기" },
      { word: "evaluate", meaning: "평가하다" }
    ]
  },
  {
    id: "26053-0281",
    lesson: "실전 5회(1)",
    itemNo: "22번",
    type: "글의 요지",
    title: "심리학 연구의 문화적 편향성(WEIRD) 극복 필요성",
    passage: `Imagine you have been asked to conduct a scientific study on how much, when, and why “normal” people exercise. Because we tend to think of ourselves and our societies as normal, you’d probably collect data on the exercise habits of people like you and me. This approach is the norm in many fields of inquiry. For example, because most psychologists live and work in the United States and Europe, about 96 percent of the subjects in psychological studies are also from the United States and Europe. Such a narrow perspective is appropriate if we are interested only in contemporary Westerners, but people in Western industrialized countries aren’t necessarily representative of the other 88 percent of the world’s population. Moreover, today’s world is profoundly different from that of the past, calling into question who among us is “normal” by historical or evolutionary standards. If we really want to know what ordinary humans do and think about exercise, we need to sample everyday people from a variety of cultures instead of focusing solely on contemporary Americans and Europeans who are, comparatively speaking, WEIRD (Western, educated, industrialized, rich, and democratic).`,
    translation: `일반인의 운동 습관에 대해 연구하라는 요청을 받는다면, 대다수는 자신과 비슷한 사람들의 데이터를 수집할 것이다. 심리학 연구 대상자의 약 96%가 미국과 유럽 출신이다. 그러나 서구 산업화된 국가의 사람들이 전 세계 인구 88%를 대표하는 것은 아니다. 진정으로 인간에 대해 알고자 한다면 WEIRD(서구의, 교육받은, 산업화된, 부유한, 민주적인) 사람들에게만 집중하지 말고 다양한 문화권의 대중을 표본으로 삼아야 한다.`,
    options: [
      "① 여러 세대를 아우르는 장기간의 연구가 현대인을 더 정확히 설명한다.",
      "② 운동 습관의 차이는 주로 사회적 배경과 경제적 요인에 의해 설명된다.",
      "③ 인간 심리의 연구는 다양한 문화권의 사람을 대상으로 삼아야 대표성이 있다.",
      "④ 활동력이 뛰어난 국제적 감각을 지닌 연구자가 인간 행동 연구에 적합하다.",
      "⑤ 연구자가 자신의 연구 대상과 문화적 배경이 같을수록 자료 수집이 더 용이하다."
    ],
    answerIndex: 2,
    explanation: "서구 중심의 표본 추출에서 벗어나 다양한 문화권의 인구를 대상으로 연구해야 전 세계 인간 심리 및 행동의 대표성을 확보할 수 있다는 내용이므로 ③이 정답입니다.",
    syntaxNotes: [
      "...about 96 percent of the subjects in psychological studies are also from the United States and Europe. (percent of 뒤의 복수명사 subjects에 동사 are가 호응합니다.)",
      "...we need to sample everyday people from a variety of cultures [instead of focusing solely on contemporary Americans...]. (instead of + 동명사 구문입니다.)"
    ],
    vocabList: [
      { word: "representative", meaning: "대표하는" },
      { word: "profoundly", meaning: "깊게, 심대하게" },
      { word: "sample", meaning: "표본을 추출하다" },
      { word: "contemporary", meaning: "현대의, 동시대의" }
    ]
  },
  {
    id: "26053-0288",
    lesson: "실전 5회(1)",
    itemNo: "29번",
    type: "어법성 판단",
    title: "기억의 왜곡성과 재구성적 본질",
    passage: `Memories are subject to distortion or change over time, making it difficult to rely on ① <u class="font-semibold underline decoration-slate-400">what</u> we pull out of our mental attic. In reality, memory is more like a film that has been edited and mended, with entirely new scenes inserted, old ones rewritten with new characters, backgrounds, and dialogue, and some distorting lenses ② <u class="font-semibold underline decoration-slate-400">applied</u>. Our recollections can be influenced by a range of external factors such as context, mood, and expectations, causing them to become altered. This can result in different people ③ <u class="font-semibold underline decoration-rose-500">have</u> [-> having] different memories of the same event. Over time, our own memories of an event might change, sometimes ④ <u class="font-semibold underline decoration-slate-400">drastically</u>, as we recontextualize the experiences—we do this without conscious awareness and can’t help ourselves. These intruding distortions can also affect retrieval as we search our memory banks. If you’re searching your memory for that time you had shrimp scampi with your old high school friend Jim Ferguson, you may not find ⑤ <u class="font-semibold underline decoration-slate-400">it</u> because you and Jim never had shrimp scampi—you only talked about it—and this detail is somehow lost, merged, or rewritten.`,
    translation: `기억은 시간이 지남에 따라 왜곡이나 변화를 겪기 쉬우므로, 기억의 다락방에서 끄집어내는 것을 항상 신뢰하기는 어렵다. 실제로 기억은 새로운 장면이 삽입되고 다시 작성된 편집 영화와 같다. 다양한 외부 요인이 기억을 바꿀 수 있으며, 이는 동일 사건에 대해 다른 사람들이 다른 기억을 '갖는(having)' 결과를 초래할 수 있다.`,
    options: [
      "① what",
      "② applied",
      "③ have",
      "④ drastically",
      "⑤ it"
    ],
    answerIndex: 2,
    explanation: "전치사 in의 목적어로 동명사가 올 때 의미상 주어(different people) 뒤에는 동사원형 have가 아닌 동명사 having이 와야 합니다 (result in A having B).",
    syntaxNotes: [
      "This can result in [different people having different memories of the same event]. (전치사 in + 의미상 주어 + 동명사 구문입니다.)",
      "...with entirely new scenes inserted, old ones rewritten ..., and some distorting lenses applied. (with + 목적어 + 과거분사가 병렬된 독립분사구문 형태입니다.)"
    ],
    vocabList: [
      { word: "distortion", meaning: "왜곡" },
      { word: "recollection", meaning: "기억, 회상" },
      { word: "drastically", meaning: "급격히, 대단히" },
      { word: "retrieval", meaning: "인출, 검색" }
    ]
  },
  {
    id: "26053-0289",
    lesson: "실전 5회(1)",
    itemNo: "30번",
    type: "어휘 판단",
    title: "믹스테이프(Mixtape) 상호성에 담긴 개인적 감정 표출",
    passage: `Mixtapes were a form of potlatch—the Native American custom by which a gift given requires that a reciprocal gift be received in the future. I’d make you a mixtape of my favorite songs—presumably ones you would like and might not already have or know about—and you’d be ① expected to make a similar tape for me of songs you think I’d like. The reciprocal giving wasn’t super time-sensitive, but you couldn’t forget. The gift of a mixtape was very ② personal. Often they were made for exactly one person, no one else. A radio program with one listener. Each song, carefully chosen, with love and humor, as if to say, “This is who I am, and by this tape you will know me better.” The song choice and sequence ③ allowed the giver to say what one might be too shy to say outright. The songs contained on a mixtape from a lover were listened to carefully for clues and metaphors that might reveal the nuances and deeper meanings ④ <u class="font-semibold underline decoration-rose-500">ignored</u> [-> hidden / embedded] in the emotional cargo. Other people’s music—ordered and collected in infinitely imaginative ways—became a new form of ⑤ expression.`,
    translation: `믹스테이프는 답례 품앗이와 같았다. 선물을 받으면 미래에 답례품을 주어야 했다. 믹스테이프는 오직 한 사람만을 위해 제작된 매우 개인적인 선물이었다. 수줍어서 직접 말하기 어려운 감정을 노래 선택과 배치를 통해 전할 수 있었다. 연인이 준 믹스테이프 속 노래들은 감정의 짐 속에 '숨겨진/담긴(hidden/embedded)' 미묘한 차이와 더 깊은 의미를 파악하기 위해 주의 깊게 들어졌다.`,
    options: [
      "① expected",
      "② personal",
      "③ allowed",
      "④ ignored",
      "⑤ expression"
    ],
    answerIndex: 3,
    explanation: "연인이 준 믹스테이프 속 은유와 미묘한 차이는 무시되는 것이 아니라 노래 속에 '숨겨져 있거나 담겨있는' 깊은 뜻을 은연중에 전달하는 것이므로 ④의 ignored는 어색하며 hidden 등으로 고쳐야 합니다.",
    syntaxNotes: [
      "...a gift given requires [that a reciprocal gift be received in the future]. (require 뒤의 that절에 당위성의 의미로 (should) be 동사원형이 쓰였습니다.)",
      "The songs ... were listened to carefully for clues and metaphors [that might reveal the nuances...]. (주격 관계대명사절입니다.)"
    ],
    vocabList: [
      { word: "potlatch", meaning: "포틀래치 (선물을 나누어 주는 인디언 축제)" },
      { word: "reciprocal", meaning: "상호간의, 답례의" },
      { word: "outright", meaning: "노골적으로, 공공연히" },
      { word: "nuance", meaning: "미묘한 차이" }
    ]
  },

  // ================= [ 실전모의고사 5회(2) ] =================
  {
    id: "26053-0290",
    lesson: "실전 5회(2)",
    itemNo: "31번",
    type: "빈칸 추론",
    title: "이성(Rational Thought)의 사회적 및 언어적 구성성",
    passage: `We often talk about rational thought as if a possession of our minds. We say, for example, “let me think about it,” or “my reasoning is...” But when did we come to believe that thoughts were in the mind? At least one important source of this belief can be traced to the philosophy of René Descartes. Descartes found that he could doubt the existence of all things, but not the act of doubt itself. And because doubt is an act of human reason, reason stood as the chief attribute of the human being. But one must ask, how did Descartes know that he was reasoning? Did he somehow look into his brain and find, lo and behold, there was a thought in one corner and an emotion in another? This scarcely seems plausible. Rather, in order to write about rational thought, Descartes must have already had the words in his vocabulary. And if this is so, then it is to his relations with others that he owes the capacity to write about reason. In effect, the concept of human reason is not a reading of human nature, but a ________________________ construction.`,
    translation: `우리는 흔히 합리적 생각을 우리 마음의 소유물인 것처럼 말한다. 데카르트는 의심하는 행위 자체를 통하여 이성을 인간의 핵심 속성으로 보았다. 그러나 데카르트는 자신이 이성적 추론을 하고 있다는 것을 어떻게 알았을까? 그는 이미 어휘 속에 관련 단어들을 가지고 있었어야 했다. 타인과의 관계가 있었기에 이성에 대해 쓸 수 있었던 것이다. 결과적으로 인간 이성의 개념은 인성의 단순한 읽기가 아니라 '공동체적/사회적(communal)' 구성물이다.`,
    options: [
      "① communal",
      "② temporary",
      "③ hardwired",
      "④ creative",
      "⑤ modern"
    ],
    answerIndex: 0,
    explanation: "합리적 이성이라는 개념조차 언어와 타인과의 상호작용 속에서 형성된 것이므로, 이는 개인 내면의 독자적 산물이 아니라 '공동체적(communal)' 구성물이라는 결론에 도달합니다.",
    syntaxNotes: [
      "...then it is [to his relations with others] that he owes the capacity to write about reason. (It - that 강조구문입니다.)",
      "Descartes must have already had the words in his vocabulary. (must have p.p.는 '~했음에 틀림없다'는 과거의 확신입니다.)"
    ],
    vocabList: [
      { word: "rational thought", meaning: "합리적 생각" },
      { word: "plausible", meaning: "그럴듯한" },
      { word: "communal", meaning: "공동체의, 사회적인" },
      { word: "attribute", meaning: "속성, 특성" }
    ]
  },
  {
    id: "26053-0291",
    lesson: "실전 5회(2)",
    itemNo: "32번",
    type: "빈칸 추론",
    title: "우주 관광(Space Tourism)의 상업적 가능성과 과제",
    passage: `The idea of space tourism was initially dismissed by agencies such as NASA due to safety hazards as well as the amount of time and resources involved; however, with recent developments, it is now regarded as a possibility to generate revenues for space agencies. Still there are many areas of research on the potential for space tourism. For example, ________________________ needs to be determined. While surveys conducted over the years show a high level of interest in space tourism, the idea is still considered hypothetical for most due to technological and/or financial barriers. One study found that at least one-quarter of respondents would be unlikely to participate in space tourism, even if cost were not a consideration. Perceived risk was the primary reason given. Other issues pertain to health and training of participants; regulation, liability, and insurance; socioeconomic impacts of space tourism at spaceport locations; and environmental impact and carbon footprint. Using carbon calculators, one travel site estimated that emissions from one trip on a spacecraft would be the equivalent of 395 transatlantic flights.`,
    translation: `우주 관광은 안전 문제로 거부되었으나 최근에는 우주 기관의 수익 창출 가능성으로 여겨진다. 여전히 우주 관광의 잠재력에 관한 연구 과제가 많다. 예를 들어 '체험에 대한 실제 수요(actual demand for the experience)'가 확인되어야 한다. 조사 결과 응답자의 4분의 1은 비용 문제가 없더라도 안전상의 위험 인식 때문에 참여하지 않을 것이라고 밝혔다.`,
    options: [
      "① the physical structure of the spacecraft",
      "② actual demand for the experience",
      "③ the optimal length of the journey",
      "④ availability of financial support",
      "⑤ the specific travel destination"
    ],
    answerIndex: 1,
    explanation: "뒤이어 사람들이 위험 인식 때문에 실제 우주 여행 참여를 꺼린다는 조사 결과가 제시되므로, 우주 관광의 사업성을 결정짓는 '실제 수요(actual demand)' 파악 연구가 필요하다는 ②가 정답입니다.",
    syntaxNotes: [
      "One study found [that at least one-quarter of respondents would be unlikely to participate...]. (found의 목적어절 접속사 that입니다.)",
      "Using carbon calculators, one travel site estimated that... (Using은 분사구문입니다.)"
    ],
    vocabList: [
      { word: "hypothetical", meaning: "가설의, 가상의" },
      { word: "pertain to", meaning: "~와 관계가 있다" },
      { word: "liability", meaning: "법적 책임" },
      { word: "carbon footprint", meaning: "탄소 발자국" }
    ]
  },
  {
    id: "26053-0292",
    lesson: "실전 5회(2)",
    itemNo: "33번",
    type: "빈칸 추론",
    title: "AI 알고리즘과 인간의 데이터 편향 (Garbage in, Garbage out)",
    passage: `AI does not match the human brain. In fact, any digital statistical pattern recognition system is subject to the garbage in, garbage out effect: the input determines the output. The better the data, the better the results. This effect cannot be entirely avoided and reflects the general human condition. We humans generate the data we input into this new technology, which then generates the outcome. The human mind and the collective psyche work the same way. Multiple cognitive frames and biases, adverse and toxic experiences, traumatic upbringings, false memory coding, pure nonsense, confabulation, hallucinations and ultimate wisdom all come together and feed into this digital algorithm. It is therefore not surprising that the digital output of an AI resembles the statistical average of the input we provide, including the programmers’ algorithms. Statistical pattern recognition on a massive scale simply confronts us with our own flaws and mirrors our own limitations. AI is thus no more objective and fact-based than natural human intelligence, since it is programmed by humans with their own cognitive limits and constraints within a certain historical and cultural context. The answers AI gives us simply ________________________.`,
    translation: `AI는 '쓰레기가 들어가면 쓰레기가 나온다(garbage in, garbage out)'는 원리에 지배받는다. 인간이 제공한 데이터를 기반으로 결과가 생성되기 때문이다. 인간의 고정관념, 편향, 그릇된 기억 등이 알고리즘에 입력된다. AI의 답변은 객관적이지 않으며, 단지 '우리가 알고리즘에 주입한 통계적 규범을 반영할(reflect the statistical norms we insert into the algorithm)' 뿐이다.`,
    options: [
      "① reflect the statistical norms we insert into the algorithm",
      "② conform to objective realities rather than algorithmic limits",
      "③ show reasoning that appears to surpass human cognition",
      "④ exhibit consistent patterns across different cultural settings",
      "⑤ seem free from bias in both content and value judgments"
    ],
    answerIndex: 0,
    explanation: "AI의 결과물은 인간이 주입한 데이터와 알고리즘의 통계적 평균치 및 편향을 그대로 반영한 것이라는 내용이므로 ①이 정답입니다.",
    syntaxNotes: [
      "The better the data, the better the results. (더-더 비교급 구문으로 '~할수록 더 ...하다'라는 뜻입니다.)",
      "AI is thus no more objective ... than natural human intelligence... (no more A than B 구문으로 'B와 마찬가지로 A하지 않다'를 뜻합니다.)"
    ],
    vocabList: [
      { word: "garbage in, garbage out", meaning: "쓰레기를 넣으면 쓰레기가 나온다 (입력 유효성)" },
      { word: "confabulation", meaning: "작위증, 허위 기억" },
      { word: "confront", meaning: "직면시키다" }
    ]
  },
  {
    id: "26053-0293",
    lesson: "실전 5회(2)",
    itemNo: "34번",
    type: "빈칸 추론",
    title: "기술 발전과 사회적 규범·시스템 수용의 시간차",
    passage: `Cars were an impressive piece of technology in the late nineteenth century, and their transformative potential was apparent by the early twentieth. Yet ________________________. Social and cultural norms needed to evolve; some of those norms then needed to be codified into a body of regulatory law: describing where people could drive and how fast, who was allowed to operate a vehicle, what consequences there would be for misuse, and so on. The physical structure of society changed in response to the automobile. Governments spent vast sums to construct networks of streets and highways, while suburbs oriented around cars covered the landscape outside central cities. Firms experimented with car-oriented business models before coming up with hits along the lines of pizza delivery and NASCAR. And not until the last few decades of the twentieth century did the perfection of container shipping, trucking and big-box retail converge to transform the consumer experience in rich economies, as well as the development opportunities in the emerging economies that became the source for many of the cheap goods stocking large retail shelves.`,
    translation: `19세기 말 자동차는 인상적인 기술이었으나, '사회가 그 잠재력을 완전히 활용하기까지는 아주 오랜 시간이 걸렸다(it took a very long time for societies to fully exploit that potential)'. 사회적·문화적 규범이 발전하고 법제화되어야 했으며, 고속도로 건설과 외곽 도시 형성 등 물리적 구조 변화와 비즈니스 모델 정착에 긴 세월이 필요했다.`,
    options: [
      "① this same potential also created opportunities for misuse",
      "② the lack of consensus on embracing cars caused chaos in their use",
      "③ it took a very long time for societies to fully exploit that potential",
      "④ laws and regulations prevented the growth of the automotive industry",
      "⑤ mistrust of automotive technology stopped them from being used commercially"
    ],
    answerIndex: 2,
    explanation: "자동차라는 기술 자체는 일찍 등장했지만 법적 규제, 인프라 구축, 비즈니스 모델 성숙 등 사회 시스템 전반이 이에 맞춰 변화하는 데 수십 년의 오랜 시간이 걸렸다는 내용이므로 ③이 정답입니다.",
    syntaxNotes: [
      "Social and cultural norms needed to evolve; some of those norms then needed to be codified... (needed to be p.p. 수동형 부정사 구문입니다.)",
      "And not until the last few decades ... did the perfection of container shipping ... converge... (부정어구 Not until...이 문두에 와서 주어-동사 도치가 일어났습니다.)"
    ],
    vocabList: [
      { word: "codify", meaning: "법전으로 편찬하다, 성문화하다" },
      { word: "oriented", meaning: "~ 지향의, ~ 위주의" },
      { word: "converge", meaning: "한데 모이다, 수렴하다" }
    ]
  },
  {
    id: "26053-0294",
    lesson: "실전 5회(2)",
    itemNo: "35번",
    type: "무관한 문장",
    title: "현대 라이프스타일이 미생물 생태계(Microbiome)에 미치는 영향",
    passage: `Modern life can negatively affect the microbiome by preventing essential early exposures to beneficial bacteria and increasing exposure to factors that create literally “difficult living,” or disruptions to microbial communities. ① These factors include the presence of environmental toxins, eating processed foods and high-sugar, high-fat diets, lack of sleep, and sedentary behaviors. ② Sustained inactivity in humans has been associated with pronounced muscular degradation, highlighting the need for increased awareness of its physiological consequences. ③ Other modern ways of life that could negatively affect the microbiome include keeping houses too clean, living in urban rather than rural environments, and taking pharmaceuticals that have intentional or unanticipated antibiotic effects. ④ Even the ways in which we construct modern homes could be reducing our exposure to beneficial airborne microbes. ⑤ Lifestyle factors are one of the strongest influences on the microbiome, and studies suggest that modernity and urbanization are “highly disruptive to the tight-knit relationship that has evolved between humans and their microbes.”`,
    translation: `현대 생활은 유익한 세균에 대한 노출을 막아 미생물 생태계(마이크로바이옴)에 부정적 영향을 준다. 인공 가공식품, 과도한 청결, 항생제 복용 등이 원인이다. ② (지속적인 신체 비활동은 상당한 근육 퇴화를 초래하므로 생리적 영향에 대한 인식이 필요하다.) ⑤ 연구에 따르면 현대화와 도시화는 인간과 미생물 사이의 결속 관계를 심각하게 교란한다.`,
    options: [
      "① These factors include the presence of environmental toxins...",
      "② Sustained inactivity in humans has been associated with pronounced muscular degradation...",
      "③ Other modern ways of life that could negatively affect the microbiome...",
      "④ Even the ways in which we construct modern homes...",
      "⑤ Lifestyle factors are one of the strongest influences..."
    ],
    answerIndex: 1,
    explanation: "전체 글은 현대 라이프스타일이 체내 '마이크로바이옴(microbiome)'에 미치는 해로운 영향에 관한 것인데, ②번 문장은 단순 신체 비활동으로 인한 '근육 퇴화(muscular degradation)'를 설명하고 있으므로 글의 주제에서 벗어납니다.",
    syntaxNotes: [
      "...preventing essential early exposures ... and increasing exposure to factors... (preventing과 increasing이 병렬 연결되었습니다.)",
      "...modernity and urbanization are 'highly disruptive to the tight-knit relationship [that has evolved between humans and their microbes]'... (주격 관계대명사절입니다.)"
    ],
    vocabList: [
      { word: "microbiome", meaning: "마이크로바이옴, 체내 미생물 생태계" },
      { word: "sedentary", meaning: "앉아서 지내는" },
      { word: "muscular degradation", meaning: "근육 퇴화" },
      { word: "tight-knit", meaning: "긴밀한, 유대가 강한" }
    ]
  },
  {
    id: "26053-0299",
    lesson: "실전 5회(2)",
    itemNo: "40번",
    type: "요약문 완성",
    title: "존 로크의 노동에 기반한 소유권 이론",
    passage: `Locke begins his discussion of the right to property by explaining how we first obtain property. In the original state of nature, everything in the world belonged in common to all humans. People then took some item from the common storehouse, altered and improved it through their labor, and thereby created something that was uniquely their own. For example, someone may have cut down a tree and carved it into a boat, which he then called his own. We first acquire property, then, by applying our labor to a commonly held object. In Locke’s words, “Whatsoever then he removes out of the state that nature has provided, and left it in, he has mixed his labor with, and joined to it something that is his own, and thereby makes it his property.” According to Locke, this is an activity that people could freely engage in on a first-come-first-served basis, without needing to get prior consent from others. If prior mutual consent were required, people would have starved to death while waiting for permission from everyone.`,
    summarySentence: `Locke argues that in the state of nature, individuals first gain property by taking something from common resources and (A) [transforming] it through their labor, making it their own without needing (B) [approval] from others.`,
    translation: `로크는 자연 상태에서 공유 자원에 노동을 가해 개조함으로써 개인이 최초의 소유권을 획득한다고 설명한다. 타인들로부터 사전 동의를 얻을 필요 없이 선착순으로 이를 자유롭게 수행할 수 있었다. 동의가 필요했다면 승인을 기다리다 기아로 사망했을 것이다.

[요약문] 로크는 자연 상태에서 개인들이 공공 자원에서 무언가를 취해 노동을 통해 (A) 변형시킴(transforming)으로써 최초의 재산을 얻고, 타인으로부터의 (B) 승인(approval) 없이 이를 자신의 것으로 만든다고 주장한다.`,
    options: [
      "① transforming …… approval",
      "② maintaining …… permission",
      "③ personalizing …… forgiveness",
      "④ maintaining …… investment",
      "⑤ transforming …… guidance"
    ],
    answerIndex: 0,
    explanation: "자연의 공유 자원에 노동을 가하여 '변형(transforming)'시킴으로써 소유권이 발생하며, 이때 타인의 사전 '승인(approval)'은 필요하지 않다는 내용이므로 ①이 정답입니다.",
    syntaxNotes: [
      "Locke begins his discussion ... by explaining [how we first obtain property]. (by + -ing와 간접의문사절 구문입니다.)",
      "If prior mutual consent were required, people would have starved to death... (혼합 가정법/과거 완료 가정이 적용된 문장 구조입니다.)"
    ],
    vocabList: [
      { word: "common storehouse", meaning: "공유 창고, 자연의 공유 자원" },
      { word: "prior consent", meaning: "사전 동의" },
      { word: "mutual", meaning: "상호간의" }
    ]
  },
  {
    id: "26053-0300",
    lesson: "실전 5회(2)",
    itemNo: "41-42번",
    type: "장문 독해",
    title: "제도 간의 상호 의존성과 변경의 어려움(Institutional Rigidity)",
    passage: `Social scientists know that institutions are “sticky.” It’s hard to change them once they are in place, especially if they’ve been there for a long time. There are several reasons for this. For example, change may be expensive; constituents may emerge to defend the status quo; and alternatives, even if they can be envisioned, may be considered impractical and out of reach. In other words, once in place when someone tries to get rid of institutions or dramatically alter them, they are rarely (a) successful. Moreover, institutions don’t exist in (b) isolation from each other but rather come in sets. As political scientists have shown, institutions in these sets tend to depend on and complement each other.

For example, German labor market institutions depend on educational institutions to produce highly skilled workers without which German companies would have trouble maintaining the flexible production methods that (c) enable them to compete successfully in international markets for high-quality products like automobiles and machine tools. Conversely, German educational institutions depend on input and resources from manufacturers and labor unions operating in the labor market institutions to help (d) shape the apprenticeship and worker training programs that produce and sustain those highly skilled workers in the first place. Given the institutional complementarities involved in a political system, it is hard to change one institution without changing the others, which is another reason why institutions tend to be sticky. The point is that for all these reasons change usually occurs at the (e) <u class="font-semibold underline decoration-rose-500">core</u> [-> margin / periphery].`,
    translation: `제도는 일단 정착되면 쉽게 바뀌지 않고 '끈질기게(sticky)' 유지된다. 기득권층의 저항, 비용 문제, 그리고 제도 간 상호 보완성 때문이다. 예를 들어 독일의 노동 시장 제도는 직업 교육제도와 유기적으로 결합되어 있어 하나의 제도를 단독으로 바꾸기 어렵다. 따라서 이러한 제도의 변화는 중심부(core)가 아니라 '주변부(margin/periphery)'에서 겨우 일어난다.`,
    options: [
      "41번 제목: ② Institutional Rigidity: A Barrier to Change in Established Systems",
      "42번 문맥상 어색한 어휘: ⑤ (e) core -> margin / periphery"
    ],
    answerIndex: 1,
    explanation: "41번: 단단히 얽힌 제도가 쉽게 바뀌지 않는 경직성을 지닌다는 내용이므로 ②가 제목으로 가장 적절합니다.\n42번: 제도가 보완적으로 얽혀 쉽게 바뀌지 않으므로 변화는 핵심부(core)가 아니라 '주변부(margin)'에서 드물게 일어납니다. 따라서 ⑤의 core는 어색합니다.",
    syntaxNotes: [
      "It's hard to change them [once they are in place]... (once는 '일단 ~하면'의 접속사입니다.)",
      "...without which German companies would have trouble maintaining... (전치사 + 관계대명사 구문으로 앞의 선행사 workers를 받습니다.)"
    ],
    vocabList: [
      { word: "sticky", meaning: "끈적거리는, 쉽게 변하지 않는" },
      { word: "status quo", meaning: "현재 상태, 현상" },
      { word: "complementarity", meaning: "상호 보완성" },
      { word: "apprenticeship", meaning: "견습 제도" }
    ]
  },
  {
    id: "26053-0302",
    lesson: "실전 5회(2)",
    itemNo: "43-45번",
    type: "장문 독해",
    title: "Samuel Scudder와 아가시 교수의 관찰 훈련법",
    passage: `(A) One morning, Samuel Scudder, a young student, arrived at Harvard’s Lawrence Scientific School, excited to learn from the renowned Professor Louis Agassiz. But instead of a lecture or textbook, Agassiz handed him a preserved fish and simply said, “Look at your fish,” then walked away. Confused, Scudder examined the fins, the shape, and the dull eye, but soon felt there was little more to discover. When Agassiz returned and asked what (a) he had observed, Scudder recited his basic observations. After listening, the professor just replied, “Look at your fish.”

(D) Frustrated but determined, Scudder returned to the task. Yet each time he reported his findings, the professor repeated the same phrase: “Look at your fish.” Scudder began to wonder what (d) he was truly trying to teach—what he meant by this repetition, and why he never explained himself. With no books or guidance, just (e) his eyes and patience, Scudder gradually began to notice more: the pattern of the scales, the curve of the spine, the way the gills folded. One day, he exclaimed, “The organs are paired!”

(C) The professor smiled and said, “Of course. So, what’s next?” Now catching on, Scudder replied, “Look at my fish?” “Yes,” Agassiz said with a nod. He offered no praise or further instruction, only the same advice he had given from the beginning: “Look at your fish.” That phrase meant more than it first appeared. Over the following days, Scudder’s perception sharpened. (c) He observed fine ridges on the fins, tiny teeth in the jaw, even the subtle tilt of the head. What once seemed lifeless had become complex and beautiful.

(B) In time, Scudder understood the purpose of the exercise. He realized it had little to do with the fish itself. Instead, it was about training the mind to slow down, to observe with care, and to resist drawing immediate conclusions. Years later, (b) he credited this experience with shaping his entire scientific career. “What once seemed dull,” he wrote, “taught me how to truly observe.” The phrase “look at your fish” remained with him—not as a simple task, but as a principle for patient observation.`,
    translation: `(A) 젊은 학생 Scudder는 하버드의 저명한 Agassiz 교수 밑에서 배우러 왔다. 그러나 교수는 보존된 물고기 한 마리를 주며 "물고기를 관찰하게"라는 말만 남기고 떠났다.
(D) Scudder가 계속해서 관찰 보고를 할 때마다 교수는 동일한 문구만 되풀이했다.
(C) 지속적인 관찰을 통해 Scudder는 지느러미와 아가미의 정교한 쌍을 이루는 구조를 파악했다.
(B) 훗날 Scudder는 이 경험이 조급한 결론을 피하고 인내심 있게 주의 깊게 관찰하는 법을 가르쳐 준 인생의 중요한 원칙이었음을 깨달았다.`,
    options: [
      "43번 글의 순서: ⑤ (D)－(C)－(B)",
      "44번 지칭 추론: ⑤ (e)his는 Scudder의 시선/인내심, 나머지는 (a,b,c) Scudder 및 (d)교수",
      "45번 내용 불일치: ③ 교수는 Scudder에게 칭찬과 추가 지시를 하지 않았다."
    ],
    answerIndex: 2,
    explanation: "43번: 관찰 실패와 재시도(D) -> 관찰의 눈이 열리고 교수의 확인(C) -> 훈련의 진정한 목적 깨달음(B)으로 연결되므로 ⑤가 정답입니다.\n44번: (a), (b), (c)는 Scudder를 지칭하고 (d)는 교수를 지칭하며 (e)는 Scudder의 자질을 의미하는 문맥상 지칭 분석에 대응됩니다.\n45번: 교수는 칭찬이나 추가 지시를 일절 하지 않고 오직 'Look at your fish'만 되풀이했으므로 ③이 잘못된 내용입니다.",
    syntaxNotes: [
      "He offered no praise or further instruction, [only the same advice {he had given from the beginning}]... (과거완료 시제가 사용되었습니다.)",
      "...he credited this experience with shaping his entire scientific career. (credit A with B 구문입니다.)"
    ],
    vocabList: [
      { word: "renowned", meaning: "저명한, 유명한" },
      { word: "gill", meaning: "아가미" },
      { word: "perception", meaning: "지각, 인지" },
      { word: "patient observation", meaning: "인내심 있는 관찰" }
    ]
  }
];
