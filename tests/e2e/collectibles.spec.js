import { expect, test } from '@playwright/test';
import { fakeIgdbImages, readDraft, seed, yoteiGuide } from './helpers.js';

const item = (id, name, type, extra = {}) => ({ id, name, type, location: '', description: '', images: [], ...extra });

const guide = (extra = {}) =>
  yoteiGuide({
    tabs: ['coletaveis'],
    credits: [{ id: 'k1', name: 'PowerPyx', url: 'https://www.powerpyx.com/', role: 'Rota' }],
    collectibles: [
      {
        id: 'r1',
        title: 'Floresta',
        body: '',
        trophies: [],
        video: 'https://youtu.be/abcdefghijk?t=30',
        items: [
          item('a', 'Mapa velho', 'Artefato', { description: '<p>Aperte <span class="btn-key" data-key="face-up" contenteditable="false">△</span> no corpo.</p>' }),
          item('b', 'Pingente da Ana', 'Pingente', { missable: true, credit: { name: 'Ana', url: 'https://ana.dev/' } }),
          item('x', 'Quadrinho', 'Artefato', { uncounted: true }),
        ],
      },
      {
        id: 'r2',
        title: 'Vila',
        body: '',
        trophies: [],
        items: [
          item('c', 'Carta', 'Artefato', { location: 'Casa do ferreiro', description: 'Linha 1\nLinha 2', video: 'https://youtu.be/abcdefghijk' }),
          item('d', 'Mapa da Vila', 'Artefato', { samePlace: true, location: 'ignorado' }), // pego junto com a Carta
        ],
      },
    ],
    ...extra,
  });

