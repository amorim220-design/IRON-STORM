/**
 * Project Iron Storm - Main Applet Component
 * 2D Arcade Run & Gun Platformer (Canvas Game Engine + React UI Overlays)
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { GodotArchitectureModal } from './components/GodotArchitectureModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { StageClearModal } from './components/StageClearModal';
import { TitleScreen } from './components/TitleScreen';
import { TouchControls } from './components/TouchControls';
import { audio } from './game/audio';
import { gameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { GameState } from './game/types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Game UI States
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [showGodotModal, setShowGodotModal] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Settings
  const [enableScanlines, setEnableScanlines] = useState<boolean>(false);
  const [enableGodRays, setEnableGodRays] = useState<boolean>(true);
  const [enableDynamicLighting, setEnableDynamicLighting] = useState<boolean>(true);
  const [enableScreenShake, setEnableScreenShake] = useState<boolean>(true);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(false);

  // Score ticker
  const [, setScoreTick] = useState<number>(0);

  // Initialize Canvas & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new GameRenderer(canvas);
    rendererRef.current = renderer;

    // Detect touch device to show touch controls by default if touch is available
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      setShowTouchControls(true);
    }

    // Auto-resize canvas to match container with crisp 16:9 1280x720 baseline
    const handleResize = () => {
      renderer.resize(1280, 720);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Sync Engine Callbacks
    gameEngine.onStateChange = (newState) => {
      setGameState(newState);
    };

    gameEngine.onScoreChange = () => {
      setScoreTick((prev) => prev + 1);
    };

    // 60FPS Game Loop
    const loop = (currentTime: number) => {
      const dtMs = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Update engine
      gameEngine.update(dtMs);

      // Render frame
      renderer.enableScanlines = enableScanlines;
      renderer.enableGodRays = enableGodRays;
      renderer.enableDynamicLighting = enableDynamicLighting;
      renderer.enableScreenShake = enableScreenShake;

      renderer.render(gameEngine);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update renderer settings when toggled
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.enableScanlines = enableScanlines;
      rendererRef.current.enableGodRays = enableGodRays;
      rendererRef.current.enableDynamicLighting = enableDynamicLighting;
      rendererRef.current.enableScreenShake = enableScreenShake;
    }
  }, [enableScanlines, enableGodRays, enableDynamicLighting, enableScreenShake]);

  // Handlers
  const handleStartGame = (isCoop: boolean, stageIdx?: number) => {
    if (stageIdx !== undefined) {
      gameEngine.currentStageIndex = stageIdx;
    }
    gameEngine.startNewGame(isCoop, 'REX', 'MAYA');
    setGameState('PLAYING');
  };

  const handlePause = () => {
    gameEngine.state = 'PAUSED';
    setGameState('PAUSED');
  };

  const handleResume = () => {
    gameEngine.state = 'PLAYING';
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    gameEngine.restartStage();
    setGameState('PLAYING');
  };

  const handleHome = () => {
    audio.stopMusic();
    gameEngine.state = 'TITLE_MENU';
    setGameState('TITLE_MENU');
  };

  const handleNextStage = () => {
    gameEngine.nextStage();
    setGameState('PLAYING');
  };

  return (
    <div className="relative w-screen h-screen bg-[#080d14] overflow-hidden flex items-center justify-center">
      
      {/* 2D CANVAS CONTAINER (Responsive 16:9 fit) */}
      <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] flex items-center justify-center shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain block bg-black"
        />

        {/* Scanlines & CRT Vignette Overlay if enabled */}
        {enableScanlines && (
          <div className="absolute inset-0 crt-overlay vignette-overlay pointer-events-none" />
        )}

        {/* --- ACTIVE PLAYING HUD --- */}
        {gameState === 'PLAYING' && (
          <GameHUD engine={gameEngine} onPause={handlePause} />
        )}

        {/* --- TOUCH CONTROLS (Mobile / Tablets) --- */}
        {showTouchControls && gameState === 'PLAYING' && (
          <TouchControls />
        )}

        {/* --- TITLE SCREEN & MAIN MENU --- */}
        {gameState === 'TITLE_MENU' && (
          <TitleScreen
            engine={gameEngine}
            onStartGame={handleStartGame}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenGodotBlueprint={() => setShowGodotModal(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* --- PAUSE MODAL --- */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={handleResume}
            onRestart={handleRestart}
            onHome={handleHome}
            onOpenSettings={() => setShowSettings(true)}
            onOpenControls={() => setShowHowToPlay(true)}
          />
        )}

        {/* --- STAGE CLEAR MODAL --- */}
        {gameState === 'STAGE_CLEAR' && (
          <StageClearModal
            engine={gameEngine}
            onNextStage={handleNextStage}
            onHome={handleHome}
          />
        )}

        {/* --- GAME OVER MODAL --- */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            engine={gameEngine}
            onRetry={handleRestart}
            onHome={handleHome}
          />
        )}

        {/* --- GODOT 4 ARCHITECTURE MODAL --- */}
        {showGodotModal && (
          <GodotArchitectureModal onClose={() => setShowGodotModal(false)} />
        )}

        {/* --- HOW TO PLAY & CONTROLS MODAL --- */}
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}

        {/* --- SETTINGS MODAL --- */}
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            enableScanlines={enableScanlines}
            setEnableScanlines={setEnableScanlines}
            enableGodRays={enableGodRays}
            setEnableGodRays={setEnableGodRays}
            enableDynamicLighting={enableDynamicLighting}
            setEnableDynamicLighting={setEnableDynamicLighting}
            enableScreenShake={enableScreenShake}
            setEnableScreenShake={setEnableScreenShake}
            showTouchControls={showTouchControls}
            setShowTouchControls={setShowTouchControls}
          />
        )}
      </div>

    </div>
  );
}
