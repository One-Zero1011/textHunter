/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage } from '../types';

export interface ChatStoryChoice {
  id: string;
  text: string;
  reply: string;
  rapportChange: number;
}

export interface ChatStory {
  id: string;
  npcId: string;
  minRapport: number;
  minRecords: number;
  npcMessages: string[];
  choices: ChatStoryChoice[];
}

export const CHAT_STORIES: ChatStory[] = [
  // ==================== BAEK EUN-HYEOK STORIES ====================
  {
    id: 'baek_story_1',
    npcId: 'baek',
    minRapport: 0,
    minRecords: 0,
    npcMessages: [
      "어이, 신입. 이번 지맥 균열 조사대에서도 끈질기게 살아남았나?",
      "허약한 F급 치고는 제법 운이 좋군."
    ],
    choices: [
      {
        id: 'baek_1_a',
        text: "{playerName} 선배님 덕분입니다. 앞으로도 헌팅 지도 잘 부탁드립니다!",
        reply: "흥, 가치 없는 아부는 필요 없다. 살아남은 건 오직 네 훈련 축적의 성과일 뿐이다. 게으름 피우지 말고 웨이트장에 매진해라.",
        rapportChange: 8
      },
      {
        id: 'baek_1_b',
        text: "더 이상 F급이라고 비웃지 못할 만큼 증명해 보이겠습니다.",
        reply: "호오... 허세치고는 눈빛에 군더더기가 없군. 그 기세로 덤벨이라도 하나 더 들고 가라. 쓸데없이 실망시키지 말고.",
        rapportChange: 12
      }
    ]
  },
  {
    id: 'baek_story_2',
    npcId: 'baek',
    minRapport: 30,
    minRecords: 1,
    npcMessages: [
      "네가 도서관 구석의 그 음침한 특수 연산관이랑 어울려 다니며 국가 지정 기밀 파일들을 회수하고 소지한다는 첩보를 입수했다.",
      "지나치게 깊이 파고들진 마라. 그 일은 내전부에서도 골머리를 썩이는 일이니까."
    ],
    choices: [
      {
        id: 'baek_2_a',
        text: "세상의 파종 멸망을 막으려면 국가 보안 기맥 해독이 필연적입니다.",
        reply: "...어린 녀석이 짊어진 말의 무게가 비장하군. 하지만 대의를 지키다 허무히 개죽음당하는 자들을 나는 너무 많이 봐왔다. 무슨 일이 있다면... 내 방패 뒤로 도망쳐라.",
        rapportChange: 15
      },
      {
        id: 'baek_2_b',
        text: "단순한 수집 취미일 뿐이니 걱정하실 필요 없습니다.",
        reply: "수집 취미라기엔 네 영혼 주파수가 균열 좌표와 무섭도록 공명하고 있지. 거짓을 발고해도 좋다. 다만... 위험하다 싶으면 주저 없이 내 힘을 조율 요청해라.",
        rapportChange: 10
      }
    ]
  },
  {
    id: 'baek_story_3',
    npcId: 'baek',
    minRapport: 55,
    minRecords: 3,
    npcMessages: [
      "요즘 딸내미인 서아가 스케치북에 웬 낯선 낙서를 해두었더군.",
      "유심히 물었더니... 'F급 삼촌이 다치지 않고 무사히 집으로 돌려보내 주는 마법 수식'이라 하더군. 쓸데없이 각인되었어."
    ],
    choices: [
      {
        id: 'baek_3_a',
        text: "서아와 소중한 이들의 일상이 파종의 종말로 꺼지지 않도록, 반드시 이 연역된 루프를 끊어내겠습니다.",
        reply: "...루프? 하, 이해하기 어색한 단어로군. 하지만 눈앞에서 자식이 오열하고 온 인류의 장막이 무너져 내리는 일은 더 이상 없다. 서아와 네가 약속한 기적이 있다면... 내 모든 장검과 육신을 너의 방패로 기꺼이 조율해 주마.",
        rapportChange: 22
      },
      {
        id: 'baek_3_b',
        text: "서아가 훈련소 인근에서 가장 예쁜 꽃인형을 갖고 싶다고 했었어요. 제가 이번에 사 가겠습니다.",
        reply: "쯧... 쓸쓸한 전장의 화약 냄새만 풍기는 아비 곁보단 네가 꼼꼼히 챙겨주는 조율이 한결 따스한 모양이로군. 고맙다. 다음엔 훈련 식도락이라도 같이 합세하지.",
        rapportChange: 15
      }
    ]
  },

  // ==================== GEUM CHAE-RAN STORIES ====================
  {
    id: 'geum_story_1',
    npcId: 'geum',
    minRapport: 0,
    minRecords: 0,
    npcMessages: [
      "야! 너 살아는 있는 거야?!",
      "아저씨 같은 허당 F급이 내 완벽한 원소 결계 방벽도 없이 던전에 마구 진입하다니 엄청 정신 나간 거 아니야?!"
    ],
    choices: [
      {
        id: 'geum_1_a',
        text: "채란 양의 난공불락 원소 장벽이 시급하긴 했어.",
        reply: "거봐! 역시 이 위대한 천재 금채란의 마법 보호막이 없으면 1분도 안전 수복이 안 된다니까! 에헴! 내 마력 동조율을 고맙게 생각하라고!",
        rapportChange: 12
      },
      {
        id: 'geum_1_b',
        text: "그래도 나름대로 혼자서 균열 좌표를 공략할 힘이 생겼는걸.",
        reply: "띨띨아! 그게 다 미세 조율이야! 내가 아저씨 뒤에서 몰래 보조 방벽 회선을 쏴주지 않았으면 진작 몬스터 소석용 먹잇감이었단 말씀!",
        rapportChange: 8
      }
    ]
  },
  {
    id: 'geum_story_2',
    npcId: 'geum',
    minRapport: 30,
    minRecords: 1,
    npcMessages: [
      "저기 말이야... 다음 훈련 주간에 올 때 길드 앞 수제 제과점에서 '마카롱 피스타치오 더블 초코맛'으로 한 상자 예약 포장하는 거 잊지 마!",
      "늦으면 훈련 공명 협조 안 해줄 줄 알아!"
    ],
    choices: [
      {
        id: 'geum_2_a',
        text: "알았어. 제일 달콤하고 최고급 재료로 특별 엄선해서 갈게.",
        reply: "와앗!! 진짜 진짜 약속한 거다?! 헤헤, 역시 아저씨 말귀는 엄청 빠르다니까! 맛있게 충전하면 내가 던전 내부 파편 몬스터들 싹 다 불태워 버릴게!",
        rapportChange: 15
      },
      {
        id: 'geum_2_b',
        text: "알바 단가가 너무 낮아서 고급 마카롱은 조금 지출 타격이 큰데...",
        reply: "치이... 짠돌이 아저씨! 알았어, 내 S급 길드 급여 정산 보조금 구좌에서 추가 지원 한전금을 이체해 줄 테니까 그러니까 꼭 사 와야 돼?!",
        rapportChange: 10
      }
    ]
  },
  {
    id: 'geum_story_3',
    npcId: 'geum',
    minRapport: 55,
    minRecords: 3,
    npcMessages: [
      "아저씨... 가끔 밤마다 엄청 기분 지저분한 악몽을 꿔.",
      "우리가 연신 붉은 게이트 내부에서 산산조각 나 쓰러지는 꿈... 그리고 아저씨가 잔뜩 피를 흘리면서 통곡 속으로 사라지는 꿈... 진짜 기분 나빠..."
    ],
    choices: [
      {
        id: 'geum_3_a',
        text: "그건 그냥 불필요한 악몽일 뿐이야. 이번 차원에서는 내가 내 목숨을 다해서라도 너를 지킬 거니까.",
        reply: "바, 바보 아저씨... 평소엔 대단하지도 않으면서 왜 그렇게 갑자기 믿음직한 눈빛으로 말하는 건데... 얼굴 터질 것 같잖아... 두고 봐, 내 전 원소 방벽을 오직 아저씨 좌표에만 몰빵할 거니까!",
        rapportChange: 20
      },
      {
        id: 'geum_3_b',
        text: "시간 분석 결과, 일정한 시공 요동 간섭의 잔재인 것 같아. 걱정하지 마, 바꿀 수 있어.",
        reply: "응... 도서관 소연 언니도 자꾸 복잡한 고문서 나침반을 보면서 정밀 연산 중이더라고. 나도 약하게 굴지 않고 완벽한 수비를 전개할게!",
        rapportChange: 12
      }
    ]
  },

  // ==================== LIM SO-YEON STORIES ====================
  {
    id: 'lim_story_1',
    npcId: 'lim',
    minRapport: 0,
    minRecords: 0,
    npcMessages: [
      "저... {playerName} 님. 혹시...",
      "시공간의 무작위 변동 오차 파동 속에서 기이한 영혼의 가중력... 그러니까, '이미 겪어본 과거의 기시감(데자뷔)' 같은 인자를 지각하고 계신 지요? 제 특수 조율 유도 나침반 수치가 폭주하고 있습니다..."
    ],
    choices: [
      {
        id: 'lim_1_a',
        text: "맞습니다. 저는 이미 수십 번 죽고 되감기는 파국 속에서 좌표를 조향하고 있습니다.",
        reply: "아...! 역시 제 수학적 추계와 복합 도조 연산이 완전무결을 증명했군요. {playerName} 님이 바로 이 타임라인 인과 붕괴의 유일무이한 시간 동기화 조율 축이십니다...! 시공 분석 연구를 제게도 제휴해 주십시오.",
        rapportChange: 15
      },
      {
        id: 'lim_1_b',
        text: "음, 단순한 과로나 각성 후유증으로 몸의 평형 감각이 약간 변조된 것 아닐까요?",
        reply: "음... 일개 생체 후유증으로 보기엔 {playerName}  님의 기맥 왜곡 상수가 상식적인 F급 평균 분포 그래프의 오차 범위를 완전히 일탈하여 고도로 동기화되고 있습니다. 부디 던전 내부 생존을 최선으로 수호해 주세요...",
        rapportChange: 8
      }
    ]
  },
  {
    id: 'lim_story_2',
    npcId: 'lim',
    minRapport: 30,
    minRecords: 1,
    npcMessages: [
      "복원한 국가 지정 유물 대변인 단검 분석 결과가 금일 산출되었습니다...",
      "충격적이게도 유물이 파묻혀 있던 토양과 시간 흐름 변수가... 우리가 아직 인지하지 않은 3년 앞으로 가리키고 있습니다. {playerName} 님, 당신의 이름은 대체..."
    ],
    choices: [
      {
        id: 'lim_2_a',
        text: "진리를 마주하셨군요. 이 반복되는 지옥의 엔딩 규칙을 정정하기 위해 저와 연산해 주십시오.",
        reply: "수억 번의 연산 뒤에 가려졌던 평행 역전식의 비밀... {playerName} 님이 그 모진 수십 번의 세계 시련 속에서 홀로 고독과 죽음을 수리해 오셨다니, 가슴이 아려옵니다... 제 특수 서적 지혜를 풀 가동해 공학 연산의 도우미가 되겠습니다!",
        rapportChange: 18
      },
      {
        id: 'lim_2_b',
        text: "조사된 시간축이 단순 일탈 왜곡에 의해 고장 난 수치는 아닐까요?",
        reply: "아뇨, 제 계측 모듈 오차는 0.001% 미만입니다. 고고학 유물에 묻은 피의 분자 고리가 {playerName} 님의 DNA 에너지 동형율과 정밀하게 공명하고 있어요. 우린 가늠할 수 없는 거대 운명의 주파수에 잡혀 있습니다.",
        rapportChange: 10
      }
    ]
  },
  {
    id: 'lim_story_3',
    npcId: 'lim',
    minRapport: 55,
    minRecords: 4,
    npcMessages: [
      "{playerName} 님, 차원의 비정형 게이트 극점 좌표 침식이 극점에 달하고 있습니다...",
      "분석 결과, 다음 파국 임계점을 우회하려면 백운혁 님의 원자 축 가속도와 금채란 님의 마력 공명의 인자가 등식으로 결합되어 조화 보정을 거쳐야 합니다. 인과 완성을 기도의 한 짝으로 승화할 준비가 되었습니다."
    ],
    choices: [
      {
        id: 'lim_3_a',
        text: "소연 씨의 연구 연산을 진심으로 신뢰합니다. 우리의 지혜로 세계의 엔딩 코드를 기필코 리팩토링합시다.",
        reply: "네...! 제 평생의 지적 조율과 영혼의 가치 사슬을 온전히 걸고, {playerName} 님이 디디실 절대 승리의 도표를 설계해 내겠습니다. 시공 완벽 동기화, 준비 운행 완료!",
        rapportChange: 22
      },
      {
        id: 'lim_3_b',
        text: "모두가 협력한다면 그 어떤 세계 멸망도 저지할 수 있을 겁니다.",
        reply: "맞습니다, 백운혁 님과 금채란 님, 그리고 분석대 총 조률원인 제가 {playerName} 님의 인과 끈을 견인해 멸망 수치를 제로(0.00%)로 격하시키겠습니다!",
        rapportChange: 15
      }
    ]
  }
];

