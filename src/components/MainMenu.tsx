/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gamepad2, FolderOpen } from 'lucide-react';

interface MainMenuProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  hasSave: boolean;
  onStartGame: () => void;
  onLoadGame: () => void;
  logoImg: string;
  onBackToLauncher?: () => void;
}

export default function MainMenu({
  playerName,
  setPlayerName,
  hasSave,
  onStartGame,
  onLoadGame,
  logoImg,
  onBackToLauncher
}: MainMenuProps) {
  return (
    <div id="game-main-menu" className="absolute inset-0 z-50 bg-zinc-950 flex flex-col justify-between p-6 md:p-10 overflow-hidden">
      
      {/* Back button link if launcher is enabled */}
      {onBackToLauncher && (
        <button 
          onClick={onBackToLauncher}
          className="absolute top-5 left-5 z-25 text-xs text-zinc-400 hover:text-blue-400 font-mono flex items-center gap-1.5 cursor-pointer bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 py-1.5 px-3 rounded-lg transition-colors"
        >
          <span>←</span>
          <span>시나리오 선택기 돌아가기</span>
        </button>
      )}
      
      {/* Visual game title */}
      <div className="flex-grow flex flex-col justify-center items-center gap-4 mt-6 md:mt-10">
        <div className="relative max-w-[410px] sm:max-w-[490px] md:max-w-[530px] w-full aspect-square flex items-center justify-center">
          {/* Clean soft ambient glow behind the logo */}
          <div className="absolute inset-4 rounded-full bg-blue-500/10 blur-2xl animate-pulse"></div>
          <img 
            src={logoImg} 
            alt="등급 보류 : F급 헌터" 
            referrerPolicy="no-referrer"
            className="relative z-10 w-full h-auto object-contain drop-shadow-[0_0_35px_rgba(59,130,246,0.2)]"
          />
        </div>

        {/* Name custom inputs */}
        <div className="w-full max-w-sm mt-8 flex flex-col gap-2">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest pl-1">헌터 신원 기재 (이름)</label>
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 10))}
            placeholder="헌터 이름을 기재하세요..."
            className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 hover:border-zinc-700 focus:border-blue-500 rounded-xl p-4 text-sm text-center focus:outline-none font-sans font-bold shadow-inner transition-colors"
          />
        </div>
      </div>

      {/* Launch Action */}
      <div className="mb-6 flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
        <button
          onClick={onStartGame}
          className="w-full py-4.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-xl cursor-pointer"
        >
          <Gamepad2 className="w-5 h-5 text-zinc-950" />
          <span>등급 측정</span>
        </button>

        {hasSave && (
          <button
            onClick={onLoadGame}
            className="w-full py-4.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-blue-400 hover:text-blue-300 font-bold rounded-xl active:scale-95 transition-all text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <FolderOpen className="w-5 h-5" />
            <span>저장된 기록 불러오기</span>
          </button>
        )}
      </div>
    </div>
  );
}
