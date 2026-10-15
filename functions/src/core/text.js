// Comparar nomes de jogos (compartilhado: o app importa daqui por src/utils/text.js; a API usa na busca de listas)

// Normaliza: sem acento, ™/®, pontuação e caixa
export const normalizeName = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[™®©]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '') // Director's → directors
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Escrita japonesa/chinesa/coreana ou caracteres de largura total ("０Ｖ"): um nome assim nunca é o mesmo jogo de um
// termo escrito só com letras latinas (a normalização apagaria quase tudo e sobraria "0 v")
const NON_LATIN = /[぀-ヿ㐀-鿿가-힯＀-￯]/;
export const hasNonLatin = (s = '') => NON_LATIN.test(s);

// Pontua o quanto `name` combina com `term` (0 = nada; 100 = igual). Sempre por palavras inteiras:
// 80 = um começa com o outro ("God of War" ⊂ "God of War Ragnarök"), 60 = um contém o outro, até 50 = palavras em comum
export function matchScore(name, term) {
  if (hasNonLatin(name) !== hasNonLatin(term)) return 0;
  const a = normalizeName(name);
  const b = normalizeName(term);
  if (!a || !b) return 0;
  if (a === b) return 100;
  const [wa, wb] = [` ${a} `, ` ${b} `];
  if (wa.startsWith(` ${b} `) || wb.startsWith(` ${a} `)) return 80;
  if (wa.includes(` ${b} `) || wb.includes(` ${a} `)) return 60;

  const words = new Set(a.split(' '));
  const terms = b.split(' ');
  return Math.round((terms.filter((w) => words.has(w)).length / terms.length) * 50);
}

// Sufixos de edição que não mudam o jogo (a lista de troféus costuma ser a mesma ou a versão da outra plataforma)
const EDITION = /\s(ps4|ps5|ps vr2?|playstation 4|playstation 5|remastered|remaster|directors cut|deluxe edition|complete edition|definitive edition|game of the year edition|goty edition|goty|edition|trophies|trophy set)$/;
const stripEdition = (s) => {
  let prev;
  do {
    prev = s;
    s = s.replace(EDITION, '');
  } while (s !== prev);
  return s;
};

// É o mesmo jogo? Nome igual depois de normalizar e tirar sufixos de edição.
// Usado para escolher a lista sozinho (página do jogo); a lista para escolher à mão usa matchScore.
export function isSameGame(name, term) {
  if (hasNonLatin(name) !== hasNonLatin(term)) return false;
  const a = stripEdition(normalizeName(name));
  const b = stripEdition(normalizeName(term));
  return !!a && a === b;
}
