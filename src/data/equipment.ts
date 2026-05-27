import { Equipment } from '../types';

export const INITIAL_EQUIPMENT: Equipment[] = [
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
    id: 'leather_armor_f',
    name: 'F급 수습 방어구',
    description: '질긴 도마뱀 가죽으로 만들어진 기본 튜닉. 몸통을 약간 보호해준다.',
    price: 5000,
    slot: 'armor',
    bonuses: { strength: 1 },
    hpModifier: { torso: 20 },
    purchased: false,
    equipped: false
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
    id: 'boots_d',
    name: 'D급 헌터용 신속 장화',
    description: '날렵한 오크 사냥꾼의 깃털 무늬가 인쇄된 경량 부츠.',
    price: 15000,
    slot: 'accessory',
    bonuses: { agility: 10 },
    purchased: false,
    equipped: false
  },
  {
    id: 'ring_mana_c',
    name: 'C급 화염 각인 반지',
    description: '불타는 마석 조각을 가공하여 마력 집적율을 향상시킨 고급 장신구.',
    price: 25000,
    slot: 'accessory',
    bonuses: { mana: 15, intellect: 5 },
    purchased: false,
    equipped: false
  },
  {
    id: 'plate_mail_b',
    name: 'B급 하프 마석 기사 갑주',
    description: '고급 티타늄 and 마력을 중화시키는 충중 플레이트. 치명적인 즉사 위험으로부터 인체를 보호한다.',
    price: 45000,
    slot: 'armor',
    bonuses: { strength: 15 },
    hpModifier: { head: 40, torso: 80, leftArm: 30, rightArm: 30 },
    purchased: false,
    equipped: false
  },
  {
    id: 's_class_katana',
    name: 'S급 시공 가속의 차원도',
    description: '시간과 공간의 경계를 미세하게 가르는 정체불명의 신검. 공격 시 민첩과 무력이 극한으로 융합된다.',
    price: 85000,
    slot: 'weapon',
    bonuses: { strength: 25, agility: 35, mana: 10 },
    purchased: false,
    equipped: false
  }
];
