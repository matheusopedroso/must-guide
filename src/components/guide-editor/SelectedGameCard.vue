<script setup>
import { computed } from 'vue';
import { ArrowLeftRight } from 'lucide-vue-next';
import GameCover from '@/components/ui/GameCover.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

// Jogo do guia em edição. Sem `game` + loading → esqueleto
const props = defineProps({
  game: { type: Object, default: null },
  loading: Boolean,
  changeable: { type: Boolean, default: true }, // guia de DLC: o jogo é fixo
});
defineEmits(['change']);

const meta = computed(() =>
  props.game ? [props.game.year, (props.game.platforms ?? []).slice(0, 4).join(' · ')].filter(Boolean).join(' · ') : '',
);
</script>

<template>
  <div class="selected surface radius-2 d-flex align-center gap-2 px-2 py-1">
    <template v-if="game">
      <GameCover :src="game.cover" :title="game.title" size="sm" eager class="selected__cover shrink-0" />
      <div class="flex-1 min-w-0">
        <h2 class="selected__title truncate">{{ game.title }}</h2>
        <p v-if="meta" class="text-xs text-muted truncate">{{ meta }}</p>
      </div>
      <BaseButton
        v-if="changeable"
        :icon="ArrowLeftRight"
        icon-only
        size="sm"
        variant="ghost"
        class="shrink-0 tooltip-left"
        aria-label="Trocar jogo"
        data-tooltip="Trocar jogo"
        @click="$emit('change')"
      />
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
  // Compacto: capa pequena e título numa linha
  &__cover {
    width: 40px;
    aspect-ratio: 3 / 4;
  }

  &__title {
    font-size: 17px;
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
