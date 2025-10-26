import { FilterOptions } from '../../types/api';
import { Client } from '../model/client';
import { Shift } from '../model/shift';

export type ClientResponse = {
  whatsappLink: string;
  googleMapsLink: string;
} & Client;

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
