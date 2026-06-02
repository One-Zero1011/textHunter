import { Equipment } from '../types';

export const INITIAL_EQUIPMENT: Equipment[] = [
  // Weapons
  {
    id: 'dagger_f',
    name: 'F급 녹슨 단검',
    description: '헌터 협회 가입 시 제공하는 가장 기초적인 장비. 조금 무디지만 이빨은 들어간다.',
    price: 3000,
    slot: 'weapon',
    bonuses: { agility: 2 },
    purchased: true,
    equipped: true
  },
  {
    id: 'greatsword_d',
    name: 'D급 강철 대검',
    description: '묵중한 강철로 주조된 일반 전사용 검. 찌르기보다는 베는 타격감이 일품.',
    price: 12000,
    slot: 'weapon',
    bonuses: { strength: 8 },
    purchased: false,
    equipped: false
  },
  {
    id: 's_class_katana',
    name: 'S급 시공 가속의 차원도',
    description: '시간과 공간의 경계를 미세하게 가르는 정체불명의 신검. 공격 시 민첩과 무력이 극한으로 융합된다.',
    price: 85000,
    slot: 'weapon',
    bonuses: { strength: 25, agility: 35, health: 10 },
    purchased: false,
    equipped: false
  },

  // Head (머리)
  {
    id: 'band_f',
    name: 'F급 투사의 낡은 머리띠',
    description: '낡은 천 무늬가 그어진 평범한 머리띠. 정신무장에 가벼운 도움을 준다.',
    price: 2000,
    slot: 'head',
    bonuses: { strength: 1 },
    purchased: false,
    equipped: false
  },
  {
    id: 'goggles_c',
    name: 'C급 마도 전술 바이저',
    description: '대상의 마력 궤적과 약점을 정밀 분석하여 투사하는 전술용 헤드기어.',
    price: 18000,
    slot: 'head',
    bonuses: { agility: 6, intellect: 12 },
    purchased: false,
    equipped: false
  },
  {
    id: 'helm_s',
    name: 'S급 전생 영웅의 장엄 고대 투구',
    description: '신화의 수호자가 쓰던 유물이 극소 유입된 상태. 머리로 침식하는 마석 광선과 저주를 원천 차단한다.',
    price: 75000,
    slot: 'head',
    bonuses: { strength: 22, health: 15 },
    hpModifier: { head: 55 },
    purchased: false,
    equipped: false
  },

  // Torso (몸통)
  {
    id: 'leather_armor_f',
    name: 'F급 수습 헌터용 도마뱀 가죽 튜닉',
    description: '질긴 전방 도마뱀 가죽으로 만들어진 기본 갑주. 몸통을 부드럽게 감싼다.',
    price: 5000,
    slot: 'torso',
    bonuses: { strength: 1 },
    hpModifier: { torso: 20 },
    purchased: false,
    equipped: false
  },
  {
    id: 'plate_mail_b',
    name: 'B급 하프 마석 기사 갑주',
    description: '고급 티타늄과 침식 중화 플레이트. 치명적인 즉사 위험으로부터 인체를 견고하게 수호한다.',
    price: 45000,
    slot: 'torso',
    bonuses: { strength: 15 },
    hpModifier: { torso: 80, head: 10 },
    purchased: false,
    equipped: false
  },
  {
    id: 'armor_s',
    name: 'S급 불멸 수호자의 차원 가호 성갑',
    description: '시공간의 폭풍으로부터 장착자를 불사(Immortal) 상태로 동조하는 궁극의 강화 갑주.',
    price: 110000,
    slot: 'torso',
    bonuses: { strength: 38, health: 20, intellect: 10 },
    hpModifier: { torso: 150, head: 25 },
    purchased: false,
    equipped: false
  },

  // Arms (팔)
  {
    id: 'gloves_f',
    name: 'F급 가죽 헌터 반장갑',
    description: '손아귀의 마찰을 늘려주고 가벼운 타박상을 막는 경량 고 탄성 가죽 장갑.',
    price: 1500,
    slot: 'arms',
    bonuses: { agility: 2 },
    purchased: false,
    equipped: false
  },
  {
    id: 'gauntlet_b',
    name: 'B급 마석 충전 강철 건틀렛',
    description: '타격 시 축적된 운동 능력을 마석 폭발 동력으로 순간 가속시키는 아머 슬리브.',
    price: 28000,
    slot: 'arms',
    bonuses: { strength: 10, agility: 12 },
    hpModifier: { leftArm: 25, rightArm: 25 },
    purchased: false,
    equipped: false
  },

  // Legs (다리)
  {
    id: 'boots_d',
    name: 'D급 헌터용 신속 장화',
    description: '날렵한 야생 오크 사냥꾼의 발걸음을 추출하여 가공한 우레탄 부츠.',
    price: 15000,
    slot: 'legs',
    bonuses: { agility: 10 },
    purchased: false,
    equipped: false
  },
  {
    id: 'greaves_s',
    name: 'S급 헤르메스의 시공 극광 그리브',
    description: '중력을 역전시키고 마석 장벽을 비켜 날아오르는 차원 극광 도약 부츠.',
    price: 68000,
    slot: 'legs',
    bonuses: { agility: 42, intellect: 8 },
    hpModifier: { leftLeg: 35, rightLeg: 35 },
    purchased: false,
    equipped: false
  },

  // Ring (반지)
  {
    id: 'ring_health_c',
    name: 'C급 불굴 각인 펜타곤 반지',
    description: '심연 마석 파편을 유기 교배시켜 각 각성자의 기초 체력 수준을 상향 유도하는 고리.',
    price: 25000,
    slot: 'ring',
    bonuses: { health: 15, intellect: 5 },
    purchased: false,
    equipped: false
  },
  {
    id: 'ring_god_s',
    name: 'S급 우로보로스의 무한 평행 반지',
    description: '전생해 모은 가설 에너지를 반지 구멍 중심에 고정하여 모든 능력치를 고착 영속시킨다.',
    price: 120000,
    slot: 'ring',
    bonuses: { strength: 20, agility: 20, health: 20, intellect: 20 },
    purchased: false,
    equipped: false
  },

  // Necklace (목걸이)
  {
    id: 'necklace_f',
    name: 'F급 수호 각인 펜던트',
    description: '가벼운 생기를 충격 완화 보호 조율하여 몸통 방어율을 높여주는 청동 수호 목걸이.',
    price: 3500,
    slot: 'necklace',
    bonuses: { health: 4 },
    purchased: false,
    equipped: false
  },
  {
    id: 'necklace_a',
    name: 'A급 폭풍 전령의 생령 에센스',
    description: '폭풍 균열의 중심 핵을 그대로 구슬로 동결한 목걸이. 전신의 생명 호흡 동조율이 기하급수적으로 상향됩니다.',
    price: 42000,
    slot: 'necklace',
    bonuses: { agility: 14, health: 28 },
    purchased: false,
    equipped: false
  },

  // ===================== SKILL BOOKS (스킬 서적류 - 상점 및 드롭) =====================
  {
    id: 'book_summon_shadow',
    name: '[스킬북] 그림자 파수병 소환',
    description: '사용 시 연성을 통해 검은 그림자 지원군을 매 턴 부르는 [그림자 파수병 소환] 스킬을 영구 습득합니다.',
    price: 7000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  },
  {
    id: 'book_summon_golem',
    name: '[스킬북] 대지 마기 암석골렘',
    description: '사용 시 바위로 결집하여 사지/부상 충격을 대신 완화 가드하는 [대지 마기 암석골렘] 스킬을 영구 습득합니다.',
    price: 16000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  },
  {
    id: 'book_summon_dragon',
    name: '[스킬북] 화염룡 살라맨더',
    description: '사용 시 고열 폭풍 파편을 매 턴 뿌려 적을 지지는 불아기용 [화염룡 살라맨더] 스킬을 영구 습득합니다.',
    price: 45000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  },
  {
    id: 'book_magic_fire',
    name: '[스킬북] F급 마능 파이어볼',
    description: '사용 시 지력 스킬 비례 마능 화염구를 적 투사 격타하는 기본 지성 마법 [마능 주입 파이어볼]을 영구 습득합니다.',
    price: 6000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  },
  {
    id: 'book_magic_thunder',
    name: '[스킬북] 우레 낙인 라이트닝 버스터',
    description: '사용 시 보랏빛 전격을 모아 적을 분쇄 관통하는 [우레 낙인 라이트닝 버스터] 스킬을 영구 습득합니다.',
    price: 28000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  },
  {
    id: 'book_magic_restoration',
    name: '[스킬북] 고품격 전신 정화 회복술',
    description: '사용 시 무너지던 전신 사지 파지 상태를 즉각 정화 연마하여 치료하는 백마법 [전신 정화 회복술]을 영구 습득합니다.',
    price: 55000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  },
  {
    id: 'book_hunter_dash',
    name: '[스킬북] 수습 보행 파열 자돌격',
    description: '사용 시 강속 도약 런지로 단검 찌르기 가해량을 강력 폭증시키는 기본 헌터 스킬 [수습 보행 파열 자돌격]을 영구 습득합니다.',
    price: 5000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  },
  {
    id: 'book_hunter_shield',
    name: '[스킬북] 백은 성광 강습 격벽',
    description: '사용 시 주위를 타격 폭풍으로 요격하며 단장 투척 쉴드를 충전하는 무투 기술 [백은 성광 강습 격벽]을 영구 습득합니다.',
    price: 32000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  },
  {
    id: 'book_hunter_execution',
    name: '[스킬북] 공간 붕괴 삼극 차원참',
    description: '사용 시 시공 단면을 세 번 칼날 교차로 저격 돌진 세절하는 차원 헌터 비술 [공간 붕괴 삼극 차원참]을 영구 습득합니다.',
    price: 95000,
    slot: 'skillbook',
    bonuses: {},
    purchased: false,
    equipped: false
  }
];

export const isShopItem = (itemId: string): boolean => {
  const basicItemsAndBooks = [
    'dagger_f', 'greatsword_d', 'band_f', 'leather_armor_f', 'gloves_f', 'boots_d', 'necklace_f',
    'book_summon_shadow', 'book_magic_fire', 'book_hunter_dash'
  ];
  return basicItemsAndBooks.includes(itemId);
};
