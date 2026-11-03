/**
 * Project Iron Storm - Game Types & State Definitions
 * Classic 2D Arcade Run & Gun Platformer
 */

export type GameState = 
  | 'TITLE_MENU' 
  | 'CHARACTER_SELECT' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'STAGE_CLEAR' 
  | 'GAME_OVER' 
  | 'GODOT_BLUEPRINT'
  | 'SETTINGS';

export type WeaponType = 'PISTOL' | 'HMG' | 'FLAMETHROWER' | 'ROCKET' | 'SHOTGUN' | 'LASER';

export type CharacterId = 'REX' | 'MAYA';

export interface WeaponData {
  type: WeaponType;
  name: string;
  code: string; // 'H', 'F', 'R', 'S', 'L'
  color: string;
  maxAmmo: number;
  fireRate: number; // ms between shots
  damage: number;
  spread: number;
  bulletsPerShot: number;
  voiceLine: string;
}

export const WEAPONS: Record<WeaponType, WeaponData> = {
  PISTOL: {
    type: 'PISTOL',
    name: 'Combat Pistol',
    code: 'P',
    color: '#fbbf24',
    maxAmmo: Infinity,
    fireRate: 200,
    damage: 12,
    spread: 0.02,
    bulletsPerShot: 1,
    voiceLine: 'PISTOL',
  },
  HMG: {
    type: 'HMG',
    name: 'Heavy Machine Gun',
    code: 'H',
    color: '#f59e0b',
    maxAmmo: 200,
    fireRate: 85,
    damage: 14,
    spread: 0.08,
    bulletsPerShot: 1,
    voiceLine: 'HEAVY MACHINE GUN!',
  },
  FLAMETHROWER: {
    type: 'FLAMETHROWER',
    name: 'Flame Shot',
    code: 'F',
    color: '#ef4444',
    maxAmmo: 120,
    fireRate: 60,
    damage: 8,
    spread: 0.35,
    bulletsPerShot: 3,
    voiceLine: 'FLAME SHOT!',
  },
  ROCKET: {
    type: 'ROCKET',
    name: 'Rocket Launcher',
    code: 'R',
    color: '#06b6d4',
    maxAmmo: 30,
    fireRate: 420,
    damage: 65,
    spread: 0.05,
    bulletsPerShot: 1,
    voiceLine: 'ROCKET LAUNCHER!',
  },
  SHOTGUN: {
    type: 'SHOTGUN',
    name: 'Shotgun',
    code: 'S',
    color: '#84cc16',
    maxAmmo: 30,
    fireRate: 650,
    damage: 32, // each pellet
    spread: 0.28,
    bulletsPerShot: 6,
    voiceLine: 'SHOTGUN!',
  },
  LASER: {
    type: 'LASER',
    name: 'Laser Beam',
    code: 'L',
    color: '#3b82f6',
    maxAmmo: 160,
    fireRate: 80,
    damage: 18,
    spread: 0.01,
    bulletsPerShot: 1,
    voiceLine: 'LASER BEAM!',
  },
};

export interface Player {
  id: 1 | 2;
  character: CharacterId;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  isGrounded: boolean;
  isCrouching: boolean;
  aimDir: { x: number; y: number }; // normalized vector (8 directions)
  isInvulnerable: boolean;
  invulnerableTimer: number;
  lives: number;
  score: number;
  bombs: number; // Grenades
  currentWeapon: WeaponType;
  ammo: number;
  lastShotTime: number;
  lastBombTime: number;
  inVehicle: boolean;
  vehicleId: string | null;
  state: 'idle' | 'run' | 'jump' | 'fall' | 'crouch' | 'hurt' | 'dead' | 'parachuting';
  animTimer: number;
  parachuteY: number;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  type: 'IRON_SLUG_TANK';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  vulcanAngle: number;
  cannonCooldown: number;
  vulcanCooldown: number;
  isOccupied: boolean;
  driverId: 1 | 2 | null;
  engineSmokeTimer: number;
  jumpVelocity: number;
  isGrounded: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: WeaponType | 'BOMB' | 'CANNON_SHELL' | 'ENEMY_BULLET' | 'ENEMY_MISSILE' | 'BOSS_LASER' | 'MORTAR_BOMB';
  damage: number;
  radius: number;
  color: string;
  isPlayer: boolean;
  playerId?: 1 | 2;
  life: number;
  maxLife: number;
  piercing?: boolean;
  homing?: boolean;
  targetId?: string;
  gravity?: number;
  rotation?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'smoke' | 'spark' | 'flame' | 'casing' | 'blood' | 'debris' | 'glow' | 'water';
  rotation?: number;
  vRot?: number;
}

export type EnemyType = 
  | 'trooper' 
  | 'purple_trooper' 
  | 'shield_guard' 
  | 'mortar' 
  | 'drone' 
  | 'mech_walker' 
  | 'boss_goliath';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  state: 'idle' | 'patrol' | 'attack' | 'hurt' | 'dead';
  animTimer: number;
  attackTimer: number;
  attackCooldown: number;
  patrolMin: number;
  patrolMax: number;
  scoreValue: number;
  isGrounded: boolean;
  bossPhase?: number;
  bossLaserCharge?: number;
  bossMissileTimer?: number;
}

export interface POW {
  id: string;
  x: number;
  y: number;
  rescued: boolean;
  rewardType: WeaponType | 'MEDAL' | 'TURKEY' | 'BOMB_BOX';
  saluteTimer: number;
  walkTimer: number;
  facing: 1 | -1;
}

export interface PickupItem {
  id: string;
  type: WeaponType | 'MEDAL' | 'TURKEY' | 'BOMB_BOX';
  label: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  collected: boolean;
  scoreValue: number;
  floatTimer: number;
}

export interface DestructibleObject {
  id: string;
  type: 'CRATE' | 'BARRICADE' | 'EXPLOSIVE_BARREL';
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  destroyed: boolean;
  reward?: WeaponType | 'MEDAL' | 'TURKEY' | 'BOMB_BOX';
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  isOneWay?: boolean;
}

export interface StageTheme {
  id: number;
  name: string;
  location: string;
  description: string;
  skyTop: string;
  skyBottom: string;
  ambientColor: string;
  godRayColor: string;
  groundColor: string;
  grassColor: string;
  foliageColor: string;
  fogColor: string;
  accentColor: string;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  shoot: boolean;
  bomb: boolean;
  mount: boolean;
  pause: boolean;
}
