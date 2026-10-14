<script setup>
import { computed } from 'vue';

// Barra de progresso (verde quando completa). tone: accent | earned (troféus conquistados)
const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  tone: { type: String, default: 'accent' },
});
const percent = computed(() => (props.max ? Math.round((props.value / props.max) * 100) : 0));
</script>

<template>
  <div class="bar" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
    <div class="bar__fill" :class="[`bar__fill--${tone}`, { 'is-full': percent === 100 }]" :style="{ width: `${percent}%` }" />
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

    &--earned {
      background: var(--earned);
    }

    &.is-full {
      background: var(--success);
    }
  }
}
</style>
