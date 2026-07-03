import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Trip } from '../../models/trip.model';
import { TravelDataService } from '../../services/travel-data.service';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.page.html',
  styleUrls: ['./trip-form.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonicModule]
})
export class TripFormPage implements OnInit {
  tripId: string | null = null;
  isEditMode = false;
  pageTitle = 'Add Trip';
  submitButtonText = 'Add Trip';

  form = {
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private travelDataService: TravelDataService
  ) {}

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('tripId');
    
    if (this.tripId) {
      this.isEditMode = true;
      this.pageTitle = 'Edit Trip';
      this.submitButtonText = 'Save Changes';
      this.loadTrip();
    }
  }

  loadTrip() {
    const trip = this.travelDataService.getTripById(this.tripId!);
    if (trip) {
      this.form = {
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget ? trip.budget.toString() : '',
        description: trip.description || ''
      };
    }
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const tripData: Omit<Trip, 'id'> = {
      title: this.form.title,
      destination: this.form.destination,
      startDate: this.form.startDate,
      endDate: this.form.endDate,
      budget: this.form.budget ? parseFloat(this.form.budget) : undefined,
      description: this.form.description || undefined
    };

    if (this.isEditMode && this.tripId) {
      const updatedTrip = this.travelDataService.updateTrip(this.tripId, tripData);
      if (updatedTrip) {
        this.router.navigate(['/trips', this.tripId]);
      }
    } else {
      const newTrip = this.travelDataService.addTrip(tripData);
      this.router.navigate(['/trips', newTrip.id]);
    }
  }

  onCancel() {
    if (this.isEditMode && this.tripId) {
      this.router.navigate(['/trips', this.tripId]);
    } else {
      this.router.navigate(['/trips']);
    }
  }

  validateForm(): boolean {
    if (!this.form.title.trim()) {
      alert('Title is required');
      return false;
    }
    if (!this.form.destination.trim()) {
      alert('Destination is required');
      return false;
    }
    if (!this.form.startDate) {
      alert('Start date is required');
      return false;
    }
    if (!this.form.endDate) {
      alert('End date is required');
      return false;
    }
    if (this.form.budget && (isNaN(parseFloat(this.form.budget)) || parseFloat(this.form.budget) < 0)) {
      alert('Budget must be a positive number or zero');
      return false;
    }
    return true;
  }
}
