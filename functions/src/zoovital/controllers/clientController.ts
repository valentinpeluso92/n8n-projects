import { Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { Firestore } from 'firebase-admin/firestore';

import { ClientService } from '../services/clientService';
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
  sanitizeClientData,
  validateGetClientsFilter,
} from '../validators/clientValidators';
import { HTTP_STATUS } from '../../constants';
import { ApiResponse } from '../../types/api';
import { ErrorMessagesEnum } from '../enums/errorMessages';

export class ClientController {
  private clientService: ClientService;
  private API_KEY: string;

  constructor(db: Firestore, API_KEY: string) {
    this.clientService = new ClientService(db);
    this.API_KEY = API_KEY;
  }

  async getClient(req: Request, res: express.Response): Promise<void> {
    const logCompletion = requestLogger(req, 'GET');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['GET', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, this.API_KEY)) return;
      if (!methodMiddleware(req, res, 'GET')) return;

      if (req.query.id) {
        await this.getClientById(req, res);
      } else {
        await this.getClientsByFilters(req, res);
      }
    } catch (error) {
      errorHandler(error, res, 'getClient');
    } finally {
      logCompletion();
    }
  }

  async postClient(req: Request, res: express.Response): Promise<void> {
    const logCompletion = requestLogger(req, 'POST');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['POST', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, this.API_KEY)) return;
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
      const result = await this.clientService.create(req, sanitizedData);

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

  async updateClient(req: Request, res: express.Response): Promise<void> {
    const logCompletion = requestLogger(req, 'PUT');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['PUT', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, this.API_KEY)) return;
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
        const result = await this.clientService.update(req, id, sanitizedData);

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
            error: ErrorMessagesEnum.CLIENT_NOT_FOUND,
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

  async removeClient(req: Request, res: express.Response): Promise<void> {
    const logCompletion = requestLogger(req, 'DELETE');

    try {
      // Apply middleware
      if (!corsMiddleware(req, res, ['DELETE', 'OPTIONS'])) return;
      if (!authMiddleware(req, res, this.API_KEY)) return;
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
        const result = await this.clientService.delete(req, id);

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
            error: ErrorMessagesEnum.CLIENT_NOT_FOUND,
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

  private async getClientById(req: Request, res: express.Response): Promise<void> {
    const id = req.query.id as string;

    const idError = validateId(id);
    if (idError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: idError,
      } as ApiResponse);
      return;
    }

    const client = await this.clientService.getById(req, id);
    if (!client) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ErrorMessagesEnum.CLIENT_NOT_FOUND,
      } as ApiResponse);
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: client,
    });
  }

  private async getClientsByFilters(req: Request, res: express.Response): Promise<void> {
    const validation = validateGetClientsFilter(req.query);
    if (!validation.isValid) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: validation.errors.join(', '),
      } as ApiResponse);
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const name = req.query.name as string;
    const email = req.query.email as string;
    const phone = req.query.phone as string;
    const age = req.query.age as string;
    const address = req.query.address as string;
    const clientIds = req.query.clientIds as string;

    const clients = await this.clientService.getAll(
      req,
      {
        pagination: { limit, offset },
        filter: {
          name,
          email,
          phone,
          age,
          address,
          clientIds,
        },
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: clients,
      count: clients.length,
    });
  }
}
