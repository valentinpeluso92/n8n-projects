import {Request} from 'firebase-functions/v2/https';
import * as express from 'express';
import {Firestore} from 'firebase-admin/firestore';

import {ClientService} from '../services/clientService';
import {
  corsMiddleware,
  authMiddleware,
  methodMiddleware,
  requestLogger,
  errorHandler,
} from '../../middleware';
import {
  validateClientData,
  validateUpdateData,
  validateId,
  validateThreshold,
  sanitizeClientData,
} from '../validators';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
} from '../../constants';
import {ApiResponse} from '../../types/api';
import {ClientWithId} from '../types/api';

export class ClientController {
  private clientService: ClientService;

  constructor(db: Firestore) {
    this.clientService = new ClientService(db);
  }

  async getClient(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'GET');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['GET', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'GET')) return;

      const id = req.query.id as string;
      const name = req.query.name as string;
      const threshold = validateThreshold(req.query.threshold);

      let response: ApiResponse<ClientWithId | ClientWithId[]>;

      if (id) {
        // Get specific client
        const idError = validateId(id);
        if (idError) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: idError,
          } as ApiResponse);
          return;
        }

        const client = await this.clientService.getById(id);
        if (!client) {
          res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: ERROR_MESSAGES.CLIENT_NOT_FOUND,
          } as ApiResponse);
          return;
        }

        response = {
          success: true,
          data: client,
        };
      } else {
        // Get all clients or filtered by name
        const options = name ? {name, threshold} : {};
        const clients = await this.clientService.getAll(options);

        response = {
          success: true,
          data: clients,
          count: clients.length,
        };

        if (name) {
          response.searchCriteria = {name, threshold};
        }
      }

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      errorHandler(error, res, 'getClient');
    } finally {
      logCompletion();
    }
  }

  async postClient(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'POST');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['POST', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'POST')) return;

      // Validate input data
      const validation = validateClientData(req.body);
      if (!validation.isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: validation.errors.join(', '),
        } as ApiResponse);
        return;
      }

      // Sanitize data
      const sanitizedData = sanitizeClientData(req.body);

      // Create client
      const result = await this.clientService.create(sanitizedData);

      const response: ApiResponse = {
        success: true,
        message: 'Cliente creado exitosamente',
        data: result,
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      errorHandler(error, res, 'postClient');
    } finally {
      logCompletion();
    }
  }

  async updateClient(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'PUT');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['PUT', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'PUT')) return;

      // Validate ID
      const id = req.query.id as string;
      const idError = validateId(id);
      if (idError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: idError,
        } as ApiResponse);
        return;
      }

      // Validate update data
      const validation = validateUpdateData(req.body);
      if (!validation.isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: validation.errors.join(', '),
        } as ApiResponse);
        return;
      }

      // Sanitize data
      const sanitizedData = sanitizeClientData(req.body);

      try {
        const result = await this.clientService.update(id, sanitizedData);

        const response: ApiResponse = {
          success: true,
          message: 'Cliente actualizado exitosamente',
          data: result,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } catch (serviceError) {
        if (serviceError instanceof Error && serviceError.message === 'Client not found') {
          res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: ERROR_MESSAGES.CLIENT_NOT_FOUND,
          } as ApiResponse);
          return;
        }
        throw serviceError;
      }
    } catch (error) {
      errorHandler(error, res, 'updateClient');
    } finally {
      logCompletion();
    }
  }

  async removeClient(req: Request, res: express.Response, API_KEY: string): Promise<void> {
    const logCompletion = requestLogger(req, 'DELETE');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['DELETE', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, API_KEY)) return;
      if (!methodMiddleware(req, res, 'DELETE')) return;

      // Validate ID
      const id = req.query.id as string;
      const idError = validateId(id);
      if (idError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: idError,
        } as ApiResponse);
        return;
      }

      try {
        const result = await this.clientService.delete(id);

        const response: ApiResponse = {
          success: true,
          message: 'Cliente eliminado exitosamente',
          data: result,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } catch (serviceError) {
        if (serviceError instanceof Error && serviceError.message === 'Client not found') {
          res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: ERROR_MESSAGES.CLIENT_NOT_FOUND,
          } as ApiResponse);
          return;
        }
        throw serviceError;
      }
    } catch (error) {
      errorHandler(error, res, 'removeClient');
    } finally {
      logCompletion();
    }
  }
}
