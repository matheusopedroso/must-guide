import { describe, expect, it } from 'vitest';
import { collectibleTag, collectiblesOf, creditsOf, groupCollectibles, groupOf, matchesFilter, summarizeByType } from '@/utils/collectibles';

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

  it('mesmo lugar do anterior: junta no cartão de cima, sem passar de região', () => {
    const list = [item('p', 'A'), item('q', 'A', { samePlace: true }), item('r', 'B', { samePlace: true }), item('s', 'A')];
    expect(groupCollectibles(list).map((g) => g.map((i) => i.id))).toEqual([['p', 'q', 'r'], ['s']]);
    expect(groupCollectibles([item('z', 'A', { samePlace: true })]).map((g) => g.length)).toEqual([1]); // 1º nunca segue

    const g2 = { collectibles: [{ id: 'r1', title: 'X', items: [item('a', 'T')] }, { id: 'r2', title: 'Y', items: [item('b', 'T', { samePlace: true }), item('c', 'T', { samePlace: true })] }] };
    expect(groupOf(collectiblesOf(g2), 'c').map((i) => i.id)).toEqual(['b', 'c']);
  });
});

describe('colar lista de coletáveis', () => {
  it('tipo, número do PowerPyx, marcadores e mesmo lugar', async () => {
    const { parseCollectibleLines } = await import('@/utils/collectibles');
    const text = `Artifact #1: Military Pamphlet + Artifact #2: Boston Q.Z. Map
- Firefly Pendant #4: Joseph Lenz

2. Shiv Door
Optional Conversation #6`;
    expect(parseCollectibleLines(text, 'Artefato')).toEqual([
      { name: 'Military Pamphlet', type: 'Artifact', samePlace: false },
      { name: 'Boston Q.Z. Map', type: 'Artifact', samePlace: true },
      { name: 'Joseph Lenz', type: 'Firefly Pendant', samePlace: false },
      { name: 'Shiv Door', type: 'Artefato', samePlace: false },
      { name: 'Optional Conversation #6', type: 'Artefato', samePlace: false },
    ]);
  });
});

describe('tipo ↔ troféu e pontos do mapa', () => {
  it('liga tipos a troféus e monta o rótulo do ponto', async () => {
    const { pinLabel, typeTrophyId, typesOfTrophy } = await import('@/utils/collectibles');
    const types = { Artefato: { trophy: 5 }, Pingente: { trophy: 7 }, Quadrinho: { trophy: 5 } };
    expect(typeTrophyId(types, 'Pingente')).toBe(7);
    expect(typeTrophyId(types, 'Outro')).toBeNull();
    expect(typesOfTrophy(types, 5)).toEqual(['Artefato', 'Quadrinho']);
    expect(pinLabel({ type: 'artefato', n: 3 })).toBe('A3');
    expect(pinLabel({ type: '', n: 2 })).toBe('2');
    expect(pinLabel({ type: 'Joke' })).toBe('J');
    expect(pinLabel({})).toBe('•');
  });
});
