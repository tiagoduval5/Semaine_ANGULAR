# 🧪 Jour 3 — TP guidé : Pokédex avec la PokéAPI

> **Durée** : ~3h30 (TP du Jour 3)
> **Version** : Angular **19 / 20 / 21**. Style **moderne** (signals, `inject()`, `provideRouter`/`provideHttpClient`, route → `input()`, `@if/@for`). **Zéro legacy.**
> **API** : [PokéAPI](https://pokeapi.co) — gratuite, sans clé, en lecture seule (GET).

---

## 🎯 Ce que tu vas construire

Un **Pokédex** avec :

- 📃 Une **page liste** : les 151 premiers Pokémon avec leur image.
- 🔎 Une **barre de recherche** (filtrage en direct).
- 🔍 Une **page détail** (route `/pokemon/:name`) : image, types, taille, poids, stats.
- ⭐ Un système de **favoris** partagé entre les pages (service + signals).
- ⏳ La gestion **chargement / erreur**.

```
┌─────────────────────────────────────────────┐
│  Navbar : Pokédex   |   ⭐ Favoris (3)        │
├─────────────────────────────────────────────┤
│  /            → PokemonListComponent          │
│  /pokemon/:name → PokemonDetailComponent      │
│  /favoris     → FavorisComponent              │
└─────────────────────────────────────────────┘
            ↑ état favoris partagé via FavorisService (signals)
```

---

## 🔎 Comprendre l'API d'abord (important !)

Avant de coder, ouvre ces URL dans ton navigateur pour voir la structure JSON :

1. **Liste** : https://pokeapi.co/api/v2/pokemon?limit=151
   → renvoie `{ count, next, previous, results: [{ name, url }] }`
   ⚠️ La liste ne contient **que le nom et l'URL**, pas l'image !

2. **Détail** : https://pokeapi.co/api/v2/pokemon/pikachu
   → renvoie l'objet complet : `id`, `name`, `height`, `weight`, `types`, `stats`, `sprites`…

3. **L'image** se trouve dans :
   `sprites.other['official-artwork'].front_default`


---

## ÉTAPE 1 — Créer le projet

```bash
ng new pokedex
```

Réponses :

| Question | Réponse |
|---|---|
| Stylesheet | **SCSS** |
| Server-Side Rendering (SSR) | **No** |
| Zoneless ? (si proposé) | **No** (on garde simple) |

```bash
cd pokedex
ng serve --open
```

> ✅ Vérifie ta version : `ng version`. Si tu as Angular 19, 20 ou 21, **tout ce TP fonctionne à l'identique**.

---

## ÉTAPE 2 — Configurer Router + HttpClient

Ouvre `src/app/app.config.ts` et ajoute **HttpClient** et le **binding des inputs de route** :

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
  ],
};
```

> 🔑 `withComponentInputBinding()` = les params d'URL arriveront en `input()`. `withFetch()` = HttpClient basé sur l'API `fetch` moderne.

---

## ÉTAPE 3 — Les modèles (interfaces TypeScript)

Crée `src/app/models/pokemon.model.ts` :

```typescript
// src/app/models/pokemon.model.ts

// Réponse de la liste
export interface PokemonListResponse {
  count: number;
  results: { name: string; url: string }[];
}

// Ce qu'on affiche dans la liste (enrichi)
export interface PokemonPreview {
  name: string;
  id: number;
  image: string;
}

// Réponse détaillée (on ne type que ce qu'on utilise)
export interface PokemonDetail {
  id: number;
  name: string;
  height: number;   // en décimètres
  weight: number;   // en hectogrammes
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: {
    other: {
      'official-artwork': { front_default: string };
    };
  };
}
```

> 💡 On ne type **que les champs utilisés** : l'API renvoie bien plus, mais TypeScript n'exige pas qu'on liste tout.

---

## ÉTAPE 4 — Le service API

```bash
ng g service services/pokemon-api
```

`src/app/services/pokemon-api.service.ts` :

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  PokemonListResponse,
  PokemonPreview,
  PokemonDetail,
} from '../models/pokemon.model';

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  // GET : la liste des 151 premiers, transformée en aperçus avec image
  getList(limit = 151): Observable<PokemonPreview[]> {
    return this.http
      .get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=${limit}`)
      .pipe(
        map(res =>
          res.results.map(p => {
            // l'URL finit par /pokemon/25/ → on extrait l'id "25"
            const id = Number(p.url.split('/').filter(Boolean).pop());
            return {
              name: p.name,
              id,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          })
        )
      );
  }

  // GET : le détail d'un Pokémon par son nom
  getByName(name: string): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.baseUrl}/pokemon/${name}`);
  }
}
```

