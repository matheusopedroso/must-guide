import { describe, expect, it } from 'vitest';
import { isSameGame, matchScore } from '@/utils/text';

describe('comparar nomes de jogos', () => {
  it('escrita japonesa/largura total nunca casa com nome latino', () => {
    for (const jp of ['恋愛0キロメートルV', '恋愛０キロメートルＶ', '五等分の花嫁 ごとぱずストーリー', '放課後シンデレラ２']) {
      expect(matchScore(jp, '007 First Light')).toBe(0);
      expect(matchScore(jp, 'Dispatch')).toBe(0);
      expect(isSameGame(jp, '007 First Light')).toBe(false);
    }
  });

  it('palavras inteiras: "0 v" não casa com "007 first light"; prefixo/contém só por palavra', () => {
    expect(matchScore('Doom', 'Doom: The Dark Ages')).toBe(80);
    expect(matchScore('Split', 'Split Fiction')).toBe(80);
    expect(matchScore('Fiction', 'Split Fiction')).toBe(60);
    expect(matchScore('Spl', 'Split Fiction')).toBeLessThan(60);
    expect(matchScore('007 First Light', '007 First Light')).toBe(100);
  });

  it('mesmo jogo: igual tirando ™ e sufixos de edição; parecido não', () => {
    expect(isSameGame('Split Fiction™', 'Split Fiction')).toBe(true);
    expect(isSameGame("Ghost of Tsushima DIRECTOR'S CUT", 'Ghost of Tsushima')).toBe(true);
    expect(isSameGame('The Last of Us™ Part I', 'The Last of Us Part I')).toBe(true);
    expect(isSameGame('Uncharted 4 PS5', 'Uncharted 4')).toBe(true);
    expect(isSameGame('Ghost of Tsushima', 'Ghost of Yōtei')).toBe(false);
    expect(isSameGame('Doom', 'Doom: The Dark Ages')).toBe(false);
    expect(isSameGame('God of War Ragnarök', 'God of War')).toBe(false);
  });
});
