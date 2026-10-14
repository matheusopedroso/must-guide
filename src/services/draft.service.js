// Rascunho do guia guardado no navegador (localStorage), 1 chave por jogo.
// É a cópia local (offline/sem login); a da nuvem fica em guides.service.js (sincronia em useGuideDraft).
const PREFIX = 'mg:guide-draft:';
const key = (gameId) => `${PREFIX}${gameId}`;

export function loadDraft(gameId) {
  try {
    const raw = localStorage.getItem(key(gameId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // modo privado / armazenamento bloqueado
  }
}

export function saveDraft(draft) {
  try {
    localStorage.setItem(key(draft.gameId), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

// Todos os rascunhos deste navegador (lista "Meus guias")
export function listDrafts() {
  const drafts = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(PREFIX)) continue;
      const d = JSON.parse(localStorage.getItem(k));
      if (d?.gameId) drafts.push(d);
    }
  } catch {
    /* armazenamento bloqueado ou item corrompido */
  }
  return drafts;
}
