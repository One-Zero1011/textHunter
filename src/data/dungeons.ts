import { Dungeon } from '../types';

export const DUNGEONS: Dungeon[] = [
  {
    id: 'gate_f',
    name: 'F급 강남역 지하철 균열',
    rank: 'F급',
    recommendedPower: 10,
    entryChance: 100,
    fatigueCost: 15,
    rewards: {
      gold: 3000,
      items: ['슬라임의 잔해', '녹슨 마정석']
    },
    gridSize: 3
  },
  {
    id: 'gate_e',
    name: 'E급 종로 가구거리 유치원',
    rank: 'E급',
    recommendedPower: 25,
    entryChance: 90,
    fatigueCost: 20,
    rewards: {
      gold: 6500,
      items: ['고블린 가죽 귀걸이', '마력이 깃든 은목걸이']
    },
    gridSize: 4
  },
  {
    id: 'gate_d',
    name: 'D급 여의도 국회의사당 지하 벙커',
    rank: 'D급',
    recommendedPower: 50,
    entryChance: 75,
    fatigueCost: 25,
    rewards: {
      gold: 12000,
      items: ['낡은 차원 인과 파편', '오크 투사의 벨트']
    },
    gridSize: 4
  },
  {
    id: 'gate_c',
    name: 'C급 남산타워 중립 마석지대',
    rank: 'C급',
    recommendedPower: 90,
    entryChance: 60,
    fatigueCost: 30,
    rewards: {
      gold: 24000,
      items: ['불타는 마력 핵', '임소연을 위한 기록 서적']
    },
    gridSize: 5
  },
  {
    id: 'gate_b',
    name: 'B급 인천국제공항 붉은 활주로',
    rank: 'B급',
    recommendedPower: 150,
    entryChance: 45,
    fatigueCost: 35,
    rewards: {
      gold: 48000,
      items: ['시공의 톱니바퀴', '거울의 금간 유물']
    },
    gridSize: 5
  },
  {
    id: 'gate_a',
    name: 'A급 청와대 지하신전 터널',
    rank: 'A급',
    recommendedPower: 220,
    entryChance: 30,
    fatigueCost: 40,
    rewards: {
      gold: 75000,
      items: ['고대의 실패 기록 뭉치', '인과율 조율의 열쇠']
    },
    gridSize: 6
  },
  {
    id: 'gate_s',
    name: 'S급 서울 상공 시공의 대폭사 게이트',
    rank: 'S급',
    recommendedPower: 300,
    entryChance: 15,
    fatigueCost: 50,
    rewards: {
      gold: 150000,
      items: ['진공의 마력 결정체']
    },
    gridSize: 6
  }
];

// 서울 시내 노른자 구역 설정
const SEOUL_REGIONS = [
  '강남역 지하가 가구거리',
  '홍대 삼거리 클럽 이면',
  '신촌 전철 교각 밑',
  '여의도 한강 수변 주차장',
  '압구정 로데오 명품 골목',
  '잠실 롯데월드타워 꼭대기',
  '명동 밀리오레 빌딩 공터',
  '구로 대규모 디지털단지 공장숲',
  '성수동 카페 개폐식 지하소',
  '뚝섬 선착장 침수 정거장',
  '대치동 고밀 학원가 어둠 지하',
  '용산전자상가 만물창고',
  '북한산 백운대 바위 절벽',
  '대학로 소극장 무대 지하 수로'
];

// 헌터 판타지 소설 풍 위험 기운 묘사
const ANOMALY_MODIFIERS = [
  '위험 수치 초과 폭주',
  '독무가 가득 들어찬 고독의',
  '비틀린 시공 마력 수치 왜곡',
  '하급 독마수 소생 번식',
  '고대 전사의 사념이 각성한',
  '차원 가시 장막의 붕괴성',
  '황량한 강철 병사 소생',
  '소리 없이 잠식된 인과 파편의',
  '불빛이 차단된 무한의 기동',
  '마왕군 대리 전령의 주술제단',
  '잊혀진 길드의 폐물 정화',
  '시공 슬라임 진액 오염'
];

// 최종 아키텍처 형태
const PORTAL_TYPES = [
  '특이점 균열',
  '그림자 대공동',
  '지하 방공호',
  '침전식 벙커',
  '인과 왜곡지 아지트',
  '심연 요새 잔해',
  '마수 정찰 둥지',
  '각성 감옥 구역',
  '기맥 실험실',
  '비밀 회랑 터'
];

