import { describe, expect, it } from 'vitest';
import { buildSearchIndex, fold, searchGuide } from '@/utils/guideSearch';

const guide = {
  tabs: ['roadmap', 'coletaveis'],
  guide: [{ id: 'p1', title: 'Capítulo 2', sections: [{ id: 's1', title: 'Os seis', body: '<p>Derrote o <b>Oni</b> perto da ponte.</p>', trophies: [] }] }],
  roadmap: [{ id: 'r1', title: 'Limpeza', body: '<p>Pegue os santuários.</p>', trophies: [] }],
  collectibles: [{ id: 'c1', title: 'Floresta', body: '', trophies: [], items: [{ id: 'i1', name: 'Haiku do lago', type: 'Haiku', location: 'Ponte velha', description: '' }] }],
};
const trophies = [{ id: 2, type: 'gold', name: 'Mestre da lâmina', nameEn: 'Blade Master', detail: 'Vença sem tomar dano.' }];
const getNote = (id) => (id === 2 ? { tip: '<p>Use a <b>ponte</b> para fugir.</p>' } : {});
const index = buildSearchIndex({ guide, trophies, getNote });

describe('busca no guia', () => {
  it('fold tira acento e maiúscula sem mudar o tamanho', () => {
    expect(fold('Lâmina ÉPICA')).toBe('lamina epica');
    expect(fold('Lâmina').length).toBe('Lâmina'.length);
  });

  it('acha em seções (com página), troféus (dica) e coletáveis', () => {
    const r = searchGuide(index, 'ponte');
    expect(r.map((x) => x.kind).sort()).toEqual(['collectible', 'section', 'trophy']);
    const section = r.find((x) => x.kind === 'section');
    expect(section.where).toBe('Guia · Capítulo 2');
    expect(section.target).toEqual({ query: { aba: 'guia' }, hash: '#secao-s1' });
    expect(section.snippet.match).toBe('ponte');
  });

  it('título que começa com o termo vem primeiro; sem acento acha com acento', () => {
    const r = searchGuide(index, 'lamina');
    expect(r[0]).toMatchObject({ kind: 'trophy', id: 2 });
    expect(r[0].titleHit.match).toBe('lâmina');
    expect(searchGuide(index, 'blade')[0].id).toBe(2); // nome em inglês
  });

  it('trecho começa e termina em palavra inteira', () => {
    const long = buildSearchIndex({ guide: { guide: [{ id: 'p', title: '', sections: [{ id: 'x', title: 'A', body: `<p>${'palavra '.repeat(20)}ponte ${'outra '.repeat(30)}</p>`, trophies: [] }] }] } });
    const { snippet } = searchGuide(long, 'ponte')[0];
    expect(snippet.before).toMatch(/^…palavra /);
    expect(snippet.after).toMatch(/ outra…$/);
  });

  it('termo curto não busca', () => {
    expect(searchGuide(index, 'a')).toEqual([]);
  });
});
