import { computed, toValue } from 'vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { fetchTrophyList, fetchTrophyProgress } from '@/services/trophies.service';
import { scopeList, scopeProgress } from '@/utils/trophyScope';

// Lista de troféus e progresso da conta da versão aberta (carregam em paralelo;
// trocar de versão cancela o anterior). withProgress: false → não pede o progresso (ex.: visitante).
// scope: o guia (ref) → list/progress só com os troféus dele (jogo base ou a DLC); fullList = lista inteira.
export function useTrophyData(active, { withProgress = true, scope = null } = {}) {
  const load = (fn) => (v, opts) => fn(v.id, v.service, opts);
  const { data: fullList, loading, error } = useAsyncState(active, load(fetchTrophyList));
  const progressSource = computed(() => (toValue(withProgress) ? active.value : null));
  const { data: fullProgress } = useAsyncState(progressSource, load(fetchTrophyProgress));

  const list = computed(() => (scope ? scopeList(fullList.value, toValue(scope)) : fullList.value));
  const progress = computed(() => (scope ? scopeProgress(fullProgress.value, list.value) : fullProgress.value));
  return { list, progress, fullList, loading, error, load };
}
