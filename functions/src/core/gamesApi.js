import { createCache } from './memoryCache.js';
import { createApi, httpError, remember } from './http.js';

// max-age = navegador · s-maxage = CDN do Firebase Hosting
const HOUR = 3600;

// Rotas da API de jogos (/api/games/**). provider = RAWG ou IGDB (mesmo formato de saída): o ativo responde
// popular/busca. others = demais provedores configurados ({ rawg, igdb }): /game/:id usa o do prefixo do id,
// assim guias feitos com um provedor continuam abrindo depois de trocar para o outro.
export function createGamesApi(provider, others = {}) {
  const byName = { ...others, [provider.name]: provider };
  const memory = createCache({ max: 300 });
  const tag = { provider: provider.name };

  return createApi('games', {
    popular: {
      cache: `public, max-age=600, s-maxage=${6 * HOUR}`,
      run: async () => ({ ...tag, games: await remember(memory, 'popular', 6 * HOUR, () => provider.popular()) }),
    },

    search: {
      cache: `public, max-age=300, s-maxage=${HOUR}`,
      async run({ query }) {
        const q = String(query.q ?? '').trim().toLowerCase().slice(0, 80);
        if (q.length < 2) return { ...tag, games: [] };
        return { ...tag, games: await remember(memory, `s:${q}`, HOUR, () => provider.search(q)) };
      },
    },

    game: {
      cache: `public, max-age=${HOUR}, s-maxage=${24 * HOUR}`,
      async run({ id }) {
        const [prefix, providerId] = String(id ?? '').split('-');
        if (!/^\d+$/.test(providerId ?? '')) throw httpError(400, 'ID inválido.');
        const source = byName[prefix];
        if (!source) {
          throw httpError(409, `Este jogo é do ${prefix.toUpperCase()}, mas só o ${provider.name.toUpperCase()} está configurado.`);
        }
        const game = await remember(memory, `g:${id}`, 24 * HOUR, () => source.getById(providerId));
        if (!game) throw httpError(404, 'Jogo não encontrado.');
        return { provider: source.name, game };
      },
    },
  });
}
