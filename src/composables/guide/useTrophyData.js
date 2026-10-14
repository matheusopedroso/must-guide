import { computed, toValue } from 'vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { fetchTrophyList, fetchTrophyProgress } from '@/services/trophies.service';

// Lista de troféus e progresso da conta da versão aberta (carregam em paralelo;
// trocar de versão cancela o anterior). withProgress: false → não pede o progresso (ex.: visitante).
export function useTrophyData(active, { withProgress = true } = {}) {
  const load = (fn) => (v, opts) => fn(v.id, v.service, opts);
  const { data: list, loading, error } = useAsyncState(active, load(fetchTrophyList));
  const progressSource = computed(() => (toValue(withProgress) ? active.value : null));
  const { data: progress } = useAsyncState(progressSource, load(fetchTrophyProgress));
  return { list, progress, loading, error, load };
}
