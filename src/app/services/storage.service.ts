import { Injectable } from '@angular/core';
import { Task, TimerSettings, SessionStats } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TASKS_KEY = 'studyflow_tasks';
  private readonly SETTINGS_KEY = 'studyflow_settings';
  private readonly STATS_KEY = 'studyflow_stats';
  private readonly AMBIENCE_KEY = 'studyflow_ambience';

  getTasks(): Task[] {
    try {
      const raw = localStorage.getItem(this.TASKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  getSettings(): TimerSettings {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4
    };
  }

  saveSettings(settings: TimerSettings): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  getStats(): SessionStats[] {
    try {
      const raw = localStorage.getItem(this.STATS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveStats(stats: SessionStats[]): void {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  getAmbience(): string {
    return localStorage.getItem(this.AMBIENCE_KEY) || 'none';
  }

  saveAmbience(type: string): void {
    localStorage.setItem(this.AMBIENCE_KEY, type);
  }
}
