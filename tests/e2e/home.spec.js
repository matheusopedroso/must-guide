import { expect, test } from '@playwright/test';
import { seed, yoteiGuide } from './helpers.js';

const draft = (id, title, updatedAt, extra = {}) =>
  yoteiGuide({ guideId: id, gameId: id, game: { id, title, cover: null }, status: 'draft', versions: [], tabs: ['roadmap'], updatedAt, ...extra });

// Início: "Continuar editando" (quem edita) leva ao editor; "Guias publicados" (todo mundo) leva à leitura
test('início: continuar editando e guias publicados', async ({ page }) => {
  await seed(page, [
    yoteiGuide({ updatedAt: '2026-10-10T10:00:00.000Z', publishedAt: '2026-10-10T10:00:00.000Z' }), // publicado
    draft('rawg-1003', 'Rascunho novo', new Date(Date.now() - 5 * 60 * 1000).toISOString()),
    draft('rawg-1004', 'Rascunho velho', '2026-09-01T10:00:00.000Z'),
  ]);
  await page.goto('/');

  const recent = page.locator('section:has(h2:has-text("Continuar editando"))');
  await expect(recent.locator('.link')).toHaveCount(3);
  await expect(recent.locator('.link').first()).toContainText('Rascunho novo');
  await expect(recent.locator('.link').first()).toContainText('editado há 5 minutos');

  const published = page.locator('section:has(h2:has-text("Guias publicados"))');
  await expect(published.locator('.card')).toHaveCount(1);
  await expect(published.locator('.card')).toContainText('Ghost of Yōtei');

  // Busca esconde as duas seções
  await page.getByLabel('Pesquisar jogo').fill('ghost');
  await expect(recent).toHaveCount(0);
  await page.getByLabel('Pesquisar jogo').fill('');

  await recent.locator('.link').first().click();
  await expect(page).toHaveURL(/\/guia\/rawg-1003\/editar$/);
  await page.goto('/');
  await published.locator('.card').click();
  await expect(page).toHaveURL(/\/guia\/rawg-1002$/);

  // Sem permissão de editar: só os publicados (lidos da nuvem)
  await seed(page, [yoteiGuide({ publishedAt: '2026-10-10T10:00:00.000Z' }), draft('rawg-1003', 'Rascunho novo', '2026-10-14T10:00:00.000Z')], { admin: false, local: false });
  await page.goto('/');
  await expect(page.locator('h2:has-text("Guias publicados")')).toBeVisible();
  await expect(page.locator('h2:has-text("Continuar editando")')).toHaveCount(0);
  await expect(page.locator('section:has(h2:has-text("Guias publicados")) .card')).toHaveCount(1);
});
