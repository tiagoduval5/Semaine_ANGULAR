# 🟣 TP DigiDex (1/2) — Construire un serveur GraphQL (Apollo Server)

> **Objectif** : comprendre **GraphQL côté serveur** en construisant une petite **passerelle (gateway)** qui expose les Digimon via un **schéma GraphQL**, en allant chercher les données dans l'API REST publique **`digi-api.com`**.
>
> 🎓 **L'idée pédagogique forte** : GraphQL n'est **pas** une base de données, c'est un **langage de requête** posé devant une (ou plusieurs) source(s) de données. Ici, on apprend en faisant du **« GraphQL au-dessus de REST »** : le serveur GraphQL appelle une API REST existante et la ré-expose proprement. C'est un usage **très courant en entreprise**.
>
> 🔗 La **partie 2** (`digidex-app/README.md`) construit le client **Angular + Apollo** qui consomme ce serveur.

---

## 🤔 REST vs GraphQL — pourquoi ce TP ?

| | REST (TP précédents) | GraphQL (ce TP) |
|---|---|---|
| **Endpoints** | Plusieurs URLs (`/digimon`, `/digimon/1`...) | **Une seule** URL (`/graphql`) |
| **Données renvoyées** | Le serveur **décide** quels champs | Le **client** demande **exactement** les champs voulus |
| **Sur-récupération** (*over-fetching*) | Fréquente (on reçoit tout) | Évitée (on ne reçoit que le demandé) |
| **Sous-récupération** (*under-fetching*) | Plusieurs allers-retours | Tout en **une requête** (champs imbriqués) |
| **Typage** | Pas natif | **Schéma fortement typé** (auto-documenté) |

> 🔑 Exemple concret : pour afficher une carte Digimon (juste nom + image), en REST tu reçois **tout** l'objet (descriptions, skills, évolutions...). En GraphQL tu écris `{ digimon(id:1){ name images{href} } }` et tu ne reçois **que ça**.

---

## 🏗️ Architecture du TP DigiDex

```
┌───────────────────────────┐   GraphQL    ┌────────────────────────┐   REST/JSON   ┌──────────────────┐
│  ANGULAR (digidex-app)     │ ──query────► │  SERVEUR GraphQL        │ ──GET───────► │  digi-api.com     │
│  Apollo Angular            │ ◄─data────── │  (digidex-api)          │ ◄─JSON─────── │  (API publique)   │
│  http://localhost:4200     │              │  http://localhost:4000  │               │                  │
└───────────────────────────┘              └────────────────────────┘               └──────────────────┘
        CE QU'ON FAIT EN PARTIE 2                 CE QU'ON FAIT ICI (PARTIE 1)
```

### Arborescence du serveur

```
digidex-api/
├── package.json
├── src/
│   ├── index.js              ← démarre le serveur Apollo
│   ├── schema.js             ← le SCHÉMA GraphQL (types + queries)  ← le cœur
│   ├── resolvers.js          ← les RESOLVERS (comment obtenir la donnée)
│   └── datasource.js         ← appels HTTP vers digi-api.com (fetch)
```

> 🔑 **Bonne pratique** : on **sépare** le *schéma* (le « contrat »), les *resolvers* (la logique) et la *source de données* (les appels REST). Trois fichiers, trois responsabilités.

---

## 🧰 Prérequis

```bash
node -v   # 18+ (fetch est natif à partir de Node 18)
```

---

## 🚀 ÉTAPE 0 — Initialiser le projet Node

```bash
cd tp6-digidex-graphql/digidex-api
npm init -y
npm install @apollo/server graphql
```

Puis, dans le `package.json`, ajoute `"type": "module"` (pour utiliser la syntaxe `import`) et un script de démarrage :

```jsonc
{
  "name": "digidex-api",
  "version": "1.0.0",
  "type": "module",                 // ← active les modules ES (import/export)
  "scripts": {
    "start": "node src/index.js"     // ← npm start
  },
  "dependencies": {
    "@apollo/server": "...",
    "graphql": "..."
  }
}
```

> 📌 `@apollo/server` = le serveur GraphQL. `graphql` = la bibliothèque de référence (le moteur). On n'a **pas** besoin d'Express : Apollo Server embarque son propre serveur HTTP.

---

## 📜 ÉTAPE 1 — Le SCHÉMA GraphQL (`src/schema.js`)

