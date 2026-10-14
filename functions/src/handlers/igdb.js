import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { BASE_OPTIONS, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '../config.js';
import { assertAdmin } from '../auth.js';
import { getGameById, searchGames } from '../igdb/games.js';

// Uma única callable com "action" → menos functions para manter e fazer deploy
const actions = {
  async search({ query }) {
    const q = String(query ?? '').trim().slice(0, 80);
    if (q.length < 2) return { games: [] };
    return { games: await searchGames(q) };
  },
  async game({ id }) {
    if (!/^\d+$/.test(String(id))) throw new HttpsError('invalid-argument', 'ID inválido.');
    return { game: await getGameById(id) };
  },
};

export const igdb = onCall(
  { ...BASE_OPTIONS, secrets: [TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET] },
  async (request) => {
    assertAdmin(request.auth);

    const run = actions[request.data?.action];
    if (!run) throw new HttpsError('invalid-argument', 'Ação desconhecida.');

    try {
      return await run(request.data);
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      logger.error('[igdb]', e);
      throw new HttpsError('unavailable', 'Falha ao consultar o IGDB.');
    }
  },
);
