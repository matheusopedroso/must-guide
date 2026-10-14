import { createApiClient } from './api';

const request = createApiClient('/api/trophies');

// Jogos com troféus da conta PSN configurada no servidor
export const fetchPsnTitles = (opts) => request('/titles', opts).then((d) => d.titles);

// service = 'trophy' (PS3/PS4/Vita) | 'trophy2' (PS5); sem ele o servidor descobre sozinho
export function fetchTrophyList(npId, service, opts) {
  const qs = service ? `?service=${service}` : '';
  return request(`/list/${encodeURIComponent(npId)}${qs}`, opts).then((d) => d.list);
}
