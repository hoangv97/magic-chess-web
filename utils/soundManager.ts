
import { GameSettings } from '../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  private initialized: boolean = false;
  private volume: number = 0.5;
  private enabled: boolean = true;
  
  // Music State
  private isMusicPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private musicSchedulerId: number | null = null;
  
  // Scales for ambient music (Pentatonic Minor)
  private scale = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25]; // C4, Eb4, F4, G4, Bb4, C5

  constructor() {}

  public init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.connect(this.ctx.destination);
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      
      // Base mix
      this.musicGain.gain.value = 0.3; 
      this.sfxGain.gain.value = 0.7;

      this.updateVolume();
      this.initialized = true;
    } catch (e) {
      console.error("Audio init failed", e);
    }
  }

  public updateSettings(settings: GameSettings) {
    this.volume = settings.soundVolume;
    this.enabled = settings.soundEnabled;
    
    // Resume context if it was suspended
    if (this.enabled && this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
    }

    this.updateVolume();

    if (this.enabled) {
        if (!this.isMusicPlaying) this.startMusic();
    } else {
        this.stopMusic();
    }
  }

  private updateVolume() {
    if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(this.enabled ? this.volume : 0, this.ctx?.currentTime || 0, 0.1);
    }
  }

  // --- Sound Effects ---

  public playSfx(type: 'move' | 'capture' | 'spawn' | 'draw' | 'buy' | 'win' | 'loss' | 'click' | 'frozen') {
    if (!this.enabled || !this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.sfxGain);

    switch (type) {
        case 'move':
            // Short pluck
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
            osc.start(t);
            osc.stop(t + 0.15);
            break;
        case 'capture':
            // Noise burst + low impact
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(t);
            osc.stop(t + 0.2);
            break;
        case 'spawn':
            // Magical sweep up
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.linearRampToValueAtTime(600, t + 0.3);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
            break;
        case 'draw':
            // High frequency quick noise-like
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.linearRampToValueAtTime(1200, t + 0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
            break;
        case 'buy':
            // Coin sound (two dings)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
            
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(this.sfxGain);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1600, t + 0.1);
            gain2.gain.setValueAtTime(0.1, t + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc2.start(t + 0.1);
            osc2.stop(t + 0.3);
            break;
        case 'click':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            osc.start(t);
            osc.stop(t + 0.05);
            break;
        case 'win':
            this.playChord([261.63, 329.63, 392.00, 523.25], t, 1.5); // C Major
            break;
        case 'loss':
             this.playChord([261.63, 311.13, 369.99, 246.94], t, 1.5); // Diminishedish
            break;
        case 'frozen':
             osc.type = 'square';
             osc.frequency.setValueAtTime(800, t);
             gain.gain.setValueAtTime(0.05, t);
             gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
             gain.gain.linearRampToValueAtTime(0, t + 0.1);
             osc.start(t);
             osc.stop(t + 0.1);
             break;
    }
  }

  private playChord(freqs: number[], startTime: number, duration: number) {
      if (!this.ctx || !this.sfxGain) return;
      freqs.forEach((f, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.connect(gain);
          gain.connect(this.sfxGain!);
          
          osc.type = 'triangle';
          osc.frequency.value = f;
          
          const start = startTime + (i * 0.05);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.1, start + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
          
          osc.start(start);
          osc.stop(start + duration);
      });
  }

  // --- Music Generation (Procedural Ambient) ---

  public startMusic() {
      if (this.isMusicPlaying || !this.ctx) return;
      this.isMusicPlaying = true;
      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this.scheduleMusic();
  }

  public stopMusic() {
      this.isMusicPlaying = false;
      if (this.musicSchedulerId) {
          window.clearTimeout(this.musicSchedulerId);
          this.musicSchedulerId = null;
      }
  }

  private scheduleMusic() {
      if (!this.enabled || !this.isMusicPlaying || !this.ctx) return;

      const secondsPerBeat = 2; // Very slow ambient
      const scheduleAheadTime = 0.5;

      while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
          this.playAmbientNote(this.nextNoteTime);
          this.nextNoteTime += secondsPerBeat + (Math.random() * 1); // Randomize timing slightly
      }

      this.musicSchedulerId = window.setTimeout(() => this.scheduleMusic(), 1000);
  }

  private playAmbientNote(time: number) {
      if (!this.ctx || !this.musicGain) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Filter for ambient feel
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400 + Math.random() * 400;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      // Random note from pentatonic scale
      const note = this.scale[Math.floor(Math.random() * this.scale.length)] * (Math.random() > 0.5 ? 0.5 : 1);
      osc.frequency.value = note;
      osc.type = 'sine';

      // Long attack and release
      const attack = 1 + Math.random();
      const release = 3 + Math.random();
      const duration = attack + release;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.start(time);
      osc.stop(time + duration);
  }
}

export const soundManager = new SoundManager();
