export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
  date: string;           // YYYY-MM-DD — day the task is planned for
  deadline?: string;      // YYYY-MM-DD — optional hard deadline
  remindDaysBefore?: number; // e.g. 3 → notify 3 days, 2 days, 1 day before
  category?: string;
}

export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface SessionStats {
  date: string;
  focusMinutes: number;
  sessionsCompleted: number;
  tasksCompleted: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string;       // when it was created
  read: boolean;
  type: 'deadline' | 'timer' | 'reminder';
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type AmbienceType = 'none' | 'rain' | 'lofi' | 'forest';
