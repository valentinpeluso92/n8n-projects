
// === middleware/index.ts ===

import { Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import * as logger from 'firebase-functions/logger';
import { ALLOWED_ORIGINS, ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { ApiResponse, HttpMethod } from '../types/api';

export class MiddlewareError extends Error {
  constructor(
    message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = 'MiddlewareError';
  }
}

export const corsMiddleware = (
  req: Request,
  res: express.Response,
  allowedMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
): boolean => {
  const referer = req.get('Referer') || '';
  const origin = req.get('Origin') || referer || '';
  const requestOrigin = origin || (referer ? new URL(referer).origin : '');

  // Validate origin for production
  const isValidOrigin = !requestOrigin ||
    ALLOWED_ORIGINS.some((allowed) => requestOrigin.startsWith(allowed)) ||
    requestOrigin.includes('localhost'); // Allow localhost for development

  if (!isValidOrigin) {
    logger.warn('Unauthorized origin attempt', { origin: requestOrigin });
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: 'Origen no autorizado',
    } as ApiResponse);
    return false;
  }

  // Set CORS headers
  res.set('Access-Control-Allow-Origin', requestOrigin || ALLOWED_ORIGINS[0]);
  res.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');

  return true;
};

export const authMiddleware = (
  req: Request,
  res: express.Response,
  API_KEY: string
): boolean => {
  const providedKey = req.get('X-API-Key') || req.get('x-api-key');

  if (!providedKey) {
    logger.warn('Missing API key in request');
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
      details: 'X-API-Key header is required',
    } as ApiResponse);
    return false;
  }

  if (providedKey !== API_KEY) {
    logger.warn('Invalid API key attempt', {
      keyPreview: providedKey.substring(0, 8) + '...',
    });
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
    } as ApiResponse);
    return false;
  }

  return true;
};

export const methodMiddleware = (
  req: Request,
  res: express.Response,
  allowedMethod: HttpMethod
): boolean => {
  if (req.method === 'OPTIONS') {
    res.status(HTTP_STATUS.NO_CONTENT).send('');
    return false; // Stop processing but not an error
  }

  if (req.method !== allowedMethod) {
    logger.warn('Method not allowed', {
      method: req.method,
      allowed: allowedMethod,
    });
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      error: `${ERROR_MESSAGES.METHOD_NOT_ALLOWED}. Usa ${allowedMethod}.`,
    } as ApiResponse);
    return false;
  }

  return true;
};

export const requestLogger = (
  req: Request,
  method: HttpMethod,
  startTime: number = Date.now()
) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  return () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      duration: `${duration}ms`,
    });
  };
};

export const errorHandler = (
  error: unknown,
  res: express.Response,
  context = 'Unknown'
): void => {
  logger.error(`Error in ${context}`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  });

  if (error instanceof MiddlewareError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    } as ApiResponse);
    return;
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    details: error instanceof Error ? error.message : String(error),
  } as ApiResponse);
};
