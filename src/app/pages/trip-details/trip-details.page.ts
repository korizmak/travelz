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
  totalSpent = 0;
  remainingBudget: number | undefined;
  eventCosts: Record<string, number> = {};
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private travelDataService: TravelDataService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('tripId') || '';
  }

  async ionViewWillEnter() {
    await this.loadTripDetails();
  }

  async loadTripDetails() {
    if (this.loading) return;

    try {
      this.loading = true;
      this.tripId = this.route.snapshot.paramMap.get('tripId') || '';
      this.trip = await this.travelDataService.getTripById(this.tripId);

      if (this.trip) {
        this.events = await this.travelDataService.getEventsByTripId(this.tripId);
        this.computeTotals();
      }
    } finally {
      this.loading = false;
    }
  }

  private computeTotals() {
    // Compute event costs
    const costs: Record<string, number> = {};
    let total = 0;

    for (const event of this.events) {
      if (event.id) {
        const cost = this.travelDataService.getEventTotalCost(event);
        costs[event.id] = cost;
        total += cost;
      }
    }

    this.eventCosts = costs;
    this.totalSpent = total;

    // Compute remaining budget
    if (this.trip && this.trip.budget) {
      this.remainingBudget = this.trip.budget - total;
    } else {
      this.remainingBudget = undefined;
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
          handler: async () => {
            await this.travelDataService.deleteTrip(this.tripId);
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
          handler: async () => {
            if (eventId) {
              await this.travelDataService.deleteEvent(eventId);
              await this.loadTripDetails();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
