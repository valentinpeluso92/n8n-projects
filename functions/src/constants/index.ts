
// === constants/index.ts ===

export const COLLECTION_NAMES = {
  SBOX_ZOOVITAL_CLIENTS: 'sbox-zoovital-clients',
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
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ALLOWED_ORIGINS = [
  'https://n8n.srv955597.hstgr.cloud',
] as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado. API Key inválida.',
  METHOD_NOT_ALLOWED: 'Método no permitido',
  CLIENT_NOT_FOUND: 'Cliente no encontrado',
  CLIENT_DATA_REQUIRED: 'Los datos del cliente son requeridos',
  CLIENT_ID_REQUIRED: 'ID del cliente es requerido',
  UPDATE_DATA_REQUIRED: 'Los datos para actualizar son requeridos',
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
} as const;

export const DEFAULT_THRESHOLD = 80;
export const MAX_THRESHOLD = 100;
export const MIN_THRESHOLD = 0;
