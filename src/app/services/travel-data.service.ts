import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { TravelEvent } from '../models/travel-event.model';
import { EventType } from '../models/event-type.enum';
import { CostItem } from '../models/cost-item.model';

@Injectable({
  providedIn: 'root'
})
export class TravelDataService {
  private trips: Trip[] = [
    {
      id: '1',
      title: 'Paris Adventure',
      destination: 'Paris, France',
      startDate: '2026-06-15',
      endDate: '2026-06-22',
      budget: 2000,
      description: 'A week exploring the city of lights'
    },
    {
      id: '2',
      title: 'Rome Getaway',
      destination: 'Rome, Italy',
      startDate: '2026-07-10',
      endDate: '2026-07-17',
      budget: 1800,
      description: 'Ancient history and Italian cuisine'
    },
    {
      id: '3',
      title: 'Barcelona Beach Trip',
      destination: 'Barcelona, Spain',
      startDate: '2026-08-05',
      endDate: '2026-08-12',
      budget: 1500,
      description: 'Sun, sea, and Gaudi architecture'
    }
  ];

  private events: TravelEvent[] = [
    {
      id: '1',
      tripId: '1',
      title: 'Hotel Le Marais',
      type: EventType.accommodation,
      date: '2026-06-15',
      time: '14:00',
      notes: 'Check-in at boutique hotel',
      costs: [
        { title: 'Night 1', amount: 120 },
        { title: 'Night 2', amount: 120 },
        { title: 'Night 3', amount: 120 }
      ]
    },
    {
      id: '2',
      tripId: '1',
      title: 'Eiffel Tower Visit',
      type: EventType.sightseeing,
      date: '2026-06-16',
      time: '10:00',
      notes: 'Book tickets in advance',
      costs: [
        { title: 'Tickets', amount: 30 }
      ]
    },
    {
      id: '3',
      tripId: '1',
      title: 'Dinner at Le Petit Cler',
      type: EventType.food,
      date: '2026-06-16',
      time: '19:30',
      notes: 'French bistro experience',
      costs: [
        { title: 'Dinner for 2', amount: 85 }
      ]
    },
    {
      id: '4',
      tripId: '1',
      title: 'Metro Pass',
      type: EventType.transport,
      date: '2026-06-15',
      notes: 'Weekly pass for unlimited travel',
      costs: [
        { title: 'Weekly Pass', amount: 25 }
      ]
    },
    {
      id: '5',
      tripId: '2',
      title: 'Hotel Colosseum',
      type: EventType.accommodation,
      date: '2026-07-10',
      time: '15:00',
      notes: 'Central location near Colosseum',
      costs: [
        { title: 'Night 1', amount: 100 },
        { title: 'Night 2', amount: 100 },
        { title: 'Night 3', amount: 100 }
      ]
    },
    {
      id: '6',
      tripId: '2',
      title: 'Colosseum Tour',
      type: EventType.sightseeing,
      date: '2026-07-11',
      time: '09:00',
      notes: 'Guided tour with skip-the-line',
      costs: [
        { title: 'Tour Tickets', amount: 45 }
      ]
    },
    {
      id: '7',
      tripId: '2',
      title: 'Vatican Museums',
      type: EventType.sightseeing,
      date: '2026-07-12',
      time: '08:30',
      notes: 'Early morning visit',
      costs: [
        { title: 'Museum Entry', amount: 22 }
      ]
    },
    {
      id: '8',
      tripId: '3',
      title: 'Hotel Gothic Quarter',
      type: EventType.accommodation,
      date: '2026-08-05',
      time: '16:00',
      notes: 'Historic center location',
      costs: [
        { title: 'Night 1', amount: 95 },
        { title: 'Night 2', amount: 95 },
        { title: 'Night 3', amount: 95 }
      ]
    },
    {
      id: '9',
      tripId: '3',
      title: 'Sagrada Familia',
      type: EventType.sightseeing,
      date: '2026-08-06',
      time: '11:00',
      notes: 'Gaudi masterpiece',
      costs: [
        { title: 'Entry Ticket', amount: 36 }
      ]
    },
    {
      id: '10',
      tripId: '3',
      title: 'Paella Dinner',
      type: EventType.food,
      date: '2026-08-06',
      time: '20:00',
      notes: 'Traditional Spanish cuisine',
      costs: [
        { title: 'Dinner for 2', amount: 65 }
      ]
    }
  ];

  // Trip methods
  getTrips(): Trip[] {
    return [...this.trips];
  }

  getTripById(id: string): Trip | undefined {
    return this.trips.find(trip => trip.id === id);
  }

  addTrip(trip: Omit<Trip, 'id'>): Trip {
    const newTrip: Trip = {
      ...trip,
      id: Date.now().toString()
    };
    this.trips.push(newTrip);
    return newTrip;
  }

  updateTrip(id: string, trip: Partial<Trip>): Trip | undefined {
    const index = this.trips.findIndex(t => t.id === id);
    if (index === -1) {
      return undefined;
    }
    this.trips[index] = { ...this.trips[index], ...trip };
    return this.trips[index];
  }

  deleteTrip(id: string): boolean {
    const index = this.trips.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }
    this.trips.splice(index, 1);
    this.events = this.events.filter(event => event.tripId !== id);
    return true;
  }

  // Event methods
  getEventsByTripId(tripId: string): TravelEvent[] {
    return this.events.filter(event => event.tripId === tripId);
  }

  getEventById(eventId: string): TravelEvent | undefined {
    return this.events.find(event => event.id === eventId);
  }

  addEvent(tripId: string, eventData: Omit<TravelEvent, 'id'>): TravelEvent {
    const newEvent: TravelEvent = {
      ...eventData,
      tripId,
      id: Date.now().toString()
    };
    this.events.push(newEvent);
    return newEvent;
  }

  updateEvent(eventId: string, eventData: Partial<TravelEvent>): TravelEvent | undefined {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index === -1) {
      return undefined;
    }
    this.events[index] = { ...this.events[index], ...eventData };
    return this.events[index];
  }

  deleteEvent(eventId: string): boolean {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index === -1) {
      return false;
    }
    this.events.splice(index, 1);
    return true;
  }

  // Calculation methods
  getEventTotalCost(event: TravelEvent): number {
    if (!event.costs || event.costs.length === 0) {
      return 0;
    }
    return event.costs.reduce((total, cost) => total + cost.amount, 0);
  }

  getTripTotalSpent(tripId: string): number {
    const tripEvents = this.getEventsByTripId(tripId);
    return tripEvents.reduce((total, event) => total + this.getEventTotalCost(event), 0);
  }
}
