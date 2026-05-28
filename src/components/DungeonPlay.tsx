/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Npc, Equipment, Dungeon, BodyPartsHP, GridRoom, CombatLog } from '../types';
import { 
  Compass, Shield, AlertTriangle, Play, HelpCircle, Trophy, Sparkles,
  Sword, ShieldAlert, Heart, Activity, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Gift, Skull, CheckCircle2, RefreshCw, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateNonLinearDungeonMap } from '../data/dungeonGenerator';

interface DungeonPlayProps {
  dungeon: Dungeon;
  stats: { strength: number; agility: number; mana: number; intellect: number };
  bodyPartsHP: BodyPartsHP;
  setBodyPartsHP: React.Dispatch<React.SetStateAction<BodyPartsHP>>;
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  fatigue: number;
  setFatigue: React.Dispatch<React.SetStateAction<number>>;
  allies: Npc[];
  inventory: Equipment[];
  onFinishDungeon: (success: boolean, loot: string[], logText: string) => void;
  onDie: () => void;
  onCollectRecord: () => void;
  playerName?: string;
}

export default function DungeonPlay({
  dungeon,
  stats,
  bodyPartsHP,
  setBodyPartsHP,
  gold,
  setGold,
  fatigue,
  setFatigue,
  allies,
  inventory,
  onFinishDungeon,
  onDie,
  onCollectRecord,
  playerName
}: DungeonPlayProps) {
  // Setup Non-Linear Graph Map
  const [grid, setGrid] = useState<GridRoom[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [roomLogs, setRoomLogs] = useState<string[]>(['던전에 무사히 진입했습니다. 핵을 파괴하십시오!']);
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [battleEnemyHP, setBattleEnemyHP] = useState<number>(100);
  const [battleEnemyMaxHP, setBattleEnemyMaxHP] = useState<number>(100);
  const [battleEnemyName, setBattleEnemyName] = useState<string>('고블린 경비병');
  const [battleEnemyAtk, setBattleEnemyAtk] = useState<number>(12);
  const [isBossRoom, setIsBossRoom] = useState<boolean>(false);

  // Battle local states
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);
  const [turn, setTurn] = useState<number>(1);
  const [initiativeOrder, setInitiativeOrder] = useState<string[]>([]); // who attacks in what order
  const [currentTurnIdx, setCurrentTurnIdx] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rolledValue, setRolledValue] = useState<number>(0);

  // Co-fighters
  const [activeAllies, setActiveAllies] = useState<Npc[]>([]);

  // Allied skill usage indicator (usable once per battle)
  const [baekSkillUsed, setBaekSkillUsed] = useState<boolean>(false);
  const [geumSkillUsed, setGeumSkillUsed] = useState<boolean>(false);
  const [limSkillUsed, setLimSkillUsed] = useState<boolean>(false);

  const [evadedThisTurn, setEvadedThisTurn] = useState<boolean>(false);
  const [shieldActive, setShieldActive] = useState<boolean>(false);

  useEffect(() => {
    // Generate specialized non-linear graph map
    const generatedRooms = generateNonLinearDungeonMap(dungeon);
    setGrid(generatedRooms);
    setCurrentNodeId('start');
    setSelectedNodeId(null);

    // Choose active allies from unlocked recruits
    const selectedAllies = allies.filter(a => a.unlocked && a.rapport >= 50);
    setActiveAllies(selectedAllies);
  }, [dungeon]);

  const currentRoom = grid.find(r => r.id === currentNodeId);

  // Check death triggers
  useEffect(() => {
    if (bodyPartsHP.head <= 0 || bodyPartsHP.torso <= 0) {
      onDie();
    }
  }, [bodyPartsHP]);

  // Handle room exploration actions
  const moveToNode = (targetNodeId: string) => {
    if (inBattle) return;
    const targetRoom = grid.find(r => r.id === targetNodeId);
    if (!targetRoom) return;

    // Explore target room
    setGrid(prev => prev.map(r => r.id === targetNodeId ? { ...r, explored: true } : r));
    setCurrentNodeId(targetNodeId);
    setSelectedNodeId(null);

    // Deduct light fatigue cost for exploring a brand new area!
    if (!targetRoom.clear && targetRoom.id !== 'start') {
      setFatigue(prev => Math.max(0, prev - 2)); // 2 Fatigue exploration stress/effort
    }

    // Locate destination room
    handleRoomImpact(targetRoom);
  };

  const handleRoomImpact = (room: GridRoom) => {
    if (room.clear) {
      setRoomLogs(prev => [...prev, '이미 정화하여 안전해진 구역입니다.']);
      return;
    }

    const logs: string[] = [];
    
    switch (room.type) {
      case 'combat':
        triggerBattle(false);
        break;
      case 'boss':
        triggerBattle(true);
        break;
      case 'chest':
        const foundGold = Math.floor(Math.random() * 2000) + 1500;
        setGold(prev => prev + foundGold);
        logs.push(`🎁 숨겨진 비밀 궤짝을 발견했습니다! +${foundGold.toLocaleString()}G를 획득했습니다.`);
        
        // Chance to find a loophole/past record
        if (Math.random() < 0.6) {
          logs.push(`✨ 반짝이는 고대의 기하 마석조각을 발견했습니다: "미식별 차원 기밀 데이터 노드" 확보!`);
          onCollectRecord();
        }
        
        // Mark room as clear
        setGrid(prev => prev.map(r => r.id === room.id ? { ...r, clear: true } : r));
        break;
      case 'event':
        // Random Event
        const eventId = Math.floor(Math.random() * 3);
        if (eventId === 0) {
          logs.push(`💡 지독한 마나 웅덩이를 발견했습니다. 주변 마력이 당신의 근원과 상호작용합니다.`);
          // Damage left arm, but increase Intellect/Mana
          setBodyPartsHP(prev => ({ ...prev, leftArm: Math.max(10, prev.leftArm - 15) }));
          stats.mana += 2;
          stats.intellect += 1;
          logs.push(`[영구 스탯 향상] 마력 +2, 지력 +1 / [왼팔 부상] HP -15`);
        } else if (eventId === 1) {
          logs.push(`🌿 보증된 치유의 수풀을 발견했습니다. 전신이 서서히 회복됩니다.`);
          setBodyPartsHP(prev => ({
            head: Math.min(100, prev.head + 25),
            torso: Math.min(100, prev.torso + 25),
            leftArm: Math.min(100, prev.leftArm + 25),
            rightArm: Math.min(100, prev.rightArm + 25),
            leftLeg: Math.min(100, prev.leftLeg + 25),
            rightLeg: Math.min(100, prev.rightLeg + 25),
          }));
          logs.push(`[치유] 전사 파트별 체력이 +25씩 고루 치유되었습니다.`);
        } else {
          logs.push(`📜 과거 차원 속에 고이 파묻힌 시체의 흔적... 당신의 이름 "${playerName || '유저'}"가 새겨진 부러진 단검입니다.`);
          logs.push(`기이한 기시감에 머리가 아파옵니다. "이 죽음은 벌써 수백 마흔 번째야..."`);
          onCollectRecord();
        }
        setGrid(prev => prev.map(r => r.id === room.id ? { ...r, clear: true } : r));
        break;
      case 'empty':
        logs.push('고요한 암흑만이 공간을 채우고 있습니다. 인기척은 없습니다.');
        break;
    }

    if (logs.length > 0) {
      setRoomLogs(prev => [...prev, ...logs]);
    }
  };

  // Turn-Based RPG Battle Module Trigger
  const triggerBattle = (boss: boolean) => {
    setIsBossRoom(boss);
    setInBattle(true);
    setTurn(1);
    
    // Choose Enemy type based on Dungeon rank
    let name = '그림자 파수꾼늑대';
    let hp = 120;
    let attack = 15;

    if (boss) {
      name = `S급 [시공의 거울 오버시어: 아바타]`;
      hp = 300 + (stats.strength * 2);
      attack = 30;
    } else {
      switch (dungeon.rank) {
        case 'F급':
          name = '미각성 도살자 슬라임'; hp = 60; attack = 8; break;
        case 'E급':
          name = '귀갑 장갑 고블린'; hp = 90; attack = 12; break;
        case 'D급':
          name = '그림자 워그 장군'; hp = 130; attack = 18; break;
        case 'C급':
          name = '피에 굶주린 네크로 로드'; hp = 180; attack = 24; break;
        case 'B급':
          name = '균열의 독니 키메라'; hp = 220; attack = 28; break;
        case 'A급':
          name = '불사 군단의 타락한 대검투사'; hp = 265; attack = 35; break;
      }
    }

    setBattleEnemyName(name);
    setBattleEnemyHP(hp);
    setBattleEnemyMaxHP(hp);
    setBattleEnemyAtk(attack);

    // Dynamic Turn order based on Agility
    const order = ['player'];
    activeAllies.forEach(a => order.push(a.id));
    order.push('enemy');

    // Sort order by assumed Agility
    // Player Agility: stats.agility
    // Baek Agility: 6
    // Geum Agility: 25
    // Lim Agility: 12
    // Enemy Agility: calculated dynamic
    const agilityMap: Record<string, number> = {
      player: stats.agility,
      baek: 6,
      geum: 25,
      lim: 12,
      enemy: boss ? 20 : 8 + (dungeon.fatigueCost / 2)
    };

    const sortedOrder = order.sort((a, b) => (agilityMap[b] || 0) - (agilityMap[a] || 0));
    setInitiativeOrder(sortedOrder);
    setCurrentTurnIdx(0);

    const initialLogs: CombatLog[] = [
      { id: '1', text: `⚔️ 위험 경보! 강력한 적 [${name}]을(를) 조우했습니다!`, type: 'system' },
      { id: '2', text: `🏃 선공 순서가 정해졌습니다: ${sortedOrder.map(id => id === 'player' ? `${playerName || '유저'}(나)` : id === 'enemy' ? '몬스터' : allies.find(a => a.id === id)?.name).join(' ➔ ')}`, type: 'system' }
    ];
    setCombatLogs(initialLogs);

    // Reset skill uses for this combat
    setBaekSkillUsed(false);
    setGeumSkillUsed(false);
    setLimSkillUsed(false);
    setShieldActive(false);
  };

  const addBattleLog = (text: string, type: CombatLog['type']) => {
    setCombatLogs(prev => [...prev, { id: Math.random().toString(), text, type }]);
  };

  // Perform combat turns
  const executePlayerAttack = () => {
    if (isRolling) return;
    setIsRolling(true);

    setTimeout(() => {
      // Dice based calculation
      // Normal attack roll: range 1 - 20
      const diceRoll = Math.floor(Math.random() * 20) + 1;
      setRolledValue(diceRoll);

      let damage = Math.floor((stats.strength * 1.5) + (diceRoll * 0.8));

      // Check Lim So-yeon skill intervention if roll is poor (e.g., dice roll < 8)
      let actualRoll = diceRoll;
      const isLimJoined = activeAllies.some(a => a.id === 'lim');
      if (diceRoll < 8 && isLimJoined && !limSkillUsed) {
        setLimSkillUsed(true);
        // Re-roll beautifully!
        const reRoll = Math.floor(Math.random() * 12) + 9; // Range 9 - 20
        actualRoll = reRoll;
        damage = Math.floor((stats.strength * 1.5) + (reRoll * 0.8));
        addBattleLog(`📖 S급 임소연의 [기록자의 교정] 발동! 주사위 오류를 바로잡아 수식을 역설합니다: ${diceRoll} ➔ ${reRoll}`, 'skill');
      }

      // Check Geum Chae-ran S-Class help if attack is low
      const isGeumJoined = activeAllies.some(a => a.id === 'geum');
      if (actualRoll < 12 && isGeumJoined && !geumSkillUsed) {
        setGeumSkillUsed(true);
        const bonusDmg = Math.floor(stats.mana * 1.2);
        damage += bonusDmg;
        addBattleLog(`⚡ S급 금채란이 비아냥거리며 뒤에서 거드는 [황금색 참교육]! "+${bonusDmg} 폭발 속성 데미지 주입"`, 'skill');
      }

      // Deal damage
      // Calculate nextHp outside of state updater to prevent nested setting
      const nextHp = Math.max(0, battleEnemyHP - damage);
      setBattleEnemyHP(nextHp);

      addBattleLog(`⚔️ 주사위 🎲 [${actualRoll}] 굴림! 적에게 ${damage}의 데미지를 가했습니다!`, 'player');
      setIsRolling(false);

      if (nextHp <= 0) {
        setTimeout(() => {
          endBattle(true);
        }, 800);
      } else {
        nextTurn();
      }
    }, 800);
  };

  // Auto handle NPC allies turns
  const executeAllyTurn = (allyId: string) => {
    const ally = allies.find(a => a.id === allyId);
    if (!ally) {
      nextTurn();
      return;
    }

    setTimeout(() => {
      let dmg = 0;
      
      // NPC action based on entity
      if (allyId === 'baek') {
        const isBaekJoined = activeAllies.some(a => a.id === 'baek');
        if (isBaekJoined && !baekSkillUsed && Math.random() < 0.6) {
          setShieldActive(true);
          setBaekSkillUsed(true);
          addBattleLog(`🛡️ 백운혁이 거대한 방패를 다잡으며 전설적 클래스 [희생의 방패] 오라를 시전합니다! (나머지 턴 동안 위기 차단)`, 'skill');
        } else {
          dmg = 25 + stats.intellect; // shield bash
          addBattleLog(`🛡️ 백운혁의 방패 치기! 적을 넉백시키고 ${dmg}의 데미지를 부여했습니다.`, 'ally');
        }
      } else if (allyId === 'geum') {
        dmg = 45 + Math.floor(stats.mana * 0.4);
        addBattleLog(`⚡ 금채란이 공중에 수십 발의 황금 마석 탄환을 발포해 ${dmg}의 폭발 데미지를 뿜었습니다!`, 'ally');
      } else if (allyId === 'lim') {
        addBattleLog(`📖 임소연이 가죽 고서의 인과율을 복제하여 파티 공격력을 보정합니다. (모든 주사위 크리티컬 보정)`, 'ally');
      }
      
      if (dmg > 0) {
        const nextHp = Math.max(0, battleEnemyHP - dmg);
        setBattleEnemyHP(nextHp);
        if (nextHp <= 0) {
          setTimeout(() => { 
            endBattle(true); 
          }, 500);
          return;
        }
      }

      nextTurn();
    }, 1000);
  };

  // Monster Turn Action
  const executeEnemyTurn = () => {
    setTimeout(() => {
      // Calculate hit target or shield intervention
      let baseDmg = battleEnemyAtk;
      
      // Check evasion based on Player's Agility stat
      const evadeChance = Math.min(65, Math.floor(stats.agility * 0.5));
      const rolledEvade = Math.random() * 100;
      
      if (rolledEvade < evadeChance) {
        addBattleLog(`💨 슈욱! 당신은 민첩하게 측면으로 축을 옮겨 몬스터의 발톱을 [회피]했습니다!`, 'evade');
        nextTurn();
        return;
      }

      // Damage application on parts
      // Parts: head (10%), torso (30%), arms (30%), legs (30%)
      const partSeed = Math.random();
      let targetedPart: keyof BodyPartsHP = 'torso';
      let partLabel = '몸통';

      if (partSeed < 0.12) {
        targetedPart = 'head';
        partLabel = '💀 머리 (치명 부위!)';
      } else if (partSeed < 0.45) {
        targetedPart = 'torso';
        partLabel = '🛡️ 몸통 (중요 장기!)';
      } else if (partSeed < 0.6) {
        targetedPart = 'leftArm';
        partLabel = '왼팔';
      } else if (partSeed < 0.75) {
        targetedPart = 'rightArm';
        partLabel = '오른팔';
      } else if (partSeed < 0.90) {
        targetedPart = 'leftLeg';
        partLabel = '왼다리';
      } else {
        targetedPart = 'rightLeg';
        partLabel = '오른다리';
      }

      // Apply armor reduction based on gear
      const currentWeaponAndArmor = inventory.filter(i => i.equipped);
      let reduction = 0;
      currentWeaponAndArmor.forEach(item => {
        if (item.bonuses.strength) reduction += Math.floor(item.bonuses.strength * 0.1);
      });

      let netDmg = Math.max(5, baseDmg - reduction);

      // Baek Un-hyeok's shield intervention
      if (shieldActive || (activeAllies.some(a => a.id === 'baek') && targetedPart === 'head' && Math.random() < 0.7)) {
        addBattleLog(`🛡️ 백운혁이 뛰어들어 "어리석은 놈!"이라고 소리치며 즉사에 빠질 공격을 방패로 가로막았습니다!`, 'skill');
        setShieldActive(false);
        nextTurn();
        return;
      }

      // Calculate net damage outside of updater to prevent nested/concurrent setState side-effects
      const currentPartHP = bodyPartsHP[targetedPart];
      const nextHP = Math.max(0, currentPartHP - netDmg);

      addBattleLog(`💥 몬스터가 당신의 [${partLabel}]를 난폭하게 격타해 ${netDmg}의 아픔을 주었습니다. (부위 HP: ${nextHP}/100)`, 'enemy');

      // Critical conditions checked directly outside of state updater
      if ((targetedPart === 'head' || targetedPart === 'torso') && nextHP <= 0) {
        addBattleLog(`💀 치명 부위인 [${partLabel}]의 HP가 잔존하지 않아 목숨이 끊어졌습니다... 즉사 판정!`, 'death');
        setTimeout(() => {
          onDie();
        }, 1200);
      }

      setBodyPartsHP(prev => ({ ...prev, [targetedPart]: nextHP }));

      nextTurn();
    }, 1200);
  };

  const nextTurn = () => {
    setCurrentTurnIdx(prev => {
      const nextIdx = (prev + 1) % initiativeOrder.length;
      if (nextIdx === 0) {
        setTurn(t => t + 1);
      }
      return nextIdx;
    });
  };

  // Run turn queue automatically if it's not the player's turn
  useEffect(() => {
    if (!inBattle || battleEnemyHP <= 0) return;
    const currentTurnEntity = initiativeOrder[currentTurnIdx];
    if (!currentTurnEntity) return;

    if (currentTurnEntity === 'enemy') {
       executeEnemyTurn();
    } else if (currentTurnEntity !== 'player') {
       executeAllyTurn(currentTurnEntity);
    }
  }, [currentTurnIdx, initiativeOrder, inBattle, battleEnemyHP]);

  // Wrap up combat module
  const endBattle = (success: boolean) => {
    if (success) {
      addBattleLog(`🎉 게이트 정화 완료! 적 몬스터를 모두 섬멸하고 핵을 파괴했습니다.`, 'system');
      
      const lootGold = Math.floor(Math.random() * dungeon.rewards.gold * 0.4) + Math.floor(dungeon.rewards.gold * 0.8);
      setGold(prev => prev + lootGold);

      setRoomLogs(prev => [
        ...prev, 
        `⚔️ 몬스터 전투 승리! 전리품 고품질 청색 에너지 핵을 헐값에 세관 처분하여 +${lootGold.toLocaleString()}G 확보!`
      ]);

      // Set current grid room as clear
      const currentRoomId = currentNodeId;
      setGrid(prev => prev.map(r => r.id === currentRoomId ? { ...r, clear: true } : r));
      
      // If S class boss dies, prompt win
      if (isBossRoom) {
        setTimeout(() => {
          onFinishDungeon(true, dungeon.rewards.items, `${dungeon.name} 최종 정화 성공! 한국의 생존 날짜를 장대하게 연장했습니다.`);
        }, 1500);
      }
    } else {
      onDie();
    }
    setInBattle(false);
  };

  // Handle retreat escaping
  const handleRetreat = () => {
    if (isBossRoom) {
      addBattleLog(`❌ 경고! 이곳은 던전 안에서 탈출할 수 없는 시고의 폭사 성역입니다! 퇴각 불가!`, 'system');
      return;
    }
    const retreatChance = 40 + (stats.agility * 2);
    if (Math.random() * 100 < retreatChance) {
      addBattleLog(`💨 부리나케 흔적을 지우며 퇴각하는 데 성공했습니다! 시작 구역으로 밀려납니다.`, 'system');
      setCurrentNodeId('start');
      setSelectedNodeId(null);
      setInBattle(false);
    } else {
      addBattleLog(`❌ 으악! 사방이 균열의 가시나무로 뒤덮여 탈출 경로가 차단되었습니다! 턴을 소모했습니다.`, 'system');
      nextTurn();
    }
  };

  const handleLeaveDungeon = (success: boolean) => {
    onFinishDungeon(success, [], `자진 퇴각하여 본체 및 헌터 장비를 정화하였습니다.`);
  };

  const currentTurnEntity = initiativeOrder[currentTurnIdx];

  return (
    <div className="absolute inset-0 z-30 bg-neutral-950 text-white flex flex-col overflow-hidden text-xs">
      
      {/* HEADER BAR */}
      <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-1.5 text-rose-500 font-bold">
          <Skull className="w-4 h-4 animate-pulse" />
          <span className="font-mono">{dungeon.name}</span>
        </div>
        <button 
          onClick={() => handleLeaveDungeon(false)}
          className="px-2 py-1 bg-red-950/40 text-red-400 border border-red-900/50 rounded font-bold hover:bg-red-900/30 text-[10px]"
        >
          로비로 탈출
        </button>
      </div>

      {!inBattle ? (
        /* EXPLORATION UI */
        <div className="flex flex-col flex-1 overflow-hidden p-3 gap-2">
          
          {/* MAP CANVAS GRID */}
          <div className="p-3 bg-neutral-950 border border-neutral-800/40 rounded-xl relative flex flex-col justify-center items-center flex-1 min-h-[160px] overflow-hidden">
            <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono z-20 bg-neutral-950/80 backdrop-blur-sm p-1 rounded-md border border-neutral-800/30">
              <Compass className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>차원 기하 비선형 게이트 (지형 분석 정보)</span>
            </div>
            
            {/* Real SVG Interactive Node Graph */}
            <div className="w-full h-full relative min-h-[180px] select-none flex items-center justify-center bg-neutral-900/15 rounded-lg border border-neutral-800/30">
              {/* Backing connections SVG Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                {grid.map(room => {
                  return room.connections?.map(targetId => {
                    const target = grid.find(t => t.id === targetId);
                    if (!target) return null;
                    
                    const isPassed = room.explored && target.explored;
                    const isSensed = room.explored || target.explored || (currentNodeId === room.id || currentNodeId === target.id);
                    if (!isSensed) return null;

                    return (
                      <line
                        key={`${room.id}-${targetId}`}
                        x1={room.depth * 16 + 10}
                        y1={room.row * 30 + 20}
                        x2={target.depth * 16 + 10}
                        y2={target.row * 30 + 20}
                        stroke={isPassed && (room.clear || target.clear) ? '#34d399' : '#f43f5e'}
                        strokeWidth={isPassed ? 0.75 : 0.45}
                        strokeOpacity={isPassed ? 0.9 : 0.45}
                        strokeDasharray={isPassed ? undefined : "1.5 2"}
                        className="transition-all duration-300"
                      />
                    );
                  });
                })}
              </svg>

              {/* Node Buttons Overlay */}
              {grid.map((room) => {
                const isCurrent = room.id === currentNodeId;
                const isAdjacent = (() => {
                  if (!currentRoom) return false;
                  if (currentRoom.connections?.includes(room.id)) return true;
                  if (room.connections?.includes(currentNodeId) && (currentRoom.clear || currentNodeId === 'start')) return true;
                  return false;
                })();
                
                const isScouted = room.explored || isAdjacent || (currentRoom && currentRoom.connections?.includes(room.id));
                const isSelected = selectedNodeId === room.id;

                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      if (isAdjacent || isCurrent) {
                        setSelectedNodeId(room.id);
                      }
                    }}
                    style={{
                      left: `${room.depth * 16 + 10}%`,
                      top: `${room.row * 30 + 20}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={`absolute w-8 h-8 rounded-full flex flex-col items-center justify-center border transition-all duration-300 z-10 ${
                      isCurrent
                        ? 'bg-rose-950/85 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.7)] scale-110 ring-2 ring-rose-500/30'
                        : isSelected
                          ? 'bg-amber-950/80 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-105'
                          : isAdjacent
                            ? room.explored
                              ? 'bg-neutral-900/90 border-emerald-500 text-emerald-300 hover:bg-emerald-950/50 hover:scale-105 cursor-pointer animate-pulse'
                              : 'bg-neutral-900 border-dashed border-rose-700 text-rose-400 hover:border-rose-500 hover:bg-rose-950/20 cursor-pointer hover:scale-105'
                            : room.explored
                              ? room.clear
                                ? 'bg-neutral-950 border-neutral-800 text-emerald-500/60 opacity-60'
                                : 'bg-neutral-900 border-rose-950 text-rose-500/40 opacity-50'
                              : 'bg-neutral-950/80 border-neutral-900 text-neutral-800 pointer-events-none'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                    
                    {isScouted ? (
                      <div className="flex flex-col items-center">
                        {room.type === 'start' && <span className="text-[7.5px] font-sans font-extrabold tracking-tighter text-neutral-400">GATE</span>}
                        {room.type === 'boss' && <Skull className="w-3.5 h-3.5 text-rose-500 font-bold animate-pulse" />}
                        {room.type === 'combat' && !room.clear && (
                          room.threatLevel === 'dead_end' 
                            ? <AlertTriangle className="w-3.5 h-3.5 text-red-500 font-black" />
                            : <Skull className="w-3.5 h-3.5 text-red-400" />
                        )}
                        {room.type === 'chest' && !room.clear && <Gift className="w-3.5 h-3.5 text-amber-500" />}
                        {room.type === 'event' && !room.clear && <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />}
                        {room.type === 'empty' && !room.clear && <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>}
                        
                        {room.clear && room.type !== 'start' && room.type !== 'boss' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-[9px] text-neutral-800">?</span>
                    )}

                    {/* Threat indicator tag for scouted nodes */}
                    {isScouted && room.threatLevel === 'dead_end' && !room.clear && (
                      <span className="absolute -bottom-3 px-0.5 bg-red-950 text-red-400 rounded text-[6px] font-bold tracking-tighter border border-red-900/60 leading-none">HIGH_D</span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Map Legend */}
            <div className="mt-2 text-[9px] text-neutral-500 border-t border-neutral-900 pt-1.5 w-full flex flex-wrap gap-x-3.5 gap-y-1 items-center justify-center">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block shadow-[0_0_5px_rgba(244,63,94,0.4)]"></span>현위치</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-[0_0_5px_rgba(245,158,11,0.4)]"></span>선택구역</span>
              <span className="flex items-center gap-1"><Skull className="w-2.5 h-2.5 text-red-500" />몬스터 균열</span>
              <span className="flex items-center gap-1"><Gift className="w-2.5 h-2.5 text-amber-500" />기맥 보물</span>
              <span className="flex items-center gap-1"><HelpCircle className="w-2.5 h-2.5 text-cyan-400" />미확인 비성</span>
              <span className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 text-red-500 animate-pulse" />막다른 길(H-Risk)</span>
            </div>
          </div>
          
          {/* SENSORY SCAN DETAIL EXPLORE PANEL */}
          <div className="bg-neutral-900 border border-neutral-800/80 p-3 rounded-xl flex flex-col font-sans shrink-0 gap-2">
            <div className="flex gap-2 min-h-[70px]">
              
              <div className="flex-1 bg-neutral-950/60 rounded-lg p-2.5 border border-neutral-800/50 flex flex-col justify-center">
                {selectedNodeId ? (
                  (() => {
                    const selRoom = grid.find(r => r.id === selectedNodeId);
                    if (!selRoom) return null;
                    const isSelCurrent = selectedNodeId === currentNodeId;
                    return (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-bold text-white text-[10.5px]">
                          <span>{selRoom.name}</span>
                          <span className={`px-1 py-0.5 rounded text-[7.5px] font-mono tracking-tighter ${
                            isSelCurrent ? 'bg-rose-950 text-rose-400 border border-rose-900/60' :
                            selRoom.threatLevel === 'dead_end' ? 'bg-red-950 text-red-400 border border-red-900/80 animate-pulse font-extrabold' :
                            selRoom.threatLevel === 'high' ? 'bg-orange-950 text-orange-400 border border-orange-900/60' :
                            selRoom.threatLevel === 'medium' ? 'bg-amber-950 text-amber-400 border border-amber-900/60' :
                            selRoom.threatLevel === 'low' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' :
                            'bg-neutral-900 text-neutral-400 border border-neutral-800'
                          }`}>
                            {isSelCurrent ? 'CURRENT' : selRoom.threatLevel === 'dead_end' ? '💀 DEAD END (막다른 성물)' : `위험도: ${selRoom.threatLevel.toUpperCase()}`}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-neutral-400 leading-normal font-sans">
                          {selRoom.description}
                        </p>
                        {selRoom.lootQuality && selRoom.lootQuality !== 'none' && !selRoom.clear && (
                          <div className="text-[9px] text-amber-500 flex items-center gap-0.5 font-bold">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            <span>추정 보상 등급: {selRoom.lootQuality === 'legendary' ? '🔥 레전더리(초고가 기맥)' : selRoom.lootQuality === 'rare' ? '✨ 유니크 파편' : '시공 마석 원석'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : currentRoom ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold text-white text-[10.5px]">
                      <span>📌 대기 중인 영혼의 조율지</span>
                      <span className="px-1 py-0.5 rounded text-[8px] bg-emerald-950 text-emerald-400 font-mono">STATIONARY</span>
                    </div>
                    <p className="text-[9.5px] text-neutral-400 leading-normal">
                      지도상의 <span className="text-rose-400 font-bold">붉은 균열 노선</span> 및 무늬 노드를 터치하여 감지 신호를 획득한 후 진격을 개시하십시오.
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Exploration Trigger button */}
              <div className="w-[105px] shrink-0 flex items-center justify-center">
                {selectedNodeId && selectedNodeId !== currentNodeId ? (
                  (() => {
                    const selRoom = grid.find(r => r.id === selectedNodeId);
                    const isNextNeighbor = selRoom && (() => {
                      if (!currentRoom) return false;
                      if (currentRoom.connections?.includes(selRoom.id)) return true;
                      if (selRoom.connections?.includes(currentNodeId) && (currentRoom.clear || currentNodeId === 'start')) return true;
                      return false;
                    })();

                    if (!isNextNeighbor) {
                      return (
                        <div className="text-center py-2 text-neutral-500 text-[8.5px] leading-relaxed border border-dotted border-neutral-800 rounded p-1.5 w-full h-full flex items-center justify-center">
                          도달 수식 불가능
                        </div>
                      );
                    }

                    const isBacktrack = selRoom && currentRoom && selRoom.depth < currentRoom.depth;

                    return (
                      <button
                        onClick={() => moveToNode(selectedNodeId)}
                        className={`w-full h-full py-2 rounded-lg border font-bold text-[9.5px] flex flex-col items-center justify-center transition-all duration-150 ${
                          isBacktrack
                            ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-750 text-neutral-100 hover:scale-[1.02]'
                            : 'bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border-rose-500 shadow-[0_2px_8px_rgba(244,63,94,0.35)] hover:scale-[1.03] active:scale-[0.98]'
                        }`}
                      >
                        {isBacktrack ? (
                          <>
                            <ArrowLeft className="w-4 h-4 mb-0.5 text-neutral-300" />
                            <span>역기동 퇴각</span>
                          </>
                        ) : (
                          <>
                            <Compass className="w-4 h-4 mb-0.5 animate-pulse text-rose-100" />
                            <span>균열 진공 돌파</span>
                            <span className="text-[7.5px] text-rose-200/90 tracking-tighter leading-none mt-0.5">
                              {selRoom.clear ? '0피로 격상' : '+2피로 마찰'}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })()
                ) : (
                  <div className="text-center py-2 text-neutral-500 text-[8.5px] font-mono leading-snug border border-dashed border-neutral-800/80 rounded h-full justify-center flex items-center px-1.5 w-full">
                    좌측 분기 노드<br />터치 대기 중
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* CHRONICLES LOG BOOK */}
          <div className="h-[95px] bg-neutral-900/60 border border-neutral-800 rounded-lg p-2 flex flex-col font-mono text-[9px] overflow-y-auto shrink-0">
            <span className="text-[8.5px] text-rose-500/80 mb-1 border-b border-neutral-800/80 pb-0.5 font-bold uppercase tracking-wider">▲ 차원 균열 감지 정밀 수치 기록 로그</span>
            <div className="flex flex-col-reverse gap-1 flex-1">
              {[...roomLogs].reverse().map((log, index) => (
                <div key={index} className="text-neutral-300 border-l border-neutral-800 pl-1.5 py-0.5 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE PARTY MEMBERS IN DUNGEON */}
          <div className="p-2 bg-neutral-900/40 border border-neutral-800/40 rounded-lg shrink-0">
            <span className="text-[9px] text-neutral-400 font-mono">참전 중인 파티원</span>
            <div className="flex gap-2 mt-1">
              <div className="flex-1 p-1 px-2 border border-rose-500/30 bg-rose-950/10 rounded flex items-center gap-1.5">
                <span className="text-xs">🧑‍🚀</span>
                <div>
                  <div className="font-bold text-[9px]">{playerName || '기록'} (나)</div>
                  <div className="text-[8px] text-rose-400 font-mono">F급 대변인</div>
                </div>
              </div>
              {activeAllies.map((ally) => (
                <div key={ally.id} className="flex-1 p-1 px-2 border border-emerald-500/30 bg-emerald-950/10 rounded flex items-center gap-1.5">
                  <span className="text-xs">{ally.avatarUrl}</span>
                  <div>
                    <div className="font-bold text-[9px] text-emerald-400">{ally.name}</div>
                    <div className="text-[8px] text-neutral-400 font-mono">S급 동행인</div>
                  </div>
                </div>
              ))}
              {activeAllies.length === 0 && (
                <div className="flex-1 p-1 px-2 border border-dotted border-neutral-800 rounded flex items-center justify-center text-[8.5px] text-neutral-500">
                  S급 헌터 호감도가 부족하여 나홀로 군단 진입
                </div>
              )}
            </div>
          </div>
          
        </div>
      ) : (
        /* ================== ACTIVE RPG combat BOARD ================== */
        <div className="flex flex-col flex-1 overflow-hidden p-3 gap-2 bg-neutral-950">
          
          {/* TURN COUNTER & TEAM INDICATOR */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-[10px]">
            <span className="font-mono text-emerald-400 font-bold">TURN {turn}</span>
            <span className="text-neutral-400 font-semibold">
              현재 행동 순서: <span className="text-amber-400">{currentTurnEntity === 'player' ? `${playerName || '유저'} (나!)` : currentTurnEntity === 'enemy' ? '몬스터' : allies.find(a => a.id === currentTurnEntity)?.name}</span>
            </span>
          </div>

          {/* COMBATANTS HP DISPLAY PORTRAITS */}
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            {/* Friendly Heroes side */}
            <div className="flex flex-col gap-1.5 p-2 bg-neutral-900/60 border border-emerald-950/60 rounded-xl">
              <span className="text-[9px] text-emerald-400 font-bold mb-0.5">🦸 헌터 연합군</span>
              
              {/* Player HP */}
              <div className="p-1 px-1.5 bg-neutral-900/80 rounded border border-neutral-800">
                <div className="flex justify-between font-mono text-[9.5px] mb-0.5">
                  <span className="font-bold">{playerName || '유저'} (나)</span>
                  <span className="text-rose-400">몸통 {bodyPartsHP.torso}/100</span>
                </div>
                {/* Health bars */}
                <div className="flex gap-0.5 mt-1 text-[8px] font-mono justify-between text-neutral-400">
                  <span className={bodyPartsHP.head < 30 ? 'text-red-400 animate-pulse font-bold' : ''}>머리:{bodyPartsHP.head}</span>
                  <span>왼팔:{bodyPartsHP.leftArm}</span>
                  <span>오른팔:{bodyPartsHP.rightArm}</span>
                  <span>다리:{Math.floor((bodyPartsHP.leftLeg + bodyPartsHP.rightLeg)/2)}</span>
                </div>
              </div>

              {/* Allied co-fighters if any */}
              {activeAllies.map((ally) => (
                <div key={ally.id} className="p-1 px-1.5 bg-neutral-900/40 rounded border border-neutral-800/40 flex items-center justify-between font-mono text-[9px]">
                  <span className="font-bold text-emerald-400">{ally.avatarUrl} {ally.name}</span>
                  <span className="text-neutral-400">참전 보조 활성</span>
                </div>
              ))}
            </div>

            {/* Monsters Side */}
            <div className="flex flex-col gap-1.5 p-2 bg-neutral-900/60 border border-rose-950/60 rounded-xl relative overflow-hidden flex-1 justify-center">
              <div className="absolute top-0.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </div>
              <span className="text-[9px] text-rose-500 font-bold mb-0.5">👾 적 대장주</span>
              
              <div className="text-center py-2 flex flex-col items-center">
                <span className="text-2xl animate-bounce">🧟</span>
                <span className="font-bold text-[11px] mt-1 text-rose-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-[130px]">
                  {battleEnemyName}
                </span>
              </div>

              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-rose-950">
                <div 
                  className="bg-red-600 h-full transition-all duration-300"
                  style={{ width: `${(battleEnemyHP / battleEnemyMaxHP) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between font-mono text-[9px] text-neutral-400 mt-0.5">
                <span>HP {battleEnemyHP} / {battleEnemyMaxHP}</span>
                <span>공격력: {battleEnemyAtk}</span>
              </div>
            </div>
          </div>

          {/* REALTIME BATTLE STATS LOG FEED */}
          <div className="flex-1 bg-neutral-900/70 border border-neutral-800 rounded-lg p-2 flex flex-col font-mono text-[9.5px] overflow-hidden min-h-[140px]">
            <span className="text-[8.5px] text-amber-500 mb-0.5 border-b border-neutral-800 pb-0.5 font-bold uppercase tracking-widest">▲ 전용 영혼 궤적 정밀 타격 로그</span>
            <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
              {combatLogs.map((log) => {
                let colorClass = 'text-neutral-300';
                if (log.type === 'player') colorClass = 'text-green-300 bg-green-950/20 px-1 border-l border-green-500';
                if (log.type === 'enemy') colorClass = 'text-red-300 bg-red-950/20 px-1 border-l border-red-500';
                if (log.type === 'system') colorClass = 'text-yellow-400 font-bold';
                if (log.type === 'skill') colorClass = 'text-cyan-400 bg-cyan-950/20 px-1 border-l border-cyan-500';
                if (log.type === 'death') colorClass = 'text-red-500 font-black';
                if (log.type === 'evade') colorClass = 'text-blue-400 font-bold';

                return (
                  <div key={log.id} className={`py-0.5 leading-relaxed break-words rounded ${colorClass}`}>
                    {log.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* INTERACTIVE DICE GRAPHICS CONTAINER */}
          <AnimatePresence>
            {rolledValue > 0 && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center justify-center p-1 bg-neutral-900 border border-neutral-800/80 rounded-xl gap-2"
              >
                <span className="text-neutral-400 font-mono text-[9px] uppercase tracking-wider">주사위 투척 결과</span>
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-mono font-bold text-center flex items-center justify-center text-lg shadow-[0_0_10px_rgba(249,115,22,0.4)] border border-orange-400 shadow-inner animate-pulse">
                  {rolledValue}
                </div>
                <span className="text-[10px] text-orange-400 font-semibold font-sans">
                  {rolledValue >= 18 ? '🔥 크리티컬 타격!' : rolledValue >= 12 ? '✨ 우수한 타격' : rolledValue >= 7 ? '보통 공격' : '⚠️ 보정 스킬 검토 대상'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* COMBAT SYSTEM BUTTON CONTROLS */}
          <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl flex flex-col gap-2">
            
            <div className="grid grid-cols-3 gap-2">
              {/* Force Player Attack button */}
              <button
                disabled={currentTurnEntity !== 'player' || isRolling}
                onClick={executePlayerAttack}
                className="flex flex-col items-center justify-center aspect-[5/3] bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:from-neutral-800 disabled:to-neutral-900 disabled:border-neutral-700 disabled:text-neutral-500 hover:scale-[1.02] border border-rose-500 rounded-lg font-bold text-neutral-100 shadow transition-all duration-150 py-1"
              >
                <Sword className="w-4 h-4 mb-1 animate-pulse text-white" />
                <span className="text-[9px] uppercase font-bold tracking-wider">🗡️ 공격</span>
              </button>

              {/* Escape retreat */}
              <button
                disabled={currentTurnEntity !== 'player' || isRolling}
                onClick={handleRetreat}
                className="flex flex-col items-center justify-center aspect-[5/3] bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 disabled:border-neutral-800 disabled:text-neutral-600 rounded-lg font-bold text-neutral-200 transition-all duration-150 py-1"
              >
                <ShieldAlert className="w-4 h-4 mb-1 text-amber-500" />
                <span className="text-[9px]">💨 도망/퇴각</span>
              </button>

              {/* Allied custom commands */}
              <button
                disabled={currentTurnEntity !== 'player' || isRolling || activeAllies.length === 0}
                className="flex flex-col items-center justify-center aspect-[5/3] bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500 rounded-lg text-indigo-200 hover:text-indigo-100 disabled:bg-neutral-900 disabled:border-neutral-800 disabled:text-neutral-700 transition-all duration-150 py-1 relative overflow-hidden"
              >
                <Sparkles className="w-4 h-4 mb-1 text-cyan-400" />
                <span className="text-[9px]">🛡️ 동료 스킬</span>
                <span className="absolute top-0 right-0 px-0.5 bg-indigo-500 text-[6px] font-bold text-neutral-100 uppercase">패시브</span>
              </button>
            </div>

            {/* Skill / Ally Status description */}
            <div className="text-[8.5px] text-neutral-500 font-sans text-center mt-0.5 leading-relaxed">
              * 공격 시 당신의 <span className="text-rose-400">근력({stats.strength})</span>에 대응하여 데미지가 가산되며, <span className="text-light-blue-400">민첩({stats.agility})</span>에 비례해 회피 판정을 자동으로 시도합니다.
            </div>
          </div>

        </div>
      )}

      {/* FOOTER MINI STAT BAR */}
      <div className="bg-neutral-900 p-2 border-t border-neutral-800 flex justify-between text-[9.5px] font-mono text-neutral-400 shrink-0">
        <span>💪 근력 {stats.strength}</span>
        <span>🏃 민첩 {stats.agility}</span>
        <span>🔥 마력 {stats.mana}</span>
        <span>💰 {gold.toLocaleString()}G</span>
      </div>

    </div>
  );
}
