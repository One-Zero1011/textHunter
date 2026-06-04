/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Npc, Equipment, Dungeon, BodyPartsHP, GridRoom, CombatLog } from '../types';
import { SKILLS } from '../data';
import { 
  Compass, Shield, AlertTriangle, Play, HelpCircle, Trophy, Sparkles,
  Sword, ShieldAlert, Heart, Activity, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Gift, Skull, CheckCircle2, RefreshCw, Smartphone, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateNonLinearDungeonMap } from '../data/dungeonGenerator';

interface DungeonPlayProps {
  dungeon: Dungeon;
  stats: { strength: number; agility: number; health: number; intellect: number };
  bodyPartsHP: BodyPartsHP;
  setBodyPartsHP: React.Dispatch<React.SetStateAction<BodyPartsHP>>;
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  fatigue: number;
  setFatigue: React.Dispatch<React.SetStateAction<number>>;
  allies: Npc[];
  inventory: Equipment[];
  acquiredSkills?: string[];
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
  acquiredSkills = [],
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
  const [showSkillsMenu, setShowSkillsMenu] = useState<boolean>(false);

  // Co-fighters
  const [activeAllies, setActiveAllies] = useState<Npc[]>([]);

  // Allied skill usage indicator (usable once per battle)
  const [baekSkillUsed, setBaekSkillUsed] = useState<boolean>(false);
  const [geumSkillUsed, setGeumSkillUsed] = useState<boolean>(false);
  const [limSkillUsed, setLimSkillUsed] = useState<boolean>(false);

  const [evadedThisTurn, setEvadedThisTurn] = useState<boolean>(false);
  const [shieldActive, setShieldActive] = useState<boolean>(false);

  // Combat Floating Popups
  const [combatPopups, setCombatPopups] = useState<{ id: string; text: string; side: 'player' | 'enemy'; type: 'damage' | 'heal' | 'evade' | 'critical' }[]>([]);

