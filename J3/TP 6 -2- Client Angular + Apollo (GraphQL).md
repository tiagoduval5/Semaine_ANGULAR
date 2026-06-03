# 🟣 TP DigiDex (2/2) — Client Angular + Apollo (GraphQL)

> **Objectif** : construire le **front Angular** qui consomme le **serveur GraphQL** (`digidex-api`, partie 1) avec **Apollo Angular**. On fait **plusieurs choses** : liste paginée, recherche, page de détail (route `:id`), évolutions, et favoris (état partagé via signals).
>
> 🔗 **Prérequis** : le serveur GraphQL doit **tourner** sur `http://localhost:4000` (voir `digidex-api/README.md`, `npm start`).

---

## 🎯 Ce que tu vas construire

| Fonctionnalité | Concept GraphQL/Angular travaillé |
|---|---|
| 📋 Liste paginée de Digimon | `watchQuery` + variables + `fetchMore` (pagination) |
| 🔎 Recherche par nom | variables réactives, re-fetch |
| 🔬 Page de détail (`/digimon/:id`) | route avec paramètre + query ciblée |
| 🧬 Évolutions (prior/next) | champs imbriqués GraphQL |
| ⭐ Favoris | **état partagé** via service + signals |

> 💡 **Plusieurs services** : `DigimonGraphqlService` (les requêtes GraphQL) et `FavorisService` (état partagé). Bonne séparation des responsabilités.

---

## 🧰 Prérequis

- Serveur GraphQL lancé sur `:4000` (teste sur <http://localhost:4000>).
- Angular CLI 17+.

---

## 🚀 ÉTAPE 0 — Créer le projet & installer Apollo

```bash
cd tp6-digidex-graphql
ng new digidex-app --style=scss --routing=true --skip-tests
cd digidex-app

# Installe Apollo Angular + ses dépendances GraphQL
ng add apollo-angular
```

> 🛠️ `ng add apollo-angular` fait beaucoup de choses pour toi : il installe `@apollo/client` + `graphql`, et **crée un fichier de config** (`src/app/graphql.provider.ts` selon la version). Il te demandera l'**URL de l'API** → réponds : **`http://localhost:4000/`**.
>
> Si la commande ne pose pas la question, on configure à la main à l'étape suivante.

---

## 🔌 ÉTAPE 1 — Configurer le client Apollo

Apollo a besoin de savoir **où** est le serveur GraphQL et **comment** mettre en cache. Vérifie/crée `src/app/graphql.provider.ts` :

```typescript
import { ApplicationConfig, inject } from '@angular/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

const uri = 'http://localhost:4000/'; // ← l'URL de notre serveur GraphQL

export function provideApollo() {
  return {
    provide: APOLLO_OPTIONS,
    useFactory: () => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri }),
        cache: new InMemoryCache(),   // ← cache automatique des résultats
      };
    },
  };
}
```

Puis branche-le dans `src/app/app.config.ts` :

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { routes } from './app.routes';
import { provideApollo } from './graphql.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),   // Apollo s'appuie sur HttpClient
    Apollo,
    provideApollo(),
  ],
};
```

> 🔑 **`InMemoryCache`** est la grande force d'Apollo : si tu redemandes un Digimon déjà chargé, Apollo répond **depuis le cache** sans rappeler le serveur. Gratuit.

---

## 📦 ÉTAPE 2 — Le modèle (types TypeScript)

Fichier `src/app/models/digimon.model.ts`. Ces types reflètent le **schéma GraphQL** du serveur :

```typescript
export interface Image {
  href: string;
  transparent: boolean;
}

export interface Evolution {
  id: number;
  digimon: string;
  condition: string;
  image: string;
}

export interface Digimon {
  id: number;
  name: string;
  releaseDate?: string;
  images?: Image[];
  levels?: string[];
  types?: string[];
  attributes?: string[];
  descriptions?: string[];
  priorEvolutions?: Evolution[];
  nextEvolutions?: Evolution[];
}

export interface DigimonSummary {
  id: number;
  name: string;
  image: string;
}

export interface DigimonPage {
  items: DigimonSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}
