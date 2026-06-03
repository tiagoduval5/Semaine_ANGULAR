# 🟡 TP Yu-Gi-Oh — Angular REST avec architecture pro (multi-services, multi-modèles)

> **Objectif** : consommer une **vraie API REST publique** (YGOPRODeck) pour construire un explorateur de cartes Yu-Gi-Oh, en mettant l'accent sur une **architecture propre** : **plusieurs modèles** typés et **plusieurs services** aux responsabilités séparées. C'est le TP qui montre **comment organiser une application Angular qui grossit**.
>
> 🎓 **Le vrai sujet ici n'est pas « afficher des cartes »**, c'est **l'organisation du code** : séparer les modèles, séparer les services (données / état / filtres), router proprement. Les bonnes pratiques d'une appli professionnelle.

---

## 🎯 Ce que tu vas construire

| Fonctionnalité | Démontre |
|---|---|
| 📋 Liste de cartes + recherche + filtres (type, attribut) | service de données + service de filtres |
| 📄 Page détail d'une carte (`/carte/:id`) | route paramétrée, modèles imbriqués (sets, prix, images) |
| 🗂️ Mon deck (ajout/retrait, persistance) | **état partagé** + `localStorage` |
| 🔀 Carte aléatoire | endpoint dédié |

---

## 📡 L'API : YGOPRODeck (gratuite, sans clé)

Base : **`https://db.ygoprodeck.com/api/v7`**

| Endpoint | Usage |
|---|---|
| `GET /cardinfo.php?num=20&offset=0` | Liste paginée |
| `GET /cardinfo.php?fname=dragon` | Recherche floue par nom |
| `GET /cardinfo.php?type=Spell Card&attribute=DARK` | Filtres |
| `GET /cardinfo.php?id=6983839` | Une carte précise |
| `GET /randomcard.php` | Carte aléatoire |
| `GET /archetypes.php` | Liste des archétypes |

> ⚠️ **Bonne pratique dès le départ** : on ne code **jamais** l'URL en dur dans 10 fichiers. On la met **une seule fois** dans `environment.ts`.

---

## 🏛️ L'architecture (à comprendre AVANT de coder)

```
                     ┌──────────────────────────────────────────────┐
   COMPOSANTS        │  CardListComponent   CardDetailComponent       │
   (pages)           │  DeckComponent                                 │
                     └───────┬───────────────┬───────────────┬───────┘
                             │               │               │
        ┌────────────────────┼───────────────┼───────────────┼─────────────┐
   SERVICES                  ▼               ▼               ▼
   (3 responsabilités)  CardApiService   FilterService   CollectionService
                        "parle à l'API"  "état filtres"  "état du deck + localStorage"
                             │
                             ▼
   MODÈLES            Card · CardImage · CardSet · CardPrice · BanlistInfo
   (types partagés)   ApiResponse<T> · CardFilters · DeckEntry
```

> 🔑 **3 services = 3 responsabilités distinctes** :
> - **`CardApiService`** : *uniquement* les appels HTTP (aucun état).
> - **`FilterService`** : l'**état des filtres** de recherche (signals).
> - **`CollectionService`** : l'**état du deck** de l'utilisateur, persisté.
>
> C'est le **principe de responsabilité unique** (le « S » de SOLID). Si demain l'API change → seul `CardApiService` bouge.

### Arborescence cible

```
yugioh-app/src/
├── environments/environment.ts          ← l'URL de base de l'API
└── app/
    ├── app.routes.ts
    ├── models/                           ← UN fichier par concept
    │   ├── card.model.ts
    │   ├── card-image.model.ts
    │   ├── card-set.model.ts
    │   ├── card-price.model.ts
    │   ├── api-response.model.ts
    │   ├── card-filters.model.ts
    │   ├── deck.model.ts
    │   └── index.ts                      ← "barrel" : ré-exporte tout
    ├── services/
    │   ├── card-api.service.ts           ← HTTP
    │   ├── filter.service.ts             ← état des filtres
    │   └── collection.service.ts         ← état du deck (+ localStorage)
    └── pages/
        ├── card-list/
        ├── card-detail/
        └── deck/
```

---

## 🚀 ÉTAPE 0 — Créer le projet

```bash
cd tp7-yugioh-rest
ng new yugioh-app --style=scss --routing=true --skip-tests
cd yugioh-app
```

