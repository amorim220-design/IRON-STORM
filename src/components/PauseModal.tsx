/**
 * Project Iron Storm - Pause Menu Modal
 */

import React from 'react';
import { Play, RotateCcw, Home, Sliders, BookOpen } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenSettings,
  onOpenControls,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
        
        <h2 className="text-2xl font-heading font-black text-amber-400 tracking-wider">
          GAME PAUSED
        </h2>

        <div className="space-y-2 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-colors"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            RESUME (ESC)
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Mission
          </button>

          <button
            onClick={onOpenControls}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            Controls &amp; Weapons
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            Audio &amp; Display Settings
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-red-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Abandon Mission (Title)
          </button>
        </div>

      </div>
    </div>
  );
};
