import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PokemonApiService } from '../../services/pokemon-api.service';
import { PokemonPreview } from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-list',
  imports: [RouterLink],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss',
})
export class PokemonListComponent {
  private api = inject(PokemonApiService);
  private destroyRef = inject(DestroyRef);

  readonly pageSize = 18;
  readonly colonnesGrilleEstimees = 6;

  pageIndex = signal(0);
  total = signal(0);
  pokemons = signal<PokemonPreview[]>([]);
  chargement = signal(true);
  recherche = signal('');

  filtres = computed(() => {
    const q = this.recherche().toLowerCase().trim();
    return this.pokemons().filter((p) => p.name.includes(q));
  });

  pageCourante = computed(() => this.pageIndex() + 1);
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize)),
  );

  debut = computed(() => {
    if (this.pokemons().length === 0) return 0;
    return this.pageIndex() * this.pageSize + 1;
  });

  fin = computed(() => this.pageIndex() * this.pageSize + this.pokemons().length);

  cartesAffichees = computed(() => this.filtres().length);
  lignesAffichees = computed(() =>
    this.cartesAffichees() === 0
      ? 0
      : Math.ceil(this.cartesAffichees() / this.colonnesGrilleEstimees),
  );

  peutPrecedent = computed(() => this.pageIndex() > 0 && !this.recherche().trim());
  peutSuivant = computed(
    () => this.pageIndex() < this.totalPages() - 1 && !this.recherche().trim(),
  );

  enRecherche = computed(() => this.recherche().trim().length > 0);

  constructor() {
    this.chargerPage();
  }

  onSearch(event: Event) {
    this.recherche.set((event.target as HTMLInputElement).value);
  }

  precedent() {
    if (!this.peutPrecedent()) return;
    this.pageIndex.update((i) => i - 1);
    this.chargerPage();
  }

  suivant() {
    if (!this.peutSuivant()) return;
    this.pageIndex.update((i) => i + 1);
    this.chargerPage();
  }

  private chargerPage() {
    this.chargement.set(true);
    const offset = this.pageIndex() * this.pageSize;

    this.api
      .getList(this.pageSize, offset)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, total }) => {
          this.pokemons.set(items);
          this.total.set(total);
          this.chargement.set(false);
        },
        error: () => this.chargement.set(false),
      });
  }
}
