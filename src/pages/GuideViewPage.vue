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
import SectionsView from '@/components/sections/SectionsView.vue';
import PagedSectionsView from '@/components/sections/PagedSectionsView.vue';
import CollectibleDetailModal from '@/components/collectibles/CollectibleDetailModal.vue';
import GuideLinkList from '@/components/guides/GuideLinkList.vue';
import { useDlcGuides } from '@/composables/guide/useDlcGuides';
import { useGuideReader } from '@/composables/guide/useGuideReader';
import { useQueryParam } from '@/composables/useQueryParam';
import { trophyPageRoute } from '@/utils/trophyRef';
import { useToast } from '@/composables/useToast';
import { APP_NAME } from '@/config/app';
import { absoluteUrl, copyText } from '@/utils/share';
import { filledSections } from '@/utils/sections';
import { filledPages } from '@/utils/pages';
import { sectionTabsOf } from '@/config/guideTabs';

// Leitura do guia (/guia/:id), no formato da página de título do Must Watch:
// PageBar (voltar · título · compartilhar) → hero (fundo do jogo, capa, título, visão geral, ações)
// → abas em pílula (Visão geral · Troféus). Rascunho só o admin vê (ou a cópia deste navegador).
const route = useRoute();
const router = useRouter();
const toast = useToast();
// :id = guia do jogo ("rawg-123") ou de uma DLC ("rawg-123~001")
const guideId = computed(() => String(route.params.id ?? ''));

// Guia, jogo, troféus (anotações, versões, lista e progresso) e coletáveis: o mesmo da página do troféu
const {
  gameId, guide, source, loading, error, game, canEdit, isDlc, title: pageTitle,
  getNote, backlinks, versions, active, activeId, list, progress, listLoading, listError, openCollectible,
} = useGuideReader(guideId);
// Guia do jogo: os guias das DLCs (cada DLC é um guia separado)
const { items: dlcGuides } = useDlcGuides(computed(() => (guide.value && !guide.value.dlc ? gameId.value : '')));

// Abas de seções (Guia, Roadmap…): aparecem se estiverem no guia e tiverem alguma seção preenchida
// (Perdíveis/Online também aparecem só com troféus marcados na aba Troféus)
const flaggedBy = (flag) => (flag && list.value ? list.value.trophies.filter((t) => getNote(t.id)[flag]) : []);
const sectionTabs = computed(() =>
  sectionTabsOf(guide.value)
    .map((t) => {
      // Paginada (Guia): páginas com conteúdo; as seções delas contam para a aba aparecer
      const pages = t.sections.paged ? filledPages(guide.value, t.sections.key) : null;
      const filled = pages ? pages.flatMap((p) => p.sections) : filledSections(guide.value, t.sections.key);
      return { ...t, pages, filled, flagged: flaggedBy(t.sections.flag) };
    })
    .filter((t) => t.filled.length || t.flagged.length),
);
const activeSectionTab = computed(() => sectionTabs.value.find((t) => t.id === tab.value) ?? null);

// Abas na URL (?aba=guia|roadmap|trofeus); a Visão geral é a padrão
const tabParam = useQueryParam('aba');
const TABS = computed(() => [
  { id: 'geral', label: 'Visão geral' },
  ...sectionTabs.value.map((t) => ({ id: t.id, label: t.label })),
  { id: 'trofeus', label: 'Troféus', count: list.value?.trophies.length },
]);
const tab = computed({
  get: () => (TABS.value.some((t) => t.id === tabParam.value) ? tabParam.value : 'geral'),
  set: (id) => (tabParam.value = id === 'geral' ? '' : id),
});

// Tocar num troféu (texto, cartões, Visão geral) → página do troféu
const pageOf = (id) => trophyPageRoute(guideId.value, id);
const openTrophy = (id) => router.push(pageOf(id));

// Vindo da página do troféu ("Ver na lista": ?aba=trofeus&trofeu=12): rola até ele na aba Troféus
const trophyParam = useQueryParam('trofeu');
const focus = ref(null);
watch(
  [trophyParam, list],
  ([id, l]) => {
    if (!id || !l) return;
    focus.value = Number(id);
    trophyParam.value = '';
  },
  { immediate: true },
);

