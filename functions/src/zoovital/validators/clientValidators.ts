
// === validators/index.ts ===

import { Client } from '../model/client';
import { ValidationResult } from '../../types/api';

export const validateGetClientsFilter = (filter: any): ValidationResult => {
  const errors: string[] = [];

  // Required fields validation
  if (!isValidName(filter.name)) {
    errors.push('El nombre del cliente es requerido');
  }

  if (!isValidEmail(filter.email)) {
    errors.push('El formato del email no es válido');
  }

  if (!isValidPhone(filter.phone)) {
    errors.push('El teléfono del cliente es requerido y debe ser una cadena de texto');
  }

  if (!isValidAge(filter.age)) {
    errors.push('La edad debe ser un número entero entre 0 y 150');
  }

  if (!isValidAddress(filter.address)) {
    errors.push('La dirección debe ser una cadena de texto');
  }

  if (!isValidListOfIds(filter.clientIds)) {
    errors.push('La lista de IDs de clientes no es válida');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateClientData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!isValidBody(data)) {
    errors.push('Los datos del cliente deben ser un objeto válido');
    return { isValid: false, errors };
  }

  // Required fields validation
  if (!isValidName(data.name, true)) {
    errors.push('El nombre del cliente es requerido');
  }

  if (!isValidEmail(data.email)) {
    errors.push('El formato del email no es válido');
  }

  if (!isValidPhone(data.phone, true)) {
    errors.push('El teléfono del cliente es requerido y debe ser una cadena de texto');
  }

  if (!isValidAge(data.age)) {
    errors.push('La edad debe ser un número entero entre 0 y 150');
  }

  if (!isValidAddress(data.address)) {
    errors.push('La dirección debe ser una cadena de texto');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!isValidBody(data)) {
    errors.push('Los datos para actualizar son requeridos');
    return { isValid: false, errors };
  }

  // Validate only provided fields
  if (!isValidName(data.name)) {
    errors.push('El nombre debe ser una cadena de texto no vacía');
  }

  if (!isValidEmail(data.email)) {
    errors.push('El formato del email no es válido');
  }

  if (!isValidPhone(data.phone)) {
    errors.push('El teléfono debe ser una cadena de texto de 10 dígitos');
  }

  if (!isValidAge(data.age)) {
    errors.push('La edad debe ser un número entero entre 0 y 150');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateId = (id: any): string | null => {
  if (!isValidId(id)) {
    return 'ID del cliente es requerido y debe ser válido';
  }
  return null;
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

  if (data.address && typeof data.address === 'string') {
    sanitized.address = data.address.trim();
  }

  // Add other fields as needed
  Object.keys(data).forEach((key) => {
    if (!['name', 'email', 'phone', 'age', 'address'].includes(key) && data[key] !== undefined) {
      sanitized[key as keyof Client] = data[key];
    }
  });

  return sanitized;
};

export const isValidName = (name: any, required = false): boolean => {
  return required ?
    name && typeof name === 'string' && name.trim().length > 0 :
    !name || (typeof name === 'string' && name.trim().length > 0);
};

export const isValidEmail = (email: any, required = false): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return required ?
    email && typeof email === 'string' && emailRegex.test(email) :
    !email || (typeof email === 'string' && emailRegex.test(email));
};

export const isValidPhone = (phone: any, required = false): boolean => {
  return required ?
    phone && typeof phone === 'string' && phone.trim().length === 10 :
    !phone || (typeof phone === 'string' && phone.trim().length === 10);
};

export const isValidAge = (age: any, required = false): boolean => {
  return required ?
    Number.isInteger(age) && age >= 0 && age <= 150 :
    age === undefined || (Number.isInteger(age) && age >= 0 && age <= 150);
};

export const isValidAddress = (address: any, required = false): boolean => {
  return required ?
    address && typeof address === 'string' && address.trim().length > 0 :
    !address || (typeof address === 'string' && address.trim().length > 0);
};

export const isValidListOfIds = (ids: any, required = false): boolean => {
  const validListOfIdsFn = (idsStr: string): boolean => idsStr.split(',').every((id: string) => isValidId(id.trim()));

  return required ?
    typeof ids === 'string' && validListOfIdsFn(ids) :
    !ids || (typeof ids === 'string' && validListOfIdsFn(ids));
};

export const isValidBody = (body: any): boolean => {
  return !!body && typeof body === 'object' && Object.keys(body).length > 0;
};

export const isValidId = (id: any): boolean => {
  return !!id && typeof id === 'string' && id.trim().length > 0;
};

