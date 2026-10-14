<script setup>
import { ref, watch } from 'vue';
import { Check, Plus } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import GameCover from '@/components/ui/GameCover.vue';
import LoadingState from '@/components/ui/LoadingState.vue';
import SearchInput from '@/components/ui/SearchInput.vue';
import { useDebounceFn } from '@/composables/useDebounceFn';
import { useLibraryStore } from '@/stores/library';
import { searchGames } from '@/services/igdb.service';

const open = defineModel({ type: Boolean, default: false });
const emit = defineEmits(['added']);

const library = useLibraryStore();
const term = ref('');
const results = ref([]);
const loading = ref(false);
const error = ref('');
const adding = ref(null);
let lastQuery = 0;

const runSearch = useDebounceFn(async (q) => {
  const ticket = ++lastQuery; // ignora respostas antigas que chegarem depois
  loading.value = true;
  try {
    const games = await searchGames(q);
    if (ticket === lastQuery) results.value = games;
  } catch (e) {
    if (ticket === lastQuery) error.value = 'Falha ao buscar no IGDB.';
    console.error('[igdb]', e);
  } finally {
    if (ticket === lastQuery) loading.value = false;
  }
}, 450);

watch(term, (q) => {
  error.value = '';
  if (q.trim().length >= 2) return runSearch(q);
  runSearch.cancel();
  lastQuery++;
  loading.value = false;
  results.value = [];
});

async function add(game) {
  adding.value = game.id;
  try {
    const entry = await library.add(game);
    emit('added', entry);
  } finally {
    adding.value = null;
  }
}

const platformsLabel = (g) => g.platforms.slice(0, 3).join(' · ');
</script>

<template>
  <BaseModal v-model="open" title="Adicionar jogo">
    <SearchInput v-model="term" placeholder="Nome do jogo" autofocus class="mb-2" />

    <LoadingState v-if="loading" text="Buscando…" />
    <p v-else-if="error" class="text-danger text-sm py-2">{{ error }}</p>

    <ul v-else class="d-flex flex-column">
      <li v-for="g in results" :key="g.id" class="result d-flex align-center gap-2 py-1">
        <GameCover :cover-id="g.coverId" :title="g.title" size="cover_small" class="result__cover shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="fw-500 line-clamp-2">{{ g.title }}</p>
          <p class="text-xs text-muted truncate">
            {{ [g.year, platformsLabel(g)].filter(Boolean).join(' · ') }}
          </p>
        </div>
        <span v-if="library.has(g.id)" class="d-flex align-center gap-1 text-sm text-muted shrink-0 px-1">
          <Check :size="16" /> Na biblioteca
        </span>
        <BaseButton
          v-else
          size="sm"
          :icon="Plus"
          :loading="adding === g.id"
          class="shrink-0"
          @click="add(g)"
        >
          Adicionar
        </BaseButton>
      </li>
    </ul>
  </BaseModal>
</template>

<style lang="scss" scoped>
.result {
  & + & {
    border-top: 1px solid var(--border);
  }

  &__cover {
    width: 48px;
  }
}
</style>
