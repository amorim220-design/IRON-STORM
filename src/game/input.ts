/**
 * Project Iron Storm - Input Manager
 * Handles Keyboard (1P & 2P Co-op), Gamepads (Bluetooth/USB), and On-Screen Touch Controls
 */

import { InputState } from './types';

export class InputManager {
  private p1State: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
    shoot: false,
    bomb: false,
    mount: false,
    pause: false,
  };

  private p2State: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
    shoot: false,
    bomb: false,
    mount: false,
    pause: false,
  };

  private keysDown: Set<string> = new Set();
  private touchState: Partial<InputState> = {};
  public hasTouch: boolean = false;
  public gamepadConnected: boolean = false;

  constructor() {
    this.setupListeners();
    this.checkTouch();
  }

  private checkTouch() {
    if (typeof window !== 'undefined') {
      this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      this.keysDown.add(e.code);
      this.keysDown.add(e.key.toLowerCase());

      // Prevent default page scroll on game controls
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
      this.keysDown.delete(e.key.toLowerCase());
    });

    window.addEventListener('gamepadconnected', () => {
      this.gamepadConnected = true;
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadConnected = false;
    });
  }

  public update() {
    this.updateP1();
    this.updateP2();
    this.pollGamepads();
  }

  private updateP1() {
    // Player 1 Keyboard Controls: WASD, J (Shoot), K (Jump), L (Bomb), E (Mount)
    // Also support fallback: Arrow keys + Z/X/C if P2 is not active
    const k = this.keysDown;

    const up = k.has('KeyW') || this.touchState.up || false;
    const down = k.has('KeyS') || this.touchState.down || false;
    const left = k.has('KeyA') || this.touchState.left || false;
    const right = k.has('KeyD') || this.touchState.right || false;
    
    // Shoot: J or Z
    const shoot = k.has('KeyJ') || k.has('KeyZ') || this.touchState.shoot || false;
    // Jump: K or X or Space
    const jump = k.has('KeyK') || k.has('KeyX') || k.has('Space') || this.touchState.jump || false;
    // Bomb / Grenade: L or C
    const bomb = k.has('KeyL') || k.has('KeyC') || this.touchState.bomb || false;
    // Mount: E
    const mount = k.has('KeyE') || this.touchState.mount || false;
    // Pause: Escape or P
    const pause = k.has('Escape') || k.has('KeyP');

    this.p1State = {
      up,
      down,
      left,
      right,
      shoot,
      jump,
      bomb,
      mount,
      pause,
    };
  }

  private updateP2() {
    // Player 2 Keyboard Controls: Arrow Keys, Numpad 1 (Shoot), Numpad 2 (Jump), Numpad 3 (Bomb), Numpad 0 (Mount)
    // Alternate without numpad: Arrow Keys, '.' (Shoot), '/' (Jump), ';' (Bomb), 'Enter' (Mount)
    const k = this.keysDown;

    const up = k.has('ArrowUp');
    const down = k.has('ArrowDown');
    const left = k.has('ArrowLeft');
    const right = k.has('ArrowRight');

    const shoot = k.has('Numpad1') || k.has('Period') || k.has('.');
    const jump = k.has('Numpad2') || k.has('Slash') || k.has('/');
    const bomb = k.has('Numpad3') || k.has('Semicolon') || k.has(';');
    const mount = k.has('Numpad0') || k.has('Enter');
    const pause = false;

    this.p2State = {
      up,
      down,
      left,
      right,
      shoot,
      jump,
      bomb,
      mount,
      pause,
    };
  }

  private pollGamepads() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    // Gamepad 0 -> Player 1
    const gp1 = gamepads[0];
    if (gp1 && gp1.connected) {
      this.gamepadConnected = true;
      const stickX = gp1.axes[0] || 0;
      const stickY = gp1.axes[1] || 0;
      const dpadUp = gp1.buttons[12]?.pressed;
      const dpadDown = gp1.buttons[13]?.pressed;
      const dpadLeft = gp1.buttons[14]?.pressed;
      const dpadRight = gp1.buttons[15]?.pressed;

      this.p1State.left = this.p1State.left || dpadLeft || stickX < -0.3;
      this.p1State.right = this.p1State.right || dpadRight || stickX > 0.3;
      this.p1State.up = this.p1State.up || dpadUp || stickY < -0.3;
      this.p1State.down = this.p1State.down || dpadDown || stickY > 0.3;

      // Button 0 (A/Cross) = Jump
      this.p1State.jump = this.p1State.jump || gp1.buttons[0]?.pressed || false;
      // Button 2 (X/Square) or R2 = Shoot
      this.p1State.shoot = this.p1State.shoot || gp1.buttons[2]?.pressed || (gp1.buttons[7]?.value > 0.2) || false;
      // Button 1 (B/Circle) = Bomb
      this.p1State.bomb = this.p1State.bomb || gp1.buttons[1]?.pressed || (gp1.buttons[6]?.value > 0.2) || false;
      // Button 3 (Y/Triangle) = Mount
      this.p1State.mount = this.p1State.mount || gp1.buttons[3]?.pressed || false;
      // Button 9 (Start) = Pause
      this.p1State.pause = this.p1State.pause || gp1.buttons[9]?.pressed || false;
    }

    // Gamepad 1 -> Player 2
    const gp2 = gamepads[1];
    if (gp2 && gp2.connected) {
      const stickX = gp2.axes[0] || 0;
      const stickY = gp2.axes[1] || 0;
      const dpadUp = gp2.buttons[12]?.pressed;
      const dpadDown = gp2.buttons[13]?.pressed;
      const dpadLeft = gp2.buttons[14]?.pressed;
      const dpadRight = gp2.buttons[15]?.pressed;

      this.p2State.left = this.p2State.left || dpadLeft || stickX < -0.3;
      this.p2State.right = this.p2State.right || dpadRight || stickX > 0.3;
      this.p2State.up = this.p2State.up || dpadUp || stickY < -0.3;
      this.p2State.down = this.p2State.down || dpadDown || stickY > 0.3;

      this.p2State.jump = this.p2State.jump || gp2.buttons[0]?.pressed || false;
      this.p2State.shoot = this.p2State.shoot || gp2.buttons[2]?.pressed || (gp2.buttons[7]?.value > 0.2) || false;
      this.p2State.bomb = this.p2State.bomb || gp2.buttons[1]?.pressed || false;
      this.p2State.mount = this.p2State.mount || gp2.buttons[3]?.pressed || false;
    }
  }

  public setTouchInput(key: keyof InputState, active: boolean) {
    this.touchState[key] = active;
  }

  public getP1(): InputState {
    return this.p1State;
  }

  public getP2(): InputState {
    return this.p2State;
  }
}

export const inputManager = new InputManager();
