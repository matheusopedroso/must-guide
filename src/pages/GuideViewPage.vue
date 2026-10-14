<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FileQuestion, Globe, HardDrive, Link as LinkIcon, Pencil } from 'lucide-vue-next';
import BackButton from '@/components/ui/BackButton.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import GameCover from '@/components/ui/GameCover.vue';
import GuideStatsSummary from '@/components/guide-editor/GuideStatsSummary.vue';
import GuideTrophiesView from '@/components/guides/GuideTrophiesView.vue';
import { useGuide } from '@/composables/guide/useGuide';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import { APP_NAME } from '@/config/app';
import { GUIDE_STATUS } from '@/utils/guideDraft';
import { formatDate } from '@/utils/date';
import { absoluteUrl, copyText } from '@/utils/share';

// Leitura do guia (/guia/:id): cabeçalho do jogo, visão geral e troféus com as dicas.
// Rascunho só o admin vê (ou a cópia deste navegador); publicado, qualquer pessoa.
const route = useRoute();
const router = useRouter();
const gameId = computed(() => String(route.params.id ?? ''));
const { guide, source, loading, error } = useGuide(gameId);
const { enabled, isAdmin } = useAuth();
const toast = useToast();

const canEdit = computed(() => !enabled || isAdmin.value || source.value === 'local');
const status = computed(() => GUIDE_STATUS[guide.value?.status] ?? GUIDE_STATUS.draft);
const hasStats = computed(() => Object.values(guide.value?.stats ?? {}).some(Boolean));

watch(guide, (g) => {
  if (g) document.title = `Guia: ${g.game?.title ?? ''} · ${APP_NAME}`;
});

async function share() {
  const ok = await copyText(absoluteUrl(router, { name: 'guide-view', params: { id: gameId.value } }));
  toast.show(ok ? 'Link copiado.' : 'Não foi possível copiar o link.', ok ? 'success' : 'error');
}
</script>

<template>
  <div class="container page">
    <BackButton :to="{ name: 'my-guides' }" class="mb-2" />

    <div v-if="loading" class="hero-skeleton surface radius-2" aria-busy="true" />

    <EmptyState
      v-else-if="!guide"
      :icon="FileQuestion"
      title="Guia não encontrado"
      :text="error || 'Ele não existe ou ainda não foi publicado.'"
    >
      <BaseButton :to="{ name: 'home' }">Ir para o início</BaseButton>
    </EmptyState>

    <template v-else>
      <header class="hero d-flex gap-2 mb-3">
        <GameCover :src="guide.game?.cover" :title="guide.game?.title" eager class="hero__cover shrink-0" />
        <div class="flex-1 min-w-0 d-flex flex-column gap-1">
          <p class="text-xs text-subtle fw-600 hero__kicker">Guia de troféus</p>
          <h1 class="hero__title">{{ guide.game?.title }}</h1>
          <div class="d-flex align-center flex-wrap gap-1">
            <span class="badge" :class="`badge--${status.tone}`">
              <Globe v-if="guide.status === 'published'" :size="12" /> {{ status.label }}
            </span>
            <span v-if="source === 'local'" class="badge"><HardDrive :size="12" /> Cópia deste navegador</span>
            <span v-if="guide.updatedAt" class="text-xs text-muted">Atualizado em {{ formatDate(guide.updatedAt) }}</span>
          </div>
          <GuideStatsSummary v-if="hasStats" :stats="guide.stats" show-label class="mt-1" />
          <div class="d-flex flex-wrap gap-1 mt-1">
            <BaseButton v-if="canEdit" :to="{ name: 'guide-edit', params: { id: gameId } }" :icon="Pencil" size="sm">Editar</BaseButton>
            <BaseButton v-if="guide.status === 'published'" :icon="LinkIcon" size="sm" variant="ghost" @click="share">
              Copiar link
            </BaseButton>
          </div>
        </div>
      </header>

      <p v-if="guide.status !== 'published'" class="notice text-sm radius-1 p-2 mb-2">
        Rascunho: só você está vendo. Publique pelo editor para liberar o link.
      </p>

      <h2 class="section-title mb-2">Troféus</h2>
      <GuideTrophiesView :guide="guide" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  align-items: flex-start;

  &__cover {
    width: 96px;
    aspect-ratio: 3 / 4;
    box-shadow: var(--shadow);

    @include up(md) {
      width: 128px;
    }
  }

  &__kicker {
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__title {
    font-size: clamp(24px, 5vw, 36px);
    line-height: 1.15;
  }
}

.hero-skeleton {
  height: 176px;
  animation: pulse 1.4s ease-in-out infinite;
}

.notice {
  background: var(--surface-2);
  color: var(--text-muted);
}

.section-title {
  font-size: 20px;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
