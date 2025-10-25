import { Firestore, FieldValue, Query } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { Client } from '../model/client';
import { FilterOptions } from '../../types/api';
import { COLLECTION_NAMES } from '../../constants';
import { ClientWithId } from '../types/api';
import { convertArrayTimestamps, convertObjectTimestamps } from '../../utilities/timestamp';

export class ClientService {
  constructor(private db: Firestore) {}

  async getById(id: string): Promise<ClientWithId | null> {
    try {
      const doc = await this.db.collection(COLLECTION_NAMES.CLIENTS).doc(id).get();

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
      let query: Query = this.db.collection(COLLECTION_NAMES.CLIENTS);

      // Limitar resultados para fuzzy matching posterior
      query = query.limit(options.pagination?.limit || 50);

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
      return clientsWithConvertedTimestamps;
    } catch (error) {
      logger.error('Error getting all clients', { options, error });
      throw error;
    }
  }

  async searchByName(options: FilterOptions = {}): Promise<ClientWithId[]> {
    try {
      const { pagination, name } = options;
      const limit = pagination?.limit || 50;
      const searchTerm = (name as string);
      const words: string[] = searchTerm
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.trim())
        .filter((word: string) => word.length > 0);

      if (!words.length) {
        return [];
      }

      let query: Query = this.db.collection(COLLECTION_NAMES.CLIENTS);

      if (words.length === 1) {
        query = query.where('nameWords', 'array-contains', words[0]);
      } else {
        query = query.where('nameWords', 'array-contains-any', words.slice(0, 10));
      }

      const firestoreLimit = Math.max(limit * 3, 100);
      query = query.limit(firestoreLimit);

      const snapshot = await query.get();
      const candidates: ClientWithId[] = [];

      snapshot.forEach((doc) => {
        candidates.push({ id: doc.id, ...doc.data() } as ClientWithId);
      });

      const filteredResults = candidates.filter((client) => {
        const clientNameWords = client.nameWords || [];
        return words.every((searchWord) =>
          clientNameWords.some((clientWord) =>
            clientWord.includes(searchWord) || searchWord.includes(clientWord)
          )
        );
      });

      const finalResults = filteredResults.slice(0, limit);

      logger.info('Advanced search performance', {
        searchTerm,
        results: finalResults.length,
        strategies: {
          words: words.join(', '),
        },
      });

      // Convertir timestamps
      return convertArrayTimestamps(finalResults);
    } catch (error) {
      const { name } = options;
      const searchTerm = (name as string);
      logger.error('Error in advanced name search', { searchTerm, options, error });
      throw error;
    }
  }

  async create(clientData: Partial<Client>): Promise<{ id: string; data: Partial<Client> }> {
    try {
      const newClient = {
        ...clientData,
        // Campos optimizados para búsqueda
        nameLower: clientData.name?.toLowerCase(),
        nameWords: this.generateNameWords(clientData.name || ''),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await this.db.collection(COLLECTION_NAMES.CLIENTS).add(newClient);

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
      const docRef = this.db.collection(COLLECTION_NAMES.CLIENTS).doc(id);

      // Check if document exists
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('Client not found');
      }

      const updatedData = {
        ...updateData,
        // Actualizar campos de búsqueda si el nombre cambió
        ...(updateData.name && {
          nameLower: updateData.name.toLowerCase(),
          nameWords: this.generateNameWords(updateData.name),
        }),
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
      const docRef = this.db.collection(COLLECTION_NAMES.CLIENTS).doc(id);

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
      const docRef = this.db.collection(COLLECTION_NAMES.CLIENTS).doc(id);

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

  private generateNameWords(name: string): string[] {
    if (!name || typeof name !== 'string') return [];

    const words = name
      .toLowerCase()
      .replace(/[^a-záéíóúñü\s]/g, '') // Remover caracteres especiales
      .split(/\s+/)
      .filter((word) => word.length >= 2); // Solo palabras de 2+ caracteres

    // Incluir palabras individuales y combinaciones
    const searchWords = new Set(words);

    // Agregar prefijos de palabras para búsquedas parciales
    words.forEach((word) => {
      if (word.length >= 3) {
        for (let i = 2; i <= word.length; i++) {
          searchWords.add(word.substring(0, i));
        }
      }
    });

    return Array.from(searchWords);
  }
}
