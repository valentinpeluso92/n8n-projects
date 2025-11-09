import { Request } from 'firebase-functions/v2/https';
import { Firestore, FieldValue, Query } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { ShiftFilterOptions, ShiftResponse } from '../types/api';
import { Shift } from '../model/shift';
import { ShiftStatusEnum } from '../enums/shiftStatus';
import { ShiftPriorityEnum } from '../enums/shiftPriority';
import { mapShiftsToResponse, mapShiftToResponse } from '../helpers/shiftResponse';
import { getCollectionName } from '../../utilities/collections';
import { ClientService } from './clientService';

const CLIENT_ID = 'zoovital';
const COLLECTION_ID = 'shifts';

export class ShiftService {
  private clientService: ClientService;

  constructor(private db: Firestore) {
    this.clientService = new ClientService(db);
  }

  async getById(req: Request, id: string): Promise<ShiftResponse | null> {
    try {
      const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);
      const doc = await this.db.collection(COLLECTION_NAME).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const rawData = {
        id: doc.id,
        ...doc.data() as Partial<ShiftResponse>,
      } as ShiftResponse;

      rawData.client = await this.clientService.getById(req, rawData.clientId as string);
      return mapShiftToResponse(rawData);
    } catch (error) {
      logger.error('Error getting shift by ID', { id, error });
      throw error;
    }
  }

  async getAll(req: Request, options: ShiftFilterOptions = { filter: {} }): Promise<ShiftResponse[]> {
    try {
      const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);
      let query: Query = this.db.collection(COLLECTION_NAME);
      const { filter } = options;

      // Aplicar filtros si están presentes
      if (filter.clientId) {
        query = query.where('clientId', '==', filter.clientId);
      }

      if (filter.date) {
        const date = new Date(filter.date);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.where('date', '>=', startOfDay).where('date', '<=', endOfDay);
      }

      if (filter.dateFrom && filter.dateTo) {
        const dateFrom = new Date(filter.dateFrom);
        const dateTo = new Date(filter.dateTo);
        query = query.where('date', '>=', dateFrom).where('date', '<=', dateTo);
      }

      if (filter.type) {
        query = query.where('type', '==', filter.type);
      }

      if (filter.priority) {
        query = query.where('priority', '==', filter.priority);
      }

      // Aplicar filtros si están presentes
      if (options.pagination?.limit) {
        query = query.limit(options.pagination.limit);
      }

      if (options.pagination?.offset) {
        query = query.offset(options.pagination.offset);
      }

      const snapshot = await query.get();
      let shifts: ShiftResponse[] = [];

      snapshot.forEach((doc) => {
        shifts.push({
          id: doc.id,
          ...doc.data() as Partial<ShiftResponse>,
        } as ShiftResponse);
      });

      logger.info('Shifts retrieved', {
        filter,
        count: shifts.length,
      });

      const clientIds = Array.from(new Set(shifts.map((shift: ShiftResponse) => shift.clientId)));
      const clients = await this.clientService.getAll(req, { filter: { clientIds: clientIds.join(',') } });

      shifts = shifts.map((shift: ShiftResponse) => {
        const client = clients.find((c) => c.id === shift.clientId) || null;
        return {
          ...shift,
          client,
        };
      });

      return mapShiftsToResponse(shifts);
    } catch (error) {
      logger.error('Error getting all shifts', { options, error });
      throw error;
    }
  }

  async create(req: Request, shiftData: Partial<Shift>): Promise<{ id: string; data: ShiftResponse }> {
    try {
      const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);
      // Verificar que el cliente existe
      const clientDoc = await this.db.collection(COLLECTION_NAME).doc(shiftData.clientId as string).get();
      if (!clientDoc.exists) {
        throw new Error('Cliente no encontrado');
      }

      const newShift = {
        ...shiftData,
        date: new Date(shiftData.date as string),
        status: shiftData.status || ShiftStatusEnum.SCHEDULED,
        duration: shiftData.duration || 30,
        priority: shiftData.priority || ShiftPriorityEnum.MEDIUM,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await this.db.collection(COLLECTION_NAME).add(newShift);

      logger.info('Shift created successfully', {
        id: docRef.id,
        clientId: shiftData.clientId,
        date: shiftData.date,
      });

      const responseData = {
        id: docRef.id,
        ...shiftData as Partial<ShiftResponse>,
        status: newShift.status,
        duration: newShift.duration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ShiftResponse;

      responseData.client = await this.clientService.getById(req, responseData.clientId as string);
      return {
        id: docRef.id,
        data: mapShiftToResponse(responseData),
      };
    } catch (error) {
      logger.error('Error creating shift', { shiftData, error });
      throw error;
    }
  }

  async update(
    req: Request,
    id: string,
    updateData: Partial<Shift>
  ): Promise<{ id: string; data: Partial<ShiftResponse> }> {
    try {
      const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);
      const docRef = this.db.collection(COLLECTION_NAME).doc(id);

      // Verificar que el turno existe
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Turno no encontrado');
      }

      // Si se actualiza clientId, verificar que el cliente existe
      if (updateData.clientId) {
        const clientDoc = await this.db.collection(COLLECTION_NAME).doc(updateData.clientId).get();
        if (!clientDoc.exists) {
          throw new Error('Cliente no encontrado');
        }
      }

      const updatedData = {
        ...updateData,
        ...(updateData.date && { date: new Date(updateData.date) }),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await docRef.update(updatedData);

      logger.info('Shift updated successfully', { id });

      const responseData = {
        id,
        ...updateData as Partial<ShiftResponse>,
        updatedAt: new Date().toISOString(),
      } as ShiftResponse;

      responseData.client = await this.clientService.getById(req, responseData.clientId as string);
      return {
        id,
        data: mapShiftToResponse(responseData),
      };
    } catch (error) {
      logger.error('Error updating shift', { id, updateData, error });
      throw error;
    }
  }

  async delete(req: Request, id: string): Promise<{ id: string }> {
    try {
      const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);
      const docRef = this.db.collection(COLLECTION_NAME).doc(id);

      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Turno no encontrado');
      }

      await docRef.delete();

      logger.info('Shift deleted successfully', { id });

      return { id };
    } catch (error) {
      logger.error('Error deleting shift', { id, error });
      throw error;
    }
  }

  async softDelete(req: Request, id: string): Promise<{ id: string }> {
    try {
      const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);
      const docRef = this.db.collection(COLLECTION_NAME).doc(id);

      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Turno no encontrado');
      }

      await docRef.update({
        status: ShiftStatusEnum.CANCELLED,
        deletedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      logger.info('Shift soft deleted successfully', { id });

      return { id };
    } catch (error) {
      logger.error('Error soft deleting shift', { id, error });
      throw error;
    }
  }
}
