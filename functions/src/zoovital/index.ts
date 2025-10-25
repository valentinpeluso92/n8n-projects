
// === sbox-zoovital-refactored.ts ===

import { Firestore } from 'firebase-admin/firestore';
import { Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { ClientController } from './controllers/clientController';
import { ShiftController } from './controllers/shiftController';

// Create controller instance
let clientController: ClientController;
let shiftController: ShiftController;

const initializeShiftController = (db: Firestore): ShiftController => {
  if (!shiftController) {
    shiftController = new ShiftController(db);
  }
  return shiftController;
};

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

  getShift: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeShiftController(db);
    return controller.getShift(req, res, API_KEY);
  },

  postShift: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeShiftController(db);
    return controller.postShift(req, res, API_KEY);
  },

  updateShift: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeShiftController(db);
    return controller.updateShift(req, res, API_KEY);
  },

  removeShift: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeShiftController(db);
    return controller.removeShift(req, res, API_KEY);
  },

  checkConflicts: async (req: Request, res: express.Response, db: Firestore, API_KEY: string) => {
    const controller = initializeShiftController(db);
    return controller.checkConflicts(req, res, API_KEY);
  },
};
