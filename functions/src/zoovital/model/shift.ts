import { ShiftPriorityEnum } from '../enums/shiftPriority';
import { ShiftStatusEnum } from '../enums/shiftStatus';
import { ShiftTypeEnum } from '../enums/shitType';

export type ShiftStatus =
  ShiftStatusEnum.SCHEDULED |
  ShiftStatusEnum.COMPLETED |
  ShiftStatusEnum.CANCELLED |
  ShiftStatusEnum.NO_SHOW;

export type ShiftType =
  ShiftTypeEnum.HOME |
  ShiftTypeEnum.CLINIC;

export type ShiftPriority =
  ShiftPriorityEnum.LOW |
  ShiftPriorityEnum.MEDIUM |
  ShiftPriorityEnum.HIGH |
  ShiftPriorityEnum.URGENT;

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
