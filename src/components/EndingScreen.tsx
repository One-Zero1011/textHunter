/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { FAIL_LOGS, FailLog } from '../data';

interface EndingScreenProps {
  endingType: 'dead' | 'world_destroyed' | 'normal' | 'happy' | null;
  loopCount: number;
  recordCount: number;
  handleRewindLoop: () => void;
  resetGameState: () => void;
  setGameStarted: (val: boolean) => void;
  setEndingType: (val: 'dead' | 'world_destroyed' | 'normal' | 'happy' | null) => void;
  setRecordCount: (val: number) => void;
  setOnLauncher?: (val: boolean) => void;
}

export default function EndingScreen({
  endingType,
  loopCount,
  recordCount,
  handleRewindLoop,
  resetGameState,
  setGameStarted,
  setEndingType,
  setRecordCount,
  setOnLauncher
}: EndingScreenProps) {
  return (
    <div id="game-ending-screen" className="absolute inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 md:p-10 overflow-hidden">
      
      <div className="flex-grow flex flex-col justify-center items-center gap-5 text-center mt-8 pb-6">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] text-3xl animate-bounce">
          🚨
        </div>
        
        {endingType === 'dead' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs md:text-sm font-mono text-red-500 uppercase tracking-widest font-bold">TIMELINE COMPROMISED</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display italic text-zinc-150 uppercase tracking-tight font-sans">치명적 파트 붕괴: 즉사 판정</h2>
            <p className="text-sm md:text-base text-zinc-350 font-medium leading-relaxed font-sans px-4 mt-2 max-w-xl break-keep">
              전투 중 <strong>머리(Head)</strong> 혹은 <strong>몸통(Torso)</strong>의 체력 파괴 상태를 수호하지 못해 호흡을 임종당했습니다. 시공 인자가 파쇄되며 현재 회차는 소멸 완료 처리되었습니다.
            </p>
          </div>
        )}

        {endingType === 'world_destroyed' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs md:text-sm font-mono text-red-500 uppercase tracking-widest font-bold">D-0 SURRENDER</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display italic text-zinc-150 uppercase tracking-tight font-sans">게이트 폭사: 서울 침공 멸망</h2>
            <p className="text-sm md:text-base text-zinc-350 font-medium leading-relaxed font-sans px-4 mt-2 max-w-xl break-keep">
              100일 한계 카운트다운에 임했으나, 게이트의 심장 코어를 괴멸할 마력 역량이 부족했습니다. 서울 하늘이 핏빛 덮개로 암도되어 지구 전체가 산산조각 납니다.
            </p>
          </div>
        )}

        {endingType === 'normal' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs md:text-sm font-mono text-amber-500 uppercase tracking-widest font-bold">NORMAL ENDING</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display italic text-amber-500 uppercase tracking-tight font-sans">조율된 불신의 방벽: 노말 엔딩</h2>
            <p className="text-sm md:text-base text-zinc-350 font-medium leading-relaxed font-sans px-4 mt-2 max-w-xl break-keep">
              S급 게이트를 섬멸하여 서울의 즉각적인 멸망은 긴밀히 연장되었습니다! 전 세계 각성자 협회는 위선적인 칭송을 보냅니다... <br/><br/>
              그러나 온전한 인과 교정의 단서인 <strong>{FAIL_LOGS.length}개의 "기밀 데이터 노드"</strong>를 완벽히 취합하지 못해, 잔류하는 게이트의 시공 가중치가 다시 뒤틀리며 아득히 먼 새벽, 100일 전 침공 시작 시점으로 강제 대역 회귀됩니다!
            </p>
          </div>
        )}

        {endingType === 'happy' && (
          <div className="flex flex-col gap-4 w-full max-w-2xl px-4 select-text">
            <div className="flex flex-col gap-3 p-6 border border-blue-500/30 bg-zinc-900 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] break-keep">
              <span className="text-xs md:text-sm font-mono text-blue-400 uppercase tracking-widest font-bold">TRUE HAPPY ENDING</span>
              <h2 className="text-xl md:text-2xl font-extrabold font-display italic text-blue-400 flex items-center justify-center gap-1.5 uppercase tracking-tight font-sans">
                <ShieldCheck className="w-6 h-6 text-blue-400 animate-pulse" />
                인과율 전복 성역 달성: 트루 엔딩
              </h2>
              <p className="text-sm md:text-base text-zinc-300 font-medium leading-relaxed font-sans px-2 mt-2">
                S급 게이트 심장에서 마력 파동을 개방하는 순간, 아군 S급 Recruit 동료들의 연합과 미리 수집해 둔 <strong>{FAIL_LOGS.length}개의 전생 조각</strong>이 정교한 수식으로 연계되었습니다! <br/><br/>
                당신은 이 영겁의 무한 루프 시스템을 직접 프로그래밍해 둔 장본인이 먼 미래의 자신이었음을 해독해 냈고, 백도어로 시스템 근원핵을 영구 분쇄했습니다. 지구는 100일 종말에서 온전히 해방되었습니다!
              </p>
            </div>

            {/* Fully Unmasked 16 Memories of the Soul */}
            <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto p-4 border border-zinc-850 bg-zinc-950/80 rounded-2xl text-left shadow-inner text-xs scrollbar-thin">
              <span className="text-[11px] font-mono font-bold text-amber-400 px-1 tracking-wider uppercase block my-1">
                🌌 완전히 언해킹 및 복원된 수천 생애의 영혼 기억 편린 (Memory Logs Unmasked)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                {FAIL_LOGS.map((log: FailLog) => (
                  <div key={log.id} className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                    <div className="flex justify-between items-center mb-1.5 border-b border-zinc-850 pb-1">
                      <span className="text-xs font-bold text-blue-400 font-mono tracking-tight">{log.trueTitle}</span>
                      <span className="text-[9px] text-zinc-500 font-mono font-bold">NODE_{log.id < 10 ? `0${log.id}` : log.id}</span>
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
          <div className="mt-5 p-4 bg-zinc-900 rounded-xl border border-zinc-805 text-xs md:text-sm font-mono text-blue-400 text-left max-w-md">
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
            className="w-full max-w-sm py-4 bg-zinc-105 hover:bg-zinc-100 text-zinc-950 font-extrabold rounded-xl active:scale-95 hover:bg-zinc-200 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/30 animate-pulse cursor-pointer"
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
              if (setOnLauncher) setOnLauncher(true);
            }}
            className="w-full max-w-sm py-4 bg-zinc-105 hover:bg-zinc-100 text-zinc-950 font-extrabold rounded-xl active:scale-95 hover:bg-zinc-200 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/30 cursor-pointer"
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
  );
}
