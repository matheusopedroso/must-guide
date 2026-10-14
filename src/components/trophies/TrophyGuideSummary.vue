<script setup>
import { computed } from 'vue';
import { CirclePlay } from 'lucide-vue-next';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import { TROPHY_FLAGS } from '@/config/trophies';
import { hasRichContent } from '@/utils/html';

// Resumo do guia na lista aberta: quanto já foi explicado e as marcações. Clicar aplica o filtro.
const props = defineProps({
  trophies: { type: Array, required: true },
  getNote: { type: Function, required: true },
});
defineEmits(['filter']);

const stats = computed(() => {
  const s = { explained: 0, video: 0, flags: Object.fromEntries(TROPHY_FLAGS.map((f) => [f.id, 0])) };
  for (const t of props.trophies) {
    const note = props.getNote(t.id);
    if (hasRichContent(note.tip)) s.explained++;
    if (note.video) s.video++;
    for (const f of TROPHY_FLAGS) if (note[f.id]) s.flags[f.id]++;
  }
  return s;
});

const total = computed(() => props.trophies.length);
const missing = computed(() => total.value - stats.value.explained);
</script>

<template>
  <section class="surface radius-2 p-2 d-flex flex-column gap-2" aria-label="Resumo do guia">
    <div class="d-flex align-center justify-between flex-wrap gap-1">
      <p class="text-sm">
        <span class="fw-600">Guia:</span> {{ stats.explained }} de {{ total }} troféus explicados
      </p>
      <button v-if="missing" type="button" class="link-btn text-sm fw-500" @click="$emit('filter', 'notip')">
        Ver os {{ missing }} sem explicação
      </button>
      <span v-else class="text-sm text-accent fw-500">Todos explicados</span>
    </div>

    <ProgressBar :value="stats.explained" :max="total" />

    <div class="d-flex flex-wrap gap-1">
      <button
        v-for="f in TROPHY_FLAGS"
        :key="f.id"
        type="button"
        class="chip chip--sm"
        :disabled="!stats.flags[f.id]"
        @click="$emit('filter', f.id)"
      >
        <component :is="f.icon" :size="14" :stroke-width="1.75" /> {{ f.label }}
        <span class="chip__count">{{ stats.flags[f.id] }}</span>
      </button>
      <span class="chip chip--sm is-static">
        <CirclePlay :size="14" :stroke-width="1.75" /> Vídeos <span class="chip__count">{{ stats.video }}</span>
      </span>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.link-btn {
  color: var(--accent);

  &:hover {
    text-decoration: underline;
  }
}

.chip:disabled {
  opacity: 0.5;
  cursor: default;
}

.is-static {
  cursor: default;

  &:hover {
    background: var(--surface);
  }
}

</style>
