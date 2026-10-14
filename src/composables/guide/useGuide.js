import { ref, shallowRef, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { loadDraft } from '@/services/draft.service';
import { editedAt, isBlankDraft } from '@/utils/guideDraft';

// Guia para leitura (/guia/:id). Nuvem: publicado (qualquer um) ou rascunho (admin).
// Sem nuvem (ou sem permissão), cai na cópia deste navegador, se houver.
// source: cloud | local
export function useGuide(gameId) {
  const { enabled, isAdmin, whenReady } = useAuth();
  const guide = shallowRef(null);
  const source = ref('');
  const loading = ref(true);
  const error = ref('');

  async function load(id) {
    guide.value = null;
    error.value = '';
    if (!id) return;
    loading.value = true;

    const local = loadDraft(id);
    let remote = null;
    if (enabled) {
      await whenReady(); // rascunho na nuvem só com o login restaurado
      try {
        const { fetchGuide } = await import('@/services/guides.service');
        remote = await fetchGuide(id);
      } catch (e) {
        console.error('[guia] Falha ao ler', e);
        error.value = 'Não foi possível carregar o guia da nuvem.';
      }
    }
    if (gameId.value !== id) return; // trocou de guia no meio

    // Quem edita vê a cópia mais nova; visitante vê só o publicado
    const useLocal = local && !isBlankDraft(local) && (!remote || (isAdmin.value || !enabled) && editedAt(local) > editedAt(remote));
    guide.value = useLocal ? local : remote;
    source.value = useLocal ? 'local' : remote ? 'cloud' : '';
    loading.value = false;
  }

  watch(gameId, load, { immediate: true });
  watch(isAdmin, () => load(gameId.value)); // entrou como admin: pode ver o rascunho

  return { guide, source, loading, error };
}
