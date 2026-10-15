import { describe, expect, it } from 'vitest';
import { createDraft, gameSnapshot, isBlankDraft, isPartialSnapshot, normalizeDraft } from '@/utils/guideDraft';
import { dlcGuideId, guideIdOf, parseGuideId } from '@/utils/guideIds';
import { filledPages, pageLabel, toPages } from '@/utils/pages';
import { scopeList, scopeProgress } from '@/utils/trophyScope';
import { trophyCitations } from '@/utils/citations';

const game = { id: 'rawg-1', title: 'Jogo', cover: 'c.jpg', year: 2025, platforms: ['PS5'], summary: 'Resumo', partial: false };

describe('ids dos guias', () => {
  it('guia de DLC = jogo~grupo', () => {
    expect(dlcGuideId('rawg-1', '001')).toBe('rawg-1~001');
    expect(parseGuideId('rawg-1~001')).toEqual({ gameId: 'rawg-1', groupId: '001' });
    expect(parseGuideId('rawg-1')).toEqual({ gameId: 'rawg-1', groupId: null });
    expect(guideIdOf({ gameId: 'rawg-9' })).toBe('rawg-9'); // guias antigos
  });
});

describe('rascunho', () => {
  it('guia novo está em branco; com versão vinculada, não', () => {
    const d = createDraft(game);
    expect(isBlankDraft(d)).toBe(true);
    expect(isBlankDraft({ ...d, versions: [{ id: 'NPWR1_00' }] })).toBe(false);
  });

  it('cópia do jogo: só campos preenchidos e marca os detalhes', () => {
    const snap = gameSnapshot(game);
    expect(snap).toMatchObject({ id: 'rawg-1', title: 'Jogo', summary: 'Resumo' });
    expect(isPartialSnapshot(snap)).toBe(false);
    // jogo da busca (sem resumo) não apaga o resumo guardado
    expect(gameSnapshot({ id: 'rawg-1', title: 'Jogo', summary: '', partial: true }, snap).summary).toBe('Resumo');
    expect(isPartialSnapshot({ id: 'rawg-1', title: 'Jogo' })).toBe(true);
  });

  it('normalizeDraft converte o Guia antigo (seções soltas) numa página', () => {
    const old = { ...createDraft(game), guide: [{ id: 's1', title: 'Intro', body: '<p>a</p>', trophies: [] }] };
    const d = normalizeDraft(old, game);
    expect(d.guide).toHaveLength(1);
    expect(d.guide[0].sections[0].id).toBe('s1');
  });
});

describe('páginas', () => {
  const pages = [
    { id: 'p1', title: 'Introdução', sections: [{ id: 's1', title: 'A', body: '<p>x</p>', trophies: [] }] },
    { id: 'p2', title: '', sections: [{ id: 's2', title: '', body: '', trophies: [] }] }, // vazia
  ];

  it('toPages deixa páginas como estão e embrulha o formato antigo', () => {
    expect(toPages(pages)).toBe(pages);
    expect(toPages([{ id: 's', title: 'x', body: '', trophies: [] }])[0].sections).toHaveLength(1);
  });

  it('filledPages esconde páginas sem conteúdo', () => {
    expect(filledPages({ guide: pages }, 'guide').map((p) => p.id)).toEqual(['p1']);
  });

  it('pageLabel', () => {
    expect(pageLabel(pages[0], 0)).toBe('Página 1: Introdução');
    expect(pageLabel(pages[1], 1)).toBe('Página 2');
  });
});

describe('recorte da lista (jogo base / DLC)', () => {
  const list = {
    name: 'Jogo',
    groups: [{ id: 'default', name: 'Jogo' }, { id: '001', name: 'DLC', icon: 'i.png' }],
    trophies: [{ id: 0, groupId: 'default' }, { id: 1, groupId: 'default' }, { id: 10, groupId: '001' }],
  };

  it('guia do jogo fica com o grupo base; guia da DLC com o grupo dela', () => {
    expect(scopeList(list, {}).trophies.map((t) => t.id)).toEqual([0, 1]);
    const dlc = scopeList(list, { dlc: { groupId: '001' } });
    expect(dlc.trophies.map((t) => t.id)).toEqual([10]);
    expect(dlc.name).toBe('DLC');
  });

  it('progresso conta só os troféus do recorte', () => {
    const scoped = scopeList(list, {});
    const p = scopeProgress({ trophies: { 0: { earned: true }, 10: { earned: true } } }, scoped);
    expect(p).toMatchObject({ earned: 1, total: 2 });
  });
});

describe('onde o troféu aparece no guia', () => {
  it('acha as seções que citam no texto ou têm na lista', () => {
    const guide = {
      tabs: ['roadmap'],
      guide: [
        { id: 'p1', title: 'Intro', sections: [{ id: 's1', title: 'A', body: '<p>x</p>', trophies: [] }] },
        { id: 'p2', title: 'Cap', sections: [{ id: 's2', title: 'B', body: '<a data-trophy="5">T</a>', trophies: [] }] },
      ],
      roadmap: [{ id: 'r1', title: 'História', body: '<p>y</p>', trophies: [5] }],
    };
    const found = trophyCitations(guide, 5);
    expect(found.map((c) => [c.id, c.inText])).toEqual([['s2', true], ['r1', false]]);
    expect(found[0].query).toEqual({ aba: 'guia', pagina: '2' });
  });
});
