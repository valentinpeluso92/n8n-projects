import { ShiftTypeEnum } from '../enums/shitType';
import { ShiftType } from '../model/shift';
import { AvailableSlot, TimeSlot } from '../model/timeSlot';

const HOME_SLOTS: AvailableSlot[] = [
  // Lunes a Viernes - Mañana
  { slot: { start: '09:30', end: '10:30' }, dayOfWeek: 1, maxConcurrent: 1, duration: 60 },
  { slot: { start: '09:30', end: '10:30' }, dayOfWeek: 2, maxConcurrent: 1, duration: 60 },
  { slot: { start: '09:30', end: '10:30' }, dayOfWeek: 3, maxConcurrent: 1, duration: 60 },
  { slot: { start: '09:30', end: '10:30' }, dayOfWeek: 4, maxConcurrent: 1, duration: 60 },
  { slot: { start: '09:30', end: '10:30' }, dayOfWeek: 5, maxConcurrent: 1, duration: 60 },

  { slot: { start: '10:30', end: '11:30' }, dayOfWeek: 1, maxConcurrent: 1, duration: 60 },
  { slot: { start: '10:30', end: '11:30' }, dayOfWeek: 2, maxConcurrent: 1, duration: 60 },
  { slot: { start: '10:30', end: '11:30' }, dayOfWeek: 3, maxConcurrent: 1, duration: 60 },
  { slot: { start: '10:30', end: '11:30' }, dayOfWeek: 4, maxConcurrent: 1, duration: 60 },
  { slot: { start: '10:30', end: '11:30' }, dayOfWeek: 5, maxConcurrent: 1, duration: 60 },

  { slot: { start: '11:30', end: '12:30' }, dayOfWeek: 1, maxConcurrent: 1, duration: 60 },
  { slot: { start: '11:30', end: '12:30' }, dayOfWeek: 2, maxConcurrent: 1, duration: 60 },
  { slot: { start: '11:30', end: '12:30' }, dayOfWeek: 3, maxConcurrent: 1, duration: 60 },
  { slot: { start: '11:30', end: '12:30' }, dayOfWeek: 4, maxConcurrent: 1, duration: 60 },
  { slot: { start: '11:30', end: '12:30' }, dayOfWeek: 5, maxConcurrent: 1, duration: 60 },

  // Lunes a Viernes - Tarde
  { slot: { start: '16:00', end: '17:00' }, dayOfWeek: 1, maxConcurrent: 1, duration: 60 },
  { slot: { start: '16:00', end: '17:00' }, dayOfWeek: 2, maxConcurrent: 1, duration: 60 },
  { slot: { start: '16:00', end: '17:00' }, dayOfWeek: 3, maxConcurrent: 1, duration: 60 },
  { slot: { start: '16:00', end: '17:00' }, dayOfWeek: 4, maxConcurrent: 1, duration: 60 },
  { slot: { start: '16:00', end: '17:00' }, dayOfWeek: 5, maxConcurrent: 1, duration: 60 },

  { slot: { start: '17:00', end: '18:00' }, dayOfWeek: 1, maxConcurrent: 1, duration: 60 },
  { slot: { start: '17:00', end: '18:00' }, dayOfWeek: 2, maxConcurrent: 1, duration: 60 },
  { slot: { start: '17:00', end: '18:00' }, dayOfWeek: 3, maxConcurrent: 1, duration: 60 },
  { slot: { start: '17:00', end: '18:00' }, dayOfWeek: 4, maxConcurrent: 1, duration: 60 },
  { slot: { start: '17:00', end: '18:00' }, dayOfWeek: 5, maxConcurrent: 1, duration: 60 },

  { slot: { start: '18:00', end: '19:00' }, dayOfWeek: 1, maxConcurrent: 1, duration: 60 },
  { slot: { start: '18:00', end: '19:00' }, dayOfWeek: 2, maxConcurrent: 1, duration: 60 },
  { slot: { start: '18:00', end: '19:00' }, dayOfWeek: 3, maxConcurrent: 1, duration: 60 },
  { slot: { start: '18:00', end: '19:00' }, dayOfWeek: 4, maxConcurrent: 1, duration: 60 },
  { slot: { start: '18:00', end: '19:00' }, dayOfWeek: 5, maxConcurrent: 1, duration: 60 },

  // Sábados
  { slot: { start: '09:30', end: '10:30' }, dayOfWeek: 6, maxConcurrent: 1, duration: 60 },
  { slot: { start: '10:30', end: '11:30' }, dayOfWeek: 6, maxConcurrent: 1, duration: 60 },
  { slot: { start: '11:30', end: '12:30' }, dayOfWeek: 6, maxConcurrent: 1, duration: 60 },
];

