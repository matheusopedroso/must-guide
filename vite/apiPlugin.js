import path from 'node:path';
import { loadEnv } from 'vite';
import { PROVIDERS, resolveProviderName } from '../functions/src/core/providers/index.js';
import { createGamesApi } from '../functions/src/core/gamesApi.js';
import { createTrophiesApi, TROPHY_SECRETS } from '../functions/src/core/trophiesApi.js';
import { parseApiUrl } from '../functions/src/core/http.js';

// Em dev, o próprio Vite responde /api/** com o mesmo código das functions.
// As chaves ficam no .env.local SEM o prefixo VITE_ → nunca vão para o navegador.
export function apiPlugin() {
  return {
    name: 'must-guide:api',
    apply: 'serve',
    configureServer(server) {
      const { root, mode, logger } = server.config;
      const env = {
        ...loadEnv(mode, path.join(root, 'functions'), ''),
        ...loadEnv(mode, root, ''),
      };
      const getSecret = (key) => env[key];

      const provider = resolveProviderName(env.GAMES_PROVIDER);
      const { create, secrets: gameSecrets } = PROVIDERS[provider];

      const missing = [...gameSecrets, ...TROPHY_SECRETS].filter((s) => !env[s]);
      if (missing.length) logger.warn(`\n[api] Faltando no .env.local: ${missing.join(', ')}\n`);
      logger.info(`[api] jogos: ${provider} · troféus: psn`);

      const apis = {
        '/api/games': createGamesApi(create(getSecret)),
        '/api/trophies': createTrophiesApi(getSecret),
      };

      for (const [base, api] of Object.entries(apis)) {
        server.middlewares.use(base, async (req, res) => {
          const { route, id, query } = parseApiUrl(`${base}${req.url}`, base);
          const { status, body, headers } = await api.handle(route, { id, query });
          res.writeHead(status, headers).end(JSON.stringify(body));
        });
      }
    },
  };
}
