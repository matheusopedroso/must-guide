// Rascunho do guia guardado no navegador (localStorage), 1 chave por jogo.
// É a cópia local (offline/sem login); a da nuvem fica em guides.service.js (sincronia em useGuideDraft).
const key = (gameId) => `mg:guide-draft:${gameId}`;

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
