import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'trips/new',
    loadComponent: () => import('./pages/trip-form/trip-form.page').then((m) => m.TripFormPage),
  },
  {
    path: 'trips/:tripId/edit',
    loadComponent: () => import('./pages/trip-form/trip-form.page').then((m) => m.TripFormPage),
  },
  {
    path: 'trips/:tripId/events/new',
    loadComponent: () => import('./pages/event-form/event-form.page').then((m) => m.EventFormPage),
  },
  {
    path: 'trips/:tripId/events/:eventId/edit',
    loadComponent: () => import('./pages/event-form/event-form.page').then((m) => m.EventFormPage),
  },
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
