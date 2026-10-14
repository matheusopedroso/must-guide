<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { HardDrive, MessageSquareText, Pencil } from 'lucide-vue-next';
import GameCover from '@/components/ui/GameCover.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import DifficultyBadge from '@/components/guide-editor/DifficultyBadge.vue';
import { GUIDE_STATUS } from '@/utils/guideDraft';
import { formatDate, formatDateTime } from '@/utils/date';

// Card de um guia na lista "Meus guias". Tocar abre a leitura; o lápis abre o editor.
const props = defineProps({ guide: { type: Object, required: true } }); // summarizeGuide()

const router = useRouter();
const view = computed(() => ({ name: 'guide-view', params: { id: props.guide.guideId } }));
const edit = computed(() => ({ name: 'guide-edit', params: { id: props.guide.guideId } }));
const status = computed(() => GUIDE_STATUS[props.guide.status]);
</script>

<template>
  <article class="gcard surface radius-2 d-flex align-center gap-2 p-2" @click="router.push(view)">
    <img v-if="guide.dlc && guide.dlcIcon" :src="guide.dlcIcon" alt="" class="gcard__cover gcard__cover--dlc radius-1 shrink-0" loading="lazy" />
    <GameCover v-else :src="guide.cover" :title="guide.title" size="sm" class="gcard__cover shrink-0" />

    <div class="flex-1 min-w-0 d-flex flex-column gap-1">
      <div class="d-flex align-center flex-wrap gap-1">
        <span class="badge" :class="`badge--${status.tone}`">{{ status.label }}</span>
        <span v-if="guide.dlc" class="badge badge--info">DLC · {{ guide.gameTitle }}</span>
        <span v-if="guide.source === 'local'" class="badge" data-tooltip="Ainda não está na nuvem">
          <HardDrive :size="12" /> Só neste navegador
        </span>
      </div>
      <RouterLink :to="view" class="gcard__title truncate" @click.stop>{{ guide.title }}</RouterLink>
      <div class="d-flex align-center flex-wrap gap-1 text-xs text-muted">
        <DifficultyBadge v-if="guide.difficulty" :value="guide.difficulty" />
        <span v-if="guide.platforms.length" class="tag">{{ guide.platforms.join(' · ') }}</span>
        <span class="d-inline-flex align-center gap-1"><MessageSquareText :size="14" /> {{ guide.tips }} dica(s)</span>
        <span v-if="guide.updatedAt" :title="formatDateTime(guide.updatedAt)">· editado em {{ formatDate(guide.updatedAt) }}</span>
      </div>
    </div>

    <BaseButton
      :to="edit"
      :icon="Pencil"
      icon-only
      size="sm"
      variant="ghost"
      class="shrink-0 tooltip-left"
      aria-label="Editar guia"
      data-tooltip="Editar"
      @click.stop
    />
  </article>
</template>

<style lang="scss" scoped>
.gcard {
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: var(--surface-hover);
  }

  &__cover {
    width: 56px;
    aspect-ratio: 3 / 4;

    &--dlc {
      aspect-ratio: 1;
      object-fit: cover;
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 600;

    &:hover {
      color: var(--accent);
    }
  }
}
</style>
