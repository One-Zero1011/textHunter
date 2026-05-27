import { CharacterStats } from '../../types';

export interface TrainingActivity {
  id: string;
  name: string;
  description: string;
  rewardPreview: string;
  fatigueCost: number;
  maxFatigueLimit: number;
  statBonus: Partial<CharacterStats>;
  message: string;
}

export const TRAINING_ACTIVITIES: TrainingActivity[] = [
  {
    id: 'train_strength',
    name: '💪 피지컬 중량 강화 (근력 증가)',
    description: 'costs 15 Fatigue. increases Strength core stats',
    rewardPreview: '+4 STR',
    fatigueCost: 15,
    maxFatigueLimit: 85,
    statBonus: { strength: 4 },
    message: '🏋️ 강남 피트니스 덤벨 수련을 완수했습니다. 근육 섬유가 융합되며 근력 스탯이 +4 크게 증가했습니다! (+15 피로도)'
  },
  {
    id: 'train_agility',
    name: '🏃 하체 순발 동체시력 (민첩 증가)',
    description: 'costs 15 Fatigue. increases Agility reflexes',
    rewardPreview: '+4 AGI',
    fatigueCost: 15,
    maxFatigueLimit: 85,
    statBonus: { agility: 4 },
    message: '🏃 육상 스피돔 트랙 왕복 전속 질주를 달성했습니다. 하체 순발력과 반사 수치가 발달해 민첩 스탯이 +4 상승했습니다! (+15 피로도)'
  },
  {
    id: 'train_mana',
    name: '🔥 기온 마정 호흡 조율 (마력 증가)',
    description: 'costs 15 Fatigue. increases Mana potential',
    rewardPreview: '+4 MAN',
    fatigueCost: 15,
    maxFatigueLimit: 85,
    statBonus: { mana: 4 },
    message: '🔥 가상의 마석 유도 단상에서 선을 가해 호흡 제어를 시도했습니다. 심장 속 마정석이 융화되며 마력 스탯이 +4 상승했습니다! (+15 피로도)'
  },
  {
    id: 'train_intellect',
    name: '📖 마석 파동 인자 분석 (지력 증가)',
    description: 'costs 15 Fatigue. increases Intellect data analyzes',
    rewardPreview: '+4 INT',
    fatigueCost: 15,
    maxFatigueLimit: 85,
    statBonus: { intellect: 4 },
    message: '📖 국립 각성자 백과 도서 전서를 정독하고 한계 연령 고문서 수식을 연구했습니다. 지력 스탯이 +4 조율되었습니다! (+15 피로도)'
  }
];
