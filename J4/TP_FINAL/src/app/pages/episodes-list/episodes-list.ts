import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrorMessageComponent } from '../../components/error-message/error-message';
import { LoaderComponent } from '../../components/loader/loader';
import { PaginatorComponent } from '../../components/paginator/paginator';
import { Episode } from '../../models/episode.model';
import { EpisodeService } from '../../services/episode.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-episodes-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PaginatorComponent,
    LoaderComponent,
    ErrorMessageComponent,
    TruncatePipe,
  ],
  templateUrl: './episodes-list.html',
  styleUrl: './episodes-list.scss',
})
export class EpisodesListComponent {
  private episodeService = inject(EpisodeService);

  episodes = signal<Episode[]>([]);
  pageCourante = signal(1);
  totalPages = signal(1);
  chargement = signal(true);
  erreur = signal<string | null>(null);

  constructor() {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.episodeService.getAll(this.pageCourante()).subscribe({
      next: (res) => {
        this.episodes.set(res.results);
        this.totalPages.set(res.info.pages);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Erreur lors du chargement des episodes.');
        this.chargement.set(false);
      },
    });
  }

  pagePrecedente(): void {
    if (this.pageCourante() > 1) {
      this.pageCourante.update((p) => p - 1);
      this.charger();
    }
  }

  pageSuivante(): void {
    if (this.pageCourante() < this.totalPages()) {
      this.pageCourante.update((p) => p + 1);
      this.charger();
    }
  }
}
