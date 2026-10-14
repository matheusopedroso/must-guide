import { computed, inject, onBeforeUnmount, provide, ref, watch } from 'vue';
import { loadDraft, saveDraft } from '@/services/draft.service';
import { fetchGuide, saveGuide } from '@/services/guides.service';
import { useAuth } from '@/composables/useAuth';
import { createDraft, editedAt, isBlankDraft, normalizeDraft } from '@/utils/guideDraft';

const KEY = Symbol('guide-draft');
const LOCAL_DELAY = 600; // navegador: barato, grava logo
const CLOUD_DELAY = 2500; // Firestore: agrupa mais edições numa escrita só

// Dono do guia em edição (na página do editor). As abas pegam com useGuideDraft().
// Duas cópias: navegador (sempre) e Firestore (admin logado). Ao abrir, fica a mais recente:
// a da nuvem substitui a local, ou a local (editada sem internet / antes do login) sobe para a nuvem.
// status: idle | pending | local (só no navegador) | cloud (na nuvem) | error
export function provideGuideDraft(game) {
  const { user, isAdmin } = useAuth();
  const cloud = computed(() => !!user.value && isAdmin.value);

  const draft = ref(null);
  const status = ref('idle');
  const syncing = ref(false);
  let skipNext = false; // trocas feitas por aqui (carregar, carimbar a hora) não contam como edição
  let localTimer = null;
  let cloudTimer = null;
  let localDirty = false; // editado e ainda não gravado no navegador
  let cloudDirty = false; // gravado no navegador e ainda não na nuvem

  const replace = (value) => {
    skipNext = true;
    draft.value = value;
  };

  function flushLocal() {
    clearTimeout(localTimer);
    localTimer = null;
    if (!draft.value || !localDirty) return;
    localDirty = false;
    skipNext = true;
    draft.value.updatedAt = new Date().toISOString();
    const ok = saveDraft(draft.value);
    if (cloud.value) scheduleCloud();
    else status.value = ok ? 'local' : 'error';
  }

  function scheduleCloud(delay = CLOUD_DELAY) {
    cloudDirty = true;
    status.value = 'pending';
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(flushCloud, delay);
  }

  async function flushCloud() {
    clearTimeout(cloudTimer);
    cloudTimer = null;
    if (!cloudDirty || !draft.value || !cloud.value) return;
    cloudDirty = false;
    const snapshot = JSON.parse(JSON.stringify(draft.value)); // o que sobe não muda se editar durante o envio
    try {
      await saveGuide(snapshot, user.value.uid);
      if (!cloudDirty && !localDirty) status.value = 'cloud';
    } catch (e) {
      console.error('[guia] Falha ao salvar na nuvem', e);
      cloudDirty = true; // tenta de novo na próxima edição ou ao sair
      status.value = 'error';
    }
  }

  // Busca a cópia da nuvem e fica com a mais recente
  async function syncFromCloud() {
    const id = draft.value?.gameId;
    if (!id || !cloud.value) return;
    syncing.value = true;
    try {
      const remote = await fetchGuide(id);
      if (draft.value?.gameId !== id) return; // trocou de jogo no meio
      if (remote && editedAt(remote) >= editedAt(draft.value) && !localDirty) {
        replace(normalizeDraft(remote, game.value));
        saveDraft(draft.value);
        status.value = 'cloud';
      } else if (!isBlankDraft(draft.value) && editedAt(draft.value) > editedAt(remote)) {
        scheduleCloud(0); // a do navegador é mais nova: sobe já
      } else if (remote) {
        status.value = 'cloud';
      }
    } catch (e) {
      console.error('[guia] Falha ao ler da nuvem', e);
      status.value = 'error';
    } finally {
      syncing.value = false;
    }
  }

  // Troca de jogo: grava o anterior e abre o novo (navegador na hora, nuvem em seguida)
  watch(
    () => game.value?.id,
    (id) => {
      flushLocal();
      flushCloud();
      localDirty = cloudDirty = false;
      status.value = 'idle';
      replace(id ? normalizeDraft(loadDraft(id) ?? createDraft(game.value), game.value) : null);
      if (id) syncFromCloud();
    },
    { immediate: true },
  );

  // Entrou (ou virou admin) com o guia aberto: sincroniza
  watch(cloud, (on) => on && syncFromCloud());

  watch(
    draft,
    () => {
      if (skipNext) return (skipNext = false);
      localDirty = true;
      status.value = 'pending';
      clearTimeout(localTimer);
      localTimer = setTimeout(flushLocal, LOCAL_DELAY);
    },
    { deep: true },
  );

  // Não perde a última edição ao minimizar o app ou sair da página
  const flushAll = () => {
    flushLocal();
    flushCloud();
  };
  const onHidden = () => document.visibilityState === 'hidden' && flushAll();
  document.addEventListener('visibilitychange', onHidden);
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onHidden);
    flushAll();
  });

  const api = { draft, status, syncing, cloud, flush: flushAll };
  provide(KEY, api);
  return api;
}

export const useGuideDraft = () => inject(KEY);
