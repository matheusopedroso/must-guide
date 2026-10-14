<script setup>
import GameCover from '@/components/ui/GameCover.vue';
import GuideMeta from './GuideMeta.vue';
import { GUIDE_STATUS } from '@/config/status';
import { plural } from '@/utils/format';

defineProps({
  guide: { type: Object, required: true },
  showGame: { type: Boolean, default: true },
});
</script>

<template>
  <RouterLink :to="{ name: 'guide', params: { id: guide.id } }" class="guide-card surface radius-2 d-flex gap-2 p-2">
    <GameCover
      v-if="showGame"
      :cover-id="guide.game?.coverId"
      :title="guide.game?.title"
      size="cover_small"
      class="guide-card__cover shrink-0"
    />
    <div class="d-flex flex-column gap-1 flex-1 min-w-0">
      <p v-if="showGame" class="text-xs text-muted truncate">{{ guide.game?.title }}</p>
      <h3 class="guide-card__title line-clamp-2">{{ guide.title }}</h3>
      <div class="d-flex align-center flex-wrap gap-1 mt-auto">
        <span v-if="guide.status === 'draft'" class="tag text-accent">{{ GUIDE_STATUS.draft }}</span>
        <span class="text-xs text-subtle">{{ plural(guide.stepCount ?? 0, 'passo', 'passos') }}</span>
      </div>
      <GuideMeta :guide="guide" class="d-none d-md-flex" />
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.guide-card {
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: var(--border-strong);
  }

  &__cover {
    width: 64px;
  }

  &__title {
    font-size: 16px;
  }
}
</style>
