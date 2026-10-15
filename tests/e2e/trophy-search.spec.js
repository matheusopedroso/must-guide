import { expect, test } from '@playwright/test';
import { seed } from './helpers.js';

// Troféus de um jogo que você nunca jogou: a busca automática acha a lista nos perfis de referência,
// mostra na página do jogo e cria o guia já vinculado
test('troféus sem ter jogado: página do jogo e guia já vinculado', async ({ page }) => {
  await seed(page, []);
  await page.goto('/jogo/rawg-1005'); // Split Fiction (não está na sua conta da PSN simulada)
  await expect(page.locator('#game-trophies')).toHaveCount(0); // aba Detalhes: a busca só roda na aba Troféus
  await page.click('[role="tablist"] :text("Troféus")');
  await expect(page).toHaveURL(/aba=trofeus/);

  const section = page.locator('#game-trophies');
  await expect(section).toContainText('Split Fiction');
  await expect(section).toContainText('Achado em: Hakoom');
  await expect(section.locator('.trophy-tile')).toHaveCount(10);
  await expect(section.locator('[aria-label="Versão"]')).toHaveCount(0); // a lista em japonês não entra como versão

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

// Resposta antiga guardada pelo navegador (regra velha casava nome só em japonês): o app confere de novo
test('busca automática: o app descarta lista que não combina com o nome', async ({ page }) => {
  await seed(page, []);
  const r = (id, name, platform) => ({ id, name, platform, service: 'trophy2', icon: null, counts: { platinum: 1, gold: 0, silver: 0, bronze: 1 }, score: 80, sources: ['Hakoom'] });
  await page.route('**/api/trophies/find**', (route) =>
    route.fulfill({ json: { results: [r('NPWR40002_00', 'Split Fiction™', 'PS5'), r('NPWR40003_00', '五等分の花嫁 ごとぱずストーリー', 'PS4')] } }),
  );
  await page.goto('/jogo/rawg-1005?aba=trofeus');
  await expect(page.locator('#game-trophies')).toContainText('Split Fiction');
  await expect(page.locator('#game-trophies [aria-label="Versão"]')).toHaveCount(0);
});
