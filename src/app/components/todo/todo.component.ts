import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss'
})
export class TodoComponent {
  todo = inject(TodoService);
  newTaskTitle = '';
  newPriority: Task['priority'] = 'medium';
  newDeadline = '';
  remindDays = 3;
  showDeadline = false;
  filter = signal<'all' | 'pending' | 'done'>('all');

  get visibleTasks() {
    const f = this.filter();
    if (f === 'pending') return this.todo.pendingForSelectedDay();
    if (f === 'done') return this.todo.completedForSelectedDay();
    return this.todo.tasksForSelectedDay();
  }

  addTask(): void {
    this.todo.addTask(
      this.newTaskTitle,
      this.newPriority,
      undefined,
      this.newDeadline || undefined,
      this.remindDays
    );
    this.newTaskTitle = '';
    this.newPriority = 'medium';
    this.newDeadline = '';
    this.remindDays = 3;
    this.showDeadline = false;
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.addTask();
  }

  priorityIcon(p: Task['priority']): string {
    if (p === 'high') return 'bi-flag-fill';
    if (p === 'medium') return 'bi-flag';
    return 'bi-flag';
  }

  priorityClass(p: Task['priority']): string {
    return `priority-${p}`;
  }

  daysUntil(deadline?: string): string {
    if (!deadline) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dl = new Date(deadline + 'T00:00:00');
    const days = Math.round((dl.getTime() - today.getTime()) / 86400000);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days}d left`;
  }
}
