import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Character } from '../models/character.model';
import { StorageService } from './storage.service';

const CLE_FAVORIS = 'rm-explorer-favoris';

@Injectable({ providedIn: 'root' })
export class FavorisService {
  private storage = inject(StorageService);
  private _favoris = signal<Character[]>(this.storage.get<Character[]>(CLE_FAVORIS) ?? []);

  favoris = this._favoris.asReadonly();
  nombre = computed(() => this._favoris().length);

  repartitionParStatut = computed(() => {
    const map = { Alive: 0, Dead: 0, unknown: 0 };
    for (const c of this._favoris()) {
      if (c.status === 'Alive') map.Alive++;
      else if (c.status === 'Dead') map.Dead++;
      else map.unknown++;
    }
    return map;
  });

  constructor() {
    effect(() => this.storage.set(CLE_FAVORIS, this._favoris()));
  }

  isFavori(id: number): boolean {
    return this._favoris().some((c) => c.id === id);
  }

  toggle(c: Character): void {
    if (this.isFavori(c.id)) {
      this._favoris.update((list) => list.filter((x) => x.id !== c.id));
    } else {
      this._favoris.update((list) => [...list, c]);
    }
  }
}
