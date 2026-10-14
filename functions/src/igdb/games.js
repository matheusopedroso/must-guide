import { igdbQuery } from './client.js';

// Só os campos que o app usa (resposta menor = mais rápida)
const FIELDS = [
  'name',
  'slug',
  'summary',
  'url',
  'first_release_date',
  'total_rating',
  'cover.image_id',
  'platforms.abbreviation',
  'platforms.name',
  'genres.name',
].join(',');

const escape = (s) => s.replace(/["\\]/g, '\\$&');

export const mapGame = (g) => ({
  id: String(g.id),
  title: g.name,
  slug: g.slug ?? null,
  summary: g.summary ?? '',
  coverId: g.cover?.image_id ?? null,
  year: g.first_release_date ? new Date(g.first_release_date * 1000).getUTCFullYear() : null,
  platforms: (g.platforms ?? []).map((p) => p.abbreviation || p.name),
  genres: (g.genres ?? []).map((x) => x.name),
  rating: g.total_rating ? Math.round(g.total_rating) : null,
  igdbUrl: g.url ?? null,
});

export async function searchGames(query, limit = 20) {
  const body = `search "${escape(query)}"; fields ${FIELDS}; where version_parent = null; limit ${limit};`;
  return (await igdbQuery('games', body)).map(mapGame);
}

export async function getGameById(id) {
  const [game] = await igdbQuery('games', `fields ${FIELDS}; where id = ${Number(id)}; limit 1;`);
  return game ? mapGame(game) : null;
}
