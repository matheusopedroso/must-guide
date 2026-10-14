<script setup>
import { computed } from 'vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import GuideStats from '@/components/guide-editor/GuideStats.vue';
import { TROPHY_FLAGS } from '@/config/trophies';
import { hasRichContent } from '@/utils/html';
import { trophyAnchorId } from '@/utils/trophyRef';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';

// Visão geral do guia: dificuldade/jogadas/horas, quanto já foi explicado
// e a lista de troféus de cada marcação (História, Perdível…). Tocar no troféu leva até ele.
const props = defineProps({
  trophies: { type: Array, required: true },
  getNote: { type: Function, required: true },
});
defineEmits(['filter']);

const ctx = useTrophyContext();

// Uma passada: explicados + troféus por marcação
const summary = computed(() => {
  const byFlag = Object.fromEntries(TROPHY_FLAGS.map((f) => [f.id, []]));
  let explained = 0;
  for (const t of props.trophies) {
    const note = props.getNote(t.id);
    if (hasRichContent(note.tip)) explained++;
    for (const f of TROPHY_FLAGS) if (note[f.id]) byFlag[f.id].push(t);
  }
  return { explained, rows: TROPHY_FLAGS.map((f) => ({ ...f, trophies: byFlag[f.id] })).filter((r) => r.trophies.length) };
});

const total = computed(() => props.trophies.length);
const missing = computed(() => total.value - summary.value.explained);
</script>

<template>
  <section class="surface radius-2" aria-label="Visão geral do guia">
    <div class="d-flex align-center flex-wrap gap-2 p-2">
      <GuideStats />

      <div class="coverage d-flex flex-column gap-1 flex-1">
        <div class="d-flex align-center justify-between flex-wrap gap-1">
          <p class="text-sm"><span class="fw-600">Guia:</span> {{ summary.explained }} de {{ total }} explicados</p>
          <button v-if="missing" type="button" class="link-btn text-sm fw-500" @click="$emit('filter', 'notip')">
            Ver os {{ missing }} sem explicação
          </button>
          <span v-else class="text-sm text-accent fw-500">Todos explicados</span>
        </div>
        <ProgressBar :value="summary.explained" :max="total" />
      </div>
    </div>

    <!-- Troféus por marcação -->
    <div v-for="row in summary.rows" :key="row.id" class="flag-row d-flex px-2 py-1 border-top">
      <button type="button" class="badge flag-row__label shrink-0" :class="`badge--${row.tone}`" @click="$emit('filter', row.id)">
        <component :is="row.icon" :size="14" :stroke-width="2" /> {{ row.label }}
        <span class="flag-row__count">{{ row.trophies.length }}</span>
      </button>
      <div class="d-flex flex-wrap gap-1 text-sm">
        <a
          v-for="t in row.trophies"
          :key="t.id"
          :href="`#${trophyAnchorId(t.id)}`"
          class="trophy-ref"
          :data-type="t.type"
          @click.prevent="ctx?.goTo(t.id)"
        >
          {{ t.name || 'Troféu oculto' }}
        </a>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.coverage {
  min-width: 220px;
}

.link-btn {
  color: var(--accent);

  &:hover {
    text-decoration: underline;
  }
}

.flag-row {
  align-items: flex-start;
  gap: space(2);

  &__label {
    min-width: 104px;
    justify-content: space-between;
  }

  &__count {
    opacity: 0.7;
  }

  // Celular: rótulo em cima, troféus embaixo
  @include down(sm) {
    flex-direction: column;
    gap: space(1);

    &__label {
      align-self: flex-start;
    }
  }
}
</style>
