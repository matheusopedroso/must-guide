<script setup>
import { computed } from 'vue';
import { CirclePlay, Link as LinkIcon, Trophy } from 'lucide-vue-next';
import RatingInput from '@/components/ui/RatingInput.vue';
import { DIFFICULTY_LABELS, DIFFICULTY_MAX, RARITY_LABELS, TROPHY_MOMENT_MAP, TROPHY_TYPE_MAP } from '@/config/trophies';
import { formatRate } from '@/utils/trophies';
import { isYoutube } from '@/utils/url';

// Rodapé do card: etiquetas "Rótulo: valor" (só o que existe). Slot "before": itens no começo (ex.: badges)
const props = defineProps({
  trophy: { type: Object, required: true },
  note: { type: Object, required: true },
  stats: { type: Object, default: null },
});

const type = computed(() => TROPHY_TYPE_MAP[props.trophy.type] ?? TROPHY_TYPE_MAP.bronze);
const rarity = computed(() => {
  const s = props.stats;
  if (s?.rate == null) return '';
  return [RARITY_LABELS[s.rarity], formatRate(s.rate)].filter(Boolean).join(' · ');
});
const moment = computed(() => TROPHY_MOMENT_MAP[props.note.when]?.label ?? '');
</script>

<template>
  <div class="d-flex align-center flex-wrap gap-1">
    <slot name="before" />
    <span class="tag">
      <span class="tag__label">Tipo:</span>
      <Trophy :size="14" :stroke-width="2" :style="{ color: type.color }" /> {{ type.label }}
    </span>
    <span v-if="rarity" class="tag" title="Porcentagem de jogadores com o troféu">
      <span class="tag__label">Raridade:</span> {{ rarity }}
    </span>
    <span v-if="moment" class="tag"><span class="tag__label">Momento:</span> {{ moment }}</span>
    <span v-if="note.chapter" class="tag tag--chapter" :title="note.chapter">
      <span class="tag__label">Capítulo:</span> <span class="truncate">{{ note.chapter }}</span>
    </span>
    <span v-if="note.difficulty" class="tag" :title="DIFFICULTY_LABELS[note.difficulty]">
      <span class="tag__label">Dificuldade:</span>
      <RatingInput :model-value="note.difficulty" :max="DIFFICULTY_MAX" readonly label="Dificuldade" />
    </span>
    <a v-if="note.video" :href="note.video" target="_blank" rel="noopener noreferrer" class="tag tag--link">
      <component :is="isYoutube(note.video) ? CirclePlay : LinkIcon" :size="14" :stroke-width="1.75" />
      {{ isYoutube(note.video) ? 'Ver vídeo' : 'Abrir link' }}
    </a>
  </div>
</template>

<style lang="scss" scoped>
.tag--chapter {
  max-width: 260px;
}

.tag--link {
  color: var(--accent);

  &:hover {
    background: var(--surface-hover);
  }
}
</style>
