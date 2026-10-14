import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { BASE_OPTIONS, GAMES_PROVIDER } from '../config.js';
import { PROVIDERS } from '../core/providers/index.js';
import { createGamesApi, parseGamesUrl } from '../core/gamesApi.js';

// Só os secrets do provedor ativo são declarados (e exigidos no deploy)
const { create, secrets: secretNames } = PROVIDERS[GAMES_PROVIDER];
const secrets = Object.fromEntries(secretNames.map((name) => [name, defineSecret(name)]));

const api = createGamesApi(create((name) => secrets[name].value()));

// Servida pelo Hosting em /api/games/** (mesmo domínio do site → sem CORS)
export const games = onRequest({ ...BASE_OPTIONS, secrets: Object.values(secrets) }, async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

  const { route, query } = parseGamesUrl(req.originalUrl ?? req.url);
  const { status, body, headers } = await api.handle(route, query);
  res.set(headers).status(status).json(body);
});
