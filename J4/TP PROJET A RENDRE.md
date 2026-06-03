# 🅰️ TP PROJET — Rick & Morty Explorer (Angular + GraphQL en bonus)

> **Projet de synthèse — Formation Angular**
> Tout ce que vous avez vu pendant les TP, réuni dans **une seule application**.

---

## ⏰ L'essentiel en 30 secondes

| | |
|---|---|
| 👤 **Travail** | **INDIVIDUEL** (aucun binôme) |
| 📅 **Date limite de rendu** | **jeudi avant 13h00** |
| 🎤 **Soutenances** | à partir de **jeudi matin** (démo + questions) |
| 📦 **Rendu** | un **dépôt GitHub public** (code + README + dossier `screenshots/`) |
| 📨 **Envoi** | le **lien du dépôt** sur **Teams** *ou* par mail à **contact.infosoftware@gmail.com** |
| ✉️ **Objet du message** | `Nom Prénom — TP Projet Angular` |

> ⚠️ Tout rendu après **jeudi 13h00** est considéré en retard.


---

## 🎯 Le projet : **Rick & Morty Explorer**

Vous développez une SPA Angular qui explore **3 ressources liées** de l'API
**imposée** : **`https://rickandmortyapi.com`**.

- **Personnages** (Characters) — `https://rickandmortyapi.com/api/character`
- **Lieux** (Locations) — `https://rickandmortyapi.com/api/location`
- **Épisodes** (Episodes) — `https://rickandmortyapi.com/api/episode`

Chaque endpoint renvoie un objet `{ info, results }` :
`info = { count, pages, next, prev }` et `results = [ … ]`.
Filtres et pagination via query params, ex : `/api/character?page=2&name=rick&status=alive`.

**Les ressources sont liées** : un personnage a une origine + un lieu actuel et une
liste d'épisodes ; un lieu a une liste de résidents (personnages) ; un épisode a une
liste de personnages. Vous **devez** exploiter ces liens (voir Bloc B).

---

## ✅ Travail à réaliser

Faites **exactement** ce qui suit. Les rappels de TP sont indiqués 👉.

### 🅰️ Bloc A — Modèles & Services

**Créez ces 5 fichiers de modèles dans `src/app/models/` :**

1. `info.model.ts` → interface **`Info`** : `count: number`, `pages: number`, `next: string | null`, `prev: string | null`.
2. `api-response.model.ts` → interface générique **`ApiResponse<T>`** : `info: Info`, `results: T[]`.
3. `character.model.ts` → interface **`Character`** : `id`, `name`, `status`, `species`, `type`, `gender`, `image`, `origin: { name; url }`, `location: { name; url }`, `episode: string[]`, `url`.
4. `location.model.ts` → interface **`Location`** : `id`, `name`, `type`, `dimension`, `residents: string[]`, `url`.
5. `episode.model.ts` → interface **`Episode`** : `id`, `name`, `air_date`, `episode`, `characters: string[]`, `url`.

**Créez ces 5 services dans `src/app/services/` (tous `@Injectable({ providedIn: 'root' })`) :**

1. **`CharacterService`** :
   - `getAll(page: number, name?: string, status?: string): Observable<ApiResponse<Character>>`
   - `getById(id: number): Observable<Character>`
   - `getMany(ids: number[]): Observable<Character[]>` *(pour `/api/character/1,2,3`)*
2. **`LocationService`** : `getAll(page: number)` et `getById(id: number)`.
3. **`EpisodeService`** : `getAll(page: number)`, `getById(id: number)`, `getMany(ids: number[])`.
4. **`FavorisService`** (état des personnages favoris) :
   - un **`signal`** `favoris` (liste de `Character`),
   - `toggle(c: Character)`, `isFavori(id: number): boolean`,
   - un **`computed`** `nombre`,
   - persistance via `StorageService`.
5. **`StorageService`** : `get<T>(key: string): T | null` et `set(key: string, value: unknown): void` (encapsule `localStorage`).

👉 *Rappel TP — Services & DI + HttpClient* : **aucun appel HTTP dans un composant**,
réponses **typées** avec les génériques, et gérez les états **loading** + **erreur**.
💡 **Astuce relations** : les champs `episode`, `residents`, `characters` sont des
**URLs** ; extrayez l'`id` à la fin de l'URL (`url.split('/').pop()`) pour appeler `getMany`.

