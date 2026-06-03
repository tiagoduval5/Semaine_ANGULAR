import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { CharactersListComponent } from './pages/characters-list/characters-list';
import { CharacterDetailComponent } from './pages/character-detail/character-detail';
import { LocationsListComponent } from './pages/locations-list/locations-list';
import { LocationDetailComponent } from './pages/location-detail/location-detail';
import { EpisodesListComponent } from './pages/episodes-list/episodes-list';
import { EpisodeDetailComponent } from './pages/episode-detail/episode-detail';
import { NotFoundComponent } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'characters', component: CharactersListComponent },
  { path: 'characters/:id', component: CharacterDetailComponent },
  { path: 'locations', component: LocationsListComponent },
  { path: 'locations/:id', component: LocationDetailComponent },
  { path: 'episodes', component: EpisodesListComponent },
  { path: 'episodes/:id', component: EpisodeDetailComponent },
  {
    path: 'favoris',
    loadComponent: () =>
      import('./pages/favoris/favoris').then((m) => m.FavorisComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then((m) => m.ContactComponent),
  },
  { path: '**', component: NotFoundComponent },
];
