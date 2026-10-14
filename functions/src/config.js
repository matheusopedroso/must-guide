import { resolveProviderName } from './core/providers/index.js';

// Lido do functions/.env (disponível no deploy e em execução)
export const GAMES_PROVIDER = resolveProviderName(process.env.GAMES_PROVIDER);

// Mesma região do Firestore (São Paulo); poucas instâncias = custo previsível
export const BASE_OPTIONS = {
  region: 'southamerica-east1',
  maxInstances: 2,
  memory: '256MiB',
  timeoutSeconds: 30,
};
