import { FilterOptions } from '../../types/api';
import { Client } from '../model/client';
import { Shift } from '../model/shift';

export interface ClientWithId extends Client {
  id: string;
}

export interface ShiftWithId extends Shift {
  id: string;
}

export interface ShiftFilterOptions extends FilterOptions {
  filter: {
    clientId?: string;
    date?: string;
    dateTo?: string;
    dateFrom?: string;
    type?: string;
    priority?: string;
  }
}
