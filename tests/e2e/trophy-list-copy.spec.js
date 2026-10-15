import { expect, test } from '@playwright/test';
import { seed, yoteiGuide } from './helpers.js';

// Lista de troféus com cópia no Firestore: o editor (admin) grava a cópia; quem lê usa a cópia e não depende
// da API da PSN (ex.: site publicado sem functions)
test('lista de troféus: cópia na nuvem para a leitura', async ({ page }) => {
  await seed(page, [yoteiGuide()]);
  await page.goto('/guia/rawg-1002/editar');
  await expect(page.locator('.trophy')).toHaveCount(10);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mock-list:NPWR38432_00') || 'null')?.v)).toBe(3);
  const copy = await page.evaluate(() => localStorage.getItem('mock-list:NPWR38432_00'));

  // Visitante (sem admin, sem cópia local) e API da PSN fora do ar: a leitura usa a cópia da nuvem
  await page.context().route('**/api/trophies/list/**', (route) => route.abort());
  await seed(page, [yoteiGuide()], { admin: false, local: false });
  await page.evaluate((copy) => localStorage.setItem('mock-list:NPWR38432_00', copy), copy);
  await page.goto('/guia/rawg-1002?aba=trofeus');
  await expect(page.locator('.trophy')).toHaveCount(10);
  await expect(page.locator('.trophy').first()).toContainText('Lenda de Ezo');

  // Sem cópia na nuvem e sem API: mostra o erro (nada inventado)
  await seed(page, [yoteiGuide()], { admin: false, local: false });
  await page.goto('/guia/rawg-1002?aba=trofeus');
  await expect(page.locator('.trophy')).toHaveCount(0);
});
