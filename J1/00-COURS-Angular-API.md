# Angular et communication vers une API

> **Module IPSSI** — 4 jours • Bachelor / Bac+3 / Bac+4
> **Formateur** : InfoSoftware
> **Version Angular** : 18+ (standalone components, control flow `@if` / `@for`)

---

## Sommaire

1. [Introduction à Angular](#1-introduction-à-angular)
2. [Les fondamentaux](#2-les-fondamentaux)
3. [Routage, navigation et états](#3-routage-navigation-et-états)
4. [Communication avec une API](#4-communication-avec-une-api)
5. [Optimisation et bonnes pratiques](#5-optimisation-et-bonnes-pratiques)
6. [Glossaire](#glossaire)

---

## 1. Introduction à Angular

### 1.1 Qu'est-ce qu'Angular ?

Angular est un **framework frontend** maintenu par Google, écrit en **TypeScript**. Il permet de construire des **Single Page Applications (SPA)** : une seule page HTML chargée, et tout le reste (navigation, données) géré côté client en JavaScript.

> ⚠️ Ne pas confondre avec **AngularJS** (version 1.x, abandonnée). Aujourd'hui on parle d'Angular tout court (v2 → v18+).

### 1.2 Pourquoi choisir Angular ?

| Avantage | Détail |
|---|---|
| **Framework complet** | Routing, formulaires, HTTP, tests, i18n inclus — pas besoin de chercher 15 librairies |
| **TypeScript natif** | Typage fort = moins de bugs en production |
| **Architecture composants** | Code modulaire, réutilisable, maintenable |
| **Injection de dépendances** | Découplage, testabilité |
| **Communauté entreprise** | Très utilisé en banque, assurance, grands comptes |
| **Outils intégrés (CLI)** | Génération automatique de code, build optimisé |

### 1.3 Angular vs React vs Vue

```
┌─────────────┬─────────────────┬──────────────────┬────────────────┐
│             │     Angular     │       React      │       Vue      │
├─────────────┼─────────────────┼──────────────────┼────────────────┤
│ Type        │ Framework       │ Librairie        │ Framework      │
│ Langage     │ TypeScript      │ JS / TS          │ JS / TS        │
│ Courbe      │ Forte           │ Moyenne          │ Douce          │
│ Tooling     │ Tout inclus     │ À assembler      │ Mixte          │
│ Cible       │ Grandes apps    │ Tout type        │ Petites/moyennes│
└─────────────┴─────────────────┴──────────────────┴────────────────┘
```

### 1.4 Architecture en composants

Une application Angular est un **arbre de composants**. Chaque composant a :

- Un **template** (HTML)
- Un **style** (CSS / SCSS)
- Une **logique** (TypeScript)
- Un **sélecteur** (balise pour l'utiliser ailleurs)

```
AppComponent
├── HeaderComponent
├── HomeComponent
│   ├── HeroComponent
│   └── CardListComponent
│       └── CardComponent (×N)
└── FooterComponent
```

### 1.5 Installation de l'environnement

**Prérequis** : Node.js LTS (20+) et npm.

```bash
# 1. Vérifier Node
node --version    # v20.x ou plus
npm --version

# 2. Installer Angular CLI globalement
npm install -g @angular/cli

# 3. Vérifier l'installation
ng version
```

**Créer un projet** :

```bash
ng new mon-projet
# Répondre aux questions :
#   - Stylesheet format ? → SCSS
#   - Server-Side Rendering ? → No (pour démarrer)

cd mon-projet
ng serve --open
```

→ L'app tourne sur `http://localhost:4200`.

---

## 2. Les fondamentaux

### 2.1 Anatomie d'un composant

Fichier généré par `ng generate component hello` :

```typescript
// hello.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent {
  title = 'Bonjour Angular';
}
```

```html
<!-- hello.component.html -->
<h1>{{ title }}</h1>
```

**Décomposition** :

- `@Component(...)` : décorateur qui marque la classe comme composant
- `selector` : balise HTML `<app-hello></app-hello>` pour l'utiliser
- `standalone: true` : composant autonome (recommandé depuis Angular 17)
- `imports` : autres composants/directives utilisés dans le template

### 2.2 Templates et data binding

Angular propose **4 types de binding** :

| Type | Syntaxe | Direction | Exemple |
|---|---|---|---|
| **Interpolation** | `{{ valeur }}` | TS → HTML | `<p>{{ user.name }}</p>` |
| **Property binding** | `[prop]="valeur"` | TS → HTML | `<img [src]="imgUrl">` |
| **Event binding** | `(event)="action()"` | HTML → TS | `<button (click)="save()">` |
| **Two-way binding** | `[(ngModel)]="prop"` | TS ↔ HTML | `<input [(ngModel)]="name">` |

**Exemple complet** :

```typescript
export class UserComponent {
  name = 'Alice';
  age = 25;
  imgUrl = 'avatar.png';

  greet() {
    alert(`Bonjour ${this.name}`);
  }
}
```

```html
<img [src]="imgUrl" alt="avatar">
<p>{{ name }}, {{ age }} ans</p>
<button (click)="greet()">Saluer</button>
<input [(ngModel)]="name">
```

> ⚠️ Pour `[(ngModel)]`, il faut importer `FormsModule` dans le composant.

### 2.3 Control flow : `@if`, `@for`, `@switch`

Depuis **Angular 17**, on utilise la nouvelle syntaxe (plus rapide et plus claire) :

```html
<!-- Condition -->
@if (user) {
  <p>Bonjour {{ user.name }}</p>
} @else {
  <p>Veuillez vous connecter</p>
}

<!-- Boucle -->
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <li>Aucun élément</li>
}

<!-- Switch -->
@switch (role) {
  @case ('admin') { <p>Bienvenue admin</p> }
  @case ('user')  { <p>Bienvenue utilisateur</p> }
  @default        { <p>Invité</p> }
}
```

> 📜 **Ancienne syntaxe** (encore valable) : `*ngIf`, `*ngFor`, `*ngSwitch`. Tu pourras la croiser dans des projets existants.

### 2.4 Directives

Les **directives** étendent le HTML.

- **Structurelles** : modifient le DOM → `@if`, `@for`, `*ngIf`, `*ngFor`
- **D'attribut** : modifient l'apparence/comportement → `[ngClass]`, `[ngStyle]`

```html
<!-- ngClass : classes conditionnelles -->
<div [ngClass]="{ 'active': isActive, 'error': hasError }">...</div>

<!-- ngStyle : styles inline conditionnels -->
<p [ngStyle]="{ 'color': isError ? 'red' : 'green' }">...</p>
```

### 2.5 Services et injection de dépendances

Un **service** = classe qui contient de la logique métier réutilisable (appels API, état partagé, calculs).

```typescript
// user.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })  // singleton global
export class UserService {
  getUser() {
    return { name: 'Mouad', role: 'admin' };
  }
}
```

**Utilisation** :

```typescript
import { Component, inject } from '@angular/core';
import { UserService } from './user.service';

@Component({ /* ... */ })
export class HomeComponent {
  private userService = inject(UserService);  // injection moderne
  user = this.userService.getUser();
}
```

> 💡 `inject()` est la méthode recommandée depuis Angular 14+. L'ancienne via le constructeur fonctionne toujours mais est moins concise.

### 2.6 Les Observables (RxJS)

Un **Observable** = flux de données dans le temps. Indispensable pour les appels HTTP, événements, formulaires.

**Différence avec une Promise** :

| Promise | Observable |
|---|---|
| Une seule valeur | Plusieurs valeurs dans le temps |
| Non annulable | Annulable (`unsubscribe`) |
| `.then()` | `.subscribe()` |
| `async / await` | Opérateurs RxJS (`map`, `filter`, `switchMap`...) |

**Exemple basique** :

```typescript
import { Observable } from 'rxjs';

const obs$ = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

obs$.subscribe(value => console.log(value));
// → 1, 2, 3
```

> 🏷️ **Convention** : on suffixe les variables Observable avec `$` (ex: `users$`).

### 2.7 Organisation du code

**Structure recommandée** :

```
src/app/
├── core/                  # services globaux (auth, http, guards)
│   ├── services/
│   └── guards/
├── shared/                # composants/pipes réutilisables
│   ├── components/
│   └── pipes/
├── features/              # fonctionnalités métier
│   ├── users/
│   │   ├── users.component.ts
│   │   ├── user-detail.component.ts
│   │   └── users.service.ts
│   └── products/
├── app.component.ts
├── app.routes.ts
└── app.config.ts
```

---

## 3. Routage, navigation et états

### 3.1 Configuration des routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'users/:id', component: UserDetailComponent },  // route dynamique
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component')
                          .then(m => m.AdminComponent)  // lazy loading
  },
  { path: '**', component: NotFoundComponent }  // 404
];
```

### 3.2 Navigation

**Dans le HTML** (`routerLink`) :

```html
<nav>
  <a routerLink="/" routerLinkActive="active">Accueil</a>
  <a routerLink="/about" routerLinkActive="active">À propos</a>
  <a [routerLink]="['/users', user.id]">Voir l'utilisateur</a>
</nav>

<!-- Zone d'affichage des routes -->
<router-outlet></router-outlet>
```

**Dans le TypeScript** (`Router`) :

```typescript
import { Router } from '@angular/router';

private router = inject(Router);

goToUser(id: number) {
  this.router.navigate(['/users', id]);
}
```

### 3.3 Récupérer les paramètres d'URL

```typescript
import { ActivatedRoute } from '@angular/router';

export class UserDetailComponent {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Méthode 1 : snapshot (statique)
    const id = this.route.snapshot.paramMap.get('id');

    // Méthode 2 : Observable (réactif, recommandé)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.loadUser(id);
    });
  }
}
```

### 3.4 Communication entre composants

#### A) Parent → Enfant : `@Input()`

```typescript
// child.component.ts
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-card', /* ... */ })
export class CardComponent {
  @Input() title = '';
  @Input() description = '';
}
```

```html
<!-- parent -->
<app-card [title]="'Mon titre'" [description]="desc"></app-card>
```

> 💡 Depuis Angular 17.1, on peut aussi utiliser `input()` (signal-based) :
> ```typescript
> title = input<string>('');
> ```

#### B) Enfant → Parent : `@Output()` + `EventEmitter`

```typescript
// child.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

export class CardComponent {
  @Output() cardClicked = new EventEmitter<number>();

  onClick(id: number) {
    this.cardClicked.emit(id);
  }
}
```

```html
<!-- parent -->
<app-card (cardClicked)="handleClick($event)"></app-card>
```

#### C) Composants frères : via un **service partagé**

```typescript
// shared-state.service.ts
@Injectable({ providedIn: 'root' })
export class SharedStateService {
  private selectedIdSubject = new BehaviorSubject<number | null>(null);
  selectedId$ = this.selectedIdSubject.asObservable();

  setSelected(id: number) {
    this.selectedIdSubject.next(id);
  }
}
```

Tout composant qui injecte ce service peut lire ou modifier l'état.

### 3.5 Gestion d'état avec RxJS

**Subjects principaux** :

| Type | Usage |
|---|---|
| `Subject` | Émet aux abonnés actuels uniquement |
| `BehaviorSubject` | Garde la dernière valeur, la donne aux nouveaux abonnés |
| `ReplaySubject` | Garde N valeurs et les rejoue |

**Opérateurs RxJS courants** :

```typescript
import { map, filter, debounceTime, switchMap, catchError } from 'rxjs/operators';

source$.pipe(
  filter(x => x > 0),              // ne garde que les positifs
  map(x => x * 2),                 // transforme
  debounceTime(300),               // attends 300ms entre 2 émissions
  switchMap(x => http.get(`/api/${x}`)),  // remplace par un nouvel observable
  catchError(err => of([]))        // gère les erreurs
).subscribe(result => console.log(result));
```

---

## 4. Communication avec une API

### 4.1 Mise en place de HttpClient

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()  // ← ajouter cette ligne
  ]
};
```

### 4.2 Les 4 méthodes HTTP

```typescript
// user.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  // GET : lire
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // POST : créer
  create(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // PUT : remplacer
  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // DELETE : supprimer
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### 4.3 Consommer le service dans un composant

**Méthode 1 : `subscribe()` classique**

```typescript
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  users: User[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: data => {
        this.users = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Erreur de chargement';
        this.loading = false;
      }
    });
  }
}
```

**Méthode 2 : pipe `async` (recommandée)**

```typescript
export class UserListComponent {
  private userService = inject(UserService);
  users$ = this.userService.getAll();
}
```

```html
@if (users$ | async; as users) {
  <ul>
    @for (u of users; track u.id) {
      <li>{{ u.name }}</li>
    }
  </ul>
} @else {
  <p>Chargement...</p>
}
```

> ✅ Avantage du pipe `async` : Angular gère automatiquement l'unsubscribe → pas de fuite mémoire.

### 4.4 Gestion des erreurs

```typescript
import { catchError, throwError } from 'rxjs';

