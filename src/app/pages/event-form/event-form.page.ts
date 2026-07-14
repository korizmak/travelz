import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TravelEvent } from '../../models/travel-event.model';
import { CostItem } from '../../models/cost-item.model';
import { EventType } from '../../models/event-type.enum';
import { TravelDataService } from '../../services/travel-data.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.page.html',
  styleUrls: ['./event-form.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonicModule]
})
export class EventFormPage implements OnInit {
  tripId = '';
  eventId: string | null = null;
  isEditMode = false;
  pageTitle = 'Add Activity';
  submitButtonText = 'Add Activity';
  saving = false;

  form = {
    title: '',
    type: '' as EventType | '',
    date: '',
    time: '',
    notes: ''
  };

  costs: CostItem[] = [{ title: '', amount: 0 }];

  eventTypes = [
    { value: EventType.accommodation, label: 'Accommodation' },
    { value: EventType.transport, label: 'Transport' },
    { value: EventType.sightseeing, label: 'Sightseeing' },
    { value: EventType.food, label: 'Food' },
    { value: EventType.entertainment, label: 'Entertainment' },
    { value: EventType.other, label: 'Other' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private travelDataService: TravelDataService
  ) {}

  async ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('tripId') || '';
    this.eventId = this.route.snapshot.paramMap.get('eventId');

    if (this.eventId) {
      this.isEditMode = true;
      this.pageTitle = 'Edit Activity';
      this.submitButtonText = 'Save Changes';
      await this.loadEvent();
    }
  }

  async loadEvent() {
    const event = await this.travelDataService.getEventById(this.eventId!);
    if (event) {
      this.form = {
        title: event.title,
        type: event.type || '',
        date: event.date || '',
        time: event.time || '',
        notes: event.notes || ''
      };

      const existingCost = event.costs && event.costs.length > 0 ? event.costs[0] : null;
      this.costs = [{
        title: existingCost?.title || '',
        amount: existingCost?.amount || 0
      }];
    }
  }

  async onSubmit() {
    if (this.saving) {
      return;
    }

    if (!this.tripId) {
      alert('Trip ID is missing. Cannot save activity.');
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    const firstCost = this.costs[0];
    const normalizedAmount = Math.max(0, Number(firstCost?.amount) || 0);

    const validCosts = normalizedAmount > 0
      ? [{
          title: 'Cost',
          amount: normalizedAmount
        }]
      : [];

    const eventData: Omit<TravelEvent, 'id' | 'tripId'> = {
      title: this.form.title.trim(),
      type: this.form.type as EventType,
      date: this.form.date || undefined,
      time: this.form.time || undefined,
      notes: this.form.notes || undefined,
      costs: validCosts.length > 0 ? validCosts : undefined
    };

    try {
      this.saving = true;
      if (this.isEditMode && this.eventId) {
        const updatedEvent = await this.travelDataService.updateEvent(this.eventId, eventData);
        if (updatedEvent) {
          this.router.navigate(['/trips', this.tripId]);
        }
      } else {
        await this.travelDataService.addEvent(this.tripId, eventData);
        this.router.navigate(['/trips', this.tripId]);
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save activity. Please try again.');
    } finally {
      this.saving = false;
    }
  }

  onCancel() {
    this.router.navigate(['/trips', this.tripId]);
  }

  validateForm(): boolean {
    if (!this.form.title.trim()) {
      alert('Title is required');
      return false;
    }
    if (!this.form.type) {
      alert('Type is required');
      return false;
    }

    const cost = this.costs[0];
    if (!cost) {
      return true;
    }

    const numericAmount = Number(cost.amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      alert('Cost amount must be a positive number or zero');
      return false;
    }

    return true;
  }
}
