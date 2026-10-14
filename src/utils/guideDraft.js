import { EMPTY_NOTE } from '@/config/trophies';
import { hasRichContent } from './html';

// Formato do guia. É o mesmo documento do Firestore (guides/{gameId}) e do rascunho no navegador.
export const DRAFT_VERSION = 1;

export const createDraft = (game) => ({
  v: DRAFT_VERSION,
  gameId: game.id,
  game: { id: game.id, title: game.title, cover: game.cover ?? null },
  status: 'draft', // draft | published (publicado = qualquer um lê; ver firestore.rules)
  tabs: [], // abas opcionais ativadas (ids de config/guideTabs)
  versions: [], // listas de troféus da PSN: [{ id, name, platform, service }] — a 1ª é a principal
  trophies: {}, // anotações por trophyId no formato de EMPTY_NOTE (config/trophies), só as preenchidas
  stats: { difficulty: 0, playthroughs: 0, hours: 0 }, // visão geral do guia (0 = não informado) — config/guide
  updatedAt: null, // ISO da última edição (decide entre a cópia do navegador e a da nuvem)
});

// Garante todos os campos ao ler um rascunho antigo ou incompleto
export function normalizeDraft(raw, game) {
  const base = createDraft(game);
  return { ...base, ...raw, game: base.game, stats: { ...base.stats, ...raw?.stats } };
}

// Vazia = nenhum campo preenchido (texto sem conteúdo real também conta como vazio)
export const isEmptyNote = (n) =>
  !n || Object.keys(EMPTY_NOTE).every((key) => (key === 'tip' ? !hasRichContent(n.tip) : !n[key]));

// Guia sem nada além do jogo: não vale a pena gravar na nuvem
export const isBlankDraft = (d) =>
  !d.versions.length && !d.tabs.length && !Object.keys(d.trophies).length && !Object.values(d.stats).some(Boolean);

// Mais recente entre duas cópias (pelo updatedAt)
export const editedAt = (d) => (d?.updatedAt ? Date.parse(d.updatedAt) || 0 : 0);
