// Utilitários HTTP compartilhados pelas APIs (rodam no Vite em dev e nas functions)

export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export function json(status, body, headers = {}) {
  return { status, body, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } };
}

// "/api/trophies/list/NPWR1_00?x=1" com base "/api/trophies" → { route: 'list', id: 'NPWR1_00', query: { x: '1' } }
export function parseApiUrl(rawUrl, base) {
  const url = new URL(rawUrl, 'http://local');
  const parts = url.pathname.slice(base.length).split('/').filter(Boolean).map(decodeURIComponent);
  return { route: parts[0] ?? '', id: parts[1] ?? null, query: Object.fromEntries(url.searchParams) };
}

// Monta uma API a partir de rotas { nome: { cache: 'Cache-Control', private?: true, run(args) } }
// handle(rota, args) → { status, body, headers }. Erros com .status viram resposta; o resto, 502.
// authorize(headers): checa as rotas `private` (lança httpError 401/403). Sem ele (dev), ficam abertas.
export function createApi(name, routes, { authorize } = {}) {
  return {
    async handle(route, args = {}) {
      const def = routes[route];
      if (!def) return json(404, { error: 'Rota não encontrada.' });

      try {
        if (def.private && authorize) await authorize(args.headers ?? {});
        const body = await def.run(args);
        return json(200, body, def.cache ? { 'Cache-Control': def.cache } : {});
      } catch (e) {
        if (e.status) return json(e.status, { error: e.message });
        console.error(`[${name}:${route}]`, e);
        return json(502, { error: 'Falha ao consultar o serviço externo.' });
      }
    },
  };
}

// Lê do cache em memória ou carrega e guarda
export async function remember(cache, key, ttlSeconds, load) {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  return cache.set(key, await load(), ttlSeconds * 1000);
}
