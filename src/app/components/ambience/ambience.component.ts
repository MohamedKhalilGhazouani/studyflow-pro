import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { AmbienceType } from '../../models/task.model';

interface SoundOption {
  id: AmbienceType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-ambience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ambience.component.html',
  styleUrl: './ambience.component.scss'
})
export class AmbienceComponent implements OnDestroy {
  private storage = inject(StorageService);
  private audioCtx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private sources: (AudioBufferSourceNode | OscillatorNode)[] = [];
  private gainNode: GainNode | null = null;

  active = signal<AmbienceType>((this.storage.getAmbience() as AmbienceType) || 'none');
  volume = signal(0.4);
  isPlaying = signal(false);

  options: SoundOption[] = [
    { id: 'none', label: 'Silent', icon: 'bi-volume-mute' },
    { id: 'rain', label: 'Rain', icon: 'bi-cloud-rain-heavy' },
    { id: 'lofi', label: 'Soft Pad', icon: 'bi-music-note-beamed' },
    { id: 'forest', label: 'Forest', icon: 'bi-tree-fill' }
  ];

  select(type: AmbienceType): void {
    if (type === this.active() && type !== 'none') {
      this.togglePlay();
      return;
    }
    this.stop();
    this.active.set(type);
    this.storage.saveAmbience(type);
    if (type !== 'none') {
      this.startSound(type);
    }
  }

  private async ensureContext(): Promise<AudioContext> {
    if (!this.audioCtx) this.audioCtx = new AudioContext();
    if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
    return this.audioCtx;
  }

  private async startSound(type: AmbienceType): Promise<void> {
    try {
      const ctx = await this.ensureContext();
      this.gainNode = ctx.createGain();
      this.gainNode.gain.value = this.volume();
      this.gainNode.connect(ctx.destination);

      if (type === 'rain') {
        await this.createRain(ctx);
      } else if (type === 'forest') {
        await this.createForest(ctx);
      } else if (type === 'lofi') {
        this.createPad(ctx);
      }

      this.isPlaying.set(true);
    } catch (e) {
      console.warn('Audio failed', e);
      this.isPlaying.set(false);
    }
  }

  /** Improved rain: layered filtered noise + occasional drops */
  private async createRain(ctx: AudioContext): Promise<void> {
    // Layer 1 – continuous rain body
    const buf = this.makeNoiseBuffer(ctx, 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.6;

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 200;

    src.connect(filter2);
    filter2.connect(filter);
    filter.connect(this.gainNode!);
    src.start();
    this.sources.push(src);

    // Layer 2 – higher frequency "hiss" for realism
    const buf2 = this.makeNoiseBuffer(ctx, 2);
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2;
    src2.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 2800;
    hp.Q.value = 0.4;

    const g2 = ctx.createGain();
    g2.gain.value = 0.25;

    src2.connect(hp);
    hp.connect(g2);
    g2.connect(this.gainNode!);
    src2.start();
    this.sources.push(src2);
  }

  /** Forest: soft wind + occasional bird-like tones */
  private async createForest(ctx: AudioContext): Promise<void> {
    // Soft wind noise
    const buf = this.makeNoiseBuffer(ctx, 4);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.5;

    const g = ctx.createGain();
    g.gain.value = 0.5;

    src.connect(filter);
    filter.connect(g);
    g.connect(this.gainNode!);
    src.start();
    this.sources.push(src);

    // Very soft low drone (trees / distance)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55;
    const og = ctx.createGain();
    og.gain.value = 0.04;
    osc.connect(og);
    og.connect(this.gainNode!);
    osc.start();
    this.sources.push(osc);

    // Occasional soft "bird" chirps via short oscillators
    const chirp = () => {
      if (!this.isPlaying() || this.active() !== 'forest') return;
      try {
        const o = ctx.createOscillator();
        const cg = ctx.createGain();
        o.type = 'sine';
        const base = 1800 + Math.random() * 1200;
        o.frequency.setValueAtTime(base, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(base * 1.3, ctx.currentTime + 0.08);
        cg.gain.setValueAtTime(0, ctx.currentTime);
        cg.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.02);
        cg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        o.connect(cg);
        cg.connect(this.gainNode!);
        o.start();
        o.stop(ctx.currentTime + 0.18);
      } catch {}
      setTimeout(chirp, 3000 + Math.random() * 7000);
    };
    setTimeout(chirp, 2000);
  }

  private createPad(ctx: AudioContext): void {
    const freqs = [110, 164.81, 220];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;

      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.02;
      lfoG.gain.value = 3;
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);

      const g = ctx.createGain();
      g.gain.value = 0.08;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.gainNode!);
      osc.start();
      lfo.start();
      this.sources.push(osc, lfo);
    });
  }

  private makeNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = seconds * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      // pink-ish
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    return buffer;
  }

  togglePlay(): void {
    if (this.active() === 'none') return;
    if (this.isPlaying()) {
      this.stop();
    } else {
      this.startSound(this.active());
    }
  }

  setVolume(val: number): void {
    this.volume.set(val);
    if (this.gainNode) this.gainNode.gain.value = val;
  }

  private stop(): void {
    for (const s of this.sources) {
      try { s.stop(); } catch {}
    }
    this.sources = [];
    this.nodes = [];
    this.gainNode = null;
    this.isPlaying.set(false);
  }

  ngOnDestroy(): void {
    this.stop();
    if (this.audioCtx) this.audioCtx.close();
  }
}
