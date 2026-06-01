import { Component } from '@angular/core';
@Component({
  selector: 'app-citation',
  standalone: true,
  imports: [],
  templateUrl: './citation.html',
  styleUrl: './citation.scss',
})
export class CitationComponent {
  citations = [
    "La vie est belle.",
    "N'abandonne jamais.",
    "Chaque jour compte.",
    "Le succès vient avec l'effort.",
    "Reste curieux."
  ];
  citation = this.citations[0];
  changerCitation() {
    const index = Math.floor(Math.random() * this.citations.length);
    this.citation = this.citations[index];
  }
  constructor() {
    this.changerCitation();
  }
}