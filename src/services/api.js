import { getIdToken } from '@/services/firebase/auth';

// Cliente das APIs do próprio app (/api/**). Em dev quem responde é o Vite; em produção, as functions.
// Cada cliente guarda as respostas da sessão: a mesma consulta não vai à rede duas vezes.
// noCache: respostas que mudam com o uso (ex.: progresso pessoal) não ficam guardadas.
// auth: manda o token do Firebase (rotas privadas). Sem login, vai sem e o servidor decide.
export function createApiClient(base) {
  const cache = new Map();

  return async function request(path, { signal, noCache = false, auth = false } = {}) {
    if (!noCache && cache.has(path)) return cache.get(path);

    const token = auth ? await getIdToken() : null;
    const res = await fetch(`${base}${path}`, { signal, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || `Erro ${res.status}`), { status: res.status });

    if (!noCache) cache.set(path, data);
    return data;
  };
}
