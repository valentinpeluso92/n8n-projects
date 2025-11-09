import { Request } from 'firebase-functions/v2/https';

export const getCollectionName = (req: Request, clientId: string, collectionId: string): string => {
  const isSbox = req.get('x-sbox') === 'true';
  return isSbox ? `sbox-${clientId}-${collectionId}` : `${clientId}-${collectionId}`;
};
