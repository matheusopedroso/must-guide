import { createRawgProvider } from './rawg.js';
import { createIgdbProvider } from './igdb.js';

// Cada provedor declara os secrets de que precisa (o deploy só exige os do ativo)
export const PROVIDERS = {
  rawg: { create: createRawgProvider, secrets: ['RAWG_API_KEY'] },
  igdb: { create: createIgdbProvider, secrets: ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET'] },
};

export function resolveProviderName(value) {
  const name = String(value || 'rawg').toLowerCase();
  if (!PROVIDERS[name]) {
    throw new Error(`GAMES_PROVIDER inválido: "${name}". Use: ${Object.keys(PROVIDERS).join(', ')}`);
  }
  return name;
}
