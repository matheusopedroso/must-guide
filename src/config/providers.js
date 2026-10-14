// Metadados dos provedores de dados de jogos (rótulos, links e crédito)
export const PROVIDERS = {
  rawg: { name: 'RAWG', url: 'https://rawg.io' },
  igdb: { name: 'IGDB', url: 'https://www.igdb.com' },
};

// O id do jogo carrega o provedor: "rawg-3498", "igdb-1942"
export const providerOf = (gameId = '') => String(gameId).split('-')[0];

export const providerInfo = (key) => PROVIDERS[key] ?? null;
