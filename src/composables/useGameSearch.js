import { computed, ref, watch } from 'vue';
import { fetchPopularGames, searchGames } from '@/services/games.service';
import { useDebounceFn } from './useDebounceFn';

const MIN_CHARS = 2;

// Lista de jogos a partir de um termo: populares quando vazio, resultados ao digitar.
// Usado na tela de início e no seletor do editor.
export function useGameSearch(term, { immediate = true } = {}) {
  const games = ref([]);
  const provider = ref(null);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');
  let controller = null;

  const query = computed(() => term.value.trim());
  const isSearching = computed(() => query.value.length >= MIN_CHARS);

  async function load() {
    controller?.abort(); // cancela a requisição anterior que ainda não voltou
    controller = new AbortController();
    const { signal } = controller;

    loading.value = true;
    error.value = '';
    try {
      const data = isSearching.value ? await searchGames(query.value, { signal }) : await fetchPopularGames({ signal });
      games.value = data.games;
      provider.value = data.provider;
      loaded.value = true;
    } catch (e) {
      if (e.name === 'AbortError') return;
      games.value = [];
      error.value = e.message || 'Não foi possível carregar os jogos.';
    } finally {
      if (!signal.aborted) loading.value = false;
    }
  }

  const debouncedLoad = useDebounceFn(load, 400);

  watch(query, (q, old) => {
    // Só consulta quando o resultado muda: ignora 1 caractere e espaços extras
    const wasSearching = (old ?? '').length >= MIN_CHARS;
    if (!isSearching.value && !wasSearching) return;
    loading.value = true;
    isSearching.value ? debouncedLoad() : (debouncedLoad.cancel(), load());
  });

  if (immediate) load();

  return { games, provider, loading, loaded, error, isSearching, query, load };
}
