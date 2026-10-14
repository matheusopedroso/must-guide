import { createCache } from './memoryCache.js';

// Tempo de cache por rota (s): max-age = navegador · s-maxage = CDN do Firebase Hosting
const CACHE = {
  popular: { memory: 6 * 3600, browser: 600, cdn: 6 * 3600 },
  search: { memory: 3600, browser: 300, cdn: 3600 },
  game: { memory: 24 * 3600, browser: 3600, cdn: 24 * 3600 },
};

const cacheHeader = ({ browser, cdn }) => `public, max-age=${browser}, s-maxage=${cdn}`;

// Rotas da API de jogos. Independente de servidor: usado pelo Vite (dev) e pela function (produção).
// handle(rota, query) → { status, body, headers }
export function createGamesApi(provider) {
  const memory = createCache({ max: 300 });

  async function cached(key, ttlSeconds, load) {
    const hit = memory.get(key);
    if (hit) return hit;
    const value = await load();
    memory.set(key, value, ttlSeconds * 1000);
    return value;
  }

  const routes = {
    async popular() {
      return { games: await cached('popular', CACHE.popular.memory, () => provider.popular()) };
    },

    async search({ q }) {
      const query = String(q ?? '').trim().toLowerCase().slice(0, 80);
      if (query.length < 2) return { games: [] };
      return { games: await cached(`s:${query}`, CACHE.search.memory, () => provider.search(query)) };
    },

    async game({ id }) {
      const [prefix, providerId] = String(id ?? '').split('-');
      if (!/^\d+$/.test(providerId ?? '')) throw httpError(400, 'ID inválido.');
      if (prefix !== provider.name) {
        throw httpError(409, `Este jogo é do ${prefix.toUpperCase()}, mas o provedor ativo é ${provider.name.toUpperCase()}.`);
      }
      const game = await cached(`g:${id}`, CACHE.game.memory, () => provider.getById(providerId));
      if (!game) throw httpError(404, 'Jogo não encontrado.');
      return { game };
    },
  };

  return {
    async handle(route, query = {}) {
      const run = routes[route];
      if (!run) return json(404, { error: 'Rota não encontrada.' });

      try {
        const body = { provider: provider.name, ...(await run(query)) };
        return json(200, body, { 'Cache-Control': cacheHeader(CACHE[route]) });
      } catch (e) {
        if (e.status) return json(e.status, { error: e.message });
        console.error(`[games:${provider.name}:${route}]`, e);
        return json(502, { error: 'Falha ao consultar a base de jogos.' });
      }
    },
  };
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

function json(status, body, headers = {}) {
  return { status, body, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } };
}

// Extrai rota e parâmetros de "/api/games/search?q=x" ou "/api/games/game/rawg-1"
export function parseGamesUrl(rawUrl) {
  const url = new URL(rawUrl, 'http://local');
  const parts = url.pathname.replace(/^\/api\/games\/?/, '').split('/').filter(Boolean);
  const query = Object.fromEntries(url.searchParams);
  if (parts[0] === 'game' && parts[1]) query.id = decodeURIComponent(parts[1]);
  return { route: parts[0] ?? '', query };
}
