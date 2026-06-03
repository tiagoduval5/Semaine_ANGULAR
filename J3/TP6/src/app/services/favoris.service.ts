import { Injectable, computed, signal } from '@angular/core';
import { DigimonSummary } from '../models/digimon.model';

@Injectable({ providedIn: 'root' })
export class FavorisService {
  private _favoris = signal<DigimonSummary[]>([]);

  favoris = this._favoris.asReadonly();
  nombre = computed(() => this._favoris().length);

  estFavori(id: number): boolean {
    return this._favoris().some((d) => d.id === id);
  }

  toggle(digimon: DigimonSummary) {
    if (this.estFavori(digimon.id)) {
      this._favoris.update((list) => list.filter((d) => d.id !== digimon.id));
    } else {
      this._favoris.update((list) => [...list, digimon]);
    }
  }
}
