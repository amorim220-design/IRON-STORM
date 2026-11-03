/**
 * Project Iron Storm - Game Engine
 * Core simulation: Physics, Players, Weapons, Pilotable Tank, Enemies, Bosses, POWs, Crates
 */

import { audio } from './audio';
import { inputManager } from './input';
import { 
  CharacterId, 
  DestructibleObject, 
  Enemy, 
  EnemyType, 
  GameState, 
  Particle, 
  PickupItem, 
  Platform, 
  Player, 
  POW, 
  Projectile, 
  StageTheme, 
  Vehicle, 
  WEAPONS, 
  WeaponType 
} from './types';

export const STAGE_THEMES: StageTheme[] = [
  {
    id: 1,
    name: 'STAGE 1: VERDANT STRONGHOLD',
    location: 'Tropical Jungle Outpost',
    description: 'Infiltrate the enemy jungle fortifications and neutralize the Goliath Cave Colossus.',
    skyTop: '#1e3a8a',
    skyBottom: '#38bdf8',
    ambientColor: 'rgba(255, 230, 180, 0.12)',
    godRayColor: 'rgba(255, 245, 200, 0.18)',
    groundColor: '#2d1b0d',
    grassColor: '#15803d',
    foliageColor: '#166534',
    fogColor: 'rgba(16, 185, 129, 0.15)',
    accentColor: '#eab308',
  },
  {
    id: 2,
    name: 'STAGE 2: DUNE BASTION',
    location: 'Desert Fortress & Refinery',
    description: 'Assault the desert oil garrison protected by heavy tread tanks and mechanized walkers.',
    skyTop: '#7c2d12',
    skyBottom: '#fdba74',
    ambientColor: 'rgba(254, 215, 170, 0.15)',
    godRayColor: 'rgba(255, 237, 213, 0.16)',
    groundColor: '#78350f',
    grassColor: '#d97706',
    foliageColor: '#92400e',
    fogColor: 'rgba(245, 158, 11, 0.15)',
    accentColor: '#f97316',
  },
  {
    id: 3,
    name: 'STAGE 3: NEON RUIN',
    location: 'Collapsed Cyber-Metropolis',
    description: 'Fight through torrential acid rain across skyscraper bridges swarming with attack drones.',
    skyTop: '#090d16',
    skyBottom: '#1e1b4b',
    ambientColor: 'rgba(129, 140, 248, 0.1)',
    godRayColor: 'rgba(192, 132, 252, 0.14)',
    groundColor: '#0f172a',
    grassColor: '#4338ca',
    foliageColor: '#312e81',
    fogColor: 'rgba(99, 102, 241, 0.18)',
    accentColor: '#38bdf8',
  },
  {
    id: 4,
    name: 'STAGE 4: FROST CITADEL',
    location: 'Arctic Mountain Laboratory',
    description: 'Storm the sub-zero high-tech weapons facility through freezing blizzards.',
    skyTop: '#0c4a6e',
    skyBottom: '#bae6fd',
    ambientColor: 'rgba(224, 242, 254, 0.15)',
    godRayColor: 'rgba(240, 249, 255, 0.2)',
    groundColor: '#1e293b',
    grassColor: '#94a3b8',
    foliageColor: '#64748b',
    fogColor: 'rgba(148, 163, 184, 0.2)',
    accentColor: '#06b6d4',
  },
];

export class GameEngine {
  public state: GameState = 'TITLE_MENU';
  public currentStageIndex: number = 0;
  public isCoop: boolean = false;
  
  // World geometry
  public stageWidth: number = 5200;
  public stageHeight: number = 900;
  public cameraX: number = 0;
  public cameraY: number = 0;
  public cameraMaxX: number = 0;
  public bossArenaActive: boolean = false;
  public bossDefeated: boolean = false;
  public stageClearTimer: number = 0;

  // Screen shake
  public shakeDuration: number = 0;
  public shakeMagnitude: number = 0;

