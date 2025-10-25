import { ShiftStatusEnum } from '../enums/shiftStatus';

export type ShiftStatus = keyof typeof ShiftStatusEnum;

export interface Shift {
  clientId: string;
  date: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  status?: ShiftStatus;
  notes?: string;
  duration?: number; // en minutos
  veterinarian?: string;
  service?: string;
}
