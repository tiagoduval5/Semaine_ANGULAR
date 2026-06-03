import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CharacterService } from '../../services/character.service';
import { EpisodeService } from '../../services/episode.service';
import { FavorisService } from '../../services/favoris.service';
import { LocationService } from '../../services/location.service';
import { ErrorMessageComponent } from '../../components/error-message/error-message';
import { LoaderComponent } from '../../components/loader/loader';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoaderComponent, ErrorMessageComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private characterService = inject(CharacterService);
  private locationService = inject(LocationService);
  private episodeService = inject(EpisodeService);
  protected favoris = inject(FavorisService);

  chargement = signal(true);
  erreur = signal<string | null>(null);
  totalPersonnages = signal(0);
  totalLieux = signal(0);
  totalEpisodes = signal(0);

  repartitionFavoris = computed(() => this.favoris.repartitionParStatut());

  ngOnInit(): void {
    this.chargerStatistiques();
  }

  chargerStatistiques(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    forkJoin({
      persos: this.characterService.getAll(1),
      lieux: this.locationService.getAll(1),
      episodes: this.episodeService.getAll(1),
    }).subscribe({
      next: ({ persos, lieux, episodes }) => {
        this.totalPersonnages.set(persos.info.count);
        this.totalLieux.set(lieux.info.count);
        this.totalEpisodes.set(episodes.info.count);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les statistiques.');
        this.chargement.set(false);
      },
    });
  }
}
