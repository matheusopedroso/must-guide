import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useAuthStore } from './auth';
import * as api from '@/services/library.service';
import { GAME_STATUS } from '@/config/status';

export const useLibraryStore = defineStore('library', () => {
  const entries = ref([]);
  const loaded = ref(false);
  const loading = ref(false);
  const gameCache = new Map(); // games/{id} já lidos nesta sessão
  let pending = null;

  const byId = computed(() => new Map(entries.value.map((e) => [e.id, e])));

  const counts = computed(() => {
    const c = Object.fromEntries(GAME_STATUS.map((s) => [s.id, 0]));
    for (const e of entries.value) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  });

  const uid = () => useAuthStore().uid;

  // Lê do Firestore só uma vez por sessão; depois tudo é atualizado localmente
  function load(force = false) {
    if ((loaded.value && !force) || !uid()) return Promise.resolve();
    pending ??= (async () => {
      loading.value = true;
      try {
        entries.value = await api.fetchLibrary(uid());
        loaded.value = true;
      } finally {
        loading.value = false;
        pending = null;
      }
    })();
    return pending;
  }

  const has = (gameId) => byId.value.has(String(gameId));
  const get = (gameId) => byId.value.get(String(gameId)) ?? null;

  async function add(game, status) {
    const entry = await api.addToLibrary(uid(), game, status);
    entries.value.unshift(entry);
    gameCache.set(game.id, { id: game.id, ...game });
    return entry;
  }

  async function update(gameId, patch) {
    const applied = await api.updateLibraryEntry(uid(), gameId, patch);
    const i = entries.value.findIndex((e) => e.id === gameId);
    if (i > -1) {
      const [entry] = entries.value.splice(i, 1);
      entries.value.unshift({ ...entry, ...applied });
    }
  }

  async function remove(gameId) {
    await api.removeFromLibrary(uid(), gameId);
    entries.value = entries.value.filter((e) => e.id !== gameId);
  }

  async function getGame(gameId) {
    if (!gameCache.has(gameId)) gameCache.set(gameId, await api.fetchGame(gameId));
    return gameCache.get(gameId);
  }

  function reset() {
    entries.value = [];
    loaded.value = false;
    gameCache.clear();
  }

  return { entries, loaded, loading, counts, load, has, get, add, update, remove, getGame, reset };
});
