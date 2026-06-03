import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Digimon } from '../../models/digimon.model';
import { DigimonGraphqlService } from '../../services/digimon-graphql.service';

@Component({
  selector: 'app-digimon-detail',
  imports: [RouterLink],
  templateUrl: './digimon-detail.html',
  styleUrl: './digimon-detail.scss',
})
export class DigimonDetailComponent implements OnInit {
  private service = inject(DigimonGraphqlService);

  id = input.required<string>();

  digimon = signal<Digimon | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.service.getDigimon(Number(this.id())).subscribe({
      next: (d) => {
        this.digimon.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
