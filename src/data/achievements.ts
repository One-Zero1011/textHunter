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
    description: '세계 전역의 인과 기밀 데이터를 6개 모두 취합해 인과율 뒤틀림의 전말을 규명했습니다.',
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
  }
];