  const triggerCombatPopup = (text: string, side: 'player' | 'enemy', type: 'damage' | 'heal' | 'evade' | 'critical') => {
    const id = Math.random().toString();
    setCombatPopups(prev => [...prev, { id, text, side, type }]);
    setTimeout(() => {
      setCombatPopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

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
          logs.push(`💡 생명력이 약동하는 고인 체력 영양천을 발견했습니다. 강력한 인체 복구 요소가 몸에 녹아듭니다.`);
          // Damage left arm, but increase Intellect/health
          setBodyPartsHP(prev => ({ ...prev, leftArm: Math.max(10, prev.leftArm - 15) }));
          stats.health += 2;
          stats.intellect += 1;
          logs.push(`[영구 스탯 향상] 체력 +2, 지력 +1 / [왼팔 부상] HP -15`);
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
    
    // Ranks mapping for safe progression
    const rankList = ['F급', 'E급', 'D급', 'C급', 'B급', 'A급', 'S급'];
    const currentRankIdx = rankList.indexOf(dungeon.rank) !== -1 ? rankList.indexOf(dungeon.rank) : 0;
    
    // Choose actual monster/boss rank (most likely dungeon rank, occasionally weaker, never stronger)
    let chosenRank = dungeon.rank;
    if (currentRankIdx > 0) {
      const roll = Math.random();
      if (roll < 0.20) {
        // 20% chance to summon a monster 1-2 ranks lower
        const drop = Math.random() < 0.5 ? 1 : 2;
        const targetIdx = Math.max(0, currentRankIdx - drop);
        chosenRank = rankList[targetIdx];
      }
    }

    let name = 'F급 그림자 파수꾼늑대';
    let hp = 120;
    let attack = 15;

    if (boss) {
      // Boss selection by chosen rank (weaker boss if chosenRank rolled lower)
      switch (chosenRank) {
        case 'F급':
          name = 'F급 [정화되지 않은 늪지 도살자]';
          hp = 120 + stats.strength;
          attack = 12;
          break;
        case 'E급':
          name = 'E급 [지하 둥지의 군장 워로블]';
          hp = 160 + Math.floor(stats.strength * 1.2);
          attack = 16;
          break;
        case 'D급':
          name = 'D급 [차원 파편의 그림자 리퍼]';
          hp = 215 + Math.floor(stats.strength * 1.4);
          attack = 20;
          break;
        case 'C급':
          name = 'C급 [성좌의 정찰 집행기]';
          hp = 270 + Math.floor(stats.strength * 1.6);
          attack = 24;
          break;
        case 'B급':
          name = 'B급 [키메라 블러드 베히모스]';
          hp = 330 + Math.floor(stats.strength * 1.8);
          attack = 28;
          break;
        case 'A급':
          name = 'A급 [성좌 봉인 해제의 불사 투사]';
          hp = 405 + Math.floor(stats.strength * 2.0);
          attack = 35;
          break;
        case 'S급':
        default:
          name = 'S급 [시공의 거울 오버시어: 아바타]';
          hp = 480 + Math.floor(stats.strength * 2.2);
          attack = 42;
          break;
      }
    } else {
      // Regular monster selection by chosen rank (never higher than dungeon rank)
      switch (chosenRank) {
        case 'F급':
          name = 'F급 미각성 도살자 슬라임'; hp = 60; attack = 8; break;
        case 'E급':
          name = 'E급 귀갑 장갑 고블린'; hp = 90; attack = 12; break;
        case 'D급':
          name = 'D급 그림자 워그 장군'; hp = 130; attack = 18; break;
        case 'C급':
          name = 'C급 피에 굶주린 네크로 로드'; hp = 180; attack = 24; break;
        case 'B급':
          name = 'B급 균열의 독니 키메라'; hp = 220; attack = 28; break;
        case 'A급':
          name = 'A급 불사 군단의 타락한 대검투사'; hp = 265; attack = 35; break;
        case 'S급':
        default:
          name = 'S급 시공 왜곡 마수 오르토스'; hp = 330; attack = 42; break;
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

  const castActiveSkill = (skillId: string) => {
    if (currentTurnEntity !== 'player' || isRolling) return;
    setIsRolling(true);
    setShowSkillsMenu(false);
    
    setTimeout(() => {
      let damage = 0;
      let logMsg = '';
      let logType: CombatLog['type'] = 'skill';
      
      switch (skillId) {
        // --- Summon 계열 ---
        case 'skill_summon_shadow':
          damage = 50 + Math.floor(stats.intellect * 1.5);
          logMsg = `🔮 [그림자 소환] 그림자 군단을 어둠 속에서 하차시켰습니다! 군단병들의 파상 공세로 적에게 ${damage}의 기동 타격을 입혔습니다!`;
          break;
        case 'skill_summon_golem':
          damage = 25 + Math.floor(stats.strength * 1.0);
          setShieldActive(true); 
          logMsg = `🔮 [골렘 기동] 대지 장벽을 머무금은 강철 골렘을 소환했습니다. 적에게 ${damage}의 물리 공격을 가하며, 다음 턴의 위기를 가로막을 보호막을 활성화했습니다!`;
          break;
        case 'skill_summon_dragon':
          damage = 100 + Math.floor(stats.intellect * 2.5);
          logMsg = `🔮 [화룡 소환] 시공간 너머의 전설적 화룡을 연성 소환했습니다! 극염 브레스 폭사로 적에게 큰 ${damage}의 화염 폭발 무색 데미지를 입혔습니다!`;
          break;
          
        // --- Magic 계열 ---
        case 'skill_magic_fire':
          damage = 60 + Math.floor(stats.intellect * 2.0);
          logMsg = `🔥 [화염 작렬] 마력 연쇄 격발을 통한 불꽃 탄환을 발사했습니다! 적의 장벽을 녹이며 ${damage}의 마법 데미지를 입혔습니다.`;
          break;
        case 'skill_magic_thunder':
          damage = 45 + Math.floor(stats.intellect * 1.3);
          logMsg = `⚡ [뇌신 폭뢰] 초강 고압 전격 오라의 낙뢰를 적의 뇌리에 폭화했습니다! 적에게 ${damage}의 감전 데미지를 입혔습니다.`;
          break;
        case 'skill_magic_restoration':
          setBodyPartsHP(prev => {
            const copy = { ...prev };
            (Object.keys(copy) as Array<keyof BodyPartsHP>).forEach(part => {
              copy[part] = Math.min(100, copy[part] + 35);
            });
            return copy;
          });
          logMsg = `✨ [오라 치유] 신성한 인과 복원 성광을 전신에 피워올렸습니다! 축복으로 소실되지 않은 전 부위 체력(HP)을 +35 치유했습니다!`;
          logType = 'heal';
          break;
          
        // --- Hunter 계열 ---
        case 'skill_hunter_dash':
          damage = 35 + Math.floor(stats.agility * 1.8);
          logMsg = `🏃 [차원 회피참] 초고속 궤도를 그리며 사각지대를 강습 통과했습니다! 적에게 ${damage}의 관통 참격 피해를 주었습니다.`;
          break;
        case 'skill_hunter_shield':
          setShieldActive(true);
          damage = 20 + Math.floor(stats.intellect * 0.8);
          logMsg = `🛡️ [반작용 장벽] 공간 왜곡형 보호막을 전개했습니다! 다음 치명적 공격으로부터 안전하며 적에게 ${damage}의 마법 데미지를 복사했습니다!`;
          break;
        case 'skill_hunter_execution':
          const isLowHP = battleEnemyHP < (battleEnemyMaxHP * 0.5); 
          const execBonus = isLowHP ? 2.5 : 1.2;
          damage = Math.floor((45 + stats.strength * 2.0) * execBonus);
          logMsg = `🗡 *일점섬 멸살참* 극도의 살기를 응집하여 급소를 전광석화처럼 통과했습니다! 적에게 ${damage}의 깊은 상흔을 주었습니다! ${isLowHP ? '(체력 50% 이하 필살 가중 처벌 극대 데미지!)' : ''}`;
          break;
          
        default:
          damage = 35;
          logMsg = `🧪 기예의 잔상을 휘둘러 적에게 ${damage}의 피해를 입혔습니다!`;
          break;
      }
      
      const nextHp = Math.max(0, battleEnemyHP - damage);
      setBattleEnemyHP(nextHp);
      addBattleLog(logMsg, logType);
      setIsRolling(false);
      
      // Floating combat popups for player core active skills
      if (damage > 0) {
        const isCrit = (skillId === 'skill_summon_dragon' || skillId === 'skill_hunter_execution' || skillId === 'skill_summon_shadow');
        triggerCombatPopup(`-${damage}`, 'enemy', isCrit ? 'critical' : 'damage');
      }
      if (skillId === 'skill_magic_restoration') {
        triggerCombatPopup(`+35 HP (All)`, 'player', 'heal');
      } else if (skillId === 'skill_hunter_shield' || skillId === 'skill_summon_golem') {
        triggerCombatPopup(`🛡️ BARRIER`, 'player', 'heal');
      }
      
      if (nextHp <= 0) {
        setTimeout(() => {
          endBattle(true);
        }, 800);
      } else {
        if (skillId === 'skill_magic_thunder' && Math.random() < 0.6) {
          addBattleLog(`⚡ [일시 감전]: 뇌전 충격의 마비로 인해 적이 다음 턴 행동 불가에 빠졌습니다! (나의 연속 공격 기회)`, 'skill');
        } else {
          nextTurn();
        }
      }
    }, 800);
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
        const bonusDmg = Math.floor(stats.health * 1.2);
        damage += bonusDmg;
        addBattleLog(`⚡ S급 금채란이 비아냥거리며 뒤에서 거드는 [황금색 참교육]! "+${bonusDmg} 폭발 속성 데미지 주입"`, 'skill');
      }

      // Deal damage
      // Calculate nextHp outside of state updater to prevent nested setting
      const nextHp = Math.max(0, battleEnemyHP - damage);
      setBattleEnemyHP(nextHp);

      addBattleLog(`⚔️ 주사위 🎲 [${actualRoll}] 굴림! 적에게 ${damage}의 데미지를 가했습니다!`, 'player');
      setIsRolling(false);

      // Trigger combat popup for normal attacks
      triggerCombatPopup(`-${damage}`, 'enemy', actualRoll >= 18 ? 'critical' : 'damage');

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
          triggerCombatPopup(`🛡️ BARRIER`, 'player', 'heal');
        } else {
          dmg = 25 + stats.intellect; // shield bash
          addBattleLog(`🛡️ 백운혁의 방패 치기! 적을 넉백시키고 ${dmg}의 데미지를 부여했습니다.`, 'ally');
          triggerCombatPopup(`-${dmg}`, 'enemy', 'damage');
        }
      } else if (allyId === 'geum') {
        dmg = 45 + Math.floor(stats.health * 0.4);
        addBattleLog(`⚡ 금채란이 공중에 수십 발의 황금 마석 탄환을 발포해 ${dmg}의 폭발 데미지를 뿜었습니다!`, 'ally');
        triggerCombatPopup(`-${dmg}`, 'enemy', 'critical');
      } else if (allyId === 'lim') {
        addBattleLog(`📖 임소연이 가죽 고서의 인과율을 복제하여 파티 공격력을 보정합니다. (모든 주사위 크리티컬 보정)`, 'ally');
        triggerCombatPopup(`📖 OPTIMIZE`, 'player', 'heal');
      } else if (allyId === 'kang') {
        dmg = 40 + Math.floor(stats.agility * 0.3) + Math.floor(stats.health * 0.2);
        addBattleLog(`🎯 B급 스나이퍼 강다인이 저격 라이플로 적의 심장을 관통하는 사격을 감행해 ${dmg}의 관통 데미지를 입혔습니다!`, 'ally');
        triggerCombatPopup(`-${dmg}`, 'enemy', 'critical');
      } else if (allyId === 'yoo') {
        dmg = 28 + Math.floor(stats.intellect * 0.3);
        addBattleLog(`🧭 C급 탐측사 유채은이 굴절 유도 마나 공간 파동탄을 쏘아 적의 밸런스를 흩뜨리며 ${dmg}의 정밀 치명 데미지를 가했습니다!`, 'ally');
        triggerCombatPopup(`-${dmg}`, 'enemy', 'damage');
      } else if (allyId === 'choi') {
        dmg = 35 + Math.floor(stats.strength * 0.4);
        addBattleLog(`🪓 D급 강습 전투원 최강식이 고함을 지르며 거대한 공격 도끼를 휘둘러 ${dmg}의 타격 데미지를 입혔습니다!`, 'ally');
        triggerCombatPopup(`-${dmg}`, 'enemy', 'damage');
      } else if (allyId === 'park') {
        dmg = 12 + Math.floor(stats.intellect * 0.1);
        setBodyPartsHP(prev => {
          let lowestPart: keyof BodyPartsHP = 'torso';
          let lowestVal = prev['torso'];
          (Object.keys(prev) as Array<keyof BodyPartsHP>).forEach(part => {
            if (prev[part] < lowestVal) {
              lowestVal = prev[part];
              lowestPart = part;
            }
          });
          const updatedVal = Math.min(100, prev[lowestPart] + 20);
          return { ...prev, [lowestPart]: updatedVal };
        });
        addBattleLog(`🧪 E급 보조 의료원 박소록이 [진통 영양제]를 주사했습니다! 가장 치명적인 부위를 보완해 +20 HP를 치유했습니다!`, 'heal');
        addBattleLog(`🧪 박소록이 날카로운 주사 바늘과 메스로 엄호 사격해 ${dmg}의 데미지를 보충했습니다.`, 'ally');
        triggerCombatPopup(`+20 HP`, 'player', 'heal');
        setTimeout(() => triggerCombatPopup(`-${dmg}`, 'enemy', 'damage'), 400);
      } else if (allyId === 'shin') {
        dmg = 10 + Math.floor(stats.strength * 0.1);
        addBattleLog(`📦 F급 신현민이 뒤쪽에서 골동품 수집 고압 마정 수류탄 보따리를 마구 투사해 ${dmg}의 화력 폭발 데미지를 흩뿌렸습니다!`, 'ally');
        triggerCombatPopup(`-${dmg}`, 'enemy', 'damage');
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
        triggerCombatPopup('💨 EVADE', 'player', 'evade');
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
        triggerCombatPopup('🛡️ BLOCKED', 'player', 'evade');
        setShieldActive(false);
        nextTurn();
        return;
      }

      // Calculate net damage outside of updater to prevent nested/concurrent setState side-effects
      const currentPartHP = bodyPartsHP[targetedPart];
      const nextHP = Math.max(0, currentPartHP - netDmg);

      addBattleLog(`💥 몬스터가 당신의 [${partLabel}]를 난폭하게 격타해 ${netDmg}의 아픔을 주었습니다. (부위 HP: ${nextHP}/100)`, 'enemy');
      triggerCombatPopup(`-${netDmg} HP`, 'player', 'damage');

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

  const renderRichBattleLog = (text: string, type: CombatLog['type']) => {
    // Regex splits the log using a set of delimiters for damage numbers, ranks, character names, and action terms
    const regex = /(\[[^\]]+\]|🎲 \[[0-9]+\]|\b(?!HP\b)\d+\b|S급|A급|B급|C급|D급|E급|F급|박지후|백운혁|금채란|임소연|강다인|유채은|최강식|박소록|신현민|회피|사망|보호막|치유|크리티컬|데미지|-\d+)/g;
    
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (!part) return null;
      
      // Match custom brackets
      if (part.startsWith('[') && part.endsWith(']')) {
        const cleaned = part.slice(1, -1);
        return (
          <span key={index} className="px-1 py-0.5 rounded-md text-[8.5px] font-bold mx-0.5 bg-neutral-900 border border-violet-900/40 text-violet-300 font-sans shadow-sm inline-block">
            {cleaned}
          </span>
        );
      }
      
      // Match dice roll e.g. 🎲 [20]
      if (part.startsWith('🎲 [')) {
        return (
          <span key={index} className="inline-flex items-center gap-0.5 bg-orange-950/80 text-orange-400 font-sans font-black border border-orange-850 px-1 py-0.5 text-[8.5px] rounded mx-0.5 animate-pulse">
            {part}
          </span>
        );
      }
      
      // Match plain numeric strings
      if (/^\d+$/.test(part)) {
        let numColor = 'text-amber-400';
        if (type === 'player' || type === 'skill') {
          numColor = 'text-emerald-400 font-black font-mono inline-block px-1.5 py-0.2 bg-emerald-950/40 rounded border border-emerald-900/30 text-[10.5px] mx-0.5';
        } else if (type === 'enemy') {
          numColor = 'text-rose-400 font-black font-mono inline-block px-1.5 py-0.2 bg-rose-950/40 rounded border border-rose-900/30 text-[10.5px] mx-0.5';
        } else if (type === 'heal') {
          numColor = 'text-teal-400 font-black font-mono inline-block px-1.5 py-0.2 bg-teal-950/40 rounded border border-teal-900/30 text-[10.5px] mx-0.5';
        } else {
          numColor = 'text-zinc-200 font-semibold font-mono';
        }
        return (
          <span key={index} className={`${numColor}`}>
            {part}
          </span>
        );
      }

      // Match character names
      if (['박지후', '백운혁', '금채란', '임소연', '강다인', '유채은', '최강식', '박소록', '신현민'].includes(part)) {
        const npcColors: { [key: string]: string } = {
          '백운혁': 'text-amber-400 font-extrabold',
          '금채란': 'text-yellow-300 font-extrabold',
          '임소연': 'text-purple-300 font-extrabold',
          '강다인': 'text-sky-300 font-semibold',
          '유채은': 'text-teal-300 font-semibold',
          '최강식': 'text-orange-300 font-semibold',
          '박소록': 'text-emerald-400 font-semibold',
          '신현민': 'text-zinc-400 font-medium'
        };
        const styleClass = npcColors[part] || 'text-cyan-400 font-extrabold';
        return <span key={index} className={`${styleClass} font-sans`}>{part}</span>;
      }
      
      // Rank labels like S급/F급
      if (/^[A-FS]급$/.test(part)) {
        return <span key={index} className="text-yellow-400 font-extrabold px-1 py-0.2 bg-amber-950/80 rounded border border-amber-800/80 text-[8.5px] mx-0.5">{part}</span>;
      }

      // Action modifiers
      if (part === '회피') {
        return <span key={index} className="text-cyan-400 font-black font-sans px-0.5 border border-cyan-900/30 bg-cyan-950/20 rounded">회피</span>;
      }
      if (part === '사망') {
        return <span key={index} className="text-red-500 font-black font-sans px-1 border border-red-950 bg-red-955/35 rounded animate-bounce">사망</span>;
      }
      if (part === '보호막') {
        return <span key={index} className="text-amber-400 font-bold font-sans px-0.5">보호막</span>;
      }
      if (part === '치유') {
        return <span key={index} className="text-teal-400 font-black font-sans px-0.5 border border-teal-900/30 bg-teal-950/45 rounded">치유</span>;
      }
      if (part === '크리티컬') {
        return <span key={index} className="text-orange-400 font-black font-sans px-1 bg-orange-950/40 border border-orange-800 rounded animate-pulse">크리티컬</span>;
      }
      
      return <span key={index}>{part}</span>;
    });
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
            <div className="relative flex flex-col gap-1.5 p-2 bg-neutral-900/60 border border-emerald-950/60 rounded-xl overflow-hidden min-h-[140px]">
              {/* Floating Combat Popups over Allied panel */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden z-20">
                <AnimatePresence>
                  {combatPopups.filter(p => p.side === 'player').map(p => {
                    let color = 'text-rose-500 font-extrabold text-[15px] drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]';
                    if (p.type === 'heal') color = 'text-teal-400 font-black text-[15px] drop-shadow-[0_0_6px_rgba(45,212,191,0.7)]';
                    if (p.type === 'evade') color = 'text-cyan-400 font-black text-[14px] drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]';
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ y: 35, opacity: 0, scale: 0.6 }}
                        animate={{ y: -35, opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, y: -60, scale: 0.7 }}
                        transition={{ duration: 1.0, ease: 'easeOut' }}
                        className={`${color} absolute font-mono select-none`}
                      >
                        {p.text}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

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
            <div className="flex flex-col gap-1.5 p-2 bg-neutral-900/60 border border-rose-950/60 rounded-xl relative overflow-hidden flex-1 justify-center min-h-[140px]">
              {/* Floating Combat Popups over Monster panel */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden z-20">
                <AnimatePresence>
                  {combatPopups.filter(p => p.side === 'enemy').map(p => {
                    let color = 'text-amber-400 font-extrabold text-[14px] drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]';
                    if (p.type === 'critical') color = 'text-orange-500 font-black text-[20px] tracking-tight drop-shadow-[0_0_10px_rgba(249,115,22,0.9)] animate-pulse';
                    if (p.type === 'damage') color = 'text-white font-extrabold text-[17px] drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]';
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ y: 35, opacity: 0, scale: 0.6 }}
                        animate={{ y: -45, opacity: 1, scale: p.type === 'critical' ? 1.4 : 1.1 }}
                        exit={{ opacity: 0, y: -70, scale: 0.7 }}
                        transition={{ duration: 1.0, ease: 'easeOut' }}
                        className={`${color} absolute font-mono select-none`}
                      >
                        {p.text}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

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
                let colorClass = 'text-neutral-300 border-neutral-700 bg-neutral-900/40';
                if (log.type === 'player') colorClass = 'text-emerald-100 bg-emerald-950/20 border-emerald-500/50';
                if (log.type === 'enemy') colorClass = 'text-rose-100 bg-rose-950/20 border-rose-500/50';
                if (log.type === 'system') colorClass = 'text-amber-100 bg-amber-950/25 border-amber-500/40';
                if (log.type === 'skill') colorClass = 'text-violet-100 bg-violet-950/20 border-violet-500/50';
                if (log.type === 'death') colorClass = 'text-red-300 bg-red-950/40 border-red-700 font-extrabold';
                if (log.type === 'evade') colorClass = 'text-cyan-100 bg-cyan-950/20 border-cyan-500/45';
                if (log.type === 'heal') colorClass = 'text-teal-100 bg-teal-950/20 border-teal-500/50';

                return (
                  <div key={log.id} className={`py-1 px-2 leading-relaxed break-words rounded-md border-l-2 ${colorClass} shadow-sm font-sans flex items-start gap-1.5`}>
                    <span className="shrink-0 font-mono text-[8px] opacity-70 bg-neutral-950/60 px-1 py-0.2 rounded mt-0.5 select-none uppercase tracking-tight">
                      {log.type === 'player' ? 'ME' : log.type === 'enemy' ? 'MON' : log.type === 'system' ? 'SYS' : log.type === 'skill' ? 'SKL' : log.type === 'heal' ? 'HEAL' : log.type === 'evade' ? 'EVD' : 'ALLY'}
                    </span>
                    <div className="flex-1 text-[10px] tracking-wide break-keep leading-relaxed text-zinc-100">
                      {renderRichBattleLog(log.text, log.type)}
                    </div>
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
                <Sword className="w-4 h-4 mb-2 animate-pulse text-white font-sans shrink-0" />
                <span className="text-[9px] uppercase font-bold tracking-wider">🗡️ 공격</span>
              </button>

              {/* Use Active learned skills */}
              <button
                disabled={currentTurnEntity !== 'player' || isRolling || acquiredSkills.length === 0}
                onClick={() => setShowSkillsMenu(!showSkillsMenu)}
                className={`flex flex-col items-center justify-center aspect-[5/3] border rounded-lg font-bold transition-all duration-150 py-1 relative overflow-hidden shrink-0 ${
                  acquiredSkills.length === 0
                    ? 'bg-neutral-950 border-neutral-850 text-neutral-650 cursor-not-allowed'
                    : showSkillsMenu
                      ? 'bg-emerald-900 hover:bg-emerald-850 text-emerald-100 border-emerald-400 scale-[1.02]'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500 hover:scale-[1.02]'
                }`}
              >
                <BookOpen className={`w-4 h-4 mb-2 shrink-0 ${acquiredSkills.length > 0 ? 'text-emerald-400 animate-bounce' : 'text-neutral-600'}`} />
                <span className="text-[9px] truncate">🔥 {acquiredSkills.length > 0 ? '스킬 시전' : '스킬 잠금'}</span>
                {acquiredSkills.length > 0 && (
                  <span className="absolute top-0 right-0 px-1.5 py-0.5 bg-emerald-500 text-[6.5px] font-black text-white uppercase rounded-bl">
                    {acquiredSkills.length}
                  </span>
                )}
              </button>

              {/* Escape retreat */}
              <button
                disabled={currentTurnEntity !== 'player' || isRolling}
                onClick={handleRetreat}
                className="flex flex-col items-center justify-center aspect-[5/3] bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 disabled:border-neutral-800 disabled:text-neutral-600 rounded-lg font-bold text-neutral-200 transition-all duration-150 py-1 shrink-0"
              >
                <ShieldAlert className="w-4 h-4 mb-2 text-amber-500 shrink-0" />
                <span className="text-[9px]">💨 퇴각</span>
              </button>
            </div>

            {/* Active Skills Selection Popover Box */}
            {showSkillsMenu && acquiredSkills.length > 0 && (
              <div className="bg-neutral-950 border border-neutral-850 p-2 rounded-lg flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between items-center bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                  <span className="text-[9px] text-neutral-300 font-bold flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    시전할 스킬 터치 (전수 완료: {acquiredSkills.length}종)
                  </span>
                  <button 
                    onClick={() => setShowSkillsMenu(false)}
                    className="text-[9.5px] text-rose-450 hover:text-rose-400 font-bold px-1.5 rounded cursor-pointer"
                  >
                    취소
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto">
                  {acquiredSkills.map(skillId => {
                    const skill = SKILLS.find(s => s.id === skillId);
                    if (!skill) return null;
                    const skillIcon = skillId.includes('shadow') ? '👥' :
                                      skillId.includes('golem') ? '🪨' :
                                      skillId.includes('dragon') ? '🐉' :
                                      skillId.includes('fire') ? '🔥' :
                                      skillId.includes('thunder') ? '⚡' :
                                      skillId.includes('restoration') ? '✨' :
                                      skillId.includes('dash') ? '🏃' :
                                      skillId.includes('shield') ? '🛡️' :
                                      skillId.includes('execution') ? '🗡️' : '📖';
                    return (
                      <button
                        key={skillId}
                        onClick={() => castActiveSkill(skillId)}
                        className="p-1.5 bg-neutral-900 border border-neutral-850 hover:border-emerald-500/50 hover:bg-neutral-800 rounded-lg flex items-center gap-2 text-left cursor-pointer active:scale-[0.98] transition-all"
                      >
                        <span className="text-base shrink-0">{skillIcon}</span>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center gap-1.5">
                            <span className="text-[10px] font-bold text-neutral-200 truncate">{skill.name}</span>
                            <span className="text-[7.5px] bg-neutral-950 px-1 py-0.5 border border-neutral-850 rounded font-black text-neutral-450 shrink-0">
                              {skill.type === 'summon' ? '소환계' : skill.type === 'magic' ? '마법계' : '일반계'}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-emerald-400 font-medium truncate mt-0.5">{skill.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
        <span>💖 체력 {stats.health}</span>
        <span>💰 {gold.toLocaleString()}G</span>
      </div>

    </div>
  );
}
