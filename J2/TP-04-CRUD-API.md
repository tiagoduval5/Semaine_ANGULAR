# 🧪 Jour 4 — TP guidé : CRUD complet avec une API (Carnet de contacts)

> **Version** : Angular **19 / 20 / 21**. Style **moderne** (signals, `inject()`, `provideHttpClient`, `@if/@for`). **Zéro legacy.**
> **Objectif** : maîtriser **GET / POST / PUT / DELETE**, la gestion d'erreur, et le rafraîchissement de l'UI après écriture.
> **Pré-requis** : avoir vu le cours Jour 3 (`COURS-Jour3-Routage-API.md`, §5 à §8).

---

## 🎯 Ce que tu vas construire

Un **carnet de contacts** complet avec les **4 opérations CRUD** :

- 📋 **Lister** les contacts (GET)
- ➕ **Ajouter** un contact (POST)
- ✏️ **Modifier** un contact (PUT)
- 🗑️ **Supprimer** un contact (DELETE)
- ⏳ gestion **chargement / erreur**

> **CRUD** = **C**reate / **R**ead / **U**pdate / **D**elete → POST / GET / PUT / DELETE.

---

## 🔧 ÉTAPE 0 — Une vraie API locale avec `json-server`

Le Pokédex était en lecture seule. Ici, il faut une API **qui accepte l'écriture** et **persiste** les changements. On utilise **`json-server`** : une fausse API REST complète à partir d'un simple fichier JSON. **Aucun backend à coder.**

### Installer et lancer

Dans un dossier séparé (PAS dans le projet Angular), crée un fichier `db.json` :

```json
{
  "contacts": [
    { "id": 1, "nom": "Sara Idrissi", "email": "sara@mail.com", "tel": "0612345678" },
    { "id": 2, "nom": "Yanis Berton", "email": "yanis@mail.com", "tel": "0698765432" }
  ]
}
```

Puis lance le serveur :

```bash
npx json-server db.json
```

> ✅ Ton API tourne sur **`http://localhost:3000`**. Teste dans le navigateur : `http://localhost:3000/contacts`.
> Endpoints automatiques : `GET/POST /contacts`, `GET/PUT/PATCH/DELETE /contacts/:id`. **Tout est réel et persistant** (écrit dans `db.json`).

> 💡 **Sans installation possible ?** Alternative : `https://jsonplaceholder.typicode.com/users`. Mais ⚠️ elle **simule** l'écriture (renvoie un succès mais ne persiste pas) — moins parlant pour voir les changements.

> ⚠️ **Garde ce terminal ouvert** pendant tout le TP, et lance Angular dans un **second** terminal.

---

## ÉTAPE 1 — Le projet & la config

```bash
ng new carnet-app          # SCSS, pas de SSR
cd carnet-app
```

`src/app/app.config.ts` :

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};
```

---

## ÉTAPE 2 — Le modèle

`src/app/models/contact.model.ts` :

```typescript
export interface Contact {
  id: number;
  nom: string;
  email: string;
  tel: string;
}

// pour la création : pas encore d'id (l'API le génère)
export type NouveauContact = Omit<Contact, 'id'>;
```

---

## ÉTAPE 3 — Le service CRUD

```bash
ng g service services/contact
```

`src/app/services/contact.service.ts` :

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact, NouveauContact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/contacts';

  // READ
  getAll(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.url);
  }

  // CREATE
  create(contact: NouveauContact): Observable<Contact> {
    return this.http.post<Contact>(this.url, contact);
  }

  // UPDATE
  update(contact: Contact): Observable<Contact> {
    return this.http.put<Contact>(`${this.url}/${contact.id}`, contact);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
```

> 📌 Chaque méthode renvoie un **Observable**. Rien ne part tant que le composant ne **subscribe** pas (Observable paresseux).

---

## ÉTAPE 4 — Le composant principal (état + lecture)

```bash
ng g component components/contact-manager
```

`src/app/components/contact-manager/contact-manager.component.ts` (on commence par le **READ**) :

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { Contact, NouveauContact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-manager',
  imports: [],
  templateUrl: './contact-manager.component.html',
  styleUrl: './contact-manager.component.scss',
})
export class ContactManagerComponent implements OnInit {
  private service = inject(ContactService);

  contacts = signal<Contact[]>([]);
  loading  = signal(true);
  error    = signal<string | null>(null);