Le **schéma** est le **contrat** de l'API : il décrit les **types** de données et les **queries** disponibles. On l'écrit en **SDL** (*Schema Definition Language*).

```javascript
// Le schéma est une simple chaîne de caractères en langage SDL.
export const typeDefs = `#graphql
  # ----- TYPES (la forme des données) -----

  type Image {
    href: String
    transparent: Boolean
  }

  type Evolution {
    id: Int
    digimon: String
    condition: String
    image: String
  }

  # Le type principal. Le "!" signifie "non null" (obligatoire).
  type Digimon {
    id: Int!
    name: String!
    releaseDate: String
    xAntibody: Boolean
    images: [Image!]          # une LISTE d'images
    levels: [String!]         # ex: ["Child"]
    types: [String!]          # ex: ["Reptile"]
    attributes: [String!]     # ex: ["Vaccine"]
    descriptions: [String!]   # descriptions en anglais
    priorEvolutions: [Evolution!]
    nextEvolutions: [Evolution!]
  }

  # Un type "page" pour la pagination de la liste
  type DigimonPage {
    items: [DigimonSummary!]!
    totalElements: Int
    totalPages: Int
    currentPage: Int
  }

  # Version "légère" pour la liste (pas tous les détails)
  type DigimonSummary {
    id: Int!
    name: String!
    image: String
  }

  # ----- QUERIES (les points d'entrée en LECTURE) -----
  type Query {
    # Liste paginée. Arguments avec valeurs par défaut.
    digimons(page: Int = 0, pageSize: Int = 20, name: String): DigimonPage!

    # Détail d'un Digimon par son id
    digimon(id: Int!): Digimon

    # Détail par son nom
    digimonByName(name: String!): Digimon
  }
`;
```

> 🔑 **Tout est typé.** `[Image!]` = liste d'images. `Int!` = entier obligatoire. `String` = texte optionnel. Ce schéma **se documente tout seul** : le client saura exactement ce qu'il peut demander.
>
> 🔑 **Les arguments** (`digimons(page, pageSize, name)`) permettent au client de **paramétrer** sa requête — c'est l'équivalent des query params REST, mais typés.

---

## 🌐 ÉTAPE 2 — La source de données (`src/datasource.js`)

On isole ici **tous les appels HTTP** vers l'API REST `digi-api.com`. (Node 18+ a `fetch` natif.)

```javascript
const BASE = 'https://digi-api.com/api/v1';

// Liste paginée. L'API renvoie { content: [...], pageable: {...} }
export async function fetchDigimons({ page, pageSize, name }) {
  let url = `${BASE}/digimon?page=${page}&pageSize=${pageSize}`;
  if (name) url += `&name=${encodeURIComponent(name)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  const data = await res.json();

  return {
    items: data.content.map(d => ({ id: d.id, name: d.name, image: d.image })),
    totalElements: data.pageable?.totalElements,
    totalPages: data.pageable?.totalPages,
    currentPage: data.pageable?.currentPage,
  };
}

// Détail (par id OU par nom : l'API accepte les deux dans la même route)
export async function fetchDigimon(idOrName) {
  const res = await fetch(`${BASE}/digimon/${idOrName}`);
  if (res.status === 404) return null;       // introuvable
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  return res.json();
}
```

> 📌 **Bonne pratique** : aucune logique GraphQL ici, juste du HTTP « brut ». Si l'API REST change d'URL, **seul ce fichier** bouge.

---

## 🧩 ÉTAPE 3 — Les RESOLVERS (`src/resolvers.js`)

Un **resolver** est une fonction qui dit **comment obtenir la valeur** d'un champ. Pour chaque query du schéma, on écrit une fonction.

```javascript
import { fetchDigimons, fetchDigimon } from './datasource.js';

// Transforme la réponse REST "riche" en notre type Digimon "propre"
function mapDigimon(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    releaseDate: raw.releaseDate,
    xAntibody: raw.xAntibody,
    images: raw.images ?? [],
    levels: (raw.levels ?? []).map(l => l.level),
    types: (raw.types ?? []).map(t => t.type),
    attributes: (raw.attributes ?? []).map(a => a.attribute),
    // On ne garde que les descriptions en anglais
    descriptions: (raw.descriptions ?? [])
      .filter(d => d.language === 'en_us')
      .map(d => d.description),
    priorEvolutions: raw.priorEvolutions ?? [],
    nextEvolutions: raw.nextEvolutions ?? [],
  };
}

