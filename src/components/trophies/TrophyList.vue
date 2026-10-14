<script setup>
import { computed, ref } from 'vue';
import TrophyItem from './TrophyItem.vue';
import TrophyCounts from './TrophyCounts.vue';
import { TROPHY_TYPES } from '@/config/trophies';

// Lista de troféus por grupo (jogo base + DLCs), com filtro por tipo
const props = defineProps({ list: { type: Object, required: true } });

const filter = ref('all');

// Contagem feita nos troféus recebidos (inclui DLCs) → bate sempre com o que o filtro mostra
const filters = computed(() => {
  const count = {};
  for (const t of props.list.trophies) count[t.type] = (count[t.type] ?? 0) + 1;
  return [
    { id: 'all', label: 'Todos', count: props.list.trophies.length },
    ...TROPHY_TYPES.filter((t) => count[t.id]).map((t) => ({ id: t.id, label: t.label, count: count[t.id] })),
  ];
});

// Uma passada só: agrupa os troféus já filtrados por grupo
const sections = computed(() => {
  const byGroup = new Map(props.list.groups.map((g) => [g.id, { ...g, trophies: [] }]));
  for (const t of props.list.trophies) {
    if (filter.value === 'all' || t.type === filter.value) byGroup.get(t.groupId)?.trophies.push(t);
  }
  return [...byGroup.values()].filter((g) => g.trophies.length);
});

const showGroups = computed(() => props.list.groups.length > 1);
const groupName = (g) => (g.id === 'default' ? 'Jogo base' : g.name);
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div class="scroll-x gap-1" role="group" aria-label="Filtrar por tipo">
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
        <TrophyItem v-for="t in g.trophies" :key="t.id" :trophy="t" />
      </ul>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.group-title {
  font-size: 17px;
}
</style>
