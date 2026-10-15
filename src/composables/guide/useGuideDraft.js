import { computed, inject, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue';
import { loadDraft, saveDraft } from '@/services/draft.service';
import { fetchGuide, saveGuide } from '@/services/guides.service';
import { useAuth } from '@/composables/useAuth';
import { createDraft, editedAt, gameSnapshot, isBlankDraft, normalizeDraft } from '@/utils/guideDraft';
import { guideIdOf, parseGuideId } from '@/utils/guideIds';

const KEY = Symbol('guide-draft');
const LOCAL_DELAY = 600; // navegador: barato, grava logo
const CLOUD_DELAY = 2500; // Firestore: agrupa mais edições numa escrita só

// Dono do guia em edição (na página do editor). As abas pegam com useGuideDraft().
// Duas cópias: navegador (sempre) e Firestore (admin logado). Ao abrir, fica a mais recente:
// a da nuvem substitui a local, ou a local (editada sem internet / antes do login) sobe para a nuvem.
// status: idle | pending | local (só no navegador) | cloud (na nuvem) | error
// guideId: jogo ("rawg-123") ou DLC ("rawg-123~001"); game: o jogo (para criar o rascunho)
export function provideGuideDraft(game, guideId) {
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
    const id = guideIdOf(draft.value);
    if (!id || !cloud.value) return;
    syncing.value = true;
    try {
      const remote = await fetchGuide(id);
      if (guideIdOf(draft.value) !== id) return; // trocou de guia no meio
      if (remote && editedAt(remote) >= editedAt(draft.value) && !localDirty) {
        replace(normalizeDraft(remote, game.value));
        saveDraft(draft.value);
        status.value = 'cloud';
      } else if (!isBlankDraft(draft.value) && editedAt(draft.value) > editedAt(remote)) {
        scheduleCloud(0); // a do navegador é mais nova: sobe já
      } else if (remote) {
        status.value = 'cloud';
      }
      // DLC nova aberta direto (sem o guia do jogo neste navegador): pega as versões do guia do jogo na nuvem
      if (!remote && draft.value.dlc && !draft.value.versions.length) {
        const parent = await fetchGuide(draft.value.parentId);
        if (parent?.versions?.length && guideIdOf(draft.value) === id) draft.value.versions = parent.versions;
      }
    } catch (e) {
      console.error('[guia] Falha ao ler da nuvem', e);
      status.value = 'error';
    } finally {
      syncing.value = false;
    }
  }

  // Edição no rascunho → grava agrupado. Registrado ANTES do watch que carrega o guia: assim a troca feita
  // ao carregar (replace) é consumida aqui e não engole a primeira edição de verdade.
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

  // Rascunho novo. DLC aberta direto pelo endereço: usa as versões (listas da PSN) do guia do jogo
  function freshDraft(id) {
    const { groupId } = parseGuideId(id);
    const fresh = createDraft(game.value, { dlc: groupId ? { groupId } : null });
    if (groupId) fresh.versions = loadDraft(game.value.id)?.versions ?? []; // já vem do JSON do navegador (cópia nova)
    return fresh;
  }

  // Troca de guia: grava o anterior e abre o novo (navegador na hora, nuvem em seguida).
  // Espera o jogo carregar (o rascunho guarda título e capa dele).
  watch(
    () => (game.value && guideId.value && parseGuideId(guideId.value).gameId === game.value.id ? guideId.value : ''),
    (id) => {
      flushLocal();
      flushCloud();
      localDirty = cloudDirty = false;
      status.value = 'idle';
      replace(id ? normalizeDraft(loadDraft(id) ?? freshDraft(id), game.value) : null);
      if (id) syncFromCloud();
    },
    { immediate: true },
  );

  // Jogo completado depois de abrir (ex.: veio da busca sem resumo): atualiza a cópia guardada no guia
  watch(game, (g) => {
    const d = draft.value;
    if (!d || !g || g.id !== d.gameId) return;
    const snap = gameSnapshot(g, d.game);
    if (JSON.stringify(snap) !== JSON.stringify(d.game)) d.game = snap;
  });

  // Entrou (ou virou admin) com o guia aberto: sincroniza
  watch(cloud, (on) => on && syncFromCloud());


  // Publicar / voltar para rascunho: grava na nuvem na hora (não espera o agrupamento).
  // true = ficou salvo na nuvem
  async function setStatus(next) {
    if (!draft.value || !cloud.value || draft.value.status === next) return false;
    draft.value.status = next;
    if (next === 'published' && !draft.value.publishedAt) draft.value.publishedAt = new Date().toISOString();
    await nextTick();
    localDirty = true; // garante a gravação mesmo que o watch não tenha marcado
    flushLocal();
    await flushCloud();
    return status.value === 'cloud';
  }

  // Antes de mover/copiar o guia: grava o que estiver pendente (navegador e nuvem) e espera terminar
  async function settle() {
    flushLocal();
    await flushCloud();
  }

  // Guia apagado: para de gravar (nenhuma gravação pendente pode trazer ele de volta)
  function discard() {
    clearTimeout(localTimer);
    clearTimeout(cloudTimer);
    localTimer = cloudTimer = null;
    localDirty = cloudDirty = false;
    status.value = 'idle';
    replace(null);
  }

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

  const api = { draft, status, syncing, cloud, setStatus, discard, settle, flush: flushAll };
  provide(KEY, api);
  return api;
}

export const useGuideDraft = () => inject(KEY);
