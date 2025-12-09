import { Request } from 'firebase-functions/v2/https';
import { Firestore, FieldValue, Query } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { ShiftCreateResponse, ShiftFilterOptions, ShiftGetByIdResponse, ShiftResponse } from '../types/api';
import { Shift, ShiftType } from '../model/shift';
import { ShiftStatusEnum } from '../enums/shiftStatus';
import { ShiftPriorityEnum } from '../enums/shiftPriority';
import { mapShiftsToResponse, mapShiftToResponse } from '../helpers/shiftResponse';
import { getCollectionName } from '../../utilities/collections';
import { ClientService } from './clientService';
import { getSlotForDateTime, validateScheduleTime } from '../validators/scheduleValidators';
import { ShiftTypeEnum } from '../enums/shitType';
import { HTTP_STATUS } from '../../constants';
import { sanitizeShiftData, validatePostShiftData, validateShiftId } from '../validators/shiftValidators';

const CLIENT_ID = 'zoovital';
const COLLECTION_ID = 'shifts';

export class ShiftService {
  private clientService: ClientService;

  constructor(private db: Firestore) {
    this.clientService = new ClientService(db);
  }

  async getById(req: Request): Promise<ShiftGetByIdResponse> {
    const id = req.query.id as string;

    const idError = validateShiftId(id);
    if (idError) {
      return {
        success: false,
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        message: 'ID inválido',
        errors: [idError],
      };
    }

    const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);
    const doc = await this.db.collection(COLLECTION_NAME).doc(id).get();

    if (!doc.exists) {
      return {
        success: false,
        httpStatus: HTTP_STATUS.NOT_FOUND,
        message: 'Turno no encontrado',
        errors: ['El turno con el ID especificado no existe'],
      };
    }

    const rawData = {
      id: doc.id,
      ...doc.data() as Partial<ShiftResponse>,
    } as ShiftResponse;

    rawData.client = await this.clientService.getById(req, rawData.clientId as string);

    return {
      success: true,
      httpStatus: HTTP_STATUS.OK,
      data: mapShiftToResponse(rawData),
    };
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

  async create(req: Request): Promise<ShiftCreateResponse> {
    const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);

    // Validar datos de entrada
    const validation = validatePostShiftData(req.body);
    if (!validation.isValid) {
      return {
        success: false,
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        message: 'Datos inválidos',
        errors: validation.errors,
      };
    }

    // Sanitizar datos
    const shiftData: Partial<Shift> = sanitizeShiftData(req.body);

    // Verificar que el cliente existe
    const clientDoc = await this.db.collection(COLLECTION_NAME).doc(shiftData.clientId as string).get();
    if (!clientDoc.exists) {
      return {
        success: false,
        httpStatus: HTTP_STATUS.NOT_FOUND,
        message: 'Cliente no encontrado',
        errors: ['El cliente especificado no existe'],
      };
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

    const scheduleValidation = validateScheduleTime(
      newShift.type as ShiftType,
      newShift.date.toISOString()
    );

    if (!scheduleValidation.isValid) {
      return {
        success: false,
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        message: 'Horario inválido',
        errors: scheduleValidation.errors,
      };
    }

    const availabilityCheck = await this.checkSlotAvailability(
      req,
      newShift.type as ShiftType,
      newShift.date.toISOString()
    );

    if (!availabilityCheck.available) {
      return {
        success: false,
        httpStatus: HTTP_STATUS.CONFLICT,
        message: 'Horario no disponible',
        errors: availabilityCheck.errors,
        data: {
          currentShifts: availabilityCheck.currentCount,
          maxAllowed: availabilityCheck.maxAllowed,
          availableSpots: availabilityCheck.maxAllowed - availabilityCheck.currentCount,
        },
      };
    }

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
      success: true,
      httpStatus: HTTP_STATUS.CREATED,
      data: {
        ...mapShiftToResponse(responseData),
      },
    };
  }

  async update(
    req: Request,
    id: string,
    updateData: Partial<Shift>
  ): Promise<{ id: string; data: Partial<ShiftResponse> }> {
    try {
      // Validar ID
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('ID del turno es requerido y debe ser válido');
      }

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

  private async checkSlotAvailability(
    req: Request,
    shiftType: ShiftType,
    scheduledDate: string,
    excludeShiftId?: string
  ): Promise<{ available: boolean; currentCount: number; maxAllowed: number; errors: string[] }> {
    try {
      const date = new Date(scheduledDate);
      const slotConfig = getSlotForDateTime(shiftType, scheduledDate);

      if (!slotConfig) {
        return {
          available: false,
          currentCount: 0,
          maxAllowed: 0,
          errors: ['Horario no disponible'],
        };
      }

      // Calcular inicio y fin del slot
      const slotStart = new Date(date);
      const [startHours, startMinutes] = slotConfig.slot.start.split(':').map(Number);
      slotStart.setHours(startHours, startMinutes, 0, 0);

      const slotEnd = new Date(date);
      const [endHours, endMinutes] = slotConfig.slot.end.split(':').map(Number);
      slotEnd.setHours(endHours, endMinutes, 0, 0);

      const COLLECTION_NAME = getCollectionName(req, CLIENT_ID, COLLECTION_ID);
      const query: Query = this.db.collection(COLLECTION_NAME)
        .where('type', '==', shiftType)
        .where('date', '>=', slotStart)
        .where('date', '<', slotEnd)
        .where('status', 'in', [
          ShiftStatusEnum.SCHEDULED,
        ]);

      const querySnapshot = await query.get();
      let currentCount = 0;

      querySnapshot.docs.forEach((doc) => {
        // Excluir el turno actual si estamos actualizando
        if (!excludeShiftId || doc.id !== excludeShiftId) {
          currentCount++;
        }
      });

      const available = currentCount < slotConfig.maxConcurrent;
      const errors: string[] = [];

      if (!available) {
        if (shiftType === ShiftTypeEnum.HOME) {
          errors.push('Este horario ya está ocupado para turnos a domicilio');
        } else {
          errors.push(`Este horario está completo (${currentCount}/${slotConfig.maxConcurrent} turnos)`);
        }
      }

      return {
        available,
        currentCount,
        maxAllowed: slotConfig.maxConcurrent,
        errors,
      };
    } catch (error) {
      return {
        available: false,
        currentCount: 0,
        maxAllowed: 0,
        errors: ['Error al verificar disponibilidad del horario'],
      };
    }
  }
}