getAll(): Observable<User[]> {
  return this.http.get<User[]>(this.apiUrl).pipe(
    catchError(err => {
      console.error('Erreur API', err);
      return throwError(() => new Error('Impossible de charger les utilisateurs'));
    })
  );
}
```

### 4.5 Headers et paramètres

```typescript
import { HttpHeaders, HttpParams } from '@angular/common/http';

search(query: string, page: number) {
  const headers = new HttpHeaders({
    'Authorization': 'Bearer mon-token',
    'Content-Type': 'application/json'
  });

  const params = new HttpParams()
    .set('q', query)
    .set('page', page.toString());

  return this.http.get<User[]>(this.apiUrl, { headers, params });
}
```

### 4.6 Les Interceptors

Un **interceptor** = middleware qui s'exécute sur **toutes** les requêtes HTTP. Pratique pour ajouter un token, logger, gérer des erreurs globalement.

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};
```

```typescript
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor]))
```

---

## 5. Optimisation et bonnes pratiques

### 5.1 Lazy loading

Charger les composants seulement quand on en a besoin → bundle initial plus léger.

```typescript
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
}
```

### 5.2 OnPush Change Detection

Améliore les performances : Angular ne re-vérifie le composant que si ses `@Input()` changent.

```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  /* ... */
})
```

