import { Firestore, FieldValue, Query, FieldPath } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { Client } from '../model/client';
import { ClientFilterOptions, ClientResponse } from '../types/api';
import { mapClientsToResponse, mapClientToResponse } from '../helpers/clientResponse';

export class ClientService {
  private COLLECTION_NAME: string;

  constructor(private db: Firestore, COLLECTION_NAME: string) {
    this.COLLECTION_NAME = COLLECTION_NAME;
  }

  async getById(id: string): Promise<ClientResponse | null> {
    try {
      const doc = await this.db.collection(this.COLLECTION_NAME).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const rawData = {
        id: doc.id,
        ...doc.data(),
      } as ClientResponse;

      return mapClientToResponse(rawData);
    } catch (error) {
      logger.error('Error getting client by ID', { id, error });
      throw error;
    }
  }

  async getAll(options: ClientFilterOptions = { filter: {} }): Promise<ClientResponse[]> {
    try {
      let query: Query = this.db.collection(this.COLLECTION_NAME);
      const { filter } = options;

      let words: string[] = [];

      if (filter.name) {
        words = filter.name
          .toLowerCase()
          .split(' ')
          .map((word: string) => word.trim())
          .filter((word: string) => word.length > 0);

        if (words.length === 1) {
          query = query.where('nameWords', 'array-contains', words[0]);
        } else {
          query = query.where('nameWords', 'array-contains-any', words.slice(0, 10));
        }
      }

      if (filter.email) {
        query = query.where('email', '==', filter.email);
      }

      if (filter.phone) {
        query = query.where('phone', '==', filter.phone);
      }

      if (filter.age) {
        const ageNum = parseInt(filter.age, 10);
        if (!isNaN(ageNum)) {
          query = query.where('age', '==', ageNum);
        }
      }

      if (filter.address) {
        query = query.where('address', '==', filter.address);
      }

      if (filter.clientIds) {
        const clientIdsArray = filter.clientIds.split(',').map((id) => id.trim());
        query = query.where(FieldPath.documentId(), 'in', clientIdsArray);
      }

      // Limitar resultados para fuzzy matching posterior
      query = query.limit(options.pagination?.limit || 50);

      if (options.pagination?.offset) {
        query = query.offset(options.pagination.offset);
      }

      const snapshot = await query.get();
      const clients: ClientResponse[] = [];

      snapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data(),
        } as ClientResponse);
      });

      const filteredResults = clients.filter((client) => {
        const clientNameWords = client.nameWords || [];
        // Verificar que todos los términos de búsqueda estén presentes en el nombre del cliente
        return words.length === 0 || words.every((searchWord) =>
          clientNameWords.some((clientWord) =>
            clientWord.includes(searchWord) || searchWord.includes(clientWord)
          )
        );
      });

      logger.info('Clients retrieved', {
        filter,
        count: filteredResults.length,
      });

      return mapClientsToResponse(filteredResults);
    } catch (error) {
      logger.error('Error getting all clients', { options, error });
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

      const docRef = await this.db.collection(this.COLLECTION_NAME).add(newClient);

      logger.info('Client created successfully', { id: docRef.id });

      const responseData = mapClientToResponse(newClient as any);

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
      const docRef = this.db.collection(this.COLLECTION_NAME).doc(id);

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

      const responseData = mapClientToResponse(updatedData as any);

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
      const docRef = this.db.collection(this.COLLECTION_NAME).doc(id);

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
      const docRef = this.db.collection(this.COLLECTION_NAME).doc(id);

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
