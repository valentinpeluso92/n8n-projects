
// === validators/shiftValidators.ts ===

import { SHIFT_STATUS } from '../../constants';
import { ValidationResult } from '../../types/api';
import { Shift } from '../model/shift';

export const validateShiftData = (data: any): ValidationResult => {
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
  if (!data.date) {
    errors.push('La fecha del turno es requerida');
  } else {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Formato de fecha inválido');
    } else {
      // Validar que la fecha no sea en el pasado (opcional)
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Inicio del día actual
      if (date < now) {
        errors.push('La fecha del turno no puede ser en el pasado');
      }

      // Validar que la fecha no sea muy lejana (opcional)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1); // Máximo 1 año
      if (date > maxDate) {
        errors.push('La fecha del turno no puede ser más de un año en el futuro');
      }
    }
  }

  // Validar status (opcional)
  if (data.status && !Object.values(SHIFT_STATUS).includes(data.status)) {
    errors.push(`Estado inválido. Valores permitidos: ${Object.values(SHIFT_STATUS).join(', ')}`);
  }

  // Validar duration (opcional)
  if (data.duration !== undefined) {
    const duration = parseInt(data.duration);
    if (isNaN(duration) || duration < 15 || duration > 480) { // 15 min - 8 horas
      errors.push('La duración debe ser entre 15 y 480 minutos');
    }
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

  if (data.date !== undefined) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Formato de fecha inválido');
    } else {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (date < now) {
        errors.push('La fecha del turno no puede ser en el pasado');
      }
    }
  }

  if (data.status !== undefined && !Object.values(SHIFT_STATUS).includes(data.status)) {
    errors.push(`Estado inválido. Valores permitidos: ${Object.values(SHIFT_STATUS).join(', ')}`);
  }

  if (data.duration !== undefined) {
    const duration = parseInt(data.duration);
    if (isNaN(duration) || duration < 15 || duration > 480) {
      errors.push('La duración debe ser entre 15 y 480 minutos');
    }
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

  if (data.date) {
    // Asegurar que sea una fecha válida
    const date = new Date(data.date);
    if (!isNaN(date.getTime())) {
      sanitized.date = date;
    }
  }

  if (data.status && Object.values(SHIFT_STATUS).includes(data.status)) {
    sanitized.status = data.status;
  }

  if (data.notes && typeof data.notes === 'string') {
    sanitized.notes = data.notes.trim();
  }

  if (data.duration) {
    const duration = parseInt(data.duration);
    if (!isNaN(duration) && duration >= 15 && duration <= 480) {
      sanitized.duration = duration;
    }
  }

  if (data.veterinarian && typeof data.veterinarian === 'string') {
    sanitized.veterinarian = data.veterinarian.trim();
  }

  if (data.service && typeof data.service === 'string') {
    sanitized.service = data.service.trim();
  }

  return sanitized;
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
