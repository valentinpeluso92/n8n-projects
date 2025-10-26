import { convertObjectTimestamps } from '../../utilities/timestamp';
import { Client } from '../model/client';
import { ClientResponse } from '../types/api';

export const mapClientToResponse = (client: Client): ClientResponse => {
  const response: ClientResponse = {
    ...client,
    whatsappLink: createWhatsappLink(client.phone) || '',
    googleMapsLink: createGoogleMapsLink(client.address) || '',
  };
  return convertObjectTimestamps(response);
};


export const mapClientsToResponse = (clients: Client[]): ClientResponse[] => {
  return clients.map(mapClientToResponse);
};

const createGoogleMapsLink = (address: string): string | null => {
  if (!address) return null;

  const cleanedAddress = address
    .toLowerCase() // Convertir a minúsculas
    .replace(/[^a-z0-9\s]/g, '') // Mantener solo letras, números y espacios
    .replace(/\s+/g, '+'); // Reemplazar espacios por '+'

  if (cleanedAddress.length === 0) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanedAddress)}`;
};

const createWhatsappLink = (phone: string): string | null => {
  if (!phone) return null;

  const cleanedPhone = phone.replace(/\D/g, '');
  if (cleanedPhone.length === 0) return null;

  return `https://wa.me/${cleanedPhone}`;
};
