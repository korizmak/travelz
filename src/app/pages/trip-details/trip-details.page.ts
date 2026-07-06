import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewWillEnter, IonicModule, AlertController } from '@ionic/angular';
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
  tripId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private travelDataService: TravelDataService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('tripId') || '';
    this.loadTripDetails();
  }

  ionViewWillEnter() {
    this.loadTripDetails();
  }

  loadTripDetails() {
    this.tripId = this.route.snapshot.paramMap.get('tripId') || '';
    this.trip = this.travelDataService.getTripById(this.tripId);

    if (this.trip) {
      this.events = this.travelDataService.getEventsByTripId(this.tripId);
    }
  }

  formatDate(dateValue?: string): string {
    if (!dateValue) {
      return '';
    }

    const parts = dateValue.split('-');
    if (parts.length !== 3) {
      return dateValue;
    }

    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
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

  async deleteTrip() {
    const alert = await this.alertController.create({
      header: 'Delete Trip',
      message: 'Are you sure you want to delete this trip? This will also delete all activities.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.travelDataService.deleteTrip(this.tripId);
            this.router.navigate(['/trips']);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteEvent(eventId: string | undefined) {
    const alert = await this.alertController.create({
      header: 'Delete Activity',
      message: 'Are you sure you want to delete this activity?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.travelDataService.deleteEvent(eventId!);
            this.loadTripDetails();
          }
        }
      ]
    });

    await alert.present();
  }
}
