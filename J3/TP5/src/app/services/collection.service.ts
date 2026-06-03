import { Injectable, computed, effect, signal } from '@angular/core';
import { Card, DeckEntry } from '../models';

const STORAGE_KEY = 'yugioh-deck';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private _deck = signal<DeckEntry[]>(this.charger());

  deck = this._deck.asReadonly();
  total = computed(() => this._deck().reduce((acc, e) => acc + e.quantite, 0));

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(this._deck())));
  }

  estDansDeck(id: number): boolean {
    return this._deck().some((e) => e.card.id === id);
  }

  quantiteDansDeck(id: number): number {
    return this._deck().find((e) => e.card.id === id)?.quantite ?? 0;
  }

  ajouter(card: Card) {
    this._deck.update((deck) => {
      const existant = deck.find((e) => e.card.id === card.id);
      if (existant) {
        if (existant.quantite >= 3) return deck;
        return deck.map((e) =>
          e.card.id === card.id ? { ...e, quantite: e.quantite + 1 } : e,
        );
      }
      return [...deck, { card, quantite: 1 }];
    });
  }

  retirer(id: number) {
    this._deck.update((deck) => deck.filter((e) => e.card.id !== id));
  }

  vider() {
    this._deck.set([]);
  }

  private charger(): DeckEntry[] {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as DeckEntry[]) : [];
  }
}
