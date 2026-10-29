import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="brand">
        <div class="logo">
          <i class="bi bi-journal-richtext"></i>
        </div>
        <div>
          <h1>StudyFlow</h1>
          <p class="tagline">Focus · Plan · Flow</p>
        </div>
      </div>
      <div class="header-right">
        <span class="status-dot"></span>
        <span class="status-text">Local · No account needed</span>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.35rem 0 1.75rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .logo {
      width: 50px;
      height: 50px;
      border-radius: 15px;
      background: linear-gradient(145deg, #588157, #3a5a40);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.45rem;
      box-shadow: 0 4px 16px rgba(88, 129, 87, 0.35);
    }

    h1 {
      margin: 0;
      font-size: 1.55rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text);
    }

    .tagline {
      margin: 0.1rem 0 0;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #588157;
      box-shadow: 0 0 0 3px rgba(88, 129, 87, 0.2);
    }

    @media (max-width: 480px) {
      .status-text { display: none; }
    }
  `]
})
export class HeaderComponent {}
