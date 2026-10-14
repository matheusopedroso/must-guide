import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { BASE_OPTIONS } from '../config.js';
import { createTrophiesApi, TROPHY_SECRETS } from '../core/trophiesApi.js';
import { parseApiUrl } from '../core/http.js';

const secrets = Object.fromEntries(TROPHY_SECRETS.map((name) => [name, defineSecret(name)]));
const api = createTrophiesApi((name) => secrets[name].value());

// Servida pelo Hosting em /api/trophies/**
export const trophies = onRequest({ ...BASE_OPTIONS, secrets: Object.values(secrets) }, async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

  const { route, id, query } = parseApiUrl(req.originalUrl ?? req.url, '/api/trophies');
  const { status, body, headers } = await api.handle(route, { id, query });
  res.set(headers).status(status).json(body);
});
