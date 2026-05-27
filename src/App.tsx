/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Dungeon, Equipment, Npc, BodyPartsHP, ChatHistory, CharacterStats 
} from './types';
import { 
  INITIAL_NPCS, INITIAL_EQUIPMENT, DUNGEONS, ACHIEVEMENTS, 
  INITIAL_CHAT_HISTORY, FAIL_LOGS, generateRandomDungeonsList
} from './data';
import DungeonPlay from './components/DungeonPlay';
import PhoneModal from './components/PhoneModal';
import GameIntro from './components/GameIntro';
import LocationScene from './components/LocationScene';
import { 
  Smartphone, Award, Heart, HelpCircle, Shield, Sparkles, 
  Settings, Zap, Swords, RotateCcw, AlertTriangle, ShieldCheck, Gamepad2, FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import logoImg from '../images/Logo.png';

export default function App() {
  // Game state
  const [playerName, setPlayerName] = useState<string>('유저');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [introActive, setIntroActive] = useState<boolean>(false);
  const [loopCount, setLoopCount] = useState<number>(1);
  const [dDay, setDDay] = useState<number>(100); // 100 days to grow and defeat
  const [phaseIndex, setPhaseIndex] = useState<number>(0); // 0: 아침, 1: 점심, 2: 저녁
  const phases = ['아침', '점심', '저녁'];

  // Currency & Health
  const [gold, setGold] = useState<number>(20000);
  const [fatigue, setFatigue] = useState<number>(100); // starts at 100 max
  const [hasSave, setHasSave] = useState<boolean>(false);
  
  // Attributes
  const [stats, setStats] = useState<CharacterStats>({
    strength: 6,
    agility: 6,
    mana: 6,
    intellect: 6
  });

  // Body Parts HP (Head, Torso are instant death if 0)
  const [bodyPartsHP, setBodyPartsHP] = useState<BodyPartsHP>({
    head: 100,
    torso: 100,
    leftArm: 100,
    rightArm: 100,
    leftLeg: 100,
    rightLeg: 100
  });

  // Database lists
  const [npcs, setNpcs] = useState<Npc[]>(INITIAL_NPCS);
  const [inventory, setInventory] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [chatHistory, setChatHistory] = useState<ChatHistory>(INITIAL_CHAT_HISTORY);
  
  // Custom states
  const [recordCount, setRecordCount] = useState<number>(0); // count of loop records collected (0 - 6)
  const [activeDungeon, setActiveDungeon] = useState<Dungeon | null>(null);
  const [availableDungeons, setAvailableDungeons] = useState<Dungeon[]>([]);
  const [phoneOpen, setPhoneOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [endingType, setEndingType] = useState<'dead' | 'world_destroyed' | 'normal' | 'happy' | null>(null);

  // Loop inheritance bonuses when player rewinds/dies
  const [inheritedLevelMultiplier, setInheritedLevelMultiplier] = useState<number>(0);

  // Sound/Mute preference
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Log summary
  const [lobbyFeedback, setLobbyFeedback] = useState<string>('오늘 하루도 무사히 각성하여 성장하십시오.');

  // Save/Load System
  const saveGameStateReal = (override?: { dDay?: number; phaseIndex?: number; fatigue?: number }) => {
    try {
      const stateToSave = {
        playerName,
        gameStarted: true,
        introActive: false,
        loopCount,
        dDay: override && override.hasOwnProperty('dDay') ? override.dDay : dDay,
        phaseIndex: override && override.hasOwnProperty('phaseIndex') ? override.phaseIndex : phaseIndex,
        gold,
        fatigue: override && override.hasOwnProperty('fatigue') ? override.fatigue : fatigue,
        stats,
        bodyPartsHP,
        npcs,
        inventory,
        chatHistory,
        recordCount,
        availableDungeons,
        inheritedLevelMultiplier,
        lobbyFeedback,
      };
      localStorage.setItem('hunter_f_save_state', JSON.stringify(stateToSave));
      setHasSave(true);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const loadGameState = () => {
    try {
      const raw = localStorage.getItem('hunter_f_save_state');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.playerName !== undefined) setPlayerName(data.playerName);
      if (data.loopCount !== undefined) setLoopCount(data.loopCount);
      if (data.dDay !== undefined) setDDay(data.dDay);
      if (data.phaseIndex !== undefined) setPhaseIndex(data.phaseIndex);
      if (data.gold !== undefined) setGold(data.gold);
      if (data.fatigue !== undefined) setFatigue(data.fatigue);
      if (data.stats !== undefined) setStats(data.stats);
      if (data.bodyPartsHP !== undefined) setBodyPartsHP(data.bodyPartsHP);
      if (data.npcs !== undefined) setNpcs(data.npcs);
      if (data.inventory !== undefined) setInventory(data.inventory);
      if (data.chatHistory !== undefined) setChatHistory(data.chatHistory);
      if (data.recordCount !== undefined) setRecordCount(data.recordCount);
      if (data.availableDungeons !== undefined) setAvailableDungeons(data.availableDungeons);
      if (data.inheritedLevelMultiplier !== undefined) setInheritedLevelMultiplier(data.inheritedLevelMultiplier);
      if (data.lobbyFeedback !== undefined) setLobbyFeedback(data.lobbyFeedback);
      
      setGameStarted(true);
      setIntroActive(false);
      setSettingsOpen(false);
      setLobbyFeedback(`📁 시공 보존 슬롯을 무사히 복구했습니다. (D-${data.dDay} ${phases[data.phaseIndex] || '아침'})`);
    } catch (e) {
      alert('⚠️ 세이브 파일 복구에 실패했습니다.');
    }
  };

  const resetGameState = () => {
    const confirmReset = window.confirm('⚠️ 경고! 전체 복구 기록 및 획득한 인과 데이터가 영구 말소되며 공인 초기화 상태로 복귀합니다. 정말 진행하시겠습니까?');
    if (!confirmReset) return;

    localStorage.removeItem('hunter_f_save_state');
    setPlayerName('유저');
    setGameStarted(false);
    setIntroActive(false);
    setLoopCount(1);
    setDDay(100);
    setPhaseIndex(0);
    setGold(20000);
    setFatigue(100);
    setStats({
      strength: 6,
      agility: 6,
      mana: 6,
      intellect: 6
    });
    setBodyPartsHP({
      head: 100,
      torso: 100,
      leftArm: 100,
      rightArm: 100,
      leftLeg: 100,
      rightLeg: 100
    });
    setNpcs(INITIAL_NPCS);
    setInventory(INITIAL_EQUIPMENT);
    setChatHistory(INITIAL_CHAT_HISTORY);
    setRecordCount(0);
    setActiveDungeon(null);
    setAvailableDungeons([]);
    setSettingsOpen(false);
    setHasSave(false);
    setLobbyFeedback('♻️ 시뮬레이터가 완치된 초기 각인 상태로 역행 설정되었습니다.');
  };

  // Check save on mount
  useEffect(() => {
    const save = localStorage.getItem('hunter_f_save_state');
    if (save) {
      setHasSave(true);
    }
  }, []);

  // Trigger automatic day pass if fatigue hits 0 (or goes <= 0)
  useEffect(() => {
    if (gameStarted && fatigue <= 0) {
      const nextDValue = Math.max(0, dDay - 1);
      setDDay(nextDValue);
      setPhaseIndex(0);
      setFatigue(50); // refills to 50 fatigue
      
      setLobbyFeedback('💤 극도의 신체 피색력 한계로 실신 수면에 빠졌습니다. 영양 주사로 회복 후 아침에 눈을 뜨며 피로도 50이 회복되었습니다.');

      // Refresh dungeons/daysLeft
      setAvailableDungeons(prevDungeons => {
        let updatedList = prevDungeons
          .map(d => ({ ...d, daysLeft: d.daysLeft ? d.daysLeft - 1 : 0 }))
          .filter(d => d.daysLeft !== undefined && d.daysLeft > 0);

        const elapsedDays = 100 - nextDValue;
        const maxSlots = Math.min(8, 3 + Math.floor(elapsedDays / 12));

        if (updatedList.length < maxSlots) {
          const needed = maxSlots - updatedList.length;
          const newDungeons = generateRandomDungeonsList(needed);
          return [...updatedList, ...newDungeons];
        }
        if (updatedList.length > maxSlots) {
          return updatedList.slice(0, maxSlots);
        }
        return updatedList;
      });

      // Auto save on fatigue exhaustion
      setTimeout(() => {
        saveGameStateReal({
          dDay: nextDValue,
          phaseIndex: 0,
          fatigue: 50
        });
      }, 100);
    }
  }, [fatigue, gameStarted]);

  // Trigger S-Class Rift gate final confrontation on D-0 automatically
  useEffect(() => {
    if (dDay <= 0 && gameStarted && !endingType) {
      // Find S Class final dungeon
      const finalGate = DUNGEONS.find(d => d.id === 'gate_s');
      if (finalGate) {
        setLobbyFeedback('⏱️ 운명의 D-DAY 완료! 가상의 S급 하늘 침공 성문이 활짝 열렸습니다. 격전지가 생성됩니다!');
        handleStartDungeon(finalGate);
      } else {
        setEndingType('world_destroyed');
      }
    }
  }, [dDay, gameStarted]);

  // Initialize dynamic dungeons pool on startup
  useEffect(() => {
    if (gameStarted) {
      setAvailableDungeons(generateRandomDungeonsList(3));
    }
  }, [gameStarted]);

  // Advance Phases morning -> lunch -> evening -> next D-Day
  const handleAdvancePhase = (clearedDungeonId?: string) => {
    let nextPhase = phaseIndex;
    let nextDDayVal = dDay;
    let nextFatigue = fatigue;

    setPhaseIndex(prev => {
      const nextIdx = prev + 1;
      if (nextIdx >= 3) {
        // Next day!
        nextDDayVal = Math.max(0, dDay - 1);
        nextPhase = 0;
        nextFatigue = 100; // Refill to 100 max
        setDDay(nextDDayVal);
        setFatigue(100);
        
        // Auto-save on day transition
        setTimeout(() => {
          saveGameStateReal({
            dDay: nextDDayVal,
            phaseIndex: 0,
            fatigue: 100
          });
          setLobbyFeedback(`💾 새로운 하루가 시작되어 임시 타임라인이 강제 자동 저장(Auto Save) 되었습니다. (D-${nextDDayVal})`);
        }, 100);

        return 0;
      }
      nextPhase = nextIdx;
      return nextIdx;
    });

    // Update availableDungeons state safely
    setAvailableDungeons(prevDungeons => {
      // 1. If a dungeon was cleared, remove it immediately
      let updatedList = clearedDungeonId 
        ? prevDungeons.filter(d => d.id !== clearedDungeonId)
        : prevDungeons;

      // 2. If transitioning from evening (2) to morning (0), decrement daysLeft and filter out expired dungeons
      if (phaseIndex === 2) {
        updatedList = updatedList
          .map(d => ({ ...d, daysLeft: d.daysLeft ? d.daysLeft - 1 : 0 }))
          .filter(d => d.daysLeft !== undefined && d.daysLeft > 0);
      }

      // Calculate capacity based on days elapsed (100 - expectedDDay)
      const prospectiveDDayVal = (phaseIndex === 2) ? Math.max(0, dDay - 1) : dDay;
      const elapsedDays = 100 - prospectiveDDayVal;
      const maxSlots = Math.min(8, 3 + Math.floor(elapsedDays / 12));

      // 3. Fill missing slots if current count is less than maxSlots
      if (updatedList.length < maxSlots) {
        const needed = maxSlots - updatedList.length;
        const newDungeons = generateRandomDungeonsList(needed);
        return [...updatedList, ...newDungeons];
      }

      // If slots exceed maxSlots, clip them to fit
      if (updatedList.length > maxSlots) {
        return updatedList.slice(0, maxSlots);
      }

      return updatedList;
    });
  };

  // Handle entering dungeon
  const handleStartDungeon = (dungeon: Dungeon) => {
    // Check if enough fatigue to enter dungeon
    if (fatigue < dungeon.fatigueCost) {
      alert(`⚠️ 진입 불가! 피로도(에너지: ${fatigue})가 요구치(${dungeon.fatigueCost})보다 부족합니다. 휴식 공간이나 수면 치료실을 경유하여 회복하십시오.`);
      return;
    }

    // Check Adequacy of requirements
    const totalCP = (stats.strength * 12) + (stats.agility * 8) + (stats.mana * 10) + (stats.intellect * 5);
    
    // Check Higher class entry penalty or warning
    if (totalCP < dungeon.recommendedPower && dungeon.id !== 'gate_s') {
      const confirmEntry = window.confirm(
        `🚨 위기 경보! 진입 예정인 [${dungeon.name}]의 권장 전투 수치(${dungeon.recommendedPower} CP)보다 귀하의 수치(${totalCP} CP)가 낮습니다. \n\n전투 시 머리나 몸통 HP가 고갈되면 즉사하며, 시공간 왜곡에 의해 모든 진행 상태가 긴급 강제 리셋 규약에 들어갑니다. 정말로 진입하시겠습니까?`
      );
      if (!confirmEntry) return;
    }

    // Spend fatigue for dungeon entry
    setFatigue(prev => Math.max(0, prev - dungeon.fatigueCost));

    setActiveDungeon(dungeon);
    setPhoneOpen(false);
    setLobbyFeedback(`💀 ${dungeon.name} 균열 내부에 돌입하였습니다. 좌표 오차를 추적하십시오!`);
  };

  // Complete dungeon handle
  const handleFinishDungeon = (success: boolean, loot: string[], logText: string) => {
    const clearedId = success && activeDungeon ? activeDungeon.id : undefined;
    setActiveDungeon(null);
    handleAdvancePhase(clearedId); // Consumes 1 phase and removes from pool if success

    if (success) {
      setLobbyFeedback(`🎉 게이트 정화 정밀 완료! 사소한 유산물 세관 처분으로 자금이 입금되었습니다.`);
      
      // If S class boss cleared
      if (activeDungeon?.id === 'gate_s') {
        if (recordCount >= 6) {
          setEndingType('happy');
        } else {
          setEndingType('normal');
        }
      }
    } else {
      setLobbyFeedback(`⚠️ 던전 탐색 중 무사히 후퇴 탈출하여 헌터 장비를 긴급 가동 정화하였습니다.`);
    }
  };

  // Die trigger
  const handleDie = () => {
    setActiveDungeon(null);
    setEndingType('dead');
  };

  // Rewind loop trigger
  const handleRewindLoop = () => {
    setLoopCount(prev => prev + 1);
    setDDay(100);
    setPhaseIndex(0);
    setGold(20000 + (loopCount * 3000)); // slightly more starting gold in higher loops
    setFatigue(100);

    // Inherited stats increment (gives real satisfaction and progressive rogue-lite fun!)
    setStats({
      strength: 6 + (loopCount * 3),
      agility: 6 + (loopCount * 3),
      mana: 6 + (loopCount * 2),
      intellect: 6 + (loopCount * 2)
    });

    // Reset body health
    setBodyPartsHP({
      head: 100,
      torso: 100,
      leftArm: 100,
      rightArm: 100,
      leftLeg: 100,
      rightLeg: 100
    });

    // Reset NPCs rapport slightly (save 30% of progress as memory retention)
    setNpcs(prev => prev.map(n => ({
      ...n,
      rapport: Math.min(100, Math.floor(n.rapport * 0.3) + 12),
      isAlly: false,
      unlocked: false // start as complete strangers in every loop
    })));

    setChatHistory(INITIAL_CHAT_HISTORY);

    setEndingType(null);
    setIntroActive(true); // show intro cinematic reflecting loop count
    setLobbyFeedback(`⏳ 끈질긴 영혼의 외침 속에 시간이 되감겼습니다... 억겁 #${loopCount+1}경로 돌입.`);
    setAvailableDungeons(generateRandomDungeonsList(3));
  };

  const handleCollectRecord = () => {
    setRecordCount(prev => Math.min(6, prev + 1));
  };

  const totalCP = (stats.strength * 12) + (stats.agility * 8) + (stats.mana * 10) + (stats.intellect * 5);

  return (
    <div className="w-full h-screen h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-0 md:p-6 overflow-hidden select-none font-sans relative">
      
      {/* Visual ambient gradients behind the mobile mockup */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent pointer-events-none z-0"></div>

      {/* COMPACT BUT SPACIOUS RESPONSIVE DECK LAYOUT */}
      <motion.div 
        id="game-mobile-device"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl md:max-w-4xl lg:max-w-5xl w-full h-full md:h-[90vh] md:max-h-[840px] bg-zinc-900 border-none md:border md:border-zinc-800/80 rounded-none md:rounded-3xl overflow-hidden shadow-2xl shadow-black relative flex flex-col z-10 select-none"
      >

        {/* 1. STATE SCREEN: INITIAL LANDING MENU */}
        {!gameStarted && (
          <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col justify-between p-6 md:p-10 overflow-hidden">
            
            {/* Visual game title */}
            <div className="flex-grow flex flex-col justify-center items-center gap-4 mt-6 md:mt-10">
              <div className="relative max-w-[380px] sm:max-w-[460px] md:max-w-[500px] w-full aspect-square flex items-center justify-center">
                {/* Clean soft ambient glow behind the logo */}
                <div className="absolute inset-4 rounded-full bg-blue-500/10 blur-2xl animate-pulse"></div>
                <img 
                  src={logoImg} 
                  alt="등급 보류 : F급 헌터" 
                  referrerPolicy="no-referrer"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-[0_0_35px_rgba(59,130,246,0.2)]"
                />
              </div>

              {/* Name custom inputs */}
              <div className="w-full max-w-sm mt-8 flex flex-col gap-2">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest pl-1">헌터 신원 기재 (이름)</label>
                <input 
                  type="text" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.slice(0, 10))}
                  placeholder="헌터 이름을 기재하세요..."
                  className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 hover:border-zinc-700 focus:border-blue-500 rounded-xl p-4 text-sm text-center focus:outline-none font-sans font-bold shadow-inner transition-colors"
                />
              </div>
            </div>

            {/* Launch Action */}
            <div className="mb-6 flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
              <button
                onClick={() => {
                  setGameStarted(true);
                  setIntroActive(true);
                }}
                className="w-full py-4.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <Gamepad2 className="w-5 h-5 text-zinc-950" />
                <span>등급 측정</span>
              </button>

              {hasSave && (
                <button
                  onClick={loadGameState}
                  className="w-full py-4.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-blue-400 hover:text-blue-300 font-bold rounded-xl active:scale-95 transition-all text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                >
                  <FolderOpen className="w-5 h-5" />
                  <span>저장된 기록 불러오기</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. STATE SCREEN: PLOT STORY INTROS */}
        {gameStarted && introActive && (
          <GameIntro 
            loopCount={loopCount} 
            onStartGame={() => setIntroActive(false)} 
          />
        )}

        {/* 3. STATE SCREEN: ACTIVE DUNGEON PLAY */}
        {gameStarted && !introActive && activeDungeon && (
          <DungeonPlay
            dungeon={activeDungeon}
            stats={stats}
            bodyPartsHP={bodyPartsHP}
            setBodyPartsHP={setBodyPartsHP}
            gold={gold}
            setGold={setGold}
            fatigue={fatigue}
            setFatigue={setFatigue}
            allies={npcs}
            inventory={inventory}
            onFinishDungeon={handleFinishDungeon}
            onDie={handleDie}
            onCollectRecord={handleCollectRecord}
          />
        )}

        {/* 4. STATE SCREEN: ENCOUNTERED DEFEAT/DEAD LIMIT (Rewind Loop) */}
        {gameStarted && !introActive && endingType && (
          <div className="absolute inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 md:p-10 overflow-hidden">
            
            <div className="flex-grow flex flex-col justify-center items-center gap-5 text-center mt-8 pb-6">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] text-3xl animate-bounce">
                🚨
              </div>
              
              {endingType === 'dead' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs md:text-sm font-mono text-red-500 uppercase tracking-widest font-bold">TIMELINE COMPROMISED</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-display italic text-zinc-150 uppercase tracking-tight">치명적 파트 붕괴: 즉사 판정</h2>
                  <p className="text-sm md:text-base text-zinc-350 font-medium leading-relaxed font-sans px-4 mt-2 max-w-xl break-keep">
                    전투 중 <strong>머리(Head)</strong> 혹은 <strong>몸통(Torso)</strong>의 체력 파괴 상태를 수호하지 못해 호흡을 임종당했습니다. 시공 인자가 파쇄되며 현재 회차는 소멸 완료 처리되었습니다.
                  </p>
                </div>
              )}

              {endingType === 'world_destroyed' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs md:text-sm font-mono text-red-500 uppercase tracking-widest font-bold">D-0 SURRENDER</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-display italic text-zinc-150 uppercase tracking-tight">게이트 폭사: 서울 침공 멸망</h2>
                  <p className="text-sm md:text-base text-zinc-350 font-medium leading-relaxed font-sans px-4 mt-2 max-w-xl break-keep">
                    100일 한계 카운트다운에 임했으나, 게이트의 심장 코어를 괴멸할 마력 역량이 부족했습니다. 서울 하늘이 핏빛 덮개로 암도되어 지구 전체가 산산조각 납니다.
                  </p>
                </div>
              )}

              {endingType === 'normal' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs md:text-sm font-mono text-amber-500 uppercase tracking-widest font-bold">NORMAL ENDING</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-display italic text-amber-500 uppercase tracking-tight">조율된 불신의 방벽: 노말 엔딩</h2>
                  <p className="text-sm md:text-base text-zinc-350 font-medium leading-relaxed font-sans px-4 mt-2 max-w-xl break-keep">
                    S급 게이트를 섬멸하여 서울의 즉각적인 멸망은 긴밀히 연장되었습니다! 전 세계 각성자 협회는 위선적인 칭송을 보냅니다... <br/><br/>
                    그러나 온전한 인과 교정의 단서인 <strong>6개의 "기밀 데이터 노드"</strong>를 완벽히 취합하지 못해, 잔류하는 게이트의 시공 가중치가 다시 뒤틀리며 아득히 먼 새벽, 100일 전 침공 시작 시점으로 강제 대역 회귀됩니다!
                  </p>
                </div>
              )}

              {endingType === 'happy' && (
                <div className="flex flex-col gap-4 w-full max-w-2xl px-4">
                  <div className="flex flex-col gap-3 p-6 border border-blue-500/30 bg-zinc-900 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] break-keep">
                    <span className="text-xs md:text-sm font-mono text-blue-400 uppercase tracking-widest font-bold">TRUE HAPPY ENDING</span>
                    <h2 className="text-xl md:text-2xl font-extrabold font-display italic text-blue-400 flex items-center justify-center gap-1.5 uppercase tracking-tight">
                      <ShieldCheck className="w-6 h-6 text-blue-400 animate-pulse" />
                      인과율 전복 성역 달성: 트루 엔딩
                    </h2>
                    <p className="text-sm md:text-base text-zinc-300 font-medium leading-relaxed font-sans px-2 mt-2">
                      S급 게이트 심장에서 마력 파동을 개방하는 순간, 아군 S급 Recruit 동료들의 연합과 미리 수집해 둔 <strong>6개의 전생 조각</strong>이 정교한 수식으로 연계되었습니다! <br/><br/>
                      당신은 이 영겁의 무한 루프 시스템을 직접 프로그래밍해 둔 장본인이 먼 미래의 자신이었음을 해독해 냈고, 백도어로 시스템 근원핵을 영구 분쇄했습니다. 지구는 100일 종말에서 온전히 해방되었습니다!
                    </p>
                  </div>

                  {/* Fully Unmasked 6 Memories of the Soul */}
                  <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto p-4 border border-zinc-850 bg-zinc-950/80 rounded-2xl text-left shadow-inner">
                    <span className="text-[11px] font-mono font-bold text-amber-400 px-1 tracking-wider uppercase block my-1">
                      🌌 완전히 언해킹 및 복원된 수천 생애의 영혼 기억 편린 (Memory Logs Unmasked)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      {FAIL_LOGS.map((log) => (
                        <div key={log.id} className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                          <div className="flex justify-between items-center mb-1.5 border-b border-zinc-800 pb-1">
                            <span className="text-xs font-bold text-blue-400 font-mono tracking-tight">{log.trueTitle}</span>
                            <span className="text-[9px] text-zinc-500 font-mono font-bold">NODE_0{log.id}</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium break-keep">
                            {log.trueText}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loop Inherit reward summary for dead / reset */}
              {(endingType === 'dead' || endingType === 'world_destroyed' || endingType === 'normal') && (
                <div className="mt-5 p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-xs md:text-sm font-mono text-blue-400 text-left max-w-md">
                  <span className="text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider text-[11px] md:text-xs">🎁 영령 자취 되감기 피드백 보정:</span>
                  • 아침 점심 저녁 100일 타임라인 되감기<br/>
                  • <span className="text-zinc-200 font-bold">다음 회차 모든 초기 스탯 영구 보정치 +3 가산</span><br/>
                  • 복구 완료된 기록 파편 인덱스 데이터 영속 보존
                </div>
              )}
            </div>

            <div className="mb-6 flex flex-col items-center gap-3">
              {(endingType === 'dead' || endingType === 'world_destroyed' || endingType === 'normal') ? (
                <button
                  onClick={handleRewindLoop}
                  className="w-full max-w-sm py-4 bg-zinc-100 text-zinc-950 font-extrabold rounded-xl active:scale-95 hover:bg-zinc-200 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/30 animate-pulse cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5 text-zinc-950" />
                  <span>인과의 고리 감아쥐기 (되감기)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setGameStarted(false);
                    setEndingType(null);
                    setRecordCount(0);
                  }}
                  className="w-full max-w-sm py-4 bg-zinc-100 text-zinc-950 font-extrabold rounded-xl active:scale-95 hover:bg-zinc-200 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/30 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5 text-zinc-950" />
                  <span>영광스러운 새 삶 시작 (리셋)</span>
                </button>
              )}
              
              <span className="text-xs text-zinc-500 font-mono">
                인과 연산 동조율 수준: STAGE_V{loopCount}.0
              </span>
            </div>

          </div>
        )}

        {/* 5. PHONE OVERLAY STATUS APP (System: 100 app overlay) */}
        {gameStarted && !introActive && phoneOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
            <motion.div 
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="max-w-sm w-full aspect-[9/19] h-[90vh] max-h-[780px] bg-zinc-900 border-[6px] border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black relative flex flex-col z-50 select-none border-t-[10px]"
            >
              {/* UPPER NOTCH BAR DEVICE DECORATIVE HEADER */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-950 rounded-b-xl z-55 flex items-center justify-center gap-1.5 border-x border-b border-zinc-800/80">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                <div className="w-10 h-0.5 bg-zinc-800 rounded"></div>
              </div>
              
              <PhoneModal
                stats={stats}
                bodyPartsHP={bodyPartsHP}
                setBodyPartsHP={setBodyPartsHP}
                gold={gold}
                setGold={setGold}
                npcs={npcs}
                setNpcs={setNpcs}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                inventory={inventory}
                setInventory={setInventory}
                dungeons={availableDungeons}
                onStartDungeon={handleStartDungeon}
                loopCount={loopCount}
                recordCount={recordCount}
                onClose={() => setPhoneOpen(false)}
              />
              {/* Decorative Home Indicator phone button notch bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-800 rounded-full z-50"></div>
            </motion.div>
          </div>
        )}        {/* ===================== CORE WORKSPACE LAYOUT PANELS ===================== */}
        {/* UPPER DISPLAY BAR: STATUS, CODES, D-DAY AND RESOURCES */}
        <div className="p-3 px-4 md:p-5 md:px-6 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-2.5 md:gap-3 shrink-0">
          
          {/* Top Info status row */}
          <div className="flex justify-between items-center text-xs md:text-sm font-mono">
            {/* D-DAY Count marker - Sleek glowing blue/zinc theme instead of default red */}
            <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/25 px-3 py-1 text-blue-400 font-extrabold shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>D-{dDay}</span>
            </div>
            
            {/* Active Phase icons - Sleek zinc styling */}
            <div className="flex gap-1.5 items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
              {phases.map((p, idx) => {
                const isActive = phaseIndex === idx;
                return (
                  <span 
                    key={p} 
                    className={`px-3 py-1 text-xs rounded transition-all font-bold ${
                      isActive 
                        ? 'bg-zinc-100 text-zinc-950 shadow font-extrabold' 
                        : 'text-zinc-500 hover:text-zinc-400'
                    }`}
                  >
                    {p}
                  </span>
                );
              })}
            </div>

            {/* Settings trigger */}
            <button 
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="text-zinc-500 hover:text-zinc-200 transition-colors p-1.5 cursor-pointer bg-zinc-950/40 hover:bg-zinc-800 border border-zinc-800/60 rounded-lg"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Core Gauge panels row */}
          <div className="grid grid-cols-2 gap-3 mt-1 font-mono text-xs md:text-sm">
            {/* Fatigue gauge indicator */}
            <div className="p-2.5 px-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                피로도
              </span>
              <span className={`font-extrabold ${fatigue > 75 ? 'text-blue-400 animate-pulse' : 'text-zinc-100'}`}>
                {fatigue} / 100
              </span>
            </div>

            {/* Gold balance */}
            <div className="p-2.5 px-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-2">💰 골드</span>
              <span className="font-extrabold text-zinc-100">{gold.toLocaleString()} G</span>
            </div>
          </div>
        </div>

        {/* SETTINGS MODAL OVERLAY */}
        <AnimatePresence>
          {settingsOpen && (
            <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm bg-zinc-900 border border-zinc-805 rounded-2xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6"
              >
                {/* Header title */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <div className="flex flex-col">
                    <span className="text-zinc-100 font-extrabold text-sm tracking-wider flex items-center gap-2">
                      ⚙️ 시공 분석 및 시스템 설정
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Time preservation matrix</span>
                  </div>
                  <button 
                    onClick={() => setSettingsOpen(false)}
                    className="text-zinc-400 hover:text-zinc-200 font-bold text-xs p-1 px-2.5 bg-zinc-950/80 rounded border border-zinc-850 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Info summary */}
                <p className="text-[11px] leading-relaxed text-zinc-400 break-keep font-sans">
                  현재 진행 중인 헌터의 주파수 데이터 및 성장 기록을 저장하거나 원격 청소할 수 있습니다.
                </p>

                {/* CORE ACTIONS: SAVE & RESET */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      saveGameStateReal();
                      setLobbyFeedback('💾 진행 상태가 현재 타임라인에 완벽히 수동 저장되었습니다.');
                      setSettingsOpen(false);
                      alert('📁 [저장 완료]: 현재 진행 중인 상태가 완벽하게 저장되었습니다!');
                    }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition-all text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 font-mono"
                  >
                    <span>💾 진행 상황 영구 보존 (저장)</span>
                  </button>

                  <button
                    onClick={resetGameState}
                    className="w-full py-3.5 bg-rose-955 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 font-bold rounded-xl active:scale-95 transition-all text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 font-mono"
                  >
                    <span>♻️ 모든 시간선 해제 (완전 초기화)</span>
                  </button>
                </div>

                <div className="w-full h-px bg-zinc-800 my-1"></div>

                {/* DEBUG ASSISTANCE OPERATIONS */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">🛠️ 인과 지원 제어 코드</span>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded font-mono">DEBUG</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setGold(g => g + 10000);
                        setLobbyFeedback('🛠️ [디버그]: 시공 인과 자금 10,000G가 추가 포팅되었습니다.');
                      }}
                      className="py-2.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-lg text-[10px] font-bold text-blue-400 cursor-pointer text-center truncate transition-colors font-mono"
                    >
                      골드 주입 (+10,000G)
                    </button>
                    <button
                      onClick={() => {
                        setStats(s => ({
                          strength: s.strength + 5,
                          agility: s.agility + 5,
                          mana: s.mana + 5,
                          intellect: s.intellect + 5,
                        }));
                        setLobbyFeedback('🛠️ [디버그]: 차원 보정 보너스로 실효 전 스탯이 +5 증가했습니다.');
                      }}
                      className="py-2.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-lg text-[10px] font-bold text-emerald-400 cursor-pointer text-center truncate transition-colors font-mono"
                    >
                      전 전계 스탯 (+5)
                    </button>
                  </div>
                </div>

                {/* Close Button footer */}
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-full mt-2 py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer font-sans"
                >
                  제어 화면 닫기
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* LOG MESSAGE HUD ANNOUNCER BAR */}
        <div className="px-6 py-3 bg-gradient-to-r from-zinc-950 to-zinc-900 border-b border-zinc-800/80 flex items-center gap-2 shrink-0 text-xs md:text-sm font-mono text-zinc-400">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          <span className="truncate text-zinc-200 font-semibold">{lobbyFeedback}</span>
        </div>

        {/* CORE WORKSPACE DISPLAY WINDOW */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-zinc-950">
          {gameStarted && (
            <LocationScene
              phase={phases[phaseIndex]}
              stats={stats}
              setStats={setStats}
              bodyPartsHP={bodyPartsHP}
              setBodyPartsHP={setBodyPartsHP}
              gold={gold}
              setGold={setGold}
              fatigue={fatigue}
              setFatigue={setFatigue}
              npcs={npcs}
              setNpcs={setNpcs}
              onAdvancePhase={handleAdvancePhase}
              onCollectRecord={handleCollectRecord}
            />
          )}
        </div>

        {/* BOTTOM NAVIGATION UTILITY FOOTER TABS BAR */}
        <div className="py-3 md:py-5 bg-zinc-900 border-t border-zinc-800/80 flex items-center justify-around px-4 md:px-6 shrink-0 gap-2 md:gap-4">
          
          {/* SmartPhone App trigger */}
          <button
            onClick={() => setPhoneOpen(true)}
            className="flex items-center justify-center p-3 relative bg-zinc-955 hover:bg-zinc-855 hover:border-blue-500/50 border border-zinc-800 rounded-2xl w-14 h-14 shadow-md transition-all cursor-pointer group"
          >
            <Smartphone className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            
            {/* Notification badge alert */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 text-[9px] font-bold text-center items-center justify-center text-white font-mono shadow-[0_0_4px_rgba(59,130,246,0.8)]">
                !
              </span>
            </span>
          </button>

          {/* S-Class Recruit Status Check Trigger */}
          <button
            onClick={() => {
              setPhoneOpen(true);
            }}
            className="flex items-center justify-center p-3 bg-zinc-950 hover:bg-zinc-855 hover:border-rose-500/50 border border-zinc-800 rounded-2xl w-14 h-14 shadow-md transition-all cursor-pointer group animate-pulse-slow"
          >
            <Heart className="w-6 h-6 text-zinc-400 hover:text-rose-400 transition-colors" />
          </button>

          {/* Stat check widget trigger */}
          <button
            onClick={() => {
              setPhoneOpen(true);
            }}
            className="flex items-center justify-center p-3 bg-zinc-950 hover:bg-zinc-855 hover:border-amber-500/50 border border-zinc-800 rounded-2xl w-14 h-14 shadow-md transition-all cursor-pointer group"
          >
            <Award className="w-6 h-6 text-zinc-400 hover:text-amber-400 transition-colors" />
          </button>

        </div>

      </motion.div>

    </div>
  );
}
