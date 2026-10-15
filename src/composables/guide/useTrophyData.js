import { computed, toValue } from 'vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { fetchTrophyProgress } from '@/services/trophies.service';
import { loadTrophyList } from '@/services/trophyListSource';
import { useAuth } from '@/composables/useAuth';
import { scopeList, scopeProgress } from '@/utils/trophyScope';

// Lista de troféus e progresso da conta da versão aberta (carregam em paralelo;
// trocar de versão cancela o anterior). withProgress: false → não pede o progresso (ex.: visitante).
// scope: o guia (ref) → list/progress só com os troféus dele (jogo base ou a DLC); fullList = lista inteira.
// prefer: de onde vem a lista — 'api' (editor: sempre a mais nova; o admin atualiza a cópia na nuvem) ou
// 'saved' (leitura: a cópia no Firestore, sem depender da API) — ver services/trophyListSource.js.
export function useTrophyData(active, { withProgress = true, scope = null, prefer = 'api' } = {}) {
  const { enabled, isAdmin } = useAuth();
  const load = (fn) => (v, opts) => fn(v.id, v.service, opts);
  const loadList = (v, opts) => loadTrophyList(v.id, v.service, { ...opts, prefer, canSave: enabled && isAdmin.value });
  const { data: fullList, loading, error } = useAsyncState(active, loadList);
  const progressSource = computed(() => (toValue(withProgress) ? active.value : null));
  const { data: fullProgress } = useAsyncState(progressSource, load(fetchTrophyProgress));

  const list = computed(() => (scope ? scopeList(fullList.value, toValue(scope)) : fullList.value));
  const progress = computed(() => (scope ? scopeProgress(fullProgress.value, list.value) : fullProgress.value));
  return { list, progress, fullList, loading, error, load, loadList };
}
