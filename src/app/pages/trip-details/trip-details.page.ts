import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewWillEnter, IonicModule } from '@ionic/angular';
import { Trip } from '../../models/trip.model';
import { TravelEvent } from '../../models/travel-event.model';
import { TravelDataService } from '../../services/travel-data.service';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.page.html',
  styleUrls: ['./trip-details.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class TripDetailsPage implements OnInit, ViewWillEnter {
  trip: Trip | undefined;
  events: TravelEvent[] = [];
  tripId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private travelDataService: TravelDataService
  ) {}

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('tripId') || '';
    this.loadTripDetails();
  }

  ionViewWillEnter() {
    this.loadTripDetails();
  }

  loadTripDetails() {
    this.trip = this.travelDataService.getTripById(this.tripId);
    
    if (this.trip) {
      this.events = this.travelDataService.getEventsByTripId(this.tripId);
    }
  }

  getEventTotalCost(event: TravelEvent): number {
    return this.travelDataService.getEventTotalCost(event);
  }

  getTripTotalSpent(): number {
    return this.travelDataService.getTripTotalSpent(this.tripId);
  }

  getRemainingBudget(): number | undefined {
    if (this.trip && this.trip.budget) {
      return this.trip.budget - this.getTripTotalSpent();
    }
    return undefined;
  }

  goBack() {
    this.router.navigate(['/trips']);
  }
}
