import { describe, expect, it } from 'vitest';
import { collectibleTag, collectiblesOf, creditsOf, matchesFilter, summarizeByType } from '@/utils/collectibles';

const item = (id, type, extra = {}) => ({ id, name: id, type, ...extra });
const guide = {
  credits: [{ id: 'c', name: 'PowerPyx', url: 'powerpyx.com', role: 'Rota' }],
  collectibles: [
    { id: 'r1', title: ' Floresta ', items: [item('a', 'Artefato'), item('b', 'Pingente', { missable: true }), item('x', 'Artefato', { uncounted: true })] },
    { id: 'r2', title: 'Vila', items: [item('c', 'Artefato', { credit: { name: 'powerpyx' } }), item('d', 'Pingente', { credit: { name: ' Ana ', url: 'ana.dev' } })] },
  ],
};

describe('coletáveis', () => {
  const all = collectiblesOf(guide);
  const byId = Object.fromEntries(all.map((i) => [i.id, i]));

  it('numera por tipo no guia todo; o que não conta fica sem número', () => {
    expect(byId.a).toMatchObject({ region: 'Floresta', n: 1, of: 2 });
    expect(byId.c).toMatchObject({ n: 2, of: 2 });
    expect(byId.d).toMatchObject({ n: 2, of: 2 });
    expect(byId.x.n).toBeUndefined();
    expect(collectibleTag(byId.c)).toBe('Artefato #2');
    expect(collectibleTag(byId.x)).toBe('Artefato');
  });

  it('resumo por tipo e filtros', () => {
    expect(summarizeByType(all, (id) => id === 'a')).toEqual([
      { type: 'Artefato', total: 2, done: 1 },
      { type: 'Pingente', total: 2, done: 0 },
    ]);
    expect(all.filter((i) => matchesFilter(i, 'type:Artefato')).map((i) => i.id)).toEqual(['a', 'c']);
    expect(all.filter((i) => matchesFilter(i, 'missable')).map((i) => i.id)).toEqual(['b']);
  });

  it('créditos: os do guia + nomes novos dos coletáveis, sem repetir', () => {
    expect(creditsOf(guide)).toEqual([
      { id: 'c', name: 'PowerPyx', url: 'https://powerpyx.com/', role: 'Rota' },
      { id: 'item-d', name: 'Ana', url: 'https://ana.dev/', role: 'Imagens/vídeos dos coletáveis' },
    ]);
  });
});
