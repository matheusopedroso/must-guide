import { computed, ref, shallowRef, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { listDrafts } from '@/services/draft.service';
import { editedAt, isBlankDraft, summarizeGuide } from '@/utils/guideDraft';

// Guias para a lista "Meus guias": nuvem (admin) + rascunhos deste navegador.
// O mesmo jogo nas duas → fica a cópia mais recente. Ordem: editado por último primeiro.
export function useMyGuides() {
  const { enabled, isAdmin, whenReady } = useAuth();
  const items = shallowRef([]);
  const loading = ref(true);
  const error = ref('');

  async function load() {
    loading.value = true;
    error.value = '';
    const byId = new Map(listDrafts().filter((d) => !isBlankDraft(d)).map((d) => [d.gameId, { guide: d, source: 'local' }]));

    if (enabled) {
      await whenReady();
      if (isAdmin.value) {
        try {
          const { listGuides } = await import('@/services/guides.service');
          for (const g of await listGuides({ admin: true })) {
            const local = byId.get(g.gameId);
            if (!local || editedAt(g) >= editedAt(local.guide)) byId.set(g.gameId, { guide: g, source: 'cloud' });
          }
        } catch (e) {
          console.error('[guias] Falha ao listar', e);
          error.value = 'Não foi possível carregar os guias da nuvem. Mostrando só os deste navegador.';
        }
      }
    }

    items.value = [...byId.values()]
      .map(({ guide, source }) => summarizeGuide(guide, source))
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    loading.value = false;
  }

  load();
  watch(isAdmin, load); // entrou/saiu: recarrega

  const counts = computed(() => ({
    all: items.value.length,
    draft: items.value.filter((g) => g.status === 'draft').length,
    published: items.value.filter((g) => g.status === 'published').length,
  }));

  return { items, counts, loading, error, reload: load };
}
