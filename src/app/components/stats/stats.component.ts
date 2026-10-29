import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { TimerService } from '../../services/timer.service';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon focus"><i class="bi bi-bullseye"></i></div>
        <div>
          <div class="stat-value">{{ focusMinutes() }}</div>
          <div class="stat-label">Focus min today</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sessions"><i class="bi bi-lightning-charge-fill"></i></div>
        <div>
          <div class="stat-value">{{ sessions() }}</div>
          <div class="stat-label">Sessions</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon tasks"><i class="bi bi-check2-all"></i></div>
        <div>
          <div class="stat-value">{{ tasksDone() }}</div>
          <div class="stat-label">Tasks done</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 1.1rem 1.25rem;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;

      &.focus { background: rgba(88, 129, 87, 0.14); color: #588157; }
      &.sessions { background: rgba(233, 196, 106, 0.22); color: #c9a227; }
      &.tasks { background: rgba(42, 157, 143, 0.14); color: #2a9d8f; }
    }

    .stat-value {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1.1;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr; }
    }
  `]
})
export class StatsComponent {
  private storage = inject(StorageService);
  private timer = inject(TimerService);
  private todo = inject(TodoService);

  focusMinutes = computed(() => this.timer.totalFocusToday());
  sessions = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    const s = this.storage.getStats().find(x => x.date === today);
    return s?.sessionsCompleted ?? 0;
  });
  tasksDone = computed(() => this.todo.completedCount());
}
