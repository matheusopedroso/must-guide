import { ref, shallowRef, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { listDrafts } from '@/services/draft.service';
import { editedAt, summarizeGuide } from '@/utils/guideDraft';

// Guias das DLCs de um jogo: os da nuvem (admin vê rascunhos; visitante só publicados) e os deste navegador.
// Mesma DLC nos dois → fica a cópia mais recente. → items: resumos (summarizeGuide) na ordem do grupo da PSN
export function useDlcGuides(gameId) {
  const { enabled, isAdmin, whenReady } = useAuth();
  const items = shallowRef([]);
  const loading = ref(false);

  async function load(id) {
    items.value = [];
    if (!id) return;
    loading.value = true;
    const byId = new Map(listDrafts().filter((d) => d.parentId === id).map((d) => [d.guideId, { guide: d, source: 'local' }]));
    if (enabled) {
      await whenReady();
      try {
        const { listDlcGuides } = await import('@/services/guides.service');
        for (const g of await listDlcGuides(id, { admin: isAdmin.value })) {
          const local = byId.get(g.guideId);
          if (!local || editedAt(g) >= editedAt(local.guide)) byId.set(g.guideId, { guide: g, source: 'cloud' });
        }
      } catch (e) {
        console.error('[dlc] Falha ao listar', e);
      }
    }
    if (gameId.value !== id) return;
    items.value = [...byId.values()]
      .map(({ guide, source }) => summarizeGuide(guide, source))
      .sort((a, b) => String(a.dlcGroup).localeCompare(String(b.dlcGroup)));
    loading.value = false;
  }

  watch(gameId, load, { immediate: true });
  watch(isAdmin, () => load(gameId.value));

  return { items, loading, reload: () => load(gameId.value) };
}
