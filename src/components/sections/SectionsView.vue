<script setup>
import { computed, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import RefText from '@/components/trophies/RefText.vue';
import SectionTrophyGrid from './SectionTrophyGrid.vue';
import CollectibleCard from '@/components/collectibles/CollectibleCard.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import ButtonStyleToggle from '@/components/trophies/ButtonStyleToggle.vue';
import { useCollectibleContext } from '@/composables/guide/useCollectibles';
import { provideTrophyContext } from '@/composables/guide/useTrophyContext';
import { useStoredRef } from '@/composables/useStoredRef';
import { sectionLabel, sectionWords } from '@/utils/sections';
import { TROPHY_FLAGS } from '@/config/trophies';

// Aba de seções na leitura (Guia, Roadmap): índice e, em cada seção, o texto corrido e a grade dos troféus.
// Tocar num troféu (no texto ou na grade) abre a aba Troféus nele. sections: só as preenchidas.
const props = defineProps({
  sections: { type: Array, required: true },
  cfg: { type: Object, required: true }, // config da aba (config/guideTabs → sections)
  flagged: { type: Array, default: () => [] }, // troféus com a marcação da aba (cfg.flag), no topo
  list: { type: Object, default: null },
  progress: { type: Object, default: null },
});
defineEmits(['open-trophy']);

const byId = computed(() => new Map((props.list?.trophies ?? []).map((t) => [t.id, t])));
// Cartões de troféu no texto (RefText) usam a lista e o seu progresso
provideTrophyContext({ trophies: computed(() => props.list?.trophies ?? []), progress: computed(() => props.progress) });
const visible = computed(() =>
  props.sections.map((s, i) => ({
    ...s,
    label: sectionLabel(s, i, props.cfg),
    trophyItems: s.trophies.map((id) => byId.value.get(id)).filter(Boolean),
  })),
);

// Coletáveis (cfg.items): progresso pessoal e opção de esconder os já coletados (preferência no navegador)
const col = useCollectibleContext();
const isDone = (id) => !!col?.collected?.value.has(id);
const hideDone = useStoredRef('mg:hide-collected', false);
const countOf = (list = []) => ({ done: list.filter((i) => isDone(i.id)).length, total: list.length });
const overall = computed(() => countOf(props.sections.flatMap((s) => s.items ?? [])));
const shown = (list = []) => (hideDone.value ? list.filter((i) => !isDone(i.id)) : list);
const w = computed(() => sectionWords(props.cfg));
// Texto com botões de controle: mostra a escolha PlayStation / Xbox
const hasKeys = computed(() => props.sections.some((s) => s.body?.includes('btn-key')));
const flag = computed(() => TROPHY_FLAGS.find((f) => f.id === props.cfg.flag) ?? null);
const anchor = (s) => `secao-${s.id}`;

// Aberto com #secao-… (ex.: "Onde aparece no guia", na página do troféu): rola até a seção
const route = useRoute();
onMounted(async () => {
  if (!route.hash.startsWith('#secao-')) return;
  await nextTick();
  document.getElementById(route.hash.slice(1))?.scrollIntoView({ block: 'start' });
});
const goToStage = (s) => document.getElementById(anchor(s))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <!-- Marcados como Perdível/Online na aba Troféus: entram sozinhos -->
    <section v-if="flag && flagged.length" class="section surface radius-2 p-2 d-flex flex-column gap-2">
      <h2 class="section-heading d-flex align-center gap-1">
        <span class="badge" :class="`badge--${flag.tone}`"><component :is="flag.icon" :size="14" :stroke-width="2" /></span>
        Marcados como {{ flag.label }} <span class="text-subtle fw-500">{{ flagged.length }}</span>
      </h2>
      <SectionTrophyGrid :trophies="flagged" :progress="progress" @open="$emit('open-trophy', $event)" />
    </section>

    <!-- Coletáveis: progresso geral -->
    <div v-if="cfg.items && overall.total" class="surface radius-2 p-2 d-flex flex-column gap-1">
      <div class="d-flex align-center justify-between flex-wrap gap-1">
        <span class="text-sm"><strong>{{ overall.done }}</strong> de {{ overall.total }} coletáveis</span>
        <label class="checkbox text-sm"><input v-model="hideDone" type="checkbox" /> Esconder coletados</label>
      </div>
      <ProgressBar :value="overall.done" :max="overall.total" tone="earned" />
    </div>

    <ButtonStyleToggle v-if="hasKeys" />

    <!-- Índice: só com 2+ seções -->
    <nav v-if="visible.length > 1" class="d-flex flex-wrap gap-1" aria-label="Seções">
      <button v-for="s in visible" :key="s.id" type="button" class="pill" @click="goToStage(s)">{{ s.label }}</button>
    </nav>

    <section v-for="s in visible" :id="anchor(s)" :key="s.id" class="section surface radius-2 p-2 d-flex flex-column gap-2">
      <h2 class="section-heading d-flex align-center justify-between gap-1">
        {{ s.label }}
        <span v-if="cfg.items && s.items?.length" class="text-sm fw-600 text-subtle">{{ countOf(s.items).done }}/{{ s.items.length }}</span>
      </h2>
      <RefText :html="s.body" class="section__body" @trophy="$emit('open-trophy', $event)" />
      <div v-if="cfg.items && s.items?.length" class="d-flex flex-column gap-2">
        <CollectibleCard v-for="it in shown(s.items)" :key="it.id" :item="it" :collected="isDone(it.id)" :can-toggle="!!col?.toggle" @toggle="col.toggle" />
        <p v-if="!shown(s.items).length" class="text-sm text-muted">Tudo coletado aqui. ✓</p>
      </div>
      <template v-if="s.trophyItems.length">
        <p class="kicker">Troféus {{ w.this }} {{ w.name }} · {{ s.trophyItems.length }}</p>
        <SectionTrophyGrid :trophies="s.trophyItems" :progress="progress" @open="$emit('open-trophy', $event)" />
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
