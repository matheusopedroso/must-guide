import { createApiClient } from './api';
import { matchScore } from '@/utils/text';

const request = createApiClient('/api/trophies');

// Jogos com troféus da conta PSN configurada no servidor (rota privada: só o admin, em produção)
export const fetchPsnTitles = (opts) => request('/titles', { ...opts, auth: true }).then((d) => d.titles);

// service = 'trophy' (PS3/PS4/Vita) | 'trophy2' (PS5); sem ele o servidor descobre sozinho
// Versão do formato da lista (igual a TROPHY_LIST_VERSION do servidor): muda a URL → caches antigos são ignorados
export const LIST_VERSION = 3;

export function fetchTrophyList(npId, service, opts) {
  const qs = new URLSearchParams({ v: LIST_VERSION, ...(service && { service }) });
  return request(`/list/${encodeURIComponent(npId)}?${qs}`, opts).then((d) => d.list);
}

// Progresso da conta no jogo (conquistados, raridade). null = a conta não tem o jogo. Rota privada.
export function fetchTrophyProgress(npId, service, opts) {
  const qs = service ? `?service=${service}` : '';
  return request(`/progress/${encodeURIComponent(npId)}${qs}`, { ...opts, noCache: true, auth: true }).then((d) => d.progress);
}

// Busca automática da lista pelo nome do jogo (sua conta + perfis de referência do servidor). Rota privada.
// → [{ id, name, platform, service, icon, counts, score, sources: ['Sua conta' | ID da PSN] }]
// FIND_VERSION muda a URL quando a regra da busca muda (o navegador guarda a resposta por 10 min).
// Confere de novo aqui com a mesma regra (matchScore): resposta antiga guardada não traz lista errada.
const FIND_VERSION = 3;
export function findTrophyLists(title, platform = '', opts) {
  const qs = new URLSearchParams({ q: title, v: FIND_VERSION, ...(platform && { platform }) });
  return request(`/find?${qs}`, { ...opts, auth: true }).then((d) =>
    d.results.map((r) => ({ ...r, score: matchScore(r.name, title) })).filter((r) => r.score >= 60),
  );
}

// Jogos de outra pessoa pelo ID da PSN → { player: { onlineId, avatar }, titles }. Serve para vincular jogos que a
// conta do servidor ainda não tem (a PSN só mostra o código da lista para quem já jogou). Rota privada.
export const fetchPsnPlayerTitles = (onlineId, opts) => request(`/player/${encodeURIComponent(onlineId)}`, { ...opts, auth: true });
