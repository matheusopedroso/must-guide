<script setup>
import { computed } from 'vue';

// Barra de progresso (verde quando completa)
const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
});
const percent = computed(() => (props.max ? Math.round((props.value / props.max) * 100) : 0));
</script>

<template>
  <div class="bar" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
    <div class="bar__fill" :class="{ 'is-full': percent === 100 }" :style="{ width: `${percent}%` }" />
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