/**
 * Returns the latest story context that is currently accessible/unlocked/pending for the NPC
 */
export const getActiveStoryForNpc = (
  npcId: string,
  rapport: number,
  recordCount: number,
  history: ChatMessage[]
): ChatStory | null => {
  const npcStories = CHAT_STORIES.filter(s => s.npcId === npcId);
  
  for (const story of npcStories) {
    // Check if player has already responded to this story's choice
    const isCompleted = history.some(msg => 
      msg.sender === 'player' && 
      story.choices.some(choice => {
        const cleanChoiceText = choice.text.replace(/\{playerName\}/g, '').replace(/유저/g, '').trim();
        const cleanMsgText = msg.text.replace(/\{playerName\}/g, '').replace(/유저/g, '').trim();
        return cleanMsgText.includes(cleanChoiceText) || cleanChoiceText.includes(cleanMsgText);
      })
    );

    if (!isCompleted) {
      // Check if unlocked based on requirement
      if (rapport >= story.minRapport && recordCount >= story.minRecords) {
        return story;
      }
      // If of higher tier but locked, we stop assessing further in the chain
      break;
    }
  }
  return null;
};

/**
 * Replace placeholders
 */
export const interpolateText = (text: string, playerName: string): string => {
  return text.replace(/\{playerName\}/g, playerName || '유저');
};
