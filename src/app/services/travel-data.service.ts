import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Trip } from '../models/trip.model';
import { TravelEvent } from '../models/travel-event.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TravelDataService {
  private baseUrl = environment.firebaseDatabaseUrl.replace(/\/$/, '');
  private tripsSubject = new BehaviorSubject<Trip[]>([]);
  trips$ = this.tripsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Firebase mapping helpers
  private mapFirebaseList<T>(data: Record<string, Omit<T, 'id'>> | null): T[] {
    if (!data) return [];
    return Object.entries(data).map(([id, value]) => ({
      id,
      ...value
    } as T));
  }

  // Auth params helper
  private getAuthParams(): HttpParams {
    const idToken = this.authService.getIdToken();
    if (!idToken) {
      throw new Error('User is not authenticated');
    }
    return new HttpParams().set('auth', idToken);
  }

  // Trip methods
  async getTrips(): Promise<Trip[]> {
    const url = `${this.baseUrl}/trips.json`;
    const response = await firstValueFrom(
      this.http.get<Record<string, Omit<Trip, 'id'>> | null>(url, { params: this.getAuthParams() })
    );
    const trips = this.mapFirebaseList<Trip>(response);
    this.tripsSubject.next(trips);
    return trips;
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    const url = `${this.baseUrl}/trips/${id}.json`;
    const response = await firstValueFrom(
      this.http.get<Omit<Trip, 'id'> | null>(url, { params: this.getAuthParams() })
    );
    if (!response) return undefined;
    return { id, ...response };
  }

  async addTrip(tripData: Omit<Trip, 'id'>): Promise<Trip> {
    const url = `${this.baseUrl}/trips.json`;
    
    try {
      const response = await firstValueFrom(
        this.http.post<{ name: string }>(url, tripData, { params: this.getAuthParams() })
      );
      
      if (!response.name) {
        throw new Error('Firebase did not return an ID for the new trip');
      }
      const newTrip = {
        id: response.name,
        ...tripData
      };
      // Update the subject with the new trip
      const currentTrips = this.tripsSubject.value;
      this.tripsSubject.next([...currentTrips, newTrip]);
      return newTrip;
    } catch (error) {
      console.error('Firebase POST error:', error);
      throw error;
    }
  }

  async updateTrip(id: string, tripData: Partial<Trip>): Promise<Trip | undefined> {
    const url = `${this.baseUrl}/trips/${id}.json`;
    await firstValueFrom(
      this.http.patch(url, tripData, { params: this.getAuthParams() })
    );
    const updatedTrip = await this.getTripById(id);
    if (updatedTrip) {
      // Update the subject with the updated trip
      const currentTrips = this.tripsSubject.value;
      const updatedTrips = currentTrips.map(trip => 
        trip.id === id ? updatedTrip : trip
      );
      this.tripsSubject.next(updatedTrips);
    }
    return updatedTrip;
  }

  async deleteTrip(id: string): Promise<boolean> {
    // Delete all events belonging to this trip first
    const events = await this.getEventsByTripId(id);
    for (const event of events) {
      if (event.id) {
        await this.deleteEvent(event.id);
      }
    }
    // Then delete the trip
    const url = `${this.baseUrl}/trips/${id}.json`;
    await firstValueFrom(
      this.http.delete(url, { params: this.getAuthParams() })
    );
    // Update the subject to remove the deleted trip
    const currentTrips = this.tripsSubject.value;
    const updatedTrips = currentTrips.filter(trip => trip.id !== id);
    this.tripsSubject.next(updatedTrips);
    return true;
  }

  // Event methods
  async getEventsByTripId(tripId: string): Promise<TravelEvent[]> {
    const params = this.getAuthParams()
      .set('orderBy', JSON.stringify('tripId'))
      .set('equalTo', JSON.stringify(tripId));

    const response = await firstValueFrom(
      this.http.get<Record<string, Omit<TravelEvent, 'id'>> | null>(
        `${this.baseUrl}/events.json`,
        { params }
      )
    );

    const events = this.mapFirebaseList<TravelEvent>(response);
    return events;
  }

  async getEventById(eventId: string): Promise<TravelEvent | undefined> {
    const url = `${this.baseUrl}/events/${eventId}.json`;
    const response = await firstValueFrom(
      this.http.get<Omit<TravelEvent, 'id'> | null>(url, { params: this.getAuthParams() })
    );
    if (!response) return undefined;
    return { id: eventId, ...response };
  }

  async addEvent(tripId: string, eventData: Omit<TravelEvent, 'id' | 'tripId'>): Promise<TravelEvent> {
    if (!tripId) {
      throw new Error('Cannot add event without tripId');
    }

    const eventToSave = {
      ...eventData,
      tripId
    };

    const response = await firstValueFrom(
      this.http.post<{ name: string }>(
        `${this.baseUrl}/events.json`,
        eventToSave,
        { params: this.getAuthParams() }
      )
    );

    if (!response?.name) {
      throw new Error('Firebase did not return an event id');
    }

    return {
      id: response.name,
      ...eventToSave
    };
  }

  async updateEvent(eventId: string, eventData: Partial<TravelEvent>): Promise<TravelEvent | undefined> {
    const url = `${this.baseUrl}/events/${eventId}.json`;
    await firstValueFrom(
      this.http.patch(url, eventData, { params: this.getAuthParams() })
    );
    return this.getEventById(eventId);
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const url = `${this.baseUrl}/events/${eventId}.json`;
    await firstValueFrom(
      this.http.delete(url, { params: this.getAuthParams() })
    );
    return true;
  }

  // Calculation methods (synchronous, operate on already-loaded data)
  getEventTotalCost(event: TravelEvent): number {
    if (!event.costs || event.costs.length === 0) {
      return 0;
    }
    return event.costs.reduce((total, cost) => total + cost.amount, 0);
  }

  async getTripTotalSpent(tripId: string): Promise<number> {
    const tripEvents = await this.getEventsByTripId(tripId);
    return tripEvents.reduce((total, event) => total + this.getEventTotalCost(event), 0);
  }
}
