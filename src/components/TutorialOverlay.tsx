import React, { useState } from 'react';
import { 
  Compass, Zap, Award, Smartphone, Calendar, Swords, 
  ArrowRight, ChevronRight, ChevronLeft, X, CheckCircle, HelpCircle, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TutorialOverlayProps {
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  badge: string;
  icon: React.ReactNode;
  content: string;
  focusArea: 'top-left' | 'top-right' | 'center' | 'bottom' | 'none';
  tip: string;
  imageAlt?: string;
  highlightCoordinates?: string;
}

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: TutorialStep[] = [
    {
      title: '인과율 가속기 동조에 오신 것을 환영합니다',
      badge: '시스템 가이드',
      icon: <HelpCircle className="w-8 h-8 text-cyan-400 animate-pulse" />,
      content: 'F급 보류 판정을 받아 절망에 빠진 헌터님. 현재 스마트폰에 가동된 [SYSTEM_60] 인과율 동조 장치가 귀하의 영혼 차원 주파수를 제어하기 시작했습니다. 60일의 종말을 전복하기 위한 핵심 가이드를 꼭 파악해 주십시오.',
      focusArea: 'none',
      tip: '언제든 메인 튜토리얼을 통해 전체 시스템 통제법을 재열람할 수 있습니다.'
    },
    {
      title: 'D-DAY 및 시간 순환 (페이즈)',
      badge: '시계열 관리',
      icon: <Calendar className="w-8 h-8 text-blue-400" />,
      content: '화면 좌측 상단에는 서울의 멸망까지 남은 시간선 인덱스(D-60)가 표시됩니다. 하루는 [아침] - [점심] - [저녁] 총 3회차의 시간 도막(페이즈)으로 흐르며, 던전 탐색 가동이나 강도 높은 훈련을 행할 때마다 1페이즈씩 역행합니다.',
      focusArea: 'top-left',
      tip: '페이즈가 흘러 저녁을 초과하면 날짜가 1일 차감되며 가방에 긴급 자동 저장(Auto-Save)이 동조됩니다.'
    },
    {
      title: '피로도 과부하 및 골드',
      badge: '생체 위험 보정',
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      content: '피로도(에너지)는 던전을 탐사하거나 훈련을 감행할 때 차감됩니다. 만약 피로도가 0에 수렴하면 전신 통제력을 잃고 실신하여, 안전한 수면 가료 후 강제로 다음날로 아침 역행하는 제약(피로도 30 복원 및 D-Day 차감)을 받습니다.',
      focusArea: 'top-right',
      tip: '숙소나 휴식처를 방문해 적절히 피로도를 채우지 못할 시 귀중한 하루가 상실되니 항상 조율하십시오!'
    },
    {
      title: '훈련 공간과 중앙 로비 인터페이스',
      badge: '훈련 공간',
      icon: <Compass className="w-8 h-8 text-emerald-400" />,
      content: '중앙의 탐지 화면에서는 길드 지구 마나 가든, 전술 체력 훈련관, 장비 연성 상점, 헌터 숙소 등을 돌아다닐 수 있습니다. 이곳에서 자금을 가동해 스탯을 향상시키거나, 피로도를 상쇄하고 장비를 영속 구입할 수 있습니다.',
      focusArea: 'center',
      tip: '매 페이즈마다 각 장소별로 보상이 다르거나 동료 헌터들의 돌발 출현 궤적이 변경될 수 있습니다.'
    },
    {
      title: '스마트폰 어플리케이션 & 던전 레이드',
      badge: '동료 영입 및 전투',
      icon: <Smartphone className="w-8 h-8 text-violet-400" />,
      content: '하단 탑재 바의 스마트폰 앱을 개방하여, 서울 곳곳에 퍼진 강력한 S급/A급 헌터 파티원들과 1:1 대화(Rapport)를 해 보십시오. 그들의 전생 고민을 풀어주고 신뢰를 얻어 최종 헌터 동맹(Recruit)으로 연계 탑재해야 하늘 성문을 봉인할 수 있습니다.',
      focusArea: 'bottom',
      tip: '스마트폰 내부의 [게이트 제어] 앱을 통해 마력이 분화하는 던전에 진입하여 골드와 초희귀 특장급 유물을 파밍할 수도 있습니다!'
    },
    {
      title: '전복 위협: 던전의 사지 붕괴 시스템',
      badge: '전투 규칙 경고',
      icon: <ShieldAlert className="w-8 h-8 text-rose-500 animate-bounce" />,
      content: '던전에서는 머리, 몸통, 손발 등 6개 부위 체력이 정밀 시뮬레이션됩니다. 특히 머리(Head)나 몸통(Torso)이 고갈되는 순간, 헌터의 영혼 제어권이 파쇄되어 즉사 상태에 빠집니다. 즉사 시 모아둔 자금과 장비들이 인과 속으로 증발하며 대역행 루프로 강제 되감기 처분을 받게 됩니다.',
      focusArea: 'center',
      tip: '수호 방패 클래스인 [백운혁]이나 치료 클래스인 [박소록]과 친교를 맺어 동료로 영입해 두면 즉사를 무사히 보완해 줍니다.'
    },
    {
      title: '구원 계약 완료: 최종 궤적',
      badge: '최종 사명',
      icon: <Swords className="w-8 h-8 text-indigo-400" />,
      content: '60일이 고갈되는 순간 전방위적 파괴가 하늘을 뒤덮고, 사상 최악의 S급 게이트가 개방됩니다. 그전에 최대한 많은 S급 동료들을 동맹원으로 섭외하고 장비 스펙을 동조하여 마귀들을 영구 멸살하십시오. 자, F급의 기적을 준비하십시오!',
      focusArea: 'none',
      tip: '누적된 전생 조각 기록을 6개 복구한 상태에서 S급 게이트를 파타하면 트루 해피 엔딩을 보장받습니다.'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete tutorial
      localStorage.setItem('hunter_f_tutorial_completed', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentInfo = steps[currentStep];

  return (
    <div 
      id="tutorial-overlay-root" 
      className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-between p-4 md:p-6 select-none font-sans"
    >
      {/* 1. VISUAL HIGHLIGHT ARROWS OR EFFECTS BASED ON FOCUS AREA */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {currentInfo.focusArea === 'top-left' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-4 left-4 w-44 h-24 border-2 border-dashed border-blue-400 rounded-2xl bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-20"
          >
            <div className="absolute -bottom-8 left-6 text-blue-400 text-xs font-mono font-extrabold flex items-center gap-1 bg-zinc-950/90 px-2 py-0.5 rounded border border-blue-900/40">
              <span>▲ 시간 추적기 포인트</span>
            </div>
          </motion.div>
        )}

        {currentInfo.focusArea === 'top-right' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-4 right-14 left-auto w-64 h-20 border-2 border-dashed border-amber-400 rounded-2xl bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)] z-20"
          >
            <div className="absolute -bottom-8 right-6 text-amber-400 text-xs font-mono font-extrabold flex items-center gap-1 bg-zinc-950/90 px-2 py-0.5 rounded border border-amber-900/40">
              <span>▲ 생체 피로 수치 & 코인</span>
            </div>
          </motion.div>
        )}

        {currentInfo.focusArea === 'center' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.98, 1.02, 0.98], opacity: 0.8 }}
            transition={{ repeat: Infinity, duration: 2.0 }}
            className="absolute top-[18%] bottom-[12%] left-4 right-4 border-2 border-dashed border-emerald-400 rounded-3xl bg-emerald-500/5 shadow-[0_0_30px_rgba(52,211,153,0.15)] z-20"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 text-xs font-mono font-extrabold flex flex-col items-center gap-1 bg-zinc-950/95 px-4 py-2 rounded-xl border border-emerald-900/40 shadow-xl">
              <span>🎯 중앙 로비 활동 영역</span>
              <span className="text-[10px] text-zinc-400 font-normal">여기서 훈련/휴식/거래를 감행합니다</span>
            </div>
          </motion.div>
        )}

        {currentInfo.focusArea === 'bottom' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute bottom-4 left-4 right-4 h-24 border-2 border-dashed border-violet-400 rounded-2xl bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.3)] z-20"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-violet-400 text-xs font-mono font-extrabold flex items-center gap-1 bg-zinc-950/90 px-3 py-1 rounded-full border border-violet-900/40">
              <span>▼ 스마트폰 앱 & 보관 가방 활성단</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* 2. TOP STATUS BAR PROGRESS */}
      <div className="flex justify-between items-center bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 z-20 mt-4 h-12">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-cyan-950 text-[10px] font-bold text-cyan-400 rounded border border-cyan-800/60 font-mono">
            T
          </span>
          <span className="text-xs font-bold text-zinc-300 font-sans">인과 훈련 시스템 초기화 프로토콜</span>
        </div>
        <div className="flex gap-1.5 items-center">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep 
                  ? 'w-6 bg-cyan-500' 
                  : i < currentStep 
                  ? 'w-2 bg-cyan-800' 
                  : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>
        <button 
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 p-1 bg-zinc-950/40 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="건너뛰기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3. STEP CONTENT PANEL CONTAINER */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg mx-auto z-20 my-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-card-${currentStep}`}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 shadow-2xl shadow-black/80 flex flex-col gap-4 relative overflow-hidden"
          >
            {/* Tech line decorations */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
            
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3 mt-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-extrabold uppercase mb-0.5">
                  {currentInfo.badge} [0{currentStep + 1} / 0{steps.length}]
                </span>
                <h3 className="text-base md:text-lg font-bold text-zinc-100 font-sans tracking-tight leading-tight">
                  {currentInfo.title}
                </h3>
              </div>
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 shadow-inner flex items-center justify-center">
                {currentInfo.icon}
              </div>
            </div>

            <p className="text-[12px] md:text-xs leading-relaxed text-zinc-200 font-sans font-medium break-keep whitespace-pre-line bg-zinc-950/40 p-3 rounded-2xl border border-zinc-850/50 shadow-inner">
              {currentInfo.content}
            </p>

            {/* TIP PANEL BOX */}
            <div className="p-3 bg-cyan-950/30 border border-cyan-850/40 rounded-2xl flex items-start gap-2 text-cyan-300">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded mt-0.5 uppercase tracking-wide">
                TIP
              </span>
              <p className="text-[11px] leading-relaxed font-sans font-medium break-keep text-zinc-300">
                {currentInfo.tip}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. NAVIGATION BAR CONTROLS */}
      <div className="py-4 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex justify-between items-center px-4 md:px-6 z-20 mb-4 h-16 shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all font-sans select-none ${
            currentStep === 0 
              ? 'opacity-40 text-zinc-650 pointer-events-none' 
              : 'text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 shadow cursor-pointer active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전 가이드</span>
        </button>

        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest hidden sm:inline-block">
          ● SYSTEM COORDINATE INTEGRITY SECURED ●
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-950/30 cursor-pointer text-center"
        >
          <span>{currentStep === steps.length - 1 ? '시뮬레이션 시작' : '다음 가이드'}</span>
          {currentStep === steps.length - 1 ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