const CLINIC_SLOTS: AvailableSlot[] = [
  // Lunes a Viernes - Mañana
  { slot: { start: '09:30', end: '10:00' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '09:30', end: '10:00' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '09:30', end: '10:00' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '09:30', end: '10:00' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '09:30', end: '10:00' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '10:00', end: '10:30' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:00', end: '10:30' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:00', end: '10:30' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:00', end: '10:30' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:00', end: '10:30' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '10:30', end: '11:00' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:30', end: '11:00' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:30', end: '11:00' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:30', end: '11:00' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:30', end: '11:00' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '11:00', end: '11:30' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:00', end: '11:30' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:00', end: '11:30' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:00', end: '11:30' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:00', end: '11:30' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '11:30', end: '12:00' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:30', end: '12:00' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:30', end: '12:00' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:30', end: '12:00' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:30', end: '12:00' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  // Lunes a Viernes - Tarde
  { slot: { start: '16:00', end: '16:30' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '16:00', end: '16:30' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '16:00', end: '16:30' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '16:00', end: '16:30' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '16:00', end: '16:30' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '16:30', end: '17:00' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '16:30', end: '17:00' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '16:30', end: '17:00' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '16:30', end: '17:00' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '16:30', end: '17:00' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '17:00', end: '17:30' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '17:00', end: '17:30' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '17:00', end: '17:30' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '17:00', end: '17:30' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '17:00', end: '17:30' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '17:30', end: '18:00' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '17:30', end: '18:00' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '17:30', end: '18:00' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '17:30', end: '18:00' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '17:30', end: '18:00' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '18:00', end: '18:30' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '18:00', end: '18:30' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '18:00', end: '18:30' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '18:00', end: '18:30' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '18:00', end: '18:30' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  { slot: { start: '18:30', end: '19:00' }, dayOfWeek: 1, maxConcurrent: 4, duration: 30 },
  { slot: { start: '18:30', end: '19:00' }, dayOfWeek: 2, maxConcurrent: 4, duration: 30 },
  { slot: { start: '18:30', end: '19:00' }, dayOfWeek: 3, maxConcurrent: 4, duration: 30 },
  { slot: { start: '18:30', end: '19:00' }, dayOfWeek: 4, maxConcurrent: 4, duration: 30 },
  { slot: { start: '18:30', end: '19:00' }, dayOfWeek: 5, maxConcurrent: 4, duration: 30 },

  // Sábados
  { slot: { start: '09:30', end: '10:00' }, dayOfWeek: 6, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:00', end: '10:30' }, dayOfWeek: 6, maxConcurrent: 4, duration: 30 },
  { slot: { start: '10:30', end: '11:00' }, dayOfWeek: 6, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:00', end: '11:30' }, dayOfWeek: 6, maxConcurrent: 4, duration: 30 },
  { slot: { start: '11:30', end: '12:00' }, dayOfWeek: 6, maxConcurrent: 4, duration: 30 },
  { slot: { start: '12:00', end: '12:30' }, dayOfWeek: 6, maxConcurrent: 4, duration: 30 },
  { slot: { start: '12:30', end: '13:00' }, dayOfWeek: 6, maxConcurrent: 4, duration: 30 },
];

// Validar si un horario es válido para el tipo de turno
export const validateScheduleTime = (
  shiftType: ShiftType,
  scheduledDate: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    const date = new Date(scheduledDate);
    const dayOfWeek = date.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const timeString = formatTimeFromDate(date);

    // Verificar que no sea domingo
    if (dayOfWeek === 0) {
      errors.push('No se permiten turnos los domingos');
      return { isValid: false, errors };
    }

    // Obtener slots disponibles según el tipo
    const availableSlots = shiftType === ShiftTypeEnum.HOME ? HOME_SLOTS : CLINIC_SLOTS;

    // Buscar si existe un slot válido para este día y hora
    const validSlot = availableSlots.find((slot) =>
      slot.dayOfWeek === dayOfWeek &&
      isTimeInSlot(timeString, slot.slot)
    );

    if (!validSlot) {
      const availableTimes = getAvailableTimesForDay(shiftType, dayOfWeek).join(', ');
      const dayName = getDayName(dayOfWeek);
      errors.push(`Horario no disponible. Horarios disponibles para ${dayName}: ${availableTimes}`);
    }
  } catch (error) {
    errors.push('Fecha inválida');
  }

  return { isValid: errors.length === 0, errors };
};

// Verificar disponibilidad de slot (para evitar solapamientos)
export const validateSlotAvailability = (
  shiftType: ShiftType,
  scheduledDate: string,
  excludeShiftId?: string,
  existingShiftsInSlot?: number
): { isValid: boolean; errors: string[]; availableSpots?: number } => {
  const errors: string[] = [];

  try {
    const date = new Date(scheduledDate);
    const dayOfWeek = date.getDay();
    const timeString = formatTimeFromDate(date);

    // Obtener configuración del slot
    const availableSlots = shiftType === ShiftTypeEnum.HOME ? HOME_SLOTS : CLINIC_SLOTS;
    const slotConfig = availableSlots.find((slot) =>
      slot.dayOfWeek === dayOfWeek &&
      isTimeInSlot(timeString, slot.slot)
    );

    if (!slotConfig) {
      errors.push('Horario no disponible');
      return { isValid: false, errors };
    }

    // Para turnos a domicilio: máximo 1 turno por slot
    if (shiftType === ShiftTypeEnum.HOME) {
      if (existingShiftsInSlot && existingShiftsInSlot >= 1) {
        errors.push('Este horario ya está ocupado para turnos a domicilio');
      }
      return { isValid: errors.length === 0, errors, availableSpots: 1 - (existingShiftsInSlot || 0) };
    }

    // Para turnos en clínica: máximo 4 turnos por slot
    if (shiftType === ShiftTypeEnum.CLINIC) {
      if (existingShiftsInSlot && existingShiftsInSlot >= 4) {
        errors.push('Este horario está completo (máximo 4 turnos simultáneos en clínica)');
      }
      return { isValid: errors.length === 0, errors, availableSpots: 4 - (existingShiftsInSlot || 0) };
    }
  } catch (error) {
    errors.push('Error al validar disponibilidad del slot');
  }

  return { isValid: errors.length === 0, errors };
};

// Obtener horarios disponibles para un día específico
export const getAvailableTimesForDay = (shiftType: ShiftType, dayOfWeek: number): string[] => {
  const availableSlots = shiftType === ShiftTypeEnum.HOME ? HOME_SLOTS : CLINIC_SLOTS;

  return availableSlots
    .filter((slot) => slot.dayOfWeek === dayOfWeek)
    .map((slot) => `${slot.slot.start}-${slot.slot.end}`)
    .filter((value, index, self) => self.indexOf(value) === index); // Eliminar duplicados
};

// Obtener todos los horarios disponibles para un tipo de turno
export const getAvailableSchedules = (shiftType: ShiftType): { [day: string]: string[] } => {
  const schedules: { [day: string]: string[] } = {};

  for (let day = 1; day <= 6; day++) { // Lunes a Sábado
    const dayName = getDayName(day);
    schedules[dayName] = getAvailableTimesForDay(shiftType, day);
  }

  return schedules;
};

// Utilities
const formatTimeFromDate = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const isTimeInSlot = (time: string, slot: TimeSlot): boolean => {
  return time >= slot.start && time < slot.end;
};

const getDayName = (dayOfWeek: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayOfWeek];
};

// Parsear horario de string a Date
export const parseScheduleDateTime = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

// Obtener el slot correspondiente para una fecha/hora
export const getSlotForDateTime = (shiftType: ShiftType, scheduledDate: string): AvailableSlot | null => {
  try {
    const date = new Date(scheduledDate);
    const dayOfWeek = date.getDay();
    const timeString = formatTimeFromDate(date);

    const availableSlots = shiftType === ShiftTypeEnum.HOME ? HOME_SLOTS : CLINIC_SLOTS;

    return availableSlots.find((slot) =>
      slot.dayOfWeek === dayOfWeek &&
      isTimeInSlot(timeString, slot.slot)
    ) || null;
  } catch {
    return null;
  }
};
