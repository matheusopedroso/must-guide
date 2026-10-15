<script setup>
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';
import SearchInput from '@/components/ui/SearchInput.vue';
import GameCover from '@/components/ui/GameCover.vue';
import ProviderCredit from '@/components/ui/ProviderCredit.vue';
import { useGameSearch } from '@/composables/useGameSearch';
import { useClickOutside } from '@/composables/useClickOutside';

// "Select" de jogo com pesquisa: abre com os populares e filtra ao digitar.
// inline: a lista fica no fluxo da página em vez de flutuar (dentro de modal, onde seria cortada)
defineProps({ autofocus: Boolean, inline: Boolean });
const emit = defineEmits(['select']);

const LIST_ID = 'game-picker-list';
const term = ref('');
const open = ref(false);
const active = ref(-1);
const root = useTemplateRef('root');
const list = useTemplateRef('list');

const { games, provider, loading, loaded, error, isSearching, load } = useGameSearch(term, { immediate: false });

function openList() {
  open.value = true;
  if (!loaded.value && !loading.value) load(); // populares só na primeira abertura
}

function close() {
  open.value = false;
  active.value = -1;
}

function choose(game) {
  emit('select', game);
  term.value = '';
  close();
}

watch(term, openList);
watch(games, (list) => (active.value = list.length ? 0 : -1));

// Mantém a opção ativa visível ao navegar com as setas
watch(active, async (i) => {
  await nextTick();
  list.value?.querySelector(`[data-index="${i}"]`)?.scrollIntoView({ block: 'nearest' });
});

function onKeydown(e) {
  const last = games.value.length - 1;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!open.value) return openList();
    const step = e.key === 'ArrowDown' ? 1 : -1;
    active.value = active.value + step > last ? 0 : active.value + step < 0 ? last : active.value + step;
  } else if (e.key === 'Enter' && open.value && games.value[active.value]) {
    e.preventDefault();
    choose(games.value[active.value]);
  } else if (e.key === 'Escape') {
    close();
  }
}

useClickOutside(root, open, close);

const meta = (g) => [g.kind, g.year, g.platforms.slice(0, 3).join(' · ')].filter(Boolean).join(' · '); // kind: edição, remaster, DLC…
</script>

<template>
  <div ref="root" class="picker relative" :class="{ 'picker--inline': inline }">
    <SearchInput
      v-model="term"
      size="lg"
      placeholder="Selecione o jogo"
      :autofocus="autofocus"
      :input-attrs="{
        role: 'combobox',
        'aria-expanded': open,
        'aria-controls': LIST_ID,
        'aria-autocomplete': 'list',
        'aria-activedescendant': open && active > -1 ? `${LIST_ID}-${active}` : undefined,
        onFocus: openList,
        onClick: openList,
        onKeydown,
      }"
    />

    <div v-if="open" class="picker__panel surface radius-2 mt-1">
      <p class="text-xs text-subtle fw-600 px-2 pt-2 pb-1">{{ isSearching ? 'Resultados' : 'Populares' }}</p>

      <div v-if="loading" class="d-flex align-center gap-1 px-2 pb-2 text-sm text-muted">
        <LoaderCircle :size="16" class="spin" /> Buscando…
      </div>
      <p v-else-if="error" class="px-2 pb-2 text-sm text-danger">{{ error }}</p>
      <p v-else-if="!games.length" class="px-2 pb-2 text-sm text-muted">Nenhum jogo encontrado.</p>

      <ul v-else :id="LIST_ID" ref="list" role="listbox" aria-label="Jogos" class="picker__list pb-1">
        <li
          v-for="(g, i) in games"
          :id="`${LIST_ID}-${i}`"
          :key="g.id"
          :data-index="i"
          role="option"
          :aria-selected="i === active"
          class="picker__option d-flex align-center gap-2 px-2 py-1"
          :class="{ 'is-active': i === active }"
          @pointerenter="active = i"
          @pointerdown.prevent
          @click="choose(g)"
        >
          <GameCover :src="g.cover" :title="g.title" size="sm" class="picker__cover shrink-0" />
          <div class="min-w-0">
            <p class="fw-500 truncate">{{ g.title }}</p>
            <p v-if="meta(g)" class="text-xs text-subtle truncate">{{ meta(g) }}</p>
          </div>
        </li>
      </ul>

      <ProviderCredit v-if="provider && games.length" :providers="[provider]" class="px-2 pb-2" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.picker {
  &__panel {
    position: absolute;
    inset: 100% 0 auto;
    z-index: 20;
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  &--inline &__panel {
    position: static;
    box-shadow: none;
  }

  &__list {
    max-height: min(400px, 50dvh);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  &__option {
    cursor: pointer;

    &.is-active {
      background: var(--surface-hover);
    }
  }

  &__cover {
    width: 40px;
  }
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
