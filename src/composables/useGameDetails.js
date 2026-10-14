import { ref, watch } from 'vue';
import { fetchGame } from '@/services/games.service';

// Jogos já conhecidos na sessão (ex.: escolhido no seletor antes de mudar de página)
const known = new Map();

// Jogo escolhido a partir do id (ex.: vindo da URL).
// Se o objeto já veio do seletor (set), usa direto — sem nova requisição, mesmo depois de trocar de página.
export function useGameDetails(gameId) {
  const game = ref(null);
  const loading = ref(false);
  const error = ref('');

  function set(value) {
    if (value) known.set(value.id, value);
    game.value = value;
    error.value = '';
  }

  watch(
    gameId,
    async (id) => {
      error.value = '';
      if (!id) return (game.value = null);
      if (game.value?.id === id) return;
      if (known.has(id)) return (game.value = known.get(id));

      loading.value = true;
      try {
        const data = await fetchGame(id);
        known.set(id, data.game);
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
