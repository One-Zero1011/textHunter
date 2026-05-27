import { CharacterStats } from '../../types';

export interface JobActivity {
  id: string;
  name: string;
  description: string;
  fatigueCost: number;
  maxFatigueLimit: number;
  calculateRewardPreview: (stats: CharacterStats) => string;
  calculateGoldReward: (stats: CharacterStats) => number;
  messageFormula: (pay: number) => string;
}

export const JOB_ACTIVITIES: JobActivity[] = [
  {
    id: 'part_time_cash',
    name: '💰 여의도 길드 보급 자재 강박 하차',
    description: 'costs 25 Fatigue. awards high physical-scaled cash compensation',
    fatigueCost: 25,
    maxFatigueLimit: 75,
    calculateRewardPreview: (stats: CharacterStats) => {
      const pay = 15000 + (stats.strength * 100) + (stats.agility * 80);
      return `+${pay.toLocaleString()}G`;
    },
    calculateGoldReward: (stats: CharacterStats) => {
      return 15000 + (stats.strength * 100) + (stats.agility * 80);
    },
    messageFormula: (pay: number) => `💰 건대입구 편의점에서 야간 대타 및 전입 헌터 보급품 분류 박스 나르기 알바를 교대했습니다. +${pay.toLocaleString()}G 소지금을 벌었습니다! (+25 피로도)`
  }
];
