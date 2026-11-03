/**
 * Project Iron Storm - HD 2D Visual Rendering Engine
 * Ori-inspired atmospheric lighting, god rays, parallax layers, hand-drawn character rendering & boss graphics
 */

import { GameEngine } from './engine';
import { Enemy, Particle, PickupItem, Player, Projectile, Vehicle } from './types';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;
  
  // Settings
  public enableScanlines: boolean = false;
  public enableGodRays: boolean = true;
  public enableDynamicLighting: boolean = true;
  public enableScreenShake: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Secondary offscreen canvas for dynamic light masks
    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d')!;
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.lightCanvas.width = width;
    this.lightCanvas.height = height;
  }

  // Main Render Frame
  public render(engine: GameEngine) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const camX = engine.cameraX;

    // Apply Screen Shake
    ctx.save();
    if (this.enableScreenShake && engine.shakeMagnitude > 0) {
      const shakeX = (Math.random() - 0.5) * engine.shakeMagnitude;
      const shakeY = (Math.random() - 0.5) * engine.shakeMagnitude;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Render Sky & Distant Parallax
    this.renderParallaxBackground(ctx, engine, w, h, camX);

    // 2. Render Platforms & Terrain
    ctx.save();
    ctx.translate(-camX, 0);

    this.renderCaveBossBackground(ctx, engine);
    this.renderPlatformsAndTerrain(ctx, engine);
    this.renderDestructibles(ctx, engine);
    this.renderPOWs(ctx, engine);
    this.renderVehicles(ctx, engine);
    this.renderEnemies(ctx, engine);
    this.renderPlayers(ctx, engine);
    this.renderPickups(ctx, engine);
    this.renderProjectiles(ctx, engine);
    this.renderParticles(ctx, engine);

    ctx.restore();

    // 3. Dynamic Lighting & Ori-Style Atmosphere Pass
    if (this.enableDynamicLighting) {
      this.renderLightingPass(ctx, engine, w, h, camX);
    }

    // 4. Volumetric God Rays
    if (this.enableGodRays) {
      this.renderGodRays(ctx, engine, w, h);
    }

    // 5. Foreground Parallax Foliage
    this.renderForegroundParallax(ctx, engine, w, h, camX);

    // 6. Optional Scanlines & Vignette
    if (this.enableScanlines) {
      this.renderCRTScanlines(ctx, w, h);
    }

    ctx.restore();
  }

  // --- PARALLAX BACKGROUND LAYERS ---
  private renderParallaxBackground(ctx: CanvasRenderingContext2D, engine: GameEngine, w: number, h: number, camX: number) {
    const theme = engine.currentTheme;

    // Layer 0: Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, theme.skyTop);
    skyGrad.addColorStop(0.65, theme.skyBottom);
    skyGrad.addColorStop(1, '#60a5fa');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun / Celestial Orb
    const sunX = w * 0.75 - camX * 0.02;
    const sunY = 120;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
    sunGlow.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
    sunGlow.addColorStop(0.3, 'rgba(254, 240, 138, 0.45)');
    sunGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
    ctx.fill();

    // Layer 1: Distant Misty Mountains (0.1x Parallax)
    const p1Offset = (camX * 0.08) % 800;
    ctx.fillStyle = 'rgba(20, 83, 45, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -800; x < w + 800; x += 180) {
      const peakX = x - p1Offset;
      const peakY = 320 + Math.sin(x * 0.01) * 80;
      ctx.lineTo(peakX, peakY);
      ctx.lineTo(peakX + 90, peakY + 60);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Layer 2: Midground Canopy & Waterfalls (0.3x Parallax)
    const p2Offset = (camX * 0.25) % 600;
    ctx.fillStyle = 'rgba(22, 101, 52, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -600; x < w + 600; x += 140) {
      const palmX = x - p2Offset;
      const palmY = 440 + Math.cos(x * 0.015) * 60;
      ctx.lineTo(palmX, palmY);
      ctx.lineTo(palmX + 70, palmY + 40);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Floating Atmospheric Spores / Fireflies (Ori style)
    const time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
    for (let i = 0; i < 24; i++) {
      const sporeX = ((i * 65 + time * 25) % (w + 100)) - 50;
      const sporeY = 200 + Math.sin(time + i * 2) * 120 + (i * 20) % 350;
      const sporeSize = 1.5 + Math.sin(i) * 1;
      ctx.beginPath();
      ctx.arc(sporeX, sporeY, sporeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- CAVE BOSS ARENA BACKGROUND (Matches uploaded art!) ---
  private renderCaveBossBackground(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    const bossX = 4680;
    const bossY = 400;

    // Draw the massive ominous mountain cave mouth
    ctx.save();
    
    // Mountain cliffside framing
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(bossX - 350, 0);
    ctx.lineTo(bossX + 500, 0);
    ctx.lineTo(bossX + 500, 720);
    ctx.lineTo(bossX - 250, 720);
    ctx.bezierCurveTo(bossX - 320, 550, bossX - 350, 300, bossX - 350, 0);
    ctx.fill();

    // Dark cavern interior void
    const caveVoid = ctx.createRadialGradient(bossX, bossY, 40, bossX, bossY, 320);
    caveVoid.addColorStop(0, '#020617');
    caveVoid.addColorStop(0.7, '#0f172a');
    caveVoid.addColorStop(1, '#292524');
    ctx.fillStyle = caveVoid;
    ctx.beginPath();
    ctx.ellipse(bossX, bossY + 20, 260, 220, 0, 0, Math.PI * 2);
    ctx.fill();

    // Overhanging jungle vines & foliage on the cave rim
    ctx.fillStyle = '#14532d';
    for (let i = -6; i <= 6; i++) {
      const vx = bossX + i * 40;
      const vy = bossY - 180 + Math.sin(i * 1.5) * 30;
      ctx.beginPath();
      ctx.ellipse(vx, vy, 28, 45, (i * 0.2), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- PLATFORMS & TERRAIN ---
  private renderPlatformsAndTerrain(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    const theme = engine.currentTheme;

    for (const plat of engine.platforms) {
      if (plat.isOneWay) {
        // Wooden Military Suspension Bridge / Tower Balcony
        ctx.save();
        ctx.fillStyle = '#78350f'; // Dark wood
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Wood planks texture
        ctx.fillStyle = '#92400e';
        for (let px = plat.x; px < plat.x + plat.width; px += 24) {
          ctx.fillRect(px + 2, plat.y + 2, 20, plat.height - 4);
        }

        // Rope railings
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y - 14);
        ctx.lineTo(plat.x + plat.width, plat.y - 14);
        ctx.stroke();

        // Support posts
        ctx.fillStyle = '#451a03';
        ctx.fillRect(plat.x - 4, plat.y - 20, 8, plat.height + 20);
        ctx.fillRect(plat.x + plat.width - 4, plat.y - 20, 8, plat.height + 20);

        ctx.restore();
      } else {
        // Solid Lush Ground Floor
        ctx.save();

        // Soil / Earth Body
        const earthGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        earthGrad.addColorStop(0, theme.groundColor);
        earthGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = earthGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Lush grass and moss rim
        ctx.fillStyle = theme.grassColor;
        ctx.fillRect(plat.x, plat.y, plat.width, 16);

        // Detailed Grass tufts
        ctx.fillStyle = '#22c55e';
        for (let gx = plat.x; gx < plat.x + plat.width; gx += 18) {
          ctx.beginPath();
          ctx.moveTo(gx, plat.y);
          ctx.lineTo(gx + 6, plat.y - 8);
          ctx.lineTo(gx + 12, plat.y);
          ctx.fill();
        }

        // Stone blocks & roots in soil
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        for (let rx = plat.x + 30; rx < plat.x + plat.width; rx += 140) {
          ctx.beginPath();
          ctx.arc(rx, plat.y + 50, 18, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }
  }

  // --- DESTRUCTIBLES (Crates, Barricades, Barrels) ---
  private renderDestructibles(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    for (const obj of engine.destructibles) {
      if (obj.destroyed) continue;

      ctx.save();
      ctx.translate(obj.x, obj.y);

      if (obj.type === 'CRATE') {
        // Military Wooden Ammo Crate
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 3;
        ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        
        // Stenciled cross
        ctx.beginPath();
        ctx.moveTo(-obj.width / 2, -obj.height / 2);
        ctx.lineTo(obj.width / 2, obj.height / 2);
        ctx.moveTo(obj.width / 2, -obj.height / 2);
        ctx.lineTo(-obj.width / 2, obj.height / 2);
        ctx.stroke();

        // Stencil text "SUPPLY"
        ctx.fillStyle = '#fef08a';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SUPPLY', 0, 3);
      } else if (obj.type === 'EXPLOSIVE_BARREL') {
        // Red Explosive Fuel Drum
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height, 4);
        ctx.fill();

        // Metal ribs
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-obj.width / 2, -obj.height / 4);
        ctx.lineTo(obj.width / 2, -obj.height / 4);
        ctx.moveTo(-obj.width / 2, obj.height / 4);
        ctx.lineTo(obj.width / 2, obj.height / 4);
        ctx.stroke();

        // Hazard symbol (Yellow flame or skull)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, 3);
      } else if (obj.type === 'BARRICADE') {
        // Sandbags & Wooden Fortification
        ctx.fillStyle = '#ca8a04';
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.roundRect(-obj.width / 2 + 6, i * 16 - 8, obj.width - 12, 14, 6);
          ctx.fill();
        }
        // Wooden spiked palisade
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(-obj.width / 2, obj.height / 2);
        ctx.lineTo(-obj.width / 4, -obj.height / 2);
        ctx.lineTo(0, obj.height / 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- RESCUABLE POWs (Classic Hostages) ---
  private renderPOWs(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    for (const pow of engine.pows) {
      ctx.save();
      ctx.translate(pow.x, pow.y - 25);
      ctx.scale(pow.facing, 1);

      if (!pow.rescued) {
        // Tied to wooden stake
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-6, -20, 12, 45); // Stake

        // POW: Long blonde beard, yellow boxer shorts
        // Body
        ctx.fillStyle = '#fed7aa'; // Skin
        ctx.fillRect(-10, -10, 20, 24);
        // Yellow boxers
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-10, 10, 20, 14);

        // Head & massive classic blonde beard
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -18, 10, 0, Math.PI * 2);
        ctx.fill();
        // Beard
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(-8, -14);
        ctx.lineTo(8, -14);
        ctx.lineTo(12, 4);
        ctx.lineTo(-12, 4);
        ctx.closePath();
        ctx.fill();

        // Ropes binding
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-12, -2);
        ctx.lineTo(12, -2);
        ctx.moveTo(-12, 6);
        ctx.lineTo(12, 6);
        ctx.stroke();
      } else {
        // Rescued: Saluting with hand to forehead or walking happily!
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(-10, -8, 20, 22);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-10, 10, 20, 14);

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -18, 10, 0, Math.PI * 2);
        ctx.fill();

        // Beard
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(-8, -14);
        ctx.lineTo(8, -14);
        ctx.lineTo(10, 2);
        ctx.lineTo(-10, 2);
        ctx.fill();

        // Raised arm salute
        ctx.strokeStyle = '#fed7aa';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(8, -6);
        ctx.lineTo(14, -20);
        ctx.lineTo(8, -24);
        ctx.stroke();

        // "THANK YOU!" Speech balloon if just rescued
        if (pow.saluteTimer > 0) {
          ctx.scale(pow.facing, 1); // unflip text
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(-45, -55, 90, 22, 6);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('THANK YOU!', 0, -40);
        }
      }

      ctx.restore();
    }
  }

  // --- VEHICLES: "IRON SLUG" TANK ---
  private renderVehicles(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    for (const v of engine.vehicles) {
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.scale(v.facing, 1);

      // 1. Heavy Treads & Wheels
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-44, 12, 88, 22, 6);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Rotating Tread Road Wheels
      const treadRoll = (v.x * 0.2) % (Math.PI * 2);
      ctx.fillStyle = '#64748b';
      for (let wx = -32; wx <= 32; wx += 16) {
        ctx.beginPath();
        ctx.arc(wx, 23, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wx, 23);
        ctx.lineTo(wx + Math.cos(treadRoll) * 6, 23 + Math.sin(treadRoll) * 6);
        ctx.stroke();
      }

      // 2. Armored Hull
      ctx.fillStyle = '#3b82f6'; // Iconic blue-grey slug plating
      ctx.beginPath();
      ctx.roundRect(-40, -14, 80, 28, 6);
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Armor rivets
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.arc(-30, -8, 2, 0, Math.PI * 2);
      ctx.arc(30, -8, 2, 0, Math.PI * 2);
      ctx.arc(0, -8, 2, 0, Math.PI * 2);
      ctx.fill();

      // 3. Rotating Turret Dome
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.ellipse(-4, -22, 24, 16, 0, Math.PI, 0);
      ctx.fill();

      // 4. Heavy 120mm Cannon Barrel
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(16, -26, 32, 9);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(44, -28, 6, 13); // Muzzle brake

      // 5. Twin 360-degree Vulcan Cannons
      ctx.save();
      ctx.translate(-6, -24);
      ctx.rotate(v.facing === 1 ? v.vulcanAngle : -v.vulcanAngle);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, -4, 26, 8);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, -5, 8, 10);
      ctx.restore();

      // 6. Driver in Hatch
      if (v.isOccupied) {
        ctx.fillStyle = '#dc2626'; // Driver red headband
        ctx.beginPath();
        ctx.arc(-4, -32, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // "IN" Indicator
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS E TO MOUNT', 0, -42);
      }

      // 7. Tank Armor HP Bar
      if (v.hp < v.maxHp) {
        const hpPct = Math.max(0, v.hp / v.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-30, -55, 60, 6);
        ctx.fillStyle = hpPct > 0.4 ? '#22c55e' : '#ef4444';
        ctx.fillRect(-29, -54, 58 * hpPct, 4);
      }

      ctx.restore();
    }
  }

  // --- ENEMIES (Troopers, Purple Biomechs, Shield Guards, Drones, Walkers, Goliath Boss) ---
  private renderEnemies(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    for (const e of engine.enemies) {
      if (e.hp <= 0 && e.type !== 'boss_goliath') {
        // Defeated Enemy Ragdoll Fade
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.globalAlpha = Math.max(0, 1 - e.animTimer / 1200);
        ctx.fillStyle = '#475569';
        ctx.fillRect(-15, 10, 30, 14);
        ctx.restore();
        continue;
      }

      ctx.save();
      ctx.translate(e.x, e.y);

      // BOSS: GOLIATH-X1 (Cave Colossus)
      if (e.type === 'boss_goliath') {
        this.renderBossGoliath(ctx, e);
        ctx.restore();
        continue;
      }

      // Standard / Special Enemies
      ctx.scale(e.facing, 1);

      if (e.type === 'trooper') {
        // Regular Green Military Trooper
        const runCycle = Math.sin(e.animTimer) * 8;

        // Legs
        ctx.fillStyle = '#3f6212';
        ctx.fillRect(-8, 12 + runCycle * 0.3, 7, 18);
        ctx.fillRect(2, 12 - runCycle * 0.3, 7, 18);

        // Torso & Tactical Vest
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(-12, -8, 24, 22);

        // Head & Helmet
        ctx.fillStyle = '#fed7aa'; // Face
        ctx.beginPath();
        ctx.arc(0, -18, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#14532d'; // Steel Helmet
        ctx.beginPath();
        ctx.arc(0, -21, 10, Math.PI, 0);
        ctx.fill();

        // Combat Rifle
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, -4, 24, 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(8, 2, 5, 8); // Magazine
      } else if (e.type === 'purple_trooper') {
        // Purple Biomechanical Trooper (Matching user artwork!)
        const runCycle = Math.sin(e.animTimer) * 9;

        // Cybernetic Legs
        ctx.fillStyle = '#581c87';
        ctx.fillRect(-8, 12 + runCycle * 0.3, 7, 18);
        ctx.fillRect(2, 12 - runCycle * 0.3, 7, 18);

        // Purple Armor Suit
        ctx.fillStyle = '#7e22ce';
        ctx.fillRect(-12, -8, 24, 22);
        // Chest Glowing Core
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(0, 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // High-Tech Cyber Helmet with Glowing Cyan Visor
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(0, -18, 10, 0, Math.PI * 2);
        ctx.fill();
        // Cyan Glowing Visor Bar
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(2, -20, 8, 4);

        // Plasma Carbine
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(4, -4, 26, 7);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(14, -2, 10, 3);
      } else if (e.type === 'shield_guard') {
        // Riot Shield Infantry
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -6, 20, 34);

        // Heavy Riot Shield
        ctx.fillStyle = '#475569';
        ctx.fillRect(10, -25, 12, 55);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, -25, 12, 55);
        // Shield Glass Visor
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.fillRect(12, -18, 8, 8);
      } else if (e.type === 'mortar') {
        // Mortar Soldier
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-10, -5, 20, 30);
        // Mortar Tube
        ctx.fillStyle = '#1e293b';
        ctx.save();
        ctx.rotate(-Math.PI / 3);
        ctx.fillRect(5, -10, 35, 10);
        ctx.restore();
      } else if (e.type === 'drone') {
        // Aerial Attack Drone
        const hoverY = Math.sin(e.animTimer) * 5;
        ctx.translate(0, hoverY);

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Drone Eye
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(6, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Dual spinning rotors
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-22, -10);
        ctx.lineTo(22, -10);
        ctx.stroke();
      } else if (e.type === 'mech_walker') {
        // Armored Walking War Mech
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(-35, -35, 70, 50, 8);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Heavy Gatling Gun Arm
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, -10, 30, 12);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(36, -8, 8, 8);

        // Mech Stomping Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-24, 15, 14, 25);
        ctx.fillRect(10, 15, 14, 25);
      }

      ctx.restore();
    }
  }

  // --- STAGE 1 BOSS: GOLIATH-X1 (Iron Skull Cave Colossus) ---
  // Faithfully drawn to match the user's uploaded art!
  private renderBossGoliath(ctx: CanvasRenderingContext2D, boss: Enemy) {
    const breathing = Math.sin(boss.animTimer * 0.8) * 6;
    ctx.translate(0, breathing);

    // 1. Colossal Crimson Skull Armor Head
    const skullGrad = ctx.createLinearGradient(0, -120, 0, 100);
    skullGrad.addColorStop(0, '#7f1d1d');
    skullGrad.addColorStop(0.5, '#991b1b');
    skullGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = skullGrad;

    // Skull Cranium
    ctx.beginPath();
    ctx.moveTo(-90, -90);
    ctx.bezierCurveTo(-110, -140, 110, -140, 90, -90);
    ctx.bezierCurveTo(115, 0, 80, 50, 60, 80);
    ctx.lineTo(-60, 80);
    ctx.bezierCurveTo(-80, 50, -115, 0, -90, -90);
    ctx.closePath();
    ctx.fill();

    // Metallic panel lines & skull brow plates
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-60, -90);
    ctx.lineTo(60, -90);
    ctx.moveTo(0, -110);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // 2. Terrifying Glowing Skull Eye Sockets (Deep Yellow/Orange Glow)
    const eyeGlowRadius = boss.bossPhase === 3 ? 35 : 25;
    const eyeColor = boss.bossPhase === 3 ? '#ef4444' : '#fbbf24';

    // Left Eye
    const leftEyeGrad = ctx.createRadialGradient(-40, -40, 4, -40, -40, eyeGlowRadius);
    leftEyeGrad.addColorStop(0, '#ffffff');
    leftEyeGrad.addColorStop(0.3, eyeColor);
    leftEyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = leftEyeGrad;
    ctx.beginPath();
    ctx.ellipse(-40, -40, 22, 16, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    const rightEyeGrad = ctx.createRadialGradient(40, -40, 4, 40, -40, eyeGlowRadius);
    rightEyeGrad.addColorStop(0, '#ffffff');
    rightEyeGrad.addColorStop(0.3, eyeColor);
    rightEyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = rightEyeGrad;
    ctx.beginPath();
    ctx.ellipse(40, -40, 22, 16, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 3. Nasal Cavity
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-12, 12);
    ctx.lineTo(12, 12);
    ctx.closePath();
    ctx.fill();

    // 4. Skull Teeth / Jaw Plate
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.roundRect(-50, 35, 100, 36, 6);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Individual Mechanical Teeth
    ctx.fillStyle = '#f5f5f5';
    for (let tx = -40; tx <= 30; tx += 12) {
      ctx.fillRect(tx, 38, 8, 12); // Upper
      ctx.fillRect(tx + 2, 53, 8, 14); // Lower
    }

    // 5. Heavy Shoulder Missile Launchers
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-125, -70, 32, 60);
    ctx.fillRect(93, -70, 32, 60);

    // Missile Tubes
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-109, -50, 8, 0, Math.PI * 2);
    ctx.arc(-109, -25, 8, 0, Math.PI * 2);
    ctx.arc(109, -50, 8, 0, Math.PI * 2);
    ctx.arc(109, -25, 8, 0, Math.PI * 2);
    ctx.fill();

    // 6. Boss Health Bar (Top Center)
    const hpPct = Math.max(0, boss.hp / boss.maxHp);
    ctx.save();
    ctx.translate(-boss.x + 4680, -boss.y + 120); // Pin above boss in world coordinates
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(-150, 0, 300, 16);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(-150, 0, 300, 16);

    const barGrad = ctx.createLinearGradient(-150, 0, 150, 0);
    barGrad.addColorStop(0, '#f97316');
    barGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = barGrad;
    ctx.fillRect(-148, 2, 296 * hpPct, 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOLIATH-X1: CAVE COLOSSUS', 0, -6);
    ctx.restore();
  }

  // --- PLAYERS RENDERING (Rex Vance & Maya Cole) ---
  private renderPlayers(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    for (const player of engine.players) {
      if (!player.isActive || player.inVehicle) continue;

      ctx.save();
      ctx.translate(player.x, player.y);

      // Invulnerability Blink
      if (player.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Parachute Mode
      if (player.state === 'parachuting') {
        // Draw Parachute
        ctx.fillStyle = player.id === 1 ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(0, -60, 35, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-35, -60);
        ctx.lineTo(0, -20);
        ctx.moveTo(35, -60);
        ctx.lineTo(0, -20);
        ctx.stroke();
      }

      ctx.scale(player.facing, 1);

      const isRex = player.character === 'REX';
      const animT = player.animTimer;
      const isCrouching = player.state === 'crouch';

      // 1. Legs & Boots
      const legOffset = player.state === 'run' ? Math.sin(animT) * 12 : 0;
      ctx.fillStyle = isRex ? '#365314' : '#1e3a8a'; // Camo pants
      if (isCrouching) {
        ctx.fillRect(-14, 16, 26, 14);
      } else {
        ctx.fillRect(-12, 12 + legOffset * 0.4, 9, 20);
        ctx.fillRect(3, 12 - legOffset * 0.4, 9, 20);
      }

      // Heavy Combat Boots
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-13, 26 + (isCrouching ? 0 : legOffset * 0.4), 12, 8);
      ctx.fillRect(2, 26 + (isCrouching ? 0 : -legOffset * 0.4), 12, 8);

      // 2. Torso & Tactical Vest
      const torsoY = isCrouching ? 4 : -8;
      ctx.fillStyle = '#fed7aa'; // Muscular arms/neck
      ctx.fillRect(-10, torsoY, 20, 22);

      // Combat Vest
      ctx.fillStyle = isRex ? '#15803d' : '#475569'; // Green vest for Rex, Grey for Maya
      ctx.fillRect(-12, torsoY, 24, 20);
      // Ammo Pouches
      ctx.fillStyle = '#a16207';
      ctx.fillRect(-8, torsoY + 12, 6, 7);
      ctx.fillRect(2, torsoY + 12, 6, 7);

      // 3. Head & Face (Caricature Expressive Facial Details)
      const headY = isCrouching ? -6 : -22;
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, headY, 11, 0, Math.PI * 2);
      ctx.fill();

      // Determined Grin & Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, headY - 3, 4, 3);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(5, headY - 3, 2, 2); // Pupil
      // Grin
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(3, headY + 3, 4, 0, Math.PI);
      ctx.stroke();

      // Hair & Headband / Beret
      if (isRex) {
        // Red Bandana & Spiky Hair (Matches user artwork!)
        ctx.fillStyle = '#451a03'; // Brown Hair
        ctx.beginPath();
        ctx.arc(-2, headY - 6, 10, Math.PI * 0.8, Math.PI * 2);
        ctx.fill();

        // Red Bandana wrapping forehead
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-11, headY - 7, 22, 6);

        // Fluttering Bandana Tails behind head
        const flutter = Math.sin(Date.now() * 0.012) * 5;
        ctx.beginPath();
        ctx.moveTo(-11, headY - 5);
        ctx.lineTo(-26, headY - 9 + flutter);
        ctx.lineTo(-24, headY - 1 + flutter);
        ctx.closePath();
        ctx.fill();
      } else {
        // Maya's Blue Tactical Beret
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        ctx.ellipse(0, headY - 8, 14, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Weapon & Hands (Aimed in 8 directions)
      ctx.save();
      const gunY = isCrouching ? 2 : -10;
      ctx.translate(0, gunY);

      // Calculate aiming rotation angle relative to player's facing
      const aimAngle = Math.atan2(player.aimDir.y, Math.abs(player.aimDir.x));
      ctx.rotate(aimAngle);

      // Draw Heavy Combat Rifle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -5, 28, 8); // Receiver
      ctx.fillStyle = '#475569';
      ctx.fillRect(24, -3, 8, 4); // Barrel
      ctx.fillStyle = '#d97706';
      ctx.fillRect(8, 2, 6, 8); // Magazine

      ctx.restore();

      // Player Indicator (1P / 2P Arrow)
      ctx.scale(player.facing, 1); // Unflip text
      ctx.fillStyle = player.id === 1 ? '#fbbf24' : '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(player.id === 1 ? '1P' : '2P', 0, headY - 16);

      ctx.restore();
    }
  }

  // --- PICKUPS (Medals, Food, Weapons) ---
  private renderPickups(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    for (const item of engine.pickups) {
      ctx.save();
      const floatY = Math.sin(item.floatTimer) * 4;
      ctx.translate(item.x, item.y + floatY);

      if (item.type === 'TURKEY') {
        // Roast Turkey Dinner (+1000 pts)
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bone
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(10, -3, 8, 4);
      } else if (item.type === 'MEDAL') {
        // Golden Heroic Medal (+500 pts)
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'BOMB_BOX') {
        // Ammo Grenade Box
        ctx.fillStyle = '#334155';
        ctx.fillRect(-12, -10, 24, 20);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BOMB', 0, 3);
      } else {
        // Weapon Supply Box (H, S, R, F, L)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -14, 28, 28);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-14, -14, 28, 28);

        // Weapon Code Letter
        const code = item.type === 'HMG' ? 'H' : item.type === 'SHOTGUN' ? 'S' : item.type === 'FLAMETHROWER' ? 'F' : item.type === 'ROCKET' ? 'R' : 'L';
        const color = item.type === 'HMG' ? '#f59e0b' : item.type === 'SHOTGUN' ? '#84cc16' : item.type === 'FLAMETHROWER' ? '#ef4444' : item.type === 'ROCKET' ? '#06b6d4' : '#3b82f6';
        
        ctx.fillStyle = color;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(code, 0, 6);
      }

      ctx.restore();
    }
  }

  // --- PROJECTILES RENDERING ---
  private renderProjectiles(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    for (const p of engine.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'BOMB') {
        // Grenade
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        // Red fuse indicator
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-2, -p.radius - 3, 4, 4);
      } else if (p.type === 'CANNON_SHELL') {
        // 120mm Heavy Tank Shell
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fiery exhaust
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-14, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ROCKET' || p.type === 'ENEMY_MISSILE') {
        // Homing Rocket
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);
        ctx.fillStyle = p.isPlayer ? '#06b6d4' : '#ef4444';
        ctx.fillRect(-12, -4, 24, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(12, -4);
        ctx.lineTo(18, 0);
        ctx.lineTo(12, 4);
        ctx.fill();
      } else if (p.type === 'FLAMETHROWER') {
        // Expanding fiery particle puff
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'LASER' || p.type === 'BOSS_LASER') {
        // Glowing Piercing Energy Beam
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-20, -p.radius, 40, p.radius * 2);
        ctx.fillStyle = '#ffffff'; // White hot core
        ctx.fillRect(-16, -p.radius * 0.4, 32, p.radius * 0.8);
      } else {
        // Standard Pistol / HMG / Enemy Bullet
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- PARTICLES RENDERING ---
  private renderParticles(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    for (const p of engine.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;

      if (p.type === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'flame') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark' || p.type === 'glow') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'casing') {
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-3, -1.5, 6, 3);
      } else if (p.type === 'debris') {
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.type === 'blood') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- ORI-STYLE DYNAMIC LIGHTING PASS ---
  private renderLightingPass(ctx: CanvasRenderingContext2D, engine: GameEngine, w: number, h: number, camX: number) {
    const lCtx = this.lightCtx;
    lCtx.clearRect(0, 0, w, h);

    // Ambient Darkness Veil
    lCtx.fillStyle = 'rgba(8, 13, 20, 0.45)';
    lCtx.fillRect(0, 0, w, h);

    // Punch out radial light circles with 'destination-out'
    lCtx.globalCompositeOperation = 'destination-out';

    // 1. Players Light Halo
    for (const p of engine.players) {
      if (p.isActive) {
        const screenX = p.x - camX;
        const screenY = p.y;
        const grad = lCtx.createRadialGradient(screenX, screenY, 10, screenX, screenY, 140);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        lCtx.fillStyle = grad;
        lCtx.beginPath();
        lCtx.arc(screenX, screenY, 140, 0, Math.PI * 2);
        lCtx.fill();
      }
    }

    // 2. Boss Glowing Red Skull Eyes Light
    if (engine.boss && engine.boss.hp > 0) {
      const bossScreenX = engine.boss.x - camX;
      const bossScreenY = engine.boss.y - 40;
      const grad = lCtx.createRadialGradient(bossScreenX, bossScreenY, 20, bossScreenX, bossScreenY, 220);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      lCtx.fillStyle = grad;
      lCtx.beginPath();
      lCtx.arc(bossScreenX, bossScreenY, 220, 0, Math.PI * 2);
      lCtx.fill();
    }

    // 3. Fiery Explosions & Rockets
    for (const proj of engine.projectiles) {
      if (proj.type === 'BOMB' || proj.type === 'CANNON_SHELL' || proj.type === 'ROCKET' || proj.type === 'FLAMETHROWER') {
        const sx = proj.x - camX;
        const sy = proj.y;
        const grad = lCtx.createRadialGradient(sx, sy, 5, sx, sy, 80);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        lCtx.fillStyle = grad;
        lCtx.beginPath();
        lCtx.arc(sx, sy, 80, 0, Math.PI * 2);
        lCtx.fill();
      }
    }

    lCtx.globalCompositeOperation = 'source-over';

    // Composite light layer onto main canvas
    ctx.drawImage(this.lightCanvas, 0, 0);
  }

  // --- VOLUMETRIC GOD RAYS (Ori reference) ---
  private renderGodRays(ctx: CanvasRenderingContext2D, engine: GameEngine, w: number, h: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const theme = engine.currentTheme;

    // Angled sun shafts slicing through jungle canopy
    for (let i = 0; i < 4; i++) {
      const startX = w * 0.4 + i * 220;
      const rayGrad = ctx.createLinearGradient(startX, 0, startX - 250, h);
      rayGrad.addColorStop(0, theme.godRayColor);
      rayGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
      rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + 90, 0);
      ctx.lineTo(startX - 220, h);
      ctx.lineTo(startX - 310, h);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // --- FOREGROUND PARALLAX FOLIAGE ---
  private renderForegroundParallax(ctx: CanvasRenderingContext2D, engine: GameEngine, w: number, h: number, camX: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(6, 40, 20, 0.85)'; // Deep jungle foreground silhouette

    // Large foreground leaves and hanging jungle vines (1.4x Parallax)
    const fgOffset = (camX * 1.3) % 900;
    for (let x = -300; x < w + 300; x += 400) {
      const vineX = x - fgOffset;
      // Hanging vine
      ctx.beginPath();
      ctx.moveTo(vineX, 0);
      ctx.bezierCurveTo(vineX + 30, 80, vineX - 20, 140, vineX + 15, 220);
      ctx.bezierCurveTo(vineX + 25, 140, vineX + 45, 80, vineX + 15, 0);
      ctx.fill();

      // Lower jungle fern rim
      ctx.beginPath();
      ctx.ellipse(vineX + 100, h - 20, 70, 45, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- RETRO CRT SCANLINES ---
  private renderCRTScanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }
    ctx.restore();
  }
}
