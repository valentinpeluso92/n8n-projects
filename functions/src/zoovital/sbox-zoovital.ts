
// === sbox-zoovital-refactored.ts ===

import { Firestore } from 'firebase-admin/firestore';
import { Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { ClientController } from './controllers/clientController';

// Create controller instance
let clientController: ClientController;

const initializeController = (db: Firestore): ClientController => {
  if (!clientController) {
    clientController = new ClientController(db);
  }
  return clientController;
};

// Exported functions with improved architecture
export const sboxZoovital = {
  getClient: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeController(db);
    return controller.getClient(req, res, API_KEY);
  },

  postClient: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeController(db);
    return controller.postClient(req, res, API_KEY);
  },

  updateClient: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeController(db);
    return controller.updateClient(req, res, API_KEY);
  },

  removeClient: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeController(db);
    return controller.removeClient(req, res, API_KEY);
  },
};
