<script setup>
import { computed, onMounted, ref } from 'vue';
import { Gamepad2, Plus } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LoadingState from '@/components/ui/LoadingState.vue';
import GameGrid from '@/components/games/GameGrid.vue';
import GameCard from '@/components/games/GameCard.vue';
import LibraryFilters from '@/components/games/LibraryFilters.vue';
import GameSearchModal from '@/components/games/GameSearchModal.vue';
import { useLibraryStore } from '@/stores/library';
import { normalizeText, plural } from '@/utils/format';

const library = useLibraryStore();
const status = ref('all');
const text = ref('');
const searchOpen = ref(false);

onMounted(() => library.load());

const filtered = computed(() => {
  const q = normalizeText(text.value.trim());
  return library.entries.filter(
    (e) => (status.value === 'all' || e.status === status.value) && (!q || normalizeText(e.title).includes(q)),
  );
});
</script>

<template>
  <div class="container page">
    <PageHeader title="Biblioteca" :subtitle="plural(library.entries.length, 'jogo', 'jogos')">
      <template #actions>
        <BaseButton variant="primary" :icon="Plus" @click="searchOpen = true">Adicionar</BaseButton>
      </template>
    </PageHeader>

    <LoadingState v-if="library.loading && !library.loaded" />

    <EmptyState
      v-else-if="!library.entries.length"
      :icon="Gamepad2"
      title="Biblioteca vazia"
      text="Busque um jogo no IGDB e adicione para começar a montar os guias."
    >
      <BaseButton variant="primary" :icon="Plus" @click="searchOpen = true">Adicionar jogo</BaseButton>
    </EmptyState>

    <template v-else>
      <LibraryFilters v-model:status="status" v-model:text="text" :counts="library.counts" :total="library.entries.length" />
      <GameGrid v-if="filtered.length">
        <GameCard v-for="entry in filtered" :key="entry.id" :entry="entry" />
      </GameGrid>
      <p v-else class="text-muted py-4">Nenhum jogo neste filtro.</p>
    </template>

    <GameSearchModal v-model="searchOpen" />
  </div>
</template>
