<script setup>
import { computed } from 'vue';
import { Trophy } from 'lucide-vue-next';
import { TROPHY_TYPES } from '@/config/trophies';

const props = defineProps({ counts: { type: Object, required: true } });

const items = computed(() => TROPHY_TYPES.filter((t) => props.counts[t.id] > 0));
const total = computed(() => TROPHY_TYPES.reduce((n, t) => n + (props.counts[t.id] ?? 0), 0));
</script>

<template>
  <div class="d-flex align-center flex-wrap gap-2 text-sm" :aria-label="`${total} troféus`">
    <span
      v-for="t in items"
      :key="t.id"
      class="d-inline-flex align-center gap-1 fw-500"
      :title="t.label"
      :style="{ color: t.color }"
    >
      <Trophy :size="16" :stroke-width="2" />
      <span class="count">{{ counts[t.id] }}</span>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.count {
  color: var(--text);
}
</style>
