import { createCache } from './memoryCache.js';
import { createApi, remember } from './http.js';
import { createPsnClient } from './psn/client.js';
import { createTrophyService } from './psn/trophies.js';

const HOUR = 3600;

export const TROPHY_SECRETS = ['PSN_NPSSO'];

// Rotas da API de troféus (/api/trophies/**)
export function createTrophiesApi(getSecret) {
  const trophies = createTrophyService(createPsnClient(getSecret));
  const memory = createCache({ max: 100 });

  return createApi('trophies', {
    // Lista pessoal (jogos da conta) → sem cache na CDN
    titles: {
      cache: 'private, max-age=300',
      run: async () => ({ titles: await remember(memory, 'titles', 10 * 60, trophies.userTitles) }),
    },

    // Lista de troféus de um jogo: muda raramente → cache longo
    list: {
      cache: `public, max-age=${HOUR}, s-maxage=${24 * HOUR}`,
      async run({ id, query }) {
        const npId = String(id ?? '').toUpperCase();
        const service = ['trophy', 'trophy2'].includes(query.service) ? query.service : null;
        return { list: await remember(memory, `l:${npId}`, 24 * HOUR, () => trophies.trophyList(npId, service)) };
      },
    },
  });
}
