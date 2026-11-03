/**
 * Project Iron Storm - Virtual Touch Controls
 * Mobile & tablet on-screen controls for 8-way directional aiming and arcade action buttons
 */

import React from 'react';
import { inputManager } from '../game/input';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bomb, Shield, Zap } from 'lucide-react';

export const TouchControls: React.FC = () => {
  const handleTouch = (key: 'up' | 'down' | 'left' | 'right' | 'jump' | 'shoot' | 'bomb' | 'mount', active: boolean) => {
    inputManager.setTouchInput(key, active);
  };

  return (
    <div className="fixed inset-x-0 bottom-4 px-6 flex justify-between items-end pointer-events-none select-none z-40">
      
      {/* LEFT: 8-WAY D-PAD */}
      <div className="relative w-40 h-40 pointer-events-auto bg-slate-950/60 backdrop-blur-md rounded-full border border-slate-700/60 p-2 shadow-2xl flex items-center justify-center">
        {/* UP */}
        <button
          onTouchStart={() => handleTouch('up', true)}
          onTouchEnd={() => handleTouch('up', false)}
          onMouseDown={() => handleTouch('up', true)}
          onMouseUp={() => handleTouch('up', false)}
          className="absolute top-1 w-12 h-12 bg-slate-800/80 active:bg-amber-600 rounded-lg flex items-center justify-center text-slate-200 border border-slate-600 active:scale-95 transition-transform"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        {/* DOWN */}
        <button
          onTouchStart={() => handleTouch('down', true)}
          onTouchEnd={() => handleTouch('down', false)}
          onMouseDown={() => handleTouch('down', true)}
          onMouseUp={() => handleTouch('down', false)}
          className="absolute bottom-1 w-12 h-12 bg-slate-800/80 active:bg-amber-600 rounded-lg flex items-center justify-center text-slate-200 border border-slate-600 active:scale-95 transition-transform"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        {/* LEFT */}
        <button
          onTouchStart={() => handleTouch('left', true)}
          onTouchEnd={() => handleTouch('left', false)}
          onMouseDown={() => handleTouch('left', true)}
          onMouseUp={() => handleTouch('left', false)}
          className="absolute left-1 w-12 h-12 bg-slate-800/80 active:bg-amber-600 rounded-lg flex items-center justify-center text-slate-200 border border-slate-600 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* RIGHT */}
        <button
          onTouchStart={() => handleTouch('right', true)}
          onTouchEnd={() => handleTouch('right', false)}
          onMouseDown={() => handleTouch('right', true)}
          onMouseUp={() => handleTouch('right', false)}
          className="absolute right-1 w-12 h-12 bg-slate-800/80 active:bg-amber-600 rounded-lg flex items-center justify-center text-slate-200 border border-slate-600 active:scale-95 transition-transform"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        {/* CENTER PIVOT */}
        <div className="w-8 h-8 rounded-full bg-slate-700/60 border border-slate-500" />
      </div>

      {/* RIGHT: ARCADE ACTION BUTTONS */}
      <div className="relative w-48 h-40 pointer-events-auto flex items-end justify-end gap-3">
        {/* MOUNT / TANK (Top Left) */}
        <button
          onTouchStart={() => handleTouch('mount', true)}
          onTouchEnd={() => handleTouch('mount', false)}
          onMouseDown={() => handleTouch('mount', true)}
          onMouseUp={() => handleTouch('mount', false)}
          className="w-13 h-13 bg-blue-600/80 active:bg-blue-500 rounded-full flex flex-col items-center justify-center text-white border border-blue-400 shadow-xl active:scale-95 transition-transform"
        >
          <Shield className="w-4 h-4" />
          <span className="text-[9px] font-bold font-arcade">TANK</span>
        </button>

        {/* GRENADE / BOMB (Top Right) */}
        <button
          onTouchStart={() => handleTouch('bomb', true)}
          onTouchEnd={() => handleTouch('bomb', false)}
          onMouseDown={() => handleTouch('bomb', true)}
          onMouseUp={() => handleTouch('bomb', false)}
          className="w-14 h-14 bg-red-600/80 active:bg-red-500 rounded-full flex flex-col items-center justify-center text-white border border-red-400 shadow-xl active:scale-95 transition-transform"
        >
          <Bomb className="w-5 h-5" />
          <span className="text-[10px] font-bold font-arcade">BOMB</span>
        </button>

        {/* JUMP (Bottom Left) */}
        <button
          onTouchStart={() => handleTouch('jump', true)}
          onTouchEnd={() => handleTouch('jump', false)}
          onMouseDown={() => handleTouch('jump', true)}
          onMouseUp={() => handleTouch('jump', false)}
          className="w-16 h-16 bg-emerald-600/85 active:bg-emerald-500 rounded-full flex flex-col items-center justify-center text-white border border-emerald-400 shadow-xl active:scale-95 transition-transform"
        >
          <span className="text-xs font-bold font-arcade tracking-wider">JUMP</span>
        </button>

        {/* SHOOT / FIRE (Bottom Right - Largest) */}
        <button
          onTouchStart={() => handleTouch('shoot', true)}
          onTouchEnd={() => handleTouch('shoot', false)}
          onMouseDown={() => handleTouch('shoot', true)}
          onMouseUp={() => handleTouch('shoot', false)}
          className="w-18 h-18 bg-amber-500 active:bg-amber-400 rounded-full flex flex-col items-center justify-center text-slate-950 border-2 border-yellow-200 shadow-2xl active:scale-95 transition-transform"
        >
          <Zap className="w-6 h-6 fill-slate-950" />
          <span className="text-xs font-bold font-arcade tracking-wider">FIRE</span>
        </button>
      </div>

    </div>
  );
};
