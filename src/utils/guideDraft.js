// Formato do guia em edição. É o mesmo documento que irá para o Firestore quando houver salvamento.
export const DRAFT_VERSION = 1;

export const createDraft = (game) => ({
  v: DRAFT_VERSION,
  gameId: game.id,
  game: { id: game.id, title: game.title, cover: game.cover ?? null },
  tabs: [], // abas opcionais ativadas (ids de config/guideTabs)
  versions: [], // listas de troféus da PSN: [{ id, name, platform, service }] — a 1ª é a principal
  trophies: {}, // anotações por trophyId: { tip, missable, online } (só as preenchidas)
  updatedAt: null,
});

// Garante todos os campos ao ler um rascunho antigo ou incompleto
export function normalizeDraft(raw, game) {
  const base = createDraft(game);
  return { ...base, ...raw, game: base.game };
}

export const isEmptyNote = (n) => !n || (!n.tip?.trim() && !n.missable && !n.online);
