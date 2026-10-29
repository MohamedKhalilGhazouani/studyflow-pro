import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { TimerComponent } from './components/timer/timer.component';
import { TodoComponent } from './components/todo/todo.component';
import { AmbienceComponent } from './components/ambience/ambience.component';
import { StatsComponent } from './components/stats/stats.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    TimerComponent,
    TodoComponent,
    AmbienceComponent,
    StatsComponent,
    CalendarComponent
  ],
  template: `
    <div class="app-shell">
      <div class="container">
        <app-header />
        <app-stats />

        <div class="main-grid">
          <div class="left-col">
            <app-timer />
            <app-ambience />
          </div>
          <div class="right-col">
            <app-calendar />
            <app-todo />
          </div>
        </div>

        <footer class="app-footer">
          <p>StudyFlow · Focus · Plan · Flow · Data stays on your device</p>
        </footer>
      </div>

      <!-- Toast notification -->
      @if (notif.toast(); as t) {
        <div class="toast" [class]="'toast-' + t.type" (click)="notif.dismissToast()">
          <div class="toast-icon">
            @switch (t.type) {
              @case ('timer') { <i class="bi bi-alarm-fill"></i> }
              @case ('deadline') { <i class="bi bi-calendar-event-fill"></i> }
              @default { <i class="bi bi-bell-fill"></i> }
            }
          </div>
          <div class="toast-body">
            <strong>{{ t.title }}</strong>
            <span>{{ t.body }}</span>
          </div>
          <button class="toast-close"><i class="bi bi-x"></i></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      position: relative;
    }

    .container {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 1.25rem 2.5rem;
    }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .left-col, .right-col {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .app-footer {
      margin-top: 2.5rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      opacity: 0.7;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      max-width: 360px;
      background: var(--card-bg);
      border-radius: 14px;
      padding: 1rem 1.15rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border: 1px solid var(--border);
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      z-index: 9999;
      animation: slideIn 0.3s ease;
      cursor: pointer;
    }

    .toast-timer { border-left: 4px solid var(--primary); }
    .toast-deadline { border-left: 4px solid #e76f51; }
    .toast-reminder { border-left: 4px solid #e9c46a; }

    .toast-icon {
      font-size: 1.3rem;
      color: var(--primary);
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .toast-deadline .toast-icon { color: #e76f51; }

    .toast-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      strong { font-size: 0.9rem; color: var(--text); }
      span { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
      font-size: 1.1rem;
    }

    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 860px) {
      .main-grid { grid-template-columns: 1fr; }
      .toast { left: 1rem; right: 1rem; max-width: none; }
    }
  `]
})
export class AppComponent implements OnInit {
  notif = inject(NotificationService);

  ngOnInit(): void {
    this.notif.requestPermission();
  }
}
