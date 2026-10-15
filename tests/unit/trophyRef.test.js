import { describe, expect, it } from 'vitest';
import { autoLinkTrophies, controllerKeyHtml, counterHtml, extractTrophyRefs, promoteLoneTrophyRefs, trophyCardHtml, trophyRefHtml } from '@/utils/trophyRef';
import { CONTROLLER_KEY_MAP } from '@/config/controllerKeys';

const trophies = [
  { id: 1, type: 'gold', name: 'Mestre da lâmina', nameEn: 'Blade Master' },
  { id: 2, type: 'silver', name: 'Haiku', nameEn: 'Haiku' },
  { id: 3, type: 'bronze', name: 'Big Earner', nameEn: '' },
  { id: 4, type: 'bronze', name: 'Earner', nameEn: '' },
];

describe('citações de troféus', () => {
  it('extractTrophyRefs acha chips, contadores e cartões, sem repetir', () => {
    const html = `<p>${trophyRefHtml(trophies[0])} ${counterHtml({ done: 1, total: 5, label: 'x', trophy: trophies[1] })}</p>${trophyCardHtml(trophies[0])}${trophyCardHtml(trophies[2])}`;
    expect([...extractTrophyRefs(html)].sort()).toEqual([1, 2, 3]);
  });

  it('contador sem troféu é só a etiqueta', () => {
    expect(counterHtml({ done: 5, total: 6, label: 'Associados' })).toBe('<span class="count-tag" contenteditable="false"><b>5/6</b> Associados</span>');
  });

  it('botão de controle guarda a posição genérica', () => {
    const html = controllerKeyHtml(CONTROLLER_KEY_MAP['face-down']);
    expect(html).toContain('data-key="face-down"');
    expect(html).toContain('title="Cruz / A"');
  });
});

describe('autoLinkTrophies (varinha)', () => {
  it('linka nomes em PT e EN, o mais longo primeiro, mantendo o texto', () => {
    const { html, count } = autoLinkTrophies('<p>Pegue Blade Master e Big Earner.</p>', trophies);
    expect(count).toBe(2);
    expect(html).toContain('data-trophy="1"');
    expect(html).toContain('>Blade Master</a>');
    expect(html).toContain('data-trophy="3"'); // "Big Earner", não "Earner"
    expect(html).not.toContain('data-trophy="4"');
  });

  it('não mexe dentro de links, cartões, contadores e botões', () => {
    const src = `<p><a href="https://x.com">Haiku</a></p>${trophyCardHtml(trophies[1])}<p>${counterHtml({ done: 1, label: 'Haiku' })}</p>`;
    expect(autoLinkTrophies(src, trophies).count).toBe(0);
  });

  it('respeita exclude (o próprio troféu)', () => {
    expect(autoLinkTrophies('<p>Haiku</p>', trophies, { exclude: 2 }).count).toBe(0);
  });
});

describe('promoteLoneTrophyRefs', () => {
  it('troféu sozinho na linha vira cartão; no meio da frase continua chip', () => {
    const root = document.createElement('div');
    root.innerHTML = `<p>${trophyRefHtml(trophies[0])}&nbsp;</p><p>Veja ${trophyRefHtml(trophies[1])} depois.</p>`;
    promoteLoneTrophyRefs(root);
    expect(root.querySelectorAll('[data-trophy-card]').length).toBe(1);
    expect(root.querySelector('[data-trophy-card]').dataset.trophyCard).toBe('1');
    expect(root.querySelectorAll('a.trophy-ref').length).toBe(1);
  });
});
