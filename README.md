# StudyFlow ☕✨

A calm, minimalist productivity web app for students.

## Features

- **Focus Timer** — Pomodoro-style (25/5/15) with circular progress, session tracking
- **Smart Tasks** — Priority levels, filters, local persistence
- **Ambient Sounds** — Rain, Lo-Fi, Forest to stay in the zone
- **Daily Stats** — Focus minutes, completed sessions & tasks
- **100% Local** — Everything stored in `localStorage`. No accounts, no backend.

## Design

- Palette: Sage Green `#588157`, Cream `#dad7cd`, soft neutrals
- Typography: Inter
- Fully responsive

## Tech Stack

- Angular 19 (Standalone components + Signals)
- Bootstrap Icons
- SCSS
- TypeScript

## Quick Start

```bash
cd studyflow
npm install
npm start
```

Open http://localhost:4200

## Project Structure

```
src/app/
├── components/
│   ├── timer/       # Pomodoro timer
│   ├── todo/        # Task list
│   ├── ambience/    # Ambient sound player
│   ├── stats/       # Daily stats cards
│   └── header/      # App header
├── services/        # Timer, Todo, Storage
└── models/          # TypeScript interfaces
```
