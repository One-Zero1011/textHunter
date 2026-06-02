/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'summon' | 'magic' | 'hunter';
  cooldown: number; // 재사용 대기 시간 (턴)
  powerMultiplier: number; // 스탯 비례 가중치
  effectText: string; // 스킬 사용 시 나타날 화려한 시각화/묘사 텍스트
}

export const SKILLS: Skill[] = [
  // 소환 계열 (Summon)
  {
    id: 'skill_summon_shadow',
    name: '[소환] 그림자 파수병 소환',
    description: 'F급 그림자 군사를 전방에 소환합니다. (매 턴 고정 18의 화력 가해 효과 및 몸통 타격 보호 위임 가능)',
    type: 'summon',
    cooldown: 3,
    powerMultiplier: 1.0,
    effectText: '👤 차가운 차원 균열에서 검게 불타는 [그림자 파수병]을 연성 소환하여 주위 공격의 합세를 격하게 도모했습니다!'
  },
  {
    id: 'skill_summon_golem',
    name: '[소환] 대지 마기 암석골렘',
    description: '육중한 암석 장벽 골렘을 구축 결집합니다. (전 우호 부위 HP 15 즉각 치유 필터링 및 2턴 동안 적 공격 장벽 가동)',
    type: 'summon',
    cooldown: 4,
    powerMultiplier: 1.2,
    effectText: '🪨 쿠쿠쿵! 대지의 비열 노선을 흔드는 거대 [마기 암석골렘]이 일어나, 전신의 연약한 사지 충격을 가벽으로 차단합니다.'
  },
  {
    id: 'skill_summon_dragon',
    name: '[소환] 화염룡 파면 살라맨더',
    description: 'A급 고열 정령룡 살라맨더의 영혼을 현성합니다. (매 턴 32 전격 마법 데미지를 지속적 적군 지점에 폭사)',
    type: 'summon',
    cooldown: 5,
    powerMultiplier: 1.8,
    effectText: '🐉 크오오오! 공포 가중 공간에서 태어난 불아기룡 [살라맨더]가 화려한 불꽃 날개를 펼치며 고온의 초열 파편을 내뿜습니다!'
  },

  // 마법 계열 (Magic)
  {
    id: 'skill_magic_fire',
    name: '[마법] 마능 주입 파이어볼',
    description: '손아귀에 마력을 극한 결집하여 적에게 격렬 화염을 투척합니다. (지력 비례 다이렉트 마법 데미지)',
    type: 'magic',
    cooldown: 2,
    powerMultiplier: 1.7,
    effectText: '🔥 손끝에서 맹렬히 회오리치는 구형 화염구가 기하 마력의 팽창을 일으켜 적의 상반신을 난폭하게 폭사시켰습니다!'
  },
  {
    id: 'skill_magic_thunder',
    name: '[마법] 우레 낙인 라이트닝 버스터',
    description: '균열 사이 흐르는 전류를 한데 모아 대치점에 주입 방사합니다. (지력 및 민첩 비례 고배율 고압 관통 격타)',
    type: 'magic',
    cooldown: 3,
    powerMultiplier: 2.3,
    effectText: '⚡ 번쩍! 뇌성벽력의 보랏빛 전격 폭풍이 폭주하며 차원의 틈새로부터 적의 핵 심장부를 정확히 일광 소멸시켜 갑니다!'
  },
  {
    id: 'skill_magic_restoration',
    name: '[마법] 고품격 전신 정화 회복술',
    description: '백마도의 복원 수식을 역산 조율하여 모든 상해 부위를 교정합니다. (지력 비례 전신 HP 대폭 회복 완료)',
    type: 'magic',
    cooldown: 4,
    powerMultiplier: 2.0,
    effectText: '🌿 푸른 생기의 궤적이 전신을 감쌉니다! 가위눌리던 사지와 피 흘리는 머리, 몸통 내부가 즉각적으로 봉합 연마됩니다!'
  },

  // 일반 헌터물 계열 (Hunter)
  {
    id: 'skill_hunter_dash',
    name: '[헌터] 수습 보행 파열 자돌격',
    description: '전방에 보이지 않는 속기로 발을 굴러 맹추력 찌르기를 감행합니다. (근력 비례 기본 물리 가중격)',
    type: 'hunter',
    cooldown: 1,
    powerMultiplier: 1.4,
    effectText: '🗡️ 슈우욱! 대기를 두 조각으로 가르는 신속의 대시 런지 찌르기가 단검의 각도를 극한으로 날카롭게 꺾어 놓았습니다!'
  },
  {
    id: 'skill_hunter_shield',
    name: '[헌터] 백은 성광 강습 격벽',
    description: '오라를 신체 가문에 장악해 방패의 보벽을 시너지화합니다. (근력 비례 적 타격 피해 및 방호벽 전개)',
    type: 'hunter',
    cooldown: 3,
    powerMultiplier: 1.5,
    effectText: '🛡️ 흡! 온몸의 연성을 활성화해 철강보다 질긴 보라 마력벽을 다지며 돌개 바람처럼 전방을 밀어 타격했습니다!'
  },
  {
    id: 'skill_hunter_execution',
    name: '[헌터] 공간 붕괴 삼극 차원참',
    description: '시공간의 폭풍 좌표를 베어가르는 전설적 삼중 차원 살상 공격. (근력 및 민첩 가산 초강력 필살 베기)',
    type: 'hunter',
    cooldown: 4,
    powerMultiplier: 4.5,
    effectText: '⚔️ 잔상조차 남기지 못하는 극한의 사선 도가니가 평행 우주 세 단면을 복사! 붉은색 검압이 세 번 적을 무자비하게 난도질합니다!'
  }
];

export const SKILL_BOOK_MAPPING: Record<string, string> = {
  book_summon_shadow: 'skill_summon_shadow',
  book_summon_golem: 'skill_summon_golem',
  book_summon_dragon: 'skill_summon_dragon',
  book_magic_fire: 'skill_magic_fire',
  book_magic_thunder: 'skill_magic_thunder',
  book_magic_restoration: 'skill_magic_restoration',
  book_hunter_dash: 'skill_hunter_dash',
  book_hunter_shield: 'skill_hunter_shield',
  book_hunter_execution: 'skill_hunter_execution'
};
