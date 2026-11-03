/**
 * Project Iron Storm - Procedural Arcade Audio Synthesizer
 * Uses Web Audio API for zero-latency, authentic arcade SFX, announcer callouts & dynamic BGM
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.45;
  
  // Music state
  private musicTimer: number | null = null;
  private currentStep: number = 0;
  private isBossMusic: boolean = false;
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);
    } catch {
      // Audio not supported or blocked
    }
  }

  private ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  // Helper: Create White/Pink Noise Buffer
  private createNoiseBuffer(duration = 0.5): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // ---- SOUND EFFECTS ----

  // 1. Pistol shot
  public playPistol() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);

    // Noise pop
    const noise = this.ctx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(0.05);
    if (noiseBuffer) {
      noise.buffer = noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      noise.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t);
    }
  }

  // 2. Heavy Machine Gun
  public playHMG() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.07);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);

    const noise = this.ctx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(0.06);
    if (noiseBuffer) {
      noise.buffer = noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
      noise.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t);
    }
  }

  // 3. Shotgun blast
  public playShotgun() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Sub-bass punch
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.28);
    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.28);

    // Heavy noisy blast
    const noise = this.ctx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(0.35);
    if (noiseBuffer) {
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + 0.35);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.85, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t);
    }

    // Shell clink
    setTimeout(() => {
      this.playCasingClink();
    }, 200);
  }

  // 4. Flamethrower
  public playFlame() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(0.12);
    if (noiseBuffer) {
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, t);
      filter.Q.value = 1.2;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t);
    }
  }

  // 5. Rocket launch & Rocket Explosion
  public playRocketLaunch() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 6. Laser beam
  public playLaser() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.1);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 7. Huge Explosion (Grenades, Tank Cannons, Boss hits)
  public playExplosion(isLarge = false) {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const duration = isLarge ? 0.7 : 0.4;

    // Sub rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isLarge ? 120 : 90, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + duration);

    gain.gain.setValueAtTime(isLarge ? 1.0 : 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);

    // Noise blast
    const noise = this.ctx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(duration);
    if (noiseBuffer) {
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(150, t + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(isLarge ? 0.9 : 0.65, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t);
    }
  }

  // 8. Tank Cannon Shot ("HEAVY SHELL")
  public playTankCannon() {
    this.playExplosion(true);
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    
    // Metallic punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // 9. Casing Clink
  public playCasingClink() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400 + Math.random() * 800, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 10. Player Jump
  public playJump() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // 11. POW Rescued ("THANK YOU!")
  public playPOWRescue() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Happy 3-note arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + idx * 0.07;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });

    // Voice
    this.announceVoice('Thank you!');
  }

  // 12. Item / Medal pickup
  public playPickup() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 13. Player Hurt
  public playPlayerHurt() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.22);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 14. Enemy Grunt / Death
  public playEnemyDeath() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190 + Math.random() * 50, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 15. Mount / Dismount Vehicle
  public playVehicleMount() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Heavy hydraulic hiss & clamp
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    this.announceVoice('OK!');
  }

  // 16. Boss Goliath Roar / Alarm
  public playBossAlarm() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Dual alternating siren frequencies
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + i * 0.22;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 550 : 440, startTime);
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }
  }

  // ---- ARCADE ANNOUNCER VOICE ----
  public announceVoice(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (this.isMuted) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.85; // Deep masculine arcade announcer
      utterance.rate = 1.15; // Fast, punchy delivery
      utterance.volume = this.sfxVolume;

      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google') || v.name.includes('Natural')));
      if (enVoice) {
        utterance.voice = enVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis failed or blocked
    }
  }

  // Weapon Voice Callout
  public announceWeapon(weaponName: string) {
    this.playPickup();
    this.announceVoice(weaponName);
  }

  // ---- PROCEDURAL ARCADE BACKGROUND MUSIC (BGM) ----
  public startMusic(isBoss = false) {
    this.ensureContext();
    this.isBossMusic = isBoss;
    this.isMusicPlaying = true;
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
    }

    const bpm = isBoss ? 150 : 132;
    const interval = (60 / bpm / 4) * 1000; // 16th note interval

    this.musicTimer = window.setInterval(() => {
      this.tickMusicStep();
    }, interval);
  }

  public setBossMusic(isBoss: boolean) {
    if (this.isBossMusic !== isBoss) {
      this.isBossMusic = isBoss;
      if (this.isMusicPlaying) {
        this.startMusic(isBoss);
      }
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private tickMusicStep() {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const step = this.currentStep % 16;
    this.currentStep++;
    const t = this.ctx.currentTime;

    // 1. Kick Drum (on steps 0, 4, 8, 12 + extra on boss)
    const kickSteps = this.isBossMusic ? [0, 3, 6, 8, 11, 14] : [0, 4, 8, 12];
    if (kickSteps.includes(step)) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(130, t);
      kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
      kickGain.gain.setValueAtTime(0.55, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain);
      kickOsc.start(t);
      kickOsc.stop(t + 0.12);
    }

    // 2. Snare Drum (on steps 4, 12)
    if (step === 4 || step === 12) {
      const noise = this.ctx.createBufferSource();
      const buf = this.createNoiseBuffer(0.14);
      if (buf) {
        noise.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        noise.start(t);
      }
    }

    // 3. Hi-Hat (on odd steps)
    if (step % 2 === 1) {
      const noise = this.ctx.createBufferSource();
      const buf = this.createNoiseBuffer(0.03);
      if (buf) {
        noise.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.03);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        noise.start(t);
      }
    }

    // 4. Synth Bassline (Driving 16th notes in D minor / F minor)
    const baseFreq = this.isBossMusic ? 73.42 : 73.42; // D2
    const dMinorScale = [0, 3, 5, 7, 10, 12]; // D, F, G, A, C, D
    const pitchOffset = dMinorScale[(step % 6)];
    const freq = baseFreq * Math.pow(2, pitchOffset / 12);

    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = this.isBossMusic ? 'sawtooth' : 'triangle';
    bassOsc.frequency.setValueAtTime(freq, t);

    const bassDuration = 0.09;
    bassGain.gain.setValueAtTime(0.2, t);
    bassGain.gain.exponentialRampToValueAtTime(0.01, t + bassDuration);

    bassOsc.connect(bassGain);
    bassGain.connect(this.musicGain);
    bassOsc.start(t);
    bassOsc.stop(t + bassDuration);

    // 5. Heroic Lead Arpeggio (on steps 0, 2, 6, 8, 10, 14)
    if ([0, 2, 6, 8, 10, 14].includes(step)) {
      const leadNotes = this.isBossMusic 
        ? [293.66, 349.23, 440.0, 523.25, 587.33] // D4, F4, A4, C5, D5
        : [293.66, 369.99, 440.0, 587.33, 659.25]; // D4, F#4, A4, D5, E5
      const note = leadNotes[(Math.floor(this.currentStep / 2)) % leadNotes.length];

      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'sawtooth';
      leadOsc.frequency.setValueAtTime(note, t);

      leadGain.gain.setValueAtTime(0.14, t);
      leadGain.gain.exponentialRampToValueAtTime(0.005, t + 0.16);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);
      leadOsc.start(t);
      leadOsc.stop(t + 0.16);
    }
  }
}

export const audio = new SoundEngine();
