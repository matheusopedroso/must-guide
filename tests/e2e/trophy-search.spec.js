import { expect, test } from '@playwright/test';
import { seed } from './helpers.js';

// Troféus de um jogo que você nunca jogou: a busca automática acha a lista nos perfis de referência,
// mostra na página do jogo e cria o guia já vinculado
test('troféus sem ter jogado: página do jogo e guia já vinculado', async ({ page }) => {
  await seed(page, []);
  await page.goto('/jogo/rawg-1005'); // Split Fiction (não está na sua conta da PSN simulada)

  const section = page.locator('section:has(#game-trophies)');
  await expect(section).toContainText('Split Fiction');
  await expect(section).toContainText('Achado em: Hakoom');
  await expect(section.locator('.trophy-tile')).toHaveCount(10);

  await section.locator('button:has-text("Criar guia com esta lista")').click();
  await expect(page).toHaveURL(/\/guia\/rawg-1005\/editar$/); // o ?lista= sai depois de vincular
  await expect(page.locator('.trophy')).toHaveCount(10);
});

// Editor: a busca automática é a primeira opção ao vincular a lista
test('vincular lista: busca automática pelo nome', async ({ page }) => {
  await seed(page, []);
  await page.goto('/guia/rawg-1005/editar');
  await expect(page.locator('.chip.is-active')).toContainText('Busca automática');
  await expect(page.locator('.titles .title')).toHaveCount(1);
  await expect(page.locator('.titles .title')).toContainText('Achado em:');
  await page.locator('.titles .title').click();
  await expect(page.locator('.trophy')).toHaveCount(10);
});
