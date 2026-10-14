<script setup>
import { computed } from 'vue';
import { SearchX, TriangleAlert } from 'lucide-vue-next';
import SearchInput from '@/components/ui/SearchInput.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import ProviderCredit from '@/components/ui/ProviderCredit.vue';
import GameGrid from '@/components/games/GameGrid.vue';
import GameCard from '@/components/games/GameCard.vue';
import GameCardSkeleton from '@/components/games/GameCardSkeleton.vue';
import { useGameSearch } from '@/composables/useGameSearch';

const { term, games, provider, loading, error, isSearching, query, retry } = useGameSearch();

const sectionTitle = computed(() => (isSearching.value ? `Resultados para “${query.value}”` : 'Populares agora'));
</script>

<template>
  <div class="page">
    <section class="hero container d-flex flex-column align-center text-center gap-2">
      <h1 class="hero__title">Qual jogo você vai platinar?</h1>
      <p class="text-muted">Encontre o jogo e monte o guia de troféus.</p>
      <SearchInput v-model="term" size="lg" placeholder="Pesquisar jogo" autofocus class="hero__search w-100 mt-2" />
    </section>

    <section class="container" aria-live="polite">
      <h2 class="section-title mb-2">{{ sectionTitle }}</h2>

      <GameGrid v-if="loading">
        <GameCardSkeleton v-for="n in 12" :key="n" />
      </GameGrid>

      <EmptyState v-else-if="error" :icon="TriangleAlert" title="Não deu para carregar" :text="error">
        <BaseButton @click="retry">Tentar de novo</BaseButton>
      </EmptyState>

      <EmptyState
        v-else-if="!games.length"
        :icon="SearchX"
        title="Nenhum jogo encontrado"
        text="Confira o nome ou tente um termo mais curto."
      />

      <GameGrid v-else>
        <GameCard v-for="game in games" :key="game.id" :game="game" />
      </GameGrid>

      <ProviderCredit v-if="provider" :providers="[provider]" class="mt-6" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  padding-block: space(5) space(5);

  @include up(md) {
    padding-block: space(8) space(6);
  }

  &__title {
    font-size: clamp(28px, 6vw, 44px);
  }

  &__search {
    max-width: 640px;
  }
}

.section-title {
  font-size: 20px;
}
</style>