`src/environments/environment.ts` (crée le dossier/fichier si absent) :

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://db.ygoprodeck.com/api/v7',
};
```

Et active `provideHttpClient()` dans `src/app/app.config.ts` :

```typescript
import { provideHttpClient } from '@angular/common/http';
// ... dans providers: [ provideRouter(routes), provideHttpClient() ]
```

---

## 📦 ÉTAPE 1 — Les MODÈLES (plusieurs fichiers typés)

> 🔑 **Bonne pratique** : un **fichier par modèle**, des types **petits et composables**. On évite un gros fichier fourre-tout.

`models/card-image.model.ts` :
```typescript
export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}
```

`models/card-set.model.ts` :
```typescript
export interface CardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_price: string;
}
```

`models/card-price.model.ts` :
```typescript
export interface CardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
}
```

`models/card.model.ts` — le modèle central, qui **compose** les précédents :
```typescript
import { CardImage } from './card-image.model';
import { CardSet } from './card-set.model';
import { CardPrice } from './card-price.model';

export interface BanlistInfo {
  ban_tcg?: string;
  ban_ocg?: string;
}

export interface Card {
  id: number;
  name: string;
  type: string;          // ex: "Effect Monster", "Spell Card"
  frameType: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;    // ex: "DARK", "LIGHT"
  archetype?: string;
  card_sets?: CardSet[];
  card_images: CardImage[];
  card_prices?: CardPrice[];
  banlist_info?: BanlistInfo;
}
```

`models/api-response.model.ts` — l'**enveloppe** générique renvoyée par l'API :
```typescript
import { Card } from './card.model';

// L'API renvoie { data: [...], meta?: {...} }
export interface ApiResponse<T> {
  data: T[];
  meta?: {
    total_rows: number;
    pages_remaining: number;
  };
}

export type CardResponse = ApiResponse<Card>;
```

`models/card-filters.model.ts` — la forme des filtres de recherche :
```typescript
export interface CardFilters {
  fname?: string;      // recherche floue par nom
  type?: string;       // type de carte
  attribute?: string;  // attribut
  archetype?: string;
}
```

`models/deck.model.ts` :
```typescript
import { Card } from './card.model';

export interface DeckEntry {
  card: Card;
  quantite: number;    // 1 à 3 (règle Yu-Gi-Oh)
}
```

`models/index.ts` — le **barrel** (permet `import { Card, CardFilters } from '../models'`) :
```typescript
export * from './card.model';
export * from './card-image.model';
export * from './card-set.model';
export * from './card-price.model';
export * from './api-response.model';
export * from './card-filters.model';
export * from './deck.model';
```

> 🔑 Le **barrel** (`index.ts`) évite des lignes d'import à rallonge. On importe depuis `'../models'` au lieu de 7 chemins différents.

---

## 🛰️ ÉTAPE 2 — Service 1 : `CardApiService` (HTTP pur)

```bash
ng g service services/card-api
```

`services/card-api.service.ts` — **uniquement** des appels HTTP, **aucun état** :

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Card, CardResponse, CardFilters } from '../models';

@Injectable({ providedIn: 'root' })
export class CardApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  // Liste paginée + filtres. HttpParams construit proprement la query string.
  getCards(filters: CardFilters = {}, num = 20, offset = 0): Observable<CardResponse> {
    let params = new HttpParams().set('num', num).set('offset', offset);

    // On n'ajoute un paramètre QUE s'il est renseigné
    if (filters.fname)     params = params.set('fname', filters.fname);
    if (filters.type)      params = params.set('type', filters.type);
    if (filters.attribute) params = params.set('attribute', filters.attribute);
    if (filters.archetype) params = params.set('archetype', filters.archetype);

    return this.http.get<CardResponse>(`${this.base}/cardinfo.php`, { params });
  }

  // Une carte par id (l'API renvoie toujours un tableau -> on prend [0])
  getCardById(id: number): Observable<Card> {
    const params = new HttpParams().set('id', id);
    return this.http
      .get<CardResponse>(`${this.base}/cardinfo.php`, { params })
      .pipe(map(res => res.data[0]));
  }

  // Carte aléatoire (renvoie directement UN objet, pas une enveloppe)
  getRandomCard(): Observable<Card> {
    return this.http.get<Card>(`${this.base}/randomcard.php`);
  }
}
```

