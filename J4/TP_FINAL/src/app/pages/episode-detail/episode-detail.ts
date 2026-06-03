import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ErrorMessageComponent } from '../../components/error-message/error-message';
import { LoaderComponent } from '../../components/loader/loader';
import { Character } from '../../models/character.model';
import { Episode } from '../../models/episode.model';
import { CharacterService } from '../../services/character.service';
import { EpisodeService } from '../../services/episode.service';
import { extraireIdDepuisUrl } from '../../utils/url.util';

@Component({
  selector: 'app-episode-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoaderComponent, ErrorMessageComponent],
  templateUrl: './episode-detail.html',
  styleUrl: './episode-detail.scss',
})
export class EpisodeDetailComponent implements OnInit {
  private episodeService = inject(EpisodeService);
  private characterService = inject(CharacterService);

  id = input.required<string>();

  episode = signal<Episode | null>(null);
  personnages = signal<Character[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.chargerFiche();
  }

  chargerFiche(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.episodeService.getById(Number(this.id())).subscribe({
      next: (ep) => {
        this.episode.set(ep);
        const ids = ep.characters.map(extraireIdDepuisUrl).filter(Boolean);
        if (ids.length === 0) {
          this.personnages.set([]);
          this.chargement.set(false);
          return;
        }
        const lots: number[][] = [];
        for (let i = 0; i < ids.length; i += 20) {
          lots.push(ids.slice(i, i + 20));
        }
        forkJoin(lots.map((lot) => this.characterService.getMany(lot))).subscribe({
          next: (resultats) => {
            this.personnages.set(resultats.flat());
            this.chargement.set(false);
          },
          error: () => {
            this.erreur.set('Impossible de charger les personnages de l episode.');
            this.chargement.set(false);
          },
        });
      },
      error: () => {
        this.erreur.set('Episode introuvable.');
        this.chargement.set(false);
      },
    });
  }
}