export const resolvers = {
  Query: {
    // Chaque resolver reçoit (parent, arguments, contexte, info)
    digimons: async (_parent, args) => {
      return fetchDigimons(args);   // args = { page, pageSize, name }
    },

    digimon: async (_parent, { id }) => {
      const raw = await fetchDigimon(id);
      return mapDigimon(raw);
    },

    digimonByName: async (_parent, { name }) => {
      const raw = await fetchDigimon(name);
      return mapDigimon(raw);
    },
  },
};
```

> 🔑 **Le rôle d'un resolver** : « pour cette query, va chercher la donnée et renvoie-la **dans la forme décrite par le schéma** ». GraphQL se charge ensuite de ne renvoyer au client **que les champs qu'il a demandés**.
>
> 🔑 La fonction `mapDigimon` **aplatit** la réponse REST (qui imbrique `levels: [{level:"Child"}]`) en quelque chose de simple (`levels: ["Child"]`). C'est le serveur GraphQL qui « nettoie » la donnée pour le client.

---

## ▶️ ÉTAPE 4 — Démarrer le serveur (`src/index.js`)

```javascript
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// On assemble schéma + resolvers
const server = new ApolloServer({ typeDefs, resolvers });

// Démarre un serveur HTTP autonome sur le port 4000
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Serveur GraphQL prêt sur ${url}`);
```

Lance-le :

```bash
npm start
# 🚀 Serveur GraphQL prêt sur http://localhost:4000/
```

---

## 🧪 ÉTAPE 5 — Tester dans l'Apollo Sandbox

Ouvre **<http://localhost:4000>** dans le navigateur → l'**Apollo Sandbox** s'ouvre (un terrain de jeu interactif). Teste ces requêtes :

**1. La liste (recherche + pagination) :**
```graphql
query {
  digimons(page: 0, pageSize: 5) {
    totalElements
    items {
      id
      name
      image
    }
  }
}
```

**2. Le détail — note qu'on demande EXACTEMENT les champs voulus :**
```graphql
query {
  digimon(id: 1) {
    name
    levels
    types
    images { href }
    nextEvolutions {
      digimon
      condition
    }
  }
}
```

**3. Une query avec variable (comme le fera Angular) :**
```graphql
query GetDigimon($id: Int!) {
  digimon(id: $id) {
    name
    descriptions
  }
}
```
> Dans le panneau **Variables** en bas : `{ "id": 4 }`

> 🤯 **Observe la différence avec REST** : dans la requête 2, change les champs demandés (enlève `nextEvolutions`) → la réponse change **immédiatement**. Le client est **maître** de ce qu'il reçoit. C'est ÇA, GraphQL.

---

## 🧠 Concepts du jour

- **Schéma (SDL)** : le contrat typé de l'API (`type`, `Query`, `!`, `[ ]`).
- **Query** : point d'entrée en lecture, avec des **arguments** typés.
- **Resolver** : fonction qui fournit la donnée d'un champ `(parent, args, context, info)`.
- **GraphQL au-dessus de REST** : un usage pro courant — GraphQL agrège/nettoie une ou plusieurs API REST.
- **Une seule URL** (`/graphql`), le client **choisit ses champs** → fini l'over/under-fetching.

---

## 🧠 Quiz

1. En une phrase : quelle est la différence fondamentale entre REST et GraphQL côté client ?
2. À quoi sert le `!` dans `id: Int!` ?
3. Que fait un resolver ? Quels sont ses arguments ?
4. Pourquoi GraphQL expose-t-il **une seule** URL alors que REST en a plusieurs ?
5. Dans ce TP, GraphQL est-il une base de données ? Que fait-il réellement ?

---

## 🚀 Pour aller plus loin

1. **Resolver de champ imbriqué** : faire en sorte que `nextEvolutions` aille chercher le détail complet de chaque évolution (résolution « à la demande »).
2. **Mutation** : ajouter une `Mutation` (ex. un système de favoris stocké en mémoire serveur).
3. **DataLoader** : mettre en cache les appels REST pour éviter les requêtes répétées.
4. **Gestion d'erreurs** : renvoyer des erreurs GraphQL propres (`GraphQLError`).

---

➡️ **Serveur prêt sur `:4000` !** Laisse-le tourner, puis passe à la **partie 2** : `digidex-app/README.md` pour construire le client **Angular + Apollo**.
