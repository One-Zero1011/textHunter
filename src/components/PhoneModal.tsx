/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Npc, Equipment, Dungeon, BodyPartsHP, ChatHistory } from '../types';
import { FAIL_LOGS, ACHIEVEMENTS } from '../data';
import { 
  User, Users, MessageSquare, Compass, Briefcase, Archive,
  ShieldAlert, Shield, Star, Heart, CheckCircle2, ChevronRight,
  Sparkles, CornerDownLeft, AlertCircle, ShoppingBag, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getActiveStoryForNpc, interpolateText, CHAT_STORIES, ChatStory, ChatStoryChoice } from '../data/chatStories';

interface PhoneModalProps {
  stats: { strength: number; agility: number; mana: number; intellect: number };
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
  dungeons: Dungeon[];
  onStartDungeon: (dungeon: Dungeon) => void;
  loopCount: number;
  recordCount: number;
  initialTab?: TabType;
  onClose: () => void;
  playerName: string;
}

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
  dungeons,
  onStartDungeon,
  loopCount,
  recordCount,
  initialTab = 'status',
  onClose,
  playerName
}: PhoneModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  
  // Records section sub-tab: 'achievements' or 'logs'
  const [recordsSubTab, setRecordsSubTab] = useState<'achievements' | 'logs'>(
    initialTab === 'records' ? 'achievements' : 'logs'
  );

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
        return (stats.strength >= 100 || stats.agility >= 100 || stats.mana >= 100 || stats.intellect >= 100);
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

  // Combat power index calculation
  const totalPower = Math.floor(
    (stats.strength * 12) + (stats.agility * 8) + (stats.mana * 10) + (stats.intellect * 5)
  );

  const getRankChar = (power: number) => {
    if (power >= 300) return 'S급 [초각성]';
    if (power >= 200) return 'A급 [특차전]';
    if (power >= 140) return 'B급 [상급]';
    if (power >= 90) return 'C급 [중급]';
    if (power >= 45) return 'D급 [기존]';
    if (power >= 25) return 'E급 [가훈련]';
    return 'F급 [등급 보류]';
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

  // Toggle Equip item status
  const toggleEquip = (itemId: string) => {
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
  };

  return (
    <div className="absolute inset-0 z-40 bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden">
      
      {/* PHONE TOP BAR SYSTEM CHASSIS */}
      <div className="pt-8 px-4 pb-2 bg-zinc-900 border-b border-zinc-800/80 flex justify-between items-center text-xs font-mono shrink-0">
        <div className="flex items-center gap-1.5 text-blue-500 font-bold">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>System: 100 [Backdoor App]</span>
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
          { tab: 'inventory', label: '상점', icon: ShoppingBag },
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
                <div className="absolute top-0 right-0 p-2.5 bg-blue-950/30 border-l border-b border-blue-800/20 rounded-bl text-xs text-blue-400 font-mono font-bold tracking-widest">
                  S-CLASS SYSTEM
                </div>
                
                <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider font-bold">가설상 정체불량의 각성자</span>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-1.5 mt-1 font-display">
                  {playerName} <span className="text-xs bg-blue-950/40 text-blue-400 px-2 py-0.5 border border-blue-900/30 rounded font-mono font-bold">임시 대기</span>
                </h3>

                {/* Combata Index Indicator */}
                <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-center">
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
                    <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider font-semibold">종합 기온 전투지수</div>
                    <div className="text-sm font-bold text-zinc-200 font-mono mt-0.5">{totalPower.toLocaleString()} CP</div>
                  </div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
                    <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider font-semibold">시스템 평가 판정</div>
                    <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">{getRankChar(totalPower)}</div>
                  </div>
                </div>
              </div>

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
                <span className="text-xs text-zinc-400 font-bold mb-3 block uppercase tracking-wide">💪 코어 포스 각성 수치</span>
                <div className="grid grid-cols-2 gap-2.5 font-mono">
                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex justify-between items-center shadow-inner text-xs">
                    <span className="text-zinc-450">근력 (Strength)</span>
                    <span className="text-zinc-200 font-bold text-sm">{stats.strength}</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex justify-between items-center shadow-inner text-xs">
                    <span className="text-zinc-450">민첩 (Agility)</span>
                    <span className="text-zinc-200 font-bold text-sm">{stats.agility}</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex justify-between items-center shadow-inner text-xs">
                    <span className="text-zinc-455">마력 (Mana)</span>
                    <span className="text-zinc-200 font-bold text-sm">{stats.mana}</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex justify-between items-center shadow-inner text-xs">
                    <span className="text-zinc-455">지력 (Intellect)</span>
                    <span className="text-zinc-200 font-bold text-sm">{stats.intellect}</span>
                  </div>
                </div>
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
                  <span className="text-xs text-zinc-500 font-mono font-bold uppercase tracking-wider">S급 등급 연합 구조체</span>
                  {npcs.filter(n => n.unlocked).length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 py-10 text-center bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-sm mt-2">
                      <span className="text-4xl mb-3 animate-pulse">🔍</span>
                      <h4 className="font-bold text-zinc-200 text-sm">영입 가능한 S급 동행자가 없습니다</h4>
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
                          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center text-xl shadow-inner">
                            {npc.avatarUrl}
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
                        <div className="text-4xl text-center mb-2.5">{npc.avatarUrl}</div>
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
                              <Shield className="w-4 h-4 text-blue-400" /> S급 특화 동시 참전 패시브
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
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center text-base shadow-inner relative">
                              {npc.avatarUrl}
                              {isPending && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-bounce border border-zinc-900" />
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
                        <span className="text-xs font-bold font-mono text-zinc-200">{npc.name} (S급)</span>
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
                          <div className="self-start bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-xl rounded-tl-none p-3.5 leading-relaxed text-xs shadow-sm flex flex-col gap-1.5 max-w-[200px]">
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

              <div className="p-3 bg-zinc-900/50 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-400 leading-relaxed font-sans font-medium">
                🔮 <strong>스마트폰 기맥 연동기</strong>: 기맥 파장 간섭률에 의거하여, 던전 균열 좌표는 하루에서 최대 3일 동안 무작위로 유지됩니다. 현재 총 {dungeons.length}개의 균열이 감지되고 있으며, 100일이 점차 경과되어 침공이 심화될수록 활성화 가능한 던전 채널의 용량이 <strong>최대 8개</strong>까지 확장됩니다.
              </div>

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
          {activeTab === 'inventory' && (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="flex flex-col gap-3 flex-1 text-sm animate-fadeIn"
            >
              {/* Gold balances */}
              <div className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 flex justify-between items-center font-mono shadow">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">보유 연금 계좌</span>
                <span className="text-zinc-100 font-bold text-base">💰 {gold.toLocaleString()} G</span>
              </div>

              {/* Shop catalogue / Inventory items */}
              <div className="flex flex-col gap-2.5">
                {inventory.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex justify-between items-center relative gap-4 shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-zinc-100 font-display">{item.name}</h4>
                          <span className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-blue-400 uppercase font-bold font-mono">
                            {item.slot}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed pr-2 font-sans font-medium">{item.description}</p>
                        
                        {/* Stat bonuses description */}
                        <div className="flex gap-2.5 text-[10px] text-blue-400 font-mono mt-1.5 flex-wrap font-bold">
                          {item.bonuses.strength && <span>💪 근력 +{item.bonuses.strength}</span>}
                          {item.bonuses.agility && <span>🏃 민첩 +{item.bonuses.agility}</span>}
                          {item.bonuses.mana && <span>🔥 마력 +{item.bonuses.mana}</span>}
                          {item.bonuses.intellect && <span>📖 지력 +{item.bonuses.intellect}</span>}
                          {item.hpModifier?.torso && <span>🏥 몸통 HP +{item.hpModifier.torso}</span>}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5 min-w-[80px]">
                        {!item.purchased ? (
                          <button
                            onClick={() => purchaseGear(item)}
                            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-mono font-bold cursor-pointer transition-transform active:scale-95 shadow-sm"
                          >
                            {item.price.toLocaleString()}G
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleEquip(item.id)}
                            className={`w-full py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
                              item.equipped 
                                ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' 
                                : 'bg-zinc-850 hover:bg-zinc-750 text-zinc-200'
                            }`}
                          >
                            {item.equipped ? 'Equipped' : '장착하기'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

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

    </div>
  );
}
