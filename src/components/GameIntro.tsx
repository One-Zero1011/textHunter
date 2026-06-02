/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Smartphone, Terminal, Play, AlertCircle, Wifi, Battery, CheckCircle, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameIntroProps {
  loopCount: number;
  onStartGame: () => void;
}

type InstallStatus = 'ready' | 'installing' | 'done';

export default function GameIntro({ loopCount, onStartGame }: GameIntroProps) {
  const [step, setStep] = useState<number>(0);
  
  // Interactive smartphone states
  const [installStatus, setInstallStatus] = useState<InstallStatus>('ready');
  const [progress, setProgress] = useState<number>(0);
  const [activeLogIndex, setActiveLogIndex] = useState<number>(0);

  const script = [
    {
      title: '⚠️ 성급 각성 검사 장치 충돌',
      text: '국가 공인 각성 센터의 정밀 크리스탈 스캐너가 불규칙하게 진동하기 시작합니다. 어마어마한 마력 총량이 잡히는가 싶더니 극도로 낮은 불능의 신호로 귀결됩니다.',
      systemText: '[SYSTEM ERROR]: "측정 불가 - 등급 판정 오류"'
    },
    {
      title: '등급 보류 : F급 헌터',
      text: '각성 측정관들은 싸늘한 비웃음을 흘리며 측정소 불을 꺼버렸고, 당신은 사상 유례없는 "F급 등급 보류" 판정표를 손에 쥔 채 홀로 외롭게 남겨졌습니다. 절망이 가슴을 무너뜨리던 그때, 주머니 속 스마트폰이 기이하게 뜨거워집니다.',
      systemText: '● 스마트폰 액정이 지지직거리며 정체불명의 파일이 설치됩니다.'
    }
  ];

  const installLogs = [
    'Initializing temporal connection security module...',
    'Bypassing Central Awakened Association Firewall...',
    'Synchronizing timeline index tracker (Target: D-60)...',
    'Injecting causality buffer matrix...',
    'Binding soul-crystal coordinate pointer to player...',
    'System: 60 backdoor installation successful!'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (installStatus === 'installing') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setInstallStatus('done');
            return 100;
          }
          const nextProgress = prev + Math.floor(Math.random() * 8) + 4;
          // Slowly phase logs
          setActiveLogIndex(Math.floor((Math.min(100, nextProgress) / 100) * installLogs.length));
          return Math.min(100, nextProgress);
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [installStatus]);

  const handleNext = () => {
    if (step < script.length) {
      setStep(prev => prev + 1);
    }
  };

  const handleStartInstallation = () => {
    if (installStatus !== 'ready') return;
    setInstallStatus('installing');
  };

  return (
    <div id="game-intro-root" className="absolute inset-0 z-50 bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 md:p-6 overflow-hidden select-none">
      
      {/* Glitch Grid Cover background effect */}
      <div id="glitch-ambient-filter" className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10"></div>

      {/* TOP HEADER */}
      <div className="flex flex-col items-center mt-4">
        <span className="text-[10px] font-mono tracking-widest text-rose-500 uppercase">
          {loopCount > 1 ? `억겁의 인과율 #${loopCount}번째 변곡점` : '최초 각성 시뮬레이션'}
        </span>
        <h2 className="text-lg md:text-xl font-extrabold font-sans text-center tracking-tight mt-1 text-neutral-100 uppercase">
          등급 보류 : F급 헌터
        </h2>
        <div className="h-0.5 w-16 bg-rose-600 mt-1.5 rounded"></div>
      </div>

      {/* SCRIPT STEPS SCREEN */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg mx-auto px-2 my-2 relative">
        <AnimatePresence mode="wait">
          {step < script.length ? (
            <motion.div
              key={`intro-step-${step}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full bg-neutral-900/90 p-5 rounded-2xl border border-neutral-800/80 flex flex-col gap-4 relative shadow-[0_0_24px_rgba(244,63,94,0.05)]"
            >
              {/* Step symbol decoration */}
              <div className="absolute -top-3.5 left-6 bg-rose-600 px-3 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-widest uppercase text-white shadow-md">
                STAGE 0{step + 1}
              </div>

              <h3 className="text-xs md:text-sm font-bold text-rose-400 mt-2 border-b border-neutral-850 pb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                {script[step].title}
              </h3>

              <p className="text-[11px] md:text-xs leading-relaxed text-neutral-300 font-sans break-keep font-medium">
                {script[step].text}
              </p>

              {/* Glowing System Prompt code block */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-rose-950/40 text-[9.5px] font-mono text-cyan-400 leading-normal flex items-start gap-2 shadow-inner">
                <Terminal className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                <span className="break-all">{script[step].systemText}</span>
              </div>
            </motion.div>
          ) : (
            // CUSTOM INTEGRATED SMARTPHONE SCREEN (Interactive Installation)
            <motion.div
              key="smartphone-interactive-flow"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="w-full max-w-[280px] md:max-w-[310px] aspect-[9/18] bg-zinc-950 rounded-[40px] p-2.5 border-[6px] border-zinc-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden"
            >
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-zinc-950 rounded-b-2xl z-40 flex justify-center items-center gap-2">
                <div className="w-8 h-1 bg-zinc-800 rounded-full" />
                <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-800" />
              </div>

              {/* PHONE SCREEN CONTAINER */}
              <div className="flex-1 bg-zinc-950 rounded-[32px] overflow-hidden flex flex-col justify-between pt-6 p-4 relative border border-zinc-900 text-zinc-200">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 px-1 absolute top-1.5 left-4 right-4 z-30">
                  <span>AM 04:44</span>
                  <div className="flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5" />
                    <span>LTE</span>
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Glitch Overlay inside the phone screen */}
                <div className="absolute inset-0 bg-cyan-500/[0.01] pointer-events-none z-10" />

                {/* Main Content Areas */}
                {installStatus === 'ready' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col justify-center items-center gap-4 text-center mt-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                      <Smartphone className="w-7 h-7 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-rose-500 tracking-wider">외부 출처 패키지 침습</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal px-2 break-keep">
                        경고! 기맥 파동 검사 직후, 스마트폰의 메모리 코어가 비강제 해킹되어 인과 역추적 어플리케이션이 강제 설치를 요구하고 있습니다.
                      </p>
                    </div>

                    <div className="w-full bg-zinc-900/60 rounded-xl p-2.5 border border-zinc-850 text-left">
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-350 font-mono font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        PACKAGE: app-system-60.apk
                      </div>
                      <div className="text-[8px] text-zinc-500 mt-1 font-mono">
                        SIZE: 2.3 GB / SIGNATURE: UNKNOWN_FUTURE_SELF
                      </div>
                    </div>
                  </motion.div>
                )}

                {installStatus === 'installing' && (
                  <div className="flex-1 flex flex-col justify-center items-center gap-4 mt-4">
                    <div className="relative flex items-center justify-center">
                      {/* Spin circular progress */}
                      <Loader2 className="w-16 h-16 text-blue-500 animate-spin absolute" />
                      <span className="text-[11px] font-mono text-zinc-100 font-bold relative z-10">{progress}%</span>
                    </div>

                    <div className="text-center w-full">
                      <h4 className="text-[11px] font-bold text-blue-400">인과 앱 패키징 배포 크랙 중</h4>
                      
                      {/* Progress line */}
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-2 border border-zinc-800">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Console Live logs display */}
                    <div className="w-full h-20 bg-black/95 border border-zinc-850 rounded-xl p-2 font-mono text-[8px] text-cyan-400/85 overflow-hidden flex flex-col gap-0.5 select-none shrink-0 leading-tight">
                      <div className="text-[7.5px] text-zinc-650 tracking-wider border-b border-zinc-900 pb-0.5 mb-0.5">CONSOLE PIPELINE STATUS:</div>
                      {installLogs.slice(0, activeLogIndex + 1).map((log, i) => (
                        <div key={i} className="truncate">
                          ⚡ <span className="text-zinc-400">{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {installStatus === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col justify-center items-center gap-4 text-center mt-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-bounce">
                      <CheckCircle className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-cyan-400 tracking-wider">SYSTEM 60 가동 완료</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 px-1 leading-relaxed break-keep">
                        스마트폰의 백도어를 통한 서울 마력 수치 관측 및 '인과 회귀 앵커링' 시스템 동조가 완료되었습니다. 당신의 영혼이 60일의 종말 한계선과 동정화되었습니다.
                      </p>
                    </div>

                    <div className="w-full bg-zinc-900/80 border border-cyan-950/40 rounded-xl p-2.5 text-left font-mono text-[9px]">
                      <div className="text-amber-400 font-bold">● SYSTEM BOUND READY</div>
                      <div className="text-zinc-500 mt-0.5">D-Day Duration: 60 Days</div>
                      <div className="text-zinc-500">Subject: Class F (Pending Evaluated)</div>
                    </div>
                  </motion.div>
                )}

                {/* INTERACTIVE BUTTON ON SMARTPHONE SCREEN */}
                <div className="mt-2 text-center pb-2 z-20">
                  {installStatus === 'ready' && (
                    <button
                      onClick={handleStartInstallation}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-rose-950/40 flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>설치 및 기맥 동조 승인</span>
                    </button>
                  )}

                  {installStatus === 'installing' && (
                    <div className="w-full py-2.5 bg-zinc-900 text-zinc-500 font-bold text-[9px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 no-cursor">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      <span>보안 코드 크래킹 중...</span>
                    </div>
                  )}

                  {installStatus === 'done' && (
                    <button
                      onClick={onStartGame}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-neutral-100 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-blue-900/30 flex items-center justify-center gap-1"
                    >
                      <span>60일의 서울 구원 개시</span>
                      <Play className="w-3 h-3 text-white fill-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Home Indicator line of phone */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-zinc-800 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {loopCount > 1 && step === 0 && (
          <div className="absolute -bottom-4 animate-bounce text-[10px] font-mono text-amber-500 mt-2 bg-amber-950/20 px-3 py-1 rounded-full border border-amber-900/30 z-20">
            ⏳ 서울이 멸망하여 시간이 무로 돌아가, 과거로 되돌아왔습니다.
          </div>
        )}
      </div>

      {/* ACTIONS FOOTER */}
      <div className="mb-4 flex flex-col items-center gap-3">
        {step < script.length && (
          <button
            onClick={handleNext}
            className="w-full max-w-xs py-3.5 bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-500 text-neutral-100 font-bold text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_12px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>정밀 검사 계속하기</span>
            <Play className="w-3.5 h-3.5 text-white" />
          </button>
        )}

        {step >= script.length && (
          <div className="text-[10px] text-zinc-400 font-mono tracking-wide text-center uppercase">
            {installStatus === 'ready' && '▲ 기맥 연동기 패키지 파일을 설치하십시오.'}
            {installStatus === 'installing' && '▲ 패키지를 해킹 및 설치하고 있습니다...'}
            {installStatus === 'done' && '▲ 시스템이 시작 준비를 끝마쳤습니다!'}
          </div>
        )}

        <span className="text-[9px] text-neutral-500 font-mono text-center px-4">
          모두가 불가능이라 한 F급의 기적, 서울의 운명은 당신 손끝에 걸려 있습니다.
        </span>
      </div>

    </div>
  );
}
