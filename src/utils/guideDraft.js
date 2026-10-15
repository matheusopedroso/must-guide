import { EMPTY_NOTE } from '@/config/trophies';
import { GUIDE_TABS } from '@/config/guideTabs';
import { dlcGuideId } from './guideIds';
import { toPages } from './pages';
import { hasRichContent } from './html';

// Formato do guia. É o mesmo documento do Firestore (guides/{gameId}) e do rascunho no navegador.
export const DRAFT_VERSION = 1;

// Dados do jogo guardados no próprio guia: abrir, editar e ler não dependem da API de jogos (nem do provedor
// ativo — trocar RAWG ⇄ IGDB não "perde" os guias). Só entram campos preenchidos, por cima da cópia salva:
// um jogo vindo da busca (sem resumo) não apaga o resumo já guardado.
const GAME_FIELDS = ['id', 'provider', 'providerId', 'title', 'slug', 'summary', 'cover', 'year', 'platforms', 'genres', 'sourceUrl', 'kind', 'backdrop', 'trailer', 'timeToBeat', 'detailed'];
const filled = (v) => v != null && v !== '' && !(Array.isArray(v) && !v.length);

// detailed = versão dos detalhes guardados: subir quando os detalhes ganharem campos novos (as cópias antigas
// são completadas uma vez). 2 = fundo, trailer e tempo para zerar.
const DETAIL_VERSION = 2;

export function gameSnapshot(game, saved = null) {
  const snap = { ...saved };
  for (const key of GAME_FIELDS) if (filled(game?.[key])) snap[key] = game[key];
  if (game?.partial === false) snap.detailed = DETAIL_VERSION; // veio dos detalhes da API
  return snap;
}

// Cópia incompleta (antiga, ou da busca sem os detalhes) → vale completar com a API
export const isPartialSnapshot = (g) => (g?.detailed ?? 0) < DETAIL_VERSION;

// dlc: { groupId, name, icon } → guia separado da DLC (guideId "jogo~grupo", parentId = jogo)
export const createDraft = (game, { dlc = null } = {}) => ({
  v: DRAFT_VERSION,
  guideId: dlc ? dlcGuideId(game.id, dlc.groupId) : game.id, // id do documento (guides/{guideId})
  gameId: game.id,
  parentId: dlc ? game.id : null, // guia de DLC: o guia do jogo base
  dlc: dlc ? { groupId: dlc.groupId, name: dlc.name ?? '', icon: dlc.icon ?? null } : null,
  game: gameSnapshot(game),
  status: 'draft', // draft | published (publicado = qualquer um lê; ver firestore.rules)
  publishedAt: null, // ISO da 1ª publicação
  tabs: [], // abas opcionais ativadas (ids de config/guideTabs)
  versions: [], // listas de troféus da PSN: [{ id, name, platform, service }] — a 1ª é a principal
  trophies: {}, // anotações por trophyId no formato de EMPTY_NOTE (config/trophies), só as preenchidas
  stats: { difficulty: 0, playthroughs: 0, hours: 0 }, // visão geral do guia (0 = não informado) — config/guide
  guide: [], // aba Guia (paginada): páginas [{ id, title, sections: [{ id, title, body (HTML), trophies }] }] — utils/pages
  roadmap: [], // aba Roadmap: etapas no mesmo formato
  tips: [], // aba Dicas: dicas no mesmo formato
  collectibles: [], // Coletáveis · walkthrough: Detonado · missables: Perdíveis · online: Online (mesmo formato)
  walkthrough: [],
  missables: [],
  online: [],
  collectibleTypes: {}, // tipos de coletável → troféu: { Artefato: { trophy: 12 } } — utils/collectibles
  credits: [], // créditos do guia: [{ id, name, url, role }] — utils/collectibles (createCredit)
  updatedAt: null, // ISO da última edição (decide entre a cópia do navegador e a da nuvem)
});

// Abas paginadas (config/guideTabs → sections.paged): guias antigos (seções soltas) viram uma página
const PAGED_KEYS = GUIDE_TABS.filter((t) => t.sections?.paged).map((t) => t.sections.key);

// Garante todos os campos ao ler um rascunho antigo ou incompleto
export function normalizeDraft(raw, game) {
  const base = createDraft(game, { dlc: raw?.dlc });
  const draft = { ...base, ...raw, guideId: raw?.guideId ?? base.guideId, game: gameSnapshot(game, raw?.game), stats: { ...base.stats, ...raw?.stats } };
  for (const key of PAGED_KEYS) draft[key] = toPages(draft[key]);
  return draft;
}

// Vazia = nenhum campo preenchido (texto sem conteúdo real também conta como vazio)
export const isEmptyNote = (n) =>
  !n || Object.keys(EMPTY_NOTE).every((key) => (key === 'tip' ? !hasRichContent(n.tip) : !n[key]));

// Campos das abas de seções (config/guideTabs → sections.key)
const SECTION_KEYS = GUIDE_TABS.filter((t) => t.sections).map((t) => t.sections.key);

// Guia sem nada além do jogo: não vale a pena gravar na nuvem
export const isBlankDraft = (d) =>
  !d.versions.length &&
  !d.tabs.length &&
  !Object.keys(d.trophies).length &&
  !Object.values(d.stats).some(Boolean) &&
  !d.credits?.length &&
  !SECTION_KEYS.some((k) => d[k]?.length);

// Mais recente entre duas cópias (pelo updatedAt)
export const editedAt = (d) => (d?.updatedAt ? Date.parse(d.updatedAt) || 0 : 0);

export const GUIDE_STATUS = {
  draft: { label: 'Rascunho', tone: 'neutral' },
  published: { label: 'Publicado', tone: 'success' },
};

// Resumo para listas (Meus guias): só o que o card mostra
export function summarizeGuide(g, source) {
  return {
    guideId: g.guideId ?? g.gameId,
    gameId: g.gameId,
    title: g.dlc ? g.dlc.name || 'DLC' : (g.game?.title ?? g.gameId),
    gameTitle: g.game?.title ?? '',
    dlc: !!g.dlc,
    dlcGroup: g.dlc?.groupId ?? null,
    dlcIcon: g.dlc?.icon ?? null,
    cover: g.game?.cover ?? null,
    status: g.status === 'published' ? 'published' : 'draft',
    updatedAt: g.updatedAt ?? null,
    platforms: (g.versions ?? []).map((v) => v.platform).filter(Boolean),
    tips: Object.values(g.trophies ?? {}).filter((n) => hasRichContent(n.tip)).length,
    difficulty: g.stats?.difficulty ?? 0,
    source, // cloud | local (só neste navegador)
  };
}