> 🔑 **`HttpParams`** construit la *query string* proprement (encodage automatique). On évite la concaténation manuelle `?num=20&offset=...`.
> 🔑 Ce service ne stocke **rien**. Il **traduit** juste « je veux des cartes » en requête HTTP. Testable, réutilisable.

---

## 🎚️ ÉTAPE 3 — Service 2 : `FilterService` (état des filtres)

```bash
ng g service services/filter
```

`services/filter.service.ts` — l'**état réactif** des filtres, partagé :

```typescript
import { Injectable, signal } from '@angular/core';
import { CardFilters } from '../models';

@Injectable({ providedIn: 'root' })
export class FilterService {
  // L'état des filtres, exposé en lecture seule
  private _filters = signal<CardFilters>({});
  filters = this._filters.asReadonly();

  // Listes pour les menus déroulants (constantes métier)
  readonly types = ['Effect Monster', 'Normal Monster', 'Spell Card', 'Trap Card', 'Fusion Monster'];
  readonly attributes = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'];

  setRecherche(fname: string) {
    this._filters.update(f => ({ ...f, fname: fname || undefined }));
  }
  setType(type: string) {
    this._filters.update(f => ({ ...f, type: type || undefined }));
  }
  setAttribute(attribute: string) {
    this._filters.update(f => ({ ...f, attribute: attribute || undefined }));
  }
  reset() {
    this._filters.set({});
  }
}
```

> 🔑 **Pourquoi un service séparé pour les filtres ?** Pour que l'état des filtres **survive** à la navigation et soit **partagé**. Le composant Liste lit `filters()`, le change via les méthodes, et déclenche une recherche.

---

## 🗂️ ÉTAPE 4 — Service 3 : `CollectionService` (deck + persistance)

```bash
ng g service services/collection
```

`services/collection.service.ts` — gère le **deck** de l'utilisateur, avec **persistance `localStorage`** :

```typescript
import { Injectable, signal, computed, effect } from '@angular/core';
import { Card, DeckEntry } from '../models';

const STORAGE_KEY = 'yugioh-deck';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  // On initialise depuis le localStorage (deck sauvegardé)
  private _deck = signal<DeckEntry[]>(this.charger());

  deck = this._deck.asReadonly();
  // Nombre total de cartes (somme des quantités) — recalculé automatiquement
  total = computed(() => this._deck().reduce((acc, e) => acc + e.quantite, 0));

  constructor() {
    // effect : à CHAQUE changement du deck, on sauvegarde. Magique.
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(this._deck())));
  }

  estDansDeck(id: number): boolean {
    return this._deck().some(e => e.card.id === id);
  }

  ajouter(card: Card) {
    this._deck.update(deck => {
      const existant = deck.find(e => e.card.id === card.id);
      if (existant) {
        // Règle Yu-Gi-Oh : max 3 exemplaires
        if (existant.quantite >= 3) return deck;
        return deck.map(e => e.card.id === card.id ? { ...e, quantite: e.quantite + 1 } : e);
      }
      return [...deck, { card, quantite: 1 }];
    });
  }

  retirer(id: number) {
    this._deck.update(deck => deck.filter(e => e.card.id !== id));
  }

  vider() {
    this._deck.set([]);
  }

  private charger(): DeckEntry[] {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }
}
```

> 🔑 **`effect()`** : Angular exécute ce bloc **à chaque fois** qu'un signal lu à l'intérieur change. Ici → sauvegarde auto dans `localStorage`. Le deck **survit au rafraîchissement** de la page.
> 🔑 Encore une fois : **état privé** (`_deck`), exposition **lecture seule** + **méthodes** métier (`ajouter`, `retirer`).

---

## 🧩 ÉTAPE 5 — Page Liste (`pages/card-list`)

```bash
ng g component pages/card-list
```

`card-list.component.ts` — orchestre les **3 services** :

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardApiService } from '../../services/card-api.service';
import { FilterService } from '../../services/filter.service';
import { CollectionService } from '../../services/collection.service';
import { Card } from '../../models';

@Component({
  selector: 'app-card-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './card-list.component.html',
})
export class CardListComponent implements OnInit {
  private api = inject(CardApiService);
  protected filters = inject(FilterService);     // état filtres (template)
  protected collection = inject(CollectionService); // état deck (template)

  cards = signal<Card[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  recherche = '';

  ngOnInit() { this.charger(); }

  charger() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getCards(this.filters.filters(), 24, 0).subscribe({
      next: res => { this.cards.set(res.data); this.loading.set(false); },
      error: () => { this.error.set('Erreur de chargement des cartes.'); this.loading.set(false); },
    });
  }