**Décrypte** :

- `getList()` renvoie un Observable, et avec `map()` on **transforme** la réponse brute en `PokemonPreview[]` (nom + id + image).
- On déduit l'image depuis l'`id` → **un seul appel** pour toute la liste.

---

## ÉTAPE 5 — Le service de favoris (état partagé)

```bash
ng g service services/favoris
```

`src/app/services/favoris.service.ts` :

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavorisService {
  private _favoris = signal<string[]>([]);

  favoris = this._favoris.asReadonly();
  nombre  = computed(() => this._favoris().length);

  estFavori(name: string): boolean {
    return this._favoris().includes(name);
  }

  basculer(name: string) {
    this._favoris.update(list =>
      list.includes(name) ? list.filter(n => n !== name) : [...list, name]
    );
  }
}
```

> 🔑 Singleton (`providedIn: 'root'`) → **toutes les pages voient la même liste de favoris**.

---

## ÉTAPE 6 — Les routes

Crée les composants de pages :

```bash
ng g component pages/pokemon-list
ng g component pages/pokemon-detail
ng g component pages/favoris
```

`src/app/app.routes.ts` :

```typescript
import { Routes } from '@angular/router';
import { PokemonListComponent } from './pages/pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from './pages/pokemon-detail/pokemon-detail.component';
import { FavorisComponent } from './pages/favoris/favoris.component';

export const routes: Routes = [
  { path: '',               component: PokemonListComponent },
  { path: 'pokemon/:name',  component: PokemonDetailComponent },
  { path: 'favoris',        component: FavorisComponent },
  { path: '**',             redirectTo: '' },
];
```

---

## ÉTAPE 7 — La navbar (AppComponent)

`src/app/app.component.ts` :

```typescript
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FavorisService } from './services/favoris.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  favoris = inject(FavorisService);
}
```

`src/app/app.component.html` :

```html
<nav class="navbar">
  <a routerLink="/" class="logo">🔴 Pokédex</a>
  <div class="links">
    <a routerLink="/" routerLinkActive="actif" [routerLinkActiveOptions]="{ exact: true }">
      Liste
    </a>
    <a routerLink="/favoris" routerLinkActive="actif">
      ⭐ Favoris ({{ favoris.nombre() }})
    </a>
  </div>
</nav>

<main>
  <router-outlet />
</main>
```

`src/app/app.component.scss` :

```scss
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ef5350;
  color: white;

  .logo { font-size: 20px; font-weight: 700; text-decoration: none; color: white; }

  .links a {
    color: white;
    text-decoration: none;
    margin-left: 16px;
    padding: 6px 10px;
    border-radius: 8px;

    &.actif { background: rgba(255, 255, 255, 0.25); }
  }
}

main { max-width: 960px; margin: 24px auto; padding: 0 16px; }
```

---

## ÉTAPE 8 — La page LISTE (avec recherche)

`src/app/pages/pokemon-list/pokemon-list.component.ts` :

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonApiService } from '../../services/pokemon-api.service';

@Component({
  selector: 'app-pokemon-list',
  imports: [RouterLink],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
})
export class PokemonListComponent {
  private api = inject(PokemonApiService);

  // les données de l'API converties en signal (désabonnement auto)
  pokemons = toSignal(this.api.getList(), { initialValue: [] });

  // le terme de recherche
  recherche = signal('');

  // liste filtrée : se recalcule automatiquement
  filtres = computed(() => {
    const q = this.recherche().toLowerCase().trim();
    return this.pokemons().filter(p => p.name.includes(q));
  });

  onSearch(event: Event) {
    this.recherche.set((event.target as HTMLInputElement).value);
  }
}
```

`src/app/pages/pokemon-list/pokemon-list.component.html` :

```html
<h1>Pokédex</h1>

<input
  type="text"
  class="search"
  placeholder="Rechercher un Pokémon…"
  (input)="onSearch($event)"
/>

@if (pokemons().length === 0) {
  <p class="info">⏳ Chargement des Pokémon…</p>
} @else {
  <div class="grid">
    @for (p of filtres(); track p.id) {
      <a class="card" [routerLink]="['/pokemon', p.name]">
        <img [src]="p.image" [alt]="p.name" loading="lazy" />
        <span class="num">#{{ p.id }}</span>
        <span class="name">{{ p.name }}</span>
      </a>
    } @empty {
      <p class="info">Aucun Pokémon ne correspond à « {{ recherche() }} »</p>
    }
  </div>
}
```

