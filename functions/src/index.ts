import {setGlobalOptions} from "firebase-functions";
import {onRequest, Request} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as express from "express";
import {sboxZoovital} from "./zoovital/sbox-zoovital";
import {Firestore, getFirestore} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";

setGlobalOptions({maxInstances: 10});

// Inicializar Firebase Admin SDK
initializeApp();
const db: Firestore = getFirestore();

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send({message: "Hello from Firebase 2!"});
});

export const sboxZoovitalGetClient = onRequest(
  async (request: Request, response: express.Response) => {
    await sboxZoovital.getClient(request, response, db);
  }
);
// export const sboxZoovitalPostClient = onRequest(
//   async (request: Request, response: Response) => {
//     return await sboxZoovital.postClient(request, response, db);
//   }
// );
// export const sboxZoovitalUpdateClient = onRequest(
//   async (request: Request, response: Response) => {
//     return await sboxZoovital.updateClient(request, response, db);
//   }
// );
// export const sboxZoovitalRemoveClient = onRequest(
//   async (request: Request, response: Response) => {
//     return await sboxZoovital.removeClient(request, response, db);
//   }
// );
