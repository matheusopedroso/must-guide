import { onBeforeUnmount, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { fetchProgress, resetProgress, saveProgress } from '@/services/progress.service';

const FLUSH_DELAY = 1500;

// Checklist do guia: marca na hora na tela e agrupa os cliques numa só gravação
export function useGuideProgress() {
  const auth = useAuthStore();
  const done = ref({});
  const loading = ref(false);
  let guideId = null;
  let pending = {};
  let timer = null;

  async function load(id) {
    flush();
    guideId = id;
    loading.value = true;
    try {
      done.value = await fetchProgress(auth.uid, id);
    } finally {
      loading.value = false;
    }
  }

  function flush() {
    clearTimeout(timer);
    if (!guideId || !Object.keys(pending).length) return;
    const changes = pending;
    pending = {};
    saveProgress(auth.uid, guideId, changes).catch((e) => console.error('[progress]', e));
  }

  function toggle(stepId) {
    const checked = !done.value[stepId];
    if (checked) done.value[stepId] = true;
    else delete done.value[stepId];
    pending[stepId] = checked;
    clearTimeout(timer);
    timer = setTimeout(flush, FLUSH_DELAY);
  }

  async function reset() {
    clearTimeout(timer);
    pending = {};
    done.value = {};
    await resetProgress(auth.uid, guideId);
  }

  // Garante a gravação ao sair da tela ou minimizar o app no celular
  const onHidden = () => document.visibilityState === 'hidden' && flush();
  document.addEventListener('visibilitychange', onHidden);
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onHidden);
    flush();
  });

  return { done, loading, load, toggle, reset };
}
