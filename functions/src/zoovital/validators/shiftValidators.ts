import { ValidationResult } from '../../types/api';
import { ShiftPriorityEnum } from '../enums/shiftPriority';
import { ShiftStatusEnum } from '../enums/shiftStatus';
import { ShiftTypeEnum } from '../enums/shitType';
import { Shift } from '../model/shift';

export const validateGetShiftsFilter = (filter: any): ValidationResult => {
  const errors: string[] = [];

  if (filter.date !== undefined && !isValidDate(filter.date)) {
    errors.push('Formato de fecha inválido para el filtro de fecha');
  }

  if (filter.dateFrom !== undefined && !isValidDate(filter.dateFrom)) {
    errors.push('Formato de fecha inválido para dateFrom');
  }

  if (filter.dateTo !== undefined && !isValidDate(filter.dateTo)) {
    errors.push('Formato de fecha inválido para dateTo');
  }

  if (filter.type !== undefined && !Object.values(ShiftTypeEnum).includes(filter.type)) {
    errors.push(`Tipo de turno inválido en el filtro. Valores permitidos: ${Object.values(ShiftTypeEnum).join(', ')}`);
  }

  if (filter.priority !== undefined && !Object.values(ShiftPriorityEnum).includes(filter.priority)) {
    errors.push(`Prioridad inválida en el filtro. Valores permitidos: ${Object.values(ShiftPriorityEnum).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePostShiftData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Los datos del turno deben ser un objeto válido');
    return { isValid: false, errors };
  }

  // Validar clientId (requerido)
  if (!data.clientId || typeof data.clientId !== 'string' || data.clientId.trim().length === 0) {
    errors.push('El ID del cliente es requerido');
  }

  // Validar date (requerido)
  if (data.date === undefined) {
    errors.push('La fecha del turno es requerida');
  } else if (!isValidDate(data.date)) {
    errors.push('Formato de fecha inválido');
  } else if (isPastDate(data.date)) {
    errors.push('La fecha del turno no puede ser en el pasado');
  } else if (isFutureDate(data.date)) {
    errors.push('La fecha del turno no puede ser más de un año en el futuro');
  }

  if (data.type === undefined) {
    errors.push('El tipo de turno es requerido');
  } else if (!Object.values(ShiftTypeEnum).includes(data.type)) {
    errors.push(`Tipo de turno inválido. Valores permitidos: ${Object.values(ShiftTypeEnum).join(', ')}`);
  }

  // Validar priority (opcional)
  if (data.priority !== undefined && !Object.values(ShiftPriorityEnum).includes(data.priority)) {
    errors.push(`Prioridad inválida. Valores permitidos: ${Object.values(ShiftPriorityEnum).join(', ')}`);
  }

  // Validar status (opcional)
  if (data.status !== undefined && !Object.values(ShiftStatusEnum).includes(data.status)) {
    errors.push(`Estado inválido. Valores permitidos: ${Object.values(ShiftStatusEnum).join(', ')}`);
  }

  // Validar duration (opcional)
  if (data.duration !== undefined && !isValidDuration(data.duration)) {
    errors.push('La duración debe ser entre 15 y 480 minutos');
  }

  // Validar notes (opcional)
  if (data.notes && typeof data.notes !== 'string') {
    errors.push('Las notas deben ser texto');
  }

  // Validar veterinarian (opcional)
  if (data.veterinarian && typeof data.veterinarian !== 'string') {
    errors.push('El veterinario debe ser texto');
  }

  // Validar service (opcional)
  if (data.service && typeof data.service !== 'string') {
    errors.push('El servicio debe ser texto');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateShiftData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    errors.push('Los datos para actualizar son requeridos');
    return { isValid: false, errors };
  }

  // Validar campos opcionales si están presentes
  if (data.clientId !== undefined) {
    if (!data.clientId || typeof data.clientId !== 'string' || data.clientId.trim().length === 0) {
      errors.push('El ID del cliente debe ser válido');
    }
  }

  if (data.date !== undefined && !isValidDate(data.date)) {
    errors.push('Formato de fecha inválido');
  } else if (data.date !== undefined && isPastDate(data.date)) {
    errors.push('La fecha del turno no puede ser en el pasado');
  }

  if (data.type !== undefined && !Object.values(ShiftTypeEnum).includes(data.type)) {
    errors.push(`Tipo de turno inválido. Valores permitidos: ${Object.values(ShiftTypeEnum).join(', ')}`);
  }

  if (data.priority !== undefined && !Object.values(ShiftPriorityEnum).includes(data.priority)) {
    errors.push(`Prioridad inválida. Valores permitidos: ${Object.values(ShiftPriorityEnum).join(', ')}`);
  }

  if (data.status !== undefined && !Object.values(ShiftStatusEnum).includes(data.status)) {
    errors.push(`Estado inválido. Valores permitidos: ${Object.values(ShiftStatusEnum).join(', ')}`);
  }

  if (data.duration !== undefined && !isValidDuration(data.duration)) {
    errors.push('La duración debe ser entre 15 y 480 minutos');
  }

  if (data.notes !== undefined && typeof data.notes !== 'string') {
    errors.push('Las notas deben ser texto');
  }

  if (data.veterinarian !== undefined && typeof data.veterinarian !== 'string') {
    errors.push('El veterinario debe ser texto');
  }

  if (data.service !== undefined && typeof data.service !== 'string') {
    errors.push('El servicio debe ser texto');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateShiftId = (id: any): string | null => {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return 'ID del turno es requerido y debe ser válido';
  }
  return null;
};

export const sanitizeShiftData = (data: any): Partial<Shift> => {
  const sanitized: Partial<Shift> = {};

  if (data.clientId && typeof data.clientId === 'string') {
    sanitized.clientId = data.clientId.trim();
  }

  if (data.date && isValidDate(data.date)) {
    // Asegurar que sea una fecha válida
    sanitized.date = new Date(data.date);
  }

  if (data.status && Object.values(ShiftStatusEnum).includes(data.status)) {
    sanitized.status = data.status;
  }

  if (data.notes && typeof data.notes === 'string') {
    sanitized.notes = data.notes.trim();
  }

  if (data.duration && isValidDuration(data.duration)) {
    sanitized.duration = parseInt(data.duration);
  }

  if (data.veterinarian && typeof data.veterinarian === 'string') {
    sanitized.veterinarian = data.veterinarian.trim();
  }

  if (data.service && typeof data.service === 'string') {
    sanitized.service = data.service.trim();
  }

  return sanitized;
};

export const isValidDate = (dateStr: string): boolean => {
  return !isNaN((new Date(dateStr)).getTime());
};

export const isPastDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date < now;
};

export const isFutureDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1); // Máximo 1 año
  return date > maxDate;
};

export const isValidDuration = (durationStr: string): boolean => {
  const duration = parseInt(durationStr);
  return !isNaN(duration) && duration >= 30 && duration <= 60;
};

// export const validateScheduleConflict = async (
//   date: Date,
//   duration = 60,
//   excludeShiftId?: string
// ): Promise<ValidationResult> => {
//   // Esta función se implementaría en el service para verificar conflictos
//   // Por ahora, solo estructura para futura implementación
//   return {
//     isValid: true,
//     errors: [],
//   };
// };
