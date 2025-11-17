import { ApiError, FilterOptions } from '../../types/api';
import { Client } from '../model/client';
import { Shift } from '../model/shift';

export type ClientResponse = {
  whatsappLink: string;
  googleMapsLink: string;
} & Client;

export interface ClientFilterOptions extends FilterOptions {
  filter: {
    name?: string;
    email?: string;
    phone?: string;
    age?: string;
    address?: string;
    clientIds?: string;
  }
}

export type ShiftResponse = {
  client: ClientResponse | null;
  googleCalendarLink: string;
} & Shift;

export type ShiftAvailability = {
  currentShifts: number;
  maxAllowed: number;
  availableSpots: number;
};

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

export type ApiSuccess = {
  code: number;
}

export type ShiftCreateSuccessResponse = { id: string; data: ShiftResponse } & ApiSuccess;
export type ShiftCreateAvailabilityErrorResponse = {
  data: ShiftAvailability;
} & ApiError;
export type ShiftCreateScheduleErrorResponse = ApiError;
export type ShiftCreateClientNotFoundErrorResponse = ApiError;

export type ShiftCreateResponse =
  | ShiftCreateSuccessResponse
  | ShiftCreateAvailabilityErrorResponse
  | ShiftCreateScheduleErrorResponse
  | ShiftCreateClientNotFoundErrorResponse;
