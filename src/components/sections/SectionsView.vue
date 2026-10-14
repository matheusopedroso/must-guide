<script setup>
import { computed } from 'vue';
import RefText from '@/components/trophies/RefText.vue';
import SectionTrophyGrid from './SectionTrophyGrid.vue';
import { sectionLabel } from '@/utils/sections';

// Aba de seções na leitura (Guia, Roadmap): índice e, em cada seção, o texto corrido e a grade dos troféus.
// Tocar num troféu (no texto ou na grade) abre a aba Troféus nele. sections: só as preenchidas.
const props = defineProps({
  sections: { type: Array, required: true },
  cfg: { type: Object, required: true }, // config da aba (config/guideTabs → sections)
  list: { type: Object, default: null },
  progress: { type: Object, default: null },
});
defineEmits(['open-trophy']);

const byId = computed(() => new Map((props.list?.trophies ?? []).map((t) => [t.id, t])));
const visible = computed(() =>
  props.sections.map((s, i) => ({
    ...s,
    label: sectionLabel(s, i, props.cfg),
    items: s.trophies.map((id) => byId.value.get(id)).filter(Boolean),
  })),
);
const unit = computed(() => props.cfg.unit.toLowerCase());
const anchor = (s) => `secao-${s.id}`;
const goToStage = (s) => document.getElementById(anchor(s))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <!-- Índice: só com 2+ seções -->
    <nav v-if="visible.length > 1" class="d-flex flex-wrap gap-1" aria-label="Seções">
      <button v-for="s in visible" :key="s.id" type="button" class="pill" @click="goToStage(s)">{{ s.label }}</button>
    </nav>

    <section v-for="s in visible" :id="anchor(s)" :key="s.id" class="section surface radius-2 p-2 d-flex flex-column gap-2">
      <h2 class="section-heading">{{ s.label }}</h2>
      <RefText :html="s.body" class="section__body" @trophy="$emit('open-trophy', $event)" />
      <template v-if="s.items.length">
        <p class="kicker">Troféus desta {{ unit }} · {{ s.items.length }}</p>
        <SectionTrophyGrid :trophies="s.items" :progress="progress" @open="$emit('open-trophy', $event)" />
      </template>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.section {
  scroll-margin-top: calc(var(--nav-offset) + var(--pbar-gap) + var(--pbar-height) + 64px); // barra + abas

  &__body {
    font-size: 15px;
    line-height: 1.7;
  }
}

.pill {
  cursor: pointer;

  &:hover {
    border-color: var(--border-strong);
  }
}
</style>
