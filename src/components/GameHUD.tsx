/**
 * Project Iron Storm - Arcade HUD Component
 * Metal Slug inspired heads-up display: 1P/2P lives, score, weapon ammo, grenades, combo & boss HP
 */

import React from 'react';
import { GameEngine } from '../game/engine';
import { WEAPONS } from '../game/types';
import { Bomb, Shield, Trophy, Zap, Crosshair } from 'lucide-react';

interface GameHUDProps {
  engine: GameEngine;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ engine, onPause }) => {
  const p1 = engine.players[0];
  const p2 = engine.players[1];
  const p1Wep = p1 ? WEAPONS[p1.currentWeapon] : null;
  const p2Wep = p2 ? WEAPONS[p2.currentWeapon] : null;

  // Mounted Tank
  const activeTank = engine.vehicles.find(v => v.isOccupied);

  return (
    <div className="absolute inset-x-0 top-0 p-4 pointer-events-none select-none z-30">
      <div className="max-w-7xl mx-auto flex items-start justify-between">
        
        {/* PLAYER 1 HUD */}
        {p1 && (
          <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-amber-500/30 shadow-xl pointer-events-auto">
            {/* Portrait & Lives */}
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-amber-500 to-amber-700 flex items-center justify-center border border-amber-300 shadow-md">
                <span className="font-heading font-bold text-xl text-slate-950">1P</span>
              </div>
              <div className="absolute -bottom-2 -right-1 bg-red-600 text-white font-mono-data text-xs px-1.5 py-0.2 rounded-full font-bold border border-red-300 shadow">
                x{p1.lives}
              </div>
            </div>

            {/* Score & Name */}
            <div className="flex flex-col">
              <span className="text-xs font-arcade text-amber-400 font-bold tracking-wider">
                {p1.name.toUpperCase()}
              </span>
              <span className="text-xl font-mono-data font-bold text-amber-200 tracking-tight">
                {p1.score.toString().padStart(6, '0')}
              </span>
            </div>

            {/* Weapon & Ammo */}
            {p1Wep && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-arcade font-bold text-lg shadow-inner"
                  style={{ backgroundColor: p1Wep.color, color: '#090d16' }}
                >
                  {p1Wep.code}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-arcade">AMMO</span>
                  <span className="font-mono-data font-bold text-sm text-slate-100">
                    {p1.ammo === Infinity ? '∞' : p1.ammo}
                  </span>
                </div>
              </div>
            )}

            {/* Grenades (Bombs) */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-red-400">
                <Bomb className="w-4 h-4" />
              </div>
              <span className="font-mono-data font-bold text-sm text-red-300">
                x{p1.bombs}
              </span>
            </div>
          </div>
        )}

        {/* CENTER TELEMETRY & COMBO BANNER */}
        <div className="flex flex-col items-center gap-1.5">
          {/* High Score */}
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-slate-700 text-xs text-slate-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-arcade text-amber-400">HI-SCORE</span>
            <span className="font-mono-data font-bold text-white">
              {engine.highScore.toString().padStart(6, '0')}
            </span>
          </div>

          {/* Dynamic Combo Multiplier */}
          {engine.comboCount > 1 && (
            <div className="animate-bounce bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 font-arcade font-bold px-3 py-0.5 rounded-md shadow-lg text-xs tracking-wider border border-yellow-200">
              {engine.comboCount}x {engine.comboCount >= 8 ? 'IRON STORM!' : engine.comboCount >= 4 ? 'ULTRA COMBO!' : 'COMBO!'}
            </div>
          )}

          {/* Tank Mounted Status */}
          {activeTank && (
            <div className="flex items-center gap-2 bg-blue-950/90 backdrop-blur-md px-3 py-1 rounded-lg border border-blue-400 shadow-lg text-xs text-blue-200">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-arcade font-bold">IRON TANK ARMOR:</span>
              <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-blue-500/40">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, (activeTank.hp / activeTank.maxHp) * 100)}%` }}
                />
              </div>
              <span className="font-mono-data text-[11px] font-bold">
                {Math.max(0, Math.round(activeTank.hp))}%
              </span>
            </div>
          )}
        </div>

        {/* PLAYER 2 HUD (or Single Player Controls Info / Pause) */}
        {p2 && p2.isActive ? (
          <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-sky-500/30 shadow-xl pointer-events-auto">
            {/* Weapon & Ammo */}
            {p2Wep && (
              <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-arcade">AMMO</span>
                  <span className="font-mono-data font-bold text-sm text-slate-100">
                    {p2.ammo === Infinity ? '∞' : p2.ammo}
                  </span>
                </div>
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-arcade font-bold text-lg shadow-inner"
                  style={{ backgroundColor: p2Wep.color, color: '#090d16' }}
                >
                  {p2Wep.code}
                </div>
              </div>
            )}

            {/* Grenades */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
              <span className="font-mono-data font-bold text-sm text-red-300">
                x{p2.bombs}
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-red-400">
                <Bomb className="w-4 h-4" />
              </div>
            </div>

            {/* Score & Name */}
            <div className="flex flex-col text-right">
              <span className="text-xs font-arcade text-sky-400 font-bold tracking-wider">
                {p2.name.toUpperCase()}
              </span>
              <span className="text-xl font-mono-data font-bold text-sky-200 tracking-tight">
                {p2.score.toString().padStart(6, '0')}
              </span>
            </div>

            {/* Portrait & Lives */}
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-sky-500 to-sky-700 flex items-center justify-center border border-sky-300 shadow-md">
                <span className="font-heading font-bold text-xl text-slate-950">2P</span>
              </div>
              <div className="absolute -bottom-2 -right-1 bg-red-600 text-white font-mono-data text-xs px-1.5 py-0.2 rounded-full font-bold border border-red-300 shadow">
                x{p2.lives}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onPause}
              className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-xs font-arcade text-slate-200 rounded-lg border border-slate-700 backdrop-blur-md transition-colors"
            >
              PAUSE (ESC)
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS HINT */}
      <div className="fixed bottom-3 left-4 flex items-center gap-3 text-[11px] text-slate-400 bg-slate-950/70 backdrop-blur-sm px-3 py-1 rounded-md border border-slate-800">
        <span><strong className="text-amber-400">A/D:</strong> Move</span>
        <span><strong className="text-amber-400">W/S:</strong> Aim / Crouch</span>
        <span><strong className="text-amber-400">J:</strong> Fire</span>
        <span><strong className="text-amber-400">K:</strong> Jump</span>
        <span><strong className="text-amber-400">L:</strong> Bomb</span>
        <span><strong className="text-amber-400">E:</strong> Mount Tank</span>
      </div>
    </div>
  );
};
