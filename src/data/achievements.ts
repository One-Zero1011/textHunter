import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_death',
    title: '처절한 시작',
    description: '체격 0 이하로 무리한 전투에서 첫번째 사망(데드엔딩)을 목격했습니다.',
    unlocked: false,
    type: 'loop'
  },
  {
    id: 'loop_detective',
    title: '미복원 잔영의 분석가',
    description: '세계 전역의 인과 기밀 데이터를 6개 취합해 인과율 뒤틀림의 전말을 규명했습니다.',
    unlocked: false,
    type: 'loop'
  },
  {
    id: 's_class_bond',
    title: '서울의 생존자 연합',
    description: 'S급 동료 3명(백운혁, 금채란, 임소연)과 모두 깊은 유대를 형성해 참전을 확보했습니다.',
    unlocked: false,
    type: 'rapport'
  },
  {
    id: 'gold_star',
    title: '강남의 자산가 헌터',
    description: '알바와 사냥으로 100,000골드 이상을 축적하는 데 성공하였습니다.',
    unlocked: false,
    type: 'gold'
  },
  {
    id: 's_class_stat',
    title: '기적인가, 괴물인가',
    description: '임의의 능력치 스탯 1개를 100 이상 승급시킴으로써 참된 S급으로 성장했습니다.',
    unlocked: false,
    type: 'stat'
  },
  {
    id: 'pilgrim_of_loops',
    title: '시간선을 헤매는 순례자',
    description: '인과율의 혹독한 단절을 가뿐히 뛰어넘어 5회차 혹은 그 이상의 루프(회차)를 경유했습니다.',
    unlocked: false,
    type: 'loop'
  },
  {
    id: 'perfect_rapport',
    title: '영혼의 조율인 [극점]',
    description: 'S급 동료 중 한 명과 95% 호감도(완벽한 결속 주파수)를 형성하며 인연의 끝에 닿았습니다.',
    unlocked: false,
    type: 'rapport'
  },
  {
    id: 'combat_god',
    title: '무력의 초심 돌파',
    description: '스탯과 장비의 결합 수식에 의한 종합 전투력(CP) 500 이상을 기록하여 적들의 보루를 궤멸할 반진을 마주했습니다.',
    unlocked: false,
    type: 'combat'
  },
  {
    id: 'legendary_historian',
    title: '잊힌 세계의 대역사가',
    description: '차원 기밀 보고 파편을 12개 이상 동기화 수집 완료해 파종의 붕괴 구조를 완벽 무결히 가설 해독했습니다.',
    unlocked: false,
    type: 'loop'
  },
  {
    id: 'arsenal_master',
    title: '최종 결전의 완전 기획',
    description: '지맥 탐사 및 연성으로 획득한 특수 무기 및 방어구 장비를 인벤토리에 6개 이상 온전히 구비했습니다.',
    unlocked: false,
    type: 'combat'
  }
];
