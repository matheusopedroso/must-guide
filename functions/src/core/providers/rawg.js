import { daysAgo, makeGame, shortPlatform, yearFrom } from '../gameShape.js';

const API_URL = 'https://api.rawg.io/api';

const mapGame = (g, partial) =>
  makeGame('rawg', {
    providerId: g.id,
    title: g.name,
    slug: g.slug,
    summary: g.description_raw ?? '',
    cover: g.background_image ?? null,
    year: yearFrom(g.released),
    platforms: (g.platforms ?? []).map((p) => shortPlatform(p.platform.name)),
    genres: (g.genres ?? []).map((x) => x.name),
    rating: g.metacritic ?? null,
    sourceUrl: g.slug ? `https://rawg.io/games/${g.slug}` : null,
    partial,
  });

// getSecret(nome) → valor. Sem dependência do Firebase: roda no Vite (dev) e na function
export function createRawgProvider(getSecret) {
  async function get(path, params = {}) {
    const qs = new URLSearchParams({ key: getSecret('RAWG_API_KEY'), ...params });
    const res = await fetch(`${API_URL}${path}?${qs}`);
    if (!res.ok) throw new Error(`RAWG ${path} ${res.status}`);
    return res.json();
  }

  const list = async (params, limit) =>
    (await get('/games', { exclude_additions: 'true', page_size: String(limit), ...params })).results.map(
      (g) => mapGame(g, true),
    );

  return {
    name: 'rawg',

    search: (query, limit = 20) => list({ search: query, search_precise: 'true' }, limit),

    // Mais adicionados pelos usuários entre os lançados no último ano
    popular: (limit = 20) => list({ dates: `${daysAgo(365)},${daysAgo(0)}`, ordering: '-added' }, limit),

    getById: async (providerId) => mapGame(await get(`/games/${Number(providerId)}`), false),
  };
}
