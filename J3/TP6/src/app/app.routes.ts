import { Routes } from '@angular/router';
import { DigimonDetailComponent } from './pages/digimon-detail/digimon-detail';
import { DigimonListComponent } from './pages/digimon-list/digimon-list';
import { FavorisComponent } from './pages/favoris/favoris';

export const routes: Routes = [
  { path: '', component: DigimonListComponent },
  { path: 'favoris', component: FavorisComponent },
  { path: 'digimon/:id', component: DigimonDetailComponent },
  { path: '**', redirectTo: '' },
];
