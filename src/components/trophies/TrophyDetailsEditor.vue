<script setup>
import { ref, watch } from 'vue';
import { Check } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import RatingInput from '@/components/ui/RatingInput.vue';
import TrophyFlags from './TrophyFlags.vue';
import { DIFFICULTY_LABELS, DIFFICULTY_MAX, TROPHY_MOMENTS } from '@/config/trophies';
import { normalizeUrl } from '@/utils/url';

// Painel "Detalhes" do troféu: marcações + momento, dificuldade, capítulo e vídeo.
// Grava a cada mudança (o rascunho agrupa as gravações).
const props = defineProps({ note: { type: Object, required: true } });
const emit = defineEmits(['update', 'close']);

// Link: edita livre e normaliza ao sair do campo
const video = ref(props.note.video);
watch(() => props.note.video, (v) => (video.value = v));
const videoError = ref('');

function saveVideo() {
  const url = normalizeUrl(video.value);
  videoError.value = video.value.trim() && !url ? 'Link inválido.' : '';
  if (!videoError.value) {
    video.value = url;
    emit('update', { video: url });
  }
}
</script>

<template>
  <div class="details surface-2 radius-1 p-2 d-flex flex-column gap-2">
    <TrophyFlags :note="note" @update="emit('update', $event)" />

    <div class="details__grid d-grid gap-2">
      <label class="field">
        <span class="field__label">Momento</span>
        <select class="input" :value="note.when" @change="emit('update', { when: $event.target.value })">
          <option value="">—</option>
          <option v-for="m in TROPHY_MOMENTS" :key="m.id" :value="m.id">{{ m.label }}</option>
        </select>
      </label>

      <label class="field">
        <span class="field__label">Capítulo ou missão</span>
        <input
          class="input"
          :value="note.chapter"
          placeholder="Ex.: Cap. 3 — O Porão"
          maxlength="80"
          @input="emit('update', { chapter: $event.target.value })"
        />
      </label>

      <div class="field">
        <span class="field__label">
          Dificuldade{{ note.difficulty ? ` · ${DIFFICULTY_LABELS[note.difficulty]}` : '' }}
        </span>
        <RatingInput
          :model-value="note.difficulty"
          :max="DIFFICULTY_MAX"
          label="Dificuldade"
          @update:model-value="emit('update', { difficulty: $event })"
        />
      </div>

      <label class="field">
        <span class="field__label">Vídeo de referência</span>
        <input
          v-model="video"
          class="input"
          type="url"
          inputmode="url"
          placeholder="https://youtu.be/…"
          @blur="saveVideo"
          @keydown.enter.prevent="saveVideo"
        />
        <span v-if="videoError" class="text-xs text-danger">{{ videoError }}</span>
      </label>
    </div>

    <div class="d-flex justify-end">
      <BaseButton :icon="Check" size="sm" @click="saveVideo(), emit('close')">Concluir</BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.details__grid {
  @include up(md) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
