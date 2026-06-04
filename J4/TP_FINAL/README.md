# Rick & Morty Explorer — TP Projet Angular

SPA Angular qui explore le multivers via l'API **Rick and Morty** (`https://rickandmortyapi.com`).

## Installation et lancement

```bash
npm install
npm start
```

Ouvrir `http://localhost:4200`.

> **GraphQL (bonus)** : `npm start` active le proxy vers `/graphql`. Si tu vois **404** sur `POST /graphql`, arrête l’ancien `ng serve` (Ctrl+C) et relance — un serveur lancé avant le proxy ne l’applique pas. Dans Network, l’URL doit être `localhost:4200/graphql`, pas `rickandmortyapi.com`.

## Fonctionnalites realisees

- [x] 5 modeles (`Info`, `ApiResponse`, `Character`, `Location`, `Episode`)
- [x] 5 services (`CharacterService`, `LocationService`, `EpisodeService`, `FavorisService`, `StorageService`)
- [x] 10 pages + routes + lazy loading (`favoris`, `contact`) + 404
- [x] Relations entre ressources (lieux, episodes, residents)
- [x] Recherche RxJS (`debounceTime`, `distinctUntilChanged`, `switchMap`)
- [x] Pagination sur les 3 listes
- [x] Favoris persistants (`localStorage`)
- [x] Dashboard avec statistiques et repartition des favoris
- [x] Formulaire de contact reactif valide
- [x] 5 composants dumb + 2 pipes + `OnPush`
- [x] **Bonus GraphQL** : liste personnages via `https://rickandmortyapi.com/graphql` (Apollo)

## Design patterns

| Pattern | Ou | Pourquoi |
|---|---|---|
| Singleton (`providedIn: 'root'`) | Tous les services | Une seule instance partagee |
| Smart / Dumb | Pages vs `CharacterCardComponent` | Separation UI / logique |
| Repository-like | Services HTTP | Aucun appel HTTP dans les composants |
| State local reactif | `FavorisService` (signals) | Favoris partages et persistes |
| Lazy loading | Routes `favoris`, `contact` | Chargement a la demande |

## Reponses aux questions

1. **Smart vs dumb** : une page smart orchestre services et etat (`CharactersListComponent`), un dumb affiche (`CharacterCardComponent` recoit un `input()` et emet `toggleFavori`).
2. **OnPush** : Angular ne verifie le composant que si ses `@input` changent (reference). Cela encourage l'immutabilite des donnees.
3. **`async` pipe** : gere l'abonnement/desabonnement automatiquement ; evite les fuites memoire d'un `subscribe()` oublie.
4. **`providedIn: 'root'`** : pattern Singleton — une seule instance de `CharacterService` pour toute l'app.
5. **Signal vs BehaviorSubject** : signal plus simple pour un etat local synchrone (favoris) ; BehaviorSubject utile pour des flux RxJS multi-emissions.
6. **`switchMap`** : annule la requete precedente si une nouvelle recherche arrive ; `debounceTime(300)` attend la fin de frappe.
7. **Reactive Forms** : validation structuree, testable, controle fine des erreurs champ par champ.
8. **Relations** : extraction d'id depuis les URLs (`extraireIdDepuisUrl`) puis `getMany` sur character/episode.
9. **Lazy loading** : le bundle initial est plus leger ; `favoris` et `contact` ne chargent qu'a la navigation.
10. **GraphQL (bonus)** : `CharacterGraphqlService` — une requête `gql` avec variables `page`, `name`, `status` renvoie personnages + `location` + `episode` ; le reste de l'app reste en REST.

## Arborescence

```
src/app/
├── pages/
├── components/
├── graphql.provider.ts
├── services/
│   └── character-graphql.service.ts  (bonus)
├── models/
├── pipes/
├── utils/
├── app.routes.ts
└── app.config.ts
```
