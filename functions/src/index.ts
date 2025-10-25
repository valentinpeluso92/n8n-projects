import { setGlobalOptions } from 'firebase-functions';
import { HttpsOptions, onRequest, Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { sboxZoovital } from './zoovital';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { defineSecret } from 'firebase-functions/params';
import { COLLECTION_NAMES } from './constants';

setGlobalOptions({ maxInstances: 10 });

const apiKeySecret = defineSecret('API_KEY');

// Inicializar Firebase Admin SDK
initializeApp();
const db: Firestore = getFirestore();

const opts: HttpsOptions = {
  invoker: 'public',
  secrets: [apiKeySecret],
};

const getClient = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.getClient(request, response, db, API_KEY, COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS);
};

const postClient = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.postClient(request, response, db, API_KEY, COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS);
};

const removeClient = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.removeClient(request, response, db, API_KEY, COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS);
};

const updateClient = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.updateClient(request, response, db, API_KEY, COLLECTION_NAMES.SBOX_ZOOVITAL_CLIENTS);
};

const getShift = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.getShift(request, response, db, API_KEY, COLLECTION_NAMES.SVOX_ZOOVITAL_SHIFTS);
};

const postShift = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.postShift(request, response, db, API_KEY, COLLECTION_NAMES.SVOX_ZOOVITAL_SHIFTS);
};

const updateShift = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.updateShift(request, response, db, API_KEY, COLLECTION_NAMES.SVOX_ZOOVITAL_SHIFTS);
};

const removeShift = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.removeShift(request, response, db, API_KEY, COLLECTION_NAMES.SVOX_ZOOVITAL_SHIFTS);
};

const checkConflicts = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await sboxZoovital.checkConflicts(request, response, db, API_KEY, COLLECTION_NAMES.SVOX_ZOOVITAL_SHIFTS);
};

export const sboxZoovitalGetClient = onRequest(opts, getClient);
export const sboxZoovitalPostClient = onRequest(opts, postClient);
export const sboxZoovitalUpdateClient = onRequest(opts, updateClient);
export const sboxZoovitalRemoveClient = onRequest(opts, removeClient);
export const sboxZoovitalGetShift = onRequest(opts, getShift);
export const sboxZoovitalPostShift = onRequest(opts, postShift);
export const sboxZoovitalUpdateShift = onRequest(opts, updateShift);
export const sboxZoovitalRemoveShift = onRequest(opts, removeShift);
export const sboxZoovitalCheckConflicts = onRequest(opts, checkConflicts);
