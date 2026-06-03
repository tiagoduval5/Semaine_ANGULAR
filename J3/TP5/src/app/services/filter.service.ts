import { Injectable, signal } from '@angular/core';
import { CardFilters } from '../models';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private _filters = signal<CardFilters>({});
  filters = this._filters.asReadonly();

  readonly types = [
    'Effect Monster',
    'Normal Monster',
    'Spell Card',
    'Trap Card',
    'Fusion Monster',
  ];

  readonly attributes = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'];

  setRecherche(fname: string) {
    this._filters.update((f) => ({ ...f, fname: fname || undefined }));
  }

  setType(type: string) {
    this._filters.update((f) => ({ ...f, type: type || undefined }));
  }

  setAttribute(attribute: string) {
    this._filters.update((f) => ({ ...f, attribute: attribute || undefined }));
  }

  reset() {
    this._filters.set({});
  }
}
