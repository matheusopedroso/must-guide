// Comparar nomes de jogos (compartilhado: o app importa daqui por src/utils/text.js; a API usa na busca de listas)

// Normaliza: sem acento, ™/®, pontuação e caixa
export const normalizeName = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[™®©]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Pontua o quanto `name` combina com `term` (0 = nada; 100 = igual)
export function matchScore(name, term) {
  const a = normalizeName(name);
  const b = normalizeName(term);
  if (!b) return 0;
  if (a === b) return 100;
  if (a.startsWith(b) || b.startsWith(a)) return 80;
  if (a.includes(b) || b.includes(a)) return 60;

  const words = new Set(a.split(' '));
  const terms = b.split(' ');
  return Math.round((terms.filter((w) => words.has(w)).length / terms.length) * 50);
}
