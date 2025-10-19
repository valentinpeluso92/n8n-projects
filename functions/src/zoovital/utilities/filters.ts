import {stringsUtilities} from '../../utilities/strings';
import {Client} from '../model/client';

// Función auxiliar para filtrar por nombre con fuzzy matching
const filterByName = (clients: Client[], searchName: string, threshold = 80): Client[] => {
  return clients.filter((client) => {
    if (!client.nombre || typeof client.nombre !== 'string') {
      return false;
    }

    const similarity = stringsUtilities.calculateSimilarity(client.nombre, searchName);
    return similarity >= threshold;
  }).sort((a, b) => {
    // Ordenar por similitud descendente
    const similarityA = stringsUtilities.calculateSimilarity(a.nombre || '', searchName);
    const similarityB = stringsUtilities.calculateSimilarity(b.nombre || '', searchName);
    return similarityB - similarityA;
  });
};

export const zoovitalFiltersUtilities = {
  filterByName,
};
