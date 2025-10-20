
// === services/clientService.ts ===

import { Firestore, FieldValue, Query } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { Client } from '../model/client';
import { FilterOptions } from '../../types/api';
import { COLLECTION_NAMES } from '../../constants';
import { zoovitalFiltersUtilities } from '../utilities/filters';
import { ClientWithId } from '../types/api';
import { convertArrayTimestamps, convertObjectTimestamps } from '../../utilities/timestamp';

export class ClientService {
  constructor(private db: Firestore) {}

  async getById(id: string): Promise<ClientWithId | null> {
    try {
      const doc = await this.db.collection(COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const rawData = {
        id: doc.id,
        ...doc.data(),
      } as ClientWithId;

      return convertObjectTimestamps(rawData);
    } catch (error) {
      logger.error('Error getting client by ID', { id, error });
      throw error;
    }
  }

  async getAll(options: FilterOptions = {}): Promise<ClientWithId[]> {
    try {
      let query: Query = this.db.collection(COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS);

      // Apply pagination if provided
      if (options.pagination?.limit) {
        query = query.limit(options.pagination.limit);
      }

      if (options.pagination?.offset) {
        query = query.offset(options.pagination.offset);
      }

      const snapshot = await query.get();
      const clients: ClientWithId[] = [];

      snapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data(),
        } as ClientWithId);
      });

      const clientsWithConvertedTimestamps = convertArrayTimestamps(clients);

      // Apply name filter if provided (consider moving to Firestore query for better performance)
      if (options.name) {
        const threshold = options.threshold || 80;
        return zoovitalFiltersUtilities.filterByName(clientsWithConvertedTimestamps, options.name, threshold);
      }

      return clientsWithConvertedTimestamps;
    } catch (error) {
      logger.error('Error getting all clients', { options, error });
      throw error;
    }
  }

  async create(clientData: Partial<Client>): Promise<{ id: string; data: Partial<Client> }> {
    try {
      const newClient = {
        ...clientData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await this.db.collection(COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS).add(newClient);

      logger.info('Client created successfully', { id: docRef.id });

      const responseData = convertObjectTimestamps({
        ...clientData,
        createdAt: new Date().toISOString(), // Timestamp actual para la respuesta
        updatedAt: new Date().toISOString(),
      });

      return {
        id: docRef.id,
        data: responseData,
      };
    } catch (error) {
      logger.error('Error creating client', { clientData, error });
      throw error;
    }
  }

  async update(id: string, updateData: Partial<Client>): Promise<{ id: string; data: Partial<Client> }> {
    try {
      const docRef = this.db.collection(COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS).doc(id);

      // Check if document exists
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Client not found');
      }

      const updatedData = {
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await docRef.update(updatedData);

      logger.info('Client updated successfully', { id });

      const responseData = convertObjectTimestamps({
        ...updateData,
        updatedAt: new Date().toISOString(), // Timestamp actual para la respuesta
      });

      return {
        id,
        data: responseData,
      };
    } catch (error) {
      logger.error('Error updating client', { id, updateData, error });
      throw error;
    }
  }

  async delete(id: string): Promise<{ id: string }> {
    try {
      const docRef = this.db.collection(COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS).doc(id);

      // Check if document exists
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Client not found');
      }

      await docRef.delete();

      logger.info('Client deleted successfully', { id });

      return { id };
    } catch (error) {
      logger.error('Error deleting client', { id, error });
      throw error;
    }
  }

  // Soft delete alternative
  async softDelete(id: string): Promise<{ id: string }> {
    try {
      const docRef = this.db.collection(COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS).doc(id);

      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Client not found');
      }

      await docRef.update({
        deletedAt: FieldValue.serverTimestamp(),
        isDeleted: true,
        updatedAt: FieldValue.serverTimestamp(),
      });

      logger.info('Client soft deleted successfully', { id });

      return { id };
    } catch (error) {
      logger.error('Error soft deleting client', { id, error });
      throw error;
    }
  }
}
