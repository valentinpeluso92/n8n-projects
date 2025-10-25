import { ShiftPriorityEnum } from '../enums/shiftPriority';
import { ShiftStatusEnum } from '../enums/shiftStatus';
import { ShiftTypeEnum } from '../enums/shitType';

export type ShiftStatus = keyof typeof ShiftStatusEnum;
export type ShiftType = keyof typeof ShiftTypeEnum;
export type ShiftPriority = keyof typeof ShiftPriorityEnum;

export interface Shift {
  clientId: string;
  date: Date | string;
  type: ShiftType;
  priority: ShiftPriority;

  createdAt?: Date | string;
  updatedAt?: Date | string;
  status?: ShiftStatus;
  notes?: string;
  duration?: number; // en minutos
  veterinarian?: string;
  service?: string;
}
