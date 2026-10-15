import { describe, expect, it } from 'vitest';
import { allPlatforms, filterPsnGames, psnStats } from '@/utils/psnGames';

const g = (id, name, platform, progress, plat, lastPlayed) => ({
  id, name, platform, progress, lastPlayed,
  counts: { platinum: 1, gold: 2, silver: 3, bronze: 10 },
  earned: { platinum: plat ? 1 : 0, gold: 1, silver: 1, bronze: 5 },
});
const games = [
  g('a', 'Astro Bot', 'PS5', 100, true, '2026-10-01'),
  g('b', 'God of War', 'PS4', 64, false, '2026-10-09'),
  g('c', 'Tearaway', 'PS4,PSVITA', 0, false, '2026-01-01'),
  g('d', 'Ghost of Tsushima', 'PS4', 100, true, '2026-05-01'),
];

describe('meus jogos da PSN', () => {
  it('filtra por status, plataforma (cross-buy) e nome', () => {
    expect(filterPsnGames(games, { status: 'platinum' }).map((x) => x.id)).toEqual(['a', 'd']);
    expect(filterPsnGames(games, { status: 'pending' }).map((x) => x.id)).toEqual(['b', 'c']);
    expect(filterPsnGames(games, { status: 'notstarted' }).map((x) => x.id)).toEqual(['c']);
    expect(filterPsnGames(games, { platform: 'PSVITA' }).map((x) => x.id)).toEqual(['c']);
    expect(filterPsnGames(games, { term: 'ghost' }).map((x) => x.id)).toEqual(['d']);
  });

  it('ordena por recente, progresso e nome', () => {
    expect(filterPsnGames(games).map((x) => x.id)).toEqual(['b', 'a', 'd', 'c']);
    expect(filterPsnGames(games, { sort: 'progress' }).map((x) => x.id)).toEqual(['a', 'd', 'b', 'c']);
    expect(filterPsnGames(games, { sort: 'name' }).map((x) => x.id)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('totais e plataformas', () => {
    expect(psnStats(games)).toMatchObject({ games: 4, platinum: 2, complete: 2, average: 66, earned: { platinum: 2, bronze: 20 } });
    expect(allPlatforms(games)).toEqual(['PS5', 'PS4', 'PSVITA']);
  });
});
