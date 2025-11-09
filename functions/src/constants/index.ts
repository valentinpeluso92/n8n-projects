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

export const DEFAULT_THRESHOLD = 80;
export const MAX_THRESHOLD = 100;
export const MIN_THRESHOLD = 0;

export const DEFAULT_SHIFT_DURATION = 60; // 60 minutos
export const MAX_SHIFTS_PER_DAY = 20;
