<script setup>
import { ref } from 'vue';
import { Pencil } from 'lucide-vue-next';
import GuideStatsSummary from './GuideStatsSummary.vue';
import GuideStatsModal from './GuideStatsModal.vue';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useGuideStats } from '@/composables/guide/useGuideStats';

// Resumo da visão geral (dificuldade colorida pela faixa, jogadas, horas). Tocar abre o modal de edição.
const { draft } = useGuideDraft();
const { stats, filled, save } = useGuideStats(draft);
const editing = ref(false);
</script>

<template>
  <button
    type="button"
    class="stats d-inline-flex align-center flex-wrap gap-1 radius-1 tooltip-left"
    data-tooltip="Editar visão geral"
    aria-label="Editar dificuldade, jogadas e horas"
    @click="editing = true"
  >
    <template v-if="filled">
      <GuideStatsSummary :stats="stats" />
      <Pencil :size="14" class="stats__edit" />
    </template>
    <span v-else class="stats__empty d-inline-flex align-center gap-1 text-sm fw-500">
      <Pencil :size="14" /> Dificuldade, jogadas e horas
    </span>
  </button>

  <GuideStatsModal v-model="editing" :stats="stats" @save="save" />
</template>

<style lang="scss" scoped>
.stats {
  min-height: 32px;
  padding: $space-half;
  transition: background 0.15s;

  &:hover {
    background: var(--surface-hover);
  }

  &__edit {
    margin-inline: $space-half;
    color: var(--text-subtle);
  }

  &__empty {
    padding-inline: space(1);
    color: var(--accent);
  }
}
</style>
