import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskItemComponent } from '../task-item/task-item';
import { TaskFormComponent } from '../task-form/task-form';

type Filter = 'all' | 'active' | 'done';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [AsyncPipe, TaskItemComponent, TaskFormComponent],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskListComponent {
  private taskService = inject(TaskService);

  private filterSubject = new BehaviorSubject<Filter>('all');
  filter$ = this.filterSubject.asObservable();

  filteredTasks$: Observable<Task[]> = combineLatest([
    this.taskService.getTasks(),
    this.filter$,
  ]).pipe(
    map(([tasks, filter]) => {
      if (filter === 'active') return tasks.filter((t) => !t.done);
      if (filter === 'done') return tasks.filter((t) => t.done);
      return tasks;
    }),
  );

  setFilter(f: Filter): void {
    this.filterSubject.next(f);
  }

  onAdd(title: string): void {
    this.taskService.addTask(title);
  }

  onToggle(id: number): void {
    this.taskService.toggleTask(id);
  }

  onDelete(id: number): void {
    this.taskService.deleteTask(id);
  }
}