### 5.3 trackBy dans `@for`

```html
@for (item of items; track item.id) { ... }
```

→ Angular ne re-rend que les éléments qui ont changé (et pas toute la liste).

### 5.4 Pipes purs

Les pipes (`| date`, `| currency`, custom) sont **purs** par défaut → recalculés seulement si l'input change. À privilégier sur des fonctions appelées dans le template.

### 5.5 Bonnes pratiques de structure

- Un composant = une responsabilité
- Logique métier dans les **services**, pas dans les composants
- Types et interfaces **toujours** définis (pas de `any`)
- Variables Observable suffixées avec `$`
- `unsubscribe()` ou pipe `async` (jamais de subscribe sans nettoyage dans un composant à durée de vie)
- Lazy loading sur les routes lourdes
- `OnPush` sur les composants de liste

---

## Glossaire

| Terme | Définition |
|---|---|
| **Component** | Brique réutilisable composée d'un HTML, CSS et TS |
| **Service** | Classe injectable contenant logique métier ou état partagé |
| **Module** | Regroupement de composants (ancien modèle, remplacé par standalone) |
| **Standalone** | Composant qui n'a pas besoin d'être déclaré dans un NgModule |
| **Directive** | Comportement attaché à un élément HTML |
| **Pipe** | Transformateur de valeur dans le template (`{{ date | date }}`) |
| **Decorator** | `@Component`, `@Injectable` — annotation TypeScript |
| **Observable** | Flux de valeurs dans le temps (RxJS) |
| **Subject** | Observable + capacité d'émettre manuellement |
| **DI** | Dependency Injection — Angular fournit les services automatiquement |
| **CLI** | Command Line Interface — `ng new`, `ng serve`, `ng generate` |
| **CSR / SSR** | Client-Side / Server-Side Rendering |
| **Hydration** | Réactivation du HTML rendu côté serveur |

---

## Ressources

- 📖 [Documentation officielle Angular](https://angular.dev)
- 📖 [RxJS](https://rxjs.dev)
- 🎓 [Angular University](https://angular-university.io) (payant mais excellent)
- 🎥 [Joshua Morony — YouTube](https://www.youtube.com/@JoshuaMorony) (modern Angular)

---

*Module IPSSI — Angular et communication API • InfoSoftware*
