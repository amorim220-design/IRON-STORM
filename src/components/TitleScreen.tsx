/**
 * Project Iron Storm - Title Screen & Main Menu
 * Features key artwork, game mode selection, co-op setup, and stage selector
 */

import React, { useState } from 'react';
import { GameEngine, STAGE_THEMES } from '../game/engine';
import { Play, Users, Map, BookOpen, Cpu, Sliders, Trophy, Crosshair, Shield } from 'lucide-react';

interface TitleScreenProps {
  engine: GameEngine;
  onStartGame: (isCoop: boolean, stageIdx?: number) => void;
  onOpenHowToPlay: () => void;
  onOpenGodotBlueprint: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  engine,
  onStartGame,
  onOpenHowToPlay,
  onOpenGodotBlueprint,
  onOpenSettings,
}) => {
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<number>(0);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none">
      
      {/* BACKGROUND KEY ARTWORK WITH CINEMATIC LIGHTING SCRIM */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/aistudio/1793667017786_ce16b7fe.jpg"
          alt="Project Iron Storm - Key Art"
          className="w-full h-full object-cover object-center scale-105 filter brightness-90 contrast-110"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
      </div>

      {/* TOP BAR CONTRACT: BRAND WORDMARK, UNBOXED STATS, TOP ACTION */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Crosshair className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-lg text-white tracking-wider whitespace-nowrap">
            PROJECT IRON STORM
          </span>
        </div>

        {/* Clean unboxed metadata */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
          <span>Arcade Run &amp; Gun</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>HD 2D Parallax</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-amber-400 font-mono-data font-bold">
            <Trophy className="w-3.5 h-3.5" />
            HI-SCORE: {engine.highScore.toString().padStart(6, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGodotBlueprint}
            className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-blue-400 shadow-md transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            Godot 4 Architecture
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CENTER HERO: TITLE & ACTION BUTTONS */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-3xl text-center my-auto">
        
        {/* BADGE-FREE PURE TITLE */}
        <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-400 to-amber-700 drop-shadow-2xl">
          PROJECT IRON STORM
        </h1>
        
        <p className="mt-2 text-sm md:text-base font-arcade text-amber-200 tracking-widest uppercase drop-shadow">
          ORIGINAL 2D ARCADE RUN &amp; GUN PLATFORMER
        </p>

        <p className="mt-3 text-xs md:text-sm text-slate-300 max-w-xl text-balance leading-relaxed">
          Inspired by classic arcade run-and-gun titles with modern 2D lighting, pilotable combat tanks, rescues, and local 2-player cooperative warfare.
        </p>

        {/* PRIMARY ACTION BUTTONS */}
        {!showStageSelect ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
            
            {/* Single Player */}
            <button
              onClick={() => onStartGame(false)}
              className="w-full sm:w-auto flex-1 min-w-[200px] py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-base rounded-xl shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              SINGLE PLAYER (1P)
            </button>

            {/* 2-Player Co-Op */}
            <button
              onClick={() => onStartGame(true)}
              className="w-full sm:w-auto flex-1 min-w-[200px] py-3.5 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-heading font-bold text-base rounded-xl shadow-xl hover:shadow-sky-500/20 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Users className="w-5 h-5" />
              2-PLAYER CO-OP (1P + 2P)
            </button>

            {/* Secondary Buttons Row */}
            <div className="flex items-center gap-2.5 w-full justify-center mt-1">
              <button
                onClick={() => setShowStageSelect(true)}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Map className="w-3.5 h-3.5 text-amber-400" />
                Select Biome
              </button>
              <button
                onClick={onOpenHowToPlay}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Controls &amp; Weapons
              </button>
            </div>
          </div>
        ) : (
          /* STAGE SELECTOR SUB-VIEW */
          <div className="mt-6 w-full max-w-xl bg-slate-950/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-heading font-bold text-white text-sm">SELECT MISSION BIOME</span>
              <button
                onClick={() => setShowStageSelect(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {STAGE_THEMES.map((theme, idx) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedStage(idx)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedStage === idx
                      ? 'bg-amber-600/20 border-amber-500/60 text-white'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-arcade font-bold text-xs text-amber-400 block">{theme.name}</span>
                  <span className="text-[11px] text-slate-300 block">{theme.location}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onStartGame(false, selectedStage)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs rounded-lg transition-colors"
              >
                DEPLOY 1P
              </button>
              <button
                onClick={() => onStartGame(true, selectedStage)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs rounded-lg transition-colors"
              >
                DEPLOY 2P CO-OP
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER: CLEAN COPYRIGHT & CHARACTER BRIEF */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
        <div>
          <span>PROJECT IRON STORM · Original Arcade Run &amp; Gun · Built for Web &amp; Godot 4</span>
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0 text-[11px]">
          <span>Keyboard &amp; Dual Gamepad Support</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Pilotable Iron Slug Tanks</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Ori Dynamic Lighting</span>
        </div>
      </footer>

    </div>
  );
};
