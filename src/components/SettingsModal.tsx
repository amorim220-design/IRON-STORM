/**
 * Project Iron Storm - Settings & Performance Modal
 */

import React, { useState } from 'react';
import { audio } from '../game/audio';
import { Volume2, VolumeX, Sparkles, Sliders, Tv, Monitor } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  enableScanlines: boolean;
  setEnableScanlines: (val: boolean) => void;
  enableGodRays: boolean;
  setEnableGodRays: (val: boolean) => void;
  enableDynamicLighting: boolean;
  setEnableDynamicLighting: (val: boolean) => void;
  enableScreenShake: boolean;
  setEnableScreenShake: (val: boolean) => void;
  showTouchControls: boolean;
  setShowTouchControls: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  enableScanlines,
  setEnableScanlines,
  enableGodRays,
  setEnableGodRays,
  enableDynamicLighting,
  setEnableDynamicLighting,
  enableScreenShake,
  setEnableScreenShake,
  showTouchControls,
  setShowTouchControls,
}) => {
  const [sfxVol, setSfxVol] = useState<number>(80);
  const [musicVol, setMusicVol] = useState<number>(45);
  const [isMuted, setIsMuted] = useState<boolean>(audio.getMuted());

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.setMuted(nextMuted);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    audio.setSfxVolume(val / 100);
    audio.playPistol();
  };

  const handleMusicChange = (val: number) => {
    setMusicVol(val);
    audio.setMusicVolume(val / 100);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-heading font-bold text-white tracking-wider">
              SETTINGS &amp; PERFORMANCE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded-md transition-colors"
          >
            Done
          </button>
        </div>

        {/* SETTINGS GROUPS */}
        <div className="mt-5 space-y-5">
          
          {/* AUDIO CONTROLS */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Audio Engine
            </span>

            {/* Mute Toggle */}
            <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span>Master Sound</span>
              </div>
              <button
                onClick={handleMuteToggle}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  isMuted ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isMuted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>

            {/* SFX Volume */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-2">
                <span>Sound Effects (SFX)</span>
                <span className="font-mono-data text-amber-400">{sfxVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVol}
                onChange={(e) => handleSfxChange(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-2">
                <span>Arcade BGM Music</span>
                <span className="font-mono-data text-sky-400">{musicVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVol}
                onChange={(e) => handleMusicChange(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* VISUALS & PERFORMANCE */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ori-Style Atmospheric Visuals
            </span>

            {/* Dynamic Lighting */}
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Dynamic Atmospheric Lighting</span>
              <button
                onClick={() => setEnableDynamicLighting(!enableDynamicLighting)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold ${enableDynamicLighting ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {enableDynamicLighting ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Volumetric God Rays */}
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Volumetric God Rays (Sun Shafts)</span>
              <button
                onClick={() => setEnableGodRays(!enableGodRays)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold ${enableGodRays ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {enableGodRays ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Screen Shake */}
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Visceral Screen Shake</span>
              <button
                onClick={() => setEnableScreenShake(!enableScreenShake)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold ${enableScreenShake ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {enableScreenShake ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Retro CRT Scanlines */}
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Arcade CRT Scanlines Effect</span>
              <button
                onClick={() => setEnableScanlines(!enableScanlines)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold ${enableScanlines ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {enableScanlines ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Touch Controls Toggle */}
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>On-Screen Touch Controls (Mobile)</span>
              <button
                onClick={() => setShowTouchControls(!showTouchControls)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold ${showTouchControls ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {showTouchControls ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
