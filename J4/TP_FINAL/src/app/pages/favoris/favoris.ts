import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CharacterCardComponent } from '../../components/character-card/character-card';
import { FavorisService } from '../../services/favoris.service';

@Component({
  selector: 'app-favoris',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CharacterCardComponent],
  templateUrl: './favoris.html',
  styleUrl: './favoris.scss',
})
export class FavorisComponent {
  protected favoris = inject(FavorisService);
}
