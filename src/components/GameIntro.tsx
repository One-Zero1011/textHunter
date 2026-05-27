/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Smartphone, Terminal, Play, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameIntroProps {
  loopCount: number;
  onStartGame: () => void;
}

export default function GameIntro({ loopCount, onStartGame }: GameIntroProps) {
  const [step, setStep] = useState<number>(0);

  const script = [
    {
      title: '⚠️ 성급 각성 검사 장치 충돌',
      text: '국가 공인 각성 센터의 정밀 크리스탈 스캐너가 불규칙하게 진동하기 시작합니다. 어마어마한 마력 총량이 잡히는가 싶더니 극도로 낮은 불능의 신호로 귀결됩니다.',
      systemText: '[SYSTEM ERROR]: "측정 불가 - 등급 판정 오류"'
    },
    {
      title: '등급 보류 : F급 헌터',
      text: '길드 어른들은 실망스런 눈초리로 혀를 차며 가버리고, 당신은 사상 유례없는 "F급 등급 보류" 판정표를 손에 들게 되었습니다. 절망에 젖어 쓰러져 있던 그때, 주머니 속 스마트폰이 기이하게 뜨거워집니다.',
      systemText: '● 스마트폰 액정이 지지직거리며 정체불명의 파일이 설치됩니다.'
    },
    {
      title: '📱 System: 100 활성화',
      text: '가정용 백도어나 바이러스처럼 잠식해 들어간 앱은, 기이하게도 당신의 망막에 푸른색 상태 창을 전송합니다. 그리고 배경 화면은 붉은 핏빛으로 변해 카운트다운을 표시합니다.',
      systemText: '⏱️ 카운트다운 잔여 한계치: 100:00:00 (D-100)'
    }
  ];

  const handleNext = () => {
    if (step < script.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onStartGame();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col justify-between p-6 overflow-hidden">
      
      {/* Glitch Grid Cover background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none"></div>

      {/* TOP HEADER */}
      <div className="flex flex-col items-center mt-6">
        <span className="text-[10px] font-mono tracking-widest text-rose-500 uppercase">
          {loopCount > 1 ? `억겁의 인과율 #${loopCount}번째 변곡점` : '최초 각성 시뮬레이션'}
        </span>
        <h2 className="text-xl font-extrabold font-sans text-center tracking-tight mt-1 text-neutral-100">
          등급 보류 : F급 헌터
        </h2>
        <div className="h-0.5 w-16 bg-rose-600 mt-2 rounded"></div>
      </div>

      {/* SCRIPT STEPS SCREEN */}
      <div className="flex-1 flex flex-col justify-center items-center px-2 my-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-neutral-900/80 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4 relative shadow-[0_0_20px_rgba(244,63,94,0.03)]"
          >
            {/* Step symbol decoration */}
            <div className="absolute -top-3.5 left-6 bg-rose-600 px-3 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-widest uppercase text-white shadow-md">
              STAGE 0{step + 1}
            </div>

            <h3 className="text-sm font-bold text-rose-400 mt-2 border-b border-neutral-800 pb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              {script[step].title}
            </h3>

            <p className="text-[11px] leading-relaxed text-neutral-300 font-sans break-keep font-medium">
              {script[step].text}
            </p>

            {/* Glowing System Prompt code block */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-rose-950/40 text-[9.5px] font-mono text-cyan-400 leading-normal flex items-start gap-2 shadow-inner">
              <Terminal className="w-3.5 h-3.5 text-cyan-500 shrink-5 mt-0.5" />
              <span className="break-all">{script[step].systemText}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {loopCount > 1 && step === 0 && (
          <div className="absolute -bottom-4 animate-bounce text-xs font-mono text-amber-500 mt-2 bg-amber-950/20 px-3 py-1 rounded-full border border-amber-900/30">
            ⏳ 서울이 멸망하여 시간이 무로 돌아가, 과거로 되돌아왔습니다.
          </div>
        )}
      </div>

      {/* ACTIONS FOOTER */}
      <div className="mb-6 flex flex-col items-center gap-4">
        <button
          onClick={handleNext}
          className="w-full max-w-xs py-3.5 bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-500 text-neutral-100 font-bold text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_12px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-1.5"
        >
          <span>{step < script.length - 1 ? '정밀 검사 계속하기' : 'System: 100 가동'}</span>
          <Play className="w-3.5 h-3.5 text-white" />
        </button>

        <span className="text-[9px] text-neutral-500 font-mono">
          모두가 불가능이라 한 F급의 기적, 서울의 운명은 당신 손끝에 걸려 있습니다.
        </span>
      </div>

    </div>
  );
}
