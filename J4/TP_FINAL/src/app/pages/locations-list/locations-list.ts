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
import { Location } from '../../models/location.model';
import { LocationService } from '../../services/location.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-locations-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PaginatorComponent,
    LoaderComponent,
    ErrorMessageComponent,
    TruncatePipe,
  ],
  templateUrl: './locations-list.html',
  styleUrl: './locations-list.scss',
})
export class LocationsListComponent {
  private locationService = inject(LocationService);

  lieux = signal<Location[]>([]);
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
    this.locationService.getAll(this.pageCourante()).subscribe({
      next: (res) => {
        this.lieux.set(res.results);
        this.totalPages.set(res.info.pages);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Erreur lors du chargement des lieux.');
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
