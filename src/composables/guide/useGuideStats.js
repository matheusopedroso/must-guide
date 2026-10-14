import { computed } from 'vue';
import { GUIDE_STATS } from '@/config/guide';

// Ajusta ao limite do campo; vazio, inválido ou ≤ 0 = 0 (não informado)
export function clampStat(id, raw) {
  const def = GUIDE_STATS.find((s) => s.id === id);
  const n = Math.round(Number(raw));
  return !raw || Number.isNaN(n) || n <= 0 ? 0 : Math.min(Math.max(n, def.min), def.max);
}

// Dificuldade, jogadas e horas do guia (no rascunho). save() grava tudo de uma vez.
export function useGuideStats(draft) {
  const stats = computed(() => draft.value?.stats ?? {});
  const filled = computed(() => GUIDE_STATS.some((s) => stats.value[s.id]));

  function save(values) {
    if (!draft.value) return;
    draft.value.stats = Object.fromEntries(GUIDE_STATS.map((s) => [s.id, clampStat(s.id, values[s.id])]));
  }

  return { stats, filled, save };
}
