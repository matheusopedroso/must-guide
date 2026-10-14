import { ref, watch } from 'vue';
import { fetchGame } from '@/services/games.service';

// Jogo escolhido a partir do id (ex.: vindo da URL).
// Se o objeto já veio do seletor, usa direto — sem nova requisição.
export function useGameDetails(gameId) {
  const game = ref(null);
  const loading = ref(false);
  const error = ref('');

  function set(value) {
    game.value = value;
    error.value = '';
  }

  watch(
    gameId,
    async (id) => {
      error.value = '';
      if (!id) return (game.value = null);
      if (game.value?.id === id) return;

      loading.value = true;
      try {
        const data = await fetchGame(id);
        if (gameId.value === id) game.value = data.game;
      } catch (e) {
        if (gameId.value === id) {
          game.value = null;
          error.value = e.message || 'Não foi possível carregar o jogo.';
        }
      } finally {
        loading.value = false;
      }
    },
    { immediate: true },
  );

  return { game, loading, error, set };
}
