<script setup>
import { computed, ref } from 'vue';
import TrophyItem from './TrophyItem.vue';
import TrophyCounts from './TrophyCounts.vue';
import { TROPHY_TYPES } from '@/config/trophies';

// Lista de troféus por grupo (jogo base + DLCs), com filtros e anotações do guia
const props = defineProps({
  list: { type: Object, required: true },
  progress: { type: Object, default: null }, // { trophies: { [id]: stats } } da conta, se tiver o jogo
  getNote: { type: Function, required: true },
});
defineEmits(['update-note']);

const filter = ref('all');

// Filtros: todos, por tipo e pelas marcações do guia / progresso
const FILTERS = [
  { id: 'all', label: 'Todos', test: () => true },
  ...TROPHY_TYPES.map((t) => ({ id: t.id, label: t.label, test: (tr) => tr.type === t.id })),
  { id: 'missable', label: 'Perdíveis', test: (tr, note) => note.missable },
  { id: 'online', label: 'Online', test: (tr, note) => note.online },
  { id: 'pending', label: 'Faltam', test: (tr, note, stats) => stats && !stats.earned, needsProgress: true },
];

const statsOf = (id) => props.progress?.trophies[id] ?? null;

const filters = computed(() =>
  FILTERS.filter((f) => !f.needsProgress || props.progress)
    .map((f) => ({ ...f, count: props.list.trophies.filter((t) => f.test(t, props.getNote(t.id), statsOf(t.id))).length }))
    .filter((f) => f.id === 'all' || f.count),
);

// Uma passada só: agrupa os troféus já filtrados por grupo
const sections = computed(() => {
  const f = FILTERS.find((x) => x.id === filter.value) ?? FILTERS[0];
  const byGroup = new Map(props.list.groups.map((g) => [g.id, { ...g, trophies: [] }]));
  for (const t of props.list.trophies) {
    if (f.test(t, props.getNote(t.id), statsOf(t.id))) byGroup.get(t.groupId)?.trophies.push(t);
  }
  return [...byGroup.values()].filter((g) => g.trophies.length);
});

const showGroups = computed(() => props.list.groups.length > 1);
const groupName = (g) => (g.id === 'default' ? 'Jogo base' : g.name);
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div class="scroll-x gap-1" role="group" aria-label="Filtrar troféus">
      <button
        v-for="f in filters"
        :key="f.id"
        type="button"
        class="chip"
        :class="{ 'is-active': filter === f.id }"
        :aria-pressed="filter === f.id"
        @click="filter = f.id"
      >
        {{ f.label }} <span class="chip__count">{{ f.count }}</span>
      </button>
    </div>

    <section v-for="g in sections" :key="g.id" class="surface radius-2 px-2 pt-1 pb-1">
      <header v-if="showGroups" class="d-flex align-center justify-between flex-wrap gap-1 py-1 border-bottom">
        <h3 class="group-title">{{ groupName(g) }}</h3>
        <TrophyCounts :counts="g.counts" />
      </header>
      <ul>
        <TrophyItem
          v-for="t in g.trophies"
          :key="t.id"
          :trophy="t"
          :note="getNote(t.id)"
          :stats="statsOf(t.id)"
          @update-note="(id, patch) => $emit('update-note', id, patch)"
        />
      </ul>
    </section>

    <p v-if="!sections.length" class="text-sm text-muted py-2">Nenhum troféu neste filtro.</p>
  </div>
</template>

<style lang="scss" scoped>
.group-title {
  font-size: 17px;
}
</style>
