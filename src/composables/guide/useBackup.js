import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { saveDraft } from '@/services/draft.service';
import { backupFileName, downloadJson, makeBackup } from '@/utils/backup';

// Exportar / importar os guias (Meus guias). getDocs() → Map id → guia completo (useMyGuides).
// Importar grava no navegador e, com o admin, na nuvem (numa escrita só). Com o Firebase configurado,
// sem admin não importa: a nuvem é a cópia que vale e o guia voltaria ao anterior no próximo login.
export function useBackup(getDocs) {
  const { enabled, isAdmin, user } = useAuth();
  const blocked = computed(() => (enabled && !isAdmin.value ? 'Entre como administrador para importar guias' : ''));

  const exportAll = () => {
    const guides = [...getDocs().values()];
    downloadJson(makeBackup(guides), backupFileName());
    return guides.length;
  };

  async function importGuides(guides) {
    if (blocked.value) throw new Error(blocked.value);
    if (enabled) {
      const { saveGuides } = await import('@/services/guides.service');
      await saveGuides(guides, user.value.uid); // falhou → nada muda no navegador
    }
    guides.forEach(saveDraft);
  }

  return { blocked, exportAll, importGuides };
}