const myProgress = computed(() => {
  const p = progress.value;
  if (!p?.total) return null;
  return { ...p, pct: Math.round((p.earned / p.total) * 100) };
});

watch(pageTitle, (t) => guide.value && (document.title = `Guia: ${t} · ${APP_NAME}`));

// Voltar: de onde veio; aberto direto → DLC volta ao guia do jogo, jogo volta a Meus guias
const back = () => {
  if (window.history.state?.back) return router.back();
  router.push(isDlc.value ? { name: 'guide-view', params: { id: gameId.value } } : { name: 'my-guides' });
};

async function share() {
  const url = absoluteUrl(router, { name: 'guide-view', params: { id: guideId.value } });
  const title = `Guia de troféus: ${pageTitle.value}`;
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    return navigator.share({ title, url }).catch(() => {}); // fechar a folha não é erro
  }
  const ok = await copyText(url);
  toast.show(ok ? 'Link copiado.' : 'Não foi possível copiar o link.', ok ? 'success' : 'error');
}
</script>

<template>
  <div class="guide-page">
    <PageBar :title="pageTitle" :share="guide?.status === 'published'" class="guide-page__bar" @back="back" @share="share" />

    <div v-if="loading" class="guide-page__skeleton" aria-busy="true" />

    <div v-else-if="!guide" class="container guide-page__empty">
      <EmptyState :icon="FileQuestion" title="Guia não encontrado" :text="error || 'Ele não existe ou ainda não foi publicado.'">
        <BaseButton :to="{ name: 'home' }">Ir para o início</BaseButton>
      </EmptyState>
    </div>

    <template v-else>
      <GuideHero :guide="guide" :game="game" :source="source">
        <template #actions>
          <ActionIcon v-if="canEdit" :icon="Pencil" label="Editar" :to="{ name: 'guide-edit', params: { id: guideId } }" />
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

        <div v-if="tab === 'geral'" class="d-flex flex-column gap-5">
          <GuideOverview
            :guide="guide"
            :game="game"
            :list="list"
            :get-note="getNote"
            @open-trophy="openTrophy"
            @open-trophies="tab = 'trofeus'"
          />
          <GuideLinkList v-if="dlcGuides.length" :items="dlcGuides" title="DLCs" />
        </div>
        <PagedSectionsView
          v-else-if="activeSectionTab?.pages?.length"
          :key="`p-${activeSectionTab.id}`"
          :pages="activeSectionTab.pages"
          :cfg="activeSectionTab.sections"
          :flagged="activeSectionTab.flagged"
          :list="list"
          :progress="progress"
          @open-trophy="openTrophy"
        />
        <SectionsView
          v-else-if="activeSectionTab"
          :key="activeSectionTab.id"
          :sections="activeSectionTab.filled"
          :cfg="activeSectionTab.sections"
          :flagged="activeSectionTab.flagged"
          :list="list"
          :progress="progress"
          @open-trophy="openTrophy"
        />
        <div v-else class="d-flex flex-column gap-5">
          <GuideTrophiesView
            :versions="versions"
            :active="active"
            :list="list"
            :progress="progress"
            :loading="listLoading"
            :error="listError"
            :get-note="getNote"
            :backlinks="backlinks"
            :focus="focus"
            :page-of="pageOf"
            @select-version="activeId = $event"
            @focused="focus = null"
          />
          <!-- As DLCs têm guia próprio: os troféus delas ficam lá -->
          <GuideLinkList v-if="dlcGuides.length" :items="dlcGuides" title="DLCs" />
        </div>
      </div>

      <CollectibleDetailModal v-model="openCollectible" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.guide-page {
  margin-top: calc(-1 * var(--nav-space)); // sobe por baixo da navegação (o fundo do hero aparece atrás)
  padding-bottom: space(8);

  &__bar {
    margin-top: calc(var(--nav-space) + var(--pbar-gap));
    margin-bottom: calc(-1 * (var(--pbar-height) + var(--nav-space) + var(--pbar-gap))); // não ocupa espaço: fica por cima do hero
  }

  &__skeleton {
    height: 480px;
    background: linear-gradient(180deg, var(--surface-2), var(--bg));
    animation: pulse 1.4s ease-in-out infinite;
  }

  &__empty {
    padding-top: calc(var(--nav-space) + var(--pbar-gap) + var(--pbar-height) + #{space(4)});
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
