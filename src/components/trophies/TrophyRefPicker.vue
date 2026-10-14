<script setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { Trophy } from 'lucide-vue-next';
import SearchInput from '@/components/ui/SearchInput.vue';
import { TROPHY_TYPE_MAP } from '@/config/trophies';
import { normalizeName } from '@/utils/text';

// Lista para escolher o troféu a referenciar (abre por cima do editor)
const props = defineProps({
  trophies: { type: Array, required: true },
  exclude: { type: [Number, String, Array], default: null }, // o próprio troféu (ou vários: já escolhidos)
  initialTerm: { type: String, default: '' }, // ex.: texto selecionado no editor
});
const emit = defineEmits(['select', 'cancel']);

const term = ref(props.initialTerm);
const active = ref(0);
const search = useTemplateRef('search');
const list = useTemplateRef('list');

const excluded = computed(() => new Set([props.exclude ?? []].flat()));

// Ordem: nome igual (PT ou EN) → começa com → contém. Acha pelo inglês também (guias gringos).
const results = computed(() => {
  const q = normalizeName(term.value);
  const pool = props.trophies.filter((t) => !excluded.value.has(t.id));
  if (!q) return pool;
  const score = (t) => {
    const names = [normalizeName(t.name ?? ''), normalizeName(t.nameEn ?? '')];
    if (names.includes(q)) return 0;
    if (names.some((n) => n.startsWith(q))) return 1;
    return names.some((n) => n.includes(q)) ? 2 : 3;
  };
  return pool
    .map((t) => [score(t), t])
    .filter(([sc]) => sc < 3)
    .sort((a, b) => a[0] - b[0]) // estável: empate mantém a ordem da PSN
    .map(([, t]) => t);
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

const typeOf = (t) => TROPHY_TYPE_MAP[t.type] ?? TROPHY_TYPE_MAP.bronze;
</script>

<template>
  <div class="ref-picker surface radius-2 d-flex flex-column" role="dialog" aria-label="Referenciar troféu">
    <div class="p-1 border-bottom">
      <SearchInput ref="search" v-model="term" placeholder="Buscar troféu" :input-attrs="{ onKeydown }" />
    </div>

    <ul v-if="results.length" ref="list" class="ref-picker__list py-1" role="listbox">
      <li
        v-for="(t, i) in results"
        :key="t.id"
        :data-index="i"
        role="option"
        :aria-selected="i === active"
        class="ref-picker__option d-flex align-center gap-2 px-2 py-1"
        :class="{ 'is-active': i === active }"
        @pointerenter="active = i"
        @pointerdown.prevent
        @click="emit('select', t)"
      >
        <img v-if="t.icon" :src="t.icon" alt="" class="ref-picker__icon radius-1 shrink-0" loading="lazy" />
        <span class="text-sm fw-500 truncate flex-1">{{ t.name || 'Troféu oculto' }}</span>
        <Trophy :size="16" :stroke-width="2" class="shrink-0" :style="{ color: typeOf(t).color }" :aria-label="typeOf(t).label" />
      </li>
    </ul>
    <p v-else class="text-sm text-muted p-2">Nenhum troféu encontrado.</p>
  </div>
</template>

<style lang="scss" scoped>
.ref-picker {
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

  &__icon {
    width: 32px;
    height: 32px;
    object-fit: cover;
    background: var(--surface-2);
  }
}
</style>
