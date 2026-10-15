import { expect, test } from '@playwright/test';
import { chip, seed, yoteiGuide } from './helpers.js';

// Página do troféu: dica, onde aparece no guia, quem cita, anterior/próximo e "Na lista"
test('página do troféu', async ({ page }) => {
  await seed(page, [
    yoteiGuide({
      tabs: ['roadmap'],
      trophies: {
        2: { tip: `<p>Derrote os seis. Depois veja ${chip(4, 'silver', 'Seis de Yōtei')}.</p>`, missable: true },
        4: { tip: `<p>Requer ${chip(2, 'gold', 'Mestre da lâmina')}.</p>` },
      },
      guide: [{ id: 'p1', title: 'Cap 2', sections: [{ id: 's2', title: 'Os seis', body: `<p>${chip(2, 'gold', 'Mestre da lâmina')}</p>`, trophies: [2] }] }],
      roadmap: [{ id: 'r1', title: 'História', body: '<p>Jogue.</p>', trophies: [2, 3] }],
    }),
  ]);

  await page.goto('/guia/rawg-1002/trofeu/2');
  await expect(page.locator('.hero__title')).toHaveText('Mestre da lâmina');
  await expect(page.locator('.hero__labels')).toContainText('Perdível');
  await expect(page.locator('.tip')).toContainText('Derrote os seis');
  await expect(page.locator('.cite')).toHaveCount(2); // Guia (no texto) e Roadmap (na lista)
  await expect(page.locator('.pager__btn')).toHaveCount(2);

  await page.click('.tip a.trophy-ref'); // troféu citado na dica
  await expect(page).toHaveURL(/\/trofeu\/4$/);
  await page.goBack();

  await page.click('.cite >> nth=1');
  await expect(page).toHaveURL(/aba=roadmap.*#secao-r1/);

  await page.goto('/guia/rawg-1002/trofeu/2');
  await page.click('.hero .action:has-text("Na lista")');
  await expect(page).toHaveURL(/aba=trofeus/);
  await expect(page.locator('.trophy.is-flash')).toContainText('Mestre da lâmina');
});
