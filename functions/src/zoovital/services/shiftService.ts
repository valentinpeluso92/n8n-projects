
// === services/shiftService.ts ===

import { Firestore, FieldValue, Query } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { ShiftWithId } from '../types/api';
import { convertObjectTimestamps, convertArrayTimestamps } from '../../utilities/timestamp';
import { COLLECTION_NAMES, SHIFT_STATUS } from '../../constants';
import { FilterOptions } from '../../types/api';
import { Shift } from '../model/shift';

export class ShiftService {
  constructor(private db: Firestore) {}

  async getById(id: string): Promise<ShiftWithId | null> {
    try {
      const doc = await this.db.collection(COLLECTION_NAMES.SHIFTS).doc(id).get();

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

  async getAll(options: FilterOptions = {}): Promise<ShiftWithId[]> {
    try {
      let query: Query = this.db.collection(COLLECTION_NAMES.SHIFTS);

      // Ordenar por fecha por defecto
      query = query.orderBy('date', 'desc');

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

      return convertArrayTimestamps(shifts);
    } catch (error) {
      logger.error('Error getting all shifts', { options, error });
      throw error;
    }
  }

  async getByClientId(clientId: string, options: FilterOptions = {}): Promise<ShiftWithId[]> {
    try {
      let query: Query = this.db.collection(COLLECTION_NAMES.SHIFTS)
        .where('clientId', '==', clientId)
        .orderBy('date', 'desc');

      if (options.pagination?.limit) {
        query = query.limit(options.pagination.limit);
      }

      const snapshot = await query.get();
      const shifts: ShiftWithId[] = [];

      snapshot.forEach((doc) => {
        shifts.push({
          id: doc.id,
          ...doc.data(),
        } as ShiftWithId);
      });

      logger.info('Shifts retrieved for client', {
        clientId,
        count: shifts.length,
      });

      return convertArrayTimestamps(shifts);
    } catch (error) {
      logger.error('Error getting shifts by client ID', { clientId, error });
      throw error;
    }
  }

  async getByDate(date: Date, options: FilterOptions = {}): Promise<ShiftWithId[]> {
    try {
      // Crear rango del día
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      let query: Query = this.db.collection(COLLECTION_NAMES.SHIFTS)
        .where('date', '>=', startOfDay)
        .where('date', '<=', endOfDay)
        .orderBy('date', 'asc');

      if (options.pagination?.limit) {
        query = query.limit(options.pagination.limit);
      }

      const snapshot = await query.get();
      const shifts: ShiftWithId[] = [];

      snapshot.forEach((doc) => {
        shifts.push({
          id: doc.id,
          ...doc.data(),
        } as ShiftWithId);
      });

      logger.info('Shifts retrieved for date', {
        date: date.toISOString().split('T')[0],
        count: shifts.length,
      });

      return convertArrayTimestamps(shifts);
    } catch (error) {
      logger.error('Error getting shifts by date', { date, error });
      throw error;
    }
  }

  async create(shiftData: Partial<Shift>): Promise<{ id: string; data: ShiftWithId }> {
    try {
      // Verificar que el cliente existe
      const clientDoc = await this.db.collection(COLLECTION_NAMES.CLIENTS).doc(shiftData.clientId as string).get();
      if (!clientDoc.exists) {
        throw new Error('Cliente no encontrado');
      }

      const newShift = {
        ...shiftData,
        date: new Date(shiftData.date as string),
        status: shiftData.status || SHIFT_STATUS.SCHEDULED,
        duration: shiftData.duration || 30,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await this.db.collection(COLLECTION_NAMES.SHIFTS).add(newShift);

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
      const docRef = this.db.collection(COLLECTION_NAMES.SHIFTS).doc(id);

      // Verificar que el turno existe
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Turno no encontrado');
      }

      // Si se actualiza clientId, verificar que el cliente existe
      if (updateData.clientId) {
        const clientDoc = await this.db.collection(COLLECTION_NAMES.CLIENTS).doc(updateData.clientId).get();
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
      const docRef = this.db.collection(COLLECTION_NAMES.SHIFTS).doc(id);

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
      const docRef = this.db.collection(COLLECTION_NAMES.SHIFTS).doc(id);

      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Turno no encontrado');
      }

      await docRef.update({
        status: SHIFT_STATUS.CANCELLED,
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

      const query: Query = this.db.collection(COLLECTION_NAMES.SHIFTS)
        .where('date', '>=', startTime)
        .where('date', '<', endTime)
        .where('status', '==', SHIFT_STATUS.SCHEDULED);

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
