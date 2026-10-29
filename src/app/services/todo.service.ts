import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private storage = inject(StorageService);
  private notif = inject(NotificationService);
  private tasks = signal<Task[]>(this.normalizeTasks(this.storage.getTasks()));

  selectedDate = signal<string>(this.today());

  allTasks = this.tasks.asReadonly();

  tasksForSelectedDay = computed(() =>
    this.tasks()
      .filter(t => t.date === this.selectedDate())
      .sort((a, b) => Number(a.completed) - Number(b.completed))
  );

  pendingForSelectedDay = computed(() =>
    this.tasksForSelectedDay().filter(t => !t.completed)
  );

  completedForSelectedDay = computed(() =>
    this.tasksForSelectedDay().filter(t => t.completed)
  );

  pendingCount = computed(() => this.pendingForSelectedDay().length);
  completedCount = computed(() => this.completedForSelectedDay().length);

  taskCountByDate = computed(() => {
    const map = new Map<string, { total: number; done: number }>();
    for (const t of this.tasks()) {
      const entry = map.get(t.date) ?? { total: 0, done: 0 };
      entry.total++;
      if (t.completed) entry.done++;
      map.set(t.date, entry);
    }
    return map;
  });

  /** Tasks that have a deadline approaching (for badge) */
  upcomingDeadlines = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.tasks()
      .filter(t => !t.completed && t.deadline)
      .map(t => {
        const dl = new Date(t.deadline! + 'T00:00:00');
        const daysLeft = Math.round((dl.getTime() - today.getTime()) / 86400000);
        return { task: t, daysLeft };
      })
      .filter(x => x.daysLeft >= 0 && x.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  });

  constructor() {
    // Check deadlines on startup
    setTimeout(() => {
      this.notif.checkDeadlineReminders(this.tasks());
      this.notif.requestPermission();
    }, 1500);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private normalizeTasks(raw: any[]): Task[] {
    return (raw || []).map(t => ({
      ...t,
      date: t.date || this.today(),
      priority: t.priority || 'medium',
      deadline: t.deadline || undefined,
      remindDaysBefore: t.remindDaysBefore ?? 3
    }));
  }

  selectDate(date: string): void {
    this.selectedDate.set(date);
  }

  addTask(
    title: string,
    priority: Task['priority'] = 'medium',
    date?: string,
    deadline?: string,
    remindDaysBefore: number = 3
  ): void {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
      priority,
      date: date || this.selectedDate(),
      deadline: deadline || undefined,
      remindDaysBefore
    };

    this.tasks.update(list => {
      const updated = [newTask, ...list];
      this.storage.saveTasks(updated);
      return updated;
    });
  }

  toggleTask(id: string): void {
    this.tasks.update(list => {
      const updated = list.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      this.storage.saveTasks(updated);

      const task = list.find(t => t.id === id);
      if (task && !task.completed) {
        this.incrementTasksCompleted();
      }
      return updated;
    });
  }

  deleteTask(id: string): void {
    this.tasks.update(list => {
      const updated = list.filter(t => t.id !== id);
      this.storage.saveTasks(updated);
      return updated;
    });
  }

  clearCompleted(): void {
    const day = this.selectedDate();
    this.tasks.update(list => {
      const updated = list.filter(t => !(t.completed && t.date === day));
      this.storage.saveTasks(updated);
      return updated;
    });
  }

  private incrementTasksCompleted(): void {
    const today = this.today();
    const stats = this.storage.getStats();
    const idx = stats.findIndex(s => s.date === today);
    if (idx >= 0) {
      stats[idx].tasksCompleted += 1;
    } else {
      stats.push({
        date: today,
        focusMinutes: 0,
        sessionsCompleted: 0,
        tasksCompleted: 1
      });
    }
    this.storage.saveStats(stats);
  }
}
