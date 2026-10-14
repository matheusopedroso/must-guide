import { EMPTY_NOTE } from '@/config/trophies';
import { hasRichContent } from './html';

// Formato do guia. É o mesmo documento do Firestore (guides/{gameId}) e do rascunho no navegador.
export const DRAFT_VERSION = 1;

export const createDraft = (game) => ({
  v: DRAFT_VERSION,
  gameId: game.id,
  game: { id: game.id, title: game.title, cover: game.cover ?? null },
  status: 'draft', // draft | published (publicado = qualquer um lê; ver firestore.rules)
  publishedAt: null, // ISO da 1ª publicação
  tabs: [], // abas opcionais ativadas (ids de config/guideTabs)
  versions: [], // listas de troféus da PSN: [{ id, name, platform, service }] — a 1ª é a principal
  trophies: {}, // anotações por trophyId no formato de EMPTY_NOTE (config/trophies), só as preenchidas
  stats: { difficulty: 0, playthroughs: 0, hours: 0 }, // visão geral do guia (0 = não informado) — config/guide
  guide: [], // aba Guia: seções [{ id, title, body (HTML), trophies: [trophyId] }] — utils/sections
  roadmap: [], // aba Roadmap: etapas no mesmo formato
  tips: [], // aba Dicas: dicas no mesmo formato
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
  !d.versions.length &&
  !d.tabs.length &&
  !Object.keys(d.trophies).length &&
  !Object.values(d.stats).some(Boolean) &&
  !d.guide?.length &&
  !d.roadmap?.length &&
  !d.tips?.length;

// Mais recente entre duas cópias (pelo updatedAt)
export const editedAt = (d) => (d?.updatedAt ? Date.parse(d.updatedAt) || 0 : 0);

export const GUIDE_STATUS = {
  draft: { label: 'Rascunho', tone: 'neutral' },
  published: { label: 'Publicado', tone: 'success' },
};

// Resumo para listas (Meus guias): só o que o card mostra
export function summarizeGuide(g, source) {
  return {
    gameId: g.gameId,
    title: g.game?.title ?? g.gameId,
    cover: g.game?.cover ?? null,
    status: g.status === 'published' ? 'published' : 'draft',
    updatedAt: g.updatedAt ?? null,
    platforms: (g.versions ?? []).map((v) => v.platform).filter(Boolean),
    tips: Object.values(g.trophies ?? {}).filter((n) => hasRichContent(n.tip)).length,
    difficulty: g.stats?.difficulty ?? 0,
    source, // cloud | local (só neste navegador)
  };
}
