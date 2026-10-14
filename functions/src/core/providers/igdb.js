import { makeGame, shortPlatform, yearFrom } from '../gameShape.js';

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const API_URL = 'https://api.igdb.com/v4';

// Só os campos que o app usa (resposta menor = mais rápida)
const FIELDS = [
  'name',
  'slug',
  'summary',
  'url',
  'first_release_date',
  'total_rating',
  'cover.image_id',
  'platforms.name',
  'genres.name',
].join(',');

const escape = (s) => s.replace(/["\\]/g, '\\$&');

const mapGame = (g) =>
  makeGame('igdb', {
    providerId: g.id,
    title: g.name,
    slug: g.slug,
    summary: g.summary ?? '',
    cover: g.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
      : null,
    year: yearFrom(g.first_release_date),
    platforms: (g.platforms ?? []).map((p) => shortPlatform(p.name)),
    genres: (g.genres ?? []).map((x) => x.name),
    rating: g.total_rating ? Math.round(g.total_rating) : null,
    sourceUrl: g.url ?? null,
  });

// getSecret(nome) → valor. Sem dependência do Firebase: roda no Vite (dev) e na function
export function createIgdbProvider(getSecret) {
  // Token do Twitch dura ~60 dias: fica em memória enquanto o processo viver
  let cached = { token: null, expiresAt: 0 };

  async function getToken(force = false) {
    if (!force && cached.token && Date.now() < cached.expiresAt) return cached.token;

    const params = new URLSearchParams({
      client_id: getSecret('TWITCH_CLIENT_ID'),
      client_secret: getSecret('TWITCH_CLIENT_SECRET'),
      grant_type: 'client_credentials',
    });
    const res = await fetch(`${TOKEN_URL}?${params}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Twitch token ${res.status}`);

    const { access_token, expires_in } = await res.json();
    cached = { token: access_token, expiresAt: Date.now() + (expires_in - 300) * 1000 };
    return access_token;
  }

  // Consulta Apicalypse; se o token expirou antes da hora, renova e tenta de novo
  async function query(body, retry = true) {
    const res = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: {
        'Client-ID': getSecret('TWITCH_CLIENT_ID'),
        Authorization: `Bearer ${await getToken(!retry)}`,
        'Content-Type': 'text/plain',
      },
      body,
    });

    if (res.status === 401 && retry) return query(body, false);
    if (!res.ok) throw new Error(`IGDB games ${res.status}: ${await res.text()}`);
    return (await res.json()).map(mapGame);
  }

  return {
    name: 'igdb',

    search: (text, limit = 20) =>
      query(`search "${escape(text)}"; fields ${FIELDS}; where version_parent = null; limit ${limit};`),

    // Mais avaliados entre os lançados no último ano
    popular: (limit = 20) => {
      const since = Math.floor(Date.now() / 1000) - 365 * 86400;
      return query(
        `fields ${FIELDS}; where first_release_date > ${since} & total_rating_count > 5 & version_parent = null; sort total_rating_count desc; limit ${limit};`,
      );
    },

    getById: async (providerId) =>
      (await query(`fields ${FIELDS}; where id = ${Number(providerId)}; limit 1;`))[0] ?? null,
  };
}
