<script setup>
import { computed, nextTick, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SectionsView from './SectionsView.vue';
import PrevNextNav from '@/components/ui/PrevNextNav.vue';
import { pageName } from '@/utils/pages';
import { countDone, useTrophyChecklist } from '@/composables/guide/useTrophyChecklist';

// Aba paginada na leitura (Guia — como o IGN e o TrueAchievements): sumário das páginas (ao lado no desktop,
// seletor no celular), a página aberta com as suas seções (SectionsView) e anterior/próxima no fim.
// A página fica na URL (?pagina=2) e cada troca entra no histórico: dá para compartilhar o link de uma página
// e o "voltar" do navegador volta para a página anterior do guia.
const props = defineProps({
  pages: { type: Array, required: true }, // filledPages(): só as páginas com conteúdo
  cfg: { type: Object, required: true },
  flagged: { type: Array, default: () => [] },
  list: { type: Object, default: null },
  progress: { type: Object, default: null },
});
defineEmits(['open-trophy']);

const route = useRoute();
const router = useRouter();
const index = computed(() => Math.min(Math.max(Number(route.query.pagina) - 1 || 0, 0), props.pages.length - 1));
const page = computed(() => props.pages[index.value]);

// Checklist: troféus feitos de cada página (os das seções dela, sem repetir)
const checklist = useTrophyChecklist();
const pageCount = (p) => {
  const ids = [...new Set(p.sections.flatMap((s) => s.trophies))];
  return checklist && ids.length ? countDone(ids, checklist.isDone) : null;
};
const prev = computed(() => (index.value > 0 ? { i: index.value - 1, name: pageName(props.pages[index.value - 1], index.value - 1) } : null));
const next = computed(() =>
  index.value < props.pages.length - 1 ? { i: index.value + 1, name: pageName(props.pages[index.value + 1], index.value + 1) } : null,
);

// Trocar de página leva ao começo dela
const root = useTemplateRef('root');
async function go(i) {
  if (i === index.value) return;
  await router.push({ query: { ...route.query, pagina: i > 0 ? String(i + 1) : undefined } });
  await nextTick();
  root.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>

<template>
  <div ref="root" class="paged">
    <!-- Sumário (desktop) -->
    <aside class="paged__toc" aria-label="Páginas do guia">
      <p class="kicker mb-1">Páginas <span class="text-subtle">· {{ pages.length }}</span></p>
      <ol class="d-flex flex-column gap-1">
        <li v-for="(p, i) in pages" :key="p.id">
          <button
            type="button"
            class="toc-item d-flex gap-1 w-100 radius-1 px-1 py-1 text-sm"
            :class="{ 'is-active': i === index }"
            :aria-current="i === index ? 'page' : undefined"
            @click="go(i)"
          >
            <span class="toc-item__n shrink-0">{{ i + 1 }}</span>
            <span class="min-w-0 flex-1">{{ pageName(p, i) }}</span>
            <span v-if="pageCount(p)" class="toc-item__count shrink-0" :class="{ 'is-done': pageCount(p).done === pageCount(p).total }">
              {{ pageCount(p).done }}/{{ pageCount(p).total }}
            </span>
          </button>
        </li>
      </ol>
    </aside>

    <div class="paged__main d-flex flex-column gap-3 min-w-0">
      <!-- Sumário (celular): seletor -->
      <label v-if="pages.length > 1" class="paged__select field">
        <span class="field__label">Página</span>
        <select :value="index" class="input" @change="go(Number($event.target.value))">
          <option v-for="(p, i) in pages" :key="p.id" :value="i">{{ i + 1 }}. {{ pageName(p, i) }}</option>
        </select>
      </label>

      <header class="d-flex flex-column gap-1">
        <p class="kicker">Página {{ index + 1 }} de {{ pages.length }}</p>
        <h2 class="paged__title">{{ pageName(page, index) }}</h2>
      </header>

      <SectionsView
        :key="page.id"
        :sections="page.sections"
        :cfg="cfg"
        :flagged="index === 0 ? flagged : []"
        :list="list"
        :progress="progress"
        @open-trophy="$emit('open-trophy', $event)"
      />

      <PrevNextNav :prev="prev" :next="next" label="Navegar entre as páginas" @go="go($event === 'prev' ? prev.i : next.i)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.paged {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: space(3);
  scroll-margin-top: calc(var(--nav-offset) + var(--pbar-gap) + var(--pbar-height) + 64px); // barra + abas

  @include up(md) {
    grid-template-columns: 224px minmax(0, 1fr);
    gap: space(4);
    align-items: start;
  }

  &__toc {
    display: none;

    @include up(md) {
      display: block;
      position: sticky;
      top: calc(var(--nav-offset) + var(--pbar-gap) + var(--pbar-height) + 72px);
    }
  }

  &__select {
    @include up(md) {
      display: none;
    }
  }

  &__title {
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.15;
  }
}

.toc-item {
  text-align: left;
  color: var(--text-muted);
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  &.is-active {
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: 600;
  }

  &__count {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    opacity: 0.8;

    &.is-done {
      color: var(--earned);
      opacity: 1;
    }
  }

  &__n {
    min-width: 16px;
    font-variant-numeric: tabular-nums;
    opacity: 0.7;
  }
}

</style>
