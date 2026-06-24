/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Npc, Equipment, Dungeon, BodyPartsHP, ChatHistory, EquipmentSlot } from '../types';
import { FAIL_LOGS, ACHIEVEMENTS, TITLES, Title, SKILLS, SKILL_BOOK_MAPPING } from '../data';
import { 
  User, Users, MessageSquare, Compass, Briefcase, Archive,
  ShieldAlert, Shield, Star, Heart, CheckCircle2, ChevronRight,
  Sparkles, CornerDownLeft, AlertCircle, ShoppingBag, Award, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAssetPath } from '../utils';
import { getActiveStoryForNpc, interpolateText, CHAT_STORIES, ChatStory, ChatStoryChoice } from '../data/chatStories';

interface PhoneModalProps {
  stats: { strength: number; agility: number; health: number; intellect: number };
  bodyPartsHP: BodyPartsHP;
  setBodyPartsHP: React.Dispatch<React.SetStateAction<BodyPartsHP>>;
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  npcs: Npc[];
  setNpcs: React.Dispatch<React.SetStateAction<Npc[]>>;
  chatHistory: ChatHistory;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory>>;
  inventory: Equipment[];
  setInventory: React.Dispatch<React.SetStateAction<Equipment[]>>;
  acquiredSkills?: string[];
  onLearnSkill?: (skillId: string, bookId: string) => void;
  dungeons: Dungeon[];
  onStartDungeon: (dungeon: Dungeon) => void;
  loopCount: number;
  recordCount: number;
  initialTab?: TabType;
  onClose: () => void;
  playerName: string;
  equippedTitleId: string | null;
  onEquipTitle: (titleId: string | null) => void;
}

const getPortraitPath = (id: string): string => {
  const mapping: Record<string, string> = {
    lim: 'imsoyeon',
    baek: 'baek',
    geum: 'geum',
    kang: 'kang',
    yoo: 'yoo',
    choi: 'choi',
    park: 'park',
    shin: 'shin',
  };
  const folder = mapping[id] || id;
  return getAssetPath(`images/portraits/${folder}/basic.png`);
};

export type TabType = 'status' | 'npc' | 'chat' | 'dungeon' | 'inventory' | 'records';

