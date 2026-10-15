// Ajudantes dos testes de ponta a ponta: guias de exemplo e preparo do navegador (localStorage).
// Os dados da PSN/RAWG/IGDB vêm dos mocks (tests/mocks/network): Ghost of Yōtei = rawg-1002, lista
// NPWR38432_00 com 10 troféus do jogo base (ids 0–9) e 10 da DLC "Lendas (DLC)" (grupo 001, ids 10–19).

export const YOTEI_LIST = { id: 'NPWR38432_00', name: 'Ghost of Yōtei', platform: 'PS5', service: 'trophy2' };

export const chip = (id, type, name) =>
  `<a href="#trofeu-${id}" data-trophy="${id}" data-type="${type}" class="trophy-ref" contenteditable="false">${name}</a>`;

// Guia do Ghost of Yōtei (publicado, com a lista vinculada). extra: campos a mais/sobrescritos
export const yoteiGuide = (extra = {}) => ({
  v: 1,
  guideId: 'rawg-1002',
  gameId: 'rawg-1002',
  game: { id: 'rawg-1002', title: 'Ghost of Yōtei', cover: null },
  status: 'published',
  tabs: [],
  versions: [YOTEI_LIST],
  trophies: {},
  stats: {},
  updatedAt: '2026-10-14T10:00:00.000Z',
  ...extra,
});

// Prepara o navegador: limpa tudo, grava os guias (navegador e "nuvem") e o login de mentira.
// admin: false = logado sem permissão de administrador · user: false = sem login
export async function seed(page, guides = [], { user = true, admin = true, cloud = true, local = true } = {}) {
  await page.goto('/');
  await page.evaluate(
    ({ guides, user, admin, cloud, local }) => {
      localStorage.clear();
      for (const g of guides) {
        const id = g.guideId ?? g.gameId;
        if (local) localStorage.setItem(`mg:guide-draft:${id}`, JSON.stringify(g));
        if (cloud) localStorage.setItem(`mock-cloud:${id}`, JSON.stringify(g));
      }
      if (user) localStorage.setItem('mock-user', '1');
      if (!admin) localStorage.setItem('mock-admin', '0');
      localStorage.setItem('mg:had-session', '1');
    },
    { guides, user, admin, cloud, local },
  );
}

// Lê um guia gravado no navegador. O app grava ~0,6 s depois de cada edição: em expect.poll, use ?.
// (um erro dentro do poll não é tentado de novo — só um valor diferente do esperado)
export const readDraft = (page, id) => page.evaluate((id) => JSON.parse(localStorage.getItem(`mg:guide-draft:${id}`)), id);

// Imagens do IGDB (sem internet nos testes): devolve um SVG no lugar
export async function fakeIgdbImages(page) {
  await page.context().route('https://images.igdb.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#3d5a80"/></svg>',
    }),
  );
}
