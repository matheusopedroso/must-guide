<script setup>
import { computed } from 'vue';
import { MessageSquareText } from 'lucide-vue-next';
import GameCover from '@/components/ui/GameCover.vue';
import DifficultyBadge from '@/components/guide-editor/DifficultyBadge.vue';
import LibraryBadge from '@/components/library/LibraryBadge.vue';

// Card de guia publicado na grade do início (mesmo formato do card de jogo): capa, nome e, embaixo,
// dificuldade e quantas dicas. DLC mostra "DLC · jogo". Abre a leitura do guia.
const props = defineProps({ guide: { type: Object, required: true } }); // summarizeGuide()
const sub = computed(() => (props.guide.dlc ? `DLC · ${props.guide.gameTitle}` : props.guide.platforms.join(' · ')));
</script>

<template>
  <RouterLink :to="{ name: 'guide-view', params: { id: guide.guideId } }" class="card d-flex flex-column gap-1">
    <div class="card__media relative">
      <GameCover :src="guide.cover" :title="guide.gameTitle || guide.title" class="card__cover" />
      <LibraryBadge v-if="!guide.dlc" :game-id="guide.gameId" />
    </div>
    <div class="d-flex flex-column gap-1 min-w-0">
      <h3 class="card__title line-clamp-2">{{ guide.title }}</h3>
      <p v-if="sub" class="text-xs text-subtle truncate">{{ sub }}</p>
      <p class="d-flex align-center flex-wrap gap-1 text-xs text-muted">
        <DifficultyBadge v-if="guide.difficulty" :value="guide.difficulty" />
        <span class="d-inline-flex align-center gap-1"><MessageSquareText :size="12" /> {{ guide.tips }}</span>
      </p>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.card {
  &__cover {
    box-shadow: var(--shadow);
  }

  // Capa + selo da biblioteca sobem juntos no hover
  &__media {
    transition: transform 0.2s $ease;
  }

  &:hover &__media {
    transform: translateY(-4px);
  }

  &:hover &__title {
    color: var(--accent);
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
