<script setup>
import { computed } from 'vue';
import { ArrowLeftRight } from 'lucide-vue-next';
import GameCover from '@/components/ui/GameCover.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

// Jogo do guia em edição. Sem `game` + loading → esqueleto
const props = defineProps({
  game: { type: Object, default: null },
  loading: Boolean,
});
defineEmits(['change']);

const meta = computed(() =>
  props.game ? [props.game.year, props.game.platforms.slice(0, 4).join(' · ')].filter(Boolean).join(' · ') : '',
);
</script>

<template>
  <div class="selected surface radius-2 d-flex align-center gap-2 p-2">
    <template v-if="game">
      <GameCover :src="game.cover" :title="game.title" size="sm" eager class="selected__cover shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-xs text-subtle fw-600">Jogo</p>
        <h2 class="selected__title line-clamp-2">{{ game.title }}</h2>
        <p v-if="meta" class="text-sm text-muted truncate">{{ meta }}</p>
      </div>
      <BaseButton :icon="ArrowLeftRight" size="sm" variant="ghost" class="shrink-0" @click="$emit('change')">
        Trocar
      </BaseButton>
    </template>

    <template v-else-if="loading">
      <div class="selected__cover skeleton radius-1 shrink-0" />
      <div class="flex-1 d-flex flex-column gap-1">
        <div class="skeleton skeleton--line radius-1" />
        <div class="skeleton skeleton--line skeleton--short radius-1" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.selected {
  &__cover {
    width: 56px;
    aspect-ratio: 3 / 4;

    @include up(md) {
      width: 64px;
    }
  }

  &__title {
    font-size: 19px;
  }
}

.skeleton {
  background: var(--surface-2);
  animation: pulse 1.4s ease-in-out infinite;

  &--line {
    height: 16px;
  }

  &--short {
    width: 50%;
  }
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
