import { createCache } from './memoryCache.js';
import { createApi, httpError, remember } from './http.js';
import { createPsnClient } from './psn/client.js';
import { createTrophyService, searchTitles } from './psn/trophies.js';

const HOUR = 3600;

export const TROPHY_SECRETS = ['PSN_NPSSO'];

// Perfis públicos com acervos enormes (caçadores de troféus): a PSN só mostra o código de uma lista (NPWR) para
// quem já jogou, então a busca automática procura nos jogos deles. Troque em PSN_REFERENCE_PLAYERS (.env.local,
// IDs separados por vírgula). Perfil que não existir ou estiver privado é ignorado.
export const DEFAULT_REFERENCE_PLAYERS = ['Hakoom', 'dav1d123', 'ikemenzi'];
export const parseReferencePlayers = (value) =>
  value ? String(value).split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_REFERENCE_PLAYERS;

// Versão do formato da lista. Aumente quando mudar o que a lista traz (ex.: v2 = nameEn):
// o cache em memória e os caches HTTP (navegador/CDN, via ?v= do app) deixam de usar respostas antigas.
export const TROPHY_LIST_VERSION = 3; // v3 = target e reward

const parseService = (value) => (['trophy', 'trophy2'].includes(value) ? value : null);

// Rotas da API de troféus (/api/trophies/**). As pessoais (conta do PSN_NPSSO) são `private`:
// em produção só o admin logado acessa (options.authorize, ver handlers/trophies.js).
export function createTrophiesApi(getSecret, options = {}) {
  const trophies = createTrophyService(createPsnClient(getSecret));
  const memory = createCache({ max: 100 });
  const references = parseReferencePlayers(options.referencePlayers);

  // Acervos da busca automática (24 h em memória: um perfil grande são ~20 chamadas na 1ª busca)
  const searchSources = () =>
    Promise.all([
      remember(memory, 'all:me', 10 * 60, () => trophies.allTitlesOf('me'))
        .then((titles) => ({ name: 'Sua conta', titles }))
        .catch(() => ({ name: 'Sua conta', titles: [] })),
      ...references.map((id) =>
        remember(memory, `ref:${id.toLowerCase()}`, 24 * HOUR, () => trophies.playerAllTitles(id))
          .then((titles) => ({ name: id, titles }))
          .catch((e) => {
            console.warn(`[trophies:find] Perfil de referência ${id} indisponível: ${e.message}`);
            return { name: id, titles: [] };
          }),
      ),
    ]);

  return createApi('trophies', {
    // Lista pessoal (jogos da conta) → sem cache na CDN
    titles: {
      private: true,
      cache: 'private, max-age=300',
      run: async () => ({ titles: await remember(memory, 'titles', 10 * 60, trophies.userTitles) }),
    },

    // Jogos de outro perfil (ID da PSN): para vincular jogos que a conta ainda não tem. Usa a conta do
    // NPSSO para consultar → também privada (só o admin)
    player: {
      private: true,
      cache: 'private, max-age=600',
      async run({ id }) {
        const onlineId = String(id ?? '').trim();
        return remember(memory, `u:${onlineId.toLowerCase()}`, 10 * 60, () => trophies.playerTitles(onlineId));
      },
    },

    // Busca automática de listas pelo nome do jogo: sua conta + perfis de referência (ver DEFAULT_REFERENCE_PLAYERS).
    // ?q=nome&platform=PS5 → { results: [{ id, name, platform, service, icon, counts, score, sources }] }
    find: {
      private: true,
      cache: 'private, max-age=600',
      async run({ query }) {
        const term = String(query.q ?? '').trim().slice(0, 100);
        if (term.length < 2) throw httpError(400, 'Digite o nome do jogo.');
        return { results: searchTitles(await searchSources(), term, { platform: String(query.platform ?? '') }) };
      },
    },

    // Progresso pessoal num jogo (conquistados + raridade) → curto e sem CDN
    progress: {
      private: true,
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
  }, options);
}