  rechercher() {
    this.filters.setRecherche(this.recherche);
    this.charger();
  }

  filtrerType(type: string)      { this.filters.setType(type); this.charger(); }
  filtrerAttribut(attr: string)  { this.filters.setAttribute(attr); this.charger(); }
  reinitialiser() { this.filters.reset(); this.recherche = ''; this.charger(); }
}
```

`card-list.component.html` :

```html
<header>
  <h1>🟡 Yu-Gi-Oh Explorer</h1>
  <a routerLink="/deck">🗂️ Mon deck ({{ collection.total() }})</a>
</header>

<form class="filtres" (submit)="$event.preventDefault(); rechercher()">
  <input [(ngModel)]="recherche" name="q" placeholder="Nom de la carte…" />

  <select (change)="filtrerType($any($event.target).value)">
    <option value="">— Type —</option>
    @for (t of filters.types; track t) { <option [value]="t">{{ t }}</option> }
  </select>

  <select (change)="filtrerAttribut($any($event.target).value)">
    <option value="">— Attribut —</option>
    @for (a of filters.attributes; track a) { <option [value]="a">{{ a }}</option> }
  </select>

  <button>Rechercher</button>
  <button type="button" (click)="reinitialiser()">Réinitialiser</button>
</form>

@if (loading()) {
  <p>⏳ Chargement…</p>
} @else if (error()) {
  <p class="error">❌ {{ error() }}</p>
} @else {
  <div class="grille">
    @for (c of cards(); track c.id) {
      <article class="carte">
        <a [routerLink]="['/carte', c.id]">
          <img [src]="c.card_images[0].image_url_small" [alt]="c.name" />
        </a>
        <h3>{{ c.name }}</h3>
        <button (click)="collection.ajouter(c)" [disabled]="collection.estDansDeck(c.id)">
          {{ collection.estDansDeck(c.id) ? '✓ Dans le deck' : '+ Ajouter' }}
        </button>
      </article>
    } @empty {
      <p>Aucune carte trouvée.</p>
    }
  </div>
}
```

---

## 📄 ÉTAPE 6 — Page Détail (`pages/card-detail`)

```bash
ng g component pages/card-detail
```

`card-detail.component.ts` :

```typescript
import { Component, inject, input, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardApiService } from '../../services/card-api.service';
import { Card } from '../../models';

@Component({
  selector: 'app-card-detail',
  imports: [RouterLink],
  templateUrl: './card-detail.component.html',
})
export class CardDetailComponent implements OnInit {
  private api = inject(CardApiService);
  id = input.required<string>();   // paramètre d'URL

