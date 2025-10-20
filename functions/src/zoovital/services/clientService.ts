
// === services/clientService.ts ===

import { Firestore, FieldValue, Query } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { Client } from '../model/client';
import { FilterOptions } from '../../types/api';
import { COLLECTION_NAMES } from '../../constants';
import { zoovitalFiltersUtilities } from '../utilities/filters';
import { ClientWithId } from '../types/api';

export class ClientService {
  constructor(private db: Firestore) {}

  async getById(id: string): Promise<ClientWithId | null> {
    try {
      const doc = await this.db.collection(COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as ClientWithId;
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

      const snapshot = await query.get();
      const clients: ClientWithId[] = [];

      snapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data(),
        } as ClientWithId);
      });

      // Apply name filter if provided (consider moving to Firestore query for better performance)
      if (options.name) {
        const threshold = options.threshold || 80;
        return zoovitalFiltersUtilities.filterByName(clients, options.name, threshold);
      }

      return clients;
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

      return {
        id: docRef.id,
        data: clientData,
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

      return {
        id,
        data: updateData,
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
