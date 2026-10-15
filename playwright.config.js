import { defineConfig } from '@playwright/test';

// Testes de ponta a ponta (npm run test:e2e): o app de verdade num Chromium, com Firebase, RAWG, IGDB e PSN
// simulados (tests/mocks). Nada sai para a internet e nada do .env.local é usado (as variáveis abaixo vencem).
// 1ª vez no computador: npx playwright install chromium
const PORT = 5199;
const mocks = ['rawg', 'psn', 'igdb'].map((m) => `--import ./tests/mocks/network/${m}.mjs`).join(' ');

export default defineConfig({
  testDir: 'tests/e2e',
  workers: 1, // um servidor e um localStorage por vez: mais previsível
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 900 },
    colorScheme: 'dark',
    // Chromium já instalado em outro lugar (ex.: no ambiente do Claude): PW_CHROMIUM_PATH=/caminho
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `npx vite --config tests/mocks/vite.config.js --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      NODE_OPTIONS: mocks,
      GAMES_PROVIDER: 'rawg', // RAWG ativo; o IGDB também "configurado" (jogos igdb-… abrem pelo prefixo)
      RAWG_API_KEY: 'test',
      TWITCH_CLIENT_ID: 'test',
      TWITCH_CLIENT_SECRET: 'test',
      PSN_NPSSO: 'valid',
      VITE_FIREBASE_API_KEY: 'test',
      VITE_FIREBASE_AUTH_DOMAIN: 'test',
      VITE_FIREBASE_PROJECT_ID: 'test',
      VITE_FIREBASE_APP_ID: 'test',
    },
  },
});
