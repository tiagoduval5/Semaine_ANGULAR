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
import { Location } from '../../models/location.model';
import { CharacterService } from '../../services/character.service';
import { LocationService } from '../../services/location.service';
import { extraireIdDepuisUrl } from '../../utils/url.util';

@Component({
  selector: 'app-location-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoaderComponent, ErrorMessageComponent],
  templateUrl: './location-detail.html',
  styleUrl: './location-detail.scss',
})
export class LocationDetailComponent implements OnInit {
  private locationService = inject(LocationService);
  private characterService = inject(CharacterService);

  id = input.required<string>();

  lieu = signal<Location | null>(null);
  residents = signal<Character[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.chargerFiche();
  }

  chargerFiche(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.locationService.getById(Number(this.id())).subscribe({
      next: (loc) => {
        this.lieu.set(loc);
        const ids = loc.residents.map(extraireIdDepuisUrl).filter(Boolean);
        if (ids.length === 0) {
          this.residents.set([]);
          this.chargement.set(false);
          return;
        }
        const lots: number[][] = [];
        for (let i = 0; i < ids.length; i += 20) {
          lots.push(ids.slice(i, i + 20));
        }
        forkJoin(lots.map((lot) => this.characterService.getMany(lot))).subscribe({
          next: (resultats) => {
            this.residents.set(resultats.flat());
            this.chargement.set(false);
          },
          error: () => {
            this.erreur.set('Impossible de charger les residents.');
            this.chargement.set(false);
          },
        });
      },
      error: () => {
        this.erreur.set('Lieu introuvable.');
        this.chargement.set(false);
      },
    });
  }
}
