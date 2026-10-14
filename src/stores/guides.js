import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import * as api from '@/services/guides.service';

// Cache por id + listas por chave ("all" ou gameId). Evita reler ao navegar.
export const useGuidesStore = defineStore('guides', () => {
  const byId = ref({});
  const lists = ref({});

  const cache = (guides) => {
    for (const g of guides) byId.value[g.id] = g;
    return guides.map((g) => g.id);
  };

  const listFor = (key) => (lists.value[key] ?? []).map((id) => byId.value[id]).filter(Boolean);

  async function loadList(gameId = null, force = false) {
    const key = gameId ?? 'all';
    if (!lists.value[key] || force) {
      lists.value[key] = cache(await api.fetchGuides({ gameId }));
    }
    return listFor(key);
  }

  async function get(id) {
    if (!byId.value[id]) {
      const guide = await api.fetchGuide(id);
      if (guide) cache([guide]);
    }
    return byId.value[id] ?? null;
  }

  async function save(guide) {
    const saved = await api.saveGuide(guide, useAuthStore().uid);
    byId.value[saved.id] = saved;
    // Mais recente no topo, igual à ordenação do Firestore (updatedAt desc)
    for (const key of ['all', saved.gameId]) {
      const list = lists.value[key];
      if (list) lists.value[key] = [saved.id, ...list.filter((x) => x !== saved.id)];
    }
    return saved;
  }

  async function remove(id) {
    await api.deleteGuide(id);
    delete byId.value[id];
    for (const key of Object.keys(lists.value)) {
      lists.value[key] = lists.value[key].filter((x) => x !== id);
    }
  }

  function reset() {
    byId.value = {};
    lists.value = {};
  }

  return { listFor, loadList, get, save, remove, reset };
});
