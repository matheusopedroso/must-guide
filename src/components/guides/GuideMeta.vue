<script setup>
import { computed } from 'vue';
import { Clock, Gauge, Repeat, TriangleAlert, Wifi } from 'lucide-vue-next';

const props = defineProps({ guide: { type: Object, required: true } });

// Só mostra o que foi preenchido
const items = computed(() => {
  const g = props.guide;
  return [
    g.difficulty && { icon: Gauge, label: `Dificuldade ${g.difficulty}/10` },
    g.hours && { icon: Clock, label: `${g.hours}h` },
    g.playthroughs > 1 && { icon: Repeat, label: `${g.playthroughs} jogadas` },
    g.hasOnline && { icon: Wifi, label: 'Online' },
    g.hasMissables && { icon: TriangleAlert, label: 'Perdíveis', warn: true },
  ].filter(Boolean);
});
</script>

<template>
  <div v-if="items.length" class="d-flex flex-wrap gap-1">
    <span v-for="item in items" :key="item.label" class="tag" :class="{ 'text-warning': item.warn }">
      <component :is="item.icon" :size="14" :stroke-width="1.75" />
      {{ item.label }}
    </span>
  </div>
</template>
