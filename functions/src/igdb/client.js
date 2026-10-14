import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '../config.js';

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const API_URL = 'https://api.igdb.com/v4';

// Token do Twitch dura ~60 dias: fica em memória enquanto a instância viver
let cached = { token: null, expiresAt: 0 };

async function getToken(force = false) {
  if (!force && cached.token && Date.now() < cached.expiresAt) return cached.token;

  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID.value(),
    client_secret: TWITCH_CLIENT_SECRET.value(),
    grant_type: 'client_credentials',
  });
  const res = await fetch(`${TOKEN_URL}?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Twitch token ${res.status}`);

  const { access_token, expires_in } = await res.json();
  cached = { token: access_token, expiresAt: Date.now() + (expires_in - 300) * 1000 };
  return access_token;
}

// Consulta Apicalypse; se o token expirou antes da hora, renova e tenta de novo
export async function igdbQuery(endpoint, body, retry = true) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID.value(),
      Authorization: `Bearer ${await getToken(!retry)}`,
      'Content-Type': 'text/plain',
    },
    body,
  });

  if (res.status === 401 && retry) return igdbQuery(endpoint, body, false);
  if (!res.ok) throw new Error(`IGDB ${endpoint} ${res.status}: ${await res.text()}`);
  return res.json();
}
