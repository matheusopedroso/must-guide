import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import { readDraft, seed, yoteiGuide } from './helpers.js';

const dlcOf = (g) => ({ ...g, guideId: `${g.gameId}~001`, parentId: g.gameId, dlc: { groupId: '001', name: 'Lendas (DLC)', icon: null }, status: 'draft' });
const other = yoteiGuide({ guideId: 'rawg-1001', gameId: 'rawg-1001', game: { id: 'rawg-1001', title: 'Clair Obscur: Expedition 33' }, versions: [], status: 'draft', tabs: ['roadmap'] });
const keys = (page) => page.evaluate(() => Object.keys(localStorage).filter((k) => /guide-draft|mock-cloud/.test(k)).sort());

test('apagar o guia do jogo leva junto o da DLC', async ({ page }) => {
  const game = yoteiGuide();
  await seed(page, [game, dlcOf(game), other]);
  await page.goto('/guias');
  await page.click('.gcard:has-text("Ghost of Yōtei"):not(:has-text("DLC")) .gcard__delete');
  await expect(page.locator('.modal')).toContainText('Lendas (DLC)');
  await page.click('.modal button:has-text("Apagar")');
  await expect(page.locator('.gcard')).toHaveCount(1);
  expect(await keys(page)).toEqual(['mg:guide-draft:rawg-1001', 'mock-cloud:rawg-1001']);
});

test('trocar o jogo do guia move o guia e a DLC', async ({ page }) => {
  const game = yoteiGuide({ tabs: ['roadmap'], trophies: { 2: { tip: '<p>Dica.</p>' } } });
  await seed(page, [game, dlcOf(game), other]);
  await page.goto('/guia/rawg-1002/editar');
  await page.click('[aria-label="Trocar jogo"]');
  await page.keyboard.type('clair');
  await page.click('.modal [role=option]:has-text("Clair")');
  await page.click('.modal button:has-text("Trocar jogo")');
  await expect(page.locator('.modal .text-danger')).toContainText('Já existe um guia'); // não sobrescreve

  await page.click('.modal [aria-label="Trocar jogo"]');
  await page.keyboard.type('split');
  await page.click('.modal [role=option]:has-text("Split")');
  await page.click('.modal button:has-text("Trocar jogo")');
  await expect(page).toHaveURL(/\/guia\/rawg-1005\/editar/);
  expect((await readDraft(page, 'rawg-1005~001')).parentId).toBe('rawg-1005');
  expect(await readDraft(page, 'rawg-1002')).toBeNull();
});

test('backup: exportar e importar', async ({ page }, info) => {
  await seed(page, [yoteiGuide()]);
  await page.goto('/guias');
  await expect(page.locator('.gcard')).toHaveCount(1);
  await page.click('button:has-text("Backup")');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('.menu__item:has-text("Exportar")')]);
  const file = info.outputPath('backup.json');
  await download.saveAs(file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(data.format).toBe('must-guide-backup');
  expect(data.guides.map((g) => g.guideId)).toEqual(['rawg-1002']);

  // 1 novo, 1 mais antigo que o atual e 1 inválido
  const novo = { ...other, updatedAt: '2026-10-10T10:00:00.000Z' };
  const antigo = { ...data.guides[0], updatedAt: '2020-01-01T00:00:00.000Z' };
  const input = info.outputPath('import.json');
  fs.writeFileSync(input, JSON.stringify({ ...data, guides: [novo, antigo, { guideId: '../x' }] }));
  await page.setInputFiles('input[type=file]', input);
  await expect(page.locator('.modal')).toContainText('1 item(ns) inválido(s)');
  await expect(page.locator('.modal')).toContainText('Mais antigo que o atual');
  await page.click('.modal button:has-text("Importar 1")');
  await expect(page.locator('.gcard')).toHaveCount(2);
  expect((await readDraft(page, 'rawg-1002')).updatedAt).toBe('2026-10-14T10:00:00.000Z'); // o atual ficou
});
