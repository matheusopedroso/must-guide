<script setup>
import { computed } from 'vue';
import { useLibrary } from '@/composables/useLibrary';
import { LIBRARY_STATUS_MAP } from '@/config/library';

// Selo do status da biblioteca sobre a capa (cards de jogo e de guia). Fora da biblioteca, não aparece.
const props = defineProps({ gameId: { type: String, required: true } });
const { statusOf } = useLibrary();
const status = computed(() => LIBRARY_STATUS_MAP[statusOf(props.gameId)] ?? null);
</script>

<template>
  <span v-if="status" class="lbadge badge" :class="`badge--${status.tone}`" :title="status.label">
    <component :is="status.icon" :size="12" :stroke-width="2.2" class="shrink-0" />
    <span class="lbadge__label">{{ status.label }}</span>
  </span>
</template>

<style lang="scss" scoped>
.lbadge {
  position: absolute;
  top: space(1);
  left: space(1);
  max-width: calc(100% - #{space(2)});
  backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  box-shadow: var(--shadow);

  &__label {
    overflow: hidden;
    text-overflow: ellipsis;

    // Card pequeno (celular): só o ícone
    @include down(sm) {
      display: none;
    }
  }
}
</style>
