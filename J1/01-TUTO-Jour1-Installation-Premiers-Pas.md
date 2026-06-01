# 📅 Jour 1 — Installation & premiers pas avec Angular

> **Durée** : 1 journée (7h)
> **Objectif** : À la fin de la journée, tu auras installé Angular, créé ta première application, compris l'architecture en composants, et mis en pratique avec un mini-exercice guidé.

---

## 🎯 Ce que tu vas apprendre

- Installer Node.js, npm et Angular CLI
- Créer un projet Angular
- Comprendre la structure des fichiers
- Créer ton premier composant
- Lancer et déboguer ton application

---

## ÉTAPE 1 — Installer Node.js et npm

### 1.1 Vérifier si tu as déjà Node

Ouvre un terminal (PowerShell sur Windows, Terminal sur Mac/Linux) :

```bash
node --version
npm --version
```

✅ **Si tu vois `v20.x` ou plus** → passe à l'étape 2.
❌ **Si erreur** → installe Node.js.

### 1.2 Installer Node.js

1. Va sur 👉 https://nodejs.org
2. Télécharge la version **LTS** (Long Term Support)
3. Installe en cliquant **Suivant** partout
4. **Redémarre ton terminal**
5. Re-vérifie : `node --version`

> 💡 **Astuce pro** : utilise **nvm** (Node Version Manager) pour gérer plusieurs versions de Node sans douleur. Sur Windows : `nvm-windows`. Sur Mac/Linux : `nvm`.

---

## ÉTAPE 2 — Installer Angular CLI

Angular CLI est l'outil en ligne de commande qui automatise tout (création de projet, génération de composants, build).

```bash
npm install -g @angular/cli
```

> ⚠️ Sur Windows, si tu as une erreur de permission, ouvre PowerShell **en administrateur**.
> Sur Mac/Linux, ajoute `sudo` devant la commande.

### Vérifier l'installation

```bash
ng version
```

Tu dois voir un grand logo Angular et un tableau avec les versions.

---

## ÉTAPE 3 — Créer ton premier projet

### 3.1 Choisir un dossier

```bash
cd Desktop          # ou un dossier de ton choix
mkdir formation-angular
cd formation-angular
```

### 3.2 Créer le projet

```bash
ng new mon-premier-projet
```

Angular CLI te pose des questions :

| Question | Réponse recommandée |
|---|---|
| Which stylesheet format would you like to use? | **SCSS** (plus puissant que CSS) |
| Do you want to enable Server-Side Rendering (SSR)? | **No** (pour démarrer simple) |
| Zoneless ? | **No** (par défaut, on apprend avec Zone.js) |

⏳ Patiente 1-2 minutes (npm installe ~1 Go de dépendances).

### 3.3 Lancer l'application

```bash
cd mon-premier-projet
ng serve --open
```

→ Ton navigateur s'ouvre sur `http://localhost:4200`. **Tu vois la page d'accueil Angular**. 🎉

> 🔥 **Hot reload** : modifie un fichier, sauvegarde, et la page se recharge automatiquement. Pas besoin de F5.

---

## ÉTAPE 4 — Comprendre la structure du projet

Ouvre le projet dans **VS Code** :

```bash
code .
```

### 4.1 Les dossiers clés

```
mon-premier-projet/
├── node_modules/         ← bibliothèques (ne JAMAIS toucher)
├── public/               ← fichiers statiques (favicon, images)
├── src/                  ← TON CODE est ici
│   ├── app/              ← composants de l'application
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── index.html        ← page HTML racine
│   ├── main.ts           ← point d'entrée
│   └── styles.scss       ← styles globaux
├── angular.json          ← config Angular
├── package.json          ← dépendances
└── tsconfig.json         ← config TypeScript
```

### 4.2 Que contient `app.component.ts` ?

Ouvre `src/app/app.component.ts` :

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mon-premier-projet';
}
```

**Décrypte** :

- `@Component({...})` : le décorateur qui dit "cette classe est un composant"
- `selector: 'app-root'` : balise HTML utilisée dans `index.html` (`<app-root></app-root>`)
- `standalone: true` : pas besoin de NgModule
- `imports` : autres composants/directives utilisés dans le template
- `templateUrl` : le HTML lié
- `styleUrl` : le CSS lié

### 4.3 Le template

Ouvre `src/app/app.component.html`. C'est rempli de HTML "marketing" Angular. **Vide tout** et remplace par :

```html
<h1>Bonjour {{ title }} !</h1>
<router-outlet></router-outlet>
```

Sauvegarde → la page se recharge → tu vois ton message. ✅

---

## ÉTAPE 5 — Créer ton premier composant

### 5.1 Génération automatique avec la CLI

Dans le terminal :

```bash
ng generate component hello
# ou plus court :
ng g c hello
```

Angular crée 4 fichiers dans `src/app/hello/` :
- `hello.component.ts`
- `hello.component.html`
- `hello.component.scss`
- `hello.component.spec.ts` (tests)

### 5.2 Modifier le composant

Ouvre `src/app/hello/hello.component.ts` :

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent {
  prenom = 'Mouad';
  age = 25;
}
```

