import { expect, test } from '@playwright/test';
import { fakeIgdbImages, readDraft, seed, yoteiGuide } from './helpers.js';

// Ferramentas do editor de texto: contador, cartão do troféu, botão do controle, caixa de aviso,
// spoiler e imagem — e como aparecem na leitura
const editorOf = (page) => page.locator('.section .rte__content').first();
const tool = (page, label) => page.click(`.section .rte__btn[aria-label^="${label}"]`);

test('contador, cartão do troféu e troféus citados entram na seção', async ({ page }) => {
  await seed(page, [yoteiGuide({ guide: [{ id: 'p1', title: 'Cap 1', sections: [{ id: 's1', title: 'A', body: '<p>Volte ao ferro-velho.</p>', trophies: [] }] }] })]);
  await page.goto('/guia/rawg-1002/editar?aba=guia');

  const ed = editorOf(page);
  await ed.click();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Progresso: ');
  await tool(page, 'Contador');
  await page.fill('.counter input[placeholder="6"]', '6');
  await page.selectOption('.counter select', { label: 'Santuário de bambu (50)' }); // total vem da PSN
  await page.click('.counter button:has-text("Inserir")');

  await ed.locator('p').first().click();
  await tool(page, 'Cartão do troféu');
  await page.keyboard.type('mestre');
  await page.keyboard.press('Enter');

  await expect.poll(async () => (await readDraft(page, 'rawg-1002'))?.guide?.[0]?.sections?.[0]?.trophies?.slice().sort()).toEqual([2, 9]);
  const body = (await readDraft(page, 'rawg-1002')).guide[0].sections[0].body;
  expect(body).toContain('<b>6/50</b> Santuário de bambu');
  expect(body).toContain('data-trophy-card="2"');

  await page.goto('/guia/rawg-1002?aba=guia');
  await expect(page.locator('.rich-text .trophy-card.is-filled')).toContainText('Mestre da lâmina');
  await expect(page.locator('.rich-text .trophy-count')).toHaveText('6/50 Santuário de bambu');
  await page.click('.rich-text .trophy-card');
  await expect(page).toHaveURL(/\/guia\/rawg-1002\/trofeu\/2/);
});

test('botão do controle no estilo PlayStation ou Xbox', async ({ page }) => {
  await seed(page, [yoteiGuide({ guide: [{ id: 'p1', title: 'Controles', sections: [{ id: 's1', title: 'A', body: '<p>Aperte </p>', trophies: [] }] }] })]);
  await page.goto('/guia/rawg-1002/editar?aba=guia');
  await editorOf(page).click();
  await page.keyboard.press('End');
  await tool(page, 'Botão do controle');
  await page.click('.keys button[aria-label="Círculo"]');
  await expect.poll(async () => (await readDraft(page, 'rawg-1002'))?.guide?.[0]?.sections?.[0]?.body ?? '').toContain('data-key="face-right"');

  await page.goto('/guia/rawg-1002?aba=guia');
  await expect(page.locator('.paged .btn-key')).toHaveCount(1);
  await page.click('[aria-label="Botões do controle"] button:has-text("Xbox")');
  await expect(page.locator('html')).toHaveAttribute('data-buttons', 'xbox');
});

test('caixa de aviso, spoiler e imagem do jogo', async ({ page }) => {
  await fakeIgdbImages(page);
  const guide = yoteiGuide({
    guideId: 'igdb-101',
    gameId: 'igdb-101',
    game: { id: 'igdb-101', title: "Ghost of Tsushima: Director's Cut", cover: null, summary: 'x', year: 2021, detailed: 2 },
    guide: [{ id: 'p1', title: 'Fim', sections: [{ id: 's1', title: 'Final', body: '<p>Cuidado aqui.</p><p>O vilão é o tio.</p>', trophies: [] }] }],
  });
  await seed(page, [guide]);
  await page.goto('/guia/igdb-101/editar?aba=guia');

  const ed = editorOf(page);
  await ed.locator('p').first().click();
  await tool(page, 'Caixa de aviso');
  await page.click('.callouts .menu__item:has-text("Perdível")');

  await ed.locator('p', { hasText: 'O vilão' }).click();
  await page.keyboard.press('End');
  await page.keyboard.down('Shift');
  for (let i = 0; i < 'o tio.'.length; i++) await page.keyboard.press('ArrowLeft');
  await page.keyboard.up('Shift');
  await tool(page, 'Spoiler');

  await tool(page, 'Imagem no texto');
  await expect(page.locator('.img-form .gallery__item')).toHaveCount(4); // arte + 3 screenshots (IGDB)
  await page.click('.img-form .gallery__item >> nth=1');
  await page.fill('.img-form input[placeholder^="Ex.:"]', 'Mapa da região');
  await page.click('.img-form button:has-text("Inserir")');

  await expect.poll(async () => (await readDraft(page, 'igdb-101'))?.guide?.[0]?.sections?.[0]?.body ?? '').toContain('figcaption');
  const body = (await readDraft(page, 'igdb-101')).guide[0].sections[0].body;
  expect(body).toContain('<div class="callout" data-kind="missable"><p>Cuidado aqui.</p></div>');
  expect(body).toContain('<span class="spoiler">o tio.</span>');

  await page.goto('/guia/igdb-101?aba=guia');
  await expect(page.locator('.paged .callout')).toBeVisible();
  const spoiler = page.locator('.paged .spoiler');
  await expect(spoiler).not.toHaveClass(/is-revealed/);
  await spoiler.click();
  await expect(spoiler).toHaveClass(/is-revealed/);
  // Imagem do texto: tela cheia dentro do app, na versão grande
  await page.click('.paged .guide-img img');
  await expect(page.locator('.lightbox img')).toHaveAttribute('src', /\/t_1080p\//);
  await page.keyboard.press('Escape');
  await expect(page.locator('.lightbox')).toHaveCount(0);
});
