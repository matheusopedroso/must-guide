import { ref, watch } from 'vue';
import { fetchGame } from '@/services/games.service';
import { isPartialSnapshot } from '@/utils/guideDraft';

// Jogos já conhecidos na sessão (ex.: escolhido no seletor antes de mudar de página)
const known = new Map();

// Jogo escolhido a partir do id (ex.: vindo da URL).
// Se o objeto já veio do seletor (set), usa direto — sem nova requisição, mesmo depois de trocar de página.
// saved(id): cópia do jogo guardada no guia (gameSnapshot) → usada sem ir à API; só uma cópia incompleta
// é completada em segundo plano, e se a API falhar (sem chave, outro provedor) fica a cópia.
export function useGameDetails(gameId, { saved } = {}) {
  const game = ref(null);
  const loading = ref(false);
  const error = ref('');

  // Completa em segundo plano (resumo, gêneros…); se a API falhar, segue com o que já tem
  function enrich(id, base) {
    fetchGame(id)
      .then((data) => {
        const full = { ...base, ...data.game };
        known.set(id, full);
        if (gameId.value === id) game.value = full;
      })
      .catch(() => {});
  }

  function set(value) {
    if (value) known.set(value.id, value);
    game.value = value;
    error.value = '';
    if (value?.partial) enrich(value.id, value); // veio da busca (sem resumo)
  }

  watch(
    gameId,
    async (id) => {
      error.value = '';
      if (!id) return (game.value = null);
      if (game.value?.id === id) return;
      if (known.has(id)) return (game.value = known.get(id));

      const copy = saved?.(id);
      if (copy?.title) {
        game.value = copy;
        known.set(id, copy);
        if (isPartialSnapshot(copy)) enrich(id, copy);
        return;
      }

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