```

---

## 🛰️ ÉTAPE 3 — Le service GraphQL

Toutes les requêtes GraphQL sont **centralisées** ici. Génère le service :

```bash
ng g service services/digimon-graphql
```

`src/app/services/digimon-graphql.service.ts` :

```typescript
import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { Digimon, DigimonPage } from '../models/digimon.model';

// ----- Les requêtes GraphQL (chaîne taguée avec gql`...`) -----

const LISTE = gql`
  query Digimons($page: Int!, $pageSize: Int!, $name: String) {
    digimons(page: $page, pageSize: $pageSize, name: $name) {
      totalElements
      totalPages
      currentPage
      items { id name image }
    }
  }
`;

const DETAIL = gql`
  query Digimon($id: Int!) {
    digimon(id: $id) {
      id
      name
      releaseDate
      levels
      types
      attributes
      descriptions
      images { href }
      priorEvolutions { id digimon condition image }
      nextEvolutions { id digimon condition image }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class DigimonGraphqlService {
  private apollo = inject(Apollo);

  // Liste paginée + recherche optionnelle
  getDigimons(page = 0, pageSize = 20, name?: string): Observable<DigimonPage> {
    return this.apollo
      .watchQuery<{ digimons: DigimonPage }>({
        query: LISTE,
        variables: { page, pageSize, name },
      })
      .valueChanges.pipe(map(result => result.data.digimons));
  }

  // Détail d'un Digimon
  getDigimon(id: number): Observable<Digimon> {
    return this.apollo
      .watchQuery<{ digimon: Digimon }>({
        query: DETAIL,
        variables: { id },
      })
      .valueChanges.pipe(map(result => result.data.digimon));
  }
}
```

> 🔑 **`gql\`...\``** : c'est ainsi qu'on écrit une requête GraphQL en JS/TS. Les **variables** (`$id`, `$page`) sont passées séparément → jamais de concaténation de chaîne (sûr et réutilisable).
>
> 🔑 **`watchQuery(...).valueChanges`** renvoie un **Observable** : Apollo émet d'abord la donnée (cache ou réseau), et **ré-émet automatiquement** si le cache change. On `map` pour extraire `result.data`.

---

## ⭐ ÉTAPE 4 — Le service de favoris (état partagé, signals)

Un **deuxième service**, indépendant, pour gérer les favoris partagés dans toute l'app. `src/app/services/favoris.service.ts` :

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { DigimonSummary } from '../models/digimon.model';

@Injectable({ providedIn: 'root' })
export class FavorisService {
  // État privé (signal) — modifiable seulement via les méthodes ci-dessous
  private _favoris = signal<DigimonSummary[]>([]);

  // Exposition en LECTURE seule
  favoris = this._favoris.asReadonly();
  nombre = computed(() => this._favoris().length);

  estFavori(id: number): boolean {
    return this._favoris().some(d => d.id === id);
  }

  toggle(digimon: DigimonSummary) {
    if (this.estFavori(digimon.id)) {
      this._favoris.update(list => list.filter(d => d.id !== digimon.id));
    } else {
      this._favoris.update(list => [...list, digimon]);
    }
  }
}
```

> 🔑 **Bonne pratique** : le signal `_favoris` est **privé** ; on n'expose que `favoris` (lecture seule via `asReadonly()`) et des **méthodes** (`toggle`). Les composants ne peuvent pas corrompre l'état directement. `computed` recalcule `nombre` automatiquement.

---

## 🧩 ÉTAPE 5 — Le composant Liste (`pages/digimon-list`)

```bash
ng g component pages/digimon-list
```

`digimon-list.component.ts` :

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DigimonGraphqlService } from '../../services/digimon-graphql.service';
import { FavorisService } from '../../services/favoris.service';
import { DigimonPage } from '../../models/digimon.model';

@Component({
  selector: 'app-digimon-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './digimon-list.component.html',
})
export class DigimonListComponent implements OnInit {
  private service = inject(DigimonGraphqlService);
  protected favoris = inject(FavorisService);   // partagé, utilisé dans le template

  page = signal<DigimonPage | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  recherche = signal('');
  pageCourante = signal(0);

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.loading.set(true);
    this.error.set(null);
    const nom = this.recherche().trim() || undefined;
    this.service.getDigimons(this.pageCourante(), 20, nom).subscribe({
      next: data => { this.page.set(data); this.loading.set(false); },
      error: () => { this.error.set('Le serveur GraphQL (:4000) est-il lancé ?'); this.loading.set(false); },
    });
  }

  rechercher() {
    this.pageCourante.set(0);
    this.charger();
  }

  pagePrecedente() { if (this.pageCourante() > 0) { this.pageCourante.update(p => p - 1); this.charger(); } }
  pageSuivante()   { this.pageCourante.update(p => p + 1); this.charger(); }
}
```

