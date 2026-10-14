import { computed } from 'vue';
import { GUIDE_STATS } from '@/config/guide';

// Dificuldade, jogadas e horas do guia (no rascunho). Valores fora do limite são ajustados; vazio = 0.
export function useGuideStats(draft) {
  const stats = computed(() => draft.value?.stats ?? {});

  function update(id, raw) {
    if (!draft.value) return;
    const def = GUIDE_STATS.find((s) => s.id === id);
    const n = Math.round(Number(raw));
    draft.value.stats = {
      ...draft.value.stats,
      [id]: !raw || Number.isNaN(n) || n <= 0 ? 0 : Math.min(Math.max(n, def.min), def.max),
    };
  }

  return { stats, update };
}