`src/app/pages/pokemon-list/pokemon-list.component.scss` :

```scss
h1 { text-align: center; text-transform: capitalize; }

.search {
  display: block;
  width: 100%;
  max-width: 360px;
  margin: 0 auto 24px;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #eee;
  border-radius: 14px;
  text-decoration: none;
  color: #333;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }

  img  { width: 96px; height: 96px; object-fit: contain; }
  .num { font-size: 12px; color: #999; }
  .name { text-transform: capitalize; font-weight: 600; }
}

.info { text-align: center; color: #888; padding: 32px; }
```

✅ **Teste** : `ng serve`. Tu vois la grille des 151 Pokémon, et la recherche filtre en direct.

---

## ÉTAPE 9 — La page DÉTAIL (param d'URL en `input()`)

C'est le cœur du TP : on récupère `:name` de l'URL **en `input()`**, et on relance l'appel avec `switchMap`.

`src/app/pages/pokemon-detail/pokemon-detail.component.ts` :

```typescript
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { PokemonApiService } from '../../services/pokemon-api.service';
import { FavorisService } from '../../services/favoris.service';

@Component({
  selector: 'app-pokemon-detail',
  imports: [RouterLink],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent {
  private api = inject(PokemonApiService);
  favoris = inject(FavorisService);

  // 🆕 le param :name de l'URL arrive ici automatiquement
  name = input.required<string>();

  // à chaque changement de name(), on (re)charge le détail
  pokemon = toSignal(
    toObservable(this.name).pipe(
      switchMap(n => this.api.getByName(n))
    )
  );
}
```

`src/app/pages/pokemon-detail/pokemon-detail.component.html` :

```html
<a routerLink="/" class="back">← Retour à la liste</a>

@if (pokemon(); as p) {
  <div class="detail">
    <div class="header">
      <h1>{{ p.name }} <small>#{{ p.id }}</small></h1>
      <button class="fav" (click)="favoris.basculer(p.name)">
        {{ favoris.estFavori(p.name) ? '⭐ Retirer' : '☆ Favori' }}
      </button>
    </div>

    <img
      [src]="p.sprites.other['official-artwork'].front_default"
      [alt]="p.name"
      class="artwork"
    />

    <div class="types">
      @for (t of p.types; track t.type.name) {
        <span class="type">{{ t.type.name }}</span>
      }
    </div>

    <ul class="infos">
      <li><strong>Taille :</strong> {{ p.height / 10 }} m</li>
      <li><strong>Poids :</strong> {{ p.weight / 10 }} kg</li>
    </ul>

    <h3>Statistiques</h3>
    <ul class="stats">
      @for (s of p.stats; track s.stat.name) {
        <li>
          <span class="label">{{ s.stat.name }}</span>
          <span class="bar"><span class="fill" [style.width.%]="s.base_stat / 2"></span></span>
          <span class="val">{{ s.base_stat }}</span>
        </li>
      }
    </ul>
  </div>
} @else {
  <p class="info">⏳ Chargement de {{ name() }}…</p>
}
```

`src/app/pages/pokemon-detail/pokemon-detail.component.scss` :

```scss
.back { display: inline-block; margin-bottom: 16px; color: #ef5350; text-decoration: none; }

.detail {
  background: white;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 { text-transform: capitalize; margin: 0; small { color: #aaa; } }

  .fav {
    border: 1px solid #ef5350;
    background: white;
    color: #ef5350;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    &:hover { background: #ffebee; }
  }
}

.artwork { width: 220px; height: 220px; object-fit: contain; }

.types {
  display: flex; justify-content: center; gap: 8px; margin: 12px 0;
  .type {
    text-transform: capitalize;
    background: #eceff1;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 13px;
  }
}

.infos { list-style: none; padding: 0; display: flex; justify-content: center; gap: 24px; }

.stats {
  list-style: none; padding: 0; max-width: 420px; margin: 0 auto; text-align: left;
  li { display: grid; grid-template-columns: 120px 1fr 40px; align-items: center; gap: 8px; margin: 6px 0; }
  .label { text-transform: capitalize; font-size: 13px; color: #555; }
  .bar { background: #eee; border-radius: 6px; height: 10px; overflow: hidden; }
  .fill { display: block; height: 100%; background: #ef5350; }
  .val { text-align: right; font-size: 13px; }
}

.info { text-align: center; color: #888; padding: 32px; }
```

✅ **Teste** : clique sur un Pokémon → page détail avec image, types, stats, et bouton favori.

---

## ÉTAPE 10 — La page FAVORIS

`src/app/pages/favoris/favoris.component.ts` :

