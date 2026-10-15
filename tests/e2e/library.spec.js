import { expect, test } from '@playwright/test';
import { seed, yoteiGuide } from './helpers.js';

// Biblioteca pessoal: marcar na página do jogo e no guia, selo nos cards, página /biblioteca com filtro,
// "Jogando agora" no início e cópia na conta (logado)
test('biblioteca pessoal', async ({ page }) => {
  await seed(page, [yoteiGuide()]);

  // Página do jogo: Biblioteca → Jogando
  await page.goto('/jogo/rawg-1000');
  await page.click('.action:has-text("Biblioteca")');
  await page.click('.menu__item:has-text("Jogando")');
  await expect(page.locator('.action.is-active')).toContainText('Jogando');

  // Leitura do guia: Biblioteca → Quero platinar
  await page.goto('/guia/rawg-1002');
  await page.click('.action:has-text("Biblioteca")');
  await page.click('.menu__item:has-text("Quero platinar")');
  await expect(page.locator('.action.is-active')).toContainText('Quero platinar');

  // Início: "Jogando agora" + selo nos cards
  await page.goto('/');
  await expect(page.locator('section:has(h2:has-text("Jogando agora")) .card')).toHaveCount(1);
  await expect(page.locator('section:has(h2:has-text("Populares")) .card:has-text("Elden Ring") .lbadge')).toHaveText('Jogando');

  // /biblioteca: os dois, filtro por status na URL
  await page.goto('/biblioteca');
  await expect(page.locator('.card')).toHaveCount(2);
  await page.click('.chip:has-text("Quero platinar")');
  await expect(page).toHaveURL(/status=want/);
  await expect(page.locator('.card')).toHaveCount(1);
  await expect(page.locator('.card')).toContainText('Ghost of Yōtei');

  // Tirar da biblioteca
  await page.goto('/jogo/rawg-1000');
  await page.click('.action:has-text("Jogando")');
  await page.click('.menu__item:has-text("Tirar da biblioteca")');
  await expect(page.locator('.action:has-text("Biblioteca")')).not.toHaveClass(/is-active/);

  // Logado: vai para a conta (agrupado)
  await expect.poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('mock-library:u1') || '{"games":{}}').games))).toEqual(['rawg-1002']);
});

// Conta com biblioteca mais nova que a do navegador: ao abrir, fica a da conta
test('biblioteca: a cópia da conta mais nova vence', async ({ page }) => {
  await seed(page, [yoteiGuide()]);
  await page.evaluate(() => {
    const game = { id: 'rawg-1001', title: 'Hades II', cover: null, year: 2025, platforms: [], kind: '' };
    localStorage.setItem('mock-library:u1', JSON.stringify({ games: { 'rawg-1001': { status: 'platinum', game, addedAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' } }, editedAt: '2026-10-01T00:00:00Z' }));
  });
  await page.goto('/biblioteca');
  await expect(page.locator('.card')).toContainText('Hades II');
  await expect(page.locator('.card .lbadge')).toHaveText('Platinado');
});
