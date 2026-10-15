<script setup>
import { ref } from 'vue';

// "Sobre o jogo": gêneros e resumo (corta em 5 linhas, com Ler mais). Página do jogo e Visão geral do guia.
defineProps({
  game: { type: Object, default: null },
  title: { type: String, default: 'Sobre o jogo' },
});
const expanded = ref(false);
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <p class="kicker">{{ title }}</p>
    <div v-if="game?.genres?.length" class="d-flex flex-wrap gap-1">
      <span v-for="g in game.genres.slice(0, 4)" :key="g" class="pill">{{ g }}</span>
    </div>
    <template v-if="game?.summary">
      <p class="summary" :class="{ 'line-clamp-5': !expanded }">{{ game.summary }}</p>
      <button v-if="game.summary.length > 360" type="button" class="link-btn text-sm fw-600" @click="expanded = !expanded">
        {{ expanded ? 'Mostrar menos' : 'Ler mais' }}
      </button>
    </template>
    <p v-else-if="game" class="text-muted text-sm">Sem descrição do jogo.</p>
  </div>
</template>

<style lang="scss" scoped>
.summary {
  color: var(--text-muted);
  line-height: 1.65;
  white-space: pre-line;
}

.line-clamp-5 {
  @include clamp-lines(5);
}

.link-btn {
  align-self: flex-start;
  color: var(--accent);

  &:hover {
    text-decoration: underline;
  }
}
</style>
