import { inject, onBeforeUnmount, provide, ref, watch } from 'vue';
import { loadDraft, saveDraft } from '@/services/draft.service';
import { createDraft, normalizeDraft } from '@/utils/guideDraft';

const KEY = Symbol('guide-draft');
const SAVE_DELAY = 600;

// Dono do rascunho do guia (na página do editor). As abas pegam com useGuideDraft().
// Grava agrupado: várias edições seguidas viram uma escrita só.
export function provideGuideDraft(game) {
  const draft = ref(null);
  const status = ref('idle'); // idle | pending | saved | error
  let timer = null;
  let skipNext = false;

  function flush() {
    clearTimeout(timer);
    timer = null;
    if (!draft.value || status.value !== 'pending') return;
    draft.value.updatedAt = new Date().toISOString();
    skipNext = true; // a linha acima não deve agendar outra gravação
    status.value = saveDraft(draft.value) ? 'saved' : 'error';
  }

  // Troca de jogo: grava o anterior e carrega (ou cria) o rascunho do novo
  watch(
    () => game.value?.id,
    (id) => {
      flush();
      skipNext = true;
      status.value = 'idle';
      draft.value = id ? normalizeDraft(loadDraft(id) ?? createDraft(game.value), game.value) : null;
    },
    { immediate: true },
  );

  watch(
    draft,
    () => {
      if (skipNext) return (skipNext = false);
      status.value = 'pending';
      clearTimeout(timer);
      timer = setTimeout(flush, SAVE_DELAY);
    },
    { deep: true },
  );

  // Não perde a última edição ao minimizar o app ou sair da página
  const onHidden = () => document.visibilityState === 'hidden' && flush();
  document.addEventListener('visibilitychange', onHidden);
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onHidden);
    flush();
  });

  const api = { draft, status, flush };
  provide(KEY, api);
  return api;
}

export const useGuideDraft = () => inject(KEY);
