/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, ShoppingBag, User, ChevronLeft, ChevronRight, 
  Sparkles, ShieldAlert, Award, CreditCard, RotateCcw, Flame,
  Pencil, X
} from 'lucide-react';
import { getAssetPath } from '../utils';

interface LauncherScreenProps {
  playerName: string;
  loopCount: number;
  recordCount: number;
  logoImg: string;
  onSelectMainGame: () => void;
  setPlayerName: (name: string) => void;
  hasSave?: boolean;
  onContinueGame?: () => void;
}

type TabType = 'scenarios' | 'shop' | 'player';

export interface Trait {
  id: string;
  name: string;
  rank: 'C' | 'B' | 'A' | 'S';
  description: string;
  effect: string;
  emoji: string;
  color: string;
}

export const TRAIT_CATALOG: Trait[] = [
  // C-Rank
  { id: 'stat-str-c', name: '완강한 신체', rank: 'C', description: '체크아웃 시 잉여 영혼들의 원료로 아주 가볍게 응고된 신체입니다.', effect: '기초 근력 +1', emoji: '💪', color: 'text-zinc-400 bg-zinc-400/15 border-zinc-500/20' },
  { id: 'stat-agi-c', name: '가벼운 깃털', rank: 'C', description: '발목 주변 기류가 미세하게 제어되어 움직임이 쾌적해집니다.', effect: '기초 민첩 +1', emoji: '🪶', color: 'text-zinc-400 bg-zinc-400/15 border-zinc-500/20' },
  { id: 'stat-int-c', name: '책벌레의 습성', rank: 'C', description: '사소한 공식을 쉽게 기억해내는 미약한 기억력을 부여합니다.', effect: '기초 지능 +1', emoji: '📚', color: 'text-zinc-400 bg-zinc-400/15 border-zinc-500/20' },
  { id: 'stat-mp-c', name: '마력 응고 소핵', rank: 'C', description: '심장 근처에 머무는 연청색 마력의 희미한 흔적입니다.', effect: '기초 정신 +1', emoji: '🔮', color: 'text-zinc-400 bg-zinc-400/15 border-zinc-500/20' },
  { id: 'stat-hp-c', name: '철분 보충 피사체', rank: 'C', description: '생체 회복 주기로 생명력 감쇠 현상을 미세하게 보정합니다.', effect: '기초 체력 보정 효과', emoji: '💊', color: 'text-zinc-400 bg-zinc-400/15 border-zinc-500/20' },

  // B-Rank
  { id: 'stat-str-b', name: '강철의 육벽', rank: 'B', description: '전열 보병 수준의 단단함을 각인하여 충격을 분쇄합니다.', effect: '기초 근력 +3', emoji: '🧱', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'stat-agi-b', name: '바람길 안내자', rank: 'B', description: '지면을 딛고 도약할 때 공기 저항을 지능적으로 분산시킵니다.', effect: '기초 민첩 +3', emoji: '🌬️', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'stat-int-b', name: '도서관 고문 사서', rank: 'B', description: '다량의 인과 정보들을 실시간으로 필터링하는 두뇌를 촉진합니다.', effect: '기초 지능 +3', emoji: '🧠', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'stat-mp-b', name: '소용돌이 치는 마나', rank: 'B', description: '마력 전도율이 상승하여 무복사의 순수 정렬을 돕습니다.', effect: '기초 정신 +3', emoji: '⚡', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'item-discount-b', name: '장사꾼의 기민함', rank: 'B', description: '상인들과 정면 보정을 주고받으며 최적의 흥정 한계를 파악합니다.', effect: '인과 자금 시작시 +2,000G', emoji: '💰', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },

  // A-Rank
  { id: 'hero-bond-a', name: '천재 연금술사', rank: 'A', description: '화학 촉매 반응의 절대 극점을 인지하여 마력 비효율을 완전 차단합니다.', effect: '기초 지능 +5, 정신 +2', emoji: '🧪', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'sword-master-a', name: '불완전한 검귀', rank: 'A', description: '무기의 참격 마찰 시공에 비가시적 미세 충전력을 덧씌웁니다.', effect: '기초 근력 +5, 민첩 +2', emoji: '⚔️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'regen-heart-a', name: '인과 상처 치유', rank: 'A', description: '시간선이 초기화되거나 마력을 소진할 때 편린 회복율이 누증됩니다.', effect: '인게임 시작 피로도 안전치 보정', emoji: '🌿', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'barrier-skin-a', name: '심연 장벽 가호', rank: 'A', description: '외벽 게이트에서의 돌발 붕괴 등급 독성 가스를 차폐 완충합니다.', effect: '치명적 생명력 붕괴 일부 저지', emoji: '🛡️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },

  // S-Rank
  { id: 'dimensional-shifter-s', name: '시공간 왜곡자', rank: 'S', description: '차원 마찰 계수를 임의 조정하여 절대반응 최고치를 초래합니다.', effect: '기초 모든 전스탯 +4 일괄 영속 증가', emoji: '🌌', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'hero-fate-s', name: '운명 돌파', rank: 'S', description: '자바 인과 궤적의 오류를 인위 생성하여 연대 초기 자금을 이월합니다.', effect: '인과 시작 자금 +10,000G 보장', emoji: '🍀', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'protagonist-luck-s', name: '독자 전용 보정', rank: 'S', description: '시뮬레이터 관람 성좌의 최고위 일격 낙인을 받아 피해 소멸을 비켜갑니다.', effect: '모든 부위의 한계 내구도 상승', emoji: '👑', color: 'text-purple-400 bg-purple-100/5 hover:bg-purple-550/15 border-purple-500/40 font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse' }
];

interface Scenario {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  isAvailable: boolean;
  bgGradient: string;
  illustEmoji: string;
  image?: string;
}

