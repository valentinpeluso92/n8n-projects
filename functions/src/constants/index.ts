// Todo - Que el nombre de la coleccion viaje como argumento al controller
export const COLLECTION_NAMES = {
  CLIENTS: 'sbox-zoovital-clients',
  SHIFTS: 'sbox-zoovital-shifts',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ALLOWED_ORIGINS = [
  'https://n8n.srv955597.hstgr.cloud',
] as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado. API Key inválida.',
  METHOD_NOT_ALLOWED: 'Método no permitido',
  CLIENT_NOT_FOUND: 'Cliente no encontrado',
  SHIFT_NOT_FOUND: 'Turno no encontrado',
  CLIENT_DATA_REQUIRED: 'Los datos del cliente son requeridos',
  SHIFT_DATA_REQUIRED: 'Los datos del turno son requeridos',
  CLIENT_ID_REQUIRED: 'ID del cliente es requerido',
  SHIFT_ID_REQUIRED: 'ID del turno es requerido',
  UPDATE_DATA_REQUIRED: 'Los datos para actualizar son requeridos',
  INVALID_DATE: 'Fecha inválida',
  DATE_IN_PAST: 'La fecha no puede ser en el pasado',
  SCHEDULE_CONFLICT: 'Conflicto de horarios',
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
} as const;

export const DEFAULT_THRESHOLD = 80;
export const MAX_THRESHOLD = 100;
export const MIN_THRESHOLD = 0;

export const SHIFT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

export const DEFAULT_SHIFT_DURATION = 60; // 60 minutos
export const MAX_SHIFTS_PER_DAY = 20;
