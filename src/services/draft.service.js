// Rascunho do guia guardado no navegador (localStorage), 1 chave por jogo.
// Quando o guia passar a ser salvo no Firestore, só este arquivo muda.
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
