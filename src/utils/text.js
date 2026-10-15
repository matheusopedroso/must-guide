// normalizeName e matchScore moram no código compartilhado com a API (busca automática de listas de troféus)
import { matchScore, normalizeName } from '../../functions/src/core/text.js';

export { matchScore, normalizeName };

// Ordena pela pontuação (mantendo a ordem original no empate) e descarta o que não combina
export function rankByName(items, term, getName, min = 20) {
  return items
    .map((item, i) => ({ item, i, score: matchScore(getName(item), term) }))
    .filter((x) => x.score >= min)
    .sort((x, y) => y.score - x.score || x.i - y.i)
    .map((x) => x.item);
}
