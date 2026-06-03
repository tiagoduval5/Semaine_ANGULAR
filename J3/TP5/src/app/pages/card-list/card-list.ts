import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Card } from '../../models';
import { CardApiService } from '../../services/card-api.service';
import { CollectionService } from '../../services/collection.service';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-card-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './card-list.html',
  styleUrl: './card-list.scss',
})
export class CardListComponent implements OnInit {
  private api = inject(CardApiService);
  protected filters = inject(FilterService);
  protected collection = inject(CollectionService);

  cards = signal<Card[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  recherche = '';

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getCards(this.filters.filters(), 24, 0).subscribe({
      next: (res) => {
        this.cards.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur de chargement des cartes.');
        this.loading.set(false);
      },
    });
  }

  rechercher() {
    this.filters.setRecherche(this.recherche);
    this.charger();
  }

  filtrerType(type: string) {
    this.filters.setType(type);
    this.charger();
  }

  filtrerAttribut(attribute: string) {
    this.filters.setAttribute(attribute);
    this.charger();
  }

  reinitialiser() {
    this.filters.reset();
    this.recherche = '';
    this.charger();
  }

  carteAleatoire() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getRandomCard().subscribe({
      next: (card) => {
        this.cards.set([card]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger une carte aleatoire.');
        this.loading.set(false);
      },
    });
  }
}
