<script setup>
import { computed } from 'vue';
import GameCover from '@/components/ui/GameCover.vue';

const props = defineProps({ game: { type: Object, required: true } });

const meta = computed(() => [props.game.year, props.game.platforms.slice(0, 2).join(' · ')].filter(Boolean).join(' · '));
</script>

<template>
  <article class="card d-flex flex-column gap-1">
    <GameCover :src="game.cover" :title="game.title" class="card__cover" />
    <div class="d-flex flex-column min-w-0">
      <h3 class="card__title line-clamp-2">{{ game.title }}</h3>
      <p v-if="meta" class="text-xs text-subtle truncate">{{ meta }}</p>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.card {
  &__cover {
    box-shadow: var(--shadow);
  }

  &__title {
    font-family: $font-sans;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: 0;

    @include up(sm) {
      font-size: 14px;
    }
  }
}
</style>
