import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimerService } from '../../services/timer.service';
import { TimerMode } from '../../models/task.model';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {
  timer = inject(TimerService);

  modes: { key: TimerMode; label: string; icon: string }[] = [
    { key: 'focus', label: 'Focus', icon: 'bi-bullseye' },
    { key: 'shortBreak', label: 'Short Break', icon: 'bi-cup-hot' },
    { key: 'longBreak', label: 'Long Break', icon: 'bi-tree' }
  ];

  showSettings = false;

  selectMode(mode: TimerMode): void {
    this.timer.switchMode(mode);
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  updateFocus(val: number): void {
    this.timer.updateSettings({ focusMinutes: Math.max(1, Math.min(90, val)) });
  }

  updateShort(val: number): void {
    this.timer.updateSettings({ shortBreakMinutes: Math.max(1, Math.min(30, val)) });
  }

  updateLong(val: number): void {
    this.timer.updateSettings({ longBreakMinutes: Math.max(5, Math.min(60, val)) });
  }
}
