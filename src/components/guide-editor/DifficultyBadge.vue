<script setup>
import { computed } from 'vue';
import { Gauge } from 'lucide-vue-next';
import { difficultyBand, difficultyClass } from '@/utils/difficulty';

// Etiqueta da dificuldade (1–10) na cor da faixa: verde, amarelo, vermelho ou preto
const props = defineProps({
  value: { type: Number, required: true },
  showLabel: Boolean, // mostra o nome da faixa (Fácil, Média…)
});

const band = computed(() => difficultyBand(props.value));
</script>

<template>
  <span v-if="band" class="diff-badge d-inline-flex align-center gap-1 radius-1" :class="difficultyClass(value)">
    <Gauge :size="14" :stroke-width="2" />
    <span>{{ value }}/10</span>
    <span v-if="showLabel" class="diff-badge__label">{{ band.label }}</span>
  </span>
</template>

<style lang="scss" scoped>
.diff-badge {
  height: 24px;
  padding-inline: space(1);
  background: var(--diff-bg);
  color: var(--diff-fg);
  box-shadow: inset 0 0 0 1px var(--diff-edge, transparent);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;

  &__label {
    font-weight: 600;
    opacity: 0.9;

    &::before {
      content: '·';
      margin-right: $space-half;
    }
  }
}
</style>
