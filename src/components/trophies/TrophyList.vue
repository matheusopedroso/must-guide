<script setup>
import { computed, nextTick, toRef } from 'vue';
import TrophyItem from './TrophyItem.vue';
import TrophyCounts from './TrophyCounts.vue';
import TrophyToolbar from './TrophyToolbar.vue';
import { trophyAnchorId } from '@/utils/trophyRef';
import { provideTrophyContext } from '@/composables/guide/useTrophyContext';
import { useTrophyListView } from '@/composables/guide/useTrophyListView';
import { useStoredRef } from '@/composables/useStoredRef';

// Lista de troféus: barra (busca/filtro/ordem) e grupos (jogo base + DLCs)
const props = defineProps({
  list: { type: Object, required: true },
  progress: { type: Object, default: null }, // { trophies: { [id]: stats } } da conta, se tiver o jogo
  getNote: { type: Function, required: true },
  backlinks: { type: Map, default: () => new Map() }, // troféu citado → ids de quem cita
  readonly: Boolean, // leitura do guia (sem edição)
});
defineEmits(['update-note']);

const { search, filter, sort, sorts, filters, sections, visibleCount, total, narrowed, stats, reset } = useTrophyListView({
  list: toRef(props, 'list'),
  progress: toRef(props, 'progress'),
  getNote: props.getNote,
});

// Spoiler: por padrão os ocultos ficam borrados (preferência guardada no navegador)
const showHidden = useStoredRef('mg:show-hidden-trophies', false);

const byId = computed(() => new Map(props.list.trophies.map((t) => [t.id, t])));
// Troféus que citam este (só os que existem na lista aberta)
const citedBy = (id) => (props.backlinks.get(id) ?? []).map((src) => byId.value.get(src)).filter(Boolean);

// Ir até um troféu (referência no texto): limpa busca/filtro para ele aparecer e destaca
async function goTo(id) {
  reset();
  await nextTick();
  const el = document.getElementById(trophyAnchorId(id));
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('is-flash');
  void el.offsetWidth; // reinicia a animação se clicar de novo
  el.classList.add('is-flash');
}

provideTrophyContext({ trophies: computed(() => props.list.trophies), goTo });

const showGroups = computed(() => props.list.groups.length > 1);
const groupName = (g) => (g.id === 'default' ? 'Jogo base' : g.name);
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <TrophyToolbar
      v-model:search="search"
      v-model:filter="filter"
      v-model:sort="sort"
      v-model:show-hidden="showHidden"
      :sorts="sorts"
      :filters="filters"
    />

    <p v-if="narrowed && visibleCount" class="d-flex align-center gap-1 text-xs text-subtle">
      Mostrando {{ visibleCount }} de {{ total }}
      <button type="button" class="text-accent fw-500" @click="reset">· Limpar</button>
    </p>

    <section v-for="g in sections" :key="g.id" class="d-flex flex-column gap-2">
      <header v-if="showGroups" class="d-flex align-center justify-between flex-wrap gap-1 mt-1">
        <h3 class="group-title">{{ groupName(g) }}</h3>
        <TrophyCounts :counts="g.counts" />
      </header>
      <ul class="d-flex flex-column gap-2">
        <TrophyItem
          v-for="t in g.trophies"
          :key="t.id"
          :trophy="t"
          :note="getNote(t.id)"
          :stats="stats(t.id)"
          :cited-by="citedBy(t.id)"
          :spoiler="t.hidden && !showHidden"
          :readonly="readonly"
          @update-note="(id, patch) => $emit('update-note', id, patch)"
        />
      </ul>
    </section>

    <div v-if="!sections.length" class="d-flex align-center gap-2 text-sm text-muted py-2">
      Nenhum troféu {{ search ? `com “${search}”` : 'neste filtro' }}.
      <button type="button" class="text-accent fw-500" @click="reset">Limpar</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group-title {
  font-size: 17px;
}
</style>
