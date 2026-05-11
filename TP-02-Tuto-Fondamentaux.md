# 📅 Jour 2 — Fondamentaux d'Angular

> **Durée** : 1 journée (7h)
> **Objectif** : Maîtriser le binding, les directives, les événements, les services et les observables sur un projet concret : une **TodoList** complète.

---

## 🎯 Ce que tu vas apprendre

- Toutes les formes de data binding
- Les directives `@if`, `@for`, `@switch`
- La nouvelle syntaxe Angular 17+ (control flow)
- Créer et utiliser un service
- Premier contact avec les Observables
- Communication parent ↔ enfant

---

## 📦 Le projet du jour : une TodoList

À la fin de la journée, on aura :
- Une liste de tâches à faire
- Un formulaire pour en ajouter
- Cocher / décocher / supprimer
- Filtrer par statut (toutes / actives / terminées)

---

## ÉTAPE 1 — Setup du projet

```bash
ng new todo-app
cd todo-app
ng serve --open
```

Choix : SCSS / pas de SSR.

Vide `app.component.html` et garde uniquement :

```html
<router-outlet></router-outlet>
```

---

## ÉTAPE 2 — Créer le modèle (Interface TypeScript)

Crée le dossier `src/app/models/` puis le fichier `task.model.ts` :

```typescript
// src/app/models/task.model.ts
export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: Date;
}
```

> 💡 **Pourquoi une interface ?** Pour avoir l'autocomplétion + détecter les bugs avant l'exécution.

---

## ÉTAPE 3 — Créer le service Tasks

```bash
ng g service services/task
```

Cela crée `src/app/services/task.service.ts`. Remplis-le :

```typescript
// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [
    { id: 1, title: 'Apprendre Angular', done: false, createdAt: new Date() },
    { id: 2, title: 'Construire la TodoList', done: false, createdAt: new Date() }
  ];

  private tasksSubject = new BehaviorSubject<Task[]>(this.tasks);

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  addTask(title: string): void {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      done: false,
      createdAt: new Date()
    };
    this.tasks = [...this.tasks, newTask];
    this.tasksSubject.next(this.tasks);
  }

  toggleTask(id: number): void {
    this.tasks = this.tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    this.tasksSubject.next(this.tasks);
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.tasksSubject.next(this.tasks);
  }
}
```

**Décrypte** :

- `BehaviorSubject<Task[]>` : un Observable qui garde la dernière valeur. Quand un composant s'abonne, il reçoit immédiatement l'état courant.
- On expose `tasksSubject.asObservable()` pour que les composants ne puissent pas appeler `.next()` directement (immutabilité).
- À chaque modification → on crée un **nouveau tableau** (pas de mutation) et on appelle `.next()`.

---

## ÉTAPE 4 — Composant TaskItem (carte d'une tâche)

```bash
ng g c components/task-item
```

`task-item.component.ts` :

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss'
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Output() toggle = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  onToggle() {
    this.toggle.emit(this.task.id);
  }

  onDelete() {
    this.delete.emit(this.task.id);
  }
}
```

> 💡 `@Input({ required: true })` (Angular 16+) → erreur de compilation si on oublie de fournir la prop.

`task-item.component.html` :

```html
<div class="task" [class.done]="task.done">
  <input type="checkbox" [checked]="task.done" (change)="onToggle()">
  <span class="title">{{ task.title }}</span>
  <small class="date">{{ task.createdAt | date:'short' }}</small>
  <button class="delete-btn" (click)="onDelete()">🗑️</button>
</div>
```

`task-item.component.scss` :

```scss
.task {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.2s;

  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

  &.done .title {
    text-decoration: line-through;
    color: #999;
  }

  .title { flex: 1; }
  .date  { color: #888; font-size: 12px; }

  .delete-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
    opacity: 0.6;
    &:hover { opacity: 1; }
  }
}
```

---

## ÉTAPE 5 — Composant TaskForm (ajout d'une tâche)

```bash
ng g c components/task-form
```

`task-form.component.ts` :

```typescript
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule],   // ← important pour [(ngModel)]
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  newTitle = '';
  @Output() add = new EventEmitter<string>();

  onSubmit() {
    if (this.newTitle.trim()) {
      this.add.emit(this.newTitle);
      this.newTitle = '';
    }
  }
}
```

`task-form.component.html` :

```html
<form (ngSubmit)="onSubmit()" class="form">
  <input
    type="text"
    [(ngModel)]="newTitle"
    name="title"
    placeholder="Que dois-tu faire ?"
    required>
  <button type="submit">Ajouter</button>
</form>
```

`task-form.component.scss` :

```scss
.form {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;

  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 15px;

    &:focus {
      outline: none;
      border-color: #3f51b5;
    }
  }

  button {
    padding: 0 24px;
    background: #3f51b5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;

    &:hover { background: #303f9f; }
  }
}
```

---

## ÉTAPE 6 — Composant TaskList (liste + filtres)

```bash
ng g c components/task-list
```

`task-list.component.ts` :

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';

type Filter = 'all' | 'active' | 'done';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItemComponent, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
  private taskService = inject(TaskService);

  private filterSubject = new BehaviorSubject<Filter>('all');
  filter$ = this.filterSubject.asObservable();

  // Flux combiné : tâches + filtre
  filteredTasks$: Observable<Task[]> = combineLatest([
    this.taskService.getTasks(),
    this.filter$
  ]).pipe(
    map(([tasks, filter]) => {
      if (filter === 'active') return tasks.filter(t => !t.done);
      if (filter === 'done')   return tasks.filter(t => t.done);
      return tasks;
    })
  );

  setFilter(f: Filter) { this.filterSubject.next(f); }

  onAdd(title: string)    { this.taskService.addTask(title); }
  onToggle(id: number)    { this.taskService.toggleTask(id); }
  onDelete(id: number)    { this.taskService.deleteTask(id); }
}
```

