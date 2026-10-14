import { isEmptyNote } from '@/utils/guideDraft';

const EMPTY = Object.freeze({ tip: '', missable: false, online: false });

// Anotações do guia por troféu (dica, perdível, online). Valem para todas as versões
// (PS4/PS5): a chave é o trophyId, que é o mesmo nas listas equivalentes.
export function useTrophyNotes(draft) {
  const notes = () => draft.value?.trophies ?? {};

  const getNote = (trophyId) => notes()[trophyId] ?? EMPTY;

  function updateNote(trophyId, patch) {
    if (!draft.value) return;
    const next = { ...getNote(trophyId), ...patch };
    if (isEmptyNote(next)) delete draft.value.trophies[trophyId]; // guarda só o que foi preenchido
    else draft.value.trophies[trophyId] = next;
  }

  return { getNote, updateNote };
}
