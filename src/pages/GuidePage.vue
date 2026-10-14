<script setup>
import { computed, onMounted, ref } from 'vue';
import { BookOpen, Eye, EyeOff, Pencil, RotateCcw } from 'lucide-vue-next';
import BackButton from '@/components/ui/BackButton.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LoadingState from '@/components/ui/LoadingState.vue';
import GameCover from '@/components/ui/GameCover.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import GuideMeta from '@/components/guides/GuideMeta.vue';
import GuideSection from '@/components/guides/GuideSection.vue';
import { useGuidesStore } from '@/stores/guides';
import { useGuideProgress } from '@/composables/useGuideProgress';
import { GUIDE_STATUS } from '@/config/status';
import { formatDate } from '@/utils/format';
import { APP_NAME } from '@/config/app';

const props = defineProps({ id: { type: String, required: true } });

const store = useGuidesStore();
const { done, load: loadProgress, toggle, reset } = useGuideProgress();
const guide = ref(null);
const loading = ref(true);
const hideDone = ref(false);

onMounted(async () => {
  try {
    const [g] = await Promise.all([store.get(props.id), loadProgress(props.id)]);
    guide.value = g;
    if (g) document.title = `${g.game?.title ?? g.title} · ${APP_NAME}`;
  } finally {
    loading.value = false;
  }
});

const total = computed(() => guide.value?.sections.reduce((n, s) => n + s.steps.length, 0) ?? 0);
const doneCount = computed(() => {
  if (!guide.value) return 0;
  return guide.value.sections.reduce((n, s) => n + s.steps.filter((st) => done.value[st.id]).length, 0);
});

function resetAll() {
  if (confirm('Desmarcar todos os passos deste guia?')) reset();
}
</script>

<template>
  <div class="container page">
    <LoadingState v-if="loading" />

    <EmptyState v-else-if="!guide" :icon="BookOpen" title="Guia não encontrado">
      <BaseButton to="/guides">Ver guias</BaseButton>
    </EmptyState>

    <template v-else>
      <BackButton :to="{ name: 'game', params: { id: guide.gameId } }" class="mb-2" />

      <header class="d-flex gap-3 mb-3">
        <GameCover :cover-id="guide.game?.coverId" :title="guide.game?.title" eager class="cover shrink-0" />
        <div class="d-flex flex-column gap-1 min-w-0 flex-1">
          <p class="text-sm text-muted">{{ guide.game?.title }}</p>
          <h1>{{ guide.title }}</h1>
          <div class="d-flex align-center flex-wrap gap-1">
            <span v-if="guide.status === 'draft'" class="tag text-accent">{{ GUIDE_STATUS.draft }}</span>
            <span class="text-xs text-subtle">Atualizado em {{ formatDate(guide.updatedAt) }}</span>
          </div>
          <GuideMeta :guide="guide" class="mt-1" />
        </div>
      </header>

      <p v-if="guide.summary" class="summary pre-line text-muted mb-3">{{ guide.summary }}</p>

      <div class="toolbar surface radius-2 d-flex align-center flex-wrap gap-2 p-2 mb-3">
        <ProgressBar :value="doneCount" :max="total" show-label class="flex-1 progress" />
        <div class="d-flex gap-1">
          <BaseButton
            :icon="hideDone ? Eye : EyeOff"
            size="sm"
            variant="ghost"
            @click="hideDone = !hideDone"
          >
            {{ hideDone ? 'Mostrar feitos' : 'Ocultar feitos' }}
          </BaseButton>
          <BaseButton :icon="RotateCcw" icon-only size="sm" variant="ghost" aria-label="Zerar progresso" @click="resetAll" />
          <BaseButton :to="{ name: 'guide-edit', params: { id } }" :icon="Pencil" size="sm">Editar</BaseButton>
        </div>
      </div>

      <div class="d-flex flex-column gap-2">
        <GuideSection
          v-for="(section, i) in guide.sections"
          :key="section.id"
          :section="section"
          :index="i"
          :done="done"
          :hide-done="hideDone"
          @toggle="toggle"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.cover {
  width: 88px;

  @include up(md) {
    width: 120px;
  }
}

.summary {
  max-width: 720px;
}

.toolbar {
  position: sticky;
  top: $header-height + space(1);
  z-index: 10;
}

.progress {
  min-width: 160px;
}
</style>
