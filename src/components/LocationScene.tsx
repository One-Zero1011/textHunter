/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Npc, CharacterStats, BodyPartsHP, Equipment } from '../types';
import { 
  Dumbbell, Heart, Coins, Store, Sparkles, Smile, MapPin, 
  MessageCircle, Coffee, Compass, X, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAssetPath } from '../utils';
import { 
  TRAINING_ACTIVITIES, 
  RECOVERY_ACTIVITIES, 
  JOB_ACTIVITIES, 
  NPC_EVENTS, 
  NpcChoice,
  NpcEvent,
  isShopItem
} from '../data';

interface LocationSceneProps {
  phase: string;
  stats: CharacterStats;
  setStats: React.Dispatch<React.SetStateAction<CharacterStats>>;
  bodyPartsHP: BodyPartsHP;
  setBodyPartsHP: React.Dispatch<React.SetStateAction<BodyPartsHP>>;
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  fatigue: number;
  setFatigue: React.Dispatch<React.SetStateAction<number>>;
  npcs: Npc[];
  setNpcs: React.Dispatch<React.SetStateAction<Npc[]>>;
  onAdvancePhase: () => void;
  onCollectRecord: () => void;
  recordCount: number;
  playerName: string;
  dDay: number;
  inventory: Equipment[];
  setInventory: React.Dispatch<React.SetStateAction<Equipment[]>>;
}

type DestinationType = 'training' | 'recovery' | 'job' | 'store' | 'home';

