import { Component } from '@angular/core';

@Component({
  selector: 'app-meteo-carte',
  standalone: true,
  imports: [],
  templateUrl: './meteo.html',
  styleUrl: './meteo.scss',
})
export class MeteoComponent {
  ville = 'Paris';
  temperature = 18;
  condition = 'Ensoleille';
  humidite = 45;
  vent = 12;

  get emojiCondition(): string {
    if (this.condition === 'Ensoleille') return '☀️';
    if (this.condition === 'Nuageux') return '☁️';
    if (this.condition === 'Pluvieux') return '🌧️';
    return '🌤️';
  }
}