import { DEFAULT_STATUS } from '@/config/status';

// Documento completo do catálogo (games/{id})
export const toGameDoc = (g) => ({
  title: g.title,
  slug: g.slug ?? null,
  summary: g.summary ?? '',
  coverId: g.coverId ?? null,
  year: g.year ?? null,
  platforms: g.platforms ?? [],
  genres: g.genres ?? [],
  rating: g.rating ?? null,
  igdbUrl: g.igdbUrl ?? null,
});

// Entrada leve da biblioteca — só o necessário para desenhar o card
export const toLibraryEntry = (g, status = DEFAULT_STATUS) => ({
  gameId: g.id,
  title: g.title,
  coverId: g.coverId ?? null,
  year: g.year ?? null,
  platforms: (g.platforms ?? []).slice(0, 4),
  status,
});

// Resumo do jogo guardado dentro do guia (lista de guias sem leituras extras)
export const toGuideGame = (g) => ({
  id: g.id ?? g.gameId,
  title: g.title,
  coverId: g.coverId ?? null,
});
