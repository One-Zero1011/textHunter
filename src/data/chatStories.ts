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
  },
  // ==================== SHIN HYUN-MIN STORIES (F급) ====================
  {
    id: 'shin_story_1',
    npcId: 'shin',
    minRapport: 0,
    minRecords: 0,
    npcMessages: [
      "형님! 저 현민임다! 혹시 오늘 훈련 보충하시다 배고프진 않으심까?!",
      "편의점에 마침 제 여동생 서윤이가 직접 구워준 구수한 마석 쿠키가 있는데, 전송해 드릴까욥?!"
    ],
    choices: [
      {
        id: 'shin_1_a',
        text: "우와, 서윤이가 만든 쿠키라면 엄청나게 귀중하겠네! 고맙게 먹을게 현민아.",
        reply: "히히! 형님이 맛있게 먹어주신다면 동생도 뿌듯해서 춤을 출 겁니다! 하역 공정 끝나고 웨이트장으로 즉각 배송하겠슴다! 안전 헌팅임다!",
        rapportChange: 15
      },
      {
        id: 'shin_1_b',
        text: "단 음식을 별로 선호하지 않는다. 다른 헌터 동지들과 나누렴.",
        reply: "아, 그렇군욥... 역시 형님의 프로 인장은 과당 섭취 조차 계량 제어 하시는구만요! 역시 짱임다! 그럼 보급 엑기스 전용 소금으로 보답하겠슴다!",
        rapportChange: 6
      }
    ]
  },
  {
    id: 'shin_story_2',
    npcId: 'shin',
    minRapport: 30,
    minRecords: 1,
    npcMessages: [
      "형님, 사실 제 전송 망 시스템에 아주 골동품 수준인 고어 해독 파단 칩셋이 하나 발견됐슴다.",
      "소연 누나 아카이브에서 구한 모양새랑 똑 닮았는데... 이거 형님이 소지하고 계시는 인과 편린의 연도랑 호환이 되는 걸까요?"
    ],
    choices: [
      {
        id: 'shin_2_a',
        text: "대단하다 현민아! 그 폐부품 칩셋이 바로 인과의 누수를 복구해 줄 백도어 핵심 키야. 고마워!",
        reply: "와!! 제 허접한 수집 노선이 형님의 거대한 인류 구원 방정식에 이바지했다니 소름 돋았슴다! 이 현민이, 형님 곁에서 포탈 파편 다 모아 올 테니 믿어주십쇼!",
        rapportChange: 20
      }
    ]
  },

  // ==================== PARK SO-ROK STORIES (E급) ====================
  {
    id: 'park_story_1',
    npcId: 'park',
    minRapport: 0,
    minRecords: 0,
    npcMessages: [
      "지후 씨, 오늘 남산 보급 구역에서 무리하셔서 손목 기맥이 비정상적으로 부어오른 소식을 접했어요...",
      "제가 유기농 라벤더 지혈 소독 스프레이를 준비해 놓았는데, 휴게실에 잠시 들러 주시겠어요?"
    ],
    choices: [
      {
        id: 'park_1_a',
        text: "소록 선생님의 자상한 의료 지도 덕분에 늘 사지 부상의 위험 고비를 잘 극복하고 있습니다.",
        reply: "후후, 그렇게 말씀해 주시니 주치의로서 커다란 마음의 위안이 되네요. 지후 씨가 건강해야 이 서울의 뒤틀린 운명도 수복할 수 있을 테니까요. 조심히 오세요.",
        rapportChange: 15
      },
      {
        id: 'park_1_b',
        text: "자가 붕대로 응급 수리가 완료되었습니다. 염려 감사합니다.",
        reply: "어머나... 자가로 하시다간 마력 불순물이 침투해 염증이 가속될지도 모르는걸요. 역시 지후 씨는 고집이 세시지만... 다음에 꼭 제 지압실을 방문하셔야 해요.",
        rapportChange: 8
      }
    ]
  },
  {
    id: 'park_story_2',
    npcId: 'park',
    minRapport: 35,
    minRecords: 1,
    npcMessages: [
      "지후 씨... 사실 최근 매디컬 의무 센터의 특별 비밀 문서에서 이상한 주파수를 탐지했어요.",
      "60일 뒤 서울 상공 게이트가 침식 점멸할 때, 협회가 부상자 병동을 고립 장벽 속에 버려두고 자기들만 수송 차표로 격리 셔틀을 돌리기로 예약 정사했다는 기록이에요... 너무해요..."
    ],
    choices: [
      {
        id: 'park_2_a',
        text: "그런 가혹한 파국은 결코 오지 않습니다. 제가 이 반복되는 루프 연산식을 뜯어내서, 병원의 모든 이들과 소록 씨를 대피시키겠습니다.",
        reply: "아... 지후 씨의 단단한 눈빛은 메디컬 계측기보다 더 심박 한 확신을 주는군요. 네, 좋아요. 이 가녀린 E급 마나를 다 쏟아서라도, 전 끝까지 지후 씨의 전위에서 심장부 회복 처치를 맡겠습니다!",
        rapportChange: 22
      }
    ]
  },

  // ==================== CHOI KANG-SIK STORIES (D급) ====================
  {
    id: 'choi_story_1',
    npcId: 'choi',
    minRapport: 0,
    minRecords: 0,
    npcMessages: [
      "야! 박지후 동생!! 오늘 운동은 다 했냐?!",
      "이 강식이 형님이 수련장 바벨 옆에서 사나이 의의를 불태우며 고중량 근력 정합 땀방울을 휘날리고 있다! 어서와서 합세해라!"
    ],
    choices: [
      {
        id: 'choi_1_a',
        text: "사나이의 땀방울은 배신하지 않지요! 200kg 오버 트레이닝 가겠습니다 형님!",
        reply: "으오오오!! 가오가 흘러넘치다 못해 폭발하는구만 박지후!! 오늘 체육관 철판들 전부 녹을 때까지 밀어붙이는 거다! 하하하!!",
        rapportChange: 15
      },
      {
        id: 'choi_1_b',
        text: "피로가 누적되어 자제하겠습니다. 형님도 디스크 정밀 진료에 유의하세요.",
        reply: "쯧쯧... 사나이가 기압력에 밀려 후퇴하는 모양샌 아쉽지만, 지후 네 신체 가동 회로는 소중하니까 존중하지! 푹 자고 영양 족발 먹으러 오거라!",
        rapportChange: 7
      }
    ]
  },
  {
    id: 'choi_story_2',
    npcId: 'choi',
    minRapport: 30,
    minRecords: 1,
    npcMessages: [
      "지후야, 이 우직한 도끼를 쥐고 서 있으면 가끔 내 머릿속에 기억나지 않는 거센 칼자국 흉터가 기성적으로 욱신거려.",
      "마치 예전 종말 전선에서... 내가 몸통 절반이 갈려 나가면서도 네 이름을 부르며 하늘의 몬스터 파편 밑창을 치받아 막아서다 장엄히 전멸했던 것 같은 착각이 들어. 대체 뭐지...?"
    ],
    choices: [
      {
        id: 'choi_2_a',
        text: "형님, 그건 착각이 아니라 형님이 저와 대한민국을 위해 목숨을 갈아 주셨던 구국의 영웅적 기시감입니다. 이번엔 결코 죽게 두지 않습니다.",
        reply: "허억...!! 가설로만 떠돌던 내 전생의 용맹 파동이 사실이었단 말인가...!! 박지후... 가오에 죽고 가오에 살던 내가 이번에야말로 네 진짜 형이 되어, 서울 복판에서 너 대신 적장의 골통을 부셔 수호하겠다!!",
        rapportChange: 22
      }
    ]
  },

  // ==================== YOO CHAE-EUN STORIES (C급) ====================
  {
    id: 'yoo_story_1',
    npcId: 'yoo',
    minRapport: 0,
    minRecords: 0,
    npcMessages: [
      "박지후 씨, 제 차원 레이더 단말기 기록 로그에 가설상의 기묘한 편차가 연신 인덱싱되네요.",
      "마치... 지후 씨 한 사람만이 이 세계 정지 카운트다운의 뒤편에서 고립 소급되어 움직이는 변형 인자 같아요. 대체 정체가 뭐죠?"
    ],
    choices: [
      {
        id: 'yoo_1_a',
        text: "놀라운 안목이네요. 전 이 멸망 당할 종말 엔딩을 거부하고, 시간 변수를 직렬 해독하는 중입니다. 저와 합세해 주세요.",
        reply: "와... 제 6감 전자기 검출기조차 오버코드로 널뛰는 신념이네요. 단순 스티킹인 줄 알았더니 진짜 기하학적 버그 캐릭터셨군요? 흥미 있어요. 제 정찰 맵핑 센서로 협력 주파수를 고정할게요.",
        rapportChange: 15
      },
      {
        id: 'yoo_1_b',
        text: "센서가 먼지 때문에 고장 난 파장 같네요. 계측기 세밀히 제 조율 하세요.",
        reply: "저의 정합 렌즈는 매월 협회 가청 승인을 받은 특례 모듈입니다! 그런 야만적인 먼지 타령이라니 기가 차네요. 다음에 정밀 분자 스펙트럼으로 직접 계량해 드리지요.",
        rapportChange: 6
      }
    ]
  },
  {
    id: 'yoo_story_2',
    npcId: 'yoo',
    minRapport: 35,
    minRecords: 1,
    npcMessages: [
      "지후 씨, 금일 정리를 마친 한강 기맥 탐험 레이더 등고선 오차를 보니 기가 갈려요... 침식율 증가치 0.25%.",
      "이 수식대로 60일 뒤 게이트 S가 서울 전면을 타격하면, 모든 피난 좌표는 폐쇄되고 공간 차리기가 종결되어 버려요. 우리 지연 완화 회선을 개통해야 할까요?"
    ],
    choices: [
      {
        id: 'yoo_2_a',
        text: "그렇습니다. 채은 씨의 공간 감지 좌표와 제 인과 조각 인덱싱이 하나로 맞물리면, 안전 포탈 활로를 기어이 도출할 수 있습니다.",
        reply: "우와! 시각 레이저 맵과 인과 기록의 수 동조라니... 가슴이 기하학적으로 두방망이질치네요! 좋습니다, 이 엘리트 계측관의 레이더 대역폭을 오직 지후 씨 한 명에게만 전폭 직렬 연결해 두겠어요! 힘내요!",
        rapportChange: 22
      }
    ]
  },

  // ==================== KANG DA-IN STORIES (B급) ====================
  {
    id: 'kang_story_1',
    npcId: 'kang',
    minRapport: 0,
    minRecords: 0,
    npcMessages: [
      "초보 각성자 박지후. 오늘 홍대 무장 수화 구치소 서쪽 트랙에서 저격을 엄호하며 네 몸놀림을 감지했다.",
      "E급이나 F급 보조병처럼 흔들리는 걸음새는 전투에 대단히 불명예스러워. 중심 기압력을 탄착 지점에 모아야지."
    ],
    choices: [
      {
        id: 'kang_1_a',
        text: "다인 선배님의 무관통 정속 저격을 보고 감명 받았습니다! 탄착 훈련 지도를 진심으로 동경합니다.",
        reply: "훗... 눈빛의 산포가 제법 단호하니 맘에 드는군. 자아의 마력을 긴 축심 장총처럼 팽팽히 억제해 쏘아 봐라. 그 격발 감각이 온몸에 익혀질 것이다.",
        rapportChange: 15
      },
      {
        id: 'kang_1_b',
        text: "근접 폭발과 주사위 돌파력만 있다면 원거리 지원 사격은 조수 수준에 불과합니다.",
        reply: "방심은 사선에서 주사위 크리티컬 급습을 당하는 지름길이지. 내 정밀 조준경 너머로 머리를 꿰뚫리는 마수를 보고서도 그런 오만이 성립하는지 던전에서 대각 증명해보자고.",
        rapportChange: 5
      }
    ]
  },
  {
    id: 'kang_story_2',
    npcId: 'kang',
    minRapport: 40,
    minRecords: 2,
    npcMessages: [
      "박지후, 60일 뒤 상공 S급 침색 게이트는 원거리 사선이 완전히 꺾인 수직 절벽 공간이다.",
      "내 저격총의 마나 격발 동조 오버율을 한계(300%)까지 전복 가속하지 않으면 저 위쪽 심장의 괴물을 타격해 뚫을 수 없어... 네가 심장부 등반으로 돌파할 때, 내 라이플 총열이 녹아내릴 때까지 다탄도 화격 정밀 사격을 개시하겠다. 같이 끝단을 볼까?"
    ],
    choices: [
      {
        id: 'kang_2_a',
        text: "선배님의 완벽한 백업 사선과 제 심장 돌격 궤적이 만나면 저 하늘의 게이트조차 부서진 인과로 바스러집니다. 사선 끝을 함께 도모하시죠.",
        reply: "포착 완료. 타깃 박박지후, 심장부 연동 전송 채널 고정. 내 검붉은 마력 조준선은 지구 멸망의 날에도 너의 돌입 지점을 절대 놓치지 않고 꿰뚫을 것이다. 든든하군.",
        rapportChange: 22
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
