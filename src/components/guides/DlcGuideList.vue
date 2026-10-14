<script setup>
import { ChevronRight } from 'lucide-vue-next';
import DifficultyBadge from '@/components/guide-editor/DifficultyBadge.vue';
import { GUIDE_STATUS } from '@/utils/guideDraft';

// Guias das DLCs na leitura do jogo (como os "Related guides" do PSNProfiles)
defineProps({ items: { type: Array, required: true } }); // summarizeGuide()
</script>

<template>
  <section class="d-flex flex-column gap-2">
    <h2 class="section-heading">DLCs <span class="text-subtle fw-500">{{ items.length }}</span></h2>
    <div class="dlcs">
      <RouterLink
        v-for="d in items"
        :key="d.guideId"
        :to="{ name: 'guide-view', params: { id: d.guideId } }"
        class="dlc surface radius-2 d-flex align-center gap-2 p-2"
      >
        <img v-if="d.dlcIcon" :src="d.dlcIcon" alt="" class="dlc__icon radius-1 shrink-0" loading="lazy" />
        <div v-else class="dlc__icon radius-1 shrink-0" />
        <div class="flex-1 min-w-0 d-flex flex-column gap-1">
          <span class="dlc__name fw-600 truncate">{{ d.title }}</span>
          <span class="d-flex align-center flex-wrap gap-1 text-xs text-muted">
            <span v-if="d.status !== 'published'" class="badge">{{ GUIDE_STATUS[d.status].label }}</span>
            <DifficultyBadge v-if="d.difficulty" :value="d.difficulty" />
            <span>Guia de DLC</span>
          </span>
        </div>
        <ChevronRight :size="18" class="text-subtle shrink-0" />
      </RouterLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.dlcs {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: space(1);

  @include up(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.dlc {
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
}
</style>
