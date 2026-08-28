import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { Trip } from '../../models/trip.model';
import { TravelDataService } from '../../services/travel-data.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

addIcons({ add });

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule]
})
export class TripsPage implements OnInit, OnDestroy {
  trips: Trip[] = [];
  tripTotals: Record<string, number> = {};
  loading = true;
  private tripsSubscription: Subscription | null = null;
  private loadingTotals = false;

  constructor(
    private travelDataService: TravelDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Subscribe to trips$ for real-time updates
    this.tripsSubscription = this.travelDataService.trips$.subscribe(async trips => {
      this.trips = trips;
      this.loading = false;
      await this.loadTripTotals();
    });
    // Initial load from Firebase
    await this.travelDataService.getTrips();
  }

  ngOnDestroy() {
    if (this.tripsSubscription) {
      this.tripsSubscription.unsubscribe();
    }
  }

  private async loadTripTotals(): Promise<void> {
    if (this.loadingTotals) return;

    try {
      this.loadingTotals = true;
      const totals: Record<string, number> = {};

      for (const trip of this.trips) {
        if (trip.id) {
          totals[trip.id] = await this.travelDataService.getTripTotalSpent(trip.id);
        }
      }

      this.tripTotals = totals;
    } finally {
      this.loadingTotals = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
