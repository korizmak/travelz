import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'trips/:tripId',
    loadComponent: () => import('./pages/trip-details/trip-details.page').then((m) => m.TripDetailsPage),
  },
  {
    path: 'trips',
    loadComponent: () => import('./pages/trips/trips.page').then((m) => m.TripsPage),
  },
  {
    path: '',
    redirectTo: 'trips',
    pathMatch: 'full',
  },
];