export default function LocationScene({
  phase,
  stats,
  setStats,
  bodyPartsHP,
  setBodyPartsHP,
  gold,
  setGold,
  fatigue,
  setFatigue,
  npcs,
  setNpcs,
  onAdvancePhase,
  onCollectRecord,
  recordCount,
  playerName,
  dDay,
  inventory,
  setInventory
}: LocationSceneProps) {
  const [selectedDest, setSelectedDest] = useState<DestinationType | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState<boolean>(false);
  const [activeNpcEvent, setActiveNpcEvent] = useState<{
    npc: Npc;
    dialogue: string;
    choices: NpcChoice[];
    isOutcome?: boolean;
  } | null>(null);

  const [narrativeFeedback, setNarrativeFeedback] = useState<string | null>(null);

  // Dynamic Typewriter & Shake Screen Effects
  const [displayedDialogue, setDisplayedDialogue] = useState<string>('');
  const [isTypingDialogue, setIsTypingDialogue] = useState<boolean>(false);
  const [displayedFeedback, setDisplayedFeedback] = useState<string>('');
  const [isTypingFeedback, setIsTypingFeedback] = useState<boolean>(false);
  const [shakeActive, setShakeActive] = useState<boolean>(false);

  const triggerShake = () => {
    setShakeActive(true);
    setTimeout(() => {
      setShakeActive(false);
    }, 350);
  };

  useEffect(() => {
    if (!activeNpcEvent?.dialogue) {
      setDisplayedDialogue('');
      setIsTypingDialogue(false);
      return;
    }

    const fullText = activeNpcEvent.dialogue;
    setDisplayedDialogue('');
    setIsTypingDialogue(true);

    let currentIndex = 0;
    let timer: NodeJS.Timeout;

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        setDisplayedDialogue(fullText.substring(0, currentIndex + 1));
        const nextChar = fullText[currentIndex];
        currentIndex++;
        
        let delay = 12; // Base speed: 12ms per char
        if (nextChar === '.' || nextChar === '?' || nextChar === '!') {
          delay = 140; // pause at punctuation
        } else if (nextChar === '\n') {
          delay = 200; // longer pause at new lines
        } else if (nextChar === ',') {
          delay = 60; // short pause at comma
        }
        timer = setTimeout(typeNextChar, delay);
      } else {
        setIsTypingDialogue(false);
      }
    };

    timer = setTimeout(typeNextChar, 10);

    return () => {
      clearTimeout(timer);
    };
  }, [activeNpcEvent?.dialogue]);

  useEffect(() => {
    if (!narrativeFeedback) {
      setDisplayedFeedback('');
      setIsTypingFeedback(false);
      return;
    }

    const fullText = narrativeFeedback;
    setDisplayedFeedback('');
    setIsTypingFeedback(true);

    let currentIndex = 0;
    let timer: NodeJS.Timeout;

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        setDisplayedFeedback(fullText.substring(0, currentIndex + 1));
        const nextChar = fullText[currentIndex];
        currentIndex++;
        
        let delay = 10;
        if (nextChar === '.' || nextChar === '?' || nextChar === '!') {
          delay = 100;
        } else if (nextChar === ',') {
          delay = 50;
        }
        timer = setTimeout(typeNextChar, delay);
      } else {
        setIsTypingFeedback(false);
      }
    };

    timer = setTimeout(typeNextChar, 10);

    return () => {
      clearTimeout(timer);
    };
  }, [narrativeFeedback]);

  const handleSkipDialogueTyping = () => {
    if (isTypingDialogue && activeNpcEvent?.dialogue) {
      setDisplayedDialogue(activeNpcEvent.dialogue);
      setIsTypingDialogue(false);
    }
  };

  const handleSkipFeedbackTyping = () => {
    if (isTypingFeedback && narrativeFeedback) {
      setDisplayedFeedback(narrativeFeedback);
      setIsTypingFeedback(false);
    }
  };

  const handleFocusedHeal = (part: keyof BodyPartsHP) => {
    if (gold < 3000) {
      alert("🚨 집중 치료를 위한 자금(3,000 골드)이 부족합니다.");
      return;
    }
    
    // Check if body part is actually 0
    if (bodyPartsHP[part] === 0) {
      alert("🚨 이 신체 부위는 이미 완전히 소실(0 HP)되어 메디컬 수술로도 복구가 불가능합니다!");
      return;
    }

    setGold(prev => prev - 3000);
    setFatigue(prev => Math.min(100, prev + 15)); // recovers 15 energy
    setBodyPartsHP(prev => ({
      ...prev,
      [part]: 100
    }));

    const partNamesKo: Record<keyof BodyPartsHP, string> = {
      head: '머리 (Head)',
      torso: '몸통 (Torso)',
      leftArm: '왼팔 (Left Arm)',
      rightArm: '오른팔 (Right Arm)',
      leftLeg: '왼다리 (Left Leg)',
      rightLeg: '오른다리 (Right Leg)',
    };

    triggerShake();
    setNarrativeFeedback(`🏥 서울역 메디컬에서 집중 치료를 성품 하였습니다. 소실 위기였던 [${partNamesKo[part]}] 부위가 100% 온전하게 완치되었습니다! (+15 기력 회복, 3,000 골드 소모)`);
    setSelectedDest(null);
    onAdvancePhase();
  };

  const handleWholeBodyHeal = () => {
    if (gold < 5000) {
      alert("🚨 전신 광역 정화를 위한 자금(5,000 골드)이 부족합니다.");
      return;
    }

    // Count parts that can be healed (HP > 0 and HP < 100)
    const activeParts = Object.keys(bodyPartsHP).filter(key => {
      const k = key as keyof BodyPartsHP;
      return bodyPartsHP[k] > 0 && bodyPartsHP[k] < 100;
    });

    if (activeParts.length === 0) {
      alert("🚨 치료가 필요하거나(HP < 100) 치료 가능한(HP > 0) 신체 상흔 부위가 존재하지 않습니다.");
      return;
    }

    setGold(prev => prev - 5000);
    setFatigue(prev => Math.min(100, prev + 25)); // recovers 25 energy
    
    setBodyPartsHP(prev => {
      const nextHP = { ...prev };
      (Object.keys(nextHP) as Array<keyof BodyPartsHP>).forEach(k => {
        if (nextHP[k] > 0) {
          nextHP[k] = Math.min(100, nextHP[k] + 70);
        }
      });
      return nextHP;
    });

    triggerShake();
    setNarrativeFeedback(`🏥 서울역 메디컬 전신 광역 복합 열선 치료를 완료했습니다. 소실되지 않은 모든 신체 활성 부위의 상흔이 각각 +70 HP씩 대대적으로 치유되었습니다! (+25 기력 회복, 5,000 골드 소모)`);
    setSelectedDest(null);
    onAdvancePhase();
  };

  const handleHomeSleep = () => {
    setFatigue(prev => Math.min(100, prev + 70));
    triggerShake();
    setNarrativeFeedback(`🛌 아공간 헌터 보안 안전가옥 침대에서 쾌적하게 푹 잠을 잤습니다. 깊고 평화로운 수면 끝에 지쳐있던 정신과 기력이 +70 크게 맑아졌습니다!`);
    setSelectedDest(null);
    onAdvancePhase();
  };

  const handleHomeTea = () => {
    if (gold < 1500) {
      alert("🚨 마제 차를 조율하기 위한 자금(1,500 골드)이 부족합니다.");
      return;
    }
    setGold(prev => prev - 1500);
    setFatigue(prev => Math.min(100, prev + 75));
    triggerShake();
    setNarrativeFeedback(`🍵 한방 고에너지 특효 마제 차의 뜨뜻한 김을 맡으며 전신 마나 장벽을 환원했습니다. 막혀있던 경맥 순환이 활성화되며 기력이 +75 대폭 상승 복원되었습니다! (-1,500 골드 소모)`);
    setSelectedDest(null);
    onAdvancePhase();
  };

  // Special guaranteed time-based contact checks
  const geumNpc = npcs.find(n => n.id === 'geum');
  const baekNpc = npcs.find(n => n.id === 'baek');
  const limNpc = npcs.find(n => n.id === 'lim');

  const showGeumSpecialAlert = dDay >= 42 && dDay <= 46 && phase === '아침' && geumNpc && !geumNpc.hasWitnessedSpecial;
  const showBaekSpecialAlert = dDay >= 28 && dDay <= 32 && phase === '저녁' && baekNpc && !baekNpc.hasWitnessedSpecial;
  const showLimSpecialAlert = dDay >= 13 && dDay <= 17 && phase === '점심' && limNpc && !limNpc.hasWitnessedSpecial;

  // Urgency thresholds for D-Day
  const isSlightlyRed = dDay <= 50 && dDay > 30;
  const isModeratelyRed = dDay <= 30 && dDay > 10;
  const isCriticallyRed = dDay <= 10;

  // Dynamic Title & Description based on dDay and phase
  let defaultTitle = '세상이 S급 각성자의 길을 묻습니다';
  let defaultDesc = '체계적인 한계 매니지먼트만이 60일 뒤 출현할 서울 종말 급 가야 게이트 소멸의 진실을 푸는 전조가 됩니다.';

  if (isCriticallyRed) {
    defaultTitle = `🚨 종말의 피빛 하늘 (D-${dDay})`;
    defaultDesc = `시공 장벽 수치가 완전히 무너져 붉은 안개가 강남 거리를 집어삼킵니다. 백운혁, 금채란, 임소연과 인과율 동기화를 마치고 당장 결사 전선에 참전하십시오!`;
  } else if (isModeratelyRed) {
    defaultTitle = `⚠️ 차원 구속 요동 발생 (D-${dDay})`;
    defaultDesc = `마나 가습 밀도가 급격히 팽창해 하늘이 탁한 적동색으로 변하고 있습니다. 상급 험난 게이트들이 일평균 빈도수 수준을 넘어 동시다발적으로 개문됩니다.`;
  } else if (isSlightlyRed) {
    defaultTitle = `⚠️ 변곡의 조짐 감지 (D-${dDay})`;
    defaultDesc = `공기 중에 비릿한 마력 탄내가 섞여 흩날립니다. 저 먼 한계선 너머 파멸의 눈빛이 차원의 조그만 빈틈을 비집고 이 도시 서울을 탐색하기 시작합니다.`;
  } else {
    if (phase === '아침') {
      defaultTitle = '🌅 고요가 퍼지는 서울의 아침 일과';
      defaultDesc = '아침 이슬 아래 평화로운 거리에 새들이 지저귀는 맑고 따스한 소리가 들려옵니다. 상쾌한 마나를 조율하여 오늘 하루의 수련을 기틀 삼아 갈 최선의 흐름입니다.';
    } else if (phase === '점심') {
      defaultTitle = '☀️ 나른하고 선명히 내리쬐는 정오';
      defaultDesc = '강남 대로 주변의 헌터 상단과 각성인 무리가 활기차게 장비를 거래합니다. 신체를 충분히 보강하여 상급 균열에 무사 안착할 대비를 하십시오.';
    } else if (phase === '저녁') {
      defaultTitle = '🌉 어스름이 사르르 내려앉는 서울의 황혼';
      defaultDesc = '노을빛이 아름답게 스러지고 도심 곳곳의 마력 가로등이 정답게 점등됩니다. 동료들과의 메신저 채널을 점검하고, 조율의 기록을 매듭지으며 내일을 기약할 밤이 옵니다.';
    }
  }

  // Trigger NPC Event probability check upon selecting destination
  const handleDestinationAction = (dest: DestinationType) => {
    setSelectedDest(dest);
    setNarrativeFeedback(null);
    setActiveNpcEvent(null);

    // Check for S-Class special guaranteed time & place contact events
    const chaeRanSpecial = dest === 'recovery' && dDay >= 42 && dDay <= 46 && phase === '아침';
    const baekSpecial = dest === 'training' && dDay >= 28 && dDay <= 32 && phase === '저녁';
    const limSpecial = dest === 'job' && dDay >= 13 && dDay <= 17 && phase === '점심';

    if (chaeRanSpecial || baekSpecial || limSpecial) {
      const activeNpcId = chaeRanSpecial ? 'geum' : baekSpecial ? 'baek' : 'lim';
      const targetNpc = npcs.find(n => n.id === activeNpcId);
      
      if (targetNpc && !targetNpc.hasWitnessedSpecial) {
        // Unlock and mark as completed
        setNpcs(prev => prev.map(n => n.id === activeNpcId ? { ...n, unlocked: true, hasWitnessedSpecial: true } : n));
        triggerSpecialTimeEncounter(activeNpcId);
        return;
      }
    }

    // 40% chance of triggering S-Class NPC meeting
    const triggerChance = Math.random();
    if (triggerChance < 0.45) {
      // Choose random unlocked or locked NPC
      const randomNpc = npcs[Math.floor(Math.random() * npcs.length)];
      
      // Make unlocked on meet
      setNpcs(prev => prev.map(n => n.id === randomNpc.id ? { ...n, unlocked: true } : n));

      triggerNpcDialogue(randomNpc, dest);
    }
  };

  const triggerSpecialTimeEncounter = (npcId: string) => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    let dialogue = '';
    let choices: NpcChoice[] = [];

    if (npcId === 'geum') {
      dialogue = `[인연 특별 이벤트 - 기시감의 마력 충돌]\n\n서울역 수화 카페 복도 앞 벤치에 금채란이 양어깨를 웅크린 채 가쁜 숨을 몰아쉬고 있습니다. 그녀의 황금빛 결계 오라가 불안정하게 점멸하며 주변 공간의 마나 농도를 일그러트립니다. 한 손으로는 전 장벽 궤적에서 부서진 걸로 보이는 금이 간 주황색 펜던트를 소중한 듯 꽉 쥐고 있네요.\n\n"아... 으윽... 아저씨...? 이상해... 서울역 가습 장치에 접근하자마자 머리가 깨질 것처럼 울리고 마력이 멋대로 역류해... 그리고 이 펜던트... 분명 한 번도 본 적 없는 건데 왜 이렇게 가슴이 미어질 듯이 아픈 거지? 마치... 아저씨가 예전에 나를 지키고 차원에 빠져들었을 때 쓰던 유물인 것 같아... 나 미친 걸까...?"`;
      
      choices = [
        {
          text: `"채란아, 넌 미치지 않았어. 우린 분명 저 차원의 밑바닥에서 함께 인과를 이겨냈었어. 내 체력을 네 파동에 동조시킬 테니 부디 내 손을 잡아 기운을 안정시켜봐."`,
          rapportChange: 35,
          statChange: { health: 6 },
          reply: `[동조 완료] 당신이 금채란의 작은 손을 움켜잡자 혼란스럽던 그녀의 기시감 영혼 파동이 거짓말처럼 고요해집니다. 금채란이 떨리는 눈으로 당신을 올려다봅니다. "진짜... 아저씨의 온기가 내 전신이랑 하나처럼 연결됐어... 역시 꿈이 아니었던 거야. 나, 아저씨를 절대 잊지 않을 거야..." 금채란의 호감도(+35)와 당신의 체력(+6)이 대폭 상승했으며, 완벽한 파트너가 될 기반이 형성되었습니다!`
        },
        {
          text: `"마주의 정서적 쇼크 때문입니다. 여기 특제 마정 가열 주입제 진정 스위치를 켜 드릴 테니 깊게 들이쉬세요."`,
          rapportChange: 15,
          statChange: { intellect: 4 },
          reply: `[대응 완료] 메뉴얼에 기재된 대로 정식 치료 진정제를 이행하여 신체적 위기를 넘겼습니다. 금채란이 조금 진정된 눈으로 투덜거립니다. "...하여간 구세대 공무원 헌터처럼 딱딱하긴. 그래도 고마워, 좀 살 것 같네." 호감도(+15)와 지력(+4)이 늘어났습니다.`
        }
      ];
    } else if (npcId === 'baek') {
      dialogue = `[인연 특별 이벤트 - 딸 서아의 낙서와 약속]\n\n강남 수련관 한편의 으슥한 바벨 랙 정비실에서 백운혁이 철제 플레이트들을 하나씩 묵묵히 닦던 중, 당신을 불러 세웁니다. 그가 지갑 깊숙한 곳에서 다섯 살배기 딸 서아가 크레파스로 삐뚤삐뚤 그린 그림 한 장을 거칠고 상처투성이인 손으로 조심스럽게 꺼내 보여줍니다.\n\n놀랍게도 그림 속 조그만 서아는 저 멀리 강경한 붉은 눈의 초대형 거문을 등진 채, 지후(당신)와 백운혁이 피 흘리며 거대한 연합 방패를 형성해 마기를 막아서는 최후의 희생 순간을 너무나도 정확히 묘사하고 있습니다.\n\n"F급 헌터... 내 딸 서아는 자네의 이름도, 얼굴도, 심지어 S급 기가 게이트의 형태를 단 한 번도 접한 적이 없네. 그런데 어젯밤 이 그림을 그리더니, 내 소매를 잡고 '그 삼촌을 꼭 수련실에서 지켜줘야 돼'라고 비명을 지르며 울더군. 자네... 대체 정체가 뭔가? 이 미쳐버린 시간선의 뒤편에 정말로 뒤틀린 기록이 소급되고 있는 건가...?"`;
      
      choices = [
        {
          text: `"백운혁 선배님. 이 지옥 같은 세계선은 이미 수없이 멸망했고, 전 매 회차마다 서아와 당신을 서울 종말의 구렁텅이에서 지키려다 영혼이 찢겼습니다. 이번 60일의 유예야말로 그 연쇄 대멸망을 극복할 단 하나의 정답 경로입니다."`,
          rapportChange: 35,
          statChange: { strength: 6 },
          reply: `[인과율 합치] 백운혁의 굳게 다문 강철 같은 턱관절이 미세하게 떨립니다. 그는 말없이 서아의 그림을 접어 품에 고이 안치하고 당신의 어깨를 무겁게 짚어줍니다. "...그 무모한 F급 눈동자 속에 한 줌의 가식도 존재하지 않는군. 신의 장난이든 시공의 구렁텅이든 마침내 기꺼이 내 목숨과 철옹성의 방패를 자네의 무구에 대여하겠네." 백운혁의 호감도(+35)와 당신의 근력(+6)이 가중되었으며, 백운혁이 든든한 전우로 맹세하였습니다!`
        },
        {
          text: `"단순히 서아가 헌터 특보 뉴스를 보고 거하게 상상력을 펼친 기교일 뿐입니다. 너무 깊게 생각하지 마십시오."`,
          rapportChange: 15,
          statChange: { agility: 4 },
          reply: `[답변 완료] 현실적인 이치로 상황을 넘겼습니다. 백운혁이 씁쓸한 표정으로 샌드백을 매잡습니다. "...그래, 그게 머리 아프지 않은 유일한 합치안이겠지. 안전히 수련이나 하게." 백운혁의 호감도(+15)와 당신의 민첩(+4)이 늘어났습니다.`
        }
      ];
    } else if (npcId === 'lim') {
      dialogue = `[인연 특별 이벤트 - 건대 자재실의 종말 기록 복제]\n\n건대입구 마석 자원 분류소 지하 깊숙한 특례 자재 창고의 수북히 쌓인 철제 박스들 틈바구니에서 임소연이 커다란 안경을 위태롭게 매달고 조율서 조사에 빠져 있습니다. 당신이 다가서자 들고 있던 유물 고문서 한 권을 보여주며 몹시 흥분한 목소리로 떨며 소곤댑니다.\n\n"지후 씨... 제가 이 수하 하차 마석 더미 사이에서 공인 등록되지 않은 수천 년 전의 '기록관의 시방서' 사본 파편을 마침내 완전 복원했어요. 여기 가려진 수식들을 대입해 보니 기묘하게도... 우리가 60일 후 수도권 복판에서 조우할 최후의 문인 'GATE S'의 내부 마나 가중치를 전복시키기 위해선, 'S급 헌터 금채란', 'S급 탱커 백운혁', 그리고 '기록 분석가 임소연' 자아 파동이 정확하게 지후 씨 한 사람에게 직렬 수렴동조 되어야 한다고 기재되어 있어요...! 마치... 누군가 이미 설계해 둔 구국의 방정식처럼요...!"`;
      
      choices = [
        {
          text: `"소연 씨가 기적처럼 해독해 낸 이 고대 정답 수식이야말로 멸망을 비켜 갈 유일한 나침반입니다. 제 든든한 기록 총괄관이자 등불이 되어 주시겠습니까?"`,
          rapportChange: 35,
          statChange: { intellect: 6 },
          actions: ['collect_record'],
          reply: `[인과율 결속] 임소연이 안경을 황급히 고쳐 쓰며 하얗게 상기된 얼굴로 미소 지어 보입니다. "네...! 지후 씨가 가져다주시는 세계 선 실패 조각들을 모두 활용해서, 절대 어긋나지 않는 완벽한 승리의 교정 공식을 출력해 낼게요! 전 믿어요!" 임소연의 호감도(+35)와 당신의 지력(+6)이 늘어났으며, 서울 대파멸을 부수는 특급 복원 서류가 완성되어 기밀 데이터 레코드 1개가 공짜로 발굴되었습니다!`
        },
        {
          text: `"놀랍지만 너무 과몰입하면 가공된 패닉 주파수에 뇌 세포만 다칩니다. 우선 이 고서적을 임시 압수해 보관하겠습니다."`,
          rapportChange: 15,
          statChange: { health: 4 },
          reply: `[압수 조치] 위협 가능성이 의심되는 서적을 온건히 접수했습니다. 임소연이 조금은 가슴을 쓸어내리며 답합니다. "휴... 네, 저도 사실 이 연산을 마주하자마자 전율 때문에 숨이 멎을 뻔했거든요. 압수해 주셔서 고마워요." 임소연의 호감도(+15)와 당신의 체력(+4)이 늘어났습니다.`
        }
      ];
    }

    const replaceName = (str: string): string => {
      if (!str) return '';
      return str.replaceAll('박지후', playerName || '유저').replaceAll('지후', playerName || '유저');
    };

    const processedDialogue = replaceName(dialogue);
    const processedChoices = choices.map(choice => ({
      ...choice,
      text: replaceName(choice.text),
      reply: replaceName(choice.reply)
    }));

    setActiveNpcEvent({ npc, dialogue: processedDialogue, choices: processedChoices });
  };

  const triggerNpcDialogue = (npc: Npc, dest: DestinationType) => {
    // 1. Filter all matching events the player qualifies for
    const qualifiedEvents = NPC_EVENTS.filter(e => {
      if (e.npcId !== npc.id || e.destination !== dest) return false;
      
      // Check minimum rapport threshold if defined
      if (e.minRapport !== undefined && npc.rapport < e.minRapport) return false;
      
      // Check minimum records/files threshold if defined
      if (e.minRecords !== undefined && recordCount < e.minRecords) return false;
      
      return true;
    });

    let dialogue = '';
    let choices: NpcChoice[] = [];

    if (qualifiedEvents.length > 0) {
      // Pick the event with the highest minRapport / minRecords to show the most advanced qualified conversation
      qualifiedEvents.sort((a, b) => {
        const rapportA = a.minRapport || 0;
        const rapportB = b.minRapport || 0;
        if (rapportA !== rapportB) return rapportB - rapportA; // Descending
        
        const recordsA = a.minRecords || 0;
        const recordsB = b.minRecords || 0;
        return recordsB - recordsA; // Descending
      });

      const matchedEvent = qualifiedEvents[0];
      dialogue = matchedEvent.dialogue;
      choices = matchedEvent.choices;
    } else {
      // Default Fallback that changes realistically depending on rapport
      if (npc.rapport >= 50) {
        dialogue = `${npc.name}이(가) 환하게 반기며 머뭇거립니다. "${playerName} 씨, 마침 만나고 싶었습니다. 오늘도 안전하고 훌륭한 하루 보내세요."`;
      } else {
        dialogue = `${npc.name}이(가) 가볍게 목인사를 건네며 지나갑니다. "좋은 하루입니다, ${playerName} 씨."`;
      }
      choices = [
        {
          text: `"네, 선배님도 좋은 헌팅 되십시오."`,
          rapportChange: 4,
          reply: '서로 가볍게 덕담을 나누었습니다.'
        }
      ];
    }

    // Helper to dynamically replace hardcoded player names with the user-defined name
    const replaceName = (str: string): string => {
      if (!str) return '';
      return str.replaceAll('박지후', playerName || '유저').replaceAll('지후', playerName || '유저');
    };

    const processedDialogue = replaceName(dialogue);
    const processedChoices = choices.map(choice => ({
      ...choice,
      text: replaceName(choice.text),
      reply: replaceName(choice.reply)
    }));

    setActiveNpcEvent({ npc, dialogue: processedDialogue, choices: processedChoices });
  };

  const handleChoiceSelect = (choice: NpcChoice) => {
    // Modify rapport values
    setNpcs(prev => prev.map(n => {
      if (n.id === activeNpcEvent?.npc.id) {
        const nextRapport = Math.min(100, Math.max(0, n.rapport + choice.rapportChange));
        return {
          ...n,
          rapport: nextRapport,
          isAlly: nextRapport >= 50
        };
      }
      return n;
    }));

    // Stat Changes
    if (choice.statChange) {
      setStats(prev => ({
        strength: prev.strength + (choice.statChange?.strength || 0),
        agility: prev.agility + (choice.statChange?.agility || 0),
        health: prev.health + (choice.statChange?.health || 0),
        intellect: prev.intellect + (choice.statChange?.intellect || 0)
      }));
    }

    // Gold Changes
    if (choice.goldBonus) {
      setGold(prev => Math.max(0, prev + (choice.goldBonus || 0)));
    }

    if (choice.actions && choice.actions.includes('collect_record')) {
      onCollectRecord();
    }

    triggerShake();
    if (activeNpcEvent) {
      setActiveNpcEvent({
        ...activeNpcEvent,
        dialogue: choice.reply,
        choices: [],
        isOutcome: true
      });
    } else {
      setNarrativeFeedback(choice.reply);
    }
  };

  // Perform standard actions without NPC interventions
  const executeCoreAction = (type: string) => {
    setSelectedDest(null);
    let msg = '';

    const trainingAct = TRAINING_ACTIVITIES.find(a => a.id === type);
    const recoveryAct = RECOVERY_ACTIVITIES.find(a => a.id === type);
    const jobAct = JOB_ACTIVITIES.find(a => a.id === type);

    if (trainingAct) {
      setStats(prev => ({
        ...prev,
        strength: prev.strength + (trainingAct.statBonus.strength || 0),
        agility: prev.agility + (trainingAct.statBonus.agility || 0),
        health: prev.health + (trainingAct.statBonus.health || 0),
        intellect: prev.intellect + (trainingAct.statBonus.intellect || 0)
      }));
      setFatigue(prev => Math.max(0, prev - trainingAct.fatigueCost));
      msg = `${trainingAct.message.replace('(+15 피로도)', '(-15 피로도)')}`;
    } else if (recoveryAct) {
      setFatigue(prev => Math.min(100, prev + recoveryAct.fatigueReduction));
      // Heal all body parts HP to full
      setBodyPartsHP({
        head: 100, torso: 100, leftArm: 100, rightArm: 100, leftLeg: 100, rightLeg: 100
      });
      msg = `${recoveryAct.message.replace('피로도가 -45 크게 회복', '피로도가 +45 크게 회복')}`;
    } else if (jobAct) {
      const pay = jobAct.calculateGoldReward(stats);
      setGold(prev => prev + pay);
      setFatigue(prev => Math.max(0, prev - jobAct.fatigueCost));
      msg = `${jobAct.messageFormula(pay).replace('(+25 피로도)', '(-25 피로도)')}`;
    }

    triggerShake();
    setNarrativeFeedback(msg);
    onAdvancePhase();
  };

  return (
    <div className={`flex flex-col flex-1 p-3 md:p-4 gap-3 text-zinc-100 overflow-y-auto text-sm max-h-full relative scrollbar-thin transition-colors duration-1000 ${
      shakeActive ? 'animate-shake' : ''
    } ${
      isCriticallyRed 
        ? 'bg-gradient-to-b from-rose-950/15 to-zinc-950 shadow-[inset_0_0_50px_rgba(244,63,94,0.08)]' 
        : isModeratelyRed 
        ? 'bg-gradient-to-b from-rose-950/5 to-zinc-950 shadow-[inset_0_0_30px_rgba(244,63,94,0.03)]'
        : isSlightlyRed
        ? 'bg-gradient-to-b from-orange-950/5 to-zinc-950'
        : ''
    }`}>
      
      {/* SCENARIO LOCATION ILLUSTRATIONS CARD (Sleek Display style) */}
      <div className={`h-[120px] md:h-[140px] relative overflow-hidden flex flex-col justify-end p-4 md:p-5 shrink-0 shadow-lg rounded-2xl border transition-all duration-1000 ${
        isCriticallyRed 
          ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] bg-gradient-to-b from-zinc-900 via-rose-950/30 to-rose-950/40'
          : isModeratelyRed 
          ? 'border-rose-900/40 bg-gradient-to-b from-zinc-900 via-rose-950/10 to-rose-950/20'
          : isSlightlyRed 
          ? 'border-orange-900/30 bg-gradient-to-b from-zinc-900 via-orange-950/5 to-orange-950/10'
          : 'border-zinc-805 bg-gradient-to-b from-zinc-900 to-zinc-950'
      }`}>
        
        {/* Radial fade glowing spotlight based on urgency */}
        <div className={`absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 ${
          isCriticallyRed
            ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-600 via-transparent to-transparent'
            : isModeratelyRed
            ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-700/60 via-transparent to-transparent'
            : isSlightlyRed
            ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-600/40 via-transparent to-transparent'
            : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent'
        }`}></div>

        {/* Status indicator dot */}
        <div className={`absolute top-3 right-3 md:top-4 md:right-4 p-1 px-2 rounded-lg font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm border transition-all duration-700 ${
          isCriticallyRed
            ? 'bg-rose-950/90 text-rose-400 border-rose-500/30 font-extrabold'
            : isModeratelyRed
            ? 'bg-rose-950/70 text-rose-400 border-rose-900/30 font-bold'
            : isSlightlyRed
            ? 'bg-orange-950/60 text-orange-400 border-orange-900/30'
            : 'bg-zinc-950/90 text-blue-400 border-zinc-850 font-bold'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
            isCriticallyRed || isModeratelyRed ? 'bg-rose-500' : isSlightlyRed ? 'bg-orange-500' : 'bg-blue-500'
          }`}></span>
          <span>
            {isCriticallyRed
              ? '🛑 COLLAPSE DETECTED'
              : isModeratelyRed
              ? '⚠️ CRITICAL ANOMALY'
              : isSlightlyRed
              ? '⚠️ INSTABILITY REPORTED'
              : 'SEOUL SECURED NETWORK'}
          </span>
        </div>

        <div className="z-10 flex flex-col gap-1.5 pr-6">
          <span className={`text-[10px] md:text-xs uppercase font-mono flex items-center gap-1.5 font-bold tracking-widest transition-colors ${
            isCriticallyRed || isModeratelyRed ? 'text-rose-400' : isSlightlyRed ? 'text-orange-400' : 'text-zinc-400'
          }`}>
            <MapPin className={`w-3.5 h-3.5 ${
              isCriticallyRed || isModeratelyRed ? 'text-rose-500' : isSlightlyRed ? 'text-orange-500' : 'text-blue-500'
            }`} />
            서울 {phase} 페이즈 활동 구역
          </span>
          <h3 className={`text-xs md:text-sm font-bold font-display tracking-tight leading-none uppercase italic transition-colors ${
            isCriticallyRed ? 'text-rose-400 font-extrabold' : 'text-zinc-100'
          }`}>
            {selectedDest === 'training' && '강남 공인 헌터 수련관'}
            {selectedDest === 'recovery' && '서울역 각성 메디컬 가습센터'}
            {selectedDest === 'job' && '건대입구 파트타임 자원 분류소'}
            {selectedDest === 'store' && '홍대 기밀 무기 상가 (암거래소)'}
            {selectedDest === 'home' && '아공간 헌터 보안 안전가옥 (집)'}
            {!selectedDest && defaultTitle}
          </h3>
          <p className="text-[10px] md:text-xs text-zinc-400 font-sans leading-normal break-keep">
            {selectedDest === 'training' && '근지구력 가중 모래주머니와 특수 마정석 가상 훈련단이 상시 교전 준비 및 배치되어 있습니다.'}
            {selectedDest === 'recovery' && '특수 수화 요실 정화 팩과 요양용 캡슐 안치실이 가동되어 전신 상흔 완치를 보조합니다.'}
            {selectedDest === 'job' && '긴급 수송용 보급 분류 야간 알바를 소정 교대해 위험 합의금을 실시간 정산 수호합니다.'}
            {selectedDest === 'store' && '구식 장비 청산 처리기 및 저등급 스킬북 도서를 암거래 조율 결투 할 수 있는 헌터 정밀 무기 상가입니다.'}
            {selectedDest === 'home' && '전투와 일과로 지친 심신을 가다듬고 마나 밀도를 안정적으로 안식시킵니다. (부상 치료 불가, 피로 전면 안정 수면 가능)'}
            {!selectedDest && defaultDesc}
          </p>
        </div>
      </div>

      {/* ACTIVE EVENTS OR INTERACTIVE CHOICE BLOCK */}
      {activeNpcEvent ? (
        activeNpcEvent.npc.id === 'lim' ? (
          /* =======================================================
             🌌 IM SOYEON PORTRAIT VISUAL NOVEL DIALOGUE (임소연 미연시 연출)
             ======================================================= */
          <div className="p-0 bg-zinc-950 border border-violet-500/30 rounded-2xl flex flex-col md:flex-row overflow-hidden relative shadow-2xl min-h-[440px] md:min-h-[380px] animate-fadeIn transition-all duration-300">
            
            {/* Ambient Background Grid & Neon Blur */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute top-10 right-10 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left/Sidebar: Gorgeous Portrait Art */}
            <div className="w-full md:w-2/5 min-h-[250px] md:min-h-full relative overflow-hidden flex items-end justify-center bg-zinc-950/90 border-b md:border-b-0 md:border-r border-zinc-850">
              {/* Soft light halo behind character */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-gradient-to-tr from-violet-500/10 to-blue-500/10 rounded-full blur-3xl" />
              
              <img
                src={getAssetPath("images/portraits/imsoyeon/basic.png")}
                alt="임소연 미연시 초상화"
                referrerPolicy="no-referrer"
                className="w-full h-full max-h-[320px] md:max-h-[380px] object-contain object-bottom z-10 select-none pointer-events-none drop-shadow-[0_8px_32px_rgba(139,92,246,0.25)] transition-transform duration-700 hover:scale-[1.025]"
              />
              
              {/* NPC Metadata floating info overlay */}
              <div className="absolute top-3 left-3 z-10 bg-zinc-950/80 backdrop-blur-md border border-zinc-805 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[10px] text-violet-400 font-mono font-bold tracking-widest uppercase">
                  RECORD_ARCHIVER
                </span>
              </div>
            </div>

            {/* Right: Cinematic Visual Novel Text Box & Choice Branch */}
            <div className="w-full md:w-3/5 p-4 md:p-5 flex flex-col justify-between gap-4 z-10 relative bg-gradient-to-b from-zinc-900/40 to-zinc-950/80 backdrop-blur-sm">
              
              {/* Dialogue Area */}
              <div className="flex flex-col gap-2.5">
                {/* Character Speaker Tag Panel */}
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs tracking-wider rounded-lg shadow-[0_2px_8px_rgba(139,92,246,0.3)] font-sans flex items-center gap-1.5">
                    <span>✨ {activeNpcEvent.npc.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono font-bold">
                    Rapport {activeNpcEvent.npc.rapport}/100 • S급 아카이버
                  </span>
                </div>

                {/* Speech Box */}
                <div 
                  onClick={handleSkipDialogueTyping}
                  className="bg-zinc-950/90 p-3.5 md:p-4 rounded-xl border border-violet-900/30 text-xs text-zinc-100 font-semibold leading-relaxed font-sans mt-1 shadow-inner select-all relative group min-h-[120px] max-h-[180px] overflow-y-auto scrollbar-thin cursor-pointer hover:border-violet-700/50 transition-colors"
                >
                  <p className="break-keep whitespace-pre-line text-zinc-200 indent-1 font-sans font-semibold text-[11.5px] leading-relaxed tracking-wide">
                    {displayedDialogue}
                    {isTypingDialogue && <span className="inline-block w-1.5 h-3 ml-0.5 bg-violet-400 animate-pulse" />}
                  </p>
                  
                  {/* blinking visual novel cursor */}
                  <div className="absolute bottom-2.5 right-3 font-mono text-[8.5px] text-violet-400 font-bold flex items-center gap-1.5 opacity-85 select-none animate-pulse">
                    <span>▼ {activeNpcEvent.isOutcome ? 'CONCLUDED' : 'DECISION PENDING'} {isTypingDialogue && '(SKIP)'}</span>
                  </div>
                </div>
              </div>

              {/* Action/Decision Choices Grid */}
              <div className="flex flex-col gap-2 border-t border-zinc-850/80 pt-3">
                {activeNpcEvent.isOutcome ? (
                  /* Outcome Concluded Option */
                  <div className="flex flex-col gap-2 animate-fadeIn">
                    <p className="text-[10px] text-zinc-505 font-mono font-bold uppercase tracking-widest">
                      동조 교정 완료 (RESULT RESOLVED)
                    </p>
                    <button
                      onClick={() => setActiveNpcEvent(null)}
                      className="w-full py-3 bg-gradient-to-r from-violet-950/50 via-zinc-900 to-indigo-950/50 hover:from-violet-900/70 hover:to-indigo-900/70 border border-violet-850 hover:border-violet-500/50 rounded-xl text-center font-sans text-xs text-violet-300 font-bold tracking-wider transition-all cursor-pointer shadow-md select-none flex justify-center items-center gap-2 group active:scale-[0.99]"
                    >
                      <span>🔮 인연 동조 수렴 및 매듭 완료</span>
                    </button>
                  </div>
                ) : (
                  /* Interaction Branches */
                  <>
                    <div className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-widest flex items-center gap-1 mb-1 select-none">
                      <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                      <span>인과율 조율 최적 답변 분기</span>
                    </div>
                    {activeNpcEvent.choices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => handleChoiceSelect(choice)}
                        className="group w-full p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-violet-500/40 text-left font-sans text-xs text-zinc-300 hover:text-violet-300 font-bold leading-normal rounded-xl transition-all hover:translate-x-1 active:scale-[0.99] cursor-pointer flex items-center gap-3 shadow-md"
                      >
                        <span className="w-5 h-5 rounded-lg bg-zinc-900 group-hover:bg-violet-950 border border-zinc-800 group-hover:border-violet-800 text-[10px] text-zinc-500 group-hover:text-violet-400 font-mono font-black flex items-center justify-center shrink-0 transition-all select-none">
                          0{index + 1}
                        </span>
                        <span className="flex-1 break-keep font-sans font-bold text-[11px] leading-snug">{choice.text}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* S-CLASS NPC EVENT DIALOGUE CARDS (For other characters like Baek, Geum without portrait yet) */
          <div className="p-4 bg-zinc-900 border-2 border-blue-500/30 rounded-2xl flex flex-col gap-3 relative shadow-2xl animate-fadeIn">
            <div className="absolute -top-3 left-4 bg-blue-500 text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono shadow-md flex items-center gap-1.5">
              <Smile className="w-3 h-3 text-white" /> 인연 만남 인카운터
            </div>

            <div className="flex gap-2.5 items-center border-b border-zinc-800 pb-2.5 mt-1 shrink-0">
              <span className="text-xl bg-zinc-950 p-2 rounded-xl border border-zinc-850 leading-none shadow-inner">
                {activeNpcEvent.npc.avatarUrl}
              </span>
              <div>
                <h4 className="font-bold text-xs text-zinc-100 leading-none">{activeNpcEvent.npc.name}</h4>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider mt-1 block font-bold">{activeNpcEvent.npc.rank} RECRUITED</span>
              </div>
            </div>

            {/* dialogue box style */}
            <div 
              onClick={handleSkipDialogueTyping}
              className="bg-zinc-850/50 p-3.5 rounded-xl border border-zinc-800/40 text-zinc-200 italic text-xs leading-relaxed font-sans break-keep shadow-inner max-h-[160px] overflow-y-auto scrollbar-thin cursor-pointer hover:border-blue-500/30 transition-colors"
            >
              <p className="whitespace-pre-line">
                {displayedDialogue}
                {isTypingDialogue && <span className="inline-block w-1.5 h-3 ml-0.5 bg-zinc-400 animate-pulse" />}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-2.5">
              {activeNpcEvent.isOutcome ? (
                /* Outcome Concluded Option for standard characters */
                <button
                  onClick={() => setActiveNpcEvent(null)}
                  className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-xl shadow cursor-pointer transition-transform active:scale-95 text-center font-sans tracking-wide"
                >
                  확인 완료
                </button>
              ) : (
                activeNpcEvent.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoiceSelect(choice)}
                    className="p-2.5 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-left font-sans text-xs text-zinc-300 font-semibold leading-normal transition-all active:scale-95 cursor-pointer hover:border-blue-500/40"
                  >
                    {choice.text}
                  </button>
                ))
              )}
            </div>
          </div>
        )
      ) : narrativeFeedback ? (
        /* STANDARD DIALOGUE OUTCOME FEEDBACK VIEW */
        <div className="p-4 bg-zinc-900 border border-zinc-800/80 rounded-2xl flex flex-col gap-3 relative shadow-lg animate-fadeIn">
          <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest block mb-0.5">▲ 활동 섭렵 및 경계 로그</span>
          <div 
            onClick={handleSkipFeedbackTyping}
            className="bg-zinc-950/60 p-3.5 rounded-xl text-xs text-zinc-200 border border-zinc-850 leading-relaxed break-keep font-sans cursor-pointer hover:border-zinc-700/50 transition-colors"
          >
            <p className="whitespace-pre-line">
              {displayedFeedback}
              {isTypingFeedback && <span className="inline-block w-1.5 h-3 ml-0.5 bg-zinc-400 animate-pulse" />}
            </p>
          </div>
          <button
            onClick={() => setNarrativeFeedback(null)}
            className="mt-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-4 py-2 font-bold rounded-xl text-[10px] md:text-xs uppercase tracking-wider active:scale-95 transition-transform max-w-[120px] cursor-pointer"
          >
            기록 마감
          </button>
        </div>
      ) : selectedDest ? (
        /* SELECTED DESTINATION DETAILED ACTIONS DRAWER */
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-3">
          
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">활동 분류 선택</span>
            <button 
              onClick={() => setSelectedDest(null)}
              className="text-[10px] text-zinc-200 font-bold hover:text-zinc-400 transition-all cursor-pointer capitalize font-mono bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-lg"
            >
              ◀ 작전지도 보기
            </button>
          </div>

          {selectedDest === 'training' && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              {TRAINING_ACTIVITIES.map((act) => (
                <button
                  key={act.id}
                  disabled={fatigue < act.fatigueCost}
                  onClick={() => executeCoreAction(act.id)}
                  className="p-3 bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-950 disabled:opacity-40 border border-zinc-850 rounded-xl text-left flex justify-between items-center transition-all cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-zinc-100 text-xs md:text-sm truncate">{act.name}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5 font-mono truncate">{act.description}</div>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">{act.rewardPreview}</span>
                </button>
              ))}
              
              {fatigue < 15 && (
                <div className="text-rose-455 text-[10.5px] font-semibold text-center mt-1.5 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20">
                  ⚠️ 피로도 부족 (15 미만): 활성 훈련이 차단되었습니다. 휴식을 권유합니다.
                </div>
              )}
            </div>
          )}

          {selectedDest === 'recovery' && (() => {
            const partKeys: Array<keyof BodyPartsHP> = ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
            const partNamesKo: Record<keyof BodyPartsHP, string> = {
              head: '🧠 머리 (Head)',
              torso: '🛡️ 몸통 (Torso)',
              leftArm: '🥢 왼팔 (Left Arm)',
              rightArm: '🥢 오른팔 (Right Arm)',
              leftLeg: '🦶 왼다리 (Left Leg)',
              rightLeg: '🦶 오른다리 (Right Leg)',
            };
            
            // Check if any part is eligible for focused treatment (0 < HP < 100)
            const healableParts = partKeys.filter(k => bodyPartsHP[k] > 0 && bodyPartsHP[k] < 100);

            return (
              <div className="flex flex-col gap-3 animate-fadeIn bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                <div className="text-[11px] font-bold text-emerald-400 font-mono tracking-widest uppercase border-b border-zinc-900 pb-1.5 flex items-center gap-1.5">
                  <span>🏥 서울역 아공간 응급 메디컬 구역 상태판</span>
                  <span className="text-[9px] text-zinc-500 font-normal normal-case">(소실된 부위는 치료 불인정)</span>
                </div>

                {/* 1. Body Part Status Monitor */}
                <div className="grid grid-cols-2 gap-2 my-1">
                  {partKeys.map(k => {
                    const hp = bodyPartsHP[k];
                    const isMaimed = hp === 0;
                    const isHealed = hp === 100;
                    
                    return (
                      <div key={k} className="p-2 bg-zinc-900/60 border border-zinc-850/50 rounded-lg flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="font-semibold text-zinc-300">{partNamesKo[k]}</span>
                          <span className={`font-mono font-bold text-[11px] ${isMaimed ? 'text-red-500 line-through' : isHealed ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {isMaimed ? '소실' : `${hp}/100`}
                          </span>
                        </div>
                        {/* HP progress bar */}
                        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                          <div 
                            className={`h-full transition-all duration-500 ${isMaimed ? 'w-0 bg-red-600' : isHealed ? 'bg-emerald-500 w-full' : 'bg-orange-500'}`}
                            style={{ width: isMaimed ? '0%' : `${hp}%` }}
                          />
                        </div>
                        {/* Health sub-status text */}
                        <div className="text-[9px] font-mono font-medium">
                          {isMaimed ? (
                            <span className="text-red-500 font-extrabold animate-pulse">💀 소실됨 (치료 불가)</span>
                          ) : isHealed ? (
                            <span className="text-emerald-500">💚 완치 상태 (완격 복원)</span>
                          ) : (
                            <span className="text-orange-400">⚠️ 손상됨 (정밀 치료 필요)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Patient Balance HUD */}
                <div className="flex justify-between items-center p-2 bg-zinc-900 border border-zinc-850 rounded-lg text-xs mt-1">
                  <span className="text-zinc-400">나의 보유 재화 및 기력:</span>
                  <div className="flex gap-3 text-[11px] font-mono font-bold">
                    <span className="text-yellow-500">🪙 {gold.toLocaleString()} G</span>
                    <span className="text-blue-400">⚡ 기력: {fatigue}/100</span>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-3 flex flex-col gap-3">
                  
                  {/* Service Option A: Focused Intensive Treatment */}
                  <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-900/40 border border-zinc-850 rounded-xl text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-400">🎯 각성 집중 집중 치료 (Focused Treatment)</h4>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                          정상 작동 중이나 상흔이 남은(HP 1이상 ~ 99) 활성 부위 중 <strong>선택한 한 곳을 100% 즉각 완치</strong>합니다.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                        3,000G / +15 기력
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {healableParts.length > 0 ? (
                        healableParts.map(part => (
                          <button
                            key={part}
                            disabled={gold < 3000}
                            onClick={() => handleFocusedHeal(part)}
                            className="text-[10px] font-semibold bg-zinc-950 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-zinc-200 hover:text-emerald-400 px-2 py-1.5 rounded-lg transition-all cursor-pointer select-none"
                          >
                            ➕ {partNamesKo[part].replace(/([^\s]+)/, '$1 치료')}
                          </button>
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-550 italic">완치 가능한 손상된 활성 신체 부위가 존재하지 않습니다.</span>
                      )}
                    </div>
                  </div>

                  {/* Service Option B: Broad Cleanse */}
                  <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-900/40 border border-zinc-850 rounded-xl text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-400">🧪 아공간 전신 광역 정화 (Global Therapy)</h4>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                          소실되지 않고 살아있는 <strong>모든 신체 부위(현재 HP 1 이상)에 부위별로 각각 +70 HP 치료</strong>를 일선 전개합니다.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                        5,000G / +25 기력
                      </span>
                    </div>

                    <button
                      disabled={gold < 5000 || !partKeys.some(k => bodyPartsHP[k] > 0 && bodyPartsHP[k] < 100)}
                      onClick={handleWholeBodyHeal}
                      className="mt-2 w-full py-2 bg-emerald-950 hover:bg-emerald-900 disabled:bg-zinc-900 disabled:text-zinc-650 disabled:opacity-40 border border-emerald-800/40 hover:border-emerald-500 text-emerald-400 text-xs font-bold rounded-xl transition-all cursor-pointer tracking-wider uppercase select-none flex justify-center items-center gap-1"
                    >
                      <span>🔋 전신 광역 복합 조사기 기동</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}

          {selectedDest === 'home' && (
            <div className="flex flex-col gap-3 animate-fadeIn bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <div className="text-[11px] font-bold text-amber-400 font-mono tracking-widest uppercase border-b border-zinc-900 pb-1.5 flex items-center gap-1.5">
                <span>🏡 안전 가온 (나의 안식처 활동 섭렵)</span>
                <span className="text-[9px] text-zinc-500 font-normal normal-case">(부상 치료 불가능)</span>
              </div>

              <p className="text-[10.5px] text-zinc-400 leading-normal font-sans">
                전전전선 침공 대비, 안락하고 격리된 보안 벙커 안전 가옥에서 신체 긴장과 차원 간섭 피로도를 안전 수면 및 특효 마나 음료를 통해 완전 복원합니다.
              </p>

              {/* Patient Balance HUD */}
              <div className="flex justify-between items-center p-2 bg-zinc-900 border border-zinc-850 rounded-lg text-xs mt-1">
                <span className="text-zinc-400">나의 보유 재화 및 기력:</span>
                <div className="flex gap-3 text-[11px] font-mono font-bold">
                  <span className="text-yellow-500">🪙 {gold.toLocaleString()} G</span>
                  <span className="text-blue-400">⚡ 기력: {fatigue}/100</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-zinc-900 pt-3">
                
                {/* Home Option 1: Bed rest */}
                <button
                  onClick={handleHomeSleep}
                  className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-zinc-100 flex items-center gap-1.5">
                      <span>🛌 안락한 침대 암막 숙면</span>
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-1 lines-2 leading-relaxed">
                      아무 비용 결출 없이 따스하고 아늑한 침대에서 밤새 숙면을 취해 기력을 안전 환수합니다.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center w-full">
                    <span className="text-[8.5px] font-mono font-bold text-zinc-500 uppercase">무료 (0 G)</span>
                    <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      기력 +70 복원
                    </span>
                  </div>
                </button>

                {/* Home Option 2: Special Herbal Tea */}
                <button
                  disabled={gold < 1500}
                  onClick={handleHomeTea}
                  className="p-3 bg-zinc-900 hover:bg-zinc-850 disabled:opacity-40 border border-zinc-850 rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5">
                      <span>🍵 한방 특효 마제 차 복용</span>
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-1 lines-2 leading-relaxed">
                      고급 가습 마정석 약초를 뜨겁게 우려내어, 막혀있던 경혈과 누적 독소를 고속 분쇄합니다.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center w-full">
                    <span className="text-[8.5px] font-mono font-bold text-yellow-500 font-extrabold">1,500 G 소모</span>
                    <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      기력 +75 대폭 회복
                    </span>
                  </div>
                </button>

              </div>
            </div>
          )}

          {selectedDest === 'job' && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              {JOB_ACTIVITIES.map((act) => (
                <button
                  key={act.id}
                  disabled={fatigue < act.fatigueCost}
                  onClick={() => executeCoreAction(act.id)}
                  className="p-3.5 bg-zinc-950 hover:bg-zinc-855 disabled:bg-zinc-950 disabled:opacity-40 border border-zinc-850 rounded-xl text-left flex justify-between items-center transition-all cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-yellow-500 text-xs md:text-sm">{act.name}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5 font-mono truncate">{act.description}</div>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded shrink-0">
                    {act.calculateRewardPreview(stats)}
                  </span>
                </button>
              ))}
              
              {fatigue < 25 && (
                <div className="text-rose-450 text-[10.5px] font-semibold text-center mt-1.5 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20">
                  ⚠️ 피로도 부족 (25 미만): 특별 일용직 계약 승인이 비활성화되었습니다.
                </div>
              )}
            </div>
          )}

          {selectedDest === 'store' && (() => {
            const shopItems = inventory.filter(item => !item.purchased && isShopItem(item.id));
            const slotNamesKo: Record<string, string> = {
              head: '머리 장비',
              torso: '몸통 갑옷',
              arms: '팔 보호구',
              legs: '신발 장화',
              weapon: '주무기 단검/대검',
              ring: '마력 반지',
              necklace: '목걸이 펜던트',
              skillbook: '스킬북 (스킬 전수)',
            };

            const handleBuyProduct = (item: Equipment) => {
              if (gold < item.price) {
                alert('🪙 소지하신 골드가 부족하여 기밀 장비를 구매할 수 없습니다! 알바 분류소를 통해 자금을 더 두텁게 확보하십시오.');
                return;
              }
              setGold(prev => prev - item.price);
              setInventory(prev => prev.map(i => i.id === item.id ? { ...i, purchased: true } : i));
              setNarrativeFeedback(`🪙 홍대 기밀 상가에서 [${item.name}]을(를) 성공적으로 구매하였습니다!\n가방 인벤토리(하단 보랏빛 가방 아이콘)를 열고 즉각 영구 장착 또는 스킬 습득을 해보십시오.`);
              setSelectedDest(null);
            };

            return (
              <div className="flex flex-col gap-3 animate-fadeIn bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                <div className="text-[11px] font-bold text-violet-400 font-mono tracking-widest uppercase border-b border-zinc-900 pb-1.5 flex items-center justify-between">
                  <span>🏪 홍대 기밀 암시장 무기 상점 (HONGDAE BLACK SHOP)</span>
                  <span className="text-yellow-500 font-bold">🪙 {gold.toLocaleString()} G</span>
                </div>
                
                <p className="text-[10.5px] text-zinc-400 leading-normal font-sans mb-1 break-keep">
                  이곳은 수도권 헌터들을 위해 국외 밀수입 사양이나 기본 급수의 안전 인증 장비 및 기초 스킬북만을 한정 거래 조율합니다. <span className="text-violet-400 font-bold">고성능 상급 유물(S, A, B급)이나 강력한 특수 비급 스킬서들은 여기 존재하지 않으며, 상급 게이트 분쇄 완료 시 전리품 상자에서만 극비 회수할 수 있습니다.</span>
                </p>

                {shopItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                    {shopItems.map(item => {
                      const bonusEntries = Object.entries(item.bonuses);
                      return (
                        <div key={item.id} className="p-3 bg-zinc-900/80 border border-zinc-850/80 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-violet-500/30 transition-colors">
                          <div className="flex-1 min-w-0 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-violet-400 border border-zinc-850 uppercase">
                                {slotNamesKo[item.slot] || item.slot}
                              </span>
                              <h4 className="font-bold text-zinc-150 text-xs md:text-sm truncate">{item.name}</h4>
                            </div>
                            
                            <p className="text-[10px] text-zinc-500 mt-1 lines-2 font-sans leading-relaxed break-keep">
                              {item.description}
                            </p>

                            {/* Stat bonuses preview */}
                            {bonusEntries.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {bonusEntries.map(([stat, val]) => {
                                  const statNames: Record<string, string> = {
                                    strength: '근력', agility: '민첩', health: '체력', intellect: '지력'
                                  };
                                  return (
                                    <span key={stat} className="text-[9px] font-mono px-1.5 py-0.2 bg-zinc-950 rounded text-zinc-400 border border-zinc-900">
                                      {statNames[stat] || stat} +{val}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex sm:flex-col justify-between items-center sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-zinc-850 pt-2 sm:pt-0">
                            <span className="font-mono text-xs font-bold text-yellow-500">
                              🪙 {item.price.toLocaleString()} G
                            </span>
                            <button
                              onClick={() => handleBuyProduct(item)}
                              className="px-3.5 py-1.5 bg-violet-950 hover:bg-violet-900 hover:text-zinc-100 border border-violet-850 hover:border-violet-500 text-violet-400 text-[10px] font-black rounded-lg transition-all cursor-pointer active:scale-95"
                            >
                              구매 전송
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-zinc-900 border border-zinc-850 rounded-2xl">
                    <Store className="w-8 h-8 text-zinc-650 mx-auto opacity-40 mb-2 animate-bounce-slow" />
                    <p className="text-zinc-400 font-bold text-xs font-sans">상점 매진 완료 (Sold Out)</p>
                    <p className="text-[10px] text-zinc-500 mt-1 font-sans">상점 내부의 모든 기초 수입 물품이 소진되었습니다! 고대 균열 게이트 정벌을 통해 무적 유물들을 습득해 내십시오.</p>
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      ) : (
        /* HOLOGRAPHIC TACTICAL MAP DISPLAY (Visual-first Seoul Grid Map) */
        <div id="seoul-holo-map" className="flex-1 flex flex-col p-4 bg-zinc-950 border border-zinc-850 rounded-2xl relative overflow-hidden min-h-[300px] shadow-2xl shrink-0">
          {/* Neon blue ambient light projection */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Tactical grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none"></div>

          {/* Radar scanline sweep */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/5 to-blue-500/0 h-1/2 w-full animate-[bounce_5s_infinite] pointer-events-none"></div>

          {/* Holographic SATELLITE IMAGE AND PATHS (Han River SVG) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none overflow-hidden">
            <svg className="w-full h-full min-w-[340px] max-h-[220px]" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Han River (Glowing neon cyan path) */}
              <path d="M 0 100 C 50 120, 100 80, 160 110 C 220 140, 280 90, 340 120 C 370 135, 400 110, 400 110" stroke="#06b6d4" strokeWidth="4" className="animate-pulse" strokeLinecap="round" />
              <path d="M 0 100 C 50 120, 100 80, 160 110 C 220 140, 280 90, 340 120 C 370 135, 400 110, 400 110" stroke="#0ea5e9" strokeWidth="1" strokeLinecap="round" />
              
              {/* Tactical grid circles */}
              <circle cx="200" cy="100" r="80" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx="200" cy="100" r="50" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="1 4" />
              <circle cx="200" cy="100" r="20" stroke="#3b82f6" strokeWidth="0.5" />
              
              {/* Coordinate axis */}
              <line x1="200" y1="0" x2="200" y2="200" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Map Header */}
          <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-2 z-10 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 font-extrabold">🖥️ SEOUL TACTICAL RADAR</span>
            </div>
            <button
              onClick={() => setMapModalOpen(true)}
              className="text-[9px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded cursor-pointer hover:bg-zinc-850 select-none shadow-sm flex items-center gap-1"
            >
              <span>⚙️ 상세 검색</span>
            </button>
          </div>

          {/* CENTERED TACTICAL MAP LAUNCHER */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 my-4 gap-3 animate-fadeIn">
            <div className="text-zinc-400 text-center text-[10.5px] md:text-xs font-sans px-4 select-none leading-relaxed">
              차원의 틈새와 도심 주요 활성 거점을 실시간 분석 중입니다. <br/>
              포탈 전송 좌표 선택 및 이동을 위해 가이드 맵을 가동하여 주십시오.
            </div>
            
            <button
              onClick={() => setMapModalOpen(true)}
              className="px-6 py-3 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 text-xs font-bold rounded-2xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98] cursor-pointer tracking-wider flex items-center gap-2 select-none uppercase hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4 animate-spin-[20s_linear_infinite] text-cyan-400" />
              <span>🗺️ 서울 차원 이동 지도 열기</span>
            </button>
            
            {/* Active alerts inside HUD */}
            <div className="flex flex-wrap gap-1.5 justify-center max-w-sm mt-1 px-4">
              {showGeumSpecialAlert && (
                <span className="text-[8.5px] font-sans bg-amber-500/10 text-amber-400 border border-amber-550/20 px-2 py-0.5 rounded-lg animate-pulse flex items-center gap-1 font-bold">
                  <span>✨ 서울역 (금채란 대기)</span>
                </span>
              )}
              {showBaekSpecialAlert && (
                <span className="text-[8.5px] font-sans bg-blue-500/10 text-blue-400 border border-blue-550/20 px-2 py-0.5 rounded-lg animate-pulse flex items-center gap-1 font-bold">
                  <span>✨ 강남 (백운혁 대기)</span>
                </span>
              )}
              {showLimSpecialAlert && (
                <span className="text-[8.5px] font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-555/20 px-2 py-0.5 rounded-lg animate-pulse flex items-center gap-1 font-bold">
                  <span>✨ 건대 (임소연 대기)</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-2.5 border-t border-zinc-900 pt-2 text-center text-[9.5px] text-zinc-500 font-mono z-10 shrink-0">
            🎯 서울 도심 행선지 (가동 지도 버튼을 터치하여 포탈 간이 전송)
          </div>
        </div>
      )}

      {/* RECRUITS METERS HUD SUMMARY REMOVED AS REQUESTED TO REDUCE CLUTTER */}

      {/* MAP FLOATING INTERACTIVE MODAL */}
      <AnimatePresence>
        {mapModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl relative max-h-[92vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-3.5 bg-zinc-950 border-b border-zinc-850 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="font-bold font-mono text-xs uppercase text-zinc-200">서울 정밀 행선지 가이드 맵</span>
                </div>
                <button 
                  onClick={() => setMapModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-100 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: Grid List */}
              <div className="p-3.5 flex flex-col gap-2.5 overflow-y-auto max-h-[80vh] scrollbar-thin">
                
                {/* Destination 1: GANGNAM */}
                <button
                  onClick={() => {
                    handleDestinationAction('training');
                    setMapModalOpen(false);
                  }}
                  className="p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850/85 hover:border-blue-500/30 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <Dumbbell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs md:text-sm text-zinc-150 flex items-center gap-1.5">
                      <span>강남 공인 수련관 (Gangnam)</span>
                      <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1 py-0.2 rounded font-extrabold uppercase">STATS</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 break-keep line-clamp-1">근력, 민첩, 마력, 지격 수치를 연마하여 한계 전복</p>
                  </div>
                </button>

                {/* Destination 2: SEOUL STATION */}
                <button
                  onClick={() => {
                    handleDestinationAction('recovery');
                    setMapModalOpen(false);
                  }}
                  className="p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-emerald-500/30 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <Smile className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs md:text-sm text-zinc-150 flex items-center gap-1.5">
                      <span>서울역 메디컬 회복실 (Seoul St.)</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-extrabold uppercase">HEAL</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 break-keep line-clamp-1">모든 다친 상흔 부위 완치 및 피로도 대단량 하락</p>
                  </div>
                </button>

                {/* Destination 3: KONKUK UNIVERSITY */}
                <button
                  onClick={() => {
                    handleDestinationAction('job');
                    setMapModalOpen(false);
                  }}
                  className="p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-amber-500/30 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <Coins className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs md:text-sm text-zinc-150 flex items-center gap-1.5">
                      <span>건대입구 지정 알바소 (Konkuk)</span>
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded font-extrabold uppercase">GOLD</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 break-keep line-clamp-1">보급 및 가열 분류 하역을 마쳐 소정 자산 축적</p>
                  </div>
                </button>

                {/* Destination 4: HONGDAE */}
                <button
                  onClick={() => {
                    handleDestinationAction('store');
                    setMapModalOpen(false);
                  }}
                  className="p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-violet-500/30 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <Store className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs md:text-sm text-zinc-150 flex items-center gap-1.5">
                      <span>기밀 무기 상가 (Hongdae)</span>
                      <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 px-1 py-0.2 rounded font-extrabold uppercase">SHOP</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 break-keep line-clamp-1">희귀 및 가위 전용 기초 장비·스킬북을 취급하는 정밀 암거래 상점</p>
                  </div>
                </button>

                {/* Destination 5: HOME (안전가옥) */}
                <button
                  onClick={() => {
                    handleDestinationAction('home');
                    setMapModalOpen(false);
                  }}
                  className="p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-amber-500/30 rounded-xl flex items-center gap-3.5 text-left transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <Home className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs md:text-sm text-zinc-150 flex items-center gap-1.5 flex-wrap">
                      <span>아공간 보안 안전가옥 (Home)</span>
                      <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded font-extrabold uppercase font-black">HOUSE</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 break-keep line-clamp-1">골드 소모 없이 쾌적한 암막 숙면을 통해 기력 +70 회복</p>
                  </div>
                </button>

              </div>
              
              <div className="p-3 bg-zinc-950 border-t border-zinc-850 text-center text-[10px] text-zinc-500">
                * 지도 개방 시 해당 페이즈 고유 차원 변이 연동율이 소폭 가산됩니다.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