// Aba Coletáveis no modelo do PowerPyx: resumo por tipo (filtra), numeração por tipo, marcas, compacto e créditos
test('coletáveis: resumo, numeração, filtro, compacto e créditos', async ({ page }) => {
  await seed(page, [guide()]);
  await page.goto('/guia/rawg-1002?aba=coletaveis');

  const chips = page.locator('[aria-label="Filtrar coletáveis"] .chip');
  await expect(chips).toHaveText([/Todos/, /Artefato\s*0\/3/, /Pingente\s*0\/1/, /Perdíveis\s*1/]);
  // Como achar com botão do controle (texto do editor) e texto antigo simples
  await expect(page.locator('.ccard#coletavel-a .ccard__desc .btn-key')).toHaveCount(1);
  await expect(page.locator('.ccard#coletavel-c .ccard__desc')).toContainText('Linha 1');
  await expect(page.locator('[aria-label="Botões do controle"]')).toBeVisible();

  // Contagem por tipo em toda região, mesmo com um tipo só (Vila: só Artefato)
  await expect(page.locator('#secao-r1 .tag')).toHaveText([/Artefato\s*0\/1/, /Pingente\s*0\/1/]);
  await expect(page.locator('#secao-r2 .tag')).toHaveText([/Artefato\s*0\/2/]);

  // Mesmo lugar: um cartão só ("Artefato #2: Carta + Artefato #3: Mapa da Vila"), local do 1º e uma caixa para cada
  const pair = page.locator('.ccard#coletavel-c');
  await expect(pair.locator('.ccard__name')).toHaveText(/Artefato #2:\s*Carta \+ Artefato #3:\s*Mapa da Vila/);
  await expect(pair).toContainText('Casa do ferreiro');
  await expect(pair).not.toContainText('ignorado');
  await expect(pair.locator('.ccard__check')).toHaveCount(2);
  await pair.locator('.ccard__check:has-text("Mapa da Vila")').click();
  await expect(chips.filter({ hasText: 'Artefato' })).toContainText('1/3');
  await pair.locator('.ccard__check:has-text("Mapa da Vila")').click();
  await expect(page.locator('.ccard#coletavel-x')).toContainText('Não conta');
  await expect(page.locator('.ccard#coletavel-b')).toContainText('Perdível');
  await expect(page.locator('.ccard#coletavel-b a:has-text("Ana")')).toHaveAttribute('href', 'https://ana.dev/');
  await expect(page.locator('#secao-r1 .btn:has-text("Ver vídeo")')).toBeVisible(); // vídeo da região

  // Filtro por tipo: só a região com Pingente
  await chips.filter({ hasText: 'Pingente' }).click();
  await expect(page.locator('.ccard')).toHaveCount(1);
  await expect(page.locator('section[id^="secao-"]')).toHaveCount(1);
  await chips.filter({ hasText: 'Todos' }).click();

  // Compacto: linha com número; marcar pela caixa
  await page.getByLabel('Compacto').check();
  await expect(page.locator('.ccard.is-compact')).toHaveCount(4);
  await page.click('.ccard#coletavel-a .ccard__box');
  await expect(chips.filter({ hasText: 'Artefato' })).toContainText('1/3');
  await page.click('.ccard#coletavel-c .ccard__row .ccard__box'); // caixa do grupo marca os dois
  await expect(chips.filter({ hasText: 'Artefato' })).toContainText('3/3');
  await page.click('.ccard#coletavel-c .ccard__summary');
  await expect(page.locator('.ccard#coletavel-c .btn:has-text("Ver vídeo")')).toBeVisible();

  // Créditos no fim: os do guia + o nome citado no coletável
  await expect(page.locator('.credits li')).toHaveText([/PowerPyx\s*· Rota/, /Ana\s*· Imagens\/vídeos dos coletáveis/]);
});

test('coletáveis no editor: marcas, vídeo e crédito; créditos do guia', async ({ page }) => {
  await seed(page, [guide()]);
  await page.goto('/guia/rawg-1002/editar?aba=coletaveis');

  await page.click('.clist__row:has-text("Mapa velho") button:has-text("Mapa velho")');
  const modal = page.locator('.modal:has-text("Crédito das imagens")');
  await modal.getByLabel('Perdível', { exact: true }).check();
  await modal.locator('input[placeholder^="https://youtu.be"]').fill('youtu.be/abcdefghijk?t=95');
  // Como achar: mesmo editor das abas, com a barra reduzida (conjunto "collectible") e os botões do controle
  await expect(modal.locator('.rte__btn')).toHaveCount(8);
  await expect(modal.locator('.rte__btn[aria-label="Subtítulo"]')).toHaveCount(0);
  await modal.locator('.rte__content').click();
  await page.keyboard.type('Aperte ');
  await modal.locator('.rte__btn[aria-label^="Botão do controle"]').click();
  await page.click('.keys button[aria-label="Triângulo"]');
  await modal.getByLabel('Nome do crédito').fill('PowerPyx');
  await modal.getByLabel('Nome do crédito').dispatchEvent('change'); // nome conhecido → completa o link
  await expect(modal.getByLabel('Link do crédito')).toHaveValue('https://www.powerpyx.com/');
  await modal.locator('button:has-text("Salvar")').click();

  await expect
    .poll(async () => (await readDraft(page, 'rawg-1002'))?.collectibles?.[0]?.items?.[0])
    .toMatchObject({ missable: true, video: 'https://youtu.be/abcdefghijk?t=95', credit: { name: 'PowerPyx', url: 'https://www.powerpyx.com/' } });
  expect((await readDraft(page, 'rawg-1002')).collectibles[0].items[0].description).toContain('data-key="face-up"');

  // "Mesmo lugar do anterior": esconde local/imagens/crédito e a linha fica recuada
  await page.click('.clist__row:has-text("Pingente da Ana") button:has-text("Pingente da Ana")');
  const second = page.locator('.modal:has-text("Mesmo lugar do anterior")');
  await second.getByLabel('Mesmo lugar do anterior').check();
  await expect(second.getByLabel('Nome do crédito')).toHaveCount(0);
  await second.locator('button:has-text("Salvar")').click();
  await expect(page.locator('.clist__row.is-joined:has-text("Pingente da Ana")')).toBeVisible();
  await expect.poll(async () => (await readDraft(page, 'rawg-1002'))?.collectibles?.[0]?.items?.[1]?.samePlace).toBe(true);

  // Créditos do guia (aba Troféus, ao lado da visão geral)
  await page.goto('/guia/rawg-1002/editar');
  await page.click('.credits-btn');
  const credits = page.locator('.modal:has-text("Créditos do guia")');
  await credits.locator('button:has-text("Adicionar crédito")').click();
  await credits.getByLabel('Nome do crédito 2').fill('Bia');
  await credits.getByLabel('O que fez 2').fill('Revisão');
  await credits.locator('button:has-text("Salvar")').click();
  await expect(page.locator('.credits-btn')).toContainText('2');
  await expect.poll(async () => (await readDraft(page, 'rawg-1002'))?.credits?.map((c) => c.name)).toEqual(['PowerPyx', 'Bia']);
});

// Lápis na leitura → editor já no ponto certo (seção rolada e destacada; coletável com a janela aberta)
test('coletáveis: editar direto da leitura', async ({ page }) => {
  await seed(page, [guide()]);
  await page.goto('/guia/rawg-1002?aba=coletaveis');

  await page.click('#secao-r2 [aria-label="Editar Vila"]');
  await expect(page).toHaveURL(/\/editar\?aba=coletaveis#secao-r2$/);
  await expect(page.locator('[data-section="r2"]')).toBeInViewport();

  await page.goBack();
  await page.click('.ccard#coletavel-b [aria-label="Editar Pingente da Ana"]');
  await expect(page.locator('.modal input[placeholder^="Ex.: Cruciform"]')).toHaveValue('Pingente da Ana');
  await expect(page).not.toHaveURL(/coletavel=/); // abriu uma vez e saiu da URL

  // Aba paginada (Guia): o lápis leva para a mesma página do editor
  await seed(page, [guide({ guide: [
    { id: 'p1', title: 'Início', sections: [{ id: 's1', title: 'Prólogo', body: '<p>Oi.</p>', trophies: [] }] },
    { id: 'p2', title: 'Cap 2', sections: [{ id: 's2', title: 'Ponte', body: '<p>Siga.</p>', trophies: [] }] },
  ] })]);
  await page.goto('/guia/rawg-1002?aba=guia&pagina=2');
  await page.click('[aria-label="Editar Ponte"]');
  await expect(page).toHaveURL(/editar\?aba=guia&pagina=2#secao-s2$/);
  await expect(page.locator('[data-section="s2"]')).toBeVisible();

  // Sem permissão de editar: sem lápis
  await seed(page, [guide()], { admin: false, local: false });
  await page.goto('/guia/rawg-1002?aba=coletaveis');
  await expect(page.locator('.ccard').first()).toBeVisible();
  await expect(page.locator('[aria-label^="Editar"]')).toHaveCount(0);
});

// Editor: tipo lembrado no campo rápido, colar lista (uma linha por coletável) e mover para outra região
test('coletáveis no editor: colar lista e mover de região', async ({ page }) => {
  await seed(page, [guide()]);
  await page.goto('/guia/rawg-1002/editar?aba=coletaveis');
  const vila = page.locator('[data-section="r2"]');

  await vila.getByLabel('Tipo do novo coletável').fill('Pingente');
  await vila.getByLabel('Nome do novo coletável').fill('Pingente do Rio');
  await vila.getByLabel('Nome do novo coletável').press('Enter');
  await expect(vila.locator('.clist__row').last()).toContainText('Pingente do Rio');
  await expect(vila.locator('.clist__row').last()).toContainText('Pingente');

  // Colar: "Tipo #n: Nome + Tipo #n: Nome" = mesmo lugar; linha sem tipo usa o do campo
  await vila.getByLabel('Nome do novo coletável').evaluate((el) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', 'Artifact #7: Pamphlet + Artifact #8: Map\n- Bilhete solto');
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await expect(page.locator('.toast')).toContainText('3 coletáveis adicionados');
  await expect
    .poll(async () => (await readDraft(page, 'rawg-1002'))?.collectibles?.[1]?.items?.slice(-3).map((i) => [i.name, i.type, i.samePlace]))
    .toEqual([['Pamphlet', 'Artifact', false], ['Map', 'Artifact', true], ['Bilhete solto', 'Pingente', false]]);

  // Mover "Carta" (Vila) para a Floresta
  await vila.locator('.clist__row button:has-text("Carta")').click();
  await page.locator('.modal button:has-text("Mover")').click();
  await page.click('.menu__item:has-text("Floresta")');
  await expect(page.locator('[data-section="r1"] .clist__row').last()).toContainText('Carta');
  await expect.poll(async () => (await readDraft(page, 'rawg-1002'))?.collectibles?.[0]?.items?.map((i) => i.name).at(-1)).toBe('Carta');
});

// Leitura: imagens em tela cheia, próximo que falta, recomeçar e perdíveis na aba Perdíveis / Visão geral
test('coletáveis: tela cheia, próximo que falta, recomeçar e perdíveis', async ({ page }) => {
  await fakeIgdbImages(page);
  const imgs = ['https://images.igdb.com/a.jpg', 'https://images.igdb.com/b.jpg'];
  await seed(page, [guide({ tabs: ['coletaveis', 'perdiveis'] })]);
  await page.evaluate((imgs) => {
    const g = JSON.parse(localStorage.getItem('mock-cloud:rawg-1002'));
    g.collectibles[0].items[0].images = imgs;
    for (const k of ['mock-cloud:rawg-1002', 'mg:guide-draft:rawg-1002']) localStorage.setItem(k, JSON.stringify(g));
  }, imgs);

  await page.goto('/guia/rawg-1002');
  await expect(page.locator('.overview')).toContainText('1 perdível');

  await page.goto('/guia/rawg-1002?aba=coletaveis');
  await page.click('.ccard#coletavel-a .ccard__images a >> nth=0');
  const box = page.locator('.lightbox');
  await expect(box).toContainText('1 / 2');
  await page.keyboard.press('ArrowRight');
  await expect(box).toContainText('2 / 2');
  await page.keyboard.press('Escape');
  await expect(box).toHaveCount(0);

  // Próximo que falta: marca o 1º e o botão leva ao 2º (Pingente da Ana)
  await page.click('.ccard#coletavel-a .ccard__check');
  await page.click('button:has-text("Próximo que falta")');
  await expect(page.locator('.ccard#coletavel-b')).toHaveClass(/is-flash/);

  // Recomeçar: confirma e desmarca todos
  await page.click('button:has-text("Recomeçar")');
  await page.click('.modal button:has-text("Desmarcar todos")');
  await expect(page.locator('[aria-label="Filtrar coletáveis"] .chip').filter({ hasText: 'Artefato' })).toContainText('0/3');

  // Aba Perdíveis: o coletável perdível entra sozinho e dá para marcar ali
  await page.goto('/guia/rawg-1002?aba=perdiveis');
  const lost = page.locator('section:has-text("Coletáveis perdíveis")');
  await expect(lost.locator('.ccard')).toHaveCount(1);
  await lost.locator('.ccard__box').click();
  await page.goto('/guia/rawg-1002?aba=coletaveis');
  await expect(page.locator('[aria-label="Filtrar coletáveis"] .chip').filter({ hasText: 'Pingente' })).toContainText('1/1');
});
