/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Title {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  badgeColor: string; // Tailwinds classes for badge
  textColor: string;
  bonuses: {
    strength?: number;
    agility?: number;
    health?: number;
    intellect?: number;
  };
}

export const TITLES: Title[] = [
  {
    id: 'first_death',
    achievementId: 'first_death',
    name: '💀 무경계 탈출자 (Death Defier)',
    description: '사망의 절대적 공포를 한 차례 무사히 직면하여 뛰어넘은 시공 주례자.',
    badgeColor: 'bg-zinc-950/85 border-zinc-700 hover:border-zinc-500 text-zinc-300',
    textColor: 'text-zinc-600',
    bonuses: { agility: 5, intellect: 5 }
  },
  {
    id: 'loop_detective',
    achievementId: 'loop_detective',
    name: '🔍 비밀 규명 분석관 (Riddle Decoder)',
    description: '서울 중심의 마력 왜곡 커널과 회차 뒤틀림 보안 코드를 직접 판독한 정보원.',
    badgeColor: 'bg-indigo-950/60 border-indigo-900/50 hover:border-indigo-600 text-indigo-400',
    textColor: 'text-indigo-400',
    bonuses: { intellect: 12 }
  },
  {
    id: 's_class_bond',
    achievementId: 's_class_bond',
    name: '⭐ 동료 유대의 공명축 (Alley Resonance)',
    description: 'S급 전사 백운혁, 에스퍼 금채란, 기록자 임소연과의 영혼 융합 동조율 성립관.',
    badgeColor: 'bg-amber-950/60 border-amber-900/50 hover:border-amber-600 text-amber-400',
    textColor: 'text-amber-400',
    bonuses: { strength: 10, health: 10 }
  },
  {
    id: 'gold_star',
    achievementId: 'gold_star',
    name: '💰 강남 빌딩의 황금 헌터 (Gold Master)',
    description: '알바와 광석 섭취로 10만 골드를 돌파하여 황금 마력을 손끝에 구현한 자산가.',
    badgeColor: 'bg-yellow-950/60 border-yellow-905/50 hover:border-yellow-600 text-yellow-500',
    textColor: 'text-yellow-500',
    bonuses: { health: 15 }
  },
  {
    id: 's_class_stat',
    achievementId: 's_class_stat',
    name: '🧬 인간 규격 돌파종 (Limit Breaker)',
    description: '임의의 기맥 수치를 100 이상 승급시켜 스스로 온전한 기적적 진화를 완수한 초월체.',
    badgeColor: 'bg-rose-955/60 border-rose-900/50 hover:border-rose-600 text-rose-400',
    textColor: 'text-rose-400',
    bonuses: { strength: 15, agility: 15 }
  },
  {
    id: 'pilgrim_of_loops',
    achievementId: 'pilgrim_of_loops',
    name: '⏳ 시계바늘의 주관자 (Chrono Architect)',
    description: '5회 이상의 죽음과 회귀를 뚫어내 시간 선의 중력을 초연하게 버텨낸 자.',
    badgeColor: 'bg-teal-950/60 border-teal-900/50 hover:border-teal-600 text-teal-400',
    textColor: 'text-teal-400',
    bonuses: { intellect: 20 }
  },
  {
    id: 'perfect_rapport',
    achievementId: 'perfect_rapport',
    name: '💖 완벽한 인연의 극의 (Soul Resonance)',
    description: '특정 S급 동반자와 주파수 오차범위 1% 미만의 절대 유대감을 달성한 존재.',
    badgeColor: 'bg-pink-950/60 border-pink-900/50 hover:border-pink-600 text-pink-400',
    textColor: 'text-pink-400',
    bonuses: { health: 25 }
  },
  {
    id: 'combat_god',
    achievementId: 'combat_god',
    name: '⚔️ 소멸 궤적의 패화 (Lord of War)',
    description: '종합 전투 CP 점수 500을 마침내 정복하여 전장에 혈흔의 기적을 뿌리는 살육의 검귀.',
    badgeColor: 'bg-red-955/60 border-red-950/50 hover:border-red-600 text-red-400',
    textColor: 'text-red-400',
    bonuses: { strength: 20, agility: 20 }
  },
  {
    id: 'legendary_historian',
    achievementId: 'legendary_historian',
    name: '📖 세계 선의 최후 기록가 (Archivist)',
    description: '12회 이상의 인과 기억을 겹쳐 서울의 대멸망 전조와 승리의 방조를 마침내 복제해낸 현자.',
    badgeColor: 'bg-emerald-950/60 border-emerald-900/50 hover:border-emerald-600 text-emerald-400',
    textColor: 'text-emerald-400',
    bonuses: { intellect: 30 }
  },
  {
    id: 'arsenal_master',
    achievementId: 'arsenal_master',
    name: '🛡️ 무기고의 성배 소유주 (Arsenal Sovereign)',
    description: '전장의 성물 등급 장비와 마석을 6개 이상 인벤토리에 지배적으로 수납한 총괄 장교.',
    badgeColor: 'bg-sky-950/60 border-sky-900/50 hover:border-sky-600 text-sky-450',
    textColor: 'text-sky-450',
    bonuses: { strength: 25, agility: 10 }
  }
];
