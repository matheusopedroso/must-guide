<script setup>
import { ChevronRight } from 'lucide-vue-next';
import GameCover from '@/components/ui/GameCover.vue';
import DifficultyBadge from '@/components/guide-editor/DifficultyBadge.vue';
import { GUIDE_STATUS } from '@/utils/guideDraft';

// Lista de guias que levam à leitura (como os "Related guides" do PSNProfiles): DLCs no guia do jogo,
// guia do jogo + DLCs na página do jogo. DLC mostra o ícone dela; guia do jogo, a capa.
defineProps({
  items: { type: Array, required: true }, // summarizeGuide()
  title: { type: String, default: '' },
});
</script>

<template>
  <section class="d-flex flex-column gap-2">
    <h2 v-if="title" class="section-heading">{{ title }} <span class="text-subtle fw-500">{{ items.length }}</span></h2>
    <div class="links">
      <RouterLink
        v-for="g in items"
        :key="g.guideId"
        :to="{ name: 'guide-view', params: { id: g.guideId } }"
        class="link surface radius-2 d-flex align-center gap-2 p-2"
      >
        <img v-if="g.dlc && g.dlcIcon" :src="g.dlcIcon" alt="" class="link__icon radius-1 shrink-0" loading="lazy" />
        <div v-else-if="g.dlc" class="link__icon radius-1 shrink-0" />
        <GameCover v-else :src="g.cover" :title="g.title" size="sm" class="link__cover shrink-0" />
        <div class="flex-1 min-w-0 d-flex flex-column gap-1">
          <span class="fw-600 truncate">{{ g.title }}</span>
          <span class="d-flex align-center flex-wrap gap-1 text-xs text-muted">
            <span v-if="g.status !== 'published'" class="badge">{{ GUIDE_STATUS[g.status].label }}</span>
            <DifficultyBadge v-if="g.difficulty" :value="g.difficulty" />
            <span>{{ g.dlc ? 'Guia de DLC' : 'Guia de troféus' }}</span>
          </span>
        </div>
        <ChevronRight :size="18" class="text-subtle shrink-0" />
      </RouterLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.links {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: space(1);

  @include up(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.link {
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: var(--surface-hover);
  }

  &__icon {
    width: 48px;
    height: 48px;
    object-fit: cover;
    background: var(--surface-2);
  }

  &__cover {
    width: 48px;
  }
}
</style>
