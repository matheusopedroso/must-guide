import { createApiClient } from './api';

const request = createApiClient('/api/trophies');

// Jogos com troféus da conta PSN configurada no servidor
export const fetchPsnTitles = (opts) => request('/titles', opts).then((d) => d.titles);

// service = 'trophy' (PS3/PS4/Vita) | 'trophy2' (PS5); sem ele o servidor descobre sozinho
export function fetchTrophyList(npId, service, opts) {
  const qs = service ? `?service=${service}` : '';
  return request(`/list/${encodeURIComponent(npId)}${qs}`, opts).then((d) => d.list);
}

// Progresso da conta no jogo (conquistados, raridade). null = a conta não tem o jogo
export function fetchTrophyProgress(npId, service, opts) {
  const qs = service ? `?service=${service}` : '';
  return request(`/progress/${encodeURIComponent(npId)}${qs}`, { ...opts, noCache: true }).then((d) => d.progress);
}
