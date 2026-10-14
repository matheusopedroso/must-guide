<script setup>
import { computed } from 'vue';
import { CirclePlay, Clock, Link as LinkIcon, MapPin } from 'lucide-vue-next';
import RatingInput from '@/components/ui/RatingInput.vue';
import { DIFFICULTY_LABELS, DIFFICULTY_MAX, TROPHY_FLAGS, TROPHY_MOMENT_MAP } from '@/config/trophies';
import { isYoutube } from '@/utils/url';

// Modo compacto: só aparece o que foi preenchido (marcações e dados do troféu)
const props = defineProps({ note: { type: Object, required: true } });

const flags = computed(() => TROPHY_FLAGS.filter((f) => props.note[f.id]));
const moment = computed(() => TROPHY_MOMENT_MAP[props.note.when]?.label ?? '');
const hasAny = computed(
  () => flags.value.length || moment.value || props.note.chapter || props.note.difficulty || props.note.video,
);
</script>

<template>
  <div v-if="hasAny" class="d-flex align-center flex-wrap gap-1">
    <span v-for="f in flags" :key="f.id" class="tag tag--accent">
      <component :is="f.icon" :size="14" :stroke-width="1.75" /> {{ f.label }}
    </span>
    <span v-if="moment" class="tag"><Clock :size="14" :stroke-width="1.75" /> {{ moment }}</span>
    <span v-if="note.chapter" class="tag tag--chapter" :title="note.chapter">
      <MapPin :size="14" :stroke-width="1.75" /> <span class="truncate">{{ note.chapter }}</span>
    </span>
    <span v-if="note.difficulty" class="tag" :title="`Dificuldade: ${DIFFICULTY_LABELS[note.difficulty]}`">
      <RatingInput :model-value="note.difficulty" :max="DIFFICULTY_MAX" readonly label="Dificuldade" />
    </span>
    <a v-if="note.video" :href="note.video" target="_blank" rel="noopener noreferrer" class="tag tag--link">
      <component :is="isYoutube(note.video) ? CirclePlay : LinkIcon" :size="14" :stroke-width="1.75" />
      {{ isYoutube(note.video) ? 'Vídeo' : 'Link' }}
    </a>
  </div>
</template>

<style lang="scss" scoped>
.tag--accent {
  background: var(--accent-soft);
  color: var(--accent);
}

.tag--chapter {
  max-width: 220px;
}

.tag--link {
  color: var(--accent);

  &:hover {
    background: var(--surface-hover);
  }
}
</style>