export default function PhoneModal({
  stats,
  bodyPartsHP,
  setBodyPartsHP,
  gold,
  setGold,
  npcs,
  setNpcs,
  chatHistory,
  setChatHistory,
  inventory,
  setInventory,
  acquiredSkills = [],
  onLearnSkill,
  dungeons,
  onStartDungeon,
  loopCount,
  recordCount,
  initialTab = 'status',
  onClose,
  playerName,
  equippedTitleId,
  onEquipTitle
}: PhoneModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [titlesExpanded, setTitlesExpanded] = useState<boolean>(false);
  const [activeEquipSlotSelector, setActiveEquipSlotSelector] = useState<EquipmentSlot | null>(null);
  const [equipmentWarning, setEquipmentWarning] = useState<string | null>(null);
  const [inventoryFilter, setInventoryFilter] = useState<string>('all');

  const getGradeStyle = (itemName: string) => {
    if (itemName.startsWith('S급')) return { text: 'text-amber-400 font-extrabold', bg: 'bg-amber-950/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]', border: 'border-amber-500/30 bg-amber-950/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]' };
    if (itemName.startsWith('A급')) return { text: 'text-blue-400 font-bold', bg: 'bg-blue-950/20 border-blue-900/30', border: 'border-blue-500/30 bg-blue-950/20' };
    if (itemName.startsWith('B급')) return { text: 'text-emerald-400 font-bold', bg: 'bg-emerald-950/20 border-emerald-900/30', border: 'border-emerald-500/30 bg-emerald-950/20' };
    if (itemName.startsWith('C급')) return { text: 'text-purple-400 font-bold', bg: 'bg-purple-950/20 border-purple-900/30', border: 'border-purple-500/30 bg-purple-950/20' };
    if (itemName.startsWith('D급')) return { text: 'text-zinc-350 font-medium', bg: 'bg-zinc-900/60', border: 'border-zinc-700 bg-zinc-900/60' };
    return { text: 'text-zinc-400', bg: 'bg-zinc-900/40', border: 'border-zinc-850 hover:border-zinc-750 bg-zinc-900/40' };
  };
  
  // Records section sub-tab: 'achievements' or 'logs'
  const [recordsSubTab, setRecordsSubTab] = useState<'achievements' | 'logs'>(
    initialTab === 'records' ? 'achievements' : 'logs'
  );

  // Calculate dynamic effective stats with title and equipment included
  const effectiveStats = (() => {
    const base = { ...stats };
    const equippedItems = inventory.filter(item => item.equipped);
    equippedItems.forEach(item => {
      if (item.bonuses.strength) base.strength += item.bonuses.strength;
      if (item.bonuses.agility) base.agility += item.bonuses.agility;
      if (item.bonuses.health) base.health += item.bonuses.health;
      if (item.bonuses.intellect) base.intellect += item.bonuses.intellect;
    });

    if (equippedTitleId) {
      const activeTitle = TITLES.find(t => t.id === equippedTitleId);
      if (activeTitle) {
        if (activeTitle.bonuses.strength) base.strength += activeTitle.bonuses.strength;
        if (activeTitle.bonuses.agility) base.agility += activeTitle.bonuses.agility;
        if (activeTitle.bonuses.health) base.health += activeTitle.bonuses.health;
        if (activeTitle.bonuses.intellect) base.intellect += activeTitle.bonuses.intellect;
      }
    }
    return base;
  })();

  // Dynamically enforce body parts loss equipment restrictions
  useEffect(() => {
    const isOneArmDown = bodyPartsHP.leftArm === 0 || bodyPartsHP.rightArm === 0;
    const isBothArmsDown = bodyPartsHP.leftArm === 0 && bodyPartsHP.rightArm === 0;
    const isBothLegsDown = bodyPartsHP.leftLeg === 0 && bodyPartsHP.rightLeg === 0;

    let updated = false;
    const nextInventory = inventory.map(item => {
      if (item.equipped) {
        if (item.slot === 'arms' && isOneArmDown) {
          updated = true;
          return { ...item, equipped: false };
        }
        if ((item.slot === 'weapon' || item.slot === 'ring') && isBothArmsDown) {
          updated = true;
          return { ...item, equipped: false };
        }
        if (item.slot === 'legs' && isBothLegsDown) {
          updated = true;
          return { ...item, equipped: false };
        }
      }
      return item;
    });

    if (updated) {
      setInventory(nextInventory);
    }
  }, [bodyPartsHP, inventory, setInventory]);

  // Dynamically evaluate achievements based on overall game data
  const isAchievementUnlocked = (id: string) => {
    switch (id) {
      case 'first_death':
        return loopCount > 1;
      case 'loop_detective':
        return recordCount >= 6;
      case 's_class_bond':
        return npcs.filter(n => n.id === 'baek' || n.id === 'geum' || n.id === 'lim').every(n => n.rapport >= 50);
      case 'gold_star':
        return gold >= 100000;
      case 's_class_stat':
        return (effectiveStats.strength >= 100 || effectiveStats.agility >= 100 || effectiveStats.health >= 100 || effectiveStats.intellect >= 100);
      case 'pilgrim_of_loops':
        return loopCount >= 5;
      case 'perfect_rapport':
        return npcs.some(n => n.rapport >= 95);
      case 'combat_god':
        return totalPower >= 500;
      case 'legendary_historian':
        return recordCount >= 12;
      case 'arsenal_master':
        return inventory.length >= 6;
      default:
        return false;
    }
  };

  // Chat messaging typing simulator state
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Combat power index calculation based on effective stats (including title/gear bonuses)
  const totalPower = Math.floor(
    effectiveStats.strength + effectiveStats.agility + effectiveStats.health + effectiveStats.intellect
  );

  const getRankInfo = (power: number) => {
    if (power >= 300) return { letter: 'S급', desc: '대략 S급 이하의 모든 던전에 홀로 진입해도 무난히 생환 가능할 만큼 완벽한 신계를 충족했습니다!', color: 'text-amber-400' };
    if (power >= 200) return { letter: 'A급', desc: '대략 A급 던전 이하까지는 특별한 동맹 도움 없이 거뜬히 단독 돌파하여 살아남을 수 있습니다.', color: 'text-blue-400' };
    if (power >= 140) return { letter: 'B급', desc: '대략 B급 던전까지는 심각한 절단 부위 파손이나 부상 없이 무난하게 살아남는 레벨입니다.', color: 'text-emerald-400' };
    if (power >= 90) return { letter: 'C급', desc: '대략 C급 던전 이하까지는 즉사 궤적에 걸리지 않고 비교적 평안하게 통과할 수 있습니다.', color: 'text-purple-400' };
    if (power >= 45) return { letter: 'D급', desc: '대략 D급 던전까지는 생환이 유효하지만, 그 이상은 우수한 동행인들을 대동하는 것이 생존율에 좋습니다.', color: 'text-zinc-300' };
    if (power >= 25) return { letter: 'E급', desc: '대략 E급 던전 정도에서 폐자재나 보급 물자를 수거하며 영양 조율 상태를 점검하는 것을 서포트합니다.', color: 'text-zinc-400' };
    return { letter: 'F급', desc: '가장 연약한 F급 레벨이므로, 던전 침투보단 안전 구역 일용직 노역으로 은신하는 것이 사지에 좋습니다.', color: 'text-zinc-500' };
  };

  // Check if any NPC has a pending message that needs user response
  const hasPendingChats = npcs.some(npc => {
    if (!npc.unlocked) return false;
    const history = chatHistory[npc.id] || [];
    const activeStory = getActiveStoryForNpc(npc.id, npc.rapport, recordCount, history);
    return !!activeStory;
  });

  // Background trigger effect: Automatically inject story NPC messages once unlocked
  React.useEffect(() => {
    let changed = false;
    const updatedHistory = { ...chatHistory };
    
    npcs.forEach(npc => {
      if (!npc.unlocked) return;
      const history = updatedHistory[npc.id] || [];
      const activeStory = getActiveStoryForNpc(npc.id, npc.rapport, recordCount, history);
      if (activeStory) {
        const lastTemplateMsg = activeStory.npcMessages[activeStory.npcMessages.length - 1];
        const lastTemplateClean = lastTemplateMsg.replace(/\{playerName\}/g, '').replace(/유저/g, '').trim();
        
        const hasStoryMessages = history.some(msg => {
          const cleanM = msg.text.replace(/\{playerName\}/g, '').replace(/유저/g, '').trim();
          return cleanM.includes(lastTemplateClean) || lastTemplateClean.includes(cleanM);
        });
        
        if (!hasStoryMessages) {
          const newMsgs = activeStory.npcMessages.map(text => ({
            sender: 'npc' as const,
            text: text.replaceAll('{playerName}', playerName || '유저'),
            timestamp: '메시지 도착'
          }));
          updatedHistory[npc.id] = [...history, ...newMsgs];
          changed = true;
        }
      }
    });
    
    if (changed) {
      setChatHistory(updatedHistory);
    }
  }, [activeTab, npcs, recordCount, playerName]);

  // Choice selector instead of typing
  const handleSelectChoice = (npcId: string, story: ChatStory, choice: ChatStoryChoice) => {
    if (isTyping) return;

    const playerMsg = {
      sender: 'player' as const,
      text: choice.text.replaceAll('{playerName}', playerName || '유저'),
      timestamp: '방금 전'
    };

    // Raise rapport
    setNpcs(prev => prev.map(n => {
      if (n.id === npcId) {
        const nextRapport = Math.min(100, n.rapport + choice.rapportChange);
        return {
          ...n,
          rapport: nextRapport,
          isAlly: nextRapport >= 50
        };
      }
      return n;
    }));

    setChatHistory(prev => ({
      ...prev,
      [npcId]: [...(prev[npcId] || []), playerMsg]
    }));

    setIsTyping(true);

    setTimeout(() => {
      const npcMsg = {
        sender: 'npc' as const,
        text: choice.reply.replaceAll('{playerName}', playerName || '유저'),
        timestamp: '실시간'
      };

      setChatHistory(prev => ({
        ...prev,
        [npcId]: [...(prev[npcId] || []), npcMsg]
      }));
      setIsTyping(false);
    }, 1200);
  };

  // Buy item from inventory system
  const purchaseGear = (item: Equipment) => {
    if (gold < item.price) {
      alert('소지하고 계신 골드가 부족합니다! 알바를 시도하거나 하위 균열을 타격해 자금을 얻으십시오.');
      return;
    }
    setGold(prev => prev - item.price);
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, purchased: true } : i));
  };

  const handleUseSkillBook = (item: Equipment) => {
    const skillId = SKILL_BOOK_MAPPING[item.id];
    if (!skillId) return;

    if (acquiredSkills.includes(skillId)) {
      alert(`⚠️ 이미 습득한 스킬입니다: ${SKILLS.find(s => s.id === skillId)?.name || '기예'}`);
      return;
    }

    if (onLearnSkill) {
      onLearnSkill(skillId, item.id);
    }
  };

  // Toggle Equip item status
  const toggleEquip = (itemId: string) => {
    const targetItem = inventory.find(i => i.id === itemId);
    if (!targetItem) return;

    // Check rules if trying to equip
    if (!targetItem.equipped) {
      if (targetItem.slot === 'arms') {
        if (bodyPartsHP.leftArm === 0 || bodyPartsHP.rightArm === 0) {
          setEquipmentWarning("🚨 장착 불가: 왼팔 혹은 오른팔이 소실(HP 0)되어 팔 장비를 장착할 수 없습니다.");
          return;
        }
      }
      if (targetItem.slot === 'weapon' || targetItem.slot === 'ring') {
        if (bodyPartsHP.leftArm === 0 && bodyPartsHP.rightArm === 0) {
          setEquipmentWarning("🚨 장착 불가: 양팔이 모두 소실(HP 0)되어 무기 및 반지 장비를 착용할 수 없습니다.");
          return;
        }
      }
      if (targetItem.slot === 'legs') {
        if (bodyPartsHP.leftLeg === 0 && bodyPartsHP.rightLeg === 0) {
          setEquipmentWarning("🚨 장착 불가: 양다리가 모두 소실(HP 0)되어 다리 장비를 장착할 수 없습니다.");
          return;
        }
      }
    }

    setInventory(prev => {
      const selected = prev.find(i => i.id === itemId);
      if (!selected) return prev;

      const updated = prev.map(item => {
        if (item.id === itemId) {
          return { ...item, equipped: !item.equipped };
        }
        // If same slot, unequip other
        if (item.slot === selected.slot && item.equipped) {
          return { ...item, equipped: false };
        }
        return item;
      });

      // Recalculate body HP modification dynamically
      const activeStats = updated.filter(item => item.equipped);
      const bonusHPHead = activeStats.reduce((sum, item) => sum + (item.hpModifier?.head || 0), 0);
      const bonusHPTorso = activeStats.reduce((sum, item) => sum + (item.hpModifier?.torso || 0), 0);

      // Instantly refresh bodyPartsHP top parameters safely
      setBodyPartsHP(prevHP => ({
        ...prevHP,
        head: Math.min(100 + bonusHPHead, prevHP.head),
        torso: Math.min(100 + bonusHPTorso, prevHP.torso),
      }));

      return updated;
    });
    setEquipmentWarning(null);
  };

  const equipItemFromSlotSelector = (itemId: string, targetSlot: EquipmentSlot) => {
    const selectedItem = inventory.find(i => i.id === itemId);
    if (!selectedItem) return;

    if (selectedItem.slot !== targetSlot) {
      // STRICT type check triggered! Warn user in visual overlay
      const slotNamesKo: Record<EquipmentSlot, string> = {
        head: '머리 (Head)',
        torso: '몸통 (Torso)',
        arms: '팔 (Arms)',
        legs: '다리 (Legs)',
        weapon: '무기 (Weapon)',
        ring: '반지 (Ring)',
        necklace: '목걸이 (Necklace)',
        skillbook: '비급서 (Skill Book)',
      };
      setEquipmentWarning(
        `장착 불가: 지정된 슬롯은 [${slotNamesKo[targetSlot]}] 파트전용입니다. 선택하신 '${selectedItem.name}' 장비는 [${slotNamesKo[selectedItem.slot]}] 속성이므로 호환 불가능합니다.`
      );
      return;
    }

    // Check rules
    if (targetSlot === 'arms') {
      if (bodyPartsHP.leftArm === 0 || bodyPartsHP.rightArm === 0) {
        setEquipmentWarning("🚨 장착 불가: 왼팔 혹은 오른팔이 소실(HP 0)되어 팔 장비를 장착할 수 없습니다.");
        return;
      }
    }
    if (targetSlot === 'weapon' || targetSlot === 'ring') {
      if (bodyPartsHP.leftArm === 0 && bodyPartsHP.rightArm === 0) {
        setEquipmentWarning("🚨 장착 불가: 양팔이 모두 소실(HP 0)되어 무기 및 반지 장비를 착용할 수 없습니다.");
        return;
      }
    }
    if (targetSlot === 'legs') {
      if (bodyPartsHP.leftLeg === 0 && bodyPartsHP.rightLeg === 0) {
        setEquipmentWarning("🚨 장착 불가: 양다리가 모두 소실(HP 0)되어 다리 장비를 장착할 수 없습니다.");
        return;
      }
    }

    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          return { ...item, equipped: true };
        }
        if (item.slot === targetSlot && item.equipped) {
          return { ...item, equipped: false };
        }
        return item;
      });

      // Recalculate and scale body HP modification dynamically
      const activeStats = updated.filter(i => i.equipped);
      const bonusHPHead = activeStats.reduce((sum, i) => sum + (i.hpModifier?.head || 0), 0);
      const bonusHPTorso = activeStats.reduce((sum, i) => sum + (i.hpModifier?.torso || 0), 0);
      const bonusHPLeftArm = activeStats.reduce((sum, i) => sum + (i.hpModifier?.leftArm || 0), 0);
      const bonusHPRightArm = activeStats.reduce((sum, i) => sum + (i.hpModifier?.rightArm || 0), 0);
      const bonusHPLeftLeg = activeStats.reduce((sum, i) => sum + (i.hpModifier?.leftLeg || 0), 0);
      const bonusHPRightLeg = activeStats.reduce((sum, i) => sum + (i.hpModifier?.rightLeg || 0), 0);

      setBodyPartsHP(prevHP => ({
        ...prevHP,
        head: Math.min(100 + bonusHPHead, prevHP.head),
        torso: Math.min(100 + bonusHPTorso, prevHP.torso),
        leftArm: Math.min(100 + bonusHPLeftArm, prevHP.leftArm),
        rightArm: Math.min(100 + bonusHPRightArm, prevHP.rightArm),
        leftLeg: Math.min(100 + bonusHPLeftLeg, prevHP.leftLeg),
        rightLeg: Math.min(100 + bonusHPRightLeg, prevHP.rightLeg),
      }));

      return updated;
    });

    setActiveEquipSlotSelector(null);
    setEquipmentWarning(null);
  };

  const unequipItemFromSlot = (targetSlot: EquipmentSlot) => {
    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.slot === targetSlot && item.equipped) {
          return { ...item, equipped: false };
        }
        return item;
      });

      // Recalculate body HP modification dynamically
      const activeStats = updated.filter(i => i.equipped);
      const bonusHPHead = activeStats.reduce((sum, i) => sum + (i.hpModifier?.head || 0), 0);
      const bonusHPTorso = activeStats.reduce((sum, i) => sum + (i.hpModifier?.torso || 0), 0);

      setBodyPartsHP(prevHP => ({
        ...prevHP,
        head: Math.min(100 + bonusHPHead, prevHP.head),
        torso: Math.min(100 + bonusHPTorso, prevHP.torso),
      }));

      return updated;
    });

    setActiveEquipSlotSelector(null);
    setEquipmentWarning(null);
  };

  return (
    <div className="absolute inset-0 z-40 bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden">
      
      {/* PHONE TOP BAR SYSTEM CHASSIS */}
      <div className="pt-8 px-4 pb-2 bg-zinc-900 border-b border-zinc-800/80 flex justify-between items-center text-xs font-mono shrink-0">
        <div className="flex items-center gap-1.5 text-blue-500 font-bold">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>System: 60 [Backdoor App]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400 bg-blue-950/20 px-2 py-1 border border-blue-800/40 rounded text-[11px] font-bold">인과 탐지 v{loopCount}.0</span>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 font-bold bg-zinc-800 px-2.5 py-1 rounded-lg cursor-pointer transition-colors text-xs"
          >
            뒤로가기 ✖
          </button>
        </div>
      </div>

      {/* CORE MENU NAVIGATION CHANNELS */}
      <div className="grid grid-cols-6 border-b border-zinc-800 bg-zinc-900 shrink-0">
        {[
          { tab: 'status', label: '상태', icon: User },
          { tab: 'npc', label: '헌터', icon: Users },
          { tab: 'chat', label: '연락', icon: MessageSquare },
          { tab: 'dungeon', label: '입장', icon: Compass },
          { tab: 'inventory', label: '인벤토리', icon: Briefcase },
          { tab: 'records', label: '조각', icon: Archive },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab as TabType);
                setSelectedNpcId(null);
              }}
              className={`py-2 px-1 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                isActive 
                  ? 'bg-zinc-950 text-blue-400 border-b-2 border-blue-500 shadow-inner font-bold font-display' 
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-xs font-bold">{item.label}</span>
              {item.tab === 'chat' && hasPendingChats && (
                <span className="absolute top-1.5 right-[18%] w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce border border-zinc-950" />
              )}
            </button>
          );
        })}
      </div>

      {/* DETAILED CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-zinc-950">
        <AnimatePresence mode="wait">
          
          {/* ===================== TAB 1: STATUS & BODY PARTS ===================== */}
          {activeTab === 'status' && (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="flex flex-col gap-3 flex-1 text-sm animate-fadeIn"
            >
              {/* PROFILE CARD */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden shadow-md">
                <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider font-bold">가설상 정체불량의 각성자</span>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-1.5 mt-1 font-display">
                  {playerName} <span className="text-xs bg-blue-950/40 text-blue-400 px-2 py-0.5 border border-blue-900/30 rounded font-mono font-bold">임시 대기</span>
                </h3>

                {/* 각성 등급 표기 */}
                <div className="mt-4 p-3.5 bg-zinc-950 border border-zinc-800/60 rounded-xl flex items-center gap-4 shadow-inner">
                  <div className={`text-4xl font-black font-display leading-none shrink-0 tracking-tighter ${getRankInfo(totalPower).color}`}>
                    {getRankInfo(totalPower).letter}
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">플레이어 각성 등급</div>
                    <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed break-keep font-medium">
                      {getRankInfo(totalPower).desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* RPG Symmetrical Equipment Paper Doll */}
              {(() => {
                const getGradeStyle = (itemName: string) => {
                  if (itemName.startsWith('S급')) return { text: 'text-amber-400 font-black', border: 'border-amber-500/30 bg-amber-950/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]' };
                  if (itemName.startsWith('A급')) return { text: 'text-blue-400 font-bold', border: 'border-blue-500/30 bg-blue-950/20' };
                  if (itemName.startsWith('B급')) return { text: 'text-emerald-400 font-bold', border: 'border-emerald-500/30 bg-emerald-950/20' };
                  if (itemName.startsWith('C급')) return { text: 'text-purple-400 font-bold', border: 'border-purple-500/30 bg-purple-950/20' };
                  if (itemName.startsWith('D급')) return { text: 'text-zinc-350 font-medium', border: 'border-zinc-700 bg-zinc-900/60' };
                  return { text: 'text-zinc-400', border: 'border-zinc-850 hover:border-zinc-750 bg-zinc-900/40' };
                };

                const leftSlots: { key: EquipmentSlot; name: string; emoji: string }[] = [
                  { key: 'head', name: '머리 (Head)', emoji: '👑' },
                  { key: 'torso', name: '몸통 (Torso)', emoji: '🛡️' },
                  { key: 'arms', name: '팔 (Arms)', emoji: '🧤' },
                  { key: 'legs', name: '다리 (Legs)', emoji: '🧦' },
                ];

                const rightSlots: { key: EquipmentSlot; name: string; emoji: string }[] = [
                  { key: 'weapon', name: '무기 (Weapon)', emoji: '⚔️' },
                  { key: 'ring', name: '반지 (Ring)', emoji: '💍' },
                  { key: 'necklace', name: '목걸이 (Necklace)', emoji: '📿' },
                ];

                const renderSlotButton = (slot: { key: EquipmentSlot; name: string; emoji: string }) => {
                  const equippedItem = inventory.find(i => i.equipped && i.slot === slot.key);
                  const style = equippedItem ? getGradeStyle(equippedItem.name) : { text: 'text-zinc-500', border: 'border-zinc-850 hover:border-zinc-750 bg-zinc-950/40' };

                  return (
                    <button
                      key={slot.key}
                      type="button"
                      onClick={() => {
                        setActiveEquipSlotSelector(slot.key);
                        setEquipmentWarning(null);
                      }}
                      className={`p-2 border transition-all rounded-xl h-[56px] text-left flex items-center gap-2 relative group cursor-pointer w-full ${style.border}`}
                    >
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-base transition-colors ${
                        equippedItem 
                          ? 'bg-zinc-900/40 text-[15px]' 
                          : 'bg-zinc-900/60 text-zinc-650 border border-zinc-800/60'
                      }`}>
                        {equippedItem ? slot.emoji : '+'}
                      </div>

                      <div className="flex-1 min-w-0 pr-0.5">
                        <div className="text-[8px] text-zinc-500 font-mono uppercase tracking-wide truncate">
                          {slot.name.split(' ')[0]} {equippedItem && <span className="text-[8px] opacity-85">[{equippedItem.name.substring(0, 2)}]</span>}
                        </div>
                        <div className={`text-[10.5px] font-bold truncate tracking-tight ${
                          equippedItem ? 'text-zinc-200' : 'text-zinc-550 italic font-normal'
                        }`}>
                          {equippedItem ? equippedItem.name.replace(/^[A-S]급\s*/, '') : '비어 있음'}
                        </div>
                      </div>
                    </button>
                  );
                };

                return (
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-3 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1.5 bg-blue-950/20 text-[9px] text-blue-400 font-mono font-bold tracking-wider rounded-bl border-l border-b border-zinc-850/40 uppercase">
                      Equipment Deck
                    </div>
                    
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>성좌 각성자의 의장 각인 (Sovereign Gear Deck)</span>
                    </span>

                    <div className="grid grid-cols-12 gap-3 items-center mt-1">
                      
                      {/* Left Column: Head, Torso, Arms, Legs */}
                      <div className="col-span-4 flex flex-col gap-2">
                        {leftSlots.map(slot => renderSlotButton(slot))}
                      </div>

                      {/* Center Graphic Hunter Silhouette */}
                      <div className="col-span-4 flex flex-col items-center justify-center h-full relative p-2 bg-zinc-950 border border-zinc-850 rounded-2xl shadow-inner min-h-[220px]">
                        <div className="absolute inset-4 rounded-full border border-blue-500/5 animate-[ping_4s_infinite]" />
                        <div className="absolute inset-8 rounded-full border border-zinc-500/10 animate-[spin_30s_linear_infinite]" />
                        
                        <svg className="w-24 h-36 opacity-30 text-blue-400 animate-pulse" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M50,15 C54,15 57,18 57,22 C57,26 54,29 50,29 C46,29 43,26 43,22 C43,18 46,15 50,15 Z M32,52 C32,38 42,32 50,32 C58,32 68,38 68,52 C68,58 66,70 65,85 C64.5,92 59,95 55,95 L45,95 C41,95 35.5,92 35,85 C34,70 32,58 32,52 Z" />
                        </svg>
                        
                        <div className="absolute bottom-3 text-center w-full z-10 px-1">
                          <div className="text-[9px] font-mono text-blue-500 font-black uppercase bg-blue-950/70 px-1.5 py-0.5 rounded border border-blue-900/30 inline-block mb-1.5">
                            SOVEREIGN
                          </div>
                          <div className="text-[11px] font-bold text-zinc-100 font-sans truncate px-1">
                            Lv.45 {playerName}
                          </div>
                          <div className="text-[10px] font-mono text-blue-400 font-black mt-0.5">
                            ✨ {totalPower.toLocaleString()} CP
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Weapon, Ring, Necklace, and Title info */}
                      <div className="col-span-4 flex flex-col gap-2">
                        {rightSlots.map(slot => renderSlotButton(slot))}
                        
                        {/* Title Display Mini Slot */}
                        {(() => {
                          const activeTitle = TITLES.find(t => t.id === equippedTitleId);
                          return (
                            <div className="p-2 border border-zinc-850 hover:border-zinc-750 bg-zinc-950/40 rounded-xl h-[56px] text-left flex items-center gap-2 relative w-full">
                              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-[14px] bg-zinc-900 text-amber-400 border border-zinc-800">
                                🏆
                              </div>
                              <div className="flex-1 min-w-0 pr-0.5">
                                <div className="text-[8px] text-zinc-500 font-mono uppercase tracking-wide truncate">
                                  칭호 (Title)
                                </div>
                                <div className="text-[10px] font-extrabold text-blue-400 truncate">
                                  {activeTitle ? activeTitle.name : '장착 칭호 무'}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                    </div>
                    
                    <p className="text-[9px] text-zinc-550 text-center leading-relaxed font-sans mt-0.5">
                      슬롯을 터치하면 성좌 무기고에서 각 파트의 적합 장비를 실시간 연동 장착합니다.
                    </p>
                  </div>
                );
              })()}

              {/* BODY PARAMETERS STATUS GRID (Page 6 concept) */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-3 shadow-md">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-400 animate-pulse" />
                  전사 전신 물리 파트 상태 (실시간 유효)
                </span>
                
                {/* Specific Warn banner removed per request */}

                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  {[
                    { key: 'head', name: '💀 머리 (Head)', value: bodyPartsHP.head, color: 'bg-zinc-100' },
                    { key: 'torso', name: '🛡️ 몸통 (Torso)', value: bodyPartsHP.torso, color: 'bg-zinc-300' },
                    { key: 'leftArm', name: '🥢 왼팔 (Left Arm)', value: bodyPartsHP.leftArm, color: 'bg-blue-500' },
                    { key: 'rightArm', name: '🥢 오른팔 (Right Arm)', value: bodyPartsHP.rightArm, color: 'bg-blue-500' },
                    { key: 'leftLeg', name: '🦵 왼다리 (Left Leg)', value: bodyPartsHP.leftLeg, color: 'bg-zinc-500' },
                    { key: 'rightLeg', name: '🦵 오른다리 (Right Leg)', value: bodyPartsHP.rightLeg, color: 'bg-zinc-500' }
                  ].map((part) => (
                    <div key={part.key} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                      <div className="flex justify-between font-mono text-xs text-zinc-300 font-bold mb-1.5">
                        <span>{part.name}</span>
                        <span className="text-zinc-400">{part.value} / 100</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-850">
                        <div 
                          className={`${part.color} h-full transition-all duration-300`}
                          style={{ width: `${part.value}%` }}
                        ></div>
                      </div>
                      {part.value <= 0 && (
                        <div className="text-[10px] text-rose-500 font-mono mt-1 text-center font-bold uppercase tracking-wider">DESTROYED</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-md">
                <span className="text-xs text-zinc-400 font-bold mb-3 block uppercase tracking-wide">💪 코어 포스 각성 수치 (장비 효과 포함)</span>
                <div className="grid grid-cols-2 gap-2.5 font-mono">
                  {[
                    { key: 'strength', label: '근력 (Strength)', base: stats.strength, effective: effectiveStats.strength },
                    { key: 'agility', label: '민첩 (Agility)', base: stats.agility, effective: effectiveStats.agility },
                    { key: 'health', label: '체력 (Health)', base: stats.health, effective: effectiveStats.health },
                    { key: 'intellect', label: '지력 (Intellect)', base: stats.intellect, effective: effectiveStats.intellect },
                  ].map((statItem) => {
                    const diff = statItem.effective - statItem.base;
                    return (
                      <div key={statItem.key} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex justify-between items-center shadow-inner text-xs">
                        <span className="text-zinc-450">{statItem.label}</span>
                        <span className="font-bold flex items-center">
                          <span className="text-zinc-200 text-sm">{statItem.effective}</span>
                          {diff > 0 && (
                            <span className="text-[10px] text-blue-400 font-bold ml-1.5 bg-blue-950/40 px-1 py-0.5 border border-blue-900/20 rounded">
                              +{diff}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ===================== LEARNED ACTIVE SKILLS ===================== */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-md flex flex-col gap-3">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  📖 각인된 액티브 스킬 ({acquiredSkills.length})
                </span>
                
                {acquiredSkills.length === 0 ? (
                  <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-850/60 text-center text-xs text-zinc-550 italic">
                    터득한 스킬이 없습니다. 인벤토리에서 비급서를 읽어 전수받으십시오.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
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
                        <div key={skillId} className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 flex gap-2.5 items-center">
                          <div className="text-xl shrink-0">{skillIcon}</div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs font-bold text-zinc-200 truncate">{skill.name}</span>
                              <span className="text-[8px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 border border-zinc-850 rounded font-bold shrink-0">{skill.type === 'summon' ? '소환계' : skill.type === 'magic' ? '마법계' : '일반계'}</span>
                            </div>
                            <p className="text-[10px] text-zinc-450 leading-normal mt-1 break-keep">{skill.description}</p>
                            <p className="text-[9px] text-emerald-500 font-bold mt-0.5">효과: {skill.effectText}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ===================== EXPANDABLE TITLE SYSTEM (Option 4) ===================== */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-md flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400 animate-pulse" />
                    👑 각성자 인과 칭호 (Equipped Title)
                  </span>
                  <button 
                    onClick={() => setTitlesExpanded(!titlesExpanded)}
                    className="text-xs text-blue-500 font-bold bg-blue-950/40 px-2.5 py-1 border border-blue-900/30 rounded-lg cursor-pointer hover:bg-blue-900/30 active:scale-95 transition-all"
                  >
                    {titlesExpanded ? '닫기 ▲' : '관리 ▼'}
                  </button>
                </div>

                {/* CURRENT TITLE BOX */}
                {(() => {
                  const activeTitle = TITLES.find(t => t.id === equippedTitleId);
                  if (activeTitle) {
                    return (
                      <div className="p-3 bg-zinc-950 rounded-xl border border-blue-500/30 flex gap-2.5 items-center">
                        <div className="text-2xl">🏆</div>
                        <div className="flex-1 col-span-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-blue-400 font-sans">{activeTitle.name}</span>
                            <span className="text-[10px] bg-blue-550/10 text-blue-400 px-1 rounded font-mono font-bold uppercase">Active</span>
                          </div>
                          <p className="text-[11px] text-zinc-450 break-keep leading-snug mt-1 font-sans">{activeTitle.description}</p>
                          
                          {/* Display Stat bonuses nicely */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(activeTitle.bonuses).map(([stat, val]) => (
                              <span key={stat} className="text-[10px] font-mono font-bold bg-zinc-900 px-1.5 py-0.5 border border-zinc-800 text-emerald-400 rounded">
                                {stat === 'strength' ? '근력' : stat === 'agility' ? '민첩' : stat === 'health' ? '체력' : '지력'} +{val}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => onEquipTitle(null)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-bold border border-rose-950 hover:bg-rose-950/20 px-2 py-1 rounded cursor-pointer active:scale-95"
                        >
                          해제
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-4 bg-zinc-950/80 border border-dashed border-zinc-800/80 rounded-xl text-center text-xs text-zinc-500 font-sans">
                        <p>장착된 칭호가 없습니다. (전신 주파수가 활성화되지 않음)</p>
                        <p className="text-[10px] text-zinc-650 mt-1">인과율 업적을 달성하면 강력한 보너스 칭호를 개방할 수 있습니다.</p>
                      </div>
                    );
                  }
                })()}

                {/* TITLE EXTENSION AREA */}
                {titlesExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col gap-2 mt-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800"
                  >
                    <span className="text-[10px] text-zinc-500 font-mono tracking-wider font-bold">전체 인과 칭호 목록 ({TITLES.filter(t => isAchievementUnlocked(t.achievementId)).length} / {TITLES.length})</span>
                    
                    {TITLES.map((title) => {
                      const unlocked = isAchievementUnlocked(title.achievementId);
                      const isEquipped = title.id === equippedTitleId;
                      
                      return (
                        <div 
                          key={title.id} 
                          className={`p-2.5 rounded-xl border flex flex-col gap-1.5 justify-between ${
                            unlocked 
                              ? isEquipped 
                                ? 'bg-blue-950/30 border-blue-500' 
                                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                              : 'bg-zinc-950/40 border-zinc-900 brightness-75'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[12px] font-bold ${unlocked ? 'text-zinc-200 font-sans font-extrabold' : 'text-zinc-500'}`}>
                                  {unlocked ? title.name : '🔒 봉인된 칭호'}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-zinc-400 mt-1 break-keep leading-relaxed font-sans">
                                {unlocked ? title.description : `도전과제 완료 시 해금: "${ACHIEVEMENTS.find(a => a.id === title.achievementId)?.title || title.id}"`}
                              </p>
                            </div>
                            
                            {unlocked ? (
                              isEquipped ? (
                                <span className="text-[10px] bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono h-max shrink-0">
                                  적용됨
                                </span>
                              ) : (
                                <button
                                  onClick={() => onEquipTitle(title.id)}
                                  className="text-[10px] font-bold bg-zinc-900 border border-zinc-700 hover:border-blue-500/50 text-zinc-300 px-2 py-1 rounded cursor-pointer active:scale-95 hover:text-blue-400 h-max shrink-0"
                                >
                                  장착
                                </button>
                              )
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-650 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850 h-max shrink-0">
                                잠금
                              </span>
                            )}
                          </div>

                          {/* Bonuses display */}
                          {unlocked && (
                            <div className="flex flex-wrap gap-1 font-mono text-[9px] mt-0.5">
                              {Object.entries(title.bonuses).map(([stat, val]) => (
                                <span key={stat} className="bg-zinc-950 border border-zinc-850 font-bold px-1.5 py-0.5 rounded text-zinc-400">
                                  {stat === 'strength' ? '근력' : stat === 'agility' ? '민첩' : stat === 'health' ? '체력' : '지력'} +{val}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ===================== TAB 2: RECRUITS & RAPPORT ===================== */}
          {activeTab === 'npc' && (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="flex flex-col gap-3 flex-1 text-sm animate-fadeIn"
            >
              {selectedNpcId === null ? (
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-zinc-500 font-mono font-bold uppercase tracking-wider">각성자 등급 연합 구조체</span>
                  {npcs.filter(n => n.unlocked).length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 py-10 text-center bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-sm mt-2">
                      <span className="text-4xl mb-3 animate-pulse">🔍</span>
                      <h4 className="font-bold text-zinc-200 text-sm">영입 가능한 동행자가 없습니다</h4>
                      <p className="text-xs text-zinc-400 mt-2 max-w-[200px] break-keep leading-relaxed">
                        서울 시내(훈련장, 힐링 센터, 일용직 현장)를 탐험하면서 이들의 발자취와 기맥을 추적하십시오. 운명의 교정이 그들을 조우하게 도울 수 있습니다.
                      </p>
                    </div>
                  ) : (
                    npcs.filter(n => n.unlocked).map((npc) => (
                      <button
                        key={npc.id}
                        onClick={() => setSelectedNpcId(npc.id)}
                        className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-blue-500/40 transition-all flex justify-between items-center shadow cursor-pointer active:scale-98"
                      >
                        <div className="flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center text-xl shadow-inner overflow-hidden">
                            <img src={getPortraitPath(npc.id)} alt={npc.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-zinc-200">{npc.name}</h4>
                              <span className="text-xs bg-blue-950 border border-blue-900/30 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">S_RANK</span>
                            </div>
                            <p className="text-xs text-zinc-400 text-ellipsis overflow-hidden line-clamp-1 max-w-[170px] mt-1 pr-1 font-sans font-medium">{npc.catchphrase}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 font-mono">
                          <div className="flex items-center gap-1.5 text-blue-400">
                            <Heart className="w-4 h-4 fill-blue-500 stroke-none" />
                            <span className="font-bold text-sm">{npc.rapport}/100</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                            npc.rapport >= 50 
                              ? 'bg-blue-950/30 text-blue-400 border-blue-900/30' 
                              : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                          }`}>
                            {npc.rapport >= 50 ? '참전 허가' : '인연 미달'}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                (() => {
                  const npc = npcs.find(n => n.id === selectedNpcId);
                  if (!npc) return null;
                  return (
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setSelectedNpcId(null)}
                        className="text-xs text-zinc-350 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl inline-self-start font-bold cursor-pointer hover:text-zinc-200 transition-colors uppercase font-mono tracking-wider shadow-sm"
                      >
                        ◀ 목록으로 돌아가기
                      </button>

                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl relative shadow-lg">
                        <div className="flex justify-center mb-3">
                          <div className="w-24 h-24 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-md overflow-hidden relative">
                            <img src={getPortraitPath(npc.id)} alt={npc.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                          </div>
                        </div>
                        <h4 className="text-base font-bold text-center text-zinc-100 font-display">{npc.name}</h4>
                        <div className="text-xs text-zinc-500 text-center font-mono mt-0.5 font-bold uppercase tracking-widest">{npc.rank} DETECTED</div>
                        
                        <div className="bg-zinc-950/55 p-3.5 rounded-xl border border-zinc-800 text-xs md:text-sm text-zinc-300 italic text-center mt-3 px-4 leading-relaxed break-keep font-sans">
                          {npc.catchphrase}
                        </div>

                        <div className="mt-4 flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 shadow-inner">
                          <span className="text-xs text-zinc-400 uppercase font-mono tracking-wider">인연 동기화 지수</span>
                          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-blue-400">
                            <Heart className="w-4 h-4 fill-blue-500 stroke-none animate-pulse" />
                            <span>{npc.rapport} / 100</span>
                          </div>
                        </div>
                        
                        <div className="mt-3.5 flex flex-col gap-3 text-xs md:text-sm leading-relaxed">
                          <p className="text-zinc-300 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/40 text-xs md:text-sm">{npc.description}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mt-1">
                            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
                              <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">👍 선호 기재</span>
                              <ul className="list-disc list-inside text-zinc-400 text-xs mt-1.5 gap-1.5 flex flex-col font-medium">
                                {npc.likes.map((l, i) => <li key={i}>{l}</li>)}
                              </ul>
                            </div>
                            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">👎 혐오 상황</span>
                              <ul className="list-disc list-inside text-zinc-400 text-xs mt-1.5 gap-1.5 flex flex-col font-medium">
                                {npc.dislikes.map((d, i) => <li key={i}>{d}</li>)}
                              </ul>
                            </div>
                          </div>

                          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                              <Shield className="w-4 h-4 text-blue-400" /> {npc.rank.split(' ')[0]} 특화 동시 참전 패시브
                            </span>
                            <ul className="list-disc list-inside text-zinc-400 text-xs mt-1.5 gap-1.5 flex flex-col font-medium font-mono p-1 rounded">
                              {npc.features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()
              )}
            </motion.div>
          )}

          {/* ===================== TAB 3: CONTACT / MESSENGER ===================== */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="flex flex-col gap-3 flex-1 overflow-hidden animate-fadeIn"
            >
              {selectedNpcId === null ? (
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-zinc-400 font-mono font-bold uppercase tracking-widest">동선 백도어 포팅 인자</span>
                  {npcs.filter(n => n.unlocked).length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 py-10 text-center bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-sm mt-2">
                      <span className="text-4xl mb-3 animate-pulse">📡</span>
                      <h4 className="font-bold text-zinc-200 text-sm">연결된 단말기 신호가 없습니다</h4>
                      <p className="text-xs text-zinc-400 mt-2 max-w-[200px] break-keep leading-relaxed">
                        상대방을 실제로 조우하여 기맥 주파수를 도출한 이후에만 보안 연락망 단선 채널의 긴급 개설이 이루어집니다.
                      </p>
                    </div>
                  ) : (
                    npcs.filter(n => n.unlocked).map((npc) => {
                      const npcHistory = chatHistory[npc.id] || [];
                      const lastMsg = npcHistory.slice(-1)[0];
                      const activeStory = getActiveStoryForNpc(npc.id, npc.rapport, recordCount, npcHistory);
                      const isPending = !!activeStory;

                      return (
                        <button
                          key={npc.id}
                          onClick={() => setSelectedNpcId(npc.id)}
                          className={`p-3.5 bg-zinc-900 border rounded-xl text-left hover:border-blue-500/30 transition-all flex justify-between items-center shadow cursor-pointer active:scale-98 ${
                            isPending ? 'border-rose-500/40 bg-zinc-900/90' : 'border-zinc-800'
                          }`}
                        >
                          <div className="flex gap-3 items-center flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-851 flex items-center justify-center text-base shadow-inner relative overflow-hidden">
                              <img src={getPortraitPath(npc.id)} alt={npc.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                              {isPending && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-bounce border border-zinc-900 z-10" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-zinc-200">{npc.name}</h4>
                                <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                                  isPending ? 'bg-rose-950/40 text-rose-400 border-rose-900/30 animate-pulse' : 'bg-blue-950/40 text-blue-400 border-blue-900/30'
                                }`}>
                                  {isPending ? 'new alert' : 'active'}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 truncate mt-1 pr-4 font-sans font-medium">
                                {lastMsg ? lastMsg.text : '암호 채널이 동기화 대기 중입니다.'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isPending ? 'text-rose-400 scale-105' : 'text-zinc-500'}`} />
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                (() => {
                  const npc = npcs.find(n => n.id === selectedNpcId);
                  const history = chatHistory[selectedNpcId] || [];
                  if (!npc) return null;

                  const activeStory = getActiveStoryForNpc(npc.id, npc.rapport, recordCount, history);

                  return (
                    <div className="flex flex-col flex-1 overflow-hidden border border-zinc-800 rounded-2xl shadow-lg">
                      {/* Sub header */}
                      <div className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 p-3 shrink-0">
                        <button 
                          onClick={() => setSelectedNpcId(null)}
                          className="text-xs text-zinc-350 font-bold bg-zinc-950 hover:bg-zinc-800 px-3 py-1.5 rounded-lg inline-self-start cursor-pointer border border-zinc-850"
                        >
                          ◀ 뒤로가기
                        </button>
                        <span className="text-xs font-bold font-mono text-zinc-200">{npc.name} ({npc.rank.split(' ')[0]})</span>
                        <span className="text-xs text-blue-400 font-mono font-bold bg-blue-950/20 px-2 py-0.5 rounded border border-blue-900/10">{npc.rapport}% 인연</span>
                      </div>

                      {/* Chat messages stream */}
                      <div className="flex-1 bg-zinc-950 p-3 overflow-y-auto flex flex-col gap-3 min-h-[180px]">
                        {history.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500 italic text-xs gap-2 font-sans font-medium h-full my-auto">
                            <span className="text-lg animate-pulse">📡</span>
                            <span>국가 공인 보안 규약 암호 회선 동기화 완료.</span>
                            <span className="text-[11px] not-italic text-zinc-600">"{npc.name}"님과의 직통 백도어 메신저 채널입니다. 호감도와 기록 상태를 분석하여 인과 대화가 전파됩니다.</span>
                          </div>
                        ) : (
                          history.map((msg, idx) => {
                            const isMe = msg.sender === 'player';
                            return (
                              <div 
                                key={idx} 
                                className={`flex flex-col max-w-[240px] rounded-xl p-2.5 leading-relaxed text-xs shadow-sm ${
                                  isMe 
                                    ? 'self-end bg-zinc-100 text-zinc-950 rounded-tr-none font-semibold' 
                                    : 'self-start bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none font-medium'
                                }`}
                              >
                                {!isMe && (
                                  <span className="text-[10px] text-blue-450 font-extrabold mb-1 font-mono tracking-wide">{npc.name}</span>
                                )}
                                <p className="break-all font-sans whitespace-pre-line">{msg.text}</p>
                                <span className={`text-[8.5px] font-mono mt-1 block ${isMe ? 'text-zinc-500 text-right' : 'text-zinc-500'}`}>
                                  {msg.timestamp}
                                </span>
                              </div>
                            );
                          })
                        )}

                        {/* Animated Typing Indicator */}
                        {isTyping && (
                          <div className="self-start bg-zinc-900 border border-zinc-855 text-zinc-400 rounded-xl rounded-tl-none p-3.5 leading-relaxed text-xs shadow-sm flex flex-col gap-1.5 max-w-[200px]">
                            <span className="text-[10px] text-blue-400 font-extrabold font-mono tracking-wider animate-pulse">{npc.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs animate-bounce font-mono">입력 중...</span>
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat interactive replies selection instead of manual input keyboard */}
                      <div className="p-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
                        {activeStory ? (
                          <div className="flex flex-col gap-2">
                            <div className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              <span>인과율 조율 가능한 최적 답변 분기</span>
                            </div>
                            {activeStory.choices.map((choice) => (
                              <button
                                key={choice.id}
                                disabled={isTyping}
                                onClick={() => handleSelectChoice(npc.id, activeStory, choice)}
                                className={`w-full p-3 bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900 text-left text-zinc-200 hover:text-blue-400 rounded-xl text-xs font-semibold leading-relaxed transition-all flex items-start gap-2.5 active:scale-[0.99] group shadow-inner ${
                                  isTyping ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                              >
                                <CornerDownLeft className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 shrink-0 mt-0.5" />
                                <span className="flex-1 break-keep">{choice.text.replaceAll('{playerName}', playerName || '유저')}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-3 text-zinc-500 font-medium text-xs leading-relaxed font-sans">
                            📱 <span className="font-bold text-zinc-300">"{npc.name}"</span> 님과의 대화가 최신 상태입니다.<br />
                            <span className="text-[10px] text-zinc-600 block mt-0.5">새로운 인과 장해(기록 파편)를 획득하거나 호감도를 높여 전파망을 복원하세요!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </motion.div>
          )}

          {/* ===================== TAB 4: DUNGEON ENTRIES ===================== */}
          {activeTab === 'dungeon' && (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="flex flex-col gap-3 flex-1 text-sm animate-fadeIn"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-mono font-bold uppercase tracking-wider">서울 시내 출몰 마계 균열 게이트</span>
                <span className="text-[10px] text-blue-400 font-mono font-bold">주파수 변동 동조</span>
              </div>

              <details className="group p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-400 leading-relaxed transition-all cursor-pointer">
                <summary className="font-bold flex items-center gap-1.5 text-zinc-300 font-sans list-none select-none">
                  <span className="transition-transform duration-200 group-open:rotate-90 text-[10px] text-blue-400">▶</span>
                  <span>🔮 스마트폰 기맥 연동기 설명서 (확장 시 클릭)</span>
                </summary>
                <div className="mt-2 text-zinc-450 leading-relaxed font-sans font-medium border-t border-zinc-800/50 pt-2 border-dashed">
                  기맥 파장 간섭률에 의거하여, 던전 균열 좌표는 하루에서 최대 3일 동안 무작위로 유지됩니다. 현재 총 {dungeons.length}개의 균열이 감지되고 있으며, 60일이 점차 경과되어 침공이 심화될수록 활성화 가능한 던전 채널의 용량이 <strong>최대 8개</strong>까지 확장되어 동시다발적으로 개문됩니다.
                </div>
              </details>

              <div className="flex flex-col gap-2.5">
                {dungeons.map((d) => {
                  return (
                    <div
                      key={d.id}
                      className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl relative flex justify-between items-center hover:border-blue-500/40 transition-all shadow"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-zinc-100">{d.name}</h4>
                          <span className="text-xs bg-blue-950/40 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded font-mono font-bold">
                            {d.rank}
                          </span>
                          {d.daysLeft && (
                            <span className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-mono font-bold">
                              ⏳ {d.daysLeft}일 남음
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2.5 text-xs text-zinc-400 font-mono mt-1.5 flex-wrap font-medium">
                          <span>💪 요구 CP: {d.recommendedPower}</span>
                          <span>⚡ 피로도: -{d.fatigueCost}</span>
                          <span className="text-zinc-200 font-bold">💰 포상: {d.rewards.gold.toLocaleString()}G</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onStartDungeon(d)}
                        className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono rounded-xl shadow cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                      >
                        진입 소모
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ===================== TAB 5: GEAR SHOP / INVENTORY ===================== */}
          {activeTab === 'inventory' && (() => {
            const ownedItems = inventory.filter(item => item.purchased);
            
            const categoryMeta = [
              { value: 'all', label: '전체' },
              { value: 'head', label: '머리' },
              { value: 'necklace', label: '목걸이' },
              { value: 'torso', label: '몸통' },
              { value: 'arms', label: '팔' },
              { value: 'legs', label: '다리' },
              { value: 'weapon', label: '무기' },
              { value: 'ring', label: '반지' },
              { value: 'skillbook', label: '스킬북' },
            ];

            const filteredItems = inventoryFilter === 'all'
              ? ownedItems
              : ownedItems.filter(item => item.slot === inventoryFilter);

            return (
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                className="flex flex-col gap-3 flex-1 text-sm animate-fadeIn"
              >
                {/* HUD Bar */}
                <div className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 flex justify-between items-center font-mono shadow">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">헌터 보관 가방</span>
                  <span className="text-zinc-100 font-bold text-xs">{ownedItems.length} 개 보유 중</span>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-1 p-1 bg-zinc-950 border border-zinc-850/80 rounded-2xl font-sans">
                  {categoryMeta.map((cat) => {
                    const isActive = inventoryFilter === cat.value;
                    const catCount = cat.value === 'all'
                      ? ownedItems.length
                      : ownedItems.filter(item => item.slot === cat.value).length;

                    return (
                      <button
                        key={cat.value}
                        onClick={() => setInventoryFilter(cat.value)}
                        className={`px-2 py-1 text-[10px] md:text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                          isActive
                            ? 'bg-violet-955 text-violet-400 border border-violet-800 font-semibold shadow'
                            : 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-850/20 text-zinc-400 hover:text-zinc-200 font-medium'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {catCount > 0 && (
                          <span className={`text-[8.5px] px-1 rounded-full font-mono ${
                            isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-zinc-950 text-zinc-500'
                          }`}>
                            {catCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {equipmentWarning && (
                  <div className="p-2.5 bg-rose-955/20 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl text-center select-none animate-bounce-slow">
                    {equipmentWarning}
                  </div>
                )}

                {/* Owned Inventory List */}
                <div className="flex flex-col gap-2.5">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      // Mapped skill checking for skillbook
                      const skillId = SKILL_BOOK_MAPPING[item.id];
                      const isSkillLearned = skillId ? acquiredSkills.includes(skillId) : false;

                      return (
                        <div
                          key={item.id}
                          className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex justify-between items-center relative gap-4 shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-sm text-zinc-100 font-display">{item.name}</h4>
                              <span className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-855 text-violet-400 uppercase font-bold font-mono">
                                {item.slot === 'skillbook' ? '스킬북' : item.slot}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed pr-2 font-sans font-medium">{item.description}</p>
                            
                            {/* Stat bonuses description */}
                            <div className="flex gap-2.5 text-[10px] text-blue-400 font-mono mt-1.5 flex-wrap font-bold">
                              {item.bonuses.strength && <span>💪 근력 +{item.bonuses.strength}</span>}
                              {item.bonuses.agility && <span>🏃 민첩 +{item.bonuses.agility}</span>}
                              {item.bonuses.health && <span>💖 체력 +{item.bonuses.health}</span>}
                              {item.bonuses.intellect && <span>📖 지력 +{item.bonuses.intellect}</span>}
                              {item.hpModifier?.head && <span>🧠 머리 HP +{item.hpModifier.head}</span>}
                              {item.hpModifier?.torso && <span>🏥 몸통 HP +{item.hpModifier.torso}</span>}
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-1.5 min-w-[80px]">
                            {item.slot === 'skillbook' ? (
                              <button
                                disabled={isSkillLearned}
                                onClick={() => handleUseSkillBook(item)}
                                className={`w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-transform active:scale-[0.97] shadow-sm text-center font-sans ${
                                  isSkillLearned
                                    ? 'bg-zinc-850 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                                    : 'bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900/40 text-emerald-400'
                                }`}
                              >
                                {isSkillLearned ? '습득 완료' : '전수 학습'}
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleEquip(item.id)}
                                className={`w-full py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
                                  item.equipped 
                                    ? 'bg-blue-955/40 text-blue-400 border border-blue-900/30 font-black' 
                                    : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200'
                                }`}
                              >
                                {item.equipped ? 'EQUIPPED' : '장착하기'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : ownedItems.length > 0 ? (
                    <div className="p-8 text-center bg-zinc-900 border border-zinc-850 rounded-2xl font-sans text-xs">
                      <Archive className="w-8 h-8 text-zinc-650 mx-auto opacity-40 mb-2" />
                      <p className="text-zinc-400 font-bold">해당 카테고리 비어 있음</p>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed break-keep">
                        보유중인 [{categoryMeta.find(c => c.value === inventoryFilter)?.label}] 항목이 가방에 존재하지 않습니다.<br/>
                        홍대 기밀 암시장이나 전투 게이트 완료를 통해 보상품을 획득하십시오!
                      </p>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-zinc-900 border border-zinc-850 rounded-2xl font-sans text-xs">
                      <Archive className="w-8 h-8 text-zinc-650 mx-auto opacity-40 mb-2" />
                      <p className="text-zinc-400 font-bold">가방 비어 있음 (Empty Bag)</p>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed break-keep">
                        보유하신 무기나 방어구, 스킬 독서북이 존재하지 않습니다.<br/>
                        암시장(지도상의 홍대 상가)에서 기초 사양을 매수하거나 던전 균열을 클리어해 유물 장비를 획득해 보십시오!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })()}

          {/* ===================== TAB 6: ARCHIVED LOOP SCATTERED SHARDS ===================== */}
          {activeTab === 'records' && (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="flex flex-col gap-3 flex-1 text-sm animate-fadeIn"
            >
              {/* Backdoor analysis panel info */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden shadow">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest block mb-1 font-bold">국가 전술 예측 모형</span>
                <h4 className="font-bold text-xs text-zinc-200">S급 게이트 침색 장벽 정밀 공정 시뮬레이터</h4>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 text-center shadow-inner">
                    <span className="text-[10px] text-zinc-500 font-mono">해독 신호 노드</span>
                    <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">{recordCount} / {FAIL_LOGS.length} 파일</div>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 text-center shadow-inner">
                    <span className="text-[10px] text-zinc-500 font-mono">보안 동조화 수준</span>
                    <div className="text-lg font-bold text-zinc-200 font-mono mt-0.5">LEVEL_v{loopCount}.0</div>
                  </div>
                </div>
              </div>

              {/* Sub tab selector for records */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900 border border-zinc-850 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setRecordsSubTab('achievements')}
                  className={`py-2 px-1 text-center font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    recordsSubTab === 'achievements'
                      ? 'bg-zinc-800 text-amber-400 shadow-sm font-semibold'
                      : 'text-zinc-500 hover:text-zinc-350 font-medium'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>시스템 업적</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecordsSubTab('logs')}
                  className={`py-2 px-1 text-center font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    recordsSubTab === 'logs'
                      ? 'bg-zinc-800 text-blue-400 shadow-sm font-semibold'
                      : 'text-zinc-500 hover:text-zinc-350 font-medium'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>차원 기밀 보고</span>
                </button>
              </div>

              {recordsSubTab === 'achievements' ? (
                <div className="flex flex-col gap-2.5 pb-4">
                  <span className="text-xs text-zinc-400 font-bold block mt-1.5 uppercase tracking-wide">🏆 실시간 달성 가능한 시스템 시각화 도전 업적</span>
                  {ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = isAchievementUnlocked(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className={`p-3.5 rounded-2xl border leading-relaxed shadow-sm transition-all ${
                          isUnlocked 
                            ? 'bg-gradient-to-r from-zinc-900 to-amber-955/20 border-amber-500/30 text-amber-100' 
                            : 'bg-zinc-950/45 border-zinc-800 border-dashed text-zinc-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5 justify-between">
                          <span className={`text-xs font-bold flex items-center gap-1 ${isUnlocked ? 'text-amber-400' : 'text-zinc-550'}`}>
                            {isUnlocked ? '⭐' : '⚙️'} {ach.title}
                          </span>
                          <span className={`text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            isUnlocked 
                              ? 'bg-amber-950/40 border border-amber-800/40 text-amber-400 font-semibold' 
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-650'
                          }`}>
                            {isUnlocked ? 'COMPLETE' : 'LOCKED'}
                          </span>
                        </div>
                        <p className={`text-xs font-sans leading-relaxed ${isUnlocked ? 'text-zinc-350' : 'text-zinc-500'}`}>
                          {ach.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 pb-4">
                  <span className="text-xs text-zinc-400 font-bold block mt-1.5 uppercase tracking-wide">💾 복원 완료된 국가 보안 기밀 보고서</span>
                  {FAIL_LOGS.map((log) => {
                    const isUnlocked = recordCount >= log.id;
                    return (
                      <div
                        key={log.id}
                        className={`p-3.5 rounded-2xl border leading-relaxed shadow-sm transition-all ${
                          isUnlocked 
                            ? 'bg-zinc-900 border-zinc-805 text-zinc-200' 
                            : 'bg-zinc-950/40 border-dashed border-zinc-850 text-zinc-500 select-none'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5 justify-between">
                          <span className={`text-xs font-bold ${isUnlocked ? 'text-blue-400' : 'text-zinc-550'}`}>
                            {log.title}
                          </span>
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                            {isUnlocked ? '🔓 기밀 해제' : '🔒 암호 차단'}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-sans font-medium text-zinc-350">
                          {isUnlocked ? log.text : '차원 심층 게이트 유물을 탐지 확보하여 기맥 암호를 추가 해독하십시오...'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 5. OVERLAY SLOT SELECTOR ADAPTOR */}
      <AnimatePresence>
        {activeEquipSlotSelector && (
          <div className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs flex flex-col justify-end">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl max-h-[85%] overflow-hidden flex flex-col shadow-[0_-15px_40px_rgba(59,130,246,0.15)] text-left"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-widest">
                    Equip Slot Adaptor
                  </span>
                  <span className="text-sm font-bold text-zinc-100 mt-0.5">
                    [{activeEquipSlotSelector === 'head' ? '머리' : 
                      activeEquipSlotSelector === 'torso' ? '몸통' :
                      activeEquipSlotSelector === 'arms' ? '팔' :
                      activeEquipSlotSelector === 'legs' ? '다리' :
                      activeEquipSlotSelector === 'weapon' ? '무기' :
                      activeEquipSlotSelector === 'ring' ? '반지' : '목걸이'}] 장비 교체 장치
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setActiveEquipSlotSelector(null);
                    setEquipmentWarning(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-bold"
                >
                  닫기 ✖
                </button>
              </div>

              {/* Error Alerts / Type Warnings */}
              {equipmentWarning && (
                <div className="mx-4 mt-3 p-3 bg-red-950/40 border border-red-900/30 text-rose-400 rounded-xl text-xs flex gap-2 items-center animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="font-semibold leading-relaxed">{equipmentWarning}</span>
                </div>
              )}

              {/* Item Lists */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">소지 장비 리스트</span>
                
                {/* Unequip Option */}
                <div className="p-3 bg-zinc-950/50 border border-zinc-850/80 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center font-bold text-xs">-</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-400">장비 해제</span>
                      <span className="text-[10px] text-zinc-550">현재 활성화된 장비를 탈거하고 마력을 비웁니다.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => unequipItemFromSlot(activeEquipSlotSelector)}
                    className="px-3.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all shadow"
                  >
                    해제하기
                  </button>
                </div>

                {/* Display ALL purchased items. They can click on ANY item! If the item slot matches, we equip. If not, we block and throw warning! */}
                {(() => {
                  const purchasedItems = inventory.filter(i => i.purchased);
                  if (purchasedItems.length === 0) {
                    return (
                      <div className="p-8 text-center text-zinc-500 text-xs italic">
                        소지중인 장비가 없습니다. [상점] 탭에서 길드 장비를 인수해 오십시오!
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-2">
                      {purchasedItems.map(item => {
                        const isCurrentlyEquippedHere = item.equipped && item.slot === activeEquipSlotSelector;
                        const isCompatible = item.slot === activeEquipSlotSelector;
                        const style = getGradeStyle(item.name);
                        
                        const slotNamesKo: Record<EquipmentSlot, string> = {
                          head: '머리 (Head)',
                          torso: '몸통 (Torso)',
                          arms: '팔 (Arms)',
                          legs: '다리 (Legs)',
                          weapon: '무기 (Weapon)',
                          ring: '반지 (Ring)',
                          necklace: '목걸이 (Necklace)',
                          skillbook: '비급서 (Skill Book)',
                        };

                        return (
                          <div 
                            key={item.id}
                            onClick={() => equipItemFromSlotSelector(item.id, activeEquipSlotSelector)}
                            className={`p-3 rounded-2xl border flex justify-between items-center transition-all cursor-pointer ${
                              isCurrentlyEquippedHere 
                                ? 'bg-blue-950/20 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                                : isCompatible
                                  ? 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 hover:border-zinc-750'
                                  : 'bg-zinc-950/40 border-zinc-900/60 hover:bg-zinc-950/50 opacity-60'
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-xs font-bold ${style.text}`}>{item.name}</span>
                                <span className="text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-500 uppercase font-black">
                                  {slotNamesKo[item.slot]?.split(' ')[0] || item.slot}
                                </span>
                                {isCurrentlyEquippedHere && (
                                  <span className="text-[8px] bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase border border-blue-900/30">
                                    Wearing
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-1 truncate">{item.description}</p>
                              
                              {/* Stats preview */}
                              <div className="flex gap-2 text-[9px] text-blue-400 font-mono mt-1 font-extrabold">
                                {item.bonuses.strength !== undefined && item.bonuses.strength > 0 && <span>💪 근력 +{item.bonuses.strength}</span>}
                                {item.bonuses.agility !== undefined && item.bonuses.agility > 0 && <span>🏃 민첩 +{item.bonuses.agility}</span>}
                                {item.bonuses.health !== undefined && item.bonuses.health > 0 && <span>💖 체력 +{item.bonuses.health}</span>}
                                {item.bonuses.intellect !== undefined && item.bonuses.intellect > 0 && <span>📖 지력 +{item.bonuses.intellect}</span>}
                              </div>
                            </div>

                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                                  isCurrentlyEquippedHere
                                    ? 'bg-blue-950/40 border border-blue-900/20 text-blue-400 cursor-default'
                                    : isCompatible
                                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950 hover:scale-102 active:scale-98'
                                      : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-500'
                                }`}
                                onClick={() => {
                                  equipItemFromSlotSelector(item.id, activeEquipSlotSelector);
                                }}
                              >
                                {isCurrentlyEquippedHere ? '장착 중' : isCompatible ? '선택 장착' : '호환 불가'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
