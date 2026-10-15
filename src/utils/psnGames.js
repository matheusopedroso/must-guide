import { TROPHY_TYPES } from '@/config/trophies';
import { matchScore } from './text';

// Lista "Meus jogos da PSN" (biblioteca → aba PSN): filtros, ordenação e totais sobre os jogos da conta
// (GET /api/trophies/titles → [{ id, name, icon, platform, counts, earned, progress, lastPlayed }]).

export const isPlatinum = (g) => (g.earned?.platinum ?? 0) > 0;

export const PSN_STATUS = [
  { id: '', label: 'Todos', test: () => true },
  { id: 'platinum', label: 'Platinados', test: isPlatinum },
  { id: 'pending', label: 'Platina pendente', test: (g) => g.counts.platinum > 0 && !isPlatinum(g) },
  { id: 'complete', label: '100%', test: (g) => g.progress === 100 },
  { id: 'progress', label: 'Em andamento', test: (g) => g.progress > 0 && g.progress < 100 },
  { id: 'notstarted', label: 'Não começados', test: (g) => g.progress === 0 },
];
const STATUS_MAP = Object.fromEntries(PSN_STATUS.map((s) => [s.id, s]));

export const PSN_SORTS = [
  { id: 'recent', label: 'Mais recentes' },
  { id: 'progress', label: 'Maior progresso' },
  { id: 'name', label: 'Nome (A–Z)' },
];

// "PS4,PSVITA" (cross-buy) → ['PS4', 'PSVITA']
export const platformsOf = (g) => g.platform.split(',').map((p) => p.trim()).filter(Boolean);

// Plataformas presentes na conta, na ordem PS5 → PS4 → PS3 → Vita
const ORDER = ['PS5', 'PS4', 'PS3', 'PSVITA', 'PSPC'];
export const allPlatforms = (games) =>
  [...new Set(games.flatMap(platformsOf))].sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));

const SORTERS = {
  recent: (a, b) => (b.lastPlayed ?? '').localeCompare(a.lastPlayed ?? ''),
  progress: (a, b) => b.progress - a.progress || (b.lastPlayed ?? '').localeCompare(a.lastPlayed ?? ''),
  name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
};

export function filterPsnGames(games, { status = '', platform = '', term = '', sort = 'recent' } = {}) {
  const test = STATUS_MAP[status]?.test ?? (() => true);
  const t = term.trim();
  return games
    .filter((g) => test(g) && (!platform || platformsOf(g).includes(platform)) && (!t || matchScore(g.name, t) >= 50))
    .sort(SORTERS[sort] ?? SORTERS.recent);
}

// Totais: jogos, platinas, 100%, média de conclusão e troféus conquistados por tipo
export function psnStats(games) {
  const earned = Object.fromEntries(TROPHY_TYPES.map((t) => [t.id, 0]));
  for (const g of games) for (const t of TROPHY_TYPES) earned[t.id] += g.earned?.[t.id] ?? 0;
  return {
    games: games.length,
    platinum: games.filter(isPlatinum).length,
    complete: games.filter((g) => g.progress === 100).length,
    average: games.length ? Math.round(games.reduce((n, g) => n + g.progress, 0) / games.length) : 0,
    earned,
  };
}
