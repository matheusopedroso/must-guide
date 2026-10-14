import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchPopularGames, searchGames } from '@/services/games.service';
import { useDebounceFn } from './useDebounceFn';

const MIN_CHARS = 2;

// Pesquisa da tela de início: populares por padrão, resultados ao digitar.
// O termo fica na URL (?q=) → voltar para a tela mantém a busca.
export function useGameSearch() {
  const route = useRoute();
  const router = useRouter();

  const term = ref(String(route.query.q ?? ''));
  const games = ref([]);
  const provider = ref(null);
  const loading = ref(false);
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
    router.replace({ query: q ? { q } : {} });
    // Só consulta quando o resultado muda: ignora 1 caractere e espaços extras
    const wasSearching = (old ?? '').length >= MIN_CHARS;
    if (!isSearching.value && !wasSearching) return;
    loading.value = true;
    isSearching.value ? debouncedLoad() : (debouncedLoad.cancel(), load());
  });

  load();

  return { term, games, provider, loading, error, isSearching, query, retry: load };
}
