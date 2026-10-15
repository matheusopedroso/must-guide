import { expect, test } from '@playwright/test';
import { seed, yoteiGuide } from './helpers.js';

// Página do jogo aberta pelos cards do início, com e sem guia
test('página do jogo', async ({ page }) => {
  await seed(page, [yoteiGuide()]);
  await page.goto('/');
  await page.click('.card:has-text("Elden Ring")');
  await expect(page).toHaveURL(/\/jogo\/rawg-1000/);
  await expect(page.locator('.guide-card')).toContainText('Ainda não tem guia');
  await expect(page.locator('.guide-card a:has-text("Criar guia")')).toBeVisible();

  await page.goBack();
  await page.click('.card:has-text("Ghost of")');
  await expect(page.locator('.guide-card')).toContainText('Publicado');
  await page.click('.guide-card a:has-text("Ler guia")');
  await expect(page).toHaveURL(/\/guia\/rawg-1002$/);
});

// Guia de um jogo do IGDB com cópia antiga (só título): abre mesmo com o RAWG ativo
test('guia de outro provedor abre pela cópia do jogo', async ({ page }) => {
  await seed(page, [yoteiGuide({ guideId: 'igdb-101', gameId: 'igdb-101', game: { id: 'igdb-101', title: "Ghost of Tsushima: Director's Cut", cover: null } })]);
  await page.goto('/guia/igdb-101/editar');
  await expect(page.locator('.selected__title')).toHaveText("Ghost of Tsushima: Director's Cut");
  await expect(page.locator('.trophy')).toHaveCount(10);
});
