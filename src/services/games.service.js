// API de jogos do próprio app (/api/games/**): no dev quem responde é o Vite,
// em produção a function "games" via Hosting. O provedor (RAWG/IGDB) é decidido no servidor.
const BASE = '/api/games';

// Cache da sessão: a mesma consulta não vai à rede duas vezes
const cache = new Map();

async function request(path, { signal } = {}) {
  if (cache.has(path)) return cache.get(path);

  const res = await fetch(`${BASE}${path}`, { signal });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);

  cache.set(path, data);
  return data;
}

export const fetchPopularGames = (opts) => request('/popular', opts);

export function searchGames(query, opts) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return Promise.resolve({ provider: null, games: [] });
  return request(`/search?q=${encodeURIComponent(q)}`, opts);
}

export const fetchGame = (id, opts) => request(`/game/${encodeURIComponent(id)}`, opts);
