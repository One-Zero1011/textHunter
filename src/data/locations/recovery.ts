export interface RecoveryActivity {
  id: string;
  name: string;
  description: string;
  rewardPreview: string;
  fatigueReduction: number;
  message: string;
}

export const RECOVERY_ACTIVITIES: RecoveryActivity[] = [
  {
    id: 'rest_capsule',
    name: '🌿 특수 멸균 산소 치유 캡슐 수면',
    description: 'Clears all body-part HP damage immediately. Depletes fatigue',
    rewardPreview: '-45 Fatigue',
    fatigueReduction: 45,
    message: '🌿 서울역 수면 레스트 캠프에서 쾌적하게 캡슐 산소 요양을 거쳤습니다. 피로도가 -45 크게 회복되었으며 모든 상처 부위가 100% 온전히 치유되었습니다!'
  }
];
