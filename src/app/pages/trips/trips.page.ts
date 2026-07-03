import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Trip } from '../../models/trip.model';
import { TravelDataService } from '../../services/travel-data.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TripsPage implements OnInit {
  trips: Trip[] = [];

  constructor(private travelDataService: TravelDataService) {}

  ngOnInit() {
    this.trips = this.travelDataService.getTrips();
  }

  getTripTotalSpent(tripId: string): number {
    return this.travelDataService.getTripTotalSpent(tripId);
  }
}
