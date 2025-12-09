import { ApiResponse, FilterOptions } from '../../types/api';
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

export type ShiftCreateSuccessResponse = ApiResponse<ShiftResponse>;
export type ShiftCreateAvailabilityErrorResponse = ApiResponse<ShiftAvailability>;
export type ShiftCreateScheduleErrorResponse = ApiResponse<null>;
export type ShiftCreateClientNotFoundErrorResponse = ApiResponse<null>;

export type ShiftCreateResponse =
  | ShiftCreateSuccessResponse
  | ShiftCreateAvailabilityErrorResponse
  | ShiftCreateScheduleErrorResponse
  | ShiftCreateClientNotFoundErrorResponse;

export type ShiftGetByIdSuccessResponse = ApiResponse<ShiftResponse>;
export type ShiftGetByIdNotFoundErrorResponse = ApiResponse<null>;

export type ShiftGetByIdResponse =
  | ShiftGetByIdSuccessResponse
  | ShiftGetByIdNotFoundErrorResponse;
