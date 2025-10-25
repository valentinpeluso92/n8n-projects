
// === services/shiftService.ts ===

import { Firestore, FieldValue, Query } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { ShiftFilterOptions, ShiftWithId } from '../types/api';
import { convertObjectTimestamps, convertArrayTimestamps } from '../../utilities/timestamp';
import { Shift } from '../model/shift';
import { ShiftStatusEnum } from '../enums/shiftStatus';
import { ShiftPriorityEnum } from '../enums/shiftPriority';

export class ShiftService {
  private COLLECTION_NAME: string;

  constructor(private db: Firestore, COLLECTION_NAME: string) {
    this.COLLECTION_NAME = COLLECTION_NAME;
  }

  async getById(id: string): Promise<ShiftWithId | null> {
    try {
      const doc = await this.db.collection(this.COLLECTION_NAME).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const rawData = {
        id: doc.id,
        ...doc.data(),
      } as ShiftWithId;

      return convertObjectTimestamps(rawData);
    } catch (error) {
      logger.error('Error getting shift by ID', { id, error });
      throw error;
    }
  }

  async getAll(options: ShiftFilterOptions = { filter: {} }): Promise<ShiftWithId[]> {
    try {
      let query: Query = this.db.collection(this.COLLECTION_NAME);
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
      const shifts: ShiftWithId[] = [];

      snapshot.forEach((doc) => {
        shifts.push({
          id: doc.id,
          ...doc.data(),
        } as ShiftWithId);
      });

      logger.info('Shifts retrieved', {
        filter,
        count: shifts.length,
      });

      return convertArrayTimestamps(shifts);
    } catch (error) {
      logger.error('Error getting all shifts', { options, error });
      throw error;
    }
  }

  async create(shiftData: Partial<Shift>): Promise<{ id: string; data: ShiftWithId }> {
    try {
      // Verificar que el cliente existe
      const clientDoc = await this.db.collection(this.COLLECTION_NAME).doc(shiftData.clientId as string).get();
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

      const docRef = await this.db.collection(this.COLLECTION_NAME).add(newShift);

      logger.info('Shift created successfully', {
        id: docRef.id,
        clientId: shiftData.clientId,
        date: shiftData.date,
      });

      const responseData = convertObjectTimestamps({
        id: docRef.id,
        ...shiftData,
        status: newShift.status,
        duration: newShift.duration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ShiftWithId);

      return {
        id: docRef.id,
        data: responseData,
      };
    } catch (error) {
      logger.error('Error creating shift', { shiftData, error });
      throw error;
    }
  }

  async update(id: string, updateData: Partial<Shift>): Promise<{ id: string; data: Partial<ShiftWithId> }> {
    try {
      const docRef = this.db.collection(this.COLLECTION_NAME).doc(id);

      // Verificar que el turno existe
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Turno no encontrado');
      }

      // Si se actualiza clientId, verificar que el cliente existe
      if (updateData.clientId) {
        const clientDoc = await this.db.collection(this.COLLECTION_NAME).doc(updateData.clientId).get();
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

      const responseData = convertObjectTimestamps({
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
      } as Partial<ShiftWithId>);

      return {
        id,
        data: responseData,
      };
    } catch (error) {
      logger.error('Error updating shift', { id, updateData, error });
      throw error;
    }
  }

  async delete(id: string): Promise<{ id: string }> {
    try {
      const docRef = this.db.collection(this.COLLECTION_NAME).doc(id);

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

  async softDelete(id: string): Promise<{ id: string }> {
    try {
      const docRef = this.db.collection(this.COLLECTION_NAME).doc(id);

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

  async checkScheduleConflicts(date: Date, duration = 60, excludeShiftId?: string): Promise<ShiftWithId[]> {
    try {
      const startTime = new Date(date);
      const endTime = new Date(date.getTime() + (duration * 60000)); // duration en minutos

      const query: Query = this.db.collection(this.COLLECTION_NAME)
        .where('date', '>=', startTime)
        .where('date', '<', endTime)
        .where('status', '==', ShiftStatusEnum.SCHEDULED);

      const snapshot = await query.get();
      const conflicts: ShiftWithId[] = [];

      snapshot.forEach((doc) => {
        if (!excludeShiftId || doc.id !== excludeShiftId) {
          conflicts.push({
            id: doc.id,
            ...doc.data(),
          } as ShiftWithId);
        }
      });

      return convertArrayTimestamps(conflicts);
    } catch (error) {
      logger.error('Error checking schedule conflicts', { date, duration, error });
      throw error;
    }
  }
}
