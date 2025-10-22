import { setGlobalOptions } from 'firebase-functions';
import { HttpsOptions, onRequest, Request } from 'firebase-functions/v2/https';
import * as express from 'express';
import { sboxZoovital } from './zoovital/sbox-zoovital';
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

export const sboxZoovitalGetClient = onRequest(
  opts,
  async (request: Request, response: express.Response) => {
    const API_KEY = apiKeySecret.value();
    await sboxZoovital.getClient(request, response, db, API_KEY);
  }
);
export const sboxZoovitalPostClient = onRequest(
  opts,
  async (request: Request, response: express.Response) => {
    const API_KEY = apiKeySecret.value();
    await sboxZoovital.postClient(request, response, db, API_KEY);
  }
);
export const sboxZoovitalUpdateClient = onRequest(
  opts,
  async (request: Request, response: express.Response) => {
    const API_KEY = apiKeySecret.value();
    await sboxZoovital.updateClient(request, response, db, API_KEY);
  }
);
export const sboxZoovitalRemoveClient = onRequest(
  opts,
  async (request: Request, response: express.Response) => {
    const API_KEY = apiKeySecret.value();
    await sboxZoovital.removeClient(request, response, db, API_KEY);
  }
);
