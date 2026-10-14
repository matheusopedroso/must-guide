<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  showLabel: Boolean,
});

const pct = computed(() => (props.max ? Math.round((props.value / props.max) * 100) : 0));
</script>

<template>
  <div class="d-flex align-center gap-2">
    <div class="bar flex-1" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100">
      <div class="bar__fill" :class="{ 'is-full': pct === 100 }" :style="{ width: `${pct}%` }" />
    </div>
    <span v-if="showLabel" class="text-sm text-muted fw-500">{{ value }}/{{ max }}</span>
  </div>
</template>

<style lang="scss" scoped>
.bar {
  height: 8px;
  border-radius: $r-full;
  background: var(--surface-2);
  overflow: hidden;

  &__fill {
    height: 100%;
    border-radius: inherit;
    background: var(--accent);
    transition: width 0.3s $ease;

    &.is-full {
      background: var(--success);
    }
  }
}
</style>