`task-list.component.html` :

```html
<div class="container">
  <h1>📝 Ma TodoList</h1>

  <app-task-form (add)="onAdd($event)"></app-task-form>

  <div class="filters">
    <button (click)="setFilter('all')"    [class.active]="(filter$|async) === 'all'">Toutes</button>
    <button (click)="setFilter('active')" [class.active]="(filter$|async) === 'active'">Actives</button>
    <button (click)="setFilter('done')"   [class.active]="(filter$|async) === 'done'">Terminées</button>
  </div>

  @if (filteredTasks$ | async; as tasks) {
    @if (tasks.length === 0) {
      <p class="empty">Aucune tâche à afficher 🎉</p>
    } @else {
      <ul class="task-list">
        @for (task of tasks; track task.id) {
          <app-task-item
            [task]="task"
            (toggle)="onToggle($event)"
            (delete)="onDelete($event)">
          </app-task-item>
        }
      </ul>
    }
  }
</div>
```

`task-list.component.scss` :

```scss
.container {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;

  h1 {
    text-align: center;
    margin-bottom: 32px;
    color: #333;
  }
}

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  button {
    flex: 1;
    padding: 8px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;

    &.active {
      background: #3f51b5;
      color: white;
      border-color: #3f51b5;
    }
  }
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.empty {
  text-align: center;
  color: #888;
  padding: 32px;
}
```

---

## ÉTAPE 7 — Brancher dans `AppComponent`

`app.component.ts` :

```typescript
import { Component } from '@angular/core';
import { TaskListComponent } from './components/task-list/task-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskListComponent],
  template: `<app-task-list></app-task-list>`
})
export class AppComponent {}
```

✅ **Lance et teste** : `ng serve`. Tu peux ajouter, cocher, supprimer, filtrer.

---

## 🧠 Comprendre ce qu'on a fait

```
┌──────────────────────────────────────────────────────┐
│  AppComponent                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  TaskListComponent (parent)                   │  │
│  │  - injecte TaskService                        │  │
│  │  - gère le filtre (BehaviorSubject)           │  │
│  │  - combineLatest(tasks$, filter$)             │  │
│  │                                               │  │
│  │  ┌──────────────┐    ┌────────────────────┐   │  │
│  │  │ TaskForm     │    │ TaskItem (×N)      │   │  │
│  │  │ @Output add  │    │ @Input task        │   │  │
│  │  │              │    │ @Output toggle     │   │  │
│  │  │              │    │ @Output delete     │   │  │
│  │  └──────────────┘    └────────────────────┘   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                       ↕
              TaskService (singleton)
              - tasks: Task[]
              - tasksSubject: BehaviorSubject
```

**Concepts vus** :

| ✅ | Concept |
|---|---|
| ✓ | Interpolation `{{ }}` |
| ✓ | Property binding `[checked]` |
| ✓ | Event binding `(click)` |
| ✓ | Two-way binding `[(ngModel)]` |
| ✓ | Class binding `[class.done]` |
| ✓ | `@Input` / `@Output` / `EventEmitter` |
| ✓ | `@if` / `@for` / `track` |
| ✓ | Service avec `BehaviorSubject` |
| ✓ | Pipe `async` |
| ✓ | Pipe `date` |
| ✓ | Opérateurs RxJS : `map`, `combineLatest` |
| ✓ | Injection de dépendances avec `inject()` |

---

## 🧠 Quiz de fin de journée

1. Pourquoi utilise-t-on `BehaviorSubject` plutôt que `Subject` dans le service ?
2. Quelle est la différence entre `[value]="x"` et `(input)="..."` ?
3. À quoi sert `track item.id` dans `@for` ?
4. Pourquoi on n'expose pas le `BehaviorSubject` directement ?
5. Que fait le pipe `async` ?

<details>
<summary>👀 Réponses</summary>

1. `BehaviorSubject` garde la dernière valeur émise et la donne immédiatement à tout nouvel abonné. `Subject` ne fait que pousser aux abonnés actuels.
2. `[value]` = property binding (TS → HTML). `(input)` = event binding (HTML → TS).
3. À optimiser le rendu : Angular ne re-rend que les éléments dont l'`id` a changé.
4. Pour empêcher les composants de pousser des valeurs (encapsulation). On expose `.asObservable()` qui est read-only.
5. Il s'abonne à un Observable, fournit la dernière valeur au template, et **se désabonne automatiquement** quand le composant est détruit.

</details>

---

## 📋 Checklist Jour 2

- [ ] Service `TaskService` avec `BehaviorSubject`
- [ ] Composants `TaskForm`, `TaskItem`, `TaskList`
- [ ] Communication parent ↔ enfant via `@Input` / `@Output`
- [ ] Filtres fonctionnels (Toutes / Actives / Terminées)
- [ ] Compris l'utilité du pipe `async`

---

## 🚀 Pour aller plus loin (devoirs)

1. Ajoute un compteur "X tâches restantes" sous la liste.
2. Ajoute un bouton "Effacer les terminées".
3. Persiste les tâches dans `localStorage` (sauvegarde au moindre changement, lecture au démarrage du service).

➡️ **Demain : Jour 3 — Routage, navigation, et premiers appels API.**
