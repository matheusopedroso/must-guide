// Cliente das APIs do próprio app (/api/**). Em dev quem responde é o Vite; em produção, as functions.
// Cada cliente guarda as respostas da sessão: a mesma consulta não vai à rede duas vezes.
// noCache: respostas que mudam com o uso (ex.: progresso pessoal) não ficam guardadas
export function createApiClient(base) {
  const cache = new Map();

  return async function request(path, { signal, noCache = false } = {}) {
    if (!noCache && cache.has(path)) return cache.get(path);

    const res = await fetch(`${base}${path}`, { signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || `Erro ${res.status}`), { status: res.status });

    if (!noCache) cache.set(path, data);
    return data;
  };
}
