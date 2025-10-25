import { Client } from '../model/client';
import { Shift } from '../model/shift';

export interface ClientWithId extends Client {
  id: string;
}

export interface ShiftWithId extends Shift {
  id: string;
}
