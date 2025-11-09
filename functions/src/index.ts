import { setGlobalOptions } from 'firebase-functions';
import { HttpsOptions, onRequest, Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { zoovitalApi } from './zoovital';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { defineSecret } from 'firebase-functions/params';

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
  await zoovitalApi.getClient(request, response, db, API_KEY);
};

const postClient = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await zoovitalApi.postClient(request, response, db, API_KEY);
};

const removeClient = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await zoovitalApi.removeClient(request, response, db, API_KEY);
};

const updateClient = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await zoovitalApi.updateClient(request, response, db, API_KEY);
};

const getShift = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await zoovitalApi.getShift(request, response, db, API_KEY);
};

const postShift = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await zoovitalApi.postShift(request, response, db, API_KEY);
};

const updateShift = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await zoovitalApi.updateShift(request, response, db, API_KEY);
};

const removeShift = async (request: Request, response: express.Response) => {
  const API_KEY = apiKeySecret.value();
  await zoovitalApi.removeShift(request, response, db, API_KEY);
};

export const zoovitalGetClient = onRequest(opts, getClient);
export const zoovitalPostClient = onRequest(opts, postClient);
export const zoovitalUpdateClient = onRequest(opts, updateClient);
export const zoovitalRemoveClient = onRequest(opts, removeClient);
export const zoovitalGetShift = onRequest(opts, getShift);
export const zoovitalPostShift = onRequest(opts, postShift);
export const zoovitalUpdateShift = onRequest(opts, updateShift);
export const zoovitalRemoveShift = onRequest(opts, removeShift);
