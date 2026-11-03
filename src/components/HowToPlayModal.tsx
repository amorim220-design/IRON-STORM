/**
 * Project Iron Storm - How to Play & Controls Modal
 */

import React from 'react';
import { Gamepad2, Keyboard, Shield, Zap, Bomb, Heart, Crosshair } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-heading font-bold text-white tracking-wider">
              FIELD MANUAL &amp; COMBAT CONTROLS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded-md transition-colors"
          >
            Close
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          {/* 1P & 2P CONTROLS TABLE */}
          <div>
            <h3 className="font-heading font-bold text-amber-400 text-sm mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              CONTROLLER &amp; KEYBOARD BINDINGS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Player 1 */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/30 space-y-2">
                <span className="font-arcade font-bold text-amber-400 text-xs block border-b border-slate-800 pb-1">
                  PLAYER 1 (REX VANCE) / GAMEPAD 1
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Move / Crouch / Aim:</span>
                  <span className="font-mono text-amber-200">W, A, S, D / Stick</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shoot Weapon:</span>
                  <span className="font-mono text-amber-200">J or Z / X (Square)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jump:</span>
                  <span className="font-mono text-amber-200">K or X / A (Cross)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Throw Grenade:</span>
                  <span className="font-mono text-amber-200">L or C / B (Circle)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mount / Eject Tank:</span>
                  <span className="font-mono text-amber-200">E / Y (Triangle)</span>
                </div>
              </div>

              {/* Player 2 */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-sky-500/30 space-y-2">
                <span className="font-arcade font-bold text-sky-400 text-xs block border-b border-slate-800 pb-1">
                  PLAYER 2 (MAYA COLE) / GAMEPAD 2
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Move / Crouch / Aim:</span>
                  <span className="font-mono text-sky-200">Arrow Keys / Stick</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shoot Weapon:</span>
                  <span className="font-mono text-sky-200">Numpad 1 or [ . ]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jump:</span>
                  <span className="font-mono text-sky-200">Numpad 2 or [ / ]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Throw Grenade:</span>
                  <span className="font-mono text-sky-200">Numpad 3 or [ ; ]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mount / Eject Tank:</span>
                  <span className="font-mono text-sky-200">Numpad 0 or Enter</span>
                </div>
              </div>
            </div>
          </div>

          {/* WEAPON ARSENAL */}
          <div>
            <h3 className="font-heading font-bold text-amber-400 text-sm mb-3 flex items-center gap-2">
              <Crosshair className="w-4 h-4" />
              SPECIAL WEAPONS ARSENAL
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-amber-400 block">[H] Heavy Machine Gun</span>
                <p className="text-[11px] text-slate-400 mt-1">600 RPM high-velocity penetrating rounds with generous spread.</p>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-red-400 block">[F] Flame Shot</span>
                <p className="text-[11px] text-slate-400 mt-1">Expanding fiery cone that ignores riot shields and melts obstacles.</p>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-400 block">[R] Rocket Launcher</span>
                <p className="text-[11px] text-slate-400 mt-1">Semi-homing high-explosive rockets with devastating blast radius.</p>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-lime-400 block">[S] Shotgun</span>
                <p className="text-[11px] text-slate-400 mt-1">Instant close-range blast wave that obliterates any infantry in path.</p>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-blue-400 block">[L] Laser Beam</span>
                <p className="text-[11px] text-slate-400 mt-1">Continuous high-energy laser that pierces clean through whole ranks.</p>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-red-500 block">Grenades &amp; Bombs</span>
                <p className="text-[11px] text-slate-400 mt-1">Arcing fragmentation grenades for fortified bunkers and tanks.</p>
              </div>
            </div>
          </div>

          {/* IRON TANK & POWS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-blue-500/30">
              <span className="font-heading font-bold text-blue-300 text-sm flex items-center gap-1.5 mb-1.5">
                <Shield className="w-4 h-4" />
                PILOTABLE "IRON SLUG" TANK
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Approach an unmanned tank and press <strong>[E]</strong> to board. The tank features 100 Armor, twin 360° Vulcan Cannons, hydraulic jump boosts, and fires <strong>120mm Heavy Shells</strong> with the bomb key. If destroyed, the driver automatically ejects unharmed!
              </p>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-yellow-500/30">
              <span className="font-heading font-bold text-yellow-300 text-sm flex items-center gap-1.5 mb-1.5">
                <Heart className="w-4 h-4 text-red-400" />
                RESCUE PRISONERS OF WAR (POW)
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Rescue tied-up hostages by walking up or shooting their bonds. Rescued soldiers salute with "THANK YOU!" and drop special weapons, bomb crates, roast chickens, or medals for huge score bonuses.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
