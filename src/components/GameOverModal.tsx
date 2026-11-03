/**
 * Project Iron Storm - Game Over Modal
 */

import React from 'react';
import { GameEngine } from '../game/engine';
import { RotateCcw, Home, Trophy, Skull } from 'lucide-react';

interface GameOverModalProps {
  engine: GameEngine;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ engine, onRetry, onHome }) => {
  const p1 = engine.players[0];
  const p2 = engine.players[1];
  const totalScore = (p1?.score || 0) + (p2?.score || 0);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-5">
        
        {/* ICON & TITLE */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-500 mb-3 shadow-lg">
            <Skull className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-heading font-black text-red-500 tracking-wider">
            MISSION FAILED
          </h2>
          <span className="font-arcade text-xs text-red-300 tracking-widest mt-0.5">
            ALL OPERATIVES KIA
          </span>
        </div>

        {/* SCORE SUMMARY */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>FINAL SCORE</span>
            <span className="font-mono-data font-bold text-base text-amber-400">
              {totalScore.toString().padStart(6, '0')}
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              HIGH SCORE
            </span>
            <span className="font-mono-data font-bold text-white">
              {engine.highScore.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            CONTINUE MISSION
          </button>
          <button
            onClick={onHome}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Title Menu
          </button>
        </div>

      </div>
    </div>
  );
};
