import path from 'node:path';
import { loadEnv } from 'vite';
import { PROVIDERS, resolveProviderName } from '../functions/src/core/providers/index.js';
import { createGamesApi, parseGamesUrl } from '../functions/src/core/gamesApi.js';

// Em dev, o próprio Vite responde /api/games/** com o mesmo código da function.
// As chaves ficam no .env.local SEM o prefixo VITE_ → nunca vão para o navegador.
export function gamesApiPlugin() {
  return {
    name: 'must-guide:games-api',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      const env = {
        ...loadEnv(server.config.mode, path.join(root, 'functions'), ''),
        ...loadEnv(server.config.mode, root, ''),
      };

      const name = resolveProviderName(env.GAMES_PROVIDER);
      const { create, secrets } = PROVIDERS[name];
      const missing = secrets.filter((s) => !env[s]);
      if (missing.length) {
        server.config.logger.warn(`\n[games-api] Faltando no .env.local: ${missing.join(', ')}\n`);
      }

      const api = createGamesApi(create((key) => env[key]));
      server.config.logger.info(`[games-api] provedor: ${name}`);

      server.middlewares.use('/api/games', async (req, res) => {
        const { route, query } = parseGamesUrl(`/api/games${req.url}`);
        const { status, body, headers } = await api.handle(route, query);
        res.writeHead(status, headers).end(JSON.stringify(body));
      });
    },
  };
}
