import { createCache } from './memoryCache.js';
import { createApi, remember } from './http.js';
import { createPsnClient } from './psn/client.js';
import { createTrophyService } from './psn/trophies.js';

const HOUR = 3600;

export const TROPHY_SECRETS = ['PSN_NPSSO'];

// Versão do formato da lista. Aumente quando mudar o que a lista traz (ex.: v2 = nameEn):
// o cache em memória e os caches HTTP (navegador/CDN, via ?v= do app) deixam de usar respostas antigas.
export const TROPHY_LIST_VERSION = 2;

const parseService = (value) => (['trophy', 'trophy2'].includes(value) ? value : null);

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

    // Progresso pessoal num jogo (conquistados + raridade) → curto e sem CDN
    progress: {
      cache: 'private, max-age=60',
      async run({ id, query }) {
        const npId = String(id ?? '').toUpperCase();
        const service = parseService(query.service);
        return { progress: await remember(memory, `p:${npId}`, 5 * 60, () => trophies.userProgress(npId, service)) };
      },
    },

    // Lista de troféus de um jogo: muda raramente → cache longo
    list: {
      cache: `public, max-age=${HOUR}, s-maxage=${24 * HOUR}`,
      async run({ id, query }) {
        const npId = String(id ?? '').toUpperCase();
        const service = parseService(query.service);
        const key = `l${TROPHY_LIST_VERSION}:${npId}`;
        return { list: await remember(memory, key, 24 * HOUR, () => trophies.trophyList(npId, service)) };
      },
    },
  });
}
