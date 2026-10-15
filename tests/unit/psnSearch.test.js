import { describe, expect, it } from 'vitest';
import { searchTitles } from '../../functions/src/core/psn/trophies.js';
import { parseReferencePlayers } from '../../functions/src/core/trophiesApi.js';

const t = (id, name, platform) => ({ id, name, platform, service: 'trophy2', icon: null, counts: {}, progress: 10 });

describe('busca automática de listas', () => {
  const sources = [
    { name: 'Sua conta', titles: [t('NPWR1_00', 'Ghost of Tsushima', 'PS4')] },
    { name: 'Hakoom', titles: [t('NPWR2_00', 'Split Fiction™', 'PS5'), t('NPWR3_00', 'Split Fiction', 'PS4'), t('NPWR1_00', 'Ghost of Tsushima', 'PS4')] },
    { name: 'dav1d123', titles: [t('NPWR2_00', 'Split Fiction™', 'PS5')] },
  ];

  it('acha pelo nome sem ™/acentos, junta as fontes e não repete o NPWR', () => {
    const r = searchTitles(sources, 'split fiction');
    expect(r.map((x) => x.id)).toEqual(['NPWR2_00', 'NPWR3_00']);
    expect(r[0].sources).toEqual(['Hakoom', 'dav1d123']);
    expect(r[0].progress).toBeUndefined(); // progresso de outra pessoa não vale para você
  });

  it('nome que some na normalização (japonês) não casa com tudo', () => {
    const jp = [{ name: 'Hakoom', titles: [t('NPWR9_00', '五等分の花嫁 ごとぱずストーリー', 'PS4'), t('NPWR8_00', 'Dispatch', 'PS5')] }];
    expect(searchTitles(jp, 'Dispatch').map((x) => x.id)).toEqual(['NPWR8_00']);
  });

  it('plataforma pedida desempata; nome que não combina fica de fora', () => {
    expect(searchTitles(sources, 'Split Fiction', { platform: 'PS4' })[0].id).toBe('NPWR3_00');
    expect(searchTitles(sources, 'Ghost of Yotei')).toEqual([]);
  });

  it('perfis de referência: padrão ou lista do .env', () => {
    expect(parseReferencePlayers('')).toContain('Hakoom');
    expect(parseReferencePlayers(' a , b,,c ')).toEqual(['a', 'b', 'c']);
  });
});
