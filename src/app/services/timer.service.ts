import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { TimerMode, TimerSettings } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private storage = inject(StorageService);
  private notif = inject(NotificationService);

  settings = signal<TimerSettings>(this.storage.getSettings());
  mode = signal<TimerMode>('focus');
  remainingSeconds = signal(this.settings().focusMinutes * 60);
  isRunning = signal(false);
  completedSessions = signal(0);

  /** Flash effect when session ends */
  sessionJustEnded = signal(false);

  private intervalId: any = null;
  private startTimestamp = 0;
  private initialSeconds = 0;

  totalFocusToday = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    const stats = this.storage.getStats();
    const todayStat = stats.find(s => s.date === today);
    return todayStat?.focusMinutes ?? 0;
  });

  /** Focus minutes for a specific date (for calendar history) */
  focusForDate(date: string): number {
    const stats = this.storage.getStats();
    return stats.find(s => s.date === date)?.focusMinutes ?? 0;
  }

  sessionsForDate(date: string): number {
    const stats = this.storage.getStats();
    return stats.find(s => s.date === date)?.sessionsCompleted ?? 0;
  }

  progress = computed(() => {
    const total = this.getTotalForMode();
    if (total === 0) return 0;
    return ((total - this.remainingSeconds()) / total) * 100;
  });

  displayTime = computed(() => {
    const s = this.remainingSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  });

  constructor() {
    effect(() => {
      this.storage.saveSettings(this.settings());
    });
  }

  private getTotalForMode(): number {
    const s = this.settings();
    switch (this.mode()) {
      case 'focus': return s.focusMinutes * 60;
      case 'shortBreak': return s.shortBreakMinutes * 60;
      case 'longBreak': return s.longBreakMinutes * 60;
    }
  }

  start(): void {
    if (this.isRunning()) return;
    this.isRunning.set(true);
    this.sessionJustEnded.set(false);
    this.startTimestamp = Date.now();
    this.initialSeconds = this.remainingSeconds();

    this.intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTimestamp) / 1000);
      const left = Math.max(0, this.initialSeconds - elapsed);
      this.remainingSeconds.set(left);

      if (left === 0) {
        this.completeSession();
      }
    }, 200);
  }

  pause(): void {
    if (!this.isRunning()) return;
    this.isRunning.set(false);
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(): void {
    this.pause();
    this.sessionJustEnded.set(false);
    this.remainingSeconds.set(this.getTotalForMode());
  }

  switchMode(mode: TimerMode): void {
    this.pause();
    this.sessionJustEnded.set(false);
    this.mode.set(mode);
    this.remainingSeconds.set(this.getTotalForMode());
  }

  private completeSession(): void {
    this.pause();
    this.sessionJustEnded.set(true);

    const wasFocus = this.mode() === 'focus';

    // Strong multi-tone chime
    this.playEndChime();

    if (wasFocus) {
      const sessions = this.completedSessions() + 1;
      this.completedSessions.set(sessions);
      this.recordFocusSession();

      const settings = this.settings();
      const nextIsLong = sessions % settings.sessionsBeforeLongBreak === 0;

      this.notif.notify(
        '🎯 Focus session complete!',
        nextIsLong
          ? `Great work! Time for a long break (${settings.longBreakMinutes} min).`
          : `Well done! Take a short break (${settings.shortBreakMinutes} min).`,
        'timer'
      );

      this.switchMode(nextIsLong ? 'longBreak' : 'shortBreak');
    } else {
      this.notif.notify(
        '☕ Break is over!',
        'Time to get back to studying. Start your next focus session.',
        'timer'
      );
      this.switchMode('focus');
    }

    // Clear the flash after a few seconds
    setTimeout(() => this.sessionJustEnded.set(false), 4000);
  }

  private recordFocusSession(): void {
    const today = new Date().toISOString().slice(0, 10);
    const stats = this.storage.getStats();
    const idx = stats.findIndex(s => s.date === today);
    const minutes = this.settings().focusMinutes;

    if (idx >= 0) {
      stats[idx].focusMinutes += minutes;
      stats[idx].sessionsCompleted += 1;
    } else {
      stats.push({
        date: today,
        focusMinutes: minutes,
        sessionsCompleted: 1,
        tasksCompleted: 0
      });
    }
    this.storage.saveStats(stats);
  }

  /** Richer multi-note end chime */
  private playEndChime(): void {
    try {
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.55);
      });
    } catch {}
  }

  updateSettings(partial: Partial<TimerSettings>): void {
    this.settings.update(s => ({ ...s, ...partial }));
    if (!this.isRunning()) {
      this.remainingSeconds.set(this.getTotalForMode());
    }
  }
}
