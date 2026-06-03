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
      <a [routerLink]="['/characters', personnage().id]">
        <img [src]="personnage().image" [alt]="personnage().name" />
        <h3>{{ personnage().name }}</h3>
        <p>{{ personnage().status | status }}</p>
        <p class="espece">{{ personnage().species }}</p>
      </a>
      <button type="button" (click)="toggleFavori.emit(personnage())">
        {{ estFavori() ? '⭐ Favori' : '☆ Ajouter aux favoris' }}
      </button>
    </article>
  `,
  styles: `
    .carte {
      border: 1px solid #2f4a3a;
      border-radius: 14px;
      background: #14241c;
      padding: 10px;
    }
    a {
      text-decoration: none;
      color: inherit;
    }
    img {
      width: 100%;
      border-radius: 10px;
    }
    h3 {
      margin: 8px 0 4px;
      font-size: 15px;
    }
    .espece {
      color: #8fb89a;
      font-size: 13px;
    }
    button {
      margin-top: 8px;
      width: 100%;
      border-radius: 8px;
      border: 1px solid #4a7a5c;
      background: #1f3a2b;
      color: #d4ffe0;
      cursor: pointer;
      padding: 8px;
      font-weight: 600;
    }
  `,
})
export class CharacterCardComponent {
  personnage = input.required<Character>();
  estFavori = input(false);
  toggleFavori = output<Character>();
}
