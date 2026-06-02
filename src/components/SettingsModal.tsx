/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CharacterStats } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  onSave: () => void;
  onReset: () => void;
  onExitToLauncher: () => void;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  setStats: React.Dispatch<React.SetStateAction<CharacterStats>>;
  setLobbyFeedback: (msg: string) => void;
}

export default function SettingsModal({
  onClose,
  onSave,
  onReset,
  onExitToLauncher,
  setGold,
  setStats,
  setLobbyFeedback
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-805 rounded-2xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6"
      >
        {/* Header title */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div className="flex flex-col">
            <span className="text-zinc-100 font-extrabold text-sm tracking-wider flex items-center gap-2">
              ⚙️ 시공 분석 및 시스템 설정
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Time preservation matrix</span>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 font-bold text-xs p-1 px-2.5 bg-zinc-950/80 rounded border border-zinc-850 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Info summary */}
        <p className="text-[11px] leading-relaxed text-zinc-400 break-keep font-sans">
          현재 진행 중인 헌터의 주파수 데이터 및 성장 기록을 저장하거나 원격 청소할 수 있습니다.
        </p>

        {/* CORE ACTIONS: SAVE & RESET */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onSave}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition-all text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 font-mono"
          >
            <span>💾 진행 상황 영구 보존 (저장)</span>
          </button>

          <button
            onClick={onExitToLauncher}
            className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all text-xs  tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 font-mono"
          >
            <span>🚪 저장 후 시나리오 화면으로 나가기</span>
          </button>

          <button
            onClick={onReset}
            className="w-full py-3.5 bg-rose-955 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 font-bold rounded-xl active:scale-95 transition-all text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 font-mono"
          >
            <span>♻️ 모든 시간선 해제 (완전 초기화)</span>
          </button>
        </div>

        <div className="w-full h-px bg-zinc-800 my-1"></div>

        {/* DEBUG ASSISTANCE OPERATIONS */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">🛠️ 인과 지원 제어 코드</span>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded font-mono">DEBUG</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setGold(g => g + 10000);
                setLobbyFeedback('🛠️ [디버그]: 시공 인과 자금 10,000G가 추가 포팅되었습니다.');
              }}
              className="py-2.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-lg text-[10px] font-bold text-blue-400 cursor-pointer text-center truncate transition-colors font-mono"
            >
              골드 주입 (+10,000G)
            </button>
            <button
              onClick={() => {
                setStats(s => ({
                  strength: s.strength + 5,
                  agility: s.agility + 5,
                  mana: s.mana + 5,
                  intellect: s.intellect + 5,
                }));
                setLobbyFeedback('🛠️ [디버그]: 차원 보정 보너스로 실효 전 스탯이 +5 증가했습니다.');
              }}
              className="py-2.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-lg text-[10px] font-bold text-emerald-400 cursor-pointer text-center truncate transition-colors font-mono"
            >
              전 전계 스탯 (+5)
            </button>
          </div>
        </div>

        {/* Close Button footer */}
        <button
          onClick={onClose}
          className="w-full mt-2 py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer font-sans"
        >
          제어 화면 닫기
        </button>
      </motion.div>
    </div>
  );
}
