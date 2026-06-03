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
import { FavorisService } from '../../services/favoris.service';
import { StatusPipe } from '../../pipes/status.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { extraireIdDepuisUrl } from '../../utils/url.util';

@Component({
  selector: 'app-character-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LoaderComponent,
    ErrorMessageComponent,
    StatusPipe,
    TruncatePipe,
  ],
  templateUrl: './character-detail.html',
  styleUrl: './character-detail.scss',
})
export class CharacterDetailComponent implements OnInit {
  private characterService = inject(CharacterService);
  private episodeService = inject(EpisodeService);
  protected favoris = inject(FavorisService);

  id = input.required<string>();

  personnage = signal<Character | null>(null);
  episodes = signal<Episode[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.chargerFiche();
  }

  chargerFiche(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.characterService.getById(Number(this.id())).subscribe({
      next: (perso) => {
        this.personnage.set(perso);
        const idsEpisodes = perso.episode.map(extraireIdDepuisUrl).filter(Boolean);
        if (idsEpisodes.length === 0) {
          this.episodes.set([]);
          this.chargement.set(false);
          return;
        }
        const lots: number[][] = [];
        for (let i = 0; i < idsEpisodes.length; i += 20) {
          lots.push(idsEpisodes.slice(i, i + 20));
        }
        forkJoin(lots.map((lot) => this.episodeService.getMany(lot))).subscribe({
          next: (resultats) => {
            this.episodes.set(resultats.flat());
            this.chargement.set(false);
          },
          error: () => {
            this.erreur.set('Impossible de charger les episodes.');
            this.chargement.set(false);
          },
        });
      },
      error: () => {
        this.erreur.set('Personnage introuvable.');
        this.chargement.set(false);
      },
    });
  }

  idOrigine(url: string): number | null {
    if (!url) return null;
    const id = extraireIdDepuisUrl(url);
    return Number.isNaN(id) ? null : id;
  }

  idLieu(url: string): number | null {
    return this.idOrigine(url);
  }
}
