<script setup>
import { Clock, Repeat } from 'lucide-vue-next';
import DifficultyBadge from './DifficultyBadge.vue';

// Dificuldade (cor da faixa), jogadas e horas — só exibição (editor e leitura do guia)
defineProps({
  stats: { type: Object, required: true },
  showLabel: Boolean, // nome da faixa na dificuldade (Fácil, Média…)
});
</script>

<template>
  <span class="d-inline-flex align-center flex-wrap gap-1">
    <DifficultyBadge v-if="stats.difficulty" :value="stats.difficulty" :show-label="showLabel" />
    <span v-if="stats.playthroughs" class="tag"><Repeat :size="14" /> {{ stats.playthroughs }} {{ stats.playthroughs > 1 ? 'jogadas' : 'jogada' }}</span>
    <span v-if="stats.hours" class="tag"><Clock :size="14" /> {{ stats.hours }} h</span>
  </span>
</template>
