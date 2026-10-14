import { ref, shallowRef, watch } from 'vue';

// Carrega dados a partir de uma fonte reativa, cancelando a requisição anterior.
// source → valor (ex.: id). Valor vazio limpa o estado sem chamar o loader.
// keepPrevious: mantém o dado anterior na tela enquanto o novo carrega.
export function useAsyncState(source, loader, { immediate = true, keepPrevious = false } = {}) {
  const data = shallowRef(null);
  const loading = ref(false);
  const error = ref('');
  let controller = null;

  async function run(value = source.value) {
    controller?.abort();
    error.value = '';
    if (!value) return (data.value = null);

    controller = new AbortController();
    const { signal } = controller;
    if (!keepPrevious) data.value = null;
    loading.value = true;
    try {
      data.value = await loader(value, { signal });
    } catch (e) {
      if (e.name === 'AbortError') return;
      data.value = null;
      error.value = e.message || 'Não foi possível carregar.';
    } finally {
      if (!signal.aborted) loading.value = false;
    }
  }

  watch(source, (v) => run(v), { immediate });

  return { data, loading, error, reload: () => run() };
}
