import { expect, test } from '@playwright/test';
import { seed, yoteiGuide } from './helpers.js';

// Busca no guia: "/" abre, resultados por tipo (texto, troféus, coletáveis), sem acento, e cada um leva até lá
test('busca dentro do guia', async ({ page }) => {
  await seed(page, [
    yoteiGuide({
      tabs: ['roadmap', 'coletaveis'],
      trophies: { 3: { tip: '<p>Atravesse a <b>ponte</b> à noite.</p>' } },
      guide: [
        { id: 'p1', title: 'Início', sections: [{ id: 's1', title: 'Prólogo', body: '<p>Bem-vindo.</p>', trophies: [] }] },
        { id: 'p2', title: 'Capítulo 2', sections: [{ id: 's2', title: 'Os seis', body: '<p>Derrote o Oni perto da ponte.</p>', trophies: [] }] },
      ],
      roadmap: [{ id: 'r1', title: 'Limpeza', body: '<p>Santuários.</p>', trophies: [] }],
      collectibles: [{ id: 'c1', title: 'Floresta', body: '', trophies: [], items: [{ id: 'i1', name: 'Haiku do lago', type: 'Haiku', location: 'Ponte velha', description: '' }] }],
    }),
  ]);

  await page.goto('/guia/rawg-1002');
  await expect(page.locator('.hero__title')).toBeVisible();
  await page.keyboard.press('/');
  const modal = page.locator('.modal:has-text("Buscar no guia")');
  await expect(modal).toBeVisible();

  // "lamina" sem acento acha o troféu "Mestre da lâmina" (lista da PSN simulada)
  await modal.locator('input').fill('lamina');
  await expect(modal.locator('.hit').first()).toContainText('Mestre da lâmina');
  await expect(modal.locator('mark').first()).toHaveText('lâmina');

  // "ponte": seção (página 2), troféu (pela dica) e coletável
  await modal.locator('input').fill('ponte');
  await expect(modal.locator('.kicker')).toHaveText([/No texto do guia · 1/, /Troféus · 1/, /Coletáveis · 1/]);
  await modal.locator('.hit:has-text("Os seis")').click();
  await expect(page).toHaveURL(/aba=guia.*pagina=2.*#secao-s2/);
  await expect(page.locator('.paged__title')).toHaveText('Capítulo 2');

  // Troféu → página do troféu
  await page.click('.pbar [aria-label="Buscar no guia"]');
  await modal.locator('input').fill('caçadora');
  await modal.locator('input').press('Enter');
  await expect(page).toHaveURL(/\/trofeu\/3$/);
  await expect(page.locator('.hero__title')).toHaveText('Caçadora de recompensas');

  // Coletável → abre o detalhe dele ali mesmo
  await page.goBack();
  await expect(page.locator('.hero__title')).toHaveText('Ghost of Yōtei'); // leitura de volta (o atalho é dela)
  await page.keyboard.press('/');
  await modal.locator('input').fill('haiku do');
  await modal.locator('.hit').first().click();
  await expect(page.locator('.modal:has-text("Ponte velha")')).toBeVisible();

  // Nada encontrado
  await page.keyboard.press('Escape');
  await expect(page.locator('.modal')).toHaveCount(0);
  await page.keyboard.press('/');
  await modal.locator('input').fill('zzzz');
  await expect(modal).toContainText('Nada encontrado');
});
