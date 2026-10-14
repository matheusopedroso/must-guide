<script setup>
import { ref } from 'vue';
import { Clock, Pencil, Repeat } from 'lucide-vue-next';
import DifficultyBadge from './DifficultyBadge.vue';
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
      <DifficultyBadge v-if="stats.difficulty" :value="stats.difficulty" />
      <span v-if="stats.playthroughs" class="tag"><Repeat :size="14" /> {{ stats.playthroughs }} {{ stats.playthroughs > 1 ? 'jogadas' : 'jogada' }}</span>
      <span v-if="stats.hours" class="tag"><Clock :size="14" /> {{ stats.hours }} h</span>
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
