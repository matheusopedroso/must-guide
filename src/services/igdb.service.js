import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const callIgdb = httpsCallable(functions, 'igdb');

// Cache em memória da sessão: a mesma busca não chama a function duas vezes
const searchCache = new Map();

export async function searchGames(query) {
  const key = query.trim().toLowerCase();
  if (key.length < 2) return [];
  if (searchCache.has(key)) return searchCache.get(key);

  const { data } = await callIgdb({ action: 'search', query: key });
  searchCache.set(key, data.games);
  return data.games;
}

export async function getGameFromIgdb(id) {
  const { data } = await callIgdb({ action: 'game', id });
  return data.game;
}
