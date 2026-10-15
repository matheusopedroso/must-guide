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
  'version_title',
  'version_parent',
  'game_type.type',
].join(',');

// Tipo do jogo no IGDB (game_type.type) → rótulo em português. Jogo principal fica sem rótulo.
// Edições (Deluxe, Director's Cut…) são "versões" de outro jogo (version_parent) e também aparecem na busca:
// cada uma pode ter lista de troféus própria na PSN.
const KIND_LABELS = {
  DLC: 'DLC',
  Expansion: 'Expansão',
  Bundle: 'Coletânea',
  'Standalone Expansion': 'Expansão independente',
  Episode: 'Episódio',
  Season: 'Temporada',
  Remake: 'Remake',
  Remaster: 'Remaster',
  'Expanded Game': 'Versão ampliada',
  Port: 'Port',
};
const HIDDEN_TYPES = new Set(['Mod', 'Update', 'Fork', 'Pack']); // não viram guia de troféus

function kindOf(g) {
  if (g.version_parent) {
    const title = g.version_title?.trim();
    return title && !g.name.toLowerCase().includes(title.toLowerCase()) ? `Edição: ${title}` : 'Edição';
  }
  return KIND_LABELS[g.game_type?.type] ?? null;
}

const escape = (s) => s.replace(/["\\]/g, '\\$&');
const image = (id, size) => `https://images.igdb.com/igdb/image/upload/t_${size}/${id}.jpg`;

// Detalhes: + artes (fundo), vídeos (trailer) e ids dos jogos ligados (versões, remasters, DLCs…)
const RELATED_KEYS = ['parent_game', 'remasters', 'remakes', 'expanded_games', 'ports', 'standalone_expansions', 'expansions', 'dlcs'];
const DETAIL_FIELDS = [FIELDS, 'artworks.image_id', 'screenshots.image_id', 'videos.video_id', 'videos.name', ...RELATED_KEYS].join(',');

const backdropOf = (g) => {
  const id = g.artworks?.[0]?.image_id ?? g.screenshots?.[0]?.image_id;
  return id ? image(id, '1080p') : null;
};
// Artes + screenshots para o texto do guia (tamanho bom para ler; a leitura abre a grande ao tocar)
const MAX_IMAGES = 20;
const imagesOf = (g) => [...(g.artworks ?? []), ...(g.screenshots ?? [])].slice(0, MAX_IMAGES).map((x) => image(x.image_id, 'screenshot_big'));

const trailerOf = (videos = []) => {
  const id = (videos.find((v) => /trailer/i.test(v.name ?? '')) ?? videos[0])?.video_id;
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
};
const hours = (seconds) => (seconds ? Math.max(1, Math.round(seconds / 3600)) : null);
const timeToBeatOf = (t) => {
  const ttb = t && { story: hours(t.hastily), extra: hours(t.normally), complete: hours(t.completely) };
  return ttb && Object.values(ttb).some(Boolean) ? ttb : null;
};
// Ordem dos relacionados: o jogo base e as edições primeiro, depois o resto por ano
const relatedOrder = (g) => (g.kind && !g.kind.startsWith('Edição') ? 1 : 0);

const mapGame = (g, extra = {}) =>
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
    kind: kindOf(g),
    ...extra,
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

  // Consulta Apicalypse num endpoint; se o token expirou antes da hora, renova e tenta de novo
  async function request(endpoint, body, retry = true) {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': getSecret('TWITCH_CLIENT_ID'),
        Authorization: `Bearer ${await getToken(!retry)}`,
        'Content-Type': 'text/plain',
      },
      body,
    });

    if (res.status === 401 && retry) return request(endpoint, body, false);
    if (!res.ok) throw new Error(`IGDB ${endpoint} ${res.status}: ${await res.text()}`);
    return res.json();
  }

  // Listas (busca, populares, relacionados): sem mods/updates; partial = sem os detalhes
  const query = async (body) =>
    (await request('games', body)).filter((g) => !HIDDEN_TYPES.has(g.game_type?.type)).map((g) => mapGame(g, { partial: true }));

  // Detalhes: o jogo + (em paralelo) tempo para zerar e os jogos ligados — 3 consultas, guardadas 24 h no servidor
  async function getById(providerId) {
    const id = Number(providerId);
    const [g] = await request('games', `fields ${DETAIL_FIELDS}; where id = ${id}; limit 1;`);
    if (!g) return null;

    const base = g.version_parent ?? id; // edição → as outras edições do mesmo jogo
    const linked = [...new Set([g.version_parent, ...RELATED_KEYS.flatMap((k) => [].concat(g[k] ?? []))].filter(Boolean))];
    const where = [`version_parent = ${base}`, ...(linked.length ? [`id = (${linked.join(',')})`] : [])].join(' | ');
    const [times, related] = await Promise.all([
      request('game_time_to_beats', `fields game_id,hastily,normally,completely; where game_id = (${[id, base].join(',')}); limit 2;`).catch(() => []),
      query(`fields ${FIELDS}; where (${where}) & id != ${id}; limit 30;`).catch(() => []),
    ]);

    return mapGame(g, {
      partial: false,
      backdrop: backdropOf(g),
      trailer: trailerOf(g.videos),
      images: imagesOf(g),
      timeToBeat: timeToBeatOf(times.find((t) => t.game_id === id) ?? times[0]),
      related: related.sort((a, b) => relatedOrder(a) - relatedOrder(b) || (a.year ?? 9999) - (b.year ?? 9999)),
    });
  }

  return {
    name: 'igdb',

    // Inclui edições e versões (antes ficavam de fora); pede alguns a mais porque mods/updates são descartados
    search: async (text, limit = 30) =>
      (await query(`search "${escape(text)}"; fields ${FIELDS}; limit ${limit + 10};`)).slice(0, limit),

    // Mais avaliados entre os lançados no último ano
    popular: (limit = 20) => {
      const since = Math.floor(Date.now() / 1000) - 365 * 86400;
      return query(
        `fields ${FIELDS}; where first_release_date > ${since} & total_rating_count > 5 & version_parent = null; sort total_rating_count desc; limit ${limit};`,
      );
    },

    getById,
  };
}
