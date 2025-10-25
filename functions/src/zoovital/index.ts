
// === sbox-zoovital-refactored.ts ===

import { Firestore } from 'firebase-admin/firestore';
import { Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { ClientController } from './controllers/clientController';
import { ShiftController } from './controllers/shiftController';

// Create controller instance
let clientController: ClientController;
let shiftController: ShiftController;

const initializeShiftController = (db: Firestore, API_KEY: string, COLLECTION_NAME: string): ShiftController => {
  if (!shiftController) {
    shiftController = new ShiftController(db, API_KEY, COLLECTION_NAME);
  }
  return shiftController;
};

const initializeController = (db: Firestore, API_KEY: string, COLLECTION_NAME: string): ClientController => {
  if (!clientController) {
    clientController = new ClientController(db, API_KEY, COLLECTION_NAME);
  }
  return clientController;
};

const getClient = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeController(db, API_KEY, COLLECTION_NAME);
  return controller.getClient(req, res);
};

const postClient = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeController(db, API_KEY, COLLECTION_NAME);
  return controller.postClient(req, res);
};

const updateClient = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeController(db, API_KEY, COLLECTION_NAME);
  return controller.updateClient(req, res);
};

const removeClient = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeController(db, API_KEY, COLLECTION_NAME);
  return controller.removeClient(req, res);
};

const getShift = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeShiftController(db, API_KEY, COLLECTION_NAME);
  return controller.getShift(req, res);
};

const postShift = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeShiftController(db, API_KEY, COLLECTION_NAME);
  return controller.postShift(req, res);
};

const updateShift = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeShiftController(db, API_KEY, COLLECTION_NAME);
  return controller.updateShift(req, res);
};

const removeShift = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeShiftController(db, API_KEY, COLLECTION_NAME);
  return controller.removeShift(req, res);
};

const checkConflicts = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string,
  COLLECTION_NAME: string
) => {
  const controller = initializeShiftController(db, API_KEY, COLLECTION_NAME);
  return controller.checkConflicts(req, res);
};

// Exported functions with improved architecture
export const sboxZoovital = {
  getClient,
  postClient,
  updateClient,
  removeClient,
  getShift,
  postShift,
  updateShift,
  removeShift,
  checkConflicts,
};
