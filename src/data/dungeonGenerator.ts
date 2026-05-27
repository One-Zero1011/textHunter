import { GridRoom, Dungeon } from '../types';

export interface ExtendedGridRoom extends Omit<GridRoom, 'x' | 'y'> {
  name: string;
  connections: string[]; // Adjacent connected room IDs (directional: from -> to)
  depth: number;         // Columns: 0 = start, 1 = entry paths, 2 = mid-tier, 3 = deep-tier, 4 = portal, 5 = boss
  row: number;           // Row index for neat SVG grid alignment (0 = top, 1 = mid, 2 = bottom)
  threatLevel: 'low' | 'medium' | 'high' | 'dead_end' | 'secure' | 'boss';
  description: string;
  lootQuality?: 'none' | 'normal' | 'rare' | 'legendary';
}

const DUNGEON_ROOM_NAMES = {
  combat: [
    '마수 전속 정찰초소', '그림자 워그 군락지', '폭주 균열 감염로', 
    '강철 갑옷 충천지대', '혈단 네크로 주술 광장', '타락 각성자 시그널 구역'
  ],
  chest: [
    '버려진 임시 길드 보급함', '시공 수축 보석 제단', '마력 결정 은폐 창고',
    '과거 차원 벼락 전사 유품', '황금 균열 침전물'
  ],
  event: [
    '고대 마성 공명 비석', '붕괴 차원 왜곡 웅덩이', '정체불명의 백도어 코어',
    '정화 수풀 요양지', '영혼 기록 저장소'
  ],
  empty: [
    '고요한 암흑 수렁', '비틀어진 시공 회랑', '바스라진 마력 공동',
    '황량한 철책 대기초소'
  ]
};

function getRandomName(type: keyof typeof DUNGEON_ROOM_NAMES): string {
  const list = DUNGEON_ROOM_NAMES[type];
  if (!list) return '';
  return list[Math.floor(Math.random() * list.length)];
}

