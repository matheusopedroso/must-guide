import { computed } from 'vue';
import { isEmptyNote } from '@/utils/guideDraft';
import { extractTrophyRefs } from '@/utils/trophyRef';
import { EMPTY_NOTE } from '@/config/trophies';

// Anotações do guia por troféu (formato em EMPTY_NOTE de config/trophies). Valem para todas as versões
// (PS4/PS5): a chave é o trophyId, que é o mesmo nas listas equivalentes.
export function useTrophyNotes(draft) {
  const notes = () => draft.value?.trophies ?? {};

  // Sempre no formato completo (anotações antigas ganham os campos novos vazios).
  // Memorizado por anotação: o mesmo objeto volta enquanto ela não muda → só o troféu editado redesenha.
  const merged = new WeakMap();
  const getNote = (trophyId) => {
    const note = notes()[trophyId];
    if (!note) return EMPTY_NOTE;
    if (!merged.has(note)) merged.set(note, Object.freeze({ ...EMPTY_NOTE, ...note }));
    return merged.get(note);
  };

  function updateNote(trophyId, patch) {
    if (!draft.value) return;
    const next = { ...getNote(trophyId), ...patch };
    if (isEmptyNote(next)) return void delete draft.value.trophies[trophyId];
    // Guarda só os campos preenchidos (rascunho e futuro documento menores)
    draft.value.trophies[trophyId] = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
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
