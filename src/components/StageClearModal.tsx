/**
 * Project Iron Storm - Stage Clear Modal
 */

import React from 'react';
import { GameEngine } from '../game/engine';
import { Trophy, ArrowRight, Home, Heart, Award } from 'lucide-react';

interface StageClearModalProps {
  engine: GameEngine;
  onNextStage: () => void;
  onHome: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({ engine, onNextStage, onHome }) => {
  const p1 = engine.players[0];
  const p2 = engine.players[1];
  const totalScore = (p1?.score || 0) + (p2?.score || 0);
  const rescuedCount = engine.pows.filter(p => p.rescued).length;
  const powBonus = rescuedCount * 2500;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-5">
        
        {/* ICON & TITLE */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-heading font-black text-emerald-400 tracking-wider">
            MISSION COMPLETE!
          </h2>
          <span className="font-arcade text-xs text-emerald-200 tracking-widest mt-0.5">
            SECTOR LIBERATED
          </span>
        </div>

        {/* MISSION DEBRIEFING */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>COLOSSUS ELIMINATED:</span>
            <span className="font-mono-data font-bold text-amber-400">+50,000 PTS</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              POWs RESCUED ({rescuedCount} / {engine.pows.length}):
            </span>
            <span className="font-mono-data font-bold text-amber-400">+{powBonus} PTS</span>
          </div>

          <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2 text-sm font-bold">
            <span className="text-white">TOTAL SCORE:</span>
            <span className="font-mono-data text-emerald-400">
              {(totalScore + powBonus).toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button
            onClick={onNextStage}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            NEXT MISSION
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onHome}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Title
          </button>
        </div>

      </div>
    </div>
  );
};
