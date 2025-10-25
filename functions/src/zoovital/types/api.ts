import { FilterOptions } from '../../types/api';
import { Client } from '../model/client';
import { Shift } from '../model/shift';

export interface ClientWithId extends Client {
  id: string;
}

export interface ClientFilterOptions extends FilterOptions {
  name?: string;
}

export interface ShiftWithId extends Shift {
  id: string;
}

export interface ShiftFilterOptions extends FilterOptions {
  clientId?: string;
  date?: string;
  status?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}