  // Game entities
  public players: Player[] = [];
  public vehicles: Vehicle[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public enemies: Enemy[] = [];
  public pows: POW[] = [];
  public pickups: PickupItem[] = [];
  public destructibles: DestructibleObject[] = [];
  public platforms: Platform[] = [];

  // Combo system
  public comboCount: number = 0;
  public comboTimer: number = 0;
  public highScore: number = 150000;

  // Boss reference
  public boss: Enemy | null = null;

  // Callbacks for UI updates
  public onStateChange?: (state: GameState) => void;
  public onScoreChange?: (p1Score: number, p2Score: number, highScore: number) => void;

  constructor() {
    this.loadHighScore();
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('iron_storm_highscore');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 150000;
      }
    } catch {
      // LocalStorage unavailable
    }
  }

  public saveHighScore(score: number) {
    if (score > this.highScore) {
      this.highScore = score;
      try {
        localStorage.setItem('iron_storm_highscore', score.toString());
      } catch {
        // LocalStorage unavailable
      }
    }
  }

  public get currentTheme(): StageTheme {
    return STAGE_THEMES[this.currentStageIndex % STAGE_THEMES.length];
  }

  // Start new game session
  public startNewGame(isCoop: boolean, p1Char: CharacterId = 'REX', p2Char: CharacterId = 'MAYA') {
    this.isCoop = isCoop;
    this.currentStageIndex = 0;
    this.initStage(this.currentStageIndex, p1Char, p2Char);
    this.state = 'PLAYING';
    audio.init();
    audio.startMusic(false);
    audio.announceVoice('Mission 1 Start!');
    if (this.onStateChange) this.onStateChange(this.state);
  }

  public restartStage() {
    const p1Char = this.players[0]?.character || 'REX';
    const p2Char = this.players[1]?.character || 'MAYA';
    this.initStage(this.currentStageIndex, p1Char, p2Char);
    this.state = 'PLAYING';
    audio.startMusic(false);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  public nextStage() {
    this.currentStageIndex = (this.currentStageIndex + 1) % STAGE_THEMES.length;
    const p1Char = this.players[0]?.character || 'REX';
    const p2Char = this.players[1]?.character || 'MAYA';
    this.initStage(this.currentStageIndex, p1Char, p2Char);
    this.state = 'PLAYING';
    audio.startMusic(false);
    audio.announceVoice(`Mission ${this.currentStageIndex + 1} Start!`);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  // Initialize a stage layout
  public initStage(stageIdx: number, p1Char: CharacterId, p2Char: CharacterId) {
    this.currentStageIndex = stageIdx;
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraMaxX = 0;
    this.bossArenaActive = false;
    this.bossDefeated = false;
    this.stageClearTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.stageWidth = 5200;

    // Reset collections
    this.projectiles = [];
    this.particles = [];
    this.enemies = [];
    this.pows = [];
    this.pickups = [];
    this.destructibles = [];
    this.vehicles = [];

    // Create Players
    const p1: Player = {
      id: 1,
      character: p1Char,
      name: p1Char === 'REX' ? 'Rex Vance' : 'Maya Cole',
      x: 100,
      y: 600,
      vx: 0,
      vy: 0,
      width: 44,
      height: 64,
      facing: 1,
      isGrounded: true,
      isCrouching: false,
      aimDir: { x: 1, y: 0 },
      isInvulnerable: false,
      invulnerableTimer: 0,
      lives: 3,
      score: this.players[0]?.score || 0,
      bombs: 10,
      currentWeapon: 'PISTOL',
      ammo: Infinity,
      lastShotTime: 0,
      lastBombTime: 0,
      inVehicle: false,
      vehicleId: null,
      state: 'idle',
      animTimer: 0,
      parachuteY: 0,
      isActive: true,
    };

    this.players = [p1];

    if (this.isCoop) {
      const p2: Player = {
        id: 2,
        character: p2Char,
        name: p2Char === 'REX' ? 'Rex Vance' : 'Maya Cole',
        x: 60,
        y: 600,
        vx: 0,
        vy: 0,
        width: 44,
        height: 64,
        facing: 1,
        isGrounded: true,
        isCrouching: false,
        aimDir: { x: 1, y: 0 },
        isInvulnerable: false,
        invulnerableTimer: 0,
        lives: 3,
        score: this.players[1]?.score || 0,
        bombs: 10,
        currentWeapon: 'PISTOL',
        ammo: Infinity,
        lastShotTime: 0,
        lastBombTime: 0,
        inVehicle: false,
        vehicleId: null,
        state: 'idle',
        animTimer: 0,
        parachuteY: 0,
        isActive: true,
      };
      this.players.push(p2);
    }

    // Platforms & Ground
    this.platforms = [
      // Main ground floor with subtle elevation gaps
      { x: 0, y: 720, width: 1400, height: 180 },
      { x: 1450, y: 720, width: 1200, height: 180 },
      { x: 2700, y: 720, width: 2500, height: 180 },
      
      // Wooden watchtowers & suspension bridges
      { x: 350, y: 580, width: 260, height: 24, isOneWay: true },
      { x: 750, y: 530, width: 300, height: 24, isOneWay: true },
      { x: 1200, y: 590, width: 240, height: 24, isOneWay: true },
      { x: 1750, y: 540, width: 340, height: 24, isOneWay: true },
      { x: 2200, y: 480, width: 280, height: 24, isOneWay: true },
      { x: 2900, y: 570, width: 320, height: 24, isOneWay: true },
      { x: 3400, y: 520, width: 380, height: 24, isOneWay: true },
      { x: 3950, y: 580, width: 260, height: 24, isOneWay: true },
      
      // Boss arena elevated defense balconies
      { x: 4400, y: 560, width: 240, height: 24, isOneWay: true },
      { x: 4850, y: 560, width: 240, height: 24, isOneWay: true },
    ];

    // Spawn Pilotable Tank: "IRON SLUG"
    const tank: Vehicle = {
      id: 'iron_slug_1',
      type: 'IRON_SLUG_TANK',
      x: 1850,
      y: 650,
      vx: 0,
      vy: 0,
      width: 96,
      height: 68,
      hp: 100,
      maxHp: 100,
      facing: 1,
      vulcanAngle: 0,
      cannonCooldown: 0,
      vulcanCooldown: 0,
      isOccupied: false,
      driverId: null,
      engineSmokeTimer: 0,
      jumpVelocity: 0,
      isGrounded: true,
    };
    this.vehicles.push(tank);

    // Spawn Rescuable POWs (Hostages)
    this.pows = [
      { id: 'pow_1', x: 500, y: 720, rescued: false, rewardType: 'HMG', saluteTimer: 0, walkTimer: 0, facing: 1 },
      { id: 'pow_2', x: 1050, y: 720, rescued: false, rewardType: 'SHOTGUN', saluteTimer: 0, walkTimer: 0, facing: -1 },
      { id: 'pow_3', x: 2050, y: 720, rescued: false, rewardType: 'FLAMETHROWER', saluteTimer: 0, walkTimer: 0, facing: 1 },
      { id: 'pow_4', x: 3100, y: 720, rescued: false, rewardType: 'ROCKET', saluteTimer: 0, walkTimer: 0, facing: -1 },
      { id: 'pow_5', x: 3800, y: 720, rescued: false, rewardType: 'LASER', saluteTimer: 0, walkTimer: 0, facing: 1 },
      { id: 'pow_6', x: 4250, y: 720, rescued: false, rewardType: 'TURKEY', saluteTimer: 0, walkTimer: 0, facing: 1 },
    ];

    // Spawn Destructible Crates & Barricades
    this.destructibles = [
      { id: 'crate_1', type: 'CRATE', x: 420, y: 660, width: 48, height: 48, hp: 20, maxHp: 20, destroyed: false, reward: 'BOMB_BOX' },
      { id: 'crate_2', type: 'EXPLOSIVE_BARREL', x: 920, y: 660, width: 40, height: 52, hp: 15, maxHp: 15, destroyed: false },
      { id: 'barricade_1', type: 'BARRICADE', x: 1350, y: 650, width: 56, height: 60, hp: 60, maxHp: 60, destroyed: false },
      { id: 'crate_3', type: 'CRATE', x: 1650, y: 660, width: 48, height: 48, hp: 20, maxHp: 20, destroyed: false, reward: 'MEDAL' },
      { id: 'crate_4', type: 'EXPLOSIVE_BARREL', x: 2450, y: 660, width: 40, height: 52, hp: 15, maxHp: 15, destroyed: false },
      { id: 'crate_5', type: 'CRATE', x: 3300, y: 660, width: 48, height: 48, hp: 20, maxHp: 20, destroyed: false, reward: 'HMG' },
      { id: 'barricade_2', type: 'BARRICADE', x: 3750, y: 650, width: 56, height: 60, hp: 70, maxHp: 70, destroyed: false },
    ];

    // Spawn Enemy waves across the level
    this.spawnLevelEnemies();

    // Stage 1 Boss: GOLIATH-X1 (Iron Skull Cave Colossus) matching uploaded artwork!
    const boss: Enemy = {
      id: 'boss_goliath',
      type: 'boss_goliath',
      x: 4680,
      y: 380,
      vx: 0,
      vy: 0,
      width: 220,
      height: 280,
      hp: 1200,
      maxHp: 1200,
      facing: -1,
      state: 'idle',
      animTimer: 0,
      attackTimer: 0,
      attackCooldown: 1800,
      patrolMin: 4600,
      patrolMax: 4750,
      scoreValue: 50000,
      isGrounded: true,
      bossPhase: 1,
      bossLaserCharge: 0,
      bossMissileTimer: 0,
    };
    this.boss = boss;
    this.enemies.push(boss);
  }

  private spawnLevelEnemies() {
    // 1. Grunt Troopers
    const trooperPositions = [
      600, 800, 1150, 1400, 1700, 1950, 2300, 2600, 2850, 3200, 3500, 3900, 4100
    ];
    trooperPositions.forEach((x, i) => {
      this.enemies.push({
        id: `trooper_${i}`,
        type: 'trooper',
        x,
        y: 650,
        vx: 0,
        vy: 0,
        width: 40,
        height: 60,
        hp: 20,
        maxHp: 20,
        facing: -1,
        state: 'patrol',
        animTimer: Math.random() * 100,
        attackTimer: 1000 + Math.random() * 1500,
        attackCooldown: 2200,
        patrolMin: x - 80,
        patrolMax: x + 80,
        scoreValue: 300,
        isGrounded: true,
      });
    });

    // 2. Purple Troopers (Biomech Commando as seen in uploaded key art)
    const purplePositions = [950, 1550, 2150, 2750, 3350, 4000];
    purplePositions.forEach((x, i) => {
      this.enemies.push({
        id: `purple_${i}`,
        type: 'purple_trooper',
        x,
        y: 650,
        vx: 0,
        vy: 0,
        width: 42,
        height: 62,
        hp: 35,
        maxHp: 35,
        facing: -1,
        state: 'patrol',
        animTimer: Math.random() * 100,
        attackTimer: 800 + Math.random() * 1200,
        attackCooldown: 1700,
        patrolMin: x - 120,
        patrolMax: x + 120,
        scoreValue: 500,
        isGrounded: true,
      });
    });

    // 3. Shield Guards (Deflects bullets, requires grenade/flame/shotgun or jump behind)
    const shieldPositions = [1300, 2400, 3650];
    shieldPositions.forEach((x, i) => {
      this.enemies.push({
        id: `shield_${i}`,
        type: 'shield_guard',
        x,
        y: 650,
        vx: 0,
        vy: 0,
        width: 48,
        height: 64,
        hp: 75,
        maxHp: 75,
        facing: -1,
        state: 'patrol',
        animTimer: 0,
        attackTimer: 1500,
        attackCooldown: 2400,
        patrolMin: x - 40,
        patrolMax: x + 40,
        scoreValue: 800,
        isGrounded: true,
      });
    });

    // 4. Mortar Troopers (fires arcing explosive bombs)
    const mortarPositions = [850, 2250, 3450];
    mortarPositions.forEach((x, i) => {
      this.enemies.push({
        id: `mortar_${i}`,
        type: 'mortar',
        x,
        y: 650,
        vx: 0,
        vy: 0,
        width: 44,
        height: 58,
        hp: 30,
        maxHp: 30,
        facing: -1,
        state: 'idle',
        animTimer: 0,
        attackTimer: 2000 + Math.random() * 1000,
        attackCooldown: 3200,
        patrolMin: x,
        patrolMax: x,
        scoreValue: 600,
        isGrounded: true,
      });
    });

    // 5. Aerial Attack Drones
    const dronePositions = [1100, 1800, 2500, 3150, 3850];
    dronePositions.forEach((x, i) => {
      this.enemies.push({
        id: `drone_${i}`,
        type: 'drone',
        x,
        y: 420 + Math.sin(i) * 50,
        vx: 0,
        vy: 0,
        width: 46,
        height: 38,
        hp: 25,
        maxHp: 25,
        facing: -1,
        state: 'patrol',
        animTimer: 0,
        attackTimer: 1200 + Math.random() * 1200,
        attackCooldown: 2000,
        patrolMin: x - 100,
        patrolMax: x + 100,
        scoreValue: 700,
        isGrounded: false,
      });
    });

    // 6. Mid-Boss Armored Mech Walker
    this.enemies.push({
      id: 'mech_midboss',
      type: 'mech_walker',
      x: 3000,
      y: 620,
      vx: 0,
      vy: 0,
      width: 90,
      height: 95,
      hp: 320,
      maxHp: 320,
      facing: -1,
      state: 'patrol',
      animTimer: 0,
      attackTimer: 1000,
      attackCooldown: 1800,
      patrolMin: 2900,
      patrolMax: 3100,
      scoreValue: 5000,
      isGrounded: true,
    });
  }

  // Trigger Screen Shake
  public triggerShake(magnitude = 12, duration = 250) {
    this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  // Main Game Loop Tick (60 FPS delta)
  public update(dtMs: number) {
    if (this.state !== 'PLAYING') return;

    inputManager.update();
    const dt = Math.min(dtMs / 1000, 0.05); // seconds, capped

    // Decay Screen Shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dtMs;
      if (this.shakeDuration <= 0) {
        this.shakeMagnitude = 0;
      }
    }

    // Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dtMs;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // Update Entities
    this.updateVehicles(dt);
    this.updatePlayers(dt);
    this.updateCamera();
    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    this.updatePOWs(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);

    // Check Boss Arena Trigger
    const leadPlayerX = Math.max(...this.players.filter(p => p.isActive).map(p => p.x));
    if (leadPlayerX >= 4350 && !this.bossArenaActive) {
      this.bossArenaActive = true;
      audio.setBossMusic(true);
      audio.playBossAlarm();
      audio.announceVoice('Warning! Colossal Target Detected!');
    }

    // Check Stage Clear
    if (this.bossDefeated) {
      this.stageClearTimer += dtMs;
      if (this.stageClearTimer > 4000 && this.state === 'PLAYING') {
        this.state = 'STAGE_CLEAR';
        audio.stopMusic();
        audio.announceVoice('Mission Complete!');
        if (this.onStateChange) this.onStateChange(this.state);
      }
    }

    // Check Game Over (All players dead and no lives left)
    const activeAlive = this.players.filter(p => p.isActive && (p.lives > 0 || p.state !== 'dead'));
    if (activeAlive.length === 0 && this.state === 'PLAYING') {
      this.state = 'GAME_OVER';
      audio.stopMusic();
      audio.announceVoice('Game Over!');
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  // --- PLAYERS UPDATE ---
  private updatePlayers(dt: number) {
    const gravity = 1400;
    const moveSpeed = 240;
    const jumpImpulse = -580;

    this.players.forEach((player) => {
      if (!player.isActive) return;

      const input = player.id === 1 ? inputManager.getP1() : inputManager.getP2();

      // Check Pause
      if (input.pause && player.id === 1) {
        this.state = 'PAUSED';
        if (this.onStateChange) this.onStateChange(this.state);
        return;
      }

      // If Player is dead or parachuting
      if (player.state === 'dead') {
        if (player.lives > 0) {
          player.animTimer += dt * 1000;
          if (player.animTimer > 1800) {
            // Respawn with parachute
            player.lives--;
            player.state = 'parachuting';
            player.x = this.cameraX + 200;
            player.y = 100;
            player.vx = 0;
            player.vy = 80;
            player.isInvulnerable = true;
            player.invulnerableTimer = 3000;
            player.currentWeapon = 'PISTOL';
            player.ammo = Infinity;
            player.bombs = 10;
          }
        }
        return;
      }

      if (player.state === 'parachuting') {
        player.y += player.vy * dt;
        player.x += (input.right ? 1 : input.left ? -1 : 0) * 100 * dt;
        if (player.y >= 640) {
          player.y = 650;
          player.state = 'idle';
          player.isGrounded = true;
          audio.announceVoice('OK!');
        }
        return;
      }

      // If in Vehicle, player handles tank
      if (player.inVehicle && player.vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === player.vehicleId);
        if (vehicle) {
          // Mount / Dismount action
          if (input.mount && Date.now() - player.lastBombTime > 500) {
            player.inVehicle = false;
            player.vehicleId = null;
            vehicle.isOccupied = false;
            vehicle.driverId = null;
            player.x = vehicle.x;
            player.y = vehicle.y - 40;
            player.vy = jumpImpulse * 0.8;
            player.isGrounded = false;
            player.lastBombTime = Date.now();
            audio.playVehicleMount();
          }
          return;
        } else {
          player.inVehicle = false;
          player.vehicleId = null;
        }
      }

      // Invulnerability blink timer
      if (player.isInvulnerable) {
        player.invulnerableTimer -= dt * 1000;
        if (player.invulnerableTimer <= 0) {
          player.isInvulnerable = false;
        }
      }

      // Mount vehicle check (Standing next to an empty tank and pressing 'E'/Mount)
      if (input.mount && Date.now() - player.lastBombTime > 500) {
        const nearbyTank = this.vehicles.find(v => 
          !v.isOccupied && 
          Math.abs(v.x - player.x) < 80 && 
          Math.abs(v.y - player.y) < 70
        );
        if (nearbyTank) {
          player.inVehicle = true;
          player.vehicleId = nearbyTank.id;
          nearbyTank.isOccupied = true;
          nearbyTank.driverId = player.id;
          player.lastBombTime = Date.now();
          audio.playVehicleMount();
          return;
        }
      }

      // Movement & Aiming
      player.isCrouching = input.down && player.isGrounded;

      if (!player.isCrouching) {
        if (input.right) {
          player.vx = moveSpeed;
          player.facing = 1;
        } else if (input.left) {
          player.vx = -moveSpeed;
          player.facing = -1;
        } else {
          player.vx = 0;
        }
      } else {
        player.vx = 0;
      }

      // 8-Directional Aim Calculation
      if (input.up) {
        if (input.right || input.left) {
          // Diagonal Up
          player.aimDir = { x: player.facing * 0.707, y: -0.707 };
        } else {
          // Straight Up
          player.aimDir = { x: 0, y: -1 };
        }
      } else if (input.down && !player.isGrounded) {
        // Aiming Down while in air
        if (input.right || input.left) {
          player.aimDir = { x: player.facing * 0.707, y: 0.707 };
        } else {
          player.aimDir = { x: 0, y: 1 };
        }
      } else {
        // Forward
        player.aimDir = { x: player.facing, y: 0 };
      }

      // Jump
      if (input.jump && player.isGrounded && !player.isCrouching) {
        player.vy = jumpImpulse;
        player.isGrounded = false;
        player.state = 'jump';
        audio.playJump();
        this.spawnDust(player.x, player.y + player.height / 2);
      }

      // Gravity & Physics
      player.vy += gravity * dt;
      player.x += player.vx * dt;
      player.y += player.vy * dt;

      // Platform collisions
      let grounded = false;
      const footY = player.y + player.height / 2;
      const prevFootY = footY - player.vy * dt;

      for (const plat of this.platforms) {
        if (
          player.x >= plat.x - 15 && 
          player.x <= plat.x + plat.width + 15
        ) {
          if (plat.isOneWay) {
            // One-way drop-through or land from above
            if (prevFootY <= plat.y + 4 && footY >= plat.y && player.vy >= 0) {
              player.y = plat.y - player.height / 2;
              player.vy = 0;
              grounded = true;
              break;
            }
          } else {
            // Solid floor
            if (footY >= plat.y && prevFootY <= plat.y + 20 && player.vy >= 0) {
              player.y = plat.y - player.height / 2;
              player.vy = 0;
              grounded = true;
              break;
            }
          }
        }
      }

      player.isGrounded = grounded;

      // Boundaries & Camera Clamping
      const minX = this.cameraX + 24;
      const maxX = this.cameraX + 1180;
      if (player.x < minX) player.x = minX;
      if (player.x > maxX) player.x = maxX;
      if (player.y > 880) {
        // Fell down pit
        this.damagePlayer(player, 999);
      }

      // Animation State
      if (!player.isGrounded) {
        player.state = player.vy < 0 ? 'jump' : 'fall';
      } else if (player.isCrouching) {
        player.state = 'crouch';
      } else if (Math.abs(player.vx) > 10) {
        player.state = 'run';
        player.animTimer += dt * 12;
      } else {
        player.state = 'idle';
        player.animTimer += dt * 3;
      }

      // Weapons Firing
      const now = Date.now();
      const currentWepData = WEAPONS[player.currentWeapon];

      if (input.shoot && now - player.lastShotTime >= currentWepData.fireRate) {
        this.firePlayerWeapon(player, currentWepData);
        player.lastShotTime = now;
      }

      // Throw Grenade (Bomb)
      if (input.bomb && now - player.lastBombTime >= 500 && player.bombs > 0) {
        this.throwGrenade(player);
        player.lastBombTime = now;
      }
    });
  }

  // Fire Weapon Projectiles
  private firePlayerWeapon(player: Player, wep: typeof WEAPONS[WeaponType]) {
    const muzzleOffset = player.isCrouching ? 16 : 28;
    const originX = player.x + player.aimDir.x * 24;
    const originY = player.y + (player.aimDir.y * 20) - (player.isCrouching ? 0 : 10);

    // Audio SFX
    switch (wep.type) {
      case 'PISTOL': audio.playPistol(); break;
      case 'HMG': audio.playHMG(); break;
      case 'FLAMETHROWER': audio.playFlame(); break;
      case 'ROCKET': audio.playRocketLaunch(); break;
      case 'SHOTGUN': audio.playShotgun(); this.triggerShake(5, 120); break;
      case 'LASER': audio.playLaser(); break;
    }

    // Spawn Projectiles
    for (let i = 0; i < wep.bulletsPerShot; i++) {
      const spreadAngle = (Math.random() - 0.5) * wep.spread;
      const baseAngle = Math.atan2(player.aimDir.y, player.aimDir.x) + spreadAngle;
      const speed = wep.type === 'ROCKET' ? 620 : wep.type === 'FLAMETHROWER' ? 420 : 950;

      const vx = Math.cos(baseAngle) * speed;
      const vy = Math.sin(baseAngle) * speed;

      this.projectiles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        x: originX,
        y: originY,
        vx,
        vy,
        type: wep.type,
        damage: wep.damage,
        radius: wep.type === 'SHOTGUN' ? 6 : wep.type === 'FLAMETHROWER' ? 14 : 4,
        color: wep.color,
        isPlayer: true,
        playerId: player.id,
        life: wep.type === 'FLAMETHROWER' ? 0.35 : 1.5,
        maxLife: wep.type === 'FLAMETHROWER' ? 0.35 : 1.5,
        piercing: wep.type === 'LASER',
        homing: wep.type === 'ROCKET',
      });
    }

    // Muzzle Flash Particles & Casings
    this.spawnMuzzleFlash(originX, originY, wep.color);
    if (wep.type !== 'LASER' && wep.type !== 'FLAMETHROWER') {
      this.spawnCasing(player.x, player.y - muzzleOffset, player.facing);
    }

    // Deduct ammo if special weapon
    if (player.currentWeapon !== 'PISTOL') {
      player.ammo--;
      if (player.ammo <= 0) {
        player.currentWeapon = 'PISTOL';
        player.ammo = Infinity;
      }
    }
  }

  // Throw Grenade
  private throwGrenade(player: Player) {
    player.bombs--;
    const originX = player.x + player.facing * 16;
    const originY = player.y - 15;
    const vx = player.facing * 340 + player.vx * 0.4;
    const vy = -380;

    this.projectiles.push({
      id: `bomb_${Date.now()}`,
      x: originX,
      y: originY,
      vx,
      vy,
      type: 'BOMB',
      damage: 180,
      radius: 9,
      color: '#475569',
      isPlayer: true,
      playerId: player.id,
      life: 1.1,
      maxLife: 1.1,
      gravity: 950,
      rotation: 0,
    });
  }

  // --- VEHICLES UPDATE ---
  private updateVehicles(dt: number) {
    const gravity = 1200;
    const tankSpeed = 180;

    this.vehicles.forEach((v) => {
      // If occupied by a player
      if (v.isOccupied && v.driverId) {
        const input = v.driverId === 1 ? inputManager.getP1() : inputManager.getP2();

        // Driving
        if (input.right) {
          v.vx = tankSpeed;
          v.facing = 1;
        } else if (input.left) {
          v.vx = -tankSpeed;
          v.facing = -1;
        } else {
          v.vx = 0;
        }

        // Tank Jump Boost
        if (input.jump && v.isGrounded) {
          v.vy = -450;
          v.isGrounded = false;
          audio.playJump();
        }

        // Vulcan Cannon Aim (360 degrees, or tracks input)
        let targetAngle = v.facing === 1 ? 0 : Math.PI;
        if (input.up) {
          targetAngle = input.right ? -Math.PI / 4 : input.left ? -Math.PI * 0.75 : -Math.PI / 2;
        } else if (input.down) {
          targetAngle = input.right ? Math.PI / 4 : input.left ? Math.PI * 0.75 : 0;
        }
        v.vulcanAngle = targetAngle;

        // Rapid Vulcan Fire
        const now = Date.now();
        if (input.shoot && now - v.vulcanCooldown > 90) {
          v.vulcanCooldown = now;
          audio.playHMG();
          const muzzleX = v.x + Math.cos(v.vulcanAngle) * 44;
          const muzzleY = v.y - 15 + Math.sin(v.vulcanAngle) * 20;

          this.projectiles.push({
            id: `vulcan_${now}`,
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(v.vulcanAngle) * 1100,
            vy: Math.sin(v.vulcanAngle) * 1100,
            type: 'HMG',
            damage: 22,
            radius: 5,
            color: '#fbbf24',
            isPlayer: true,
            playerId: v.driverId,
            life: 1.2,
            maxLife: 1.2,
          });
          this.spawnMuzzleFlash(muzzleX, muzzleY, '#f59e0b');
        }

        // 120mm Heavy Shell Cannon ("CANNON!")
        if (input.bomb && now - v.cannonCooldown > 900) {
          v.cannonCooldown = now;
          audio.playTankCannon();
          this.triggerShake(16, 320);

          const barrelX = v.x + v.facing * 52;
          const barrelY = v.y - 12;

          this.projectiles.push({
            id: `cannon_${now}`,
            x: barrelX,
            y: barrelY,
            vx: v.facing * 750,
            vy: -15,
            type: 'CANNON_SHELL',
            damage: 350,
            radius: 12,
            color: '#ef4444',
            isPlayer: true,
            playerId: v.driverId,
            life: 1.5,
            maxLife: 1.5,
          });
          this.spawnMuzzleFlash(barrelX, barrelY, '#f97316');
        }
      } else {
        v.vx = 0;
      }

      // Physics
      v.vy += gravity * dt;
      v.x += v.vx * dt;
      v.y += v.vy * dt;

      // Platform collisions
      let grounded = false;
      const footY = v.y + v.height / 2;

      for (const plat of this.platforms) {
        if (v.x >= plat.x - 20 && v.x <= plat.x + plat.width + 20) {
          if (footY >= plat.y && footY - v.vy * dt <= plat.y + 25 && v.vy >= 0) {
            v.y = plat.y - v.height / 2;
            v.vy = 0;
            grounded = true;
            break;
          }
        }
      }
      v.isGrounded = grounded;

      // Clamp
      const minX = this.cameraX + 50;
      const maxX = this.cameraX + 1150;
      if (v.x < minX) v.x = minX;
      if (v.x > maxX) v.x = maxX;

      // Exhaust smoke
      v.engineSmokeTimer += dt * 1000;
      if (v.engineSmokeTimer > 120 && Math.abs(v.vx) > 10) {
        v.engineSmokeTimer = 0;
        this.particles.push({
          x: v.x - v.facing * 46,
          y: v.y - 15,
          vx: -v.facing * 40 + (Math.random() - 0.5) * 20,
          vy: -30 - Math.random() * 30,
          size: 8 + Math.random() * 6,
          color: 'rgba(100, 116, 139, 0.6)',
          alpha: 0.8,
          life: 0.5,
          maxLife: 0.5,
          type: 'smoke',
        });
      }
    });
  }

  // --- CAMERA UPDATE ---
  private updateCamera() {
    // Lead player x position
    const activePlayers = this.players.filter(p => p.isActive && p.state !== 'dead');
    if (activePlayers.length === 0) return;

    const avgX = activePlayers.reduce((acc, p) => acc + p.x, 0) / activePlayers.length;
    
    // In Metal Slug, camera only scrolls forward, never backward
    const targetX = Math.max(0, avgX - 450);
    if (targetX > this.cameraMaxX) {
      this.cameraMaxX = targetX;
    }

    // If Boss Arena is active, clamp camera to arena bounds
    if (this.bossArenaActive) {
      this.cameraX = 4000;
    } else {
      this.cameraX = Math.min(this.cameraMaxX, 4000);
    }
  }

  // --- PROJECTILES UPDATE ---
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;

      // Apply Gravity
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }

      // Homing Rocket logic
      if (p.homing && p.isPlayer) {
        const target = this.findNearestEnemy(p.x, p.y);
        if (target) {
          const angle = Math.atan2(target.y - p.y, target.x - p.x);
          const currentAngle = Math.atan2(p.vy, p.vx);
          const newAngle = currentAngle + (angle - currentAngle) * 0.12;
          const speed = 640;
          p.vx = Math.cos(newAngle) * speed;
          p.vy = Math.sin(newAngle) * speed;
        }

        // Smoke trail
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          size: 7,
          color: 'rgba(226, 232, 240, 0.7)',
          alpha: 0.8,
          life: 0.4,
          maxLife: 0.4,
          type: 'smoke',
        });
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Bounce Bomb / Grenade on floor
      if (p.type === 'BOMB') {
        for (const plat of this.platforms) {
          if (p.x >= plat.x && p.x <= plat.x + plat.width && p.y >= plat.y - 10 && p.y <= plat.y + 20) {
            p.y = plat.y - 8;
            p.vy = -p.vy * 0.45;
            p.vx *= 0.7;
            break;
          }
        }
      }

      // Check Hits against Enemies (Player projectiles)
      if (p.isPlayer) {
        let hit = false;

        // Check Destructibles
        for (const obj of this.destructibles) {
          if (!obj.destroyed && this.checkCollision(p, obj)) {
            obj.hp -= p.damage;
            hit = true;
            this.spawnSparks(p.x, p.y, '#f59e0b', 4);
            if (obj.hp <= 0) {
              this.destroyObject(obj);
            }
            break;
          }
        }

        // Check Enemies
        for (const enemy of this.enemies) {
          if (enemy.hp > 0 && this.checkCollision(p, enemy)) {
            // Check Shield Guard reflection
            if (
              enemy.type === 'shield_guard' && 
              ((enemy.facing === -1 && p.vx > 0) || (enemy.facing === 1 && p.vx < 0)) &&
              p.type !== 'BOMB' && p.type !== 'CANNON_SHELL' && p.type !== 'FLAMETHROWER' && p.type !== 'SHOTGUN'
            ) {
              // Blocked by riot shield!
              hit = true;
              audio.playCasingClink();
              this.spawnSparks(p.x, p.y, '#38bdf8', 6);
              break;
            }

            enemy.hp -= p.damage;
            enemy.state = 'hurt';
            hit = true;

            // Blood/Sparks
            if (enemy.type === 'mech_walker' || enemy.type === 'boss_goliath' || enemy.type === 'drone') {
              this.spawnSparks(p.x, p.y, '#facc15', 8);
            } else {
              this.spawnBlood(p.x, p.y);
            }

            // Enemy Defeated
            if (enemy.hp <= 0) {
              this.killEnemy(enemy, p.playerId);
            }
            break;
          }
        }

        // Detonate Grenade / Rocket / Cannon
        if (p.life <= 0 || (hit && (p.type === 'BOMB' || p.type === 'ROCKET' || p.type === 'CANNON_SHELL'))) {
          if (p.type === 'BOMB' || p.type === 'ROCKET' || p.type === 'CANNON_SHELL') {
            this.detonateExplosive(p.x, p.y, p.damage, p.type === 'CANNON_SHELL' ? 140 : 100, p.playerId);
          }
          if (!p.piercing) {
            this.projectiles.splice(i, 1);
            continue;
          }
        }

        if (hit && !p.piercing) {
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Enemy Projectile hits Player
        for (const player of this.players) {
          if (player.isActive && player.state !== 'dead' && !player.isInvulnerable) {
            if (this.checkCollision(p, player)) {
              this.damagePlayer(player, p.damage);
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      }

      // Cull expired or out-of-bounds projectiles
      if (
        p.life <= 0 || 
        p.x < this.cameraX - 100 || 
        p.x > this.cameraX + 1300 || 
        p.y > 900 || 
        p.y < -100
      ) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // Explosive blast (Grenade, Rocket, Cannon shell)
  private detonateExplosive(x: number, y: number, damage: number, radius: number, playerId?: 1 | 2) {
    audio.playExplosion(radius > 110);
    this.triggerShake(radius > 110 ? 14 : 9, 240);
    this.spawnExplosionVisuals(x, y, radius);

    // Area damage to enemies
    for (const enemy of this.enemies) {
      if (enemy.hp > 0) {
        const dist = Math.hypot(enemy.x - x, enemy.y - y);
        if (dist <= radius + enemy.width / 2) {
          enemy.hp -= damage;
          if (enemy.hp <= 0) {
            this.killEnemy(enemy, playerId);
          }
        }
      }
    }

    // Damage destructibles
    for (const obj of this.destructibles) {
      if (!obj.destroyed) {
        const dist = Math.hypot(obj.x - x, obj.y - y);
        if (dist <= radius + obj.width / 2) {
          obj.hp -= damage;
          if (obj.hp <= 0) {
            this.destroyObject(obj);
          }
        }
      }
    }
  }

  // --- ENEMIES UPDATE ---
  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.hp <= 0) {
        e.animTimer += dt * 1000;
        if (e.animTimer > 1500) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      // Only update enemies within active view margin
      if (e.x > this.cameraX + 1400 || e.x < this.cameraX - 300) {
        continue;
      }

      // Boss Logic
      if (e.type === 'boss_goliath') {
        this.updateBossGoliath(e, dt);
        continue;
      }

      // Patrol / Walk AI
      e.animTimer += dt * 6;
      if (e.state === 'patrol') {
        e.x += e.facing * 75 * dt;
        if (e.x >= e.patrolMax) {
          e.facing = -1;
        } else if (e.x <= e.patrolMin) {
          e.facing = 1;
        }
      }

      // Face nearest player
      const nearestPlayer = this.findNearestPlayer(e.x, e.y);
      if (nearestPlayer) {
        e.facing = nearestPlayer.x > e.x ? 1 : -1;
      }

      // Attack timers
      e.attackTimer -= dt * 1000;
      if (e.attackTimer <= 0 && nearestPlayer) {
        e.attackTimer = e.attackCooldown + Math.random() * 800;
        this.enemyAttack(e, nearestPlayer);
      }
    }
  }

  // Stage 1 Boss: GOLIATH-X1 (Iron Skull Cave Colossus) Logic
  private updateBossGoliath(boss: Enemy, dt: number) {
    if (!this.bossArenaActive) return;

    boss.animTimer += dt * 4;
    const hpPct = boss.hp / boss.maxHp;

    // Phase transition
    if (hpPct < 0.35) {
      boss.bossPhase = 3;
    } else if (hpPct < 0.70) {
      boss.bossPhase = 2;
    } else {
      boss.bossPhase = 1;
    }

    // Boss Attack Cycle
    boss.attackTimer -= dt * 1000;
    if (boss.attackTimer <= 0) {
      const target = this.findNearestPlayer(boss.x, boss.y);
      if (target) {
        if (boss.bossPhase === 1) {
          // Phase 1: Quad Homing Missile Salvo
          this.launchBossMissiles(boss, 4);
          boss.attackTimer = 3400;
        } else if (boss.bossPhase === 2) {
          // Phase 2: Skull Jaw Plasma Beam Charge & Fire
          this.fireBossPlasmaBeam(boss);
          boss.attackTimer = 4200;
        } else {
          // Phase 3 (Overdrive): Missile Storm + Mortar Rain
          this.launchBossMissiles(boss, 6);
          this.dropBossMortars(boss);
          boss.attackTimer = 2900;
        }
      }
    }
  }

  private launchBossMissiles(boss: Enemy, count: number) {
    audio.playRocketLaunch();
    this.triggerShake(7, 200);

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (boss.hp <= 0) return;
        const spawnX = boss.x - 70 + (i % 2 === 0 ? -30 : 30);
        const spawnY = boss.y - 60 + (i * 15);
        const vy = -180 - Math.random() * 120;
        const vx = -280 - Math.random() * 100;

        this.projectiles.push({
          id: `boss_missile_${Date.now()}_${i}`,
          x: spawnX,
          y: spawnY,
          vx,
          vy,
          type: 'ENEMY_MISSILE',
          damage: 35,
          radius: 8,
          color: '#ef4444',
          isPlayer: false,
          life: 3.5,
          maxLife: 3.5,
          homing: true,
        });
      }, i * 180);
    }
  }

  private fireBossPlasmaBeam(boss: Enemy) {
    audio.playLaser();
    this.triggerShake(14, 450);

    // Mouth beam origin
    const mouthX = boss.x - 90;
    const mouthY = boss.y + 40;

    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        if (boss.hp <= 0) return;
        this.projectiles.push({
          id: `boss_plasma_${Date.now()}_${i}`,
          x: mouthX - i * 40,
          y: mouthY + (Math.random() - 0.5) * 20,
          vx: -780,
          vy: (Math.random() - 0.5) * 60,
          type: 'BOSS_LASER',
          damage: 45,
          radius: 16,
          color: '#f97316',
          isPlayer: false,
          life: 1.4,
          maxLife: 1.4,
        });
        this.spawnExplosionVisuals(mouthX, mouthY, 40);
      }, i * 90);
    }
  }

  private dropBossMortars(boss: Enemy) {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (boss.hp <= 0) return;
        const targetX = 4050 + Math.random() * 800;
        this.projectiles.push({
          id: `boss_mortar_${Date.now()}_${i}`,
          x: boss.x - 80,
          y: boss.y - 90,
          vx: -350 - Math.random() * 200,
          vy: -600,
          type: 'MORTAR_BOMB',
          damage: 40,
          radius: 10,
          color: '#fbbf24',
          isPlayer: false,
          life: 2.5,
          maxLife: 2.5,
          gravity: 800,
        });
      }, i * 220);
    }
  }

  // Enemy Attack dispatcher
  private enemyAttack(e: Enemy, target: Player) {
    const originX = e.x + e.facing * 20;
    const originY = e.y - 10;

    if (e.type === 'trooper') {
      audio.playPistol();
      this.projectiles.push({
        id: `ebullet_${Date.now()}`,
        x: originX,
        y: originY,
        vx: e.facing * 520,
        vy: 0,
        type: 'ENEMY_BULLET',
        damage: 20,
        radius: 4,
        color: '#facc15',
        isPlayer: false,
        life: 2.0,
        maxLife: 2.0,
      });
      this.spawnMuzzleFlash(originX, originY, '#facc15');
    } else if (e.type === 'purple_trooper') {
      audio.playLaser();
      // Burst of 2 plasma shots
      for (let i = 0; i < 2; i++) {
        setTimeout(() => {
          this.projectiles.push({
            id: `purple_shot_${Date.now()}_${i}`,
            x: originX,
            y: originY,
            vx: e.facing * 620,
            vy: (Math.random() - 0.5) * 40,
            type: 'ENEMY_BULLET',
            damage: 25,
            radius: 5,
            color: '#c084fc',
            isPlayer: false,
            life: 2.0,
            maxLife: 2.0,
          });
          this.spawnMuzzleFlash(originX, originY, '#c084fc');
        }, i * 140);
      }
    } else if (e.type === 'mortar') {
      audio.playRocketLaunch();
      const dist = Math.abs(target.x - e.x);
      const vx = e.facing * (dist * 1.4);
      this.projectiles.push({
        id: `mortar_shot_${Date.now()}`,
        x: originX,
        y: originY - 15,
        vx,
        vy: -480,
        type: 'MORTAR_BOMB',
        damage: 40,
        radius: 8,
        color: '#ef4444',
        isPlayer: false,
        life: 2.5,
        maxLife: 2.5,
        gravity: 850,
      });
    } else if (e.type === 'drone') {
      audio.playLaser();
      this.projectiles.push({
        id: `drone_shot_${Date.now()}`,
        x: e.x,
        y: e.y + 15,
        vx: (target.x - e.x) * 1.5,
        vy: 420,
        type: 'ENEMY_BULLET',
        damage: 25,
        radius: 6,
        color: '#06b6d4',
        isPlayer: false,
        life: 1.8,
        maxLife: 1.8,
      });
    } else if (e.type === 'mech_walker') {
      audio.playHMG();
      this.triggerShake(4, 100);
      this.projectiles.push({
        id: `mech_shot_${Date.now()}`,
        x: originX + e.facing * 30,
        y: originY + 10,
        vx: e.facing * 650,
        vy: (Math.random() - 0.5) * 50,
        type: 'ENEMY_BULLET',
        damage: 30,
        radius: 6,
        color: '#f97316',
        isPlayer: false,
        life: 2.0,
        maxLife: 2.0,
      });
    }
  }

  // Enemy Killed
  private killEnemy(enemy: Enemy, playerId?: 1 | 2) {
    enemy.state = 'dead';
    audio.playEnemyDeath();

    // Combo system
    this.comboCount++;
    this.comboTimer = 2800; // 2.8 seconds window
    const multiplier = Math.min(10, 1 + Math.floor(this.comboCount / 3));

    const totalScore = enemy.scoreValue * multiplier;
    if (playerId) {
      const p = this.players.find(pl => pl.id === playerId);
      if (p) {
        p.score += totalScore;
        this.saveHighScore(p.score);
        if (this.onScoreChange) {
          this.onScoreChange(this.players[0]?.score || 0, this.players[1]?.score || 0, this.highScore);
        }
      }
    }

    // Boss Defeated
    if (enemy.type === 'boss_goliath') {
      this.bossDefeated = true;
      audio.stopMusic();
      audio.playExplosion(true);
      this.triggerShake(24, 1800);
      
      // Cascade of secondary explosions
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          this.spawnExplosionVisuals(
            enemy.x + (Math.random() - 0.5) * enemy.width,
            enemy.y + (Math.random() - 0.5) * enemy.height,
            50 + Math.random() * 40
          );
          audio.playExplosion(false);
          this.triggerShake(8, 150);
        }, i * 140);
      }
      return;
    }

    // Random weapon / medal item drop (15% chance)
    if (Math.random() < 0.18) {
      const dropTypes: (WeaponType | 'MEDAL' | 'TURKEY')[] = ['HMG', 'SHOTGUN', 'FLAMETHROWER', 'ROCKET', 'LASER', 'MEDAL', 'TURKEY'];
      const chosen = dropTypes[Math.floor(Math.random() * dropTypes.length)];
      this.spawnPickup(enemy.x, enemy.y, chosen);
    }
  }

  // --- POWs UPDATE ---
  private updatePOWs(dt: number) {
    for (const pow of this.pows) {
      // Freeing POW by player proximity or shots
      if (!pow.rescued) {
        for (const p of this.players) {
          if (p.isActive && p.state !== 'dead' && Math.abs(p.x - pow.x) < 45 && Math.abs(p.y - pow.y) < 60) {
            this.rescuePOW(pow, p);
            break;
          }
        }
      } else {
        // Rescued sequence: salute then run off screen
        if (pow.saluteTimer > 0) {
          pow.saluteTimer -= dt * 1000;
          if (pow.saluteTimer <= 0) {
            // Drop reward!
            this.spawnPickup(pow.x, pow.y - 15, pow.rewardType);
          }
        } else {
          // Walk away
          pow.x += pow.facing * 140 * dt;
          pow.walkTimer += dt * 6;
        }
      }
    }
  }

  private rescuePOW(pow: POW, player: Player) {
    pow.rescued = true;
    pow.saluteTimer = 1000;
    player.score += 2500;
    audio.playPOWRescue();
  }

  // --- PICKUPS UPDATE ---
  private spawnPickup(x: number, y: number, type: WeaponType | 'MEDAL' | 'TURKEY' | 'BOMB_BOX') {
    let label = 'ITEM';
    let score = 500;
    if (type === 'HMG') label = 'HMG';
    else if (type === 'SHOTGUN') label = 'SHOTGUN';
    else if (type === 'FLAMETHROWER') label = 'FLAME';
    else if (type === 'ROCKET') label = 'ROCKET';
    else if (type === 'LASER') label = 'LASER';
    else if (type === 'TURKEY') { label = 'FOOD'; score = 1000; }
    else if (type === 'MEDAL') { label = 'MEDAL'; score = 500; }
    else if (type === 'BOMB_BOX') { label = 'BOMBS'; score = 500; }

    this.pickups.push({
      id: `pickup_${Date.now()}_${Math.random()}`,
      type,
      label,
      x,
      y,
      vy: -180,
      width: 32,
      height: 32,
      collected: false,
      scoreValue: score,
      floatTimer: 0,
    });
  }

  private updatePickups(dt: number) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.floatTimer += dt * 4;

      // Gravity until floor
      if (p.y < 700) {
        p.vy += 800 * dt;
        p.y += p.vy * dt;
      }

      // Check Collection by Players
      for (const player of this.players) {
        if (player.isActive && player.state !== 'dead') {
          if (Math.abs(player.x - p.x) < 36 && Math.abs(player.y - p.y) < 48) {
            this.collectPickup(p, player);
            this.pickups.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  private collectPickup(item: PickupItem, player: Player) {
    player.score += item.scoreValue;
    this.saveHighScore(player.score);

    if (item.type === 'TURKEY' || item.type === 'MEDAL') {
      audio.playPickup();
    } else if (item.type === 'BOMB_BOX') {
      audio.playPickup();
      player.bombs = Math.min(30, player.bombs + 10);
      audio.announceVoice('Bombs!');
    } else {
      // Weapon pickup!
      const wepData = WEAPONS[item.type as WeaponType];
      player.currentWeapon = item.type as WeaponType;
      player.ammo = wepData.maxAmmo;
      audio.announceWeapon(wepData.voiceLine);
    }
  }

  // --- DESTRUCTIBLE OBJECTS ---
  private destroyObject(obj: DestructibleObject) {
    obj.destroyed = true;
    audio.playExplosion(false);
    this.triggerShake(8, 160);
    this.spawnExplosionVisuals(obj.x, obj.y, 45);

    if (obj.type === 'EXPLOSIVE_BARREL') {
      // Barrel detonates with large radius
      this.detonateExplosive(obj.x, obj.y, 160, 130);
    }

    if (obj.reward) {
      this.spawnPickup(obj.x, obj.y - 20, obj.reward);
    }
  }

  // --- PARTICLES UPDATE ---
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.vRot) {
        p.rotation = (p.rotation || 0) + p.vRot * dt;
      }

      // Gravity for casings & debris
      if (p.type === 'casing' || p.type === 'debris') {
        p.vy += 700 * dt;
        if (p.y >= 720) {
          p.y = 718;
          p.vy = -p.vy * 0.4;
          p.vx *= 0.6;
        }
      }

      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // --- DAMAGE PLAYER ---
  public damagePlayer(player: Player, amount: number) {
    // If in vehicle, tank absorbs all damage!
    if (player.inVehicle && player.vehicleId) {
      const tank = this.vehicles.find(v => v.id === player.vehicleId);
      if (tank) {
        tank.hp -= amount;
        audio.playExplosion(false);
        this.triggerShake(10, 200);
        this.spawnSparks(tank.x, tank.y, '#f59e0b', 8);

        if (tank.hp <= 0) {
          // Tank destroyed: emergency player ejection!
          player.inVehicle = false;
          player.vehicleId = null;
          tank.isOccupied = false;
          tank.driverId = null;
          player.y = tank.y - 50;
          player.vy = -550;
          player.isInvulnerable = true;
          player.invulnerableTimer = 2500;
          this.detonateExplosive(tank.x, tank.y, 100, 100);
          audio.announceVoice('Warning!');
        }
        return;
      }
    }

    player.lives--;
    audio.playPlayerHurt();
    this.triggerShake(12, 300);
    this.spawnBlood(player.x, player.y);

    if (player.lives > 0) {
      player.state = 'dead';
      player.animTimer = 0;
    } else {
      player.state = 'dead';
      player.isActive = false;
    }
  }

  // --- VISUAL PARTICLE HELPERS ---
  private spawnMuzzleFlash(x: number, y: number, color: string) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        size: 8 + Math.random() * 6,
        color,
        alpha: 1,
        life: 0.08,
        maxLife: 0.08,
        type: 'glow',
      });
    }
  }

  private spawnCasing(x: number, y: number, facing: number) {
    this.particles.push({
      x,
      y,
      vx: -facing * (80 + Math.random() * 60),
      vy: -150 - Math.random() * 80,
      size: 3,
      color: '#facc15',
      alpha: 1,
      life: 1.2,
      maxLife: 1.2,
      type: 'casing',
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 15,
    });
  }

  private spawnExplosionVisuals(x: number, y: number, radius: number) {
    // Fireball
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * radius * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 14 + Math.random() * 18,
        color: i % 2 === 0 ? '#f97316' : '#ef4444',
        alpha: 1,
        life: 0.45 + Math.random() * 0.3,
        maxLife: 0.75,
        type: 'flame',
      });
    }

    // Smoke
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 70,
        vy: -50 - Math.random() * 80,
        size: 16 + Math.random() * 16,
        color: 'rgba(51, 65, 85, 0.7)',
        alpha: 0.8,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.3,
        type: 'smoke',
      });
    }

    // Debris
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 280,
        vy: -200 - Math.random() * 250,
        size: 5 + Math.random() * 4,
        color: '#475569',
        alpha: 1,
        life: 0.9,
        maxLife: 0.9,
        type: 'debris',
        rotation: 0,
        vRot: (Math.random() - 0.5) * 20,
      });
    }
  }

  private spawnSparks(x: number, y: number, color: string, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 250,
        vy: (Math.random() - 0.5) * 250,
        size: 3,
        color,
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        type: 'spark',
      });
    }
  }

  private spawnBlood(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
        size: 4,
        color: '#dc2626',
        alpha: 0.9,
        life: 0.35,
        maxLife: 0.35,
        type: 'blood',
      });
    }
  }

  private spawnDust(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 50,
        vy: -15 - Math.random() * 20,
        size: 6,
        color: 'rgba(217, 119, 6, 0.4)',
        alpha: 0.6,
        life: 0.3,
        maxLife: 0.3,
        type: 'smoke',
      });
    }
  }

  // --- COLLISION & QUERY HELPERS ---
  private checkCollision(
    p: { x: number; y: number; radius?: number }, 
    box: { x: number; y: number; width: number; height: number }
  ): boolean {
    const r = p.radius || 4;
    return (
      p.x + r >= box.x - box.width / 2 &&
      p.x - r <= box.x + box.width / 2 &&
      p.y + r >= box.y - box.height / 2 &&
      p.y - r <= box.y + box.height / 2
    );
  }

  private findNearestEnemy(x: number, y: number): Enemy | null {
    let nearest: Enemy | null = null;
    let minD = Infinity;
    for (const e of this.enemies) {
      if (e.hp > 0 && e.x > this.cameraX - 50 && e.x < this.cameraX + 1250) {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d < minD) {
          minD = d;
          nearest = e;
        }
      }
    }
    return nearest;
  }

  private findNearestPlayer(x: number, y: number): Player | null {
    let nearest: Player | null = null;
    let minD = Infinity;
    for (const p of this.players) {
      if (p.isActive && p.state !== 'dead') {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < minD) {
          minD = d;
          nearest = p;
        }
      }
    }
    return nearest;
  }
}

export const gameEngine = new GameEngine();
