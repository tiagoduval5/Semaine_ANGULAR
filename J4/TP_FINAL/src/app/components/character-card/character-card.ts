import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Character } from '../../models/character.model';
import { StatusPipe } from '../../pipes/status.pipe';

@Component({
  selector: 'app-character-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusPipe],
  template: `
    <article class="carte">
      <a class="lien" [routerLink]="['/characters', personnage().id]">
        <img [src]="personnage().image" [alt]="personnage().name" />
        <div class="corps">
          <h3>{{ personnage().name }}</h3>
          <p class="ligne">{{ personnage().status | status }}</p>
          <p class="ligne espece">{{ personnage().species }}</p>
          <p class="ligne lieu">📍 {{ personnage().location.name }}</p>
          <p class="ligne episodes">{{ personnage().episode.length }} épisode(s)</p>
        </div>
      </a>
      <button type="button" (click)="toggleFavori.emit(personnage())">
        {{ estFavori() ? '⭐ Favori' : '☆ Ajouter aux favoris' }}
      </button>
    </article>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .carte {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-card);
      padding: 12px;
      box-shadow: var(--shadow-card);
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .carte:hover {
      border-color: var(--border-bright);
      transform: translateY(-3px);
    }
    .lien {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      text-decoration: none;
      color: inherit;
    }
    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(0, 212, 255, 0.2);
    }
    .corps {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 10px;
    }
    h3 {
      margin: 0;
      min-height: 2.6em;
      font-family: var(--font-display);
      font-size: 0.82rem;
      line-height: 1.3;
      letter-spacing: 0.03em;
      color: var(--accent-cyan);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    .ligne {
      margin: 0;
      min-height: 1.25rem;
      color: var(--text-muted);
      font-size: 12px;
      line-height: 1.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    button {
      margin-top: auto;
      flex-shrink: 0;
      width: 100%;
      padding: 9px;
    }
  `,
})
export class CharacterCardComponent {
  personnage = input.required<Character>();
  estFavori = input(false);
  toggleFavori = output<Character>();
}
