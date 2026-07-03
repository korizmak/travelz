import { EventType } from './event-type.enum';
import { CostItem } from './cost-item.model';

export interface TravelEvent {
  id?: string;
  tripId: string;
  title: string;
  type: EventType;
  date?: string;
  time?: string;
  notes?: string;
  costs?: CostItem[];
}
