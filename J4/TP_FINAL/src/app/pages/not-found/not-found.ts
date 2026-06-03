import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <h1>404 — Page introuvable</h1>
      <p>Cette adresse n'existe pas dans l'application.</p>
      <a routerLink="/dashboard">Retour au tableau de bord</a>
    </section>
  `,
  styles: `
    .not-found {
      text-align: center;
      padding: 48px 16px;
    }
    a {
      color: #7dffb0;
    }
  `,
})
export class NotFoundComponent {}
