import { Routes } from '@angular/router';
import { CardListComponent } from './pages/card-list/card-list';
import { CardDetailComponent } from './pages/card-detail/card-detail';
import { DeckComponent } from './pages/deck/deck';

export const routes: Routes = [
  { path: '', component: CardListComponent },
  { path: 'carte/:id', component: CardDetailComponent },
  { path: 'deck', component: DeckComponent },
  { path: '**', redirectTo: '' },
];
