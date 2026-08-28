import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'trips/new',
    loadComponent: () => import('./pages/trip-form/trip-form.page').then((m) => m.TripFormPage),
    canActivate: [authGuard],
  },
  {
    path: 'trips/:tripId/edit',
    loadComponent: () => import('./pages/trip-form/trip-form.page').then((m) => m.TripFormPage),
    canActivate: [authGuard],
  },
  {
    path: 'trips/:tripId/events/new',
    loadComponent: () => import('./pages/event-form/event-form.page').then((m) => m.EventFormPage),
    canActivate: [authGuard],
  },
  {
    path: 'trips/:tripId/events/:eventId/edit',
    loadComponent: () => import('./pages/event-form/event-form.page').then((m) => m.EventFormPage),
    canActivate: [authGuard],
  },
  {
    path: 'trips/:tripId',
    loadComponent: () => import('./pages/trip-details/trip-details.page').then((m) => m.TripDetailsPage),
    canActivate: [authGuard],
  },
  {
    path: 'trips',
    loadComponent: () => import('./pages/trips/trips.page').then((m) => m.TripsPage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'trips',
    pathMatch: 'full',
  },
];
