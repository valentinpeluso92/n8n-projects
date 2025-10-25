import { Timestamp } from 'firebase-admin/firestore';

export interface TimestampFields {
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  deletedAt?: Timestamp | Date | string;
  [key: string]: any;
}

export interface ConvertedTimestampFields {
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  [key: string]: any;
}

export const convertTimestampToISO = (timestamp: any): string | null => {
  if (!timestamp) return null;

  // Si ya es un string (ISO), devolverlo tal como está
  if (typeof timestamp === 'string') {
    return timestamp;
  }

  // Si es un Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  // Si es un Timestamp de Firestore
  if (
    timestamp && typeof timestamp === 'object' &&
    ('_seconds' in timestamp || 'seconds' in timestamp)
  ) {
    // Manejar tanto la estructura interna (_seconds) como la pública (seconds)
    const seconds = timestamp._seconds || timestamp.seconds;
    const nanoseconds = timestamp._nanoseconds || timestamp.nanoseconds || 0;

    if (typeof seconds === 'number') {
      // Convertir a milliseconds y crear Date
      const milliseconds = seconds * 1000 + Math.floor(nanoseconds / 1000000);
      return new Date(milliseconds).toISOString();
    }
  }

  // Si tiene método toDate (Timestamp de Firestore oficial)
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }

  return null;
};

export const convertTimestampToUnix = (timestamp: any): number | null => {
  if (!timestamp) return null;

  // Si ya es un número
  if (typeof timestamp === 'number') {
    return timestamp;
  }

  // Si es un Date object
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  // Si es un Timestamp de Firestore
  if (
    timestamp && typeof timestamp === 'object' &&
    ('_seconds' in timestamp || 'seconds' in timestamp)
  ) {
    const seconds = timestamp._seconds || timestamp.seconds;
    const nanoseconds = timestamp._nanoseconds || timestamp.nanoseconds || 0;

    if (typeof seconds === 'number') {
      return seconds * 1000 + Math.floor(nanoseconds / 1000000);
    }
  }

  // Si tiene método toDate
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().getTime();
  }

  return null;
};

export const convertObjectTimestamps = <T extends TimestampFields>(
  obj: T,
  format: 'iso' | 'unix' = 'iso'
): T & ConvertedTimestampFields => {
  if (!obj || typeof obj !== 'object') return obj;

  const converted: any = { ...obj };
  const converter = format === 'iso' ? convertTimestampToISO : convertTimestampToUnix;

  // Lista de campos que pueden contener timestamps
  const timestampFields = ['createdAt', 'updatedAt', 'deletedAt', 'date'];

  timestampFields.forEach((field) => {
    if (converted[field]) {
      const convertedValue = converter(converted[field]);
      if (convertedValue !== null) {
        converted[field] = convertedValue as any;
      }
    }
  });

  return converted;
};

export const convertArrayTimestamps = <T extends TimestampFields>(
  array: T[],
  format: 'iso' | 'unix' = 'iso'
): (T & ConvertedTimestampFields)[] => {
  return array.map((item) => convertObjectTimestamps(item, format));
};

export const convertNestedTimestamps = (obj: any, format: 'iso' | 'unix' = 'iso'): any => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => convertNestedTimestamps(item, format));
  }

  const converted = { ...obj };
  const converter = format === 'iso' ? convertTimestampToISO : convertTimestampToUnix;

  Object.keys(converted).forEach((key) => {
    const value = converted[key];

    // Si parece un timestamp, convertirlo
    if (
      value && typeof value === 'object' &&
      ('_seconds' in value || 'seconds' in value || typeof value.toDate === 'function')
    ) {
      const convertedValue = converter(value);
      if (convertedValue !== null) {
        converted[key] = convertedValue;
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Si es un objeto anidado, recursión
      converted[key] = convertNestedTimestamps(value, format);
    } else if (Array.isArray(value)) {
      // Si es un array, recursión
      converted[key] = value.map((item) => convertNestedTimestamps(item, format));
    }
  });

  return converted;
};

// Función helper para logging de timestamps
export const logTimestamp = (timestamp: any, label = 'Timestamp'): void => {
  console.log(`${label}:`, {
    original: timestamp,
    iso: convertTimestampToISO(timestamp),
    unix: convertTimestampToUnix(timestamp),
  });
};
