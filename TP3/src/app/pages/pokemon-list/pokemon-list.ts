import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonApiService } from '../../services/pokemon-api.service';

@Component({
  selector: 'app-pokemon-list',
  imports: [RouterLink],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss',
})
export class PokemonListComponent {
  private api = inject(PokemonApiService);

  pokemons = toSignal(this.api.getList(), { initialValue: [] });
  recherche = signal('');

  filtres = computed(() => {
    const q = this.recherche().toLowerCase().trim();
    return this.pokemons().filter((p) => p.name.includes(q));
  });

  onSearch(event: Event) {
    this.recherche.set((event.target as HTMLInputElement).value);
  }
}
