import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { deleteDraft } from '@/services/draft.service';

// Apagar guias: da nuvem (admin, numa escrita só) e deste navegador (rascunho + coletáveis marcados).
// Com o Firebase configurado, só o admin apaga — senão o guia voltaria da nuvem no próximo login.
export function useDeleteGuide() {
  const { enabled, isAdmin } = useAuth();
  const blocked = computed(() => (enabled && !isAdmin.value ? 'Entre como administrador para apagar guias' : ''));

  async function remove(guideIds) {
    if (blocked.value) throw new Error(blocked.value);
    if (enabled) {
      const { deleteGuides } = await import('@/services/guides.service');
      await deleteGuides(guideIds); // falhou → não apaga do navegador (nada fica pela metade)
    }
    guideIds.forEach(deleteDraft);
  }

  return { blocked, remove };
}
