
// === controllers/shiftController.ts ===

import { Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { Firestore } from 'firebase-admin/firestore';

import { ShiftService } from '../services/shiftService';
import {
  corsMiddleware,
  authMiddleware,
  methodMiddleware,
  requestLogger,
  errorHandler,
} from '../../middleware';
import {
  validateShiftData,
  validateUpdateShiftData,
  validateShiftId,
  sanitizeShiftData,
} from '../validators/shiftValidators';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
} from '../../constants';
import { ShiftWithId } from '../types/api';
import { ApiResponse } from '../../types/api';

export class ShiftController {
  private shiftService: ShiftService;

  constructor(db: Firestore) {
    this.shiftService = new ShiftService(db);
  }

  async getShift(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'GET');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['GET', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'GET')) return;

      const id = req.query.id as string;
      const clientId = req.query.clientId as string;
      const date = req.query.date as string;

      let response: ApiResponse<ShiftWithId | ShiftWithId[]>;

      if (id) {
        // Obtener turno específico por ID
        const idError = validateShiftId(id);
        if (idError) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: idError,
          } as ApiResponse);
          return;
        }

        const shift = await this.shiftService.getById(id);
        if (!shift) {
          res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: ERROR_MESSAGES.SHIFT_NOT_FOUND,
          } as ApiResponse);
          return;
        }

        response = {
          success: true,
          data: shift,
        };
      } else if (clientId) {
        // Obtener turnos por cliente
        const shifts = await this.shiftService.getByClientId(clientId, {
          pagination: {
            limit: parseInt(req.query.limit as string) || 50,
          },
        });

        response = {
          success: true,
          data: shifts,
          count: shifts.length,
        };
      } else if (date) {
        // Obtener turnos por fecha
        const searchDate = new Date(date);
        if (isNaN(searchDate.getTime())) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: ERROR_MESSAGES.INVALID_DATE,
          } as ApiResponse);
          return;
        }

        const shifts = await this.shiftService.getByDate(searchDate, {
          pagination: {
            limit: parseInt(req.query.limit as string) || 50,
          },
        });

        response = {
          success: true,
          data: shifts,
          count: shifts.length,
        };
      } else {
        // Obtener todos los turnos con paginación
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        const shifts = await this.shiftService.getAll({
          pagination: { limit, offset },
        });

        response = {
          success: true,
          data: shifts,
          count: shifts.length,
        };
      }

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      errorHandler(error, res, 'getShift');
    } finally {
      logCompletion();
    }
  }

  async postShift(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'POST');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['POST', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'POST')) return;

      // Validar datos de entrada
      const validation = validateShiftData(req.body);
      if (!validation.isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: validation.errors.join(', '),
        } as ApiResponse);
        return;
      }

      // Sanitizar datos
      const sanitizedData = sanitizeShiftData(req.body);

      try {
        // Crear turno
        const result = await this.shiftService.create(sanitizedData);

        const response: ApiResponse = {
          success: true,
          message: 'Turno creado exitosamente',
          data: result.data,
        };

        res.status(HTTP_STATUS.CREATED).json(response);
      } catch (serviceError) {
        if (serviceError instanceof Error && serviceError.message === 'Cliente no encontrado') {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: ERROR_MESSAGES.CLIENT_NOT_FOUND,
          } as ApiResponse);
          return;
        }
        throw serviceError;
      }
    } catch (error) {
      errorHandler(error, res, 'postShift');
    } finally {
      logCompletion();
    }
  }

  async updateShift(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'PUT');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['PUT', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'PUT')) return;

      // Validar ID
      const id = req.query.id as string;
      const idError = validateShiftId(id);
      if (idError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: idError,
        } as ApiResponse);
        return;
      }

      // Validar datos de actualización
      const validation = validateUpdateShiftData(req.body);
      if (!validation.isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: validation.errors.join(', '),
        } as ApiResponse);
        return;
      }

      // Sanitizar datos
      const sanitizedData = sanitizeShiftData(req.body);

      try {
        const result = await this.shiftService.update(id, sanitizedData);

        const response: ApiResponse = {
          success: true,
          message: 'Turno actualizado exitosamente',
          data: result.data,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } catch (serviceError) {
        if (serviceError instanceof Error) {
          if (serviceError.message === 'Turno no encontrado') {
            res.status(HTTP_STATUS.NOT_FOUND).json({
              success: false,
              error: ERROR_MESSAGES.SHIFT_NOT_FOUND,
            } as ApiResponse);
            return;
          }
          if (serviceError.message === 'Cliente no encontrado') {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: ERROR_MESSAGES.CLIENT_NOT_FOUND,
            } as ApiResponse);
            return;
          }
        }
        throw serviceError;
      }
    } catch (error) {
      errorHandler(error, res, 'updateShift');
    } finally {
      logCompletion();
    }
  }

  async removeShift(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'DELETE');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['DELETE', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'DELETE')) return;

      // Validar ID
      const id = req.query.id as string;
      const idError = validateShiftId(id);
      if (idError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: idError,
        } as ApiResponse);
        return;
      }

      const soft = req.query.soft === 'true'; // Parámetro para soft delete

      try {
        let result;
        if (soft) {
          result = await this.shiftService.softDelete(id);
        } else {
          result = await this.shiftService.delete(id);
        }

        const response: ApiResponse = {
          success: true,
          message: soft ? 'Turno cancelado exitosamente' : 'Turno eliminado exitosamente',
          data: result,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } catch (serviceError) {
        if (serviceError instanceof Error && serviceError.message === 'Turno no encontrado') {
          res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: ERROR_MESSAGES.SHIFT_NOT_FOUND,
          } as ApiResponse);
          return;
        }
        throw serviceError;
      }
    } catch (error) {
      errorHandler(error, res, 'removeShift');
    } finally {
      logCompletion();
    }
  }

  async checkConflicts(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'GET');

    try {
      if (!corsMiddleware(req, res, ['GET', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'GET')) return;

      const date = req.query.date as string;
      const duration = parseInt(req.query.duration as string) || 60;
      const excludeId = req.query.excludeId as string;

      if (!date) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Fecha es requerida para verificar conflictos',
        } as ApiResponse);
        return;
      }

      const searchDate = new Date(date);
      if (isNaN(searchDate.getTime())) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.INVALID_DATE,
        } as ApiResponse);
        return;
      }

      const conflicts = await this.shiftService.checkScheduleConflicts(searchDate, duration, excludeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: conflicts,
        count: conflicts.length,
        hasConflicts: conflicts.length > 0,
      });
    } catch (error) {
      errorHandler(error, res, 'checkConflicts');
    } finally {
      logCompletion();
    }
  }
}
