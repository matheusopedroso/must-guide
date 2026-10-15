import { computed, ref, shallowRef } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useMyGuides } from './useMyGuides';
import { summarizeGuide } from '@/utils/guideDraft';

// Guias do início: "Continuar editando" (quem edita: os 4 editados por último, deste navegador + nuvem) e
// "Guias publicados" (todo mundo). O admin já lê todos os guias em useMyGuides → os publicados saem dali,
// sem outra leitura. Sem admin: só os publicados, guardados 5 min na memória (voltar ao início não relê).
const RECENT = 4;
const TTL = 5 * 60 * 1000;
let cache = null; // { at, items }

async function fetchPublished() {
  if (cache && Date.now() - cache.at < TTL) return cache.items;
  const { listGuides } = await import('@/services/guides.service');
  const items = (await listGuides()).map((g) => summarizeGuide(g, 'cloud'));
  cache = { at: Date.now(), items };
  return items;
}

const newestPublished = (a, b) => (b.publishedAt ?? b.updatedAt ?? '').localeCompare(a.publishedAt ?? a.updatedAt ?? '');

export function useHomeGuides() {
  const { enabled, isAdmin, whenReady } = useAuth();
  const canEdit = computed(() => !enabled || isAdmin.value);
  const my = useMyGuides();

  const remote = shallowRef([]);
  const remoteLoading = ref(false);
  async function loadPublic() {
    if (!enabled) return;
    await whenReady();
    if (isAdmin.value) return;
    remoteLoading.value = true;
    try {
      remote.value = await fetchPublished();
    } catch (e) {
      console.error('[início] Falha ao listar os guias publicados', e);
    } finally {
      remoteLoading.value = false;
    }
  }
  loadPublic();

  const recent = computed(() => (canEdit.value ? my.items.value.slice(0, RECENT) : []));
  const published = computed(() =>
    (canEdit.value ? my.items.value : remote.value).filter((g) => g.status === 'published').sort(newestPublished),
  );
  const loading = computed(() => my.loading.value || remoteLoading.value);

  return { canEdit, recent, published, loading };
}
