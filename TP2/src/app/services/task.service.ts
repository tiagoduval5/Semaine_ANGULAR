import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Task } from '../models/task.model';

const STORAGE_KEY = 'tp2-todolist-tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[];
  private tasksSubject: BehaviorSubject<Task[]>;

  constructor() {
    const loaded = this.readFromStorage();
    this.tasks = loaded !== null ? loaded : this.defaultTasks();
    this.tasksSubject = new BehaviorSubject<Task[]>(this.tasks);
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  /** Nombre de tâches encore à faire (pour affichage simple). */
  getRemainingCount(): Observable<number> {
    return this.getTasks().pipe(map((tasks) => tasks.filter((t) => !t.done).length));
  }

  addTask(title: string): void {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      done: false,
      createdAt: new Date(),
    };
    this.tasks = [...this.tasks, newTask];
    this.push();
  }

  toggleTask(id: number): void {
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    this.push();
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.push();
  }

  clearCompleted(): void {
    this.tasks = this.tasks.filter((t) => !t.done);
    this.push();
  }

  private defaultTasks(): Task[] {
    return [
      { id: 1, title: 'Apprendre Angular', done: false, createdAt: new Date() },
      { id: 2, title: 'Construire la TodoList', done: false, createdAt: new Date() },
    ];
  }

  private readFromStorage(): Task[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return null;
      const data = JSON.parse(raw) as Array<{ id: number; title: string; done: boolean; createdAt: string }>;
      if (!Array.isArray(data)) return null;
      return data.map((row) => ({
        id: row.id,
        title: row.title,
        done: !!row.done,
        createdAt: new Date(row.createdAt),
      }));
    } catch {
      return null;
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
  }

  private push(): void {
    this.tasksSubject.next(this.tasks);
    this.persist();
  }
}
