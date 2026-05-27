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
    rapport: 10,
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
    rapport: 10,
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
  }
];

export const INITIAL_CHAT_HISTORY: ChatHistory = {
  baek: [],
  geum: [],
  lim: []
};
