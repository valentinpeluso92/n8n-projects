
// === validators/index.ts ===

import {Client} from '../model/client';
import {ValidationResult} from '../../types/api';
import {DEFAULT_THRESHOLD, MAX_THRESHOLD, MIN_THRESHOLD} from '../../constants';

export const validateClientData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Los datos del cliente deben ser un objeto válido');
    return {isValid: false, errors};
  }

  // Required fields validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('El nombre del cliente es requerido');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('El email del cliente es requerido');
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('El formato del email no es válido');
    }
  }

  // Optional field validations
  if (data.phone && typeof data.phone !== 'string') {
    errors.push('El teléfono debe ser una cadena de texto');
  }

  if (data.age && (!Number.isInteger(data.age) || data.age < 0 || data.age > 150)) {
    errors.push('La edad debe ser un número entero entre 0 y 150');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    errors.push('Los datos para actualizar son requeridos');
    return {isValid: false, errors};
  }

  // Validate only provided fields
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('El nombre debe ser una cadena de texto no vacía');
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push('El email debe ser una cadena de texto');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('El formato del email no es válido');
      }
    }
  }

  if (data.phone !== undefined && typeof data.phone !== 'string') {
    errors.push('El teléfono debe ser una cadena de texto');
  }

  if (data.age !== undefined) {
    if (!Number.isInteger(data.age) || data.age < 0 || data.age > 150) {
      errors.push('La edad debe ser un número entero entre 0 y 150');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateId = (id: any): string | null => {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return 'ID del cliente es requerido y debe ser válido';
  }
  return null;
};

export const validateThreshold = (threshold: any): number => {
  if (threshold === undefined || threshold === null) {
    return DEFAULT_THRESHOLD;
  }

  const parsed = parseInt(String(threshold));
  if (isNaN(parsed)) {
    return DEFAULT_THRESHOLD;
  }

  return Math.max(MIN_THRESHOLD, Math.min(MAX_THRESHOLD, parsed));
};

export const sanitizeClientData = (data: any): Partial<Client> => {
  const sanitized: Partial<Client> = {};

  if (data.name && typeof data.name === 'string') {
    sanitized.name = data.name.trim();
  }

  if (data.email && typeof data.email === 'string') {
    sanitized.email = data.email.trim().toLowerCase();
  }

  if (data.phone && typeof data.phone === 'string') {
    sanitized.phone = data.phone.trim();
  }

  if (data.age && Number.isInteger(data.age)) {
    sanitized.age = data.age;
  }

  // Add other fields as needed
  Object.keys(data).forEach((key) => {
    if (!['name', 'email', 'phone', 'age'].includes(key) && data[key] !== undefined) {
      sanitized[key as keyof Client] = data[key];
    }
  });

  return sanitized;
};
