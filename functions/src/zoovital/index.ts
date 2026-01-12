import { Firestore } from 'firebase-admin/firestore';
import { Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { ClientController } from './controllers/clientController';
import { ShiftController } from './controllers/shiftController';

// Create controller instance
let clientController: ClientController;
let shiftController: ShiftController;

const initializeShiftController = (db: Firestore, API_KEY: string): ShiftController => {
  if (!shiftController) {
    shiftController = new ShiftController(db, API_KEY);
  }
  return shiftController;
};

const initializeClientController = (db: Firestore, API_KEY: string): ClientController => {
  if (!clientController) {
    clientController = new ClientController(db, API_KEY);
  }
  return clientController;
};

const getClient = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string
) => {
  const controller = initializeClientController(db, API_KEY);
  return controller.getClient(req, res);
};

const postClient = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string
) => {
  const controller = initializeClientController(db, API_KEY);
  return controller.postClient(req, res);
};

const updateClient = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string
) => {
  const controller = initializeClientController(db, API_KEY);
  return controller.updateClient(req, res);
};

const removeClient = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string
) => {
  const controller = initializeClientController(db, API_KEY);
  return controller.removeClient(req, res);
};

const getShift = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string
) => {
  const controller = initializeShiftController(db, API_KEY);
  return controller.getShift(req, res);
};

const postShift = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string
) => {
  const controller = initializeShiftController(db, API_KEY);
  return controller.postShift(req, res);
};

const updateShift = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string
) => {
  const controller = initializeShiftController(db, API_KEY);
  return controller.updateShift(req, res);
};

const removeShift = async (
  req: Request,
  res: express.Response,
  db: Firestore,
  API_KEY: string
) => {
  const controller = initializeShiftController(db, API_KEY);
  return controller.removeShift(req, res);
};

// Exported functions with improved architecture
export const zoovitalApi = {
  getClient,
  postClient,
  updateClient,
  removeClient,
  getShift,
  postShift,
  updateShift,
  removeShift,
};
