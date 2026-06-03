import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { CharacterCardComponent } from '../../components/character-card/character-card';
import { ErrorMessageComponent } from '../../components/error-message/error-message';
import { LoaderComponent } from '../../components/loader/loader';
import { PaginatorComponent } from '../../components/paginator/paginator';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { ApiResponse } from '../../models/api-response.model';
import { Character } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { FavorisService } from '../../services/favoris.service';

type EtatListe = {
  loading: boolean;
  data: ApiResponse<Character> | null;
  error: string | null;
};

@Component({
  selector: 'app-characters-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormsModule,
    SearchBarComponent,
    CharacterCardComponent,
    PaginatorComponent,
    LoaderComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './characters-list.html',
  styleUrl: './characters-list.scss',
})
export class CharactersListComponent {
  private characterService = inject(CharacterService);
  protected favoris = inject(FavorisService);

  pageCourante = signal(1);
  nomRecherche = signal('');
  statusFiltre = signal('');
  rafraichir = signal(0);

  etat$ = combineLatest([
    toObservable(this.pageCourante),
    toObservable(this.nomRecherche).pipe(debounceTime(300), distinctUntilChanged()),
    toObservable(this.statusFiltre),
    toObservable(this.rafraichir),
  ]).pipe(
    switchMap(([page, name, status]) =>
      this.characterService.getAll(page, name || undefined, status || undefined).pipe(
        map(
          (data): EtatListe => ({
            loading: false,
            data,
            error: null,
          }),
        ),
        startWith<EtatListe>({ loading: true, data: null, error: null }),
        catchError(() =>
          of({
            loading: false,
            data: null,
            error: 'Erreur lors du chargement des personnages.',
          }),
        ),
      ),
    ),
  );

  onRecherche(terme: string): void {
    this.pageCourante.set(1);
    this.nomRecherche.set(terme);
  }

  onStatusChange(value: string): void {
    this.pageCourante.set(1);
    this.statusFiltre.set(value);
  }

  pagePrecedente(): void {
    this.pageCourante.update((p) => Math.max(1, p - 1));
  }

  pageSuivante(): void {
    this.pageCourante.update((p) => p + 1);
  }

  reessayer(): void {
    this.rafraichir.update((n) => n + 1);
  }
}
