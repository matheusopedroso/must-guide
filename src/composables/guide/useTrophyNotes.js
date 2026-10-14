import { computed } from 'vue';
import { isEmptyNote } from '@/utils/guideDraft';
import { extractTrophyRefs } from '@/utils/trophyRef';
import { TROPHY_FLAGS } from '@/config/trophies';

const EMPTY = Object.freeze({ tip: '', ...Object.fromEntries(TROPHY_FLAGS.map((f) => [f.id, false])) });

// Anotações do guia por troféu (como conseguir + marcações de config/trophies). Valem para todas as versões
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

  // Quem cita quem: Map(troféu citado → [troféus cujo "Como conseguir" o menciona]).
  // Recalcula só quando as anotações mudam; leitura por regex (rápida, sem montar HTML).
  const backlinks = computed(() => {
    const map = new Map();
    for (const [sourceId, note] of Object.entries(notes())) {
      if (!note.tip) continue;
      const source = Number(sourceId);
      for (const target of extractTrophyRefs(note.tip)) {
        if (target === source) continue;
        if (!map.has(target)) map.set(target, []);
        map.get(target).push(source);
      }
    }
    return map;
  });

  return { getNote, updateNote, backlinks };
}