export function generateNonLinearDungeonMap(dungeon: Dungeon): ExtendedGridRoom[] {
  const rooms: ExtendedGridRoom[] = [];
  const rank = dungeon.rank;

  // 1. Depth 0: Start Room
  rooms.push({
    id: 'start',
    name: '🎯 게이트 입구 포탈',
    type: 'start',
    explored: true,
    clear: true,
    connections: ['branchA-1', 'branchB-1', 'deadend-1'],
    depth: 0,
    row: 1,
    threatLevel: 'secure',
    description: '던전에 안전하게 진입하였습니다. 시공 균열이 소용돌이치기 시작합니다.',
    lootQuality: 'none'
  });

  // 1.5 Dead End from Depth 0 (Accessible directly but leads to a dead end)
  rooms.push({
    id: 'deadend-1',
    name: `🚨 [막다른 길] 타락한 성물 안식처`,
    type: 'combat',
    explored: false,
    clear: false,
    connections: ['start'], // connects back to start ONLY. Backtrack needed!
    depth: 1,
    row: 0,
    threatLevel: 'dead_end',
    description: '길의 흔적이 사방의 결정으로 막힌 외딴 제단입니다. 강력한 시공 파수꾼이 가로막고 있어 도사린 위험 끝에 큰 전리품을 찾을 수 있습니다.',
    lootQuality: 'legendary'
  });

  // 2. Depth 1
  rooms.push({
    id: 'branchA-1',
    name: `⚔️ [통로 1] ${getRandomName('combat')}`,
    type: 'combat',
    explored: false,
    clear: false,
    connections: ['branchA-2'],
    depth: 1,
    row: 2,
    threatLevel: 'low',
    description: '던전 입구 왼편으로 분기하는 음침한 전령 정찰 통로입니다.',
    lootQuality: 'normal'
  });

  rooms.push({
    id: 'branchB-1',
    name: `📦 [통로 2] ${getRandomName('chest')}`,
    type: 'chest',
    explored: false,
    clear: false,
    connections: ['branchB-2'],
    depth: 1,
    row: 1,
    threatLevel: 'low',
    description: '안개 수렁 아래 보급 상자가 반짝이는 조용한 오솔길입니다.',
    lootQuality: 'normal'
  });

  // 3. Depth 2 (Mid tier)
  rooms.push({
    id: 'branchA-2',
    name: `🌿 [성소] ${getRandomName('event')}`,
    type: 'event',
    explored: false,
    clear: false,
    connections: ['branchA-3'],
    depth: 2,
    row: 2,
    threatLevel: 'secure',
    description: '오래전 멸망한 문명의 잔여 기맥이 서려 있는 아늑한 치유 의식 구역입니다.',
    lootQuality: 'none'
  });

  rooms.push({
    id: 'branchB-2',
    name: `⚔️ [전투] ${getRandomName('combat')}`,
    type: 'combat',
    explored: false,
    clear: false,
    connections: ['branchB-3', 'deadend-2'], // leads to deadend-2 OR advances
    depth: 2,
    row: 1,
    threatLevel: 'medium',
    description: '맹렬한 몬스터 파동 신호가 가득 들어찬 중앙 병참 구역입니다.',
    lootQuality: 'normal'
  });

  // Mid Dead End (Depth 3, row 0, connects back to Branch B-2)
  rooms.push({
    id: 'deadend-2',
    name: `🚨 [막다른 길] ${getRandomName('chest')} (심층 균열)`,
    type: 'chest',
    explored: false,
    clear: false,
    connections: ['branchB-2'], // Backtrack only!
    depth: 3,
    row: 0,
    threatLevel: 'dead_end',
    description: '불길한 에너지가 뿜어져 나오는 지리적 구덩이입니다. 고위험의 보물 궤짝이 기맥 아래 봉인되어 있습니다.',
    lootQuality: 'rare'
  });

  // 4. Depth 3 (Deep tier before portal)
  rooms.push({
    id: 'branchA-3',
    name: `⚔️ [전투] ${getRandomName('combat')}`,
    type: 'combat',
    explored: false,
    clear: false,
    connections: ['portal'], // merges to portal
    depth: 3,
    row: 2,
    threatLevel: 'high',
    description: '코어 핵으로 들어가기 위해선 S급 가시 철책 파수꾼 무리를 돌파해야 합니다.',
    lootQuality: 'rare'
  });

  rooms.push({
    id: 'branchB-3',
    name: `🔮 [비밀] ${getRandomName('event')}`,
    type: 'event',
    explored: false,
    clear: false,
    connections: ['portal'], // merges to portal
    depth: 3,
    row: 1,
    threatLevel: 'medium',
    description: '코어를 제어하는 기하학적 인과율 왜곡 구역입니다.',
    lootQuality: 'none'
  });

  // 5. Depth 4: Portal Room
  rooms.push({
    id: 'portal',
    name: `🌀 [심층 포탈 방] 게이트 심층 융합 제단`,
    type: 'empty',
    explored: false,
    clear: false,
    connections: ['boss'],
    depth: 4,
    row: 1,
    threatLevel: 'medium',
    description: '최종 보스 수수께끼가 봉인되어 있는 중심 마그마 정화 전열선입니다.',
    lootQuality: 'none'
  });

  // 6. Depth 5: Boss Room
  rooms.push({
    id: 'boss',
    name: `💀 [최종 보스 둥지] 게이트 붕괴 코어 핵`,
    type: 'boss',
    explored: false,
    clear: false,
    connections: [],
    depth: 5,
    row: 1,
    threatLevel: 'boss',
    description: '이 정화의 균열을 수호하는 차원 침공의 숙주, S급 오버시어가 거주하고 있습니다. 여기서 퇴각은 불가능합니다.',
    lootQuality: 'legendary'
  });

  return rooms;
}
