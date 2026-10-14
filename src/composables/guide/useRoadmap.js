import { computed } from 'vue';
import { createStage } from '@/utils/roadmap';
import { extractTrophyRefs } from '@/utils/trophyRef';

// Etapas do roadmap no rascunho: criar, editar, reordenar, remover e escolher os troféus de cada uma.
export function useRoadmap(draft) {
  const stages = computed(() => draft.value?.roadmap ?? []);
  const find = (id) => stages.value.find((s) => s.id === id);

  function add() {
    if (!draft.value) return null;
    draft.value.roadmap ??= [];
    const stage = createStage();
    draft.value.roadmap.push(stage);
    return stage.id;
  }

  const update = (id, patch) => Object.assign(find(id) ?? {}, patch);

  function remove(id) {
    if (draft.value) draft.value.roadmap = stages.value.filter((s) => s.id !== id);
  }

  // dir: -1 sobe, +1 desce
  function move(id, dir) {
    const list = draft.value?.roadmap;
    const i = list?.findIndex((s) => s.id === id) ?? -1;
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
  }

  function addTrophies(id, ids) {
    const stage = find(id);
    if (!stage) return 0;
    const fresh = ids.filter((t) => !stage.trophies.includes(t));
    stage.trophies.push(...fresh);
    return fresh.length;
  }

  function removeTrophy(id, trophyId) {
    const stage = find(id);
    if (stage) stage.trophies = stage.trophies.filter((t) => t !== trophyId);
  }

  // Troféus citados no texto da etapa que ainda não estão na lista dela
  const citedMissing = (stage) => [...extractTrophyRefs(stage.body)].filter((t) => !stage.trophies.includes(t));

  // Troféus que já estão em alguma etapa (para mostrar o que falta)
  const covered = computed(() => new Set(stages.value.flatMap((s) => s.trophies)));

  return { stages, add, update, remove, move, addTrophies, removeTrophy, citedMissing, covered };
}
