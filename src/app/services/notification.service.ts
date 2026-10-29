import { Injectable, signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { AppNotification, Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private storage = inject(StorageService);
  private readonly KEY = 'studyflow_notifications';

  /** In-app toast currently visible */
  toast = signal<{ title: string; body: string; type: string } | null>(null);

  /** Stored notification history */
  notifications = signal<AppNotification[]>(this.load());

  private load(): AppNotification[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(this.KEY, JSON.stringify(this.notifications()));
  }

  /** Request browser permission once */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  /** Show both in-app toast + browser notification */
  notify(title: string, body: string, type: AppNotification['type'] = 'timer'): void {
    // In-app toast
    this.toast.set({ title, body, type });
    setTimeout(() => this.toast.set(null), 5000);

    // Persist
    const n: AppNotification = {
      id: crypto.randomUUID(),
      title,
      body,
      date: new Date().toISOString(),
      read: false,
      type
    };
    this.notifications.update(list => {
      const updated = [n, ...list].slice(0, 50);
      localStorage.setItem(this.KEY, JSON.stringify(updated));
      return updated;
    });

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: type + '-' + Date.now()
        });
      } catch {}
    }
  }

  dismissToast(): void {
    this.toast.set(null);
  }

  markAllRead(): void {
    this.notifications.update(list => {
      const updated = list.map(n => ({ ...n, read: true }));
      localStorage.setItem(this.KEY, JSON.stringify(updated));
      return updated;
    });
  }

  /** Check tasks for upcoming deadlines and fire reminders */
  checkDeadlineReminders(tasks: Task[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      if (task.completed || !task.deadline) continue;

      const deadline = new Date(task.deadline + 'T00:00:00');
      const diffMs = deadline.getTime() - today.getTime();
      const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const remindBefore = task.remindDaysBefore ?? 3;

      // Notify on remindBefore, remindBefore-1, ... 1 day before, and on the day
      if (daysLeft >= 0 && daysLeft <= remindBefore) {
        const alreadySentToday = this.notifications().some(
          n =>
            n.type === 'deadline' &&
            n.body.includes(task.title) &&
            n.date.slice(0, 10) === today.toISOString().slice(0, 10)
        );
        if (alreadySentToday) continue;

        let msg = '';
        if (daysLeft === 0) {
          msg = `⚠️ Deadline TODAY: "${task.title}"`;
        } else if (daysLeft === 1) {
          msg = `⏰ Tomorrow is the deadline for "${task.title}"`;
        } else {
          msg = `📅 ${daysLeft} days left for "${task.title}" (deadline: ${task.deadline})`;
        }
        this.notify('StudyFlow Reminder', msg, 'deadline');
      }
    }
  }
}