export function generateRandomDungeon(rank: string, id: string): Dungeon {
  const region = SEOUL_REGIONS[Math.floor(Math.random() * SEOUL_REGIONS.length)];
  const modifier = ANOMALY_MODIFIERS[Math.floor(Math.random() * ANOMALY_MODIFIERS.length)];
  const type = PORTAL_TYPES[Math.floor(Math.random() * PORTAL_TYPES.length)];
  const name = `${rank} ${region} (${modifier} ${type})`;

  let recommendedPower = 10;
  let fatigueCost = 15;
  let gold = 3000;
  let items: string[] = [];
  let gridSize = 3;

  switch (rank) {
    case 'F급':
      recommendedPower = Math.floor(Math.random() * 8) + 8; // 8 ~ 15
      fatigueCost = 15;
      gold = Math.floor(Math.random() * 1500) + 2500; // 2500 ~ 4000
      items = ['슬라임의 잔해', '녹슨 마정석', '구깃한 만원 지폐'];
      gridSize = 3;
      break;
    case 'E급':
      recommendedPower = Math.floor(Math.random() * 11) + 20; // 20 ~ 30
      fatigueCost = 20;
      gold = Math.floor(Math.random() * 2500) + 5500; // 5500 ~ 8000
      items = ['고블린 가죽 귀걸이', '마력이 깃든 은목걸이', '소형 상회 회복액'];
      gridSize = 4;
      break;
    case 'D급':
      recommendedPower = Math.floor(Math.random() * 16) + 45; // 45 ~ 60
      fatigueCost = 25;
      gold = Math.floor(Math.random() * 4000) + 10000; // 10000 ~ 14000
      items = ['낡은 차원 인과 파편', '오크 투사의 벨트', 'D급 에너지 원석'];
      gridSize = 4;
      break;
    case 'C급':
      recommendedPower = Math.floor(Math.random() * 21) + 80; // 80 ~ 100
      fatigueCost = 30;
      gold = Math.floor(Math.random() * 8000) + 20000; // 20000 ~ 28000
      items = ['불타는 마력 핵', '지후를 위한 임소연의 오래된 기록 서적', '중급 연금 촉매'];
      gridSize = 5;
      break;
    case 'B급':
      recommendedPower = Math.floor(Math.random() * 31) + 140; // 140 ~ 170
      fatigueCost = 35;
      gold = Math.floor(Math.random() * 15000) + 40000; // 40000 ~ 55000
      items = ['시공의 톱니바퀴', '거울의 금간 유물', 'B급 고위 기사 단검'];
      gridSize = 5;
      break;
    case 'A급':
      recommendedPower = Math.floor(Math.random() * 31) + 210; // 210 ~ 240
      fatigueCost = 40;
      gold = Math.floor(Math.random() * 15000) + 70000; // 70000 ~ 85000
      items = ['고대의 실패 기록 뭉치', '인과율 조율의 열쇠', 'A급 조율석 파편'];
      gridSize = 6;
      break;
    case 'S급':
      recommendedPower = Math.floor(Math.random() * 41) + 280; // 280 ~ 320
      fatigueCost = 50;
      gold = Math.floor(Math.random() * 30000) + 130000; // 130000 ~ 160000
      items = ['진공의 마력 결정체', '부서진 차원의 인과 통로', 'S급 엘릭서 고농축액'];
      gridSize = 6;
      break;
  }

  return {
    id,
    name,
    rank,
    recommendedPower,
    entryChance: 100,
    fatigueCost,
    rewards: {
      gold,
      items
    },
    gridSize,
    daysLeft: Math.floor(Math.random() * 3) + 1 // 1 ~ 3일 랜덤 유지 기간
  };
}

export function generateRandomDungeonsList(count: number, dDay: number = 60): Dungeon[] {
  const list: Dungeon[] = [];
  const ranks = ['F급', 'E급', 'D급', 'C급', 'B급', 'A급', 'S급'];
  
  // Calculate urgency based on 60 - dDay (ranges from 0 to 60)
  const urgency = Math.max(0, Math.min(60, 60 - dDay));
  const ratio = urgency / 60; // 0.0 to 1.0

  // As d-day approaches 0, higher rank dungeons spawn much more frequently
  const baseWeights = [0.40, 0.25, 0.15, 0.10, 0.06, 0.03, 0.01];
  const endWeights = [0.05, 0.10, 0.15, 0.20, 0.25, 0.15, 0.10];
  
  const weights = baseWeights.map((w, idx) => {
    return w * (1 - ratio) + endWeights[idx] * ratio;
  });
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let selectedRank = 'F급';
    let cumulative = 0;
    for (let j = 0; j < ranks.length; j++) {
      cumulative += normalizedWeights[j];
      if (r <= cumulative) {
        selectedRank = ranks[j];
        break;
      }
    }
    const safeId = `gen_gate_${Date.now()}_${i}_${Math.floor(Math.random() * 10000)}`;
    list.push(generateRandomDungeon(selectedRank, safeId));
  }
  return list;
}