Ouvre `src/app/hello/hello.component.html` :

```html
<div class="hello-card">
  <h2>Salut {{ prenom }} 👋</h2>
  <p>Tu as {{ age }} ans.</p>
</div>
```

Ouvre `src/app/hello/hello.component.scss` :

```scss
.hello-card {
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  max-width: 400px;
  margin: 20px auto;

  h2 { margin: 0 0 10px; }
  p  { margin: 0; opacity: 0.9; }
}
```

### 5.3 Utiliser le composant

Ouvre `src/app/app.component.ts` et **importe** `HelloComponent` :

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HelloComponent } from './hello/hello.component';   // ← AJOUTER

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HelloComponent],   // ← AJOUTER ici aussi
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mon-premier-projet';
}
```

Ouvre `src/app/app.component.html` :

```html
<h1>Bonjour {{ title }} !</h1>

<app-hello></app-hello>

<router-outlet></router-outlet>
```

✅ **Sauvegarde et regarde** ! Tu vois ta carte violette s'afficher.

---

## ÉTAPE 6 — Mini-exercice : carte de profil

### 🎯 Mission

Crée un composant `<app-profil>` qui affiche :
- Une photo
- Un nom
- Un titre professionnel
- Un bouton "Contact"

### Étapes

**1. Génère le composant** :

```bash
ng g c profil
```

**2. Dans `profil.component.ts`** :

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent {
  nom = 'Mouad';
  metier = 'Fullstack Developer & Formateur IT';
  photo = 'https://i.pravatar.cc/150?img=12';

  contacter() {
    alert(`Contacter ${this.nom}`);
  }
}
```

**3. Dans `profil.component.html`** :

```html
<div class="profil">
  <img [src]="photo" [alt]="nom">
  <h3>{{ nom }}</h3>
  <p>{{ metier }}</p>
  <button (click)="contacter()">Contacter</button>
</div>
```

**4. Dans `profil.component.scss`** :

```scss
.profil {
  text-align: center;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  max-width: 280px;
  margin: 20px auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
  }

  h3 { margin: 12px 0 4px; }
  p  { color: #666; margin: 0 0 16px; }

  button {
    padding: 10px 24px;
    background: #3f51b5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;

    &:hover { background: #303f9f; }
  }
}
```

**5. Ajoute le composant dans `app.component.ts`** (imports) **et `app.component.html`** :

```html
<app-profil></app-profil>
```

🎉 **Bravo, tu as compris les bases !**

---

## 🧠 Quiz de fin de journée

1. Quelle commande crée un nouveau projet Angular ?
2. À quoi sert le décorateur `@Component` ?
3. Quelle est la différence entre `selector` et `templateUrl` ?
4. Que signifie `standalone: true` ?
5. Comment afficher une variable TypeScript dans le HTML ?

<details>
<summary>👀 Voir les réponses</summary>

1. `ng new <nom-projet>`
2. Marque une classe TypeScript comme un composant Angular et donne ses métadonnées (sélecteur, template, styles).
3. `selector` = la balise HTML utilisée pour insérer le composant. `templateUrl` = le chemin vers le fichier HTML.
4. Le composant n'a pas besoin d'être déclaré dans un NgModule. Il peut être importé directement où il est utilisé.
5. Avec l'**interpolation** : `{{ maVariable }}`.

</details>

---

## 📋 Checklist Jour 1

- [ ] Node.js et npm installés
- [ ] Angular CLI installé (`ng version` fonctionne)
- [ ] Projet créé et lancé sur `localhost:4200`
- [ ] Compris la structure des dossiers
- [ ] Créé le composant `hello`
- [ ] Créé le composant `profil` (mini-exercice)
- [ ] Compris la différence `{{ }}` vs `[ ]` vs `( )`

---

## 🚀 Pour aller plus loin (devoirs)

1. Crée un composant `<app-citation>` qui affiche une citation au hasard parmi 5 (utilise un array et `Math.random()`).
2. Ajoute un bouton qui change la citation à chaque clic.
3. Stylise la carte avec un dégradé de ton choix.

➡️ **Demain : Jour 2 — Les fondamentaux : directives, événements, services, observables.**
