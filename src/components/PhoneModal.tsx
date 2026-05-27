/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Npc, Equipment, Dungeon, BodyPartsHP, ChatHistory } from '../types';
import { FAIL_LOGS } from '../data';
import { 
  User, Users, MessageSquare, Compass, Briefcase, Archive,
  ShieldAlert, Shield, Star, Heart, CheckCircle2, ChevronRight,
  Sparkles, CornerDownLeft, AlertCircle, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  onClose: () => void;
}

type TabType = 'status' | 'npc' | 'chat' | 'dungeon' | 'inventory' | 'records';

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
  onClose
}: PhoneModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  
  // Chat messaging input
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});

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

  // Chat message selection
  const handleSendMessage = (npcId: string) => {
    const input = chatInputs[npcId]?.trim();
    if (!input) return;

    // Player message
    const playerMsg = {
      sender: 'player' as const,
      text: input,
      timestamp: `실시간`
    };

    // Update history
    setChatHistory(prev => ({
      ...prev,
      [npcId]: [...(prev[npcId] || []), playerMsg]
    }));

    setChatInputs(prev => ({ ...prev, [npcId]: '' }));

    // Auto simulated response with rapport bump!
    setTimeout(() => {
      let responseText = '...바빠서 가보겠다.';
      let charge = 0;

      if (npcId === 'baek') {
        if (input.includes('서아') || input.includes('딸')) {
          responseText = '...서아 이야기를 아는군. 꼬맹이치곤 기특한 걸 묻는다. 요즘은 그림 그리기를 좋아하지. 호감도가 들썩였다.';
          charge = 8;
        } else if (input.includes('훈련') || input.includes('스펙')) {
          responseText = '몸이 가벼워질 때까지 게으름 피우지 말고 웨이트에 매진해라. 힘이 곧 네 갈비뼈를 아끼는 길이다.';
          charge = 5;
        } else {
          responseText = '무슨 말을 하는지는 아직 이해 못 하겠군. 던전에서 다치지 마라.';
          charge = 2;
        }
      } else if (npcId === 'geum') {
        if (input.includes('마카롱') || input.includes('과자')) {
          responseText = '꺄하하! 너 마카롱 살 줄 알아? 다음엔 피스타치오 맛으로 사 오라고! 그럼 아는 척 정도는 더 길게 해줄게!';
          charge = 10;
        } else if (input.includes('허접') || input.includes('꼬맹이')) {
          responseText = '뭐어어?! 내가 왜 꼬맹이야! 난 S급 결계술사라고! 네가 훨씬 띨띨하면서 누구더러 꼬마래?!';
          charge = 4;
        } else {
          responseText = '바보바보! 아무 대답도 마! 그냥 내가 구경해주는 것에 감사하란 말이야!';
          charge = 3;
        }
      } else if (npcId === 'lim') {
        if (input.includes('고서') || input.includes('기록') || input.includes('파편')) {
          responseText = '아... 맞아요... 조각들을 분석해보면 세상의 마나 밀도가 100일 주기로 비정상적으로 소용돌이쳐요... 기묘합니다... 고마워요...';
          charge = 12;
        } else {
          responseText = '...아... 저기... 낯선 사람이랑은 오래 문자를 주고받기가 좀 겁나요... 도서관으로 와서... 대화... 아니 문헌을 봐주세요...';
          charge = 3;
        }
      }

      // Raise rapport
      setNpcs(prev => prev.map(n => {
        if (n.id === npcId) {
          const nextRapport = Math.min(100, n.rapport + charge);
          return {
            ...n,
            rapport: nextRapport,
            // unlock as ally if rapport >= 50
            isAlly: nextRapport >= 50
          };
        }
        return n;
      }));

      const npcMsg = {
        sender: 'npc' as const,
        text: responseText,
        timestamp: `실시간`
      };

      setChatHistory(prev => ({
        ...prev,
        [npcId]: [...(prev[npcId] || []), npcMsg]
      }));

    }, 1000);
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
              className={`py-2 px-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive 
                  ? 'bg-zinc-950 text-blue-400 border-b-2 border-blue-500 shadow-inner font-bold font-display' 
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-xs font-bold">{item.label}</span>
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
                  박지후 <span className="text-xs bg-blue-950/40 text-blue-400 px-2 py-0.5 border border-blue-900/30 rounded font-mono font-bold">임시 대기</span>
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
                
                {/* Specific Warn banner */}
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-400 leading-relaxed flex items-start gap-2 shadow-inner">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                  <span><strong>치명 부위 즉사 경보</strong>: 머리(Head)나 몸통(Torso)중 하나라도 HP가 0이 되는 즉시, 시간 연동 아카이브가 붕괴하여 현 타임라인은 되감기(배드엔딩) 처리됩니다.</span>
                </div>

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
                      const lastMsg = chatHistory[npc.id]?.slice(-1)[0];
                      return (
                        <button
                          key={npc.id}
                          onClick={() => setSelectedNpcId(npc.id)}
                          className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-blue-500/30 transition-all flex justify-between items-center shadow cursor-pointer active:scale-98"
                        >
                          <div className="flex gap-3 items-center flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center text-base shadow-inner">
                              {npc.avatarUrl}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-zinc-200">{npc.name}</h4>
                                <span className="text-[10px] bg-blue-950/40 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">active</span>
                              </div>
                              <p className="text-xs text-zinc-400 truncate mt-1 pr-4 font-sans font-medium">
                                {lastMsg ? lastMsg.text : '대화 내역이 비어있습니다.'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
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
                        <span className="text-xs text-blue-400 font-mono font-bold bg-blue-950/20 px-2 py-0.5 rounded border border-blue-900/10">{npc.rapport}%</span>
                      </div>

                      {/* Chat messages stream */}
                      <div className="flex-1 bg-zinc-950 p-3 overflow-y-auto flex flex-col gap-3 min-h-[180px]">
                        {history.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500 italic text-xs gap-2 font-sans font-medium h-full my-auto">
                            <span className="text-lg">📡</span>
                            <span>국가 공인 보안 규약 암호 회선 동기화 완료.</span>
                            <span className="text-[11px] not-italic text-zinc-600">"{npc.name}"님과의 직통 백도어 메신저 채널입니다. 대화를 입력해 인과 조율을 개시할 수 있습니다.</span>
                          </div>
                        ) : (
                          history.map((msg, idx) => {
                            const isMe = msg.sender === 'player';
                            return (
                              <div 
                                key={idx} 
                                className={`flex flex-col max-w-[220px] rounded-xl p-2.5 leading-relaxed text-xs shadow-sm ${
                                  isMe 
                                    ? 'self-end bg-zinc-100 text-zinc-950 rounded-tr-none font-semibold' 
                                    : 'self-start bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none font-medium'
                                }`}
                              >
                                {!isMe && (
                                  <span className="text-[10px] text-blue-400 font-bold mb-1 font-mono">{npc.name}</span>
                                )}
                                <p className="break-all font-sans">{msg.text}</p>
                                <span className="text-[9px] text-zinc-500 font-mono text-right mt-1 block">
                                  {msg.timestamp}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Chat typing field form */}
                      <div className="p-2.5 bg-zinc-900 border-t border-zinc-800 flex gap-2 shrink-0">
                        <input
                          type="text"
                          value={chatInputs[selectedNpcId] || ''}
                          onChange={(e) => setChatInputs({ ...chatInputs, [selectedNpcId]: e.target.value })}
                          placeholder={
                            '"기록" 또는 "고서" 키워드를 입력해봐요.'
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(selectedNpcId)}
                          className="flex-1 bg-zinc-950 text-zinc-200 p-2.5 rounded-xl border border-zinc-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
                        />
                        <button
                          onClick={() => handleSendMessage(selectedNpcId)}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-4 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer font-bold"
                        >
                          입력
                        </button>
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
                    <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">{recordCount} / 6 파일</div>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 text-center shadow-inner">
                    <span className="text-[10px] text-zinc-500 font-mono">보안 동조화 수준</span>
                    <div className="text-lg font-bold text-zinc-200 font-mono mt-0.5">LEVEL_v{loopCount}.0</div>
                  </div>
                </div>
              </div>

              {/* FAIL LOGS LIST (Immersive background story) */}
              <span className="text-xs text-zinc-400 font-bold block mt-1.5 uppercase tracking-wide">💾 복원 완료된 국가 보안 기밀 보고서</span>
              <div className="flex flex-col gap-2.5">
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

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
