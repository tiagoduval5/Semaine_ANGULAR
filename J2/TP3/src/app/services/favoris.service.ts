import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavorisService {
  private _favoris = signal<string[]>([]);

  favoris = this._favoris.asReadonly();
  nombre = computed(() => this._favoris().length);

  estFavori(name: string): boolean {
    return this._favoris().includes(name);
  }

  basculer(name: string) {
    this._favoris.update((list) =>
      list.includes(name) ? list.filter((n) => n !== name) : [...list, name],
    );
  }
}
