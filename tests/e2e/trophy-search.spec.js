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

// Nada do mesmo jogo (só parecido ou em japonês): não escolhe sozinho — mostra "não encontrada"
test('busca automática: parecido não vira a lista do jogo', async ({ page }) => {
  await seed(page, []);
  const r = (id, name) => ({ id, name, platform: 'PS4', service: 'trophy', icon: null, counts: { platinum: 1, gold: 0, silver: 0, bronze: 1 }, score: 80, sources: ['ikemenzi'] });
  await page.route('**/api/trophies/find**', (route) =>
    route.fulfill({ json: { results: [r('NPWR1_00', '恋愛０キロメートルＶ'), r('NPWR2_00', 'Elden Ring Nightreign Deluxe Pack Extra')] } }),
  );
  await page.goto('/jogo/rawg-1000?aba=trofeus'); // Elden Ring Nightreign
  await expect(page.locator('#game-trophies')).toContainText('Lista de troféus não encontrada');
});

// Sincronizar um jogo com a PSN sem criar guia: a aba Troféus mostra o seu progresso; a lista "Meus jogos da PSN"
// abre o jogo; escolher à mão quando a busca não acha
test('sincronizar jogo com a PSN sem guia', async ({ page }) => {
  await seed(page, []);
  await page.goto('/jogo/rawg-1002?aba=trofeus'); // Ghost of Yōtei (na sua conta)
  const section = page.locator('#game-trophies');
  await expect(section).toContainText('Achado em: Sua conta');
  await section.locator('button:has-text("Sincronizar com a PSN")').click();

  await expect(section).toContainText('Sincronizado com a PSN');
  await expect(section).toContainText(/Você: \d+ de \d+ troféus/);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mg:library'))?.links?.['rawg-1002']?.id)).toBe('NPWR38432_00');

  // Biblioteca → Meus jogos da PSN: a lista sincronizada abre o jogo
  await page.goto('/biblioteca?aba=psn');
  await expect(page.locator('.row:has-text("Ghost of Yōtei") [aria-label="Abrir Ghost of Yōtei"]')).toHaveAttribute('href', '/jogo/rawg-1002?aba=trofeus');

  // Desvincular volta para a sugestão
  await page.goto('/jogo/rawg-1002?aba=trofeus');
  await section.locator('button:has-text("Desvincular")').click();
  await expect(section.locator('button:has-text("Sincronizar com a PSN")')).toBeVisible();

  // Sem sugestão: escolher a lista à mão (sua conta)
  await page.goto('/jogo/rawg-1000?aba=trofeus'); // Elden Ring Nightreign: nenhum acervo tem
  await section.locator('button:has-text("Escolher a lista")').click();
  await page.locator('.modal .chip:has-text("Minha conta")').click();
  await page.locator('.modal').getByPlaceholder('Filtrar seus jogos').fill('god of war');
  await page.locator('.modal .title:has-text("God of War")').click();
  await expect(section).toContainText('Sincronizado com a PSN');
  await expect(section).toContainText('God of War');
});
