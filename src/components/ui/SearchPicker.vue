<script setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import SearchInput from './SearchInput.vue';
import { normalizeName } from '@/utils/text';

// Lista com busca para escolher um item (abre por cima do editor): setas, Enter e Esc.
// names(item) → textos onde buscar. Ordem: nome igual → começa com → contém (empate mantém a ordem original).
// Slot #item="{ item }" desenha cada linha.
const props = defineProps({
  items: { type: Array, required: true },
  names: { type: Function, required: true },
  exclude: { type: [Number, String, Array], default: null }, // ids que não aparecem
  initialTerm: { type: String, default: '' },
  placeholder: { type: String, default: 'Buscar' },
  label: { type: String, required: true },
  empty: { type: String, default: 'Nada encontrado.' },
});
const emit = defineEmits(['select', 'cancel']);

const term = ref(props.initialTerm);
const active = ref(0);
const search = useTemplateRef('search');
const list = useTemplateRef('list');

const excluded = computed(() => new Set([props.exclude ?? []].flat()));

const results = computed(() => {
  const q = normalizeName(term.value);
  const pool = props.items.filter((i) => !excluded.value.has(i.id));
  if (!q) return pool;
  const score = (item) => {
    const names = props.names(item).filter(Boolean).map(normalizeName);
    if (names.includes(q)) return 0;
    if (names.some((n) => n.startsWith(q))) return 1;
    return names.some((n) => n.includes(q)) ? 2 : 3;
  };
  return pool
    .map((i) => [score(i), i])
    .filter(([sc]) => sc < 3)
    .sort((a, b) => a[0] - b[0])
    .map(([, i]) => i);
});

watch(results, () => (active.value = 0));
watch(active, async (i) => {
  await nextTick();
  list.value?.querySelector(`[data-index="${i}"]`)?.scrollIntoView({ block: 'nearest' });
});

// Foco direto na busca (também no celular: quem abriu foi um toque intencional)
onMounted(() => search.value?.focus());

function onKeydown(e) {
  const last = results.value.length - 1;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = active.value + (e.key === 'ArrowDown' ? 1 : -1);
    active.value = next > last ? 0 : next < 0 ? last : next;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (results.value[active.value]) emit('select', results.value[active.value]);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation(); // Esc fecha só a lista, não o editor
    emit('cancel');
  }
}
</script>

<template>
  <div class="picker surface radius-2 d-flex flex-column" role="dialog" :aria-label="label">
    <div class="p-1 border-bottom">
      <SearchInput ref="search" v-model="term" :placeholder="placeholder" :input-attrs="{ onKeydown }" />
    </div>

    <ul v-if="results.length" ref="list" class="picker__list py-1" role="listbox">
      <li
        v-for="(item, i) in results"
        :key="item.id"
        :data-index="i"
        role="option"
        :aria-selected="i === active"
        class="picker__option d-flex align-center gap-2 px-2 py-1"
        :class="{ 'is-active': i === active }"
        @pointerenter="active = i"
        @pointerdown.prevent
        @click="emit('select', item)"
      >
        <slot name="item" :item="item" />
      </li>
    </ul>
    <p v-else class="text-sm text-muted p-2">{{ empty }}</p>
  </div>
</template>

<style lang="scss" scoped>
.picker {
  box-shadow: var(--shadow);
  overflow: hidden;

  &__list {
    max-height: min(320px, 45dvh);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  &__option {
    cursor: pointer;

    &.is-active {
      background: var(--surface-hover);
    }
  }
}
</style>
