import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QueryRef } from 'apollo-angular';
import { DigimonPage } from '../../models/digimon.model';
import { DigimonGraphqlService } from '../../services/digimon-graphql.service';
import { FavorisService } from '../../services/favoris.service';

@Component({
  selector: 'app-digimon-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './digimon-list.html',
  styleUrl: './digimon-list.scss',
})
export class DigimonListComponent implements OnInit {
  private service = inject(DigimonGraphqlService);
  protected favoris = inject(FavorisService);
  private queryRef: QueryRef<{ digimons: DigimonPage }> | null = null;

  page = signal<DigimonPage | null>(null);
  loading = signal(true);
  loadingMore = signal(false);
  error = signal<string | null>(null);
  recherche = '';

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.loading.set(true);
    this.error.set(null);
    const nom = this.recherche.trim() || undefined;
    this.queryRef = this.service.createDigimonsQuery(20, nom);
    this.queryRef.valueChanges.subscribe({
      next: (data) => {
        const current = data.data?.digimons;
        this.page.set(
          (current as DigimonPage | undefined) ?? {
            items: [],
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
          },
        );
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: (err) => {
        const detail = err?.message ? ` (${err.message})` : '';
        this.error.set(`Le serveur GraphQL (:4000) est-il lance ?${detail}`);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  rechercher() {
    this.charger();
  }

  chargerPlus() {
    const pageActuelle = this.page();
    if (!this.queryRef || !pageActuelle) return;
    const nextPage = pageActuelle.currentPage + 1;
    if (nextPage >= pageActuelle.totalPages) return;

    this.loadingMore.set(true);
    const nom = this.recherche.trim() || undefined;
    this.queryRef
      .fetchMore({
        variables: { page: nextPage, pageSize: 20, name: nom },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.digimons) return prev;
          return {
            digimons: {
              ...fetchMoreResult.digimons,
              items: [...prev.digimons.items, ...fetchMoreResult.digimons.items],
            },
          };
        },
      })
      .finally(() => this.loadingMore.set(false));
  }
}
