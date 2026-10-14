<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FileQuestion, Pencil, Share2 } from 'lucide-vue-next';
import PageBar from '@/components/ui/PageBar.vue';
import PillTabs from '@/components/ui/PillTabs.vue';
import ActionIcon from '@/components/ui/ActionIcon.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import GuideHero from '@/components/guides/GuideHero.vue';
import GuideOverview from '@/components/guides/GuideOverview.vue';
import GuideTrophiesView from '@/components/guides/GuideTrophiesView.vue';
import { useGuide } from '@/composables/guide/useGuide';
import { useTrophyData } from '@/composables/guide/useTrophyData';
import { useTrophyNotes } from '@/composables/guide/useTrophyNotes';
import { useTrophyVersions } from '@/composables/guide/useTrophyVersions';
import { useGameDetails } from '@/composables/useGameDetails';
import { useQueryParam } from '@/composables/useQueryParam';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import { APP_NAME } from '@/config/app';
import { absoluteUrl, copyText } from '@/utils/share';

// Leitura do guia (/guia/:id), no formato da página de título do Must Watch:
// PageBar (voltar · título · compartilhar) → hero (fundo do jogo, capa, título, visão geral, ações)
// → abas em pílula (Visão geral · Troféus). Rascunho só o admin vê (ou a cópia deste navegador).
const route = useRoute();
const router = useRouter();
const toast = useToast();
const gameId = computed(() => String(route.params.id ?? ''));

const { guide, source, loading, error } = useGuide(gameId);
const { game } = useGameDetails(computed(() => (guide.value ? gameId.value : ''))); // ano, gêneros, resumo
const { enabled, isAdmin } = useAuth();

// Troféus (compartilhados pelas duas abas)
const { getNote, backlinks } = useTrophyNotes(guide);
const { versions, active, activeId } = useTrophyVersions(guide);
const withProgress = computed(() => !enabled || isAdmin.value); // progresso da conta: só o admin
const { list, progress, loading: listLoading, error: listError } = useTrophyData(active, { withProgress });

const canEdit = computed(() => !enabled || isAdmin.value || source.value === 'local');

// Abas na URL (?aba=trofeus); a Visão geral é a padrão
const tabParam = useQueryParam('aba');
const TABS = computed(() => [
  { id: 'geral', label: 'Visão geral' },
  { id: 'trofeus', label: 'Troféus', count: list.value?.trophies.length },
]);
const tab = computed({
  get: () => (tabParam.value === 'trofeus' ? 'trofeus' : 'geral'),
  set: (id) => (tabParam.value = id === 'geral' ? '' : id),
});

// Visão geral → troféu: abre a aba e rola até ele
const focus = ref(null);
function openTrophy(id) {
  tab.value = 'trofeus';
  focus.value = id;
}

const myProgress = computed(() => {
  const p = progress.value;
  if (!p?.total) return null;
  return { ...p, pct: Math.round((p.earned / p.total) * 100) };
});

watch(guide, (g) => {
  if (g) document.title = `Guia: ${g.game?.title ?? ''} · ${APP_NAME}`;
});

const back = () => (window.history.state?.back ? router.back() : router.push({ name: 'my-guides' }));

async function share() {
  const url = absoluteUrl(router, { name: 'guide-view', params: { id: gameId.value } });
  const title = `Guia de troféus: ${guide.value?.game?.title ?? ''}`;
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    return navigator.share({ title, url }).catch(() => {}); // fechar a folha não é erro
  }
  const ok = await copyText(url);
  toast.show(ok ? 'Link copiado.' : 'Não foi possível copiar o link.', ok ? 'success' : 'error');
}
</script>

<template>
  <div class="guide-page">
    <PageBar :title="guide?.game?.title ?? 'Guia'" :share="guide?.status === 'published'" class="guide-page__bar" @back="back" @share="share" />

    <div v-if="loading" class="guide-page__skeleton" aria-busy="true" />

    <div v-else-if="!guide" class="container guide-page__empty">
      <EmptyState :icon="FileQuestion" title="Guia não encontrado" :text="error || 'Ele não existe ou ainda não foi publicado.'">
        <BaseButton :to="{ name: 'home' }">Ir para o início</BaseButton>
      </EmptyState>
    </div>

    <template v-else>
      <GuideHero :guide="guide" :game="game" :source="source">
        <template #actions>
          <ActionIcon v-if="canEdit" :icon="Pencil" label="Editar" :to="{ name: 'guide-edit', params: { id: gameId } }" />
          <ActionIcon :icon="Share2" label="Compartilhar" @click="share" />
        </template>
        <template #extra>
          <div v-if="myProgress" class="progress mt-2">
            <div class="d-flex justify-between align-baseline gap-2 text-sm text-muted mb-1">
              <span>Você: {{ myProgress.earned }} de {{ myProgress.total }} troféus</span>
              <strong class="progress__pct">{{ myProgress.pct === 100 ? 'Platinado ✓' : `${myProgress.pct}%` }}</strong>
            </div>
            <ProgressBar :value="myProgress.earned" :max="myProgress.total" tone="earned" />
          </div>
          <p v-if="guide.status !== 'published'" class="text-xs text-muted mt-2">
            Rascunho: só você está vendo. Publique pelo editor para liberar o link.
          </p>
        </template>
      </GuideHero>

      <div class="container guide-page__content">
        <PillTabs v-model="tab" :tabs="TABS" label="Seções do guia" />

        <GuideOverview
          v-if="tab === 'geral'"
          :guide="guide"
          :game="game"
          :list="list"
          :get-note="getNote"
          @open-trophy="openTrophy"
          @open-trophies="tab = 'trofeus'"
        />
        <GuideTrophiesView
          v-else
          :versions="versions"
          :active="active"
          :list="list"
          :progress="progress"
          :loading="listLoading"
          :error="listError"
          :get-note="getNote"
          :backlinks="backlinks"
          :focus="focus"
          @select-version="activeId = $event"
          @focused="focus = null"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.guide-page {
  margin-top: calc(-1 * var(--nav-space)); // sobe por baixo da navegação (o fundo do hero aparece atrás)
  padding-bottom: space(8);

  &__bar {
    margin-top: calc(var(--nav-space) + #{space(1)});
    margin-bottom: calc(-48px - var(--nav-space) - #{space(1)}); // não ocupa espaço: fica por cima do hero
  }

  &__skeleton {
    height: 480px;
    background: linear-gradient(180deg, var(--surface-2), var(--bg));
    animation: pulse 1.4s ease-in-out infinite;
  }

  &__empty {
    padding-top: calc(var(--nav-space) + 48px + #{space(5)});
  }

  &__content {
    max-width: calc(1040px + #{space(6)});
  }
}

.progress {
  max-width: 420px;

  &__pct {
    color: var(--earned);
  }

}

@keyframes pulse {
  50% {
    opacity: 0.6;
  }
}
</style>