  card = signal<Card | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.api.getCardById(Number(this.id())).subscribe({
      next: c => { this.card.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
```

`card-detail.component.html` — exploite les **modèles imbriqués** (sets, prix) :

```html
<a routerLink="/">← Retour</a>

@if (loading()) {
  <p>⏳ Chargement…</p>
} @else if (card(); as c) {
  <div class="detail">
    <img [src]="c.card_images[0].image_url" [alt]="c.name" width="280" />
    <div>
      <h1>{{ c.name }}</h1>
      <p><strong>Type :</strong> {{ c.type }} @if (c.attribute) { · {{ c.attribute }} }</p>
      @if (c.atk != null) { <p><strong>ATK/DEF :</strong> {{ c.atk }} / {{ c.def }}</p> }
      @if (c.level) { <p><strong>Niveau :</strong> {{ c.level }} ⭐</p> }
      @if (c.archetype) { <p><strong>Archétype :</strong> {{ c.archetype }}</p> }
      <p class="desc">{{ c.desc }}</p>

      @if (c.card_prices?.[0]) {
        <p><strong>Prix (Cardmarket) :</strong> {{ c.card_prices?.[0]?.cardmarket_price }} €</p>
      }

      <h3>Disponible dans {{ c.card_sets?.length || 0 }} set(s)</h3>
      <ul>
        @for (s of c.card_sets; track s.set_code) {
          <li>{{ s.set_name }} ({{ s.set_rarity }})</li>
        } @empty { <li>—</li> }
      </ul>
    </div>
  </div>
}
```

---

## 🗂️ ÉTAPE 7 — Page Deck (`pages/deck`)

```bash
ng g component pages/deck
```

`deck.component.ts` :

```typescript
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-deck',
  imports: [RouterLink],
  templateUrl: './deck.component.html',
})
export class DeckComponent {
  protected collection = inject(CollectionService);
}
```

`deck.component.html` :

```html
<a routerLink="/">← Retour à la liste</a>
<h1>🗂️ Mon deck — {{ collection.total() }} carte(s)</h1>

@if (collection.deck().length === 0) {
  <p>Ton deck est vide. Ajoute des cartes depuis la liste !</p>
} @else {
  <button (click)="collection.vider()">🗑️ Vider le deck</button>
  <ul class="deck">
    @for (entry of collection.deck(); track entry.card.id) {
      <li>
        <img [src]="entry.card.card_images[0].image_url_small" [alt]="entry.card.name" width="50" />
        <span>{{ entry.card.name }}</span>
        <span class="qte">× {{ entry.quantite }}</span>
        <button (click)="collection.ajouter(entry.card)" [disabled]="entry.quantite >= 3">+</button>
        <button (click)="collection.retirer(entry.card.id)">🗑️</button>
      </li>
    }
  </ul>
}
```

---

## 🧭 ÉTAPE 8 — Routes & lancement

`app.routes.ts` :
```typescript
import { Routes } from '@angular/router';
import { CardListComponent } from './pages/card-list/card-list.component';
import { CardDetailComponent } from './pages/card-detail/card-detail.component';
import { DeckComponent } from './pages/deck/deck.component';

export const routes: Routes = [
  { path: '', component: CardListComponent },
  { path: 'carte/:id', component: CardDetailComponent },
  { path: 'deck', component: DeckComponent },
  { path: '**', redirectTo: '' },
];
```

Active le binding de route dans `app.config.ts` (pour `input.required` du détail) :
```typescript
import { provideRouter, withComponentInputBinding } from '@angular/router';
// providers: [ provideRouter(routes, withComponentInputBinding()), provideHttpClient() ]
```

`app.component.html` → `<router-outlet />`. Puis :

```bash
ng serve -o
```

Teste : recherche « dragon », filtre par attribut, ouvre une carte, ajoute-la au deck, **rafraîchis la page** → le deck est **toujours là** (localStorage). 🎉

---

## 🧠 Concepts du jour (le cœur du TP)

- **Séparation des modèles** : un fichier par concept + un **barrel** `index.ts`. Types **composables** (`Card` contient `CardSet[]`, `CardImage[]`...).
- **Séparation des services** (responsabilité unique) :
  - **données** (`CardApiService`, HTTP pur),
  - **état des filtres** (`FilterService`),
  - **état du deck** (`CollectionService`, persistant).
- **`HttpParams`** pour construire les query strings proprement.
- **`environment.ts`** pour l'URL de base (jamais en dur).
- **Signals + `computed` + `effect`** pour l'état réactif et la persistance auto.
- **Routing** : liste / détail (`:id`) / deck.

---

## 🧠 Quiz

1. Pourquoi séparer `CardApiService`, `FilterService` et `CollectionService` au lieu d'un seul gros service ?
2. À quoi sert le fichier `models/index.ts` (le barrel) ?
3. Pourquoi mettre l'URL de l'API dans `environment.ts` ?
4. Que fait `effect()` dans `CollectionService` ?
5. Comment `HttpParams` est-il préférable à une concaténation `?num=20&...` ?
6. Pourquoi exposer `_deck` en `asReadonly()` et passer par des méthodes ?

---

## 🚀 Pour aller plus loin

1. **Pagination « charger plus »** : bouton qui incrémente `offset` et concatène les résultats.
2. **Debounce** : recherche automatique après 300 ms (RxJS `debounceTime` + `Subject`).
3. **`OnPush`** : passer les composants en `ChangeDetectionStrategy.OnPush` (perf).
4. **ArchetypeService** : un 4ᵉ service qui charge `/archetypes.php` pour un menu déroulant d'archétypes.
5. **Tri** : trier les cartes par ATK/niveau côté front.
6. **Statistiques du deck** : `computed` qui calcule la répartition Monstres/Magies/Pièges.

---

🎓 **Bravo !** Tu as construit une application Angular **bien architecturée** : modèles typés séparés, services à responsabilité unique, état partagé et persistant. C'est exactement ce qu'on attend d'une application **professionnelle** qui doit grossir et durer.
