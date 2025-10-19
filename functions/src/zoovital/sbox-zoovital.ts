import {Firestore} from "firebase-admin/firestore";
import * as express from "express";
import {HttpsError, Request} from "firebase-functions/v2/https";
import {Client} from "./model/client";
import { zoovitalFiltersUtilities } from "./utilities/filters";

const COLLECTION_NAME = "sbox-zoovital-clients";

// GET - Obtener cliente(s)
const getClient = async (
  req: Request,
  res: express.Response,
  db: Firestore
) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({error: "Método no permitido. Usa GET."});
  }

  try {
    const id: string = req.query.id as string;
    const name: string = req.query.name as string;
    const threshold: number = req.query.threshold ? 
      Math.max(0, Math.min(100, parseInt(req.query.threshold as string))) : 80;

    if (id) {
      // Obtener un cliente específico
      const doc = await db.collection(COLLECTION_NAME).doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({error: "Cliente no encontrado"});
      }

      return res.status(200).json({
        success: true,
        data: {id: doc.id, ...doc.data()},
      });
    } else if (name) {
      // Filtrar clientes por nombre con threshold personalizable
      const snapshot = await db.collection(COLLECTION_NAME).get();
      const allClients: Client[] = [];

      snapshot.forEach((doc) => {
        allClients.push({id: doc.id, ...doc.data()} as Client);
      });

      const filteredClients = zoovitalFiltersUtilities.filterByName(allClients, name, threshold);

      return res.status(200).json({
        success: true,
        data: filteredClients,
        count: filteredClients.length,
        searchCriteria: {
          name: name,
          threshold: threshold
        }
      });
    } else {
      // Obtener todos los clientes
      const snapshot = await db.collection(COLLECTION_NAME).get();
      const clients: Client[] = [];

      snapshot.forEach((doc) => {
        clients.push({id: doc.id, ...doc.data()} as Client);
      });

      return res.status(200).json({
        success: true,
        data: clients,
        count: clients.length,
      });
    }
  } catch (error: HttpsError | any) {
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
};

// // POST - Crear nuevo cliente
// const postClient = async (req: Request, res: Response, db: Firestore) => {
//   // Configurar CORS
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.set('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     res.status(204).send('');
//     return;
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
//   }

//   try {
//     const clientData = req.body;

//     // Validación básica
//     if (!clientData || Object.keys(clientData).length === 0) {
//       return res.status(400).json({
//         error: 'Los datos del cliente son requeridos'
//       });
//     }

//     // Agregar timestamp de creación
//     const newClient = {
//       ...clientData,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       updatedAt: admin.firestore.FieldValue.serverTimestamp()
//     };

//     // Crear documento en Firestore
//     const docRef = await db.collection(COLLECTION_NAME).add(newClient);

//     return res.status(201).json({
//       success: true,
//       message: 'Cliente creado exitosamente',
//       data: { id: docRef.id, ...clientData }
//     });

//   } catch (error) {
//     console.error('Error en postClient:', error);
//     return res.status(500).json({
//       error: 'Error interno del servidor',
//       details: error.message
//     });
//   }
// }

// // PUT - Actualizar cliente
// const updateClient = async (req: Request, res: Response, db: Firestore) => {
//   // Configurar CORS
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
//   res.set('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     res.status(204).send('');
//     return;
//   }

//   if (req.method !== 'PUT') {
//     return res.status(405).json({ error: 'Método no permitido. Usa PUT.' });
//   }

//   try {
//     const { id } = req.query;
//     const updateData = req.body;

//     if (!id) {
//       return res.status(400).json({ error: 'ID del cliente es requerido' });
//     }

//     if (!updateData || Object.keys(updateData).length === 0) {
//       return res.status(400).json({
//         error: 'Los datos para actualizar son requeridos'
//       });
//     }

//     // Verificar si el documento existe
//     const docRef = db.collection(COLLECTION_NAME).doc(id);
//     const doc = await docRef.get();

//     if (!doc.exists) {
//       return res.status(404).json({ error: 'Cliente no encontrado' });
//     }

//     // Actualizar documento
//     const updatedData = {
//       ...updateData,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp()
//     };

//     await docRef.update(updatedData);

//     return res.status(200).json({
//       success: true,
//       message: 'Cliente actualizado exitosamente',
//       data: { id: id, ...updateData }
//     });

//   } catch (error) {
//     console.error('Error en updateClient:', error);
//     return res.status(500).json({
//       error: 'Error interno del servidor',
//       details: error.message
//     });
//   }
// }

// // DELETE - Eliminar cliente
// const removeClient = async (req: Request, res: Response, db: Firestore) => {
//   // Configurar CORS
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
//   res.set('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     res.status(204).send('');
//     return;
//   }

//   if (req.method !== 'DELETE') {
//     return res.status(405).json({
//       error: 'Método no permitido. Usa DELETE.'
//     });
//   }

//   try {
//     const { id } = req.query;

//     if (!id) {
//       return res.status(400).json({
//         error: 'ID del cliente es requerido'
//       });
//     }

//     // Verificar si el documento existe
//     const docRef = db.collection(COLLECTION_NAME).doc(id);
//     const doc = await docRef.get();

//     if (!doc.exists) {
//       return res.status(404).json({ error: 'Cliente no encontrado' });
//     }

//     // Eliminar documento
//     await docRef.delete();

//     return res.status(200).json({
//       success: true,
//       message: 'Cliente eliminado exitosamente',
//       data: { id: id }
//     });

//   } catch (error) {
//     console.error('Error en removeClient:', error);
//     return res.status(500).json({
//       error: 'Error interno del servidor',
//       details: error.message
//     });
//   }
// };

export const sboxZoovital = {
  getClient,
  // postClient,
  // updateClient,
  // removeClient
};