`digimon-list.component.html` :

```html
<h1>🟣 DigiDex <small>({{ favoris.nombre() }} ⭐)</small></h1>

<form (submit)="$event.preventDefault(); rechercher()">
  <input [(ngModel)]="recherche" name="q" placeholder="Rechercher un Digimon…" />
  <button>Rechercher</button>
</form>

@if (loading()) {
  <p>⏳ Chargement…</p>
} @else if (error()) {
  <p class="error">❌ {{ error() }} <button (click)="charger()">Réessayer</button></p>
} @else if (page(); as p) {
  <div class="grille">
    @for (d of p.items; track d.id) {
      <article class="carte">
        <a [routerLink]="['/digimon', d.id]">
          <img [src]="d.image" [alt]="d.name" />
          <h3>{{ d.name }}</h3>
        </a>
        <button (click)="favoris.toggle(d)">
          {{ favoris.estFavori(d.id) ? '⭐' : '☆' }}
        </button>
      </article>
    } @empty {
      <p>Aucun Digimon trouvé.</p>
    }
  </div>

  <nav class="pagination">
    <button (click)="pagePrecedente()" [disabled]="pageCourante() === 0">◀ Précédent</button>
    <span>Page {{ p.currentPage + 1 }} / {{ p.totalPages }}</span>
    <button (click)="pageSuivante()" [disabled]="pageCourante() + 1 >= p.totalPages">Suivant ▶</button>
  </nav>
}
```

---

## 🔬 ÉTAPE 6 — Le composant Détail (`pages/digimon-detail`)

```bash
ng g component pages/digimon-detail
```

`digimon-detail.component.ts` — on récupère l'`id` depuis l'URL :

```typescript
import { Component, inject, input, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DigimonGraphqlService } from '../../services/digimon-graphql.service';
import { Digimon } from '../../models/digimon.model';

@Component({
  selector: 'app-digimon-detail',
  imports: [RouterLink],
  templateUrl: './digimon-detail.component.html',
})
export class DigimonDetailComponent implements OnInit {
  private service = inject(DigimonGraphqlService);

  // L'id vient du paramètre d'URL (config withComponentInputBinding, voir routes)
  id = input.required<string>();

  digimon = signal<Digimon | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.service.getDigimon(Number(this.id())).subscribe({
      next: d => { this.digimon.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
```

`digimon-detail.component.html` :

```html
<a routerLink="/">← Retour</a>

@if (loading()) {
  <p>⏳ Chargement…</p>
} @else if (digimon(); as d) {
  <h1>{{ d.name }}</h1>
  <img [src]="d.images?.[0]?.href" [alt]="d.name" width="200" />

  <p><strong>Niveau :</strong> {{ d.levels?.join(', ') }}</p>
  <p><strong>Type :</strong> {{ d.types?.join(', ') }}</p>
  <p><strong>Attribut :</strong> {{ d.attributes?.join(', ') }}</p>

  @if (d.descriptions?.length) {
    <p>{{ d.descriptions?.[0] }}</p>
  }

  <h3>🧬 Évolue depuis</h3>
  <ul>
    @for (e of d.priorEvolutions; track e.id) {
      <li><a [routerLink]="['/digimon', e.id]">{{ e.digimon }}</a> — {{ e.condition }}</li>
    } @empty { <li>—</li> }
  </ul>

  <h3>🧬 Évolue vers</h3>
  <ul>
    @for (e of d.nextEvolutions; track e.id) {
      <li><a [routerLink]="['/digimon', e.id]">{{ e.digimon }}</a> — {{ e.condition }}</li>
    } @empty { <li>—</li> }
  </ul>
}
```

