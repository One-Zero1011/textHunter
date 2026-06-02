import { Npc, ChatHistory } from '../types';

export const INITIAL_NPCS: Npc[] = [
  {
    id: 'baek',
    name: '백운혁',
    age: 45,
    gender: '남성',
    rank: 'S급 (방어 특화 탱커)',
    specialty: '대한민국 방어력 랭킹 1위 / 희생의 방패',
    catchphrase: '"세상을 구하는 것보다, 내 딸의 오늘 저녁 메뉴가 더 중요하다."',
    avatarUrl: '🛡️',
    illustUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    rapport: 0,
    unlocked: false,
    isAlly: false,
    colorClass: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
    description: '과거 대한민국을 지탱하던 세 기둥 중 한 명인 \'철옹성\'. 3년 전 아내를 잃은 레드 게이트 사고 이후 대의명분에 극도로 시니컬하다. 실어증에 걸린 5살 딸 서아만을 바라보는 딸바보 아빠이자 고독한 헌터.',
    likes: ['서아의 웃음소리', '서아가 그려준 그림', '지독한 에스프레소', '고독한 산책'],
    dislikes: ['헌터 협회의 출동 명령', '무능한 가식주의자들', '담배 끊으라고 잔소리하는 애기(금채란)'],
    fear: '세상이 멸망하여 홀로 지옥에 남을 서아의 비참한 미래',
    features: [
      '아군을 감싸고 대신 피격하는 특화 패시브 보유',
      '주인공의 머리 또는 몸통에 가해지는 즉사급 치명타를 1회 막아냄 (쿨다운 있음)',
      '민첩 6, 무식한 탱킹력과 강력한 무체급 방어력'
    ]
  },
  {
    id: 'geum',
    name: '금채란',
    age: 11,
    gender: '여성',
    rank: 'S급 (결계 및 결속 폭발)',
    specialty: '최연소 S급 마법사 / 황금색 참교육',
    catchphrase: '"허접한 아저씨는 뒤에서 구경이나 하라니까? S급인 채란 님이 알아서 다 끝내 줄 테니까!"',
    avatarUrl: '⚡',
    illustUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
    rapport: 0,
    unlocked: false,
    isAlly: false,
    colorClass: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    description: '어른들의 욕심 속에 최연소 헌터 병기로 자란 천재 마법소녀. 깊은 차원의 미궁 속에서 한 번도 마주한 적 없는 주인공을 구하며 홀로 쓸쓸히 전멸했던 것만 같은 기이하고 생생한 악몽에 시달리고 있다. 그 무의식적인 기억의 기시감 때문에 이상하게 주인공에게 이끌리고 집착하며 그를 지켜주려 한다.',
    likes: ['최고급 수제 마카롱', '주인공의 어버버하는 곤란한 표정', '메스카키식 놀림', '화려한 악세서리'],
    dislikes: ['아저씨 담배 냄새(백운혁 저격)', '자신을 꼬마로 취급하는 협회 어른들', '먼지 날리는 어두운 동굴'],
    fear: '카운트다운이 끝난 후, 세상에 자신을 기억해줄 사람이 한 명도 없는 채 소멸하는 것',
    features: [
      '주인공 공격 주사위 실패 시 자신의 마력을 나눠주어 결과 판정 보강',
      '전체적인 적 광역 결계 폭사 능력',
      '전투 시작 시 파티원 전체에 강력한 결계 오라 부여'
    ]
  },
  {
    id: 'lim',
    name: '임소연',
    age: 21,
    gender: '여성',
    rank: 'S급 (기록 분석 및 시간 왜곡)',
    specialty: '기록 분석 특화 / 기록자의 교정',
    catchphrase: '"...저기, 제가 읽은 고서에는 이런 괴물이 없었는데... 혹시 제가 모르는 이 세계의 진실이 또 있나요?"',
    avatarUrl: '📖',
    illustUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop',
    rapport: 0,
    unlocked: false,
    isAlly: false,
    colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    description: '극단적인 낯가림과 사회 공포증으로 도서관 구석에 틀어박힌 천재 아카이브 헌터. 세상 모든 지식을 완벽하게 분석하려는 강박관념이 있다. 주인공이 회수해 오는 정체불명의 "인과 기록 파편"을 가져다주면, 시공간 왜곡 공식과 자아의 깊은 기시감(데자뷔)을 해독해 내는 중추적 역할을 한다.',
    likes: ['가죽 냄새 풍기는 낡은 고문헌', '도서관 구석의 완벽한 정적', '따뜻한 얼그레이 홍차', '주인공이 고이 전해준 던전 속 낡은 조각들'],
    dislikes: ['귀청 떨어질 듯한 소음', '허락 없이 안경을 만지거나 뺏는 행위', '규칙에서 벗어난 상식 밖의 상황'],
    fear: '자신의 머리나 데이터로도 영원히 해결 불가능한 파국과 종말',
    features: [
      '매 전투 중 주사위 결과가 좋지 않을 시 1회 무료 재굴림 유도',
      '전투 중 적의 치명적인 급습 위험 구간을 턴마다 한발 앞서 분석해 회피율 획기적 증가',
      '지력 스탯 성장 시 추가 보너스 이벤트 개방 가능'
    ]
  },
  {
    id: 'kang',
    name: '강다인',
    age: 28,
    gender: '여성',
    rank: 'B급 (마력 저격 및 화력 엄호)',
    specialty: '차원 탄도사 / 저격 전문가',
    catchphrase: '"내 저격 배율 회선 끝엔 언제나 타깃 뿐이야. 주저말고 뚫고 돌진해."',
    avatarUrl: '🎯',
    illustUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=300&auto=format&fit=crop',
    rapport: 0,
    unlocked: false,
    isAlly: false,
    colorClass: 'text-violet-400 border-violet-500/30 bg-violet-950/20',
    description: 'S급 전력 영입 사절단 최우선 순위로 거론되는 우수한 정밀 저격 사수. 대단히 이성적이고 세밀하며, 헌터 협회의 관료주의와 위선에 환멸을 느끼고 고독하게 단독 활동을 이어가고 있다.',
    likes: ['초감도 안구 조준경 렌즈', '기맥이 동조된 무광 오일', '조용한 단독 저격 고지', '따뜻한 에스프레소'],
    dislikes: ['목숨을 종잇장처럼 취급하는 길드장', '불안정하고 시끄러운 오발사격', '총기 개조 수수료 속이기'],
    fear: '서울 상공 게이트가 폭발할 때, 원거리에서 소중한 구원자들을 다 놓치고 무능하게 낙조하는 것',
    features: [
      '전투 중 원거리 강력 선공 라이플 저격 지원',
      '민첩 및 지력 상호 증폭 저인 고관통 탄도 부여',
      '적의 공격 판정 수치를 안정적으로 하향 고정하는 연사'
    ]
  },
  {
    id: 'yoo',
    name: '유채은',
    age: 24,
    gender: '여성',
    rank: 'C급 (공간 탐측 및 광학 탐지)',
    specialty: '던전 정찰 및 레이더 파장 계측',
    catchphrase: '"어라? 박지후 씨의 전위 궤적이 제 특유 레이더에 계속 감측되네요... 설마 스티킹인가요?"',
    avatarUrl: '🧭',
    illustUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
    description: '통신 회사 산하 융합연구원 출신의 엘리트 탐측 특수 헌터. 기계 장치와 전자기 마력파 주파수를 접합해 가혹한 아공간의 완벽한 3D 가상 지도를 그리는 천재 계측관.',
    likes: ['금태 전자기 단말기', '고가 가청식 헤드셋', '한강 둔치의 시원한 새벽 바람', '달콤한 밀크티'],
    dislikes: ['데이터 누수가 심각한 모조 레이더', '장비 결합 오작동 점멸 코드', '낭만적으로 대책없이 사선에 돌격하는 야성 헌터'],
    fear: '절대 지도로 해독 불가능한 차원의 미궁 속에 영영 혼자 미아가 되는 파국',
    rapport: 0,
    unlocked: false,
    isAlly: false,
    colorClass: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
    features: [
      '탐험 시 아공간 레이더 시야반경을 넓히고 공간 수치 분석 정보 제공',
      '턴 시작 시 탐측 주파수로 적의 회피율과 방벽 정지 궤적 분석',
      '상자의 위치와 드롭율을 계량화해 최고의 수확 확률 유도'
    ]
  },
  {
    id: 'choi',
    name: '최강식',
    age: 36,
    gender: '남성',
    rank: 'D급 (강습 전투 및 정면 대치)',
    specialty: '백도어 타격검 / 근접 거구 돌격',
    catchphrase: '"으오오오!! 사나이 주먹 완력은 의리를 결코 속이지 않는다!"',
    avatarUrl: '🪓',
    illustUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    description: '거구의 야성적인 돌격 대장. 상층 길드의 눈에 띄기 위해 열과 성을 다해 무식한 훈련을 거듭하는 열정 가득한 헌터. 상남자다운 외모와 달리 속정이 깊고 정체된 마력 극복에 갈증을 느끼고 있다.',
    likes: ['200kg짜리 주물 아령들', '뜨겁게 푹 삶은 왕족발 구이', '열혈 정통 액션 영화', '지후 같은 든든한 의형제'],
    dislikes: ['소심하게 뒷걸음질 치는 정찰조', '척추 신경 갈아넣기 타령하는 기획관', '약골 취급하면서 비웃는 B급 이상 길드원들'],
    fear: '재능의 벽에 무고하게 가로막혀, 끝내 동료들을 수호하지 못하고 참담하게 뒤처져 낙오되는 것',
    rapport: 0,
    unlocked: false,
    isAlly: false,
    colorClass: 'text-red-400 border-red-500/30 bg-red-950/20',
    features: [
      '사나이 도끼 내리찍기로 적에게 강력한 물리 타격 및 고정 데미지 부여',
      '전체적인 근력 스탯의 시너지 효과를 내며 적 넉스 공격 증폭',
      '협동 전사 버프로 물리 방어력 한계치 상향 격상'
    ]
  },
  {
    id: 'park',
    name: '박소록',
    age: 26,
    gender: '여성',
    rank: 'E급 (의료 보조 및 영양학)',
    specialty: '비인가 보조 치료 / 응급 약학 연금술',
    catchphrase: '"지후 씨가 다치시는 것을 원치 않아요. 상처가 깊다면 제 손끝을 느껴 보세요."',
    avatarUrl: '🧪',
    illustUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
    description: '수습 각성자 보조 센터의 소담하고 온유한 응급 치료 봉사대장. 소정의 마력으로 부상 부위를 치료하거나, 마석에 남은 잔류 입자를 정제하여 특제 고효율 에너지 정제를 제안한다.',
    likes: ['유기농 라벤더 허브 지혈 미스트', '동자동 정수기의 시원한 물', '어깨를 따스하게 위로해주는 손길', '치유학 전공 원서'],
    dislikes: ['생명을 자원으로 환산하는 냉혹한 협회 임원들', '오물이 잔뜩 묻어 뭉쳐버린 소생 붕대', '약 복용을 자꾸 거부하는 고집쟁이'],
    fear: '기맥 폭발로 상처 입은 아이들과 동료들을 치료할 의약품이 끊겨 오열하는 고립 지옥',
    rapport: 0,
    unlocked: false,
    isAlly: false,
    colorClass: 'text-sky-400 border-sky-500/30 bg-sky-950/20',
    features: [
      '전투 중 부속된 가장 큰 손상 부위를 포착해 +20 특수 치유',
      '안전가옥 복귀 및 침상 수면 시 추가 연산 피로 보정 물약 증여',
      '응급 영양 조절로 마력과 정신 가청력을 소폭 회복 지원'
    ]
  },
  {
    id: 'shin',
    name: '신현민',
    age: 19,
    gender: '남성',
    rank: 'F급 (수집 및 보급 지원)',
    specialty: '던전 하역 전담 / 잡동사니 골동품 수집광',
    catchphrase: '"F급이라고 폐지나 줍는 잉여라 부르지 마쇼! 쓸데없는 마석 장비 찾는데는 1등이니까!"',
    avatarUrl: '📦',
    illustUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop',
    description: '폐기 직전인 아공간 포탈 부품 전용 잡동사니 하역 아르바이트를 업으로 삼는 명랑 쾌활한 고등학생 각성자. 전투력은 낮으나 폐마정 기물 복제 단말기 고치기에 뛰어난 숨은 장인.',
    likes: ['희귀 연정 마석 폐부품', '편의점 핫바와 바나나 우유', '지후를 향한 사나이 경례 공정', '여동생 서윤이가 직접 구워온 쿠키'],
    dislikes: ['하역 단가를 소급 삭감하는 깐깐한 알바 부장', '장비 녹여서 구리선 훔쳐가기', '협회 소속 정복 입은 귀족 각성자들'],
    fear: '대정장 기맥 수치 폭발 후 피난 열차 차표를 얻지 못해 여동생을 영원히 잃는 파탄',
    rapport: 0,
    unlocked: false,
    isAlly: false,
    colorClass: 'text-zinc-400 border-zinc-500/30 bg-zinc-950/20',
    features: [
      '던전 승리 시 수집 마석 부속물에서 추가 +10% 골드 환급 보너스 축적',
      '보장 폐 보물상자 및 시크릿 큐브의 고지 개봉율 상승',
      '전투 중 위급 시 마석 보조 폭탄을 투사해 다탄두 화력 엄호'
    ]
  }
];

export const INITIAL_CHAT_HISTORY: ChatHistory = {
  baek: [],
  geum: [],
  lim: [],
  kang: [],
  yoo: [],
  choi: [],
  park: [],
  shin: []
};
