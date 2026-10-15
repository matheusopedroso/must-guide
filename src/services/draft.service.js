import { guideIdOf } from '@/utils/guideIds';

// Rascunho do guia guardado no navegador (localStorage), 1 chave por guia (jogo ou DLC).
// É a cópia local (offline/sem login); a da nuvem fica em guides.service.js (sincronia em useGuideDraft).
const PREFIX = 'mg:guide-draft:';
const key = (guideId) => `${PREFIX}${guideId}`;

export function loadDraft(guideId) {
  try {
    const raw = localStorage.getItem(key(guideId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // modo privado / armazenamento bloqueado
  }
}

export function saveDraft(draft) {
  try {
    localStorage.setItem(key(guideIdOf(draft)), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

// Tira o guia deste navegador: rascunho e progresso pessoal (mg:collected:<guideId>, usePersonalProgress)
export function deleteDraft(guideId) {
  try {
    localStorage.removeItem(key(guideId));
    localStorage.removeItem(`mg:collected:${guideId}`);
  } catch {
    /* armazenamento bloqueado */
  }
}

// Guia mudou de id (trocou o jogo): leva junto os coletáveis marcados neste navegador
export function moveCollected(fromId, toId) {
  try {
    const raw = localStorage.getItem(`mg:collected:${fromId}`);
    if (raw) localStorage.setItem(`mg:collected:${toId}`, raw);
  } catch {
    /* armazenamento bloqueado */
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
      if (guideIdOf(d)) drafts.push(d);
    }
  } catch {
    /* armazenamento bloqueado ou item corrompido */
  }
  return drafts;
}