export default function LauncherScreen({
  playerName,
  loopCount,
  recordCount,
  logoImg,
  onSelectMainGame,
  setPlayerName,
  hasSave = false,
  onContinueGame
}: LauncherScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('scenarios');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);
  const [showScenarioIntro, setShowScenarioIntro] = useState<boolean>(false);

  React.useEffect(() => {
    setShowScenarioIntro(false);
  }, [selectedScenarioIndex]);
  
  // Persist Crystals internally to persist pulls outside separate game wipes
  const [crystals, setCrystals] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('launcher_crystals');
      return stored ? parseInt(stored, 10) : 3450;
    } catch {
      return 3450;
    }
  });

  // Persised collection lists
  const [acquiredTraitIds, setAcquiredTraitIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('launcher_acquired_traits');
      return stored ? JSON.parse(stored) : ['stat-str-c'];
    } catch {
      return ['stat-str-c'];
    }
  });

  const [equippedTraitIds, setEquippedTraitIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('launcher_equipped_traits');
      return stored ? JSON.parse(stored) : ['stat-str-c'];
    } catch {
      return ['stat-str-c'];
    }
  });

  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(playerName);

  // Gacha System Status
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isEnteringChronicle, setIsEnteringChronicle] = useState<boolean>(false);
  const [drawResult, setDrawResult] = useState<Trait[] | null>(null);
  const [refundCrystals, setRefundCrystals] = useState<number>(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync state data to localStorage
  React.useEffect(() => {
    localStorage.setItem('launcher_crystals', crystals.toString());
  }, [crystals]);

  React.useEffect(() => {
    localStorage.setItem('launcher_acquired_traits', JSON.stringify(acquiredTraitIds));
  }, [acquiredTraitIds]);

  React.useEffect(() => {
    localStorage.setItem('launcher_equipped_traits', JSON.stringify(equippedTraitIds));
  }, [equippedTraitIds]);

  // Core launcher scenarios list
  const scenarios: Scenario[] = [
    {
      id: 'f-hunter',
      title: '등급 보류 : F급 헌터 연대기',
      tagline: '회귀 속에서 조종되는 오리지널 구조 루프',
      description: '체계적인 신체 피로도 매니지먼트와 S급 히로인 협력 관계 구축을 통해 60일 뒤 닥쳐오는 전면적 서울 대공습을 저지하십시오. 16개의 영혼 구형 기억 편린을 복구하여 인과의 비밀을 전복할 수 있습니다.',
      badge: '시즌 1 에피소드 오픈',
      isAvailable: true,
      bgGradient: 'from-blue-950/60 via-zinc-900 to-zinc-950',
      illustEmoji: '⏳',
      image: 'images/Title/Senario01.png'
    },
    {
      id: 'automata-awakening',
      title: '대재앙 공학 : SSS급 기계왕',
      tagline: '금속과 회로로 장악하는 차원 방벽',
      description: '아카데미와 메트로폴리스 서울이 뒤틀려 로봇 소환술사들이 지배한 또 다른 지구입니다. 가혹한 105일 한계 배터리와 강철 코어를 설계하고 기공 파동을 정립하십시오.',
      badge: '공사 중',
      isAvailable: false,
      bgGradient: 'from-rose-950/40 via-zinc-900 to-zinc-950',
      illustEmoji: '⚙️'
    },
    {
      id: 'alchemist-remnant',
      title: '멸망한 서울의 마포 연금술사',
      tagline: '마력 역병 한가운데서 피어나는 최종 백신',
      description: '미지의 독성 안개와 가야 게이트 균열 오염도가 날로 증가하는 서울 전선을 배경으로 합니다. 정교하고 정밀한 영액 제조 루틴과 특수 합성 촉매로 인과의 불화를 조율하십시오.',
      badge: '공사 중',
      isAvailable: false,
      bgGradient: 'from-purple-950/40 via-zinc-900 to-zinc-950',
      illustEmoji: '🧪'
    }
  ];

  const handleScrollLeft = () => {
    if (selectedScenarioIndex > 0) {
      setSelectedScenarioIndex(prev => prev - 1);
    }
  };

  const handleScrollRight = () => {
    if (selectedScenarioIndex < scenarios.length - 1) {
      setSelectedScenarioIndex(prev => prev + 1);
    }
  };

  // State Overwriting Draw mechanics
  const rollRank = (type: 'supply' | 'rift' | 'blessed'): 'C' | 'B' | 'A' | 'S' => {
    const rolled = Math.random() * 100;
    if (type === 'supply') {
      if (rolled < 70) return 'C';
      if (rolled < 95) return 'B';
      return 'A';
    } else if (type === 'rift') {
      if (rolled < 15) return 'C';
      if (rolled < 65) return 'B';
      if (rolled < 95) return 'A';
      return 'S';
    } else { // blessed
      if (rolled < 20) return 'B';
      if (rolled < 80) return 'A';
      return 'S';
    }
  };

  const getRandomTraitByRank = (rank: 'C' | 'B' | 'A' | 'S'): Trait => {
    const pool = TRAIT_CATALOG.filter(t => t.rank === rank);
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handlePerformDraw = (type: 'supply' | 'rift' | 'blessed', count: number) => {
    const cost = {
      supply: count === 1 ? 150 : 700,
      rift: count === 1 ? 500 : 2200,
      blessed: count === 1 ? 1200 : 5500
    }[type];

    if (crystals < cost) {
      setPurchaseFeedback(`❌ [잔액 부족] 크리스탈이 부족하여 성좌 촉매 유도가 취소되었습니다! 상단 [+] 버튼으로 충전 가능합니다.`);
      setTimeout(() => setPurchaseFeedback(null), 4000);
      return;
    }

    setIsDrawing(true);
    setPurchaseFeedback(null);

    setTimeout(() => {
      let currentCrystals = crystals - cost;
      const rolledTraits: Trait[] = [];
      const nextAcquiredIds = [...acquiredTraitIds];

      for (let i = 0; i < count; i++) {
        const rc = rollRank(type);
        const trait = getRandomTraitByRank(rc);
        rolledTraits.push(trait);

        if (!nextAcquiredIds.includes(trait.id)) {
          nextAcquiredIds.push(trait.id);
        }
      }

      setAcquiredTraitIds(nextAcquiredIds);
      setRefundCrystals(0);
      setCrystals(currentCrystals);
      setDrawResult(rolledTraits);
      setIsDrawing(false);
    }, 1100);
  };

  const handleEquipTrait = (traitId: string) => {
    if (equippedTraitIds.includes(traitId)) return;
    if (equippedTraitIds.length >= 3) {
      setPurchaseFeedback('❌ [장착 실패] 특성은 최대 3개까지만 장착할 수 있습니다! 플레이어 슬롯 중 하나를 먼저 비워주십시오.');
      setTimeout(() => setPurchaseFeedback(null), 3500);
      return;
    }
    setEquippedTraitIds(prev => [...prev, traitId]);
    setPurchaseFeedback('🛡️ [특성 장착 완료] 해당 성좌 특성의 각인이 수동 각성되었습니다!');
    setTimeout(() => setPurchaseFeedback(null), 3000);
  };

  const handleUnequipTrait = (traitId: string) => {
    setEquippedTraitIds(prev => prev.filter(id => id !== traitId));
    setPurchaseFeedback('🔓 [장착 해제] 해당 특성이 성좌 각인에서 분리되었습니다.');
    setTimeout(() => setPurchaseFeedback(null), 3000);
  };

  const handleBuyItem = (itemName: string, cost: number) => {
    if (crystals >= cost) {
      setCrystals(prev => prev - cost);
      setPurchaseFeedback(`🎉 [구매 성공] "${itemName}" 상품 획득! 의상 보관소에 전송되었습니다. (${cost} 💎 차감)`);
    } else {
      setPurchaseFeedback(`❌ [잔액 부족] 크리스탈이 부족합니다! 상단 [+] 버튼을 눌러 시공을 긴급 수급하십시오.`);
    }
    setTimeout(() => {
      setPurchaseFeedback(null);
    }, 4500);
  };

  const handleEnterChronicle = () => {
    if (isEnteringChronicle) return;
    setIsEnteringChronicle(true);
    setTimeout(() => {
      onSelectMainGame();
    }, 2000);
  };

  return (
    <div id="launcher-root-screen" className="absolute inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col justify-between overflow-hidden">
      
      {/* LAUNCHER HEADER / BRANDING BANNER */}
      <div className="px-6 py-4.5 bg-zinc-900/80 border-b border-zinc-900 flex justify-between items-center z-10 select-none">
        <div className="flex items-center">
          <span className="text-xs font-mono text-zinc-500">
            SECURE CONNECTED PORTAL (v3.4.1)
          </span>
        </div>

        {/* Dynamic Crystal balances */}
        <div className="flex items-center gap-1.5 bg-zinc-950 py-1.5 px-3 border border-zinc-800 rounded-lg text-xs font-mono">
          <span className="text-blue-400 animate-pulse">💎</span>
          <span className="text-zinc-400">보유 크리스탈:</span>
          <span className="text-blue-400 font-black">{crystals.toLocaleString()}</span>
          <button
            onClick={() => {
              setCrystals(c => c + 1000);
              setPurchaseFeedback('🔮 [차원 조정]: 긴급 충전 코드로 1,000 크리스탈이 무상 주입되었습니다.');
              setTimeout(() => setPurchaseFeedback(null), 3500);
            }}
            className="ml-1.5 px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded font-bold cursor-pointer transition-colors"
            title="크리스탈 긴급 주입"
          >
            +
          </button>
        </div>
      </div>

      {/* COMPONENT BODY BASED ON CHOSEN TABS */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SCENARIO SELECTION MATRIX */}
          {activeTab === 'scenarios' && (
            <motion.div
              key="scenarios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col justify-between p-5 md:p-8 overflow-y-auto scrollbar-thin"
            >
              {/* Scenario selector title */}
              <div className="text-center mb-2 md:mb-4 select-none">
                <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                  Scenario List
                </span>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-100 mt-1 md:mt-2">
                  플레이할 시나리오 선택
                </h2>
                <p className="text-[11px] md:text-xs text-zinc-400 mt-0.5 max-w-md mx-auto break-keep font-sans">
                  원하시는 시나리오를 선택하여 텍스트 게임을 시작해주십시오.
                </p>
              </div>

              {/* HORIZONTAL CAROUSEL */}
              <div className="flex-1 flex items-center justify-center relative my-3">
                
                {/* Scroll Control Arrows */}
                <button 
                  onClick={handleScrollLeft}
                  disabled={selectedScenarioIndex === 0}
                  className={`absolute left-1.5 z-20 w-8.5 h-8.5 rounded-full border flex items-center justify-center transition-all bg-zinc-900 cursor-pointer ${
                    selectedScenarioIndex === 0 
                      ? 'border-zinc-800/40 text-zinc-700 opacity-30 cursor-not-allowed' 
                      : 'border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* SCENARIO DETAILED PRESENTATION CARD */}
                <div className="w-full max-w-md mx-auto px-10">
                  <motion.div
                    key={selectedScenarioIndex}
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`rounded-2xl border p-5 md:p-6 bg-gradient-to-b ${scenarios[selectedScenarioIndex].bgGradient} flex flex-col justify-between gap-5 relative overflow-hidden shadow-xl min-h-[290px] md:min-h-[330px] ${
                      scenarios[selectedScenarioIndex].isAvailable 
                        ? 'border-blue-500/30 shadow-[0_4px_25px_rgba(59,130,246,0.15)]' 
                        : 'border-zinc-850 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Top status rail */}
                      <div className="flex justify-between items-center mb-3 relative z-10">
                        {scenarios[selectedScenarioIndex].badge && scenarios[selectedScenarioIndex].badge !== '시즌 1 에피소드 오픈' && (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md font-mono ${
                            scenarios[selectedScenarioIndex].isAvailable 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                          }`}>
                            {scenarios[selectedScenarioIndex].badge}
                          </span>
                        )}
                      </div>

                      {/* Main Titles */}
                      <div className="relative z-10">
                        <h3 className="text-base md:text-lg font-extrabold text-zinc-100 tracking-tight flex items-center gap-1.5">
                          <span>{scenarios[selectedScenarioIndex].title}</span>
                          {scenarios[selectedScenarioIndex].isAvailable && (
                            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                          )}
                        </h3>
                      </div>

                      {showScenarioIntro ? (
                        /* When "새로 시작" / "연대기 진입" is pressed, show description details and play button */
                        <div className="mt-4 p-4 rounded-xl bg-zinc-950/70 border border-zinc-850/50 relative z-10 animate-fadeIn flex flex-col gap-2">
                          <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest mb-1 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            시나리오 해설 및 사건 개요 (Scenario Data)
                          </p>
                          <p className="text-xs text-blue-400 font-extrabold font-mono text-[11px] leading-relaxed">
                            {scenarios[selectedScenarioIndex].tagline}
                          </p>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans break-keep font-medium mt-1">
                            {scenarios[selectedScenarioIndex].description}
                          </p>
                        </div>
                      ) : (
                        /* Initially, only show the beautiful scenario cover image banner */
                        scenarios[selectedScenarioIndex].image && (
                          <div className="mt-4 relative z-10 rounded-xl overflow-hidden border border-zinc-800/80 shadow-md aspect-[3/4] max-h-[420px] md:max-h-[460px] bg-zinc-950 shrink-0 animate-fadeIn flex items-center justify-center">
                            <img 
                              src={getAssetPath(scenarios[selectedScenarioIndex].image)} 
                              alt={scenarios[selectedScenarioIndex].title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain transition-transform duration-500 hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 via-transparent to-transparent pointer-events-none" />
                          </div>
                        )
                      )}
                    </div>

                    {/* Footer values and action buttons */}
                    <div className="flex justify-end items-center border-t border-zinc-800/60 pt-3 mt-1 relative z-10 gap-2">
                      {scenarios[selectedScenarioIndex].isAvailable ? (
                        showScenarioIntro ? (
                          /* If showing description, display Cancel & Confirm Game Button */
                          <>
                            <button
                              onClick={() => setShowScenarioIntro(false)}
                              className="bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-3 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all font-sans border border-zinc-800"
                            >
                              <span>이전으로</span>
                            </button>
                            <button
                              onClick={() => {
                                if (hasSave) {
                                  const confirmNew = window.confirm(
                                    "⚠️ 경고! 이미 기존에 저장된 'F급 헌터 연대기' 진행 상황이 존재합니다.\n\n새로 시작하시면 현재까지 성장한 플레이어 스탯 및 던전 진행도가 전부 초기화됩니다. 정말로 '새 출발(새로 시작)'하시겠습니까?"
                                  );
                                  if (!confirmNew) return;
                                }
                                handleEnterChronicle();
                              }}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-lg font-sans"
                            >
                              <Gamepad2 className="w-3.5 h-3.5" />
                              <span>시작하기</span>
                            </button>
                          </>
                        ) : scenarios[selectedScenarioIndex].id === 'f-hunter' && hasSave ? (
                          <>
                            <button
                              onClick={() => setShowScenarioIntro(true)}
                              className="bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-3 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all font-sans border border-zinc-800"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>새로 시작</span>
                            </button>
                            <button
                              onClick={onContinueGame}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-950/40 font-sans animate-pulse"
                            >
                              <Gamepad2 className="w-3.5 h-3.5 animate-pulse" />
                              <span>이어하기 (계속)</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowScenarioIntro(true)}
                            className="bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 transition-all shadow-md font-sans"
                          >
                            <Gamepad2 className="w-3.5 h-3.5" />
                            <span>연대기 진입</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5 select-none bg-zinc-950/80 border border-zinc-850 px-3 py-1.5 rounded-lg">
                          <ShieldAlert className="w-3.5 h-3.5 text-zinc-600" />
                          공사 중
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>

                <button 
                  onClick={handleScrollRight}
                  disabled={selectedScenarioIndex === scenarios.length - 1}
                  className={`absolute right-1.5 z-20 w-8.5 h-8.5 rounded-full border flex items-center justify-center transition-all bg-zinc-900 cursor-pointer ${
                    selectedScenarioIndex === scenarios.length - 1 
                      ? 'border-zinc-800/40 text-zinc-700 opacity-30 cursor-not-allowed' 
                      : 'border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Slider Indicator dots */}
              <div className="flex justify-center gap-1.5 my-1">
                {scenarios.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedScenarioIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      selectedScenarioIndex === idx ? 'w-5 bg-blue-500' : 'w-1.5 bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 2: INTEGRATED GACHA DRAW TEMPLE */}
          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 overflow-y-auto scrollbar-thin"
            >
              <div className="text-center mb-4 select-none">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                  Dimensional Gacha Shop
                </span>
                <h2 className="text-base md:text-lg font-bold tracking-tight text-zinc-100 mt-1">
                  성좌인자 차원 특별 소환소
                </h2>
                <p className="text-[10px] md:text-11px text-zinc-400 max-w-md mx-auto leading-relaxed mt-0.5 break-keep">
                  가상 시공 크리스탈을 성역 촉매로 소진하여, 헌터의 핵심 영혼과 공명할 수 있는 고착 성좌 특성(Trait)들을 각인추출합니다.
                </p>
                
                {/* Instant Balance display inside shop */}
                <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-zinc-950/80 border border-zinc-800 rounded-lg text-[10px] md:text-xs">
                  <span className="text-zinc-500">지갑 잔액:</span>
                  <span className="text-amber-400 font-extrabold font-mono">💎 {crystals.toLocaleString()}</span>
                  <button 
                    onClick={() => {
                      setCrystals(c => c + 1500);
                      setPurchaseFeedback('💵 [디버그 동기화] 테스팅 지원금 +1,500 크리스탈이 포팅되었습니다!');
                      setTimeout(() => setPurchaseFeedback(null), 3000);
                    }}
                    className="ml-2 hover:bg-zinc-800 border border-zinc-850 px-1.5 py-0.5 bg-zinc-900 rounded font-mono text-[9px] text-zinc-300 font-bold active:scale-95 transition-transform cursor-pointer"
                  >
                    + 충전
                  </button>
                </div>
              </div>

              {/* Toast notifier feedback for mock purchase */}
              {purchaseFeedback && (
                <div className="bg-zinc-900/90 border border-amber-500/35 p-3 rounded-xl mb-3 text-xs text-amber-400 leading-normal text-center break-keep shadow-lg animate-fadeIn select-none font-mono">
                  {purchaseFeedback}
                </div>
              )}

              {/* 3 Different Class Gacha Banners */}
              <div className="flex flex-col gap-4 max-w-md mx-auto w-full flex-1 mb-2">
                
                {/* Gacha Banner 1: Supply Draw */}
                <div className="p-3.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-emerald-500/15 rounded-xl flex flex-col justify-between gap-3 hover:border-emerald-500/30 transition-all shadow-inner relative overflow-hidden group">
                  <div className="absolute right-3 top-3 opacity-10 text-4xl group-hover:scale-110 transition-transform">🎒</div>
                  <div className="flex flex-col select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-black px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 rounded">C ~ A 등급</span>
                      <h4 className="text-xs font-bold text-zinc-100 font-sans">특성 뽑기</h4>
                    </div>
                    <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal break-keep">
                      주로 기초적인 속성을 약소 가산하는 일반 성좌 특성을 추출합니다. (C급: 70%, B급: 25%, A급: 5%)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button 
                      onClick={() => handlePerformDraw('supply', 1)}
                      className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-emerald-400 text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center"
                    >
                      <span>1회 소환</span>
                      <span className="text-[9px] text-zinc-500 font-mono font-medium mt-0.5">💎 150</span>
                    </button>
                    <button 
                      onClick={() => handlePerformDraw('supply', 5)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-emerald-950/20"
                    >
                      <span>5회 연속 소환 (할인)</span>
                      <span className="text-[9px] text-emerald-100 font-mono mt-0.5">💎 700</span>
                    </button>
                  </div>
                </div>

                {/* Gacha Banner 2: Rift Draw */}
                <div className="p-3.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-sky-500/15 rounded-xl flex flex-col justify-between gap-3 hover:border-sky-500/30 transition-all shadow-inner relative overflow-hidden group">
                  <div className="absolute right-3 top-3 opacity-10 text-4xl group-hover:scale-110 transition-transform">🌌</div>
                  <div className="flex flex-col select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-black px-1.5 py-0.2 bg-sky-500/15 text-sky-400 rounded">C ~ S 등급</span>
                      <h4 className="text-xs font-bold text-zinc-100 font-sans">고급 특성 뽑기</h4>
                    </div>
                    <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal break-keep">
                      안정된 B/A등급 이상 또는 극악의 확률로 최상위 S급 특성을 추출합니다. (C: 15%, B: 50%, A: 30%, S: 5%)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button 
                      onClick={() => handlePerformDraw('rift', 1)}
                      className="bg-zinc-900 border border-zinc-800 hover:border-sky-500/40 text-sky-400 text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center"
                    >
                      <span>1회 소환</span>
                      <span className="text-[9px] text-zinc-500 font-mono font-medium mt-0.5">💎 500</span>
                    </button>
                    <button 
                      onClick={() => handlePerformDraw('rift', 5)}
                      className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-extrabold py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-sky-950/20"
                    >
                      <span>5회 연속 소환 (할인)</span>
                      <span className="text-[9px] text-sky-100 font-mono mt-0.5">💎 2,200</span>
                    </button>
                  </div>
                </div>

                {/* Gacha Banner 3: Blessed Draw */}
                <div className="p-3.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-purple-500/20 rounded-xl flex flex-col justify-between gap-3 hover:border-purple-500/40 transition-all shadow-inner relative overflow-hidden group">
                  <div className="absolute right-3 top-3 opacity-10 text-4xl group-hover:scale-110 transition-transform">👑</div>
                  <div className="flex flex-col select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-black px-1.5 py-0.2 bg-purple-500/15 text-purple-400 rounded">B ~ S 등급</span>
                      <h4 className="text-xs font-bold text-zinc-100 font-sans">최고급 특성 뽑기</h4>
                    </div>
                    <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal break-keep">
                      하급 C등급을 배제하고 S급 이상을 포함한 높은 등급의 특성 구격을 고도화해 도출합니다. (B: 20%, A: 60%, S: 20%)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button 
                      onClick={() => handlePerformDraw('blessed', 1)}
                      className="bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 text-purple-400 text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center"
                    >
                      <span>1회 소환</span>
                      <span className="text-[9px] text-zinc-500 font-mono font-medium mt-0.5">💎 1,200</span>
                    </button>
                    <button 
                      onClick={() => handlePerformDraw('blessed', 5)}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-extrabold py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-purple-950/20"
                    >
                      <span>5회 연속 소환 (할인)</span>
                      <span className="text-[9px] text-purple-100 font-mono mt-0.5">💎 5,500</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Information footer */}
              <div className="p-2.5 bg-zinc-900/50 rounded-xl border border-zinc-850/80 text-center max-w-sm mx-auto w-full select-none">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                  DIMENSIONAL TRAITS ACQUISITION PORTAL
                </span>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ACCOUNT & EQUIPPABLE SOUL TRAITS */}
          {activeTab === 'player' && (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 overflow-y-auto scrollbar-thin"
            >
              <div className="text-center mb-3 select-none">
                <span className="text-[10px] font-mono font-bold text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                  SOUL BOUND CHARACTER PROFILE
                </span>
                <h2 className="text-base md:text-lg font-bold tracking-tight text-zinc-100 mt-1">
                  플레이어 관리 및 성좌 특성 장착
                </h2>
                <p className="text-[10px] md:text-11px text-zinc-400 mt-0.5">
                  런처 서명을 지닌 사용자 닉네임을 수정하고, 소환한 영혼 구형 특성(최대 3개)을 장착하십시오.
                </p>
              </div>

              {/* Toast message inside profile */}
              {purchaseFeedback && (
                <div className="bg-zinc-900/90 border border-purple-500/35 p-2.5 rounded-xl mb-3 text-[11px] text-purple-400 text-center transition-all animate-fadeIn">
                  {purchaseFeedback}
                </div>
              )}

              {/* DUAL DIVISION ROW PANELS */}
              <div className="flex flex-col gap-4 max-w-xl mx-auto w-full flex-1">
                
                {/* A. ACCOUNT PROFILE SUMMARY CARD */}
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden select-none">
                  {/* Watermark grids */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                  
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-purple-400 font-extrabold tracking-widest uppercase block mb-1">LAUNCHER ACCOUNT</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-zinc-100">{playerName || '미등록 헌터'}</span>
                        <button 
                          onClick={() => {
                            setTempName(playerName);
                            setIsNameModalOpen(true);
                          }}
                          className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[9.5px] font-semibold"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>닉네임 수정</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase">포탈 보유고</span>
                      <span className="text-xs font-black text-amber-400 font-mono">💎 {crystals.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* ACTIVE EQUIPPED TRAITS CARD ROW SLOTS */}
                  <div className="mt-4 border-t border-zinc-900/80 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-sans font-bold text-zinc-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        활성화된 성좌 특성 궤적 ({equippedTraitIds.length} / 3)
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">ACTIVE SLOTS</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((slotIndex) => {
                        const equippedId = equippedTraitIds[slotIndex];
                        const traitDetail = equippedId ? TRAIT_CATALOG.find(t => t.id === equippedId) : null;
                        
                        if (traitDetail) {
                          return (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              key={traitDetail.id}
                              onClick={() => handleUnequipTrait(traitDetail.id)}
                              className={`p-2 bg-zinc-90 w-full rounded-xl border cursor-pointer border-purple-500/30 transition-all flex flex-col justify-between gap-1 shadow-md hover:shadow-purple-950/20 text-left hover:bg-purple-955/20 group`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{traitDetail.emoji}</span>
                                <span className={`text-[8px] font-mono font-black border px-1 rounded ${
                                  traitDetail.rank === 'S' ? 'text-purple-400 border-purple-500/20' :
                                  traitDetail.rank === 'A' ? 'text-amber-400 border-amber-500/20' :
                                  traitDetail.rank === 'B' ? 'text-sky-400 border-sky-500/20' : 'text-zinc-500 border-zinc-800'
                                }`}>
                                  {traitDetail.rank}
                                </span>
                              </div>
                              <div className="truncate">
                                <p className="text-[10px] font-bold text-zinc-200 leading-tight group-hover:text-purple-400 transition-colors">{traitDetail.name}</p>
                                <p className="text-[8px] text-zinc-550 truncate font-mono mt-0.5">{traitDetail.effect}</p>
                              </div>
                              <span className="text-[7.5px] font-sans text-center text-rose-400 mt-1 opacity-0 group-hover:opacity-100 transition-all block">
                                [클릭 해제]
                              </span>
                            </motion.div>
                          );
                        } else {
                          return (
                            <div 
                              key={`empty-${slotIndex}`}
                              className="border-2 border-dashed border-zinc-850 rounded-xl p-2.5 flex flex-col items-center justify-center text-center select-none bg-zinc-950/25 h-[68px]"
                            >
                              <span className="text-zinc-600 text-xs font-bold leading-none">+ SLOTS</span>
                              <span className="text-[8px] text-zinc-550 leading-relaxed font-sans mt-1">비어 있음</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>

                {/* B. SOUL TRAIT COMPLETE CATALOG BOARD */}
                <div className="flex-1 flex flex-col gap-2 min-h-[160px] max-h-[300px]">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] md:text-11px font-bold text-zinc-200">성좌 각소 특성 각인 보관소</span>
                      <span className="text-[9px] text-zinc-550 font-sans mt-0.5">상점에서 추출 소환해 서명 획득한 특성 목록입니다.</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">
                      보유: {acquiredTraitIds.length} / {TRAIT_CATALOG.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto pr-1 flex-1 scrollbar-thin">
                    {/* Sort catalog so obtained is first, and sorted S -> A -> B -> C */}
                    {[...TRAIT_CATALOG]
                      .sort((a, b) => {
                        const aAcquired = acquiredTraitIds.includes(a.id);
                        const bAcquired = acquiredTraitIds.includes(b.id);
                        if (aAcquired && !bAcquired) return -1;
                        if (!aAcquired && bAcquired) return 1;
                        
                        const rankPriority = { S: 4, A: 3, B: 2, C: 1 };
                        return rankPriority[b.rank] - rankPriority[a.rank];
                      })
                      .map((trait) => {
                        const isUnlocked = acquiredTraitIds.includes(trait.id);
                        const isEquipped = equippedTraitIds.includes(trait.id);

                        if (!isUnlocked) {
                          // Locked Trait element layout
                          return (
                            <div 
                              key={trait.id}
                              className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-950 select-none opacity-40 flex flex-col justify-between gap-1 text-left relative h-[86px]"
                            >
                              <div className="flex justify-between items-center text-[9px] font-mono">
                                <span className="text-zinc-600 font-bold">🔒 LOCKED</span>
                                <span className="text-[8px] font-bold text-zinc-650 bg-zinc-950 border border-zinc-900 rounded px-1">{trait.rank}</span>
                              </div>
                              <div className="mt-1">
                                <p className="text-[10px] font-medium text-zinc-500 truncate">{trait.name}</p>
                                <p className="text-[8px] text-zinc-600 truncate mt-0.5">{trait.effect}</p>
                              </div>
                              <p className="text-[7.5px] font-mono text-center text-zinc-600 select-none block-all">미획득 특성</p>
                            </div>
                          );
                        }

                        // Locked-out Unlocked owned trait layout
                        return (
                          <div 
                            key={trait.id}
                            onClick={() => {
                              if (isEquipped) {
                                handleUnequipTrait(trait.id);
                              } else {
                                handleEquipTrait(trait.id);
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all hover:bg-zinc-900/90 cursor-pointer h-[86px] overflow-hidden ${
                              isEquipped 
                                ? 'bg-purple-950/20 border-purple-500/40 shadow-inner' 
                                : `bg-zinc-900 hover:border-zinc-700 ${
                                    trait.rank === 'S' ? 'border-purple-500/10' :
                                    trait.rank === 'A' ? 'border-amber-500/10' :
                                    trait.rank === 'B' ? 'border-sky-500/10' : 'border-zinc-850/50'
                                  }`
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs">{trait.emoji}</span>
                              <span className={`text-[8.5px] font-mono font-black border px-1 rounded-sm ${
                                trait.rank === 'S' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-extrabold shadow-[0_0_8px_rgba(168,85,247,0.15)]' :
                                trait.rank === 'A' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-extrabold' :
                                trait.rank === 'B' ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-zinc-500/15 text-zinc-450 border-zinc-800'
                              }`}>
                                {trait.rank}
                              </span>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-extrabold text-zinc-100 leading-tight truncate">{trait.name}</p>
                              <p className="text-[8px] text-zinc-400 font-medium truncate mt-0.5 leading-none">{trait.effect}</p>
                            </div>

                            <button
                              className={`w-full py-0.5 rounded text-[8px] font-black tracking-wider transition-colors text-center uppercase ${
                                isEquipped
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-zinc-950 hover:bg-purple-950/40 border border-zinc-800 hover:border-purple-500/30 text-zinc-400 hover:text-purple-400'
                              }`}
                            >
                              {isEquipped ? '장착 유닛 해제' : '장착 각성'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>

              {/* Character synchronizer guide text footer */}
              <div className="mt-3 p-2 bg-zinc-900/40 rounded-xl border border-zinc-850 text-center max-w-sm mx-auto w-full select-none">
                <span className="text-[9px] font-mono text-zinc-500">
                  💡 장착한 3개의 각인 특성은 [새로운 시간선 시작] 클릭 시 플레이어에 자동 동조 가산됩니다.
                </span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* BOTTOM NAVIGATION TAB CONTROLS RAIL */}
      <div className="px-6 py-4 bg-zinc-90 w-full border-t border-zinc-900 flex justify-around items-center gap-2 select-none z-10 bg-zinc-950">
        
        {/* Tab index 1: Scenarios List Map */}
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex flex-col items-center gap-1 py-1.5 px-4.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'scenarios' 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md font-bold' 
              : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/50'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[11px] font-sans">메인 타이틀</span>
        </button>

        {/* Tab index 2: Launcher Store */}
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center gap-1 py-1.5 px-4.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'shop' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md font-bold' 
              : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/50'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] font-sans">상점</span>
        </button>

        {/* Tab index 3: Player profile license */}
        <button
          onClick={() => setActiveTab('player')}
          className={`flex flex-col items-center gap-1 py-1.5 px-4.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'player' 
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-md font-bold' 
              : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/50'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-sans">플레이어</span>
        </button>

      </div>

      {/* 4. MODAL OVERLAY FOR USER NAME CHANGE */}
      <AnimatePresence>
        {isNameModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-5 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative select-none"
            >
              {/* Close Button tag */}
              <button 
                onClick={() => setIsNameModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-100">사용자 이름 변경</h4>
              </div>

              <p className="text-[11px] text-zinc-500 mb-4 font-sans leading-normal">
                변경하신 이름은 플레이하실 각종 시나리오 소설 내부 대사와 런처 프로필 등에 실시간 동기화되어 반영됩니다.
              </p>

              <div className="flex flex-col gap-1.5 mb-5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  maxLength={10}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all font-sans font-medium"
                />
                <span className="text-[10px] text-zinc-600 font-mono self-end">
                  {tempName.length} / 10자 제한
                </span>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsNameModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-lg cursor-pointer transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    const trimmed = tempName.trim();
                    if (trimmed) {
                      setPlayerName(trimmed);
                      setIsNameModalOpen(false);
                      setPurchaseFeedback(`📝 사용자명이 "${trimmed}"(으)로 변경되었습니다.`);
                      setTimeout(() => setPurchaseFeedback(null), 3500);
                    }
                  }}
                  disabled={!tempName.trim()}
                  className={`px-4 py-2 text-xs text-white font-bold rounded-lg cursor-pointer transition-all ${
                    tempName.trim() 
                      ? 'bg-purple-600 hover:bg-purple-500 hover:scale-105 active:scale-95' 
                      : 'bg-zinc-850 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  변경 적용
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. GACHA SUMMON PROCESS LOADING SPINNER */}
      <AnimatePresence>
        {isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-55 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="relative flex items-center justify-center w-28 h-28 mb-6">
              {/* Outer glowing orbital energy rift */}
              <div className="absolute inset-x-0 h-full w-full rounded-full border border-purple-500/20 animate-pulse bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 shadow-[0_0_50px_rgba(168,85,247,0.15)]"></div>
              {/* Inner spinning vortex rings */}
              <div className="absolute w-20 h-20 border-[3px] border-t-purple-400 border-x-transparent border-b-transparent rounded-full animate-spin"></div>
              <div className="absolute w-14 h-14 border-[3px] border-b-cyan-400 border-x-transparent border-t-transparent rounded-full animate-spin-reverse [animation-duration:1s]"></div>
              <span className="text-xl animate-pulse">🌌</span>
            </div>

            <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase tracking-widest block mb-2">
              SYNCHRONIZING RECONSTRUCT MATRIX
            </span>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1">
              차원의 인과 공간에서 인계를 추출하는 중입니다...
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-xs break-keep leading-relaxed">
              수천의 죽어간 궤적들로부터 정수만을 흡수한 뒤, 계정에 전용 성좌 서명 특성을 각인 성문화하는 데는 정렬 처리가 필수로 수반됩니다.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. GACHA COMPLETE REVEAL SHOWCASE PANEL */}
      <AnimatePresence>
        {drawResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-55 bg-black/85 backdrop-blur-xl flex flex-col justify-center p-5 md:p-8 select-none"
          >
            <div className="max-w-md w-full mx-auto flex flex-col gap-5 text-center mt-4">
              
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  🧙‍♂️
                </div>
                <h3 className="text-sm md:text-base font-extrabold text-zinc-100 tracking-tight mt-1.5 flex items-center gap-1.5 justify-center">
                  차원 성좌 특성 서명 소환 성공!
                </h3>
                <p className="text-[10px] md:text-11px text-zinc-400">
                  수만 회귀선의 파동 간섭 결과 아래의 영혼 특인들이 계정에 단단히 연동되었습니다.
                </p>
              </div>

              {/* Showcase Grid of results */}
              <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto p-1 scrollbar-thin">
                {drawResult.map((trait, index) => {
                  const isAlreadyAcquired = acquiredTraitIds.filter(id => id === trait.id).length > 1 || 
                    (acquiredTraitIds.includes(trait.id) && drawResult.slice(0, index).some(t => t.id === trait.id));
                  
                  // Equivalent refund compensation formula
                  const refundAmount = { C: 50, B: 150, A: 305, S: 600 }[trait.rank];

                  return (
                    <motion.div
                      initial={{ scale: 0.9, y: 15, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.15, type: 'spring' }}
                      key={`${trait.id}-${index}`}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 bg-zinc-950 text-left relative overflow-hidden ${
                        trait.rank === 'S' ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' :
                        trait.rank === 'A' ? 'border-amber-500/40' :
                        trait.rank === 'B' ? 'border-sky-500/40' : 'border-zinc-800'
                      }`}
                    >
                      {/* Left icon with custom rarity background */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        trait.rank === 'S' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold' :
                        trait.rank === 'A' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold' :
                        trait.rank === 'B' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-zinc-500/10 text-zinc-400 border'
                      }`}>
                        {trait.emoji}
                      </div>

                      {/* Middle Details text */}
                      <div className="flex-grow min-w-0 pr-8">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-black">{trait.rank}급</span>
                          <span className="text-xs font-bold text-zinc-150 truncate leading-none">{trait.name}</span>
                        </div>
                        <p className="text-[9.5px] text-zinc-400 mt-1 truncate">{trait.description}</p>
                        <p className="text-[9.5px] font-extrabold text-blue-400 font-sans mt-0.5">{trait.effect}</p>
                      </div>

                      {/* Right feedback: Already owned or standard new badge */}
                      {isAlreadyAcquired ? (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-right select-none">
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded font-bold">이미 보유</span>
                        </div>
                      ) : (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-right select-none animate-pulse">
                          <span className="text-[8px] font-mono bg-blue-500/10 border border-blue-500/30 text-blue-400 px-1 py-0.2 rounded font-black">NEW</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Close Button showcase */}
              <button
                onClick={() => {
                  setDrawResult(null);
                  setRefundCrystals(0);
                }}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl active:scale-95 transition-all text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-purple-950/20"
              >
                <span>성좌 서명 연동 및 승인</span>
              </button>
            </div>
          </motion.div>
        )}

        {isEnteringChronicle && (
          <motion.div
            key="entering-chronicle-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center select-none"
          >
            {/* Visual ambient glowing pulse background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse pointer-events-none" />

            {/* Logo area */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 relative z-10"
            >
              {logoImg ? (
                <div className="relative">
                  {/* Glowing border/pulse circle behind logo */}
                  <div className="absolute inset-0 -m-4 border border-blue-500/30 rounded-full animate-ping opacity-20" />
                  <img
                    src={logoImg}
                    alt="Logo"
                    referrerPolicy="no-referrer"
                    className="w-[486px] md:w-[518px] h-auto select-none pointer-events-none drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl animate-spin">
                  🌀
                </div>
              )}

              {/* Text Information */}
              <div className="text-center flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <h3 className="text-sm font-bold text-zinc-100 tracking-wider ml-1">
                    차원 연대기 동조 분석 중...
                  </h3>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                  SYNCHRONIZING CURRENT CHRONICLE SCENARIO
                </p>
              </div>

              {/* Scrollable progress line */}
              <div className="w-48 h-1 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden mt-1.5">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
                />
              </div>

              <p className="text-[11px] text-zinc-400 font-sans max-w-xs break-keep text-center opacity-80 mt-2 leading-relaxed">
                인과 궤적 안전 조율 및 성좌 특성을 동기화하는 중입니다. 곧 스토리 구역으로 진입합니다.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
