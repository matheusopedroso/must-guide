import { onBeforeUnmount, ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';

// Progresso pessoal de quem lê um guia: coletáveis marcados e troféus marcados como feitos (checklist).
// Sempre no navegador (mg:collected:<guideId>); logado, também na conta (users/{uid}/progress/{guideId}),
// para ver o mesmo no celular e no PC. Vale a cópia editada por último. Na nuvem grava agrupado (1,5 s).
// Formato: { collected: [ids], trophies: [trophyIds], editedAt }
const CLOUD_DELAY = 1500;
const localKey = (id) => `mg:collected:${id}`; // nome antigo da chave (já existia só com os coletáveis)

const fromRaw = (raw) => ({ collected: raw?.collected ?? [], trophies: raw?.trophies ?? [], editedAt: raw?.editedAt ?? '' });

function readLocal(id) {
  try {
    const raw = JSON.parse(localStorage.getItem(localKey(id)) ?? 'null');
    return raw ? fromRaw(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(id, data) {
  try {
    localStorage.setItem(localKey(id), JSON.stringify(data));
  } catch {
    /* sem armazenamento */
  }
}

export function usePersonalProgress(guideId) {
  const { enabled, user, whenReady } = useAuth();
  const collected = ref(new Set());
  const checked = ref(new Set()); // troféus marcados como feitos
  let editedAt = '';
  let timer = null;
  let dirty = false;

  const snapshot = () => ({ collected: [...collected.value], trophies: [...checked.value], editedAt });
  function apply(data) {
    collected.value = new Set(data.collected);
    checked.value = new Set(data.trophies);
    editedAt = data.editedAt;
  }

  async function load(id) {
    clearTimeout(timer);
    dirty = false;
    const local = readLocal(id);
    apply(local ?? fromRaw(null));
    if (!id || !enabled) return;

    await whenReady();
    if (!user.value || guideId.value !== id) return;
    try {
      const { fetchProgress } = await import('@/services/progress.service');
      const remote = await fetchProgress(user.value.uid, id);
      if (guideId.value !== id) return;
      if (remote && (remote.editedAt ?? '') >= editedAt) {
        apply(fromRaw(remote));
        writeLocal(id, snapshot());
      } else if (local && (local.collected.length || local.trophies.length)) {
        schedule(0); // a do navegador é mais nova (marcou sem login/sem internet): sobe
      }
    } catch (e) {
      console.error('[progresso] Falha ao ler', e);
    }
  }

  async function flush() {
    clearTimeout(timer);
    if (!dirty || !user.value || !guideId.value) return;
    dirty = false;
    try {
      const { saveProgress } = await import('@/services/progress.service');
      await saveProgress(user.value.uid, guideId.value, snapshot());
    } catch (e) {
      dirty = true; // tenta de novo na próxima marcação ou ao sair
      console.error('[progresso] Falha ao salvar', e);
    }
  }

  function schedule(delay = CLOUD_DELAY) {
    if (!user.value) return;
    dirty = true;
    clearTimeout(timer);
    timer = setTimeout(flush, delay);
  }

  // Marca/desmarca um id num dos conjuntos e grava (navegador na hora, nuvem agrupada)
  function toggleIn(set, id) {
    const next = new Set(set.value);
    next.has(id) ? next.delete(id) : next.add(id);
    set.value = next;
    editedAt = new Date().toISOString();
    writeLocal(guideId.value, snapshot());
    schedule();
  }

  watch(guideId, load, { immediate: true });
  watch(user, () => load(guideId.value)); // entrou/saiu: pega o progresso da conta

  const onHidden = () => document.visibilityState === 'hidden' && flush();
  document.addEventListener('visibilitychange', onHidden);
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onHidden);
    flush();
  });

  return {
    collected,
    toggleCollected: (id) => toggleIn(collected, id),
    checked,
    toggleChecked: (id) => toggleIn(checked, id),
  };
}
