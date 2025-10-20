import { DEFAULT_THRESHOLD, MAX_THRESHOLD, MIN_THRESHOLD } from '../constants';

export const isValidName = (name: any, required = false): boolean => {
  return required
    ? name && typeof name === 'string' && name.trim().length > 0
    : !name || (typeof name === 'string' && name.trim().length > 0);
};

export const isValidEmail = (email: any, required = false): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return required
    ? email && typeof email === 'string' && emailRegex.test(email)
    : !email || (typeof email === 'string' && emailRegex.test(email));
};

export const isValidPhone = (phone: any, required = false): boolean => {
  return required
    ? phone && typeof phone === 'string' && phone.trim().length > 0
    : !phone || (typeof phone === 'string' && phone.trim().length > 0);
};

export const isValidAge = (age: any, required = false): boolean => {
  return required
    ? Number.isInteger(age) && age >= 0 && age <= 150
    : age === undefined || (Number.isInteger(age) && age >= 0 && age <= 150);
};

export const isValidAddress = (address: any, required = false): boolean => {
  return required
    ? address && typeof address === 'string' && address.trim().length > 0
    : !address || (typeof address === 'string' && address.trim().length > 0);
};

export const isValidBody = (body: any): boolean => {
  return !!body && typeof body === 'object' && Object.keys(body).length > 0;
};

export const isValidId = (id: any): boolean => {
  return !!id && typeof id === 'string' && id.trim().length > 0;
};

export const getThreshold = (threshold: any): number => {
  if (threshold === undefined || threshold === null) {
    return DEFAULT_THRESHOLD;
  }

  const parsed = parseInt(String(threshold));
  if (isNaN(parsed)) {
    return DEFAULT_THRESHOLD;
  }

  return Math.max(MIN_THRESHOLD, Math.min(MAX_THRESHOLD, parsed));
};
