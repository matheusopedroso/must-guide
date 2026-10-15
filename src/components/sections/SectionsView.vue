<script setup>
import { computed, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import RefText from '@/components/trophies/RefText.vue';
import SectionTrophyGrid from './SectionTrophyGrid.vue';
import CollectibleCard from '@/components/collectibles/CollectibleCard.vue';
import CollectiblesOverview from '@/components/collectibles/CollectiblesOverview.vue';
import VideoButton from '@/components/ui/VideoButton.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { Pencil } from 'lucide-vue-next';
import ButtonStyleToggle from '@/components/trophies/ButtonStyleToggle.vue';
import { useCollectibleView } from '@/composables/guide/useCollectibleView';
import { useEditLinks } from '@/composables/guide/useEditLinks';
import { provideTrophyContext } from '@/composables/guide/useTrophyContext';
import { countDone, useTrophyChecklist } from '@/composables/guide/useTrophyChecklist';
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

// Coletáveis (cfg.items): progresso (geral, por tipo, por região), filtro, esconder coletados e modo compacto
const cv = props.cfg.items ? useCollectibleView(computed(() => props.sections)) : null;
const { col, isDone, hideDone, compact, filter, overall, byType, missable, shown, regionCount, regionTypes } = cv ?? {};
// Com filtro: só as regiões que têm algum coletável dele
const listed = computed(() => (filter?.value ? visible.value.filter((s) => shown(s).length) : visible.value));
const w = computed(() => sectionWords(props.cfg));
// Lápis (quem pode editar): abre o editor nesta seção
const edit = useEditLinks();
// Checklist de quem lê: troféus feitos em cada seção
const checklist = useTrophyChecklist();
const trophyCount = (s) => (checklist && s.trophyItems.length ? countDone(s.trophyItems.map((t) => t.id), checklist.isDone) : null);

// Texto com botões de controle (seções e "como achar" dos coletáveis): mostra a escolha PlayStation / Xbox
const hasKey = (html) => !!html?.includes('btn-key');
const hasKeys = computed(() => props.sections.some((s) => hasKey(s.body) || s.items?.some((i) => hasKey(i.description))));
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

    <!-- Coletáveis: progresso geral, por tipo (filtra) e opções -->
    <CollectiblesOverview
      v-if="cv && overall.total"
      v-model:filter="filter"
      v-model:hide-done="hideDone"
      v-model:compact="compact"
      :overall="overall"
      :by-type="byType"
      :missable="missable"
    />

    <ButtonStyleToggle v-if="hasKeys" />

    <!-- Índice: só com 2+ seções -->
    <nav v-if="visible.length > 1" class="d-flex flex-wrap gap-1" aria-label="Seções">
      <button v-for="s in visible" :key="s.id" type="button" class="pill" @click="goToStage(s)">
        {{ s.label }}
        <span v-if="cv && s.items?.length" class="text-subtle">{{ regionCount(s).done }}/{{ regionCount(s).total }}</span>
      </button>
    </nav>

    <p v-if="filter && !listed.length" class="text-sm text-muted">Nenhum coletável com este filtro{{ hideDone ? ' (ou já foram coletados)' : '' }}.</p>

    <section v-for="s in listed" :id="anchor(s)" :key="s.id" class="section surface radius-2 p-2 d-flex flex-column gap-2">
      <div class="d-flex align-center flex-wrap gap-1">
        <h2 class="section-heading flex-1">{{ s.label }}</h2>
        <VideoButton v-if="s.video" :url="s.video" :title="s.label" size="sm" variant="ghost" />
        <BaseButton
          v-if="edit?.section(s.id)"
          :to="edit.section(s.id)"
          :icon="Pencil"
          icon-only
          size="sm"
          variant="ghost"
          class="tooltip-left"
          :aria-label="`Editar ${s.label}`"
          :data-tooltip="`Editar ${w.thisOne} ${w.name}`"
        />
        <span v-if="cv && s.items?.length" class="text-sm fw-600 text-subtle">{{ regionCount(s).done }}/{{ regionCount(s).total }}</span>
      </div>
      <!-- Contagem por tipo da região (linha do PowerPyx: "7 Artefatos | 3 Pingentes"), mesmo com um tipo só
           (igual em todas as regiões); some só se nenhum coletável da região tiver tipo -->
      <p v-if="cv && regionTypes(s).some((t) => t.type)" class="d-flex flex-wrap gap-1">
        <span v-for="t in regionTypes(s)" :key="t.type" class="tag">{{ t.type || 'Sem tipo' }} {{ t.done }}/{{ t.total }}</span>
      </p>
      <RefText :html="s.body" class="section__body" @trophy="$emit('open-trophy', $event)" />
      <div v-if="cv && s.items?.length" class="d-flex flex-column" :class="compact ? 'gap-1' : 'gap-2'">
        <CollectibleCard
          v-for="g in shown(s)"
          :key="g[0].id"
          :items="g"
          :is-done="isDone"
          :can-toggle="!!col?.toggle"
          :compact="compact"
          @toggle="col.toggle"
          @open-trophy="$emit('open-trophy', $event)"
        />
        <p v-if="!shown(s).length" class="text-sm text-muted">{{ filter ? 'Nada deste filtro aqui.' : 'Tudo coletado aqui. ✓' }}</p>
      </div>
      <template v-if="s.trophyItems.length">
        <p class="kicker">
          Troféus {{ w.this }} {{ w.name }} ·
          <template v-if="trophyCount(s)">{{ trophyCount(s).done }}/{{ trophyCount(s).total }} feitos</template>
          <template v-else>{{ s.trophyItems.length }}</template>
        </p>
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