  // contact en cours d'édition (null = mode "ajout")
  enEdition = signal<Contact | null>(null);

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.contacts.set(data); this.loading.set(false); },
      error: () => {
        this.error.set('Impossible de charger (json-server est-il lancé sur :3000 ?)');
        this.loading.set(false);
      },
    });
  }
}
```

---

## ÉTAPE 5 — CREATE & UPDATE (le formulaire)

Ajoute ces méthodes **dans la même classe** `ContactManagerComponent` :

```typescript
  // appelé par le formulaire
  enregistrer(form: { nom: string; email: string; tel: string }) {
    const enEdition = this.enEdition();

    if (enEdition) {
      // ---- UPDATE (PUT) ----
      const maj: Contact = { ...enEdition, ...form };
      this.service.update(maj).subscribe({
        next: c => {
          this.contacts.update(list => list.map(x => x.id === c.id ? c : x));
          this.annulerEdition();
        },
        error: () => this.error.set("Échec de la modification"),
      });
    } else {
      // ---- CREATE (POST) ----
      this.service.create(form as NouveauContact).subscribe({
        next: c => this.contacts.update(list => [...list, c]),
        error: () => this.error.set("Échec de l'ajout"),
      });
    }
  }

  editer(contact: Contact) {
    this.enEdition.set(contact);   // bascule le formulaire en mode édition
  }

  annulerEdition() {
    this.enEdition.set(null);
  }
```

> 🔑 **Une seule logique** gère ajout ET modification : si `enEdition()` contient un contact → PUT, sinon → POST. C'est un pattern très courant.
> 🔑 Après écriture, on **met à jour le signal `contacts` localement** (`.update(...)`) → l'UI se rafraîchit **sans recharger toute la liste**. (On pourrait aussi rappeler `charger()`, mais c'est moins efficace.)

---

## ÉTAPE 6 — DELETE

Toujours dans la classe :

```typescript
  supprimer(contact: Contact) {
    if (!confirm(`Supprimer ${contact.nom} ?`)) return;

    this.service.delete(contact.id).subscribe({
      next: () => this.contacts.update(list => list.filter(c => c.id !== contact.id)),
      error: () => this.error.set("Échec de la suppression"),
    });
  }
```

---

## ÉTAPE 7 — Le template

`src/app/components/contact-manager/contact-manager.component.html` :

```html
<div class="manager">
  <h1>📇 Carnet de contacts</h1>

  <!-- FORMULAIRE (ajout / édition) -->
  <form #f="ngForm" class="form" (submit)="$event.preventDefault(); enregistrer({
        nom: nomInput.value, email: emailInput.value, tel: telInput.value });
        nomInput.value=''; emailInput.value=''; telInput.value=''">

    <h3>{{ enEdition() ? '✏️ Modifier' : '➕ Nouveau contact' }}</h3>

    <input #nomInput   type="text"  placeholder="Nom"    [value]="enEdition()?.nom   ?? ''" required />
    <input #emailInput type="email" placeholder="Email"  [value]="enEdition()?.email ?? ''" required />
    <input #telInput   type="tel"   placeholder="Tél"    [value]="enEdition()?.tel   ?? ''" />

    <div class="actions">
      <button type="submit">{{ enEdition() ? 'Mettre à jour' : 'Ajouter' }}</button>
      @if (enEdition()) {
        <button type="button" class="ghost" (click)="annulerEdition()">Annuler</button>
      }
    </div>
  </form>

  <!-- ÉTATS -->
  @if (loading()) {
    <p class="info">⏳ Chargement…</p>
  } @else if (error()) {
    <p class="error">❌ {{ error() }} <button (click)="charger()">Réessayer</button></p>
  } @else {
    <!-- LISTE -->
    <ul class="liste">
      @for (c of contacts(); track c.id) {
        <li>
          <div class="infos">
            <strong>{{ c.nom }}</strong>
            <span>{{ c.email }} · {{ c.tel }}</span>
          </div>
          <div class="boutons">
            <button (click)="editer(c)">✏️</button>
            <button class="danger" (click)="supprimer(c)">🗑️</button>
          </div>
        </li>
      } @empty {
        <li class="info">Aucun contact. Ajoute le premier !</li>
      }
    </ul>
  }
</div>
```

> 💡 Ici on utilise des **template reference variables** (`#nomInput`) — pas besoin de `FormsModule`. Pour des formulaires plus riches, tu utiliseras `[(ngModel)]` (template-driven) ou les Reactive Forms.

