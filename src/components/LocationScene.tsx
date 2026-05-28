/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Npc, CharacterStats, BodyPartsHP } from '../types';
import { 
  Dumbbell, Heart, Coins, Store, Sparkles, Smile, MapPin, 
  MessageCircle, Coffee, Compass, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TRAINING_ACTIVITIES, 
  RECOVERY_ACTIVITIES, 
  JOB_ACTIVITIES, 
  NPC_EVENTS, 
  NpcChoice,
  NpcEvent
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
}

type DestinationType = 'training' | 'recovery' | 'job' | 'store';

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
  dDay
}: LocationSceneProps) {
  const [selectedDest, setSelectedDest] = useState<DestinationType | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState<boolean>(false);
  const [activeNpcEvent, setActiveNpcEvent] = useState<{
    npc: Npc;
    dialogue: string;
    choices: NpcChoice[];
  } | null>(null);

  const [narrativeFeedback, setNarrativeFeedback] = useState<string | null>(null);

  // Urgency thresholds for D-Day
  const isSlightlyRed = dDay <= 50 && dDay > 30;
  const isModeratelyRed = dDay <= 30 && dDay > 10;
  const isCriticallyRed = dDay <= 10;

  // Dynamic Title & Description based on dDay and phase
  let defaultTitle = '세상이 S급 각성자의 길을 묻습니다';
  let defaultDesc = '체계적인 한계 매니지먼트만이 100일 뒤 출현할 서울 종말 급 가야 게이트 소멸의 진실을 푸는 전조가 됩니다.';

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
        mana: prev.mana + (choice.statChange?.mana || 0),
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

    setNarrativeFeedback(choice.reply);
    setActiveNpcEvent(null);
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
        mana: prev.mana + (trainingAct.statBonus.mana || 0),
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

    setNarrativeFeedback(msg);
    onAdvancePhase();
  };

  return (
    <div className={`flex flex-col flex-1 p-3 md:p-4 gap-3 text-zinc-100 overflow-y-auto text-sm max-h-full relative scrollbar-thin transition-colors duration-1000 ${
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
            {!selectedDest && defaultTitle}
          </h3>
          <p className="text-[10px] md:text-xs text-zinc-400 font-sans leading-normal break-keep">
            {selectedDest === 'training' && '근지구력 가중 모래주머니와 특수 마정석 가상 훈련단이 상시 교전 준비 및 배치되어 있습니다.'}
            {selectedDest === 'recovery' && '특수 수화 요실 정화 팩과 요양용 캡슐 안치실이 가동되어 전신 상흔 완치를 보조합니다.'}
            {selectedDest === 'job' && '긴급 수송용 보급 분류 야간 알바를 소정 교대해 위험 합의금을 실시간 정산 수호합니다.'}
            {!selectedDest && defaultDesc}
          </p>
        </div>
      </div>

      {/* ACTIVE EVENTS OR INTERACTIVE CHOICE BLOCK */}
      {activeNpcEvent ? (
        /* S-CLASS NPC EVENT DIALOGUE CARDS */
        <div className="p-4 bg-zinc-900 border-2 border-blue-500/30 rounded-2xl flex flex-col gap-3 relative shadow-2xl">
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
          <div className="bg-zinc-850/50 p-3.5 rounded-xl border border-zinc-800/40 text-zinc-200 italic text-xs leading-relaxed font-sans break-keep">
            {activeNpcEvent.dialogue}
          </div>

          <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-2.5">
            {activeNpcEvent.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceSelect(choice)}
                className="p-2.5 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-left font-sans text-xs text-zinc-300 font-semibold leading-normal transition-all active:scale-95 cursor-pointer"
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      ) : narrativeFeedback ? (
        /* STANDARD DIALOGUE OUTCOME FEEDBACK VIEW */
        <div className="p-4 bg-zinc-900 border border-zinc-800/80 rounded-2xl flex flex-col gap-3 relative shadow-lg">
          <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest block mb-0.5">▲ 활동 섭렵 및 경계 로그</span>
          <div className="bg-zinc-950/60 p-3.5 rounded-xl text-xs text-zinc-200 border border-zinc-850 leading-relaxed break-keep font-sans">
            {narrativeFeedback}
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
                <div className="text-rose-455 text-[10px] font-bold text-center mt-1 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  ⚠️ 피로도(에너지)가 한계(15 미만)에 이르러 훈련에 임할 수 없습니다. 즉각 휴식을 취하셔야 합니다.
                </div>
              )}
            </div>
          )}

          {selectedDest === 'recovery' && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              {RECOVERY_ACTIVITIES.map((act) => (
                <button
                  key={act.id}
                  onClick={() => executeCoreAction(act.id)}
                  className="p-3.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-xl text-left flex justify-between items-center transition-all cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-emerald-400 text-xs md:text-sm">{act.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{act.description}</div>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded shrink-0">{act.rewardPreview}</span>
                </button>
              ))}
            </div>
          )}

          {selectedDest === 'job' && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              {JOB_ACTIVITIES.map((act) => (
                <button
                  key={act.id}
                  disabled={fatigue < act.fatigueCost}
                  onClick={() => executeCoreAction(act.id)}
                  className="p-3.5 bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-950 disabled:opacity-40 border border-zinc-850 rounded-xl text-left flex justify-between items-center transition-all cursor-pointer"
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
                <div className="text-rose-455 text-[10px] text-center font-bold mt-1 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  ⚠️ 피로도(에너지)가 부족(25 미만)하여 헌터 특별 계약에 불허 처리되었습니다. 수면이나 요양이 권장됩니다.
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* MAP BUTTON DISPLAY (Brutalist military radar design) */
        <div className="flex-1 flex flex-col justify-center items-center p-5 bg-zinc-900/30 border border-zinc-850 rounded-2xl relative overflow-hidden min-h-[160px] shadow-inner gap-3 shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Radar scanning line effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.3)] animate-pulse pointer-events-none"></div>

          <div className="text-center flex flex-col items-center gap-1.5 max-w-xs z-10">
            <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center shadow-lg relative shrink-0">
              <Compass className="w-5 h-5 text-blue-400 animate-spin-slow" />
              <span className="absolute inset-0 rounded-full border border-dashed border-blue-500/20 animate-ping"></span>
            </div>
            <h4 className="font-bold text-xs text-zinc-200 mt-1 uppercase tracking-wider">서울 도심 및 안전 차원 정보</h4>
            <p className="text-[10px] text-zinc-500 break-keep leading-relaxed px-2">
              강남, 서울역, 건대 등 각지의 균열 및 수련 상태가 확보되었습니다. 작전 지도를 열어 경로를 지시하십시오.
            </p>
          </div>

          <button
            onClick={() => setMapModalOpen(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-900/15 relative overflow-hidden transition-all shrink-0"
          >
            <span>🗺️ 서울 작전 지도 개방</span>
          </button>
        </div>
      )}

      {/* RECRUITS METERS HUD SUMMARY */}
      <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl mt-auto shrink-0 flex flex-col gap-2 shadow-sm">
        <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-widest">👥 동맹 가입 상태 및 호감 지수</span>
        
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {npcs.map((n) => {
            return (
              <div key={n.id} className="flex-1 min-w-[90px] flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-850/70">
                <span className="text-sm bg-zinc-900 p-1.5 rounded-lg border border-zinc-800 leading-none">{n.avatarUrl}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[10px] text-zinc-300 truncate">{n.name}</div>
                  <div className="flex items-center gap-0.5 text-[10px] text-blue-400 mt-0.5 font-mono font-bold">
                    <Heart className="w-3 h-3 fill-blue-500 stroke-none" />
                    <span>{n.rapport}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                    setMapModalOpen(false);
                    setNarrativeFeedback('💻 S급 헌터 협회 승급 보석 상거래는 가설상 스마트폰 [SMARTPHONE App] 하위 탭의 네번째 "상점" 아이콘을 터치하여 주십시오. 낡은 방어구 및 개방 마석을 즉각 거래하실 수 있습니다!');
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
                    <p className="text-[10px] text-zinc-500 mt-0.5 break-keep line-clamp-1">승급 전용 장비를 스마트폰 상점에서 업그레이드</p>
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