```typescript
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavorisService } from '../../services/favoris.service';

@Component({
  selector: 'app-favoris',
  imports: [RouterLink],
  templateUrl: './favoris.component.html',
  styleUrl: './favoris.component.scss',
})
export class FavorisComponent {
  favoris = inject(FavorisService);
}
```

`src/app/pages/favoris/favoris.component.html` :

```html
<h1>⭐ Mes favoris</h1>

@if (favoris.favoris().length === 0) {
  <p class="info">Aucun favori pour l'instant. Ajoute-en depuis une fiche Pokémon !</p>
} @else {
  <ul class="liste">
    @for (name of favoris.favoris(); track name) {
      <li>
        <a [routerLink]="['/pokemon', name]">{{ name }}</a>
        <button (click)="favoris.basculer(name)">✖</button>
      </li>
    }
  </ul>
}
```

`src/app/pages/favoris/favoris.component.scss` :

```scss
h1 { text-align: center; }
.info { text-align: center; color: #888; padding: 32px; }
.liste {
  list-style: none; padding: 0; max-width: 420px; margin: 0 auto;
  li {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; background: white; border: 1px solid #eee;
    border-radius: 10px; margin-bottom: 8px;
    a { text-transform: capitalize; text-decoration: none; color: #333; font-weight: 600; }
    button { border: none; background: transparent; cursor: pointer; color: #ef5350; font-size: 16px; }
  }
}
```

✅ **Teste le tout** : ajoute des favoris depuis les fiches → le compteur de la navbar augmente → la page `/favoris` les liste → clique pour revenir au détail. **L'état est partagé entre toutes les pages** grâce au service. 🎉

---

## 🧠 Récap des concepts du jour

| ✅ | Concept | Où dans le TP |
|---|---|---|
| ✓ | `provideRouter` + routes | `app.config.ts`, `app.routes.ts` |
| ✓ | `routerLink` / `routerLinkActive` | navbar, cartes |
| ✓ | Param d'URL en **`input()`** | `pokemon-detail` |
| ✓ | `provideHttpClient(withFetch())` | `app.config.ts` |
| ✓ | `HttpClient.get<T>()` | `pokemon-api.service` |
| ✓ | `map` (transformer la réponse) | `getList()` |
| ✓ | `switchMap` (recharger sur changement) | `pokemon-detail` |
| ✓ | `toSignal` / `toObservable` | liste & détail |
| ✓ | État partagé : service + **signals** | `favoris.service` |
| ✓ | `computed` (liste filtrée) | recherche |
| ✓ | `@if / @for / @empty` | partout |

---

## 🧠 Quiz

1. Pourquoi `getList()` fait-il **un seul** appel HTTP pour 151 Pokémon avec image ?
2. Comment le composant détail reçoit-il le `:name` de l'URL ?
3. Que se passe-t-il si on change d'URL `/pokemon/pikachu` → `/pokemon/bulbasaur` grâce à `switchMap` ?
4. Pourquoi les favoris sont-ils visibles depuis toutes les pages ?
5. Pourquoi `toSignal` évite-t-il une fuite mémoire ?

<details>
<summary>👀 Réponses</summary>

1. Parce qu'on **déduit l'image depuis l'`id`** (URL prévisible), au lieu d'appeler le détail de chacun.
2. Via `name = input.required<string>()` + `withComponentInputBinding()` : le param d'URL est injecté comme un signal input.
3. `switchMap` **annule** la requête en cours et lance la nouvelle → pas de réponse obsolète affichée.
4. Le `FavorisService` est un **singleton** (`providedIn: 'root'`) : toutes les pages lisent le **même** signal.
5. `toSignal` **se désabonne automatiquement** quand le composant est détruit (pas de `subscribe` oublié).

</details>

---

## 🚀 Pour aller plus loin (devoirs)

1. **Persistance** : sauvegarde les favoris dans `localStorage` (avec un `effect()` dans le service, et lecture au démarrage).
2. **Pagination** : ajoute un bouton « Charger 151 de plus » (`offset`).
3. **Couleur par type** : colore la carte/le bandeau selon le type principal du Pokémon.
4. **Recherche avec `debounceTime`** : si tu déclenches un appel API par lettre, ajoute `debounceTime(300)` (voir cours §8).
5. **Gestion d'erreur** : affiche un message si un nom n'existe pas (Pokémon introuvable → 404 de l'API) avec `catchError`.

---

➡️ **Prochaine étape (Jour 4) : Projet d'équipe — application Météo avec l'API OpenWeatherMap** (recherche de ville, affichage des données, gestion de clé API).
