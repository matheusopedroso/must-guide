import { expect, test } from '@playwright/test';
import { readDraft, seed, yoteiGuide } from './helpers.js';

// DLC com troféus próprios vira um guia separado (jogo~grupo), ligado ao guia do jogo
test('guia de DLC: criar, editar, publicar e ler', async ({ page }) => {
  await seed(page, [yoteiGuide({ trophies: { 12: { tip: '<p>Dica da DLC.</p>' } } })]);

  await page.goto('/guia/rawg-1002/editar');
  await expect(page.locator('.trophy')).toHaveCount(10); // só o jogo base
  await expect(page.locator('.notice')).toContainText('1 DLC(s)');

  await page.click('button:has-text("Ver DLCs")');
  await expect(page.locator('.dlc')).toContainText('Lendas (DLC)');
  await page.click('button:has-text("Criar guia da DLC")');

  await expect(page).toHaveURL(/\/guia\/rawg-1002~001\/editar/);
  await expect(page.locator('h1')).toHaveText('Editar guia da DLC');
  await expect(page.locator('.trophy')).toHaveCount(10); // só a DLC
  await expect(page.locator('.trophy__body')).toContainText('Dica da DLC.'); // anotação copiada
  await expect(page.locator('[aria-label="Trocar jogo"]')).toHaveCount(0);

  await page.click('button:has-text("Publicar")');
  await page.click('.modal__footer .btn--primary');
  await expect.poll(async () => (await readDraft(page, 'rawg-1002~001'))?.status).toBe('published');

  await page.goto('/guia/rawg-1002');
  await expect(page.locator('.links .link')).toContainText('Lendas (DLC)');
  await page.click('.links .link');
  await expect(page.locator('.hero__kicker')).toHaveText(/guia de dlc/i);
  await expect(page.locator('.hero .parent')).toContainText('DLC de Ghost of Yōtei');
});
