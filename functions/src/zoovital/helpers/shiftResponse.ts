import { convertObjectTimestamps } from '../../utilities/timestamp';
import { ShiftTypeEnum } from '../enums/shitType';
import { ShiftResponse } from '../types/api';

export const mapShiftToResponse = (shift: ShiftResponse): ShiftResponse => {
  const shiftWithConvertedTimestamps = convertObjectTimestamps(shift);
  const response: ShiftResponse = {
    ...shiftWithConvertedTimestamps,
    googleCalendarLink: createGoogleCalendarLink(shiftWithConvertedTimestamps),
  };
  return response;
};

export const mapShiftsToResponse = (shifts: ShiftResponse[]): ShiftResponse[] => {
  return shifts.map(mapShiftToResponse);
};

const createGoogleCalendarLink = (shift: ShiftResponse): string => {
  if (!shift.client) return '';

  const title = `Turno con ${shift.client.name}`;
  const cleanedAddress = shift.client.address
    .toLowerCase() // Convertir a minúsculas
    .replace(/[^a-z0-9\s]/g, '') // Mantener solo letras, números y espacios
    .replace(/\s+/g, '+'); // Reemplazar espacios por '+'
  const location = shift.type === ShiftTypeEnum.HOME ? cleanedAddress : 'Veterinary Clinic';
  const startDateTime = getEncodedStartDateTime(shift.date as string);
  const duration = shift.duration || 60; // Duración en minutos, por defecto 60 minutos
  const endDateTime = getEncodedEndDateTime(shift.date as string, duration);

  // eslint-disable-next-line max-len
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&location=${encodeURIComponent(location)}`;
};

const getEncodedStartDateTime = (date: string): string => {
  return new Date(date).toISOString().replace(/[-:]|\.\d{3}/g, '');
};

const getEncodedEndDateTime = (date: string, duration: number): string => {
  return new Date(new Date(date).getTime() + duration * 60 * 1000).toISOString().replace(/[-:]|\.\d{3}/g, '');
};
