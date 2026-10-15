import { expect, test } from '@playwright/test';
import { readDraft, seed, yoteiGuide } from './helpers.js';

// Aba Guia em páginas: o formato antigo vira a Página 1; criar, renomear, mover seção; leitura com sumário
test('guia em páginas: editar e ler', async ({ page }) => {
  await seed(page, [
    yoteiGuide({
      guide: [
        { id: 's1', title: 'Introdução', body: '<p>Bem-vindo.</p>', trophies: [] },
        { id: 's2', title: 'O começo', body: '<p>Vá para o norte.</p>', trophies: [2] },
      ],
    }),
  ]);

  await page.goto('/guia/rawg-1002/editar?aba=guia');
  await expect(page.locator('.pnav__list .chip')).toHaveText(['1 Página 1']);
  await page.fill('.pnav__title', 'Introdução');
  await page.click('button:has-text("Nova página")');
  await page.fill('.pnav__title', 'Capítulo 1');
  await expect(page).toHaveURL(/pagina=2/);

  // manda "O começo" da página 1 para a 2
  await page.click('.pnav__list .chip >> nth=0');
  await page.click('.section:has(input[value="O começo"]) [aria-label^="Mover seção para outra página"]');
  await page.click('.menu__item:has-text("Página 2")');
  await expect(page.locator('.section .section__title')).toHaveCount(1);

  // O navegador grava ~0,6 s depois da edição (antes disso ainda está o formato antigo, sem páginas):
  // ?. para a checagem tentar de novo em vez de dar erro
  await expect.poll(async () => (await readDraft(page, 'rawg-1002'))?.guide?.map((p) => p.sections?.map((s) => s.title))).toEqual([
    ['Introdução'],
    ['', 'O começo'],
  ]);

  await page.goto('/guia/rawg-1002?aba=guia');
  await expect(page.locator('.toc-item')).toHaveCount(2);
  await expect(page.locator('.paged__title')).toHaveText('Introdução');
  await page.click('.pager__btn--next');
  await expect(page).toHaveURL(/pagina=2/);
  await expect(page.locator('.paged__title')).toHaveText('Capítulo 1');
  await page.goBack();
  await expect(page.locator('.paged__title')).toHaveText('Introdução');
});
