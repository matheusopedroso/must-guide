// Formato único de jogo que o app recebe, seja qual for o provedor.
// id = "<provedor>-<id original>" → nunca colide entre RAWG e IGDB
export const makeGame = (provider, data) => ({
  id: `${provider}-${data.providerId}`,
  provider,
  providerId: String(data.providerId),
  title: data.title,
  slug: data.slug ?? null,
  summary: data.summary ?? '',
  cover: data.cover ?? null,
  year: data.year ?? null,
  platforms: data.platforms ?? [],
  genres: data.genres ?? [],
  rating: data.rating ?? null,
  kind: data.kind ?? null, // não é o jogo principal: "Edição: Director's Cut", "Remaster", "DLC"… (null = principal)
  // Só nos detalhes (getById):
  backdrop: data.backdrop ?? null, // imagem horizontal (artwork) para o fundo do topo das páginas
  trailer: data.trailer ?? null, // link do YouTube
  timeToBeat: data.timeToBeat ?? null, // horas: { story, extra, complete } (IGDB) ou { average } (RAWG)
  related: data.related, // outras versões e relacionados (lista de jogos); ausente = não buscado
  sourceUrl: data.sourceUrl ?? null,
  partial: !!data.partial, // true = veio de lista/busca sem resumo
});

// Siglas curtas para as plataformas mais comuns
const PLATFORM_SHORT = {
  'PlayStation 5': 'PS5',
  'PlayStation 4': 'PS4',
  'PlayStation 3': 'PS3',
  'PlayStation 2': 'PS2',
  PlayStation: 'PS1',
  'PS Vita': 'Vita',
  'Nintendo Switch': 'Switch',
  'Xbox Series S/X': 'XSX',
  'Xbox One': 'XONE',
  'Xbox 360': 'X360',
  macOS: 'Mac',
};

export const shortPlatform = (name) => PLATFORM_SHORT[name] ?? name;

export const yearFrom = (value) => {
  if (!value) return null;
  const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.getUTCFullYear();
};

// Data de N dias atrás em YYYY-MM-DD
export const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