---

## 🧭 ÉTAPE 7 — Les routes

`src/app/app.routes.ts` :

```typescript
import { Routes } from '@angular/router';
import { DigimonListComponent } from './pages/digimon-list/digimon-list.component';
import { DigimonDetailComponent } from './pages/digimon-detail/digimon-detail.component';

export const routes: Routes = [
  { path: '', component: DigimonListComponent },
  { path: 'digimon/:id', component: DigimonDetailComponent },
  { path: '**', redirectTo: '' },
];
```

Pour que `input.required<string>()` reçoive le paramètre `:id`, active le **binding des inputs de route** dans `app.config.ts` :

```typescript
import { provideRouter, withComponentInputBinding } from '@angular/router';
// ...
provideRouter(routes, withComponentInputBinding()),
```

Enfin, `app.component.html` doit contenir seulement :

```html
<router-outlet />
```

---

## ▶️ ÉTAPE 8 — Lancer et tester

```bash
# Terminal 1 : le serveur GraphQL
cd digidex-api && npm start

# Terminal 2 : le front Angular
cd digidex-app && ng serve -o
```

Sur <http://localhost:4200> : la liste s'affiche, la **recherche** filtre, la **pagination** marche, un **clic** ouvre le détail avec les **évolutions** (cliquables → navigation entre Digimon), et l'**étoile** ajoute aux favoris (le compteur en titre se met à jour partout). 🎉

> 🔎 Ouvre l'onglet **Network** → tu verras **une seule** requête `POST` vers `localhost:4000/` (et non plusieurs GET comme en REST) : le corps contient ta requête GraphQL. C'est la signature de GraphQL.

---

## 🐞 Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Erreur réseau / liste vide | serveur GraphQL pas lancé | `npm start` dans `digidex-api` |
| Erreur CORS | (rare) | Apollo Server autorise CORS par défaut ; vérifie l'URL `:4000` |
| `id` `undefined` dans le détail | binding de route oublié | ajoute `withComponentInputBinding()` |
| Données nulles | champ absent de la query `gql` | ajoute le champ dans la requête `DETAIL` |

---

## 🧠 Concepts du jour

- **Apollo Angular** : client GraphQL pour Angular (`Apollo`, `gql`, `watchQuery`).
- **Requête typée + variables** : `gql` + `variables` → pas de concaténation, réutilisable.
- **`watchQuery.valueChanges`** : Observable qui ré-émet quand le cache change.
- **`InMemoryCache`** : cache automatique → moins d'appels réseau.
- **Le client choisit ses champs** : on ne reçoit que ce qu'on demande.
- **Plusieurs services** : un pour les requêtes (`DigimonGraphqlService`), un pour l'état (`FavorisService`).

---

## 🧠 Quiz

1. Quelle est la différence visible dans l'onglet Network entre REST et GraphQL ?
2. À quoi sert `gql\`...\`` et pourquoi passe-t-on les variables séparément ?
3. Que fait `InMemoryCache` ?
4. Pourquoi séparer `DigimonGraphqlService` et `FavorisService` ?
5. Comment le composant Détail récupère-t-il l'`id` de l'URL ?

---

## 🚀 Pour aller plus loin

1. **Page Favoris** : une route `/favoris` qui liste `favoris.favoris()`.
2. **`fetchMore`** : pagination « charger plus » qui ajoute à la liste au lieu de remplacer.
3. **Debounce de la recherche** : déclencher la recherche après 300 ms d'inactivité (RxJS `debounceTime`).
4. **Persistance des favoris** : sauvegarder dans `localStorage`.
5. **Skeleton loaders** : afficher des cartes « fantômes » pendant le chargement.

---

🎓 **Bravo !** Tu as construit une app **full-stack GraphQL** : un serveur qui agrège une API REST, et un client Angular réactif avec Apollo. Tu maîtrises maintenant **les deux paradigmes** : REST (TP précédents) **et** GraphQL.
