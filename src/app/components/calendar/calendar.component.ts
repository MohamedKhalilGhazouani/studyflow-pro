import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  todo = inject(TodoService);
  timer = inject(TimerService);

  viewDate = signal(new Date());
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  monthLabel = computed(() => {
    const d = this.viewDate();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  days = computed(() => {
    const view = this.viewDate();
    const year = view.getFullYear();
    const month = view.getMonth();

    const first = new Date(year, month, 1);
    let startOffset = first.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const cells: { date: string; day: number; inMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];
    const todayStr = new Date().toISOString().slice(0, 10);
    const selected = this.todo.selectedDate();
    const start = new Date(year, month, 1 - startOffset);

    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      cells.push({
        date: dateStr,
        day: d.getDate(),
        inMonth: d.getMonth() === month,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selected
      });
    }
    return cells;
  });

  /** Stats for the currently selected day */
  selectedDayStats = computed(() => {
    const date = this.todo.selectedDate();
    return {
      focusMin: this.timer.focusForDate(date),
      sessions: this.timer.sessionsForDate(date),
      tasks: this.todo.taskCountByDate().get(date) ?? { total: 0, done: 0 }
    };
  });

  prevMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.viewDate.set(d);
  }

  nextMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.viewDate.set(d);
  }

  goToday(): void {
    const today = new Date();
    this.viewDate.set(today);
    this.todo.selectDate(today.toISOString().slice(0, 10));
  }

  select(date: string): void {
    this.todo.selectDate(date);
  }

  countFor(date: string): { total: number; done: number } {
    return this.todo.taskCountByDate().get(date) ?? { total: 0, done: 0 };
  }

  dotsFor(date: string): boolean[] {
    const c = this.countFor(date);
    const n = Math.min(c.total, 3);
    const arr: boolean[] = [];
    for (let i = 0; i < n; i++) arr.push(i < c.done);
    return arr;
  }
}
