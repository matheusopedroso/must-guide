import { EMPTY_NOTE } from '@/config/trophies';
import { hasRichContent } from './html';

// Formato do guia em edição. É o mesmo documento que irá para o Firestore quando houver salvamento.
export const DRAFT_VERSION = 1;

export const createDraft = (game) => ({
  v: DRAFT_VERSION,
  gameId: game.id,
  game: { id: game.id, title: game.title, cover: game.cover ?? null },
  tabs: [], // abas opcionais ativadas (ids de config/guideTabs)
  versions: [], // listas de troféus da PSN: [{ id, name, platform, service }] — a 1ª é a principal
  trophies: {}, // anotações por trophyId no formato de EMPTY_NOTE (config/trophies), só as preenchidas
  stats: { difficulty: 0, playthroughs: 0, hours: 0 }, // visão geral do guia (0 = não informado) — config/guide
  updatedAt: null,
});

// Garante todos os campos ao ler um rascunho antigo ou incompleto
export function normalizeDraft(raw, game) {
  const base = createDraft(game);
  return { ...base, ...raw, game: base.game, stats: { ...base.stats, ...raw?.stats } };
}

// Vazia = nenhum campo preenchido (texto sem conteúdo real também conta como vazio)
export const isEmptyNote = (n) =>
  !n || Object.keys(EMPTY_NOTE).every((key) => (key === 'tip' ? !hasRichContent(n.tip) : !n[key]));