`src/app/components/contact-manager/contact-manager.component.scss` :

```scss
.manager { max-width: 560px; margin: 32px auto; padding: 0 16px; }
h1 { text-align: center; }

.form {
  display: flex; flex-direction: column; gap: 8px;
  background: #f8f9fb; border: 1px solid #eee; border-radius: 14px; padding: 16px; margin-bottom: 24px;
  h3 { margin: 0 0 4px; }
  input {
    padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;
    &:focus { outline: none; border-color: #4a90d9; }
  }
  .actions { display: flex; gap: 8px; }
  button {
    padding: 10px 18px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
    background: #4a90d9; color: white;
    &.ghost { background: #eee; color: #333; }
  }
}

.liste {
  list-style: none; padding: 0; margin: 0;
  li {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; background: white; border: 1px solid #eee; border-radius: 10px; margin-bottom: 8px;
    .infos { display: flex; flex-direction: column; span { color: #777; font-size: 13px; } }
    .boutons button {
      border: none; background: transparent; cursor: pointer; font-size: 16px; margin-left: 4px;
      &.danger:hover { transform: scale(1.15); }
    }
  }
}

.info  { text-align: center; color: #888; padding: 20px; }
.error { text-align: center; color: #c0392b; }
```

---

## ÉTAPE 8 — Brancher dans l'app

`src/app/app.component.ts` :

```typescript
import { Component } from '@angular/core';
import { ContactManagerComponent } from './components/contact-manager/contact-manager.component';

@Component({
  selector: 'app-root',
  imports: [ContactManagerComponent],
  template: `<app-contact-manager />`,
})
export class AppComponent {}
```

✅ **Teste le cycle complet** (json-server lancé sur :3000) :
1. La liste se charge (GET).
2. Ajoute un contact → il apparaît (POST).
3. Clique ✏️ → le formulaire se pré-remplit → modifie → « Mettre à jour » (PUT).
4. Clique 🗑️ → confirmation → il disparaît (DELETE).
5. **Rafraîchis la page** → les changements ont persisté dans `db.json`. 🎉

> 🔬 **Ouvre l'onglet Network des DevTools** et observe les requêtes `GET / POST / PUT / DELETE` partir vers `localhost:3000`. C'est exactement ce qu'on veut comprendre.

---

## 🧠 Concepts du jour

| ✅ | Concept |
|---|---|
| ✓ | `HttpClient` : `get / post / put / delete` |
| ✓ | Service CRUD + typage (`Contact`, `NouveauContact`) |
| ✓ | Pattern `loading / error / data` en signals |
| ✓ | Mise à jour **locale** du signal après écriture (perf) |
| ✓ | Un formulaire pour CREATE **et** UPDATE |
| ✓ | `@if / @for / @empty` |
| ✓ | Observable paresseux (rien sans `subscribe`) |

---

## 🧠 Quiz

1. Quelle méthode HTTP pour : créer ? modifier ? supprimer ? lire ?
2. Pourquoi met-on à jour le signal `contacts` localement au lieu de rappeler `getAll()` ?
3. Que se passe-t-il si on ne fait jamais `.subscribe()` sur l'Observable du service ?
4. Comment le même formulaire gère-t-il l'ajout ET la modification ?
5. Pourquoi le service ne renvoie-t-il pas directement un tableau, mais un Observable ?

<details>
<summary>👀 Réponses</summary>

1. POST = créer, PUT = modifier, DELETE = supprimer, GET = lire.
2. Pour éviter un aller-retour réseau complet : l'UI se met à jour immédiatement (plus rapide, moins de charge).
3. **Aucune requête HTTP n'est envoyée** : l'Observable est paresseux.
4. Via le signal `enEdition()` : s'il contient un contact → PUT, sinon → POST.
5. Parce que l'appel est **asynchrone** : l'Observable représente la réponse « à venir » du serveur.

</details>

---

## 🚀 Pour aller plus loin (devoirs)

1. **Recherche** : un champ qui filtre les contacts (`computed` sur un signal `recherche`).
2. **Validation** : empêcher l'envoi si l'email est invalide (regex), afficher un message.
3. **`catchError`** : déplacer la gestion d'erreur dans le service avec l'opérateur RxJS `catchError`.
4. **Optimistic UI** : afficher la suppression immédiatement, puis revenir en arrière si l'API échoue.
5. **PATCH** : remplacer le PUT par un PATCH (modification partielle) et observer la différence.

---

