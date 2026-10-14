import { inject, onBeforeUnmount, provide, ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';

// --- Contexto: coletáveis do guia para quem está dentro dele (editor de texto, leitura) ---
// { items: ref([{ id, name, region, … }]), byId: ref(Map), collected?: ref(Set), toggle?(id), open?(id) }
const KEY = Symbol('collectibles');
export const provideCollectibleContext = (ctx) => provide(KEY, ctx);
export const useCollectibleContext = () => inject(KEY, null);

// --- Progresso pessoal: quais coletáveis a pessoa já marcou neste guia ---
// Sempre no navegador (mg:collected:<jogo>); logado, também na conta (users/{uid}/progress/{jogo}),
// para ver o mesmo no celular e no PC. Vale a cópia editada por último. Na nuvem grava agrupado (1,5 s).
const CLOUD_DELAY = 1500;
const localKey = (gameId) => `mg:collected:${gameId}`;

function readLocal(gameId) {
  try {
    const raw = JSON.parse(localStorage.getItem(localKey(gameId)) ?? 'null');
    return raw ? { collected: raw.collected ?? [], editedAt: raw.editedAt ?? '' } : null;
  } catch {
    return null;
  }
}

function writeLocal(gameId, data) {
  try {
    localStorage.setItem(localKey(gameId), JSON.stringify(data));
  } catch {
    /* sem armazenamento */
  }
}

export function useCollected(gameId) {
  const { enabled, user, whenReady } = useAuth();
  const collected = ref(new Set());
  let editedAt = '';
  let timer = null;
  let dirty = false;

  async function load(id) {
    clearTimeout(timer);
    dirty = false;
    const local = readLocal(id);
    collected.value = new Set(local?.collected ?? []);
    editedAt = local?.editedAt ?? '';
    if (!id || !enabled) return;

    await whenReady();
    if (!user.value || gameId.value !== id) return;
    try {
      const { fetchProgress } = await import('@/services/progress.service');
      const remote = await fetchProgress(user.value.uid, id);
      if (gameId.value !== id) return;
      if (remote && (remote.editedAt ?? '') >= editedAt) {
        collected.value = new Set(remote.collected ?? []);
        editedAt = remote.editedAt ?? '';
        writeLocal(id, { collected: remote.collected ?? [], editedAt });
      } else if (local?.collected.length) {
        schedule(0); // a do navegador é mais nova (marcou sem login/sem internet): sobe
      }
    } catch (e) {
      console.error('[coletáveis] Falha ao ler o progresso', e);
    }
  }

  async function flush() {
    clearTimeout(timer);
    if (!dirty || !user.value || !gameId.value) return;
    dirty = false;
    try {
      const { saveProgress } = await import('@/services/progress.service');
      await saveProgress(user.value.uid, gameId.value, { collected: [...collected.value], editedAt });
    } catch (e) {
      dirty = true; // tenta de novo na próxima marcação ou ao sair
      console.error('[coletáveis] Falha ao salvar o progresso', e);
    }
  }

  function schedule(delay = CLOUD_DELAY) {
    if (!user.value) return;
    dirty = true;
    clearTimeout(timer);
    timer = setTimeout(flush, delay);
  }

  function toggle(itemId) {
    const next = new Set(collected.value);
    next.has(itemId) ? next.delete(itemId) : next.add(itemId);
    collected.value = next;
    editedAt = new Date().toISOString();
    writeLocal(gameId.value, { collected: [...next], editedAt });
    schedule();
  }

  watch(gameId, load, { immediate: true });
  watch(user, () => load(gameId.value)); // entrou/saiu: pega o progresso da conta

  const onHidden = () => document.visibilityState === 'hidden' && flush();
  document.addEventListener('visibilitychange', onHidden);
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onHidden);
    flush();
  });

  return { collected, toggle };
}