### 🅱️ Bloc B — Pages & Navigation

**Créez ces 10 pages dans `src/app/pages/` :**

| Page | Rôle |
|---|---|
| `dashboard` | **Page d'accueil** avec statistiques (voir Bloc C) |
| `characters-list` | Liste paginée des personnages + recherche + filtre `status` |
| `character-detail` | Fiche d'un personnage |
| `locations-list` | Liste paginée des lieux |
| `location-detail` | Fiche d'un lieu |
| `episodes-list` | Liste paginée des épisodes |
| `episode-detail` | Fiche d'un épisode |
| `favoris` | Liste des personnages mis en favori |
| `contact` | Formulaire réactif (Bloc C) |
| `not-found` | Page 404 |

**Mettez en place ces routes dans `app.routes.ts` :**

```
''                      → redirige vers 'dashboard'
'dashboard'             → DashboardComponent
'characters'            → CharactersListComponent
'characters/:id'        → CharacterDetailComponent
'locations'             → LocationsListComponent
'locations/:id'         → LocationDetailComponent
'episodes'              → EpisodesListComponent
'episodes/:id'          → EpisodeDetailComponent
'favoris'               → loadComponent (LAZY)
'contact'               → loadComponent (LAZY)
'**'                    → NotFoundComponent
```

👉 *Rappel TP — Routing* : activez `withComponentInputBinding()` et récupérez l'`id`
de route via `input.required<string>()` dans les pages détail.

**Implémentez ces navigations entre ressources liées (obligatoire) :**

- Dans **`character-detail`** : afficher l'**origine** et le **lieu actuel** (liens cliquables vers `locations/:id`) **et** la liste des **épisodes** du personnage (cartes cliquables vers `episodes/:id`).
- Dans **`location-detail`** : afficher la liste des **résidents** (personnages, cliquables vers `characters/:id`).
- Dans **`episode-detail`** : afficher la liste des **personnages** de l'épisode (cliquables vers `characters/:id`).

### 🅲️ Bloc C — Interactions

- **Recherche** (page `characters-list`) : un champ qui filtre par **nom**, avec
  **`debounceTime(300)` + `distinctUntilChanged()` + `switchMap()`** vers `CharacterService.getAll`.
  Ajoutez un **filtre par `status`** (alive / dead / unknown).
  👉 *Rappel TP — RxJS*.
- **Pagination** : boutons *Précédent / Suivant* sur les 3 listes, en utilisant `info.pages`.
- **Favoris** : sur chaque carte de personnage, un bouton ⭐ ajoute/retire le favori.
  Les favoris sont **persistés** : après un rechargement de page, ils sont **toujours là**.
  👉 *Rappel TP — Signals* (`signal` + `computed` dans `FavorisService`).
- **Dashboard** : affichez ces statistiques calculées avec des **`computed`** :
  - le **total** de personnages, de lieux et d'épisodes (via `info.count` des 3 endpoints) ;
  - le **nombre de favoris** ;
  - la **répartition des favoris par statut** (Alive / Dead / unknown).
- **Formulaire de contact** (page `contact`) : un **Reactive Form** avec 3 champs et
  ces validateurs :
  - `nom` → `required`, `minLength(3)` ;
  - `email` → `required`, `email` ;
  - `message` → `required`, `minLength(10)`.
  Le bouton *Envoyer* est **désactivé** tant que le formulaire est invalide ; affichez
  les **messages d'erreur** sous chaque champ et un **message de succès** à la soumission.
  👉 *Rappel TP — Formulaires* : `FormBuilder`, `FormGroup`, `Validators`.

### 🅳️ Bloc D — Composants, pipes & qualité

**Créez ces 5 composants « dumb » réutilisables dans `src/app/components/` :**

1. **`CharacterCardComponent`** : `input()` un `Character`, `output()` un évènement *toggleFavori*.
2. **`SearchBarComponent`** : `output()` le terme de recherche.
3. **`PaginatorComponent`** : `input()` `currentPage` et `totalPages`, `output()` *prev* / *next*.
4. **`LoaderComponent`** : un indicateur de chargement.
5. **`ErrorMessageComponent`** : `input()` un message, `output()` *retry*.

