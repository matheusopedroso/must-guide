import { createApiClient } from './api';

const request = createApiClient('/api/trophies');

// Jogos com troféus da conta PSN configurada no servidor (rota privada: só o admin, em produção)
export const fetchPsnTitles = (opts) => request('/titles', { ...opts, auth: true }).then((d) => d.titles);

// service = 'trophy' (PS3/PS4/Vita) | 'trophy2' (PS5); sem ele o servidor descobre sozinho
// Versão do formato da lista (igual a TROPHY_LIST_VERSION do servidor): muda a URL → caches antigos são ignorados
const LIST_VERSION = 2;

export function fetchTrophyList(npId, service, opts) {
  const qs = new URLSearchParams({ v: LIST_VERSION, ...(service && { service }) });
  return request(`/list/${encodeURIComponent(npId)}?${qs}`, opts).then((d) => d.list);
}

// Progresso da conta no jogo (conquistados, raridade). null = a conta não tem o jogo. Rota privada.
export function fetchTrophyProgress(npId, service, opts) {
  const qs = service ? `?service=${service}` : '';
  return request(`/progress/${encodeURIComponent(npId)}${qs}`, { ...opts, noCache: true, auth: true }).then((d) => d.progress);
}
