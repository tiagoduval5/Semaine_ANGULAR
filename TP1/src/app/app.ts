import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HelloComponent } from './hello/hello';
import { ProfilComponent } from './profil/profil'; 
import { CitationComponent } from './citation/citation';
import { MeteoComponent } from './meteo/meteo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HelloComponent, ProfilComponent, CitationComponent, MeteoComponent],   // ← AJOUTER ici aussi
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'TP1';
}