**Créez ces 2 pipes dans `src/app/pipes/` :**

1. **`StatusPipe`** : transforme `'Alive' → '🟢 Vivant'`, `'Dead' → '🔴 Mort'`, `'unknown' → '⚪ Inconnu'`.
2. **`TruncatePipe`** : tronque un texte à N caractères (`{{ texte | truncate:80 }}`).

**Règles de qualité à respecter :**
- `ChangeDetectionStrategy.OnPush` sur les 5 composants « dumb » et sur les pages liste/détail.
- **Désabonnement propre** : utilisez le **`pipe async`** (ou `takeUntilDestroyed()`), jamais de `subscribe()` non nettoyé.
- **TypeScript strict**, **aucun `any`**.
- Architecture en dossiers : `pages/`, `components/`, `services/`, `models/`, `pipes/`.

---

## 🌟 BONUS — GraphQL (+ points)

L'API Rick & Morty expose un **endpoint GraphQL** : **`https://rickandmortyapi.com/graphql`**.

À faire pour le bonus :
1. Installez et configurez **`apollo-angular`** (`provideApollo`, `InMemoryCache`).
2. Remplacez **au moins une** des listes (ex : personnages) par une requête **GraphQL** `gql` avec **variables** (pagination + recherche).
3. Tirez parti des **relations en un seul appel** — exemple :

```graphql
query ($page: Int, $name: String) {
  characters(page: $page, filter: { name: $name }) {
    info { count pages next prev }
    results {
      id name status image
      location { id name }
      episode { id name }
    }
  }
}
```

4. Dans le README, **expliquez** l'avantage de GraphQL ici : récupérer un personnage
   **avec son lieu et ses épisodes en une seule requête**, alors qu'en REST il faut
   plusieurs appels (under-fetching) → c'est l'intérêt majeur.

> 💡 *Indices du TP DigiDex* : vérifiez l'**uri** dans `app.config.ts` (pas de
> placeholder oublié) ; `valueChanges` émet d'abord `data: undefined` → **filtrez**
> avant le `map` ; importez `InMemoryCache` depuis `@apollo/client/core`.

---

## ❓ Questions à répondre *(dans le README, section « Réponses »)*

Répondez en 2–4 phrases chacune. Elles seront reprises en soutenance.

1. Différence entre un composant **« smart »** et **« dumb »** ? Citez un exemple **de votre projet** (ex : page vs `CharacterCardComponent`).
2. Pourquoi **`OnPush`** ? Quel lien avec l'**immutabilité** des données ?
3. Pourquoi le **`pipe async`** plutôt qu'un `subscribe()` manuel ? Quel **risque** évite-t-on ?
4. `providedIn: 'root'` : quel **design pattern** ? Combien d'instances de `CharacterService` existe-t-il ?
5. Différence entre un **`signal`** et un **`BehaviorSubject`** ? Pourquoi avez-vous choisi un `signal` pour les favoris ?
6. Pour la recherche : pourquoi **`switchMap`** (et pas `mergeMap`) ? À quoi sert `debounceTime` ?
7. **Reactive Forms** vs **Template-driven** : pourquoi le projet impose le réactif ?
8. Comment avez-vous récupéré les **relations** (épisodes d'un personnage, résidents d'un lieu) à partir des URLs ?
9. Qu'apporte le **lazy loading** des routes `favoris` et `contact` ?
10. *(Bonus)* GraphQL vs REST : montrez avec votre requête comment GraphQL évite plusieurs appels.

---

## 📸 Captures d'écran OBLIGATOIRES *(dossier `screenshots/` du dépôt)*

- [ ] `01-characters-list.png` — la liste paginée des personnages
- [ ] `02-recherche-filtre.png` — recherche par nom + filtre status
- [ ] `03-character-detail.png` — fiche personnage
- [ ] `04-relations.png` — depuis un personnage : lien vers son **lieu** et ses **épisodes**
- [ ] `05-location-detail.png` — fiche lieu avec ses **résidents**
- [ ] `06-favoris.png` — un favori ⭐ **toujours présent après rechargement**
- [ ] `07-dashboard.png` — le tableau de bord avec les statistiques
- [ ] `08-contact-erreurs.png` — le formulaire avec messages de validation
- [ ] `09-loading-erreur.png` — état *chargement* et/ou état *erreur*
- [ ] `10-arborescence.png` — structure des dossiers (`pages/ components/ services/ models/ pipes/`)
- [ ] *(bonus)* `11-graphql.png` — une requête GraphQL (onglet **Network** ou **Apollo Sandbox**)

---

## 📦 Structure attendue du dépôt

```
rick-and-morty-explorer/
├── README.md            ← présentation, install/run, patterns, RÉPONSES aux questions
├── .gitignore           ← node_modules/ exclu !
├── screenshots/         ← toutes les captures demandées
└── src/app/
    ├── pages/           ← dashboard, characters-list, character-detail, locations-list,
    │                       location-detail, episodes-list, episode-detail, favoris,
    │                       contact, not-found
    ├── components/      ← character-card, search-bar, paginator, loader, error-message
    ├── services/        ← character, location, episode, favoris, storage
    ├── models/          ← character, location, episode, info, api-response
    ├── pipes/           ← status, truncate
    ├── app.routes.ts
    └── app.config.ts
```

Le **README** doit contenir : nom du projet, **comment lancer** (`npm install` / `npm start`),
liste des fonctionnalités réalisées (cochées), **design patterns** utilisés (où et pourquoi),
**réponses aux 10 questions**, et les **captures**.

---

## 📊 Barème (/20)

| Critère | Points |
|---|---|
| Bloc A — 5 modèles + 5 services, HTTP typé, états loading/erreur | **5** |
| Bloc B — 10 pages, routes, **relations entre ressources**, lazy loading, 404 | **4** |
| Bloc C — recherche RxJS, pagination, favoris persistants, dashboard, formulaire validé | **4** |
| Bloc D — 5 composants dumb, 2 pipes, OnPush, désabonnement, typage strict | **2** |
| Git (commits réguliers) + README complet + réponses aux questions | **3** |
| Soutenance / démo orale | **2** |
| 🌟 **Bonus GraphQL** | **+2 à +3** |

> Une appli qui **ne compile pas** ou **ne se lance pas** est lourdement pénalisée →
> testez `npm install` sur un dossier propre avant de rendre.

---

## 🧠 Conseils & pièges à éviter *(retours d'expérience des TP)*

- ✅ **Commencez par les personnages** (modèle → service → liste → détail), puis **dupliquez** le schéma pour les lieux et les épisodes.
- ✅ **Factorisez** : `CharacterCardComponent`, `LoaderComponent`, `PaginatorComponent` servent partout.
- ✅ **Relations** : `character.episode` = des URLs → extrayez les `id` (`url.split('/').pop()`) → `getMany`.
- ✅ **Control flow** : l'alias `as` est autorisé **uniquement sur le `@if` principal**, **jamais sur `@else if`** (erreur `NG5002`). Imbriquez : `@else { @if (data(); as d) {…} }`.
- ✅ **Après modif de `app.config.ts`**, **redémarrez `ng serve`** (pas géré par le HMR) + **hard refresh** (`Ctrl+Shift+R`).
- ✅ **Gérez le `loading`** : HttpClient → spinner + gestion d'erreur. Apollo → `data` `undefined` au début, **filtrez**.
- ✅ **N'envoyez pas `node_modules`** dans Git (`.gitignore`).
- ✅ **Committez régulièrement** : un seul commit « final » est mal vu.

---

## ✔️ Checklist avant de rendre

- [ ] L'appli **se lance** sans erreur (`npm install` puis `npm start`).
- [ ] **5 modèles** + **5 services** créés et utilisés.
- [ ] **10 pages** + routes + **relations** + lazy (`favoris`, `contact`) + 404.
- [ ] **5 composants dumb** + **2 pipes**.
- [ ] Recherche RxJS, pagination, favoris **persistants**, dashboard, formulaire validé.
- [ ] `OnPush`, désabonnement propre, **aucun `any`**.
- [ ] **README** complet + **réponses aux 10 questions**.
- [ ] Dossier **`screenshots/`** rempli.
- [ ] **`node_modules/` exclu**, dépôt **public**, commits réguliers.
- [ ] Lien envoyé sur **Teams** ou à **contact.infosoftware@gmail.com** avant **jeudi 13h00**, objet `Nom Prénom — TP Projet Angular`.

---

**Bon courage ! 🚀**
