import { createApiClient } from './api';

// O provedor (RAWG/IGDB) é decidido no servidor
const request = createApiClient('/api/games');

export const fetchPopularGames = (opts) => request('/popular', opts);

export function searchGames(query, opts) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return Promise.resolve({ provider: null, games: [] });
  return request(`/search?q=${encodeURIComponent(q)}`, opts);
}

export const fetchGame = (id, opts) => request(`/game/${encodeURIComponent(id)}`, opts);
