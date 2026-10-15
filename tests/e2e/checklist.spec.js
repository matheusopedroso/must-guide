import { expect, test } from '@playwright/test';
import { seed, yoteiGuide } from './helpers.js';

// Checklist de quem lê (visitante logado, sem progresso da PSN): marcar troféus e ver o progresso
test('checklist de troféus', async ({ page }) => {
  await seed(
    page,
    [
      yoteiGuide({
        guide: [
          { id: 'p1', title: 'Introdução', sections: [{ id: 's1', title: 'Antes', body: '<p>Leia.</p>', trophies: [1, 2] }] },
          { id: 'p2', title: 'Capítulo 1', sections: [{ id: 's2', title: 'Os seis', body: '<p>Lute.</p>', trophies: [4, 5] }] },
        ],
      }),
    ],
    { admin: false },
  );

  await page.goto('/guia/rawg-1002?aba=guia');
  await expect(page.locator('.toc-item')).toHaveText([/Introdução\s*0\/2/, /Capítulo 1\s*0\/2/]);
  await page.click('.paged .trophy-tile__toggle >> nth=0');
  await expect(page.locator('.toc-item').first()).toContainText('1/2');
  await expect(page.locator('.paged section.section .kicker')).toContainText('1/2 feitos');

  await page.goto('/guia/rawg-1002/trofeu/2');
  await page.click('.action:has-text("Marcar feito")');
  await expect(page.locator('.hero__labels')).toContainText('Feito');

  await page.goto('/guia/rawg-1002');
  await expect(page.locator('aside.card')).toContainText('Seu checklist 2/10');

  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mg:collected:rawg-1002')).trophies.sort()))
    .toEqual([1, 2]);
});
