import { computed } from 'vue';
import { createSection } from '@/utils/sections';
import { createCollectible } from '@/utils/collectibles';
import { extractTrophyRefs } from '@/utils/trophyRef';

// Seções de uma aba de texto no rascunho (key: 'guide' | 'roadmap'): criar, editar, reordenar,
// remover e escolher os troféus de cada uma.
export function useSections(draft, key) {
  const sections = computed(() => draft.value?.[key] ?? []);
  const find = (id) => sections.value.find((s) => s.id === id);

  function add() {
    if (!draft.value) return null;
    draft.value[key] ??= [];
    const section = createSection();
    draft.value[key].push(section);
    return section.id;
  }

  const update = (id, patch) => Object.assign(find(id) ?? {}, patch);

  function remove(id) {
    if (draft.value) draft.value[key] = sections.value.filter((s) => s.id !== id);
  }

  // dir: -1 sobe, +1 desce
  function move(id, dir) {
    const list = draft.value?.[key];
    const i = list?.findIndex((s) => s.id === id) ?? -1;
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
  }

  function addTrophies(id, ids) {
    const section = find(id);
    if (!section) return 0;
    const fresh = ids.filter((t) => !section.trophies.includes(t));
    section.trophies.push(...fresh);
    return fresh.length;
  }

  function removeTrophy(id, trophyId) {
    const section = find(id);
    if (section) section.trophies = section.trophies.filter((t) => t !== trophyId);
  }

  // --- Coletáveis da seção (aba Coletáveis: cada seção é uma região) ---
  function addItem(id, name) {
    const section = find(id);
    if (!section) return null;
    section.items ??= [];
    const item = createCollectible(name.trim());
    section.items.push(item);
    return item.id;
  }

  function updateItem(id, itemId, patch) {
    const item = find(id)?.items?.find((i) => i.id === itemId);
    if (item) Object.assign(item, patch);
  }

  function removeItem(id, itemId) {
    const section = find(id);
    if (section?.items) section.items = section.items.filter((i) => i.id !== itemId);
  }

  function moveItem(id, itemId, dir) {
    const list = find(id)?.items;
    const i = list?.findIndex((x) => x.id === itemId) ?? -1;
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
  }

  // Troféus citados no texto da seção que ainda não estão na lista dela
  const citedMissing = (section) => [...extractTrophyRefs(section.body)].filter((t) => !section.trophies.includes(t));

  // Troféus que já estão em alguma seção (para mostrar o que falta)
  const covered = computed(() => new Set(sections.value.flatMap((s) => s.trophies)));

  return { sections, add, update, remove, move, addTrophies, removeTrophy, citedMissing, covered, addItem, updateItem, removeItem, moveItem };
}
