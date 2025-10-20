import {stringsUtilities} from '../../utilities/strings';
import {Client} from '../model/client';

// Función auxiliar para filtrar por nombre con fuzzy matching
const filterByName = (clients: Client[], searchName: string, threshold = 80): Client[] => {
  return clients.filter((client) => {
    if (!client.name || typeof client.name !== 'string') {
      return false;
    }

    const similarity = stringsUtilities.calculateSimilarity(client.name, searchName);
    return similarity >= threshold;
  }).sort((a, b) => {
    // Ordenar por similitud descendente
    const similarityA = stringsUtilities.calculateSimilarity(a.name || '', searchName);
    const similarityB = stringsUtilities.calculateSimilarity(b.name || '', searchName);
    return similarityB - similarityA;
  });
};

export const zoovitalFiltersUtilities = {
  filterByName,
};
