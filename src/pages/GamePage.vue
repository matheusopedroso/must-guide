<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BookOpen, CirclePlay, ExternalLink, FileQuestion, MessageSquareText, Pencil, Plus } from 'lucide-vue-next';
import PageBar from '@/components/ui/PageBar.vue';
import DetailHero from '@/components/ui/DetailHero.vue';
import ActionIcon from '@/components/ui/ActionIcon.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ProviderCredit from '@/components/ui/ProviderCredit.vue';
import VideoModal from '@/components/ui/VideoModal.vue';
import GameGrid from '@/components/games/GameGrid.vue';
import GameCard from '@/components/games/GameCard.vue';
import GameAbout from '@/components/games/GameAbout.vue';
import GuideLinkList from '@/components/guides/GuideLinkList.vue';
import DifficultyBadge from '@/components/guide-editor/DifficultyBadge.vue';
import { useGameDetails } from '@/composables/useGameDetails';
import { useGuide } from '@/composables/guide/useGuide';
import { useDlcGuides } from '@/composables/guide/useDlcGuides';
import { useAuth } from '@/composables/useAuth';
import { GUIDE_STATUS, summarizeGuide } from '@/utils/guideDraft';
import { providerInfo } from '@/config/providers';
import { APP_NAME } from '@/config/app';

// Página do jogo (/jogo/:id), aberta pelos cards do início — com ou sem guia. Mesmo formato da leitura do guia:
// PageBar → hero (capa, título, ano, plataformas, ações) → sobre o jogo + ficha à esquerda e, à direita,
// o cartão do guia (ler / criar). Embaixo, os guias das DLCs e as outras versões do jogo (edições, remasters,
// DLCs — IGDB). Fundo com a arte horizontal do jogo e botão de trailer, quando a API traz.
// Sem guia: quem edita cria daqui.
const route = useRoute();
const router = useRouter();
const gameId = computed(() => String(route.params.id ?? ''));

const { game, loading, error } = useGameDetails(gameId, { full: true }); // full: com os relacionados
const { guide: rawGuide, loading: guideLoading } = useGuide(gameId); // guia do jogo: id do guia = id do jogo
const { items: dlcGuides } = useDlcGuides(gameId);
const { enabled, isAdmin } = useAuth();

const canEdit = computed(() => !enabled || isAdmin.value);
const guide = computed(() => (rawGuide.value ? summarizeGuide(rawGuide.value) : null));
const viewRoute = computed(() => ({ name: 'guide-view', params: { id: gameId.value } }));
const editRoute = computed(() => ({ name: 'guide-edit', params: { id: gameId.value } }));
const source = computed(() => providerInfo(game.value?.provider));
const meta = computed(() => [game.value?.kind, game.value?.year, game.value?.platforms?.join(' · ')]);
const trailerOpen = ref(false);
const related = computed(() => game.value?.related ?? []);

// Tempo para zerar: "História ~20 h · Extras ~35 h · 100% ~60 h" (IGDB) ou "Média ~30 h" (RAWG)
const TTB = [
  ['story', 'História'],
  ['extra', 'Extras'],
  ['complete', '100%'],
  ['average', 'Média'],
];
const timeToBeat = computed(() => {
  const t = game.value?.timeToBeat;
  return t ? TTB.filter(([k]) => t[k]).map(([k, label]) => `${label} ~${t[k]} h`).join(' · ') : '';
});

const facts = computed(() =>
  [
    { label: 'Lançamento', value: game.value?.year },
    { label: 'Tempo para zerar', value: timeToBeat.value },
    { label: 'Plataformas', value: game.value?.platforms?.join(' · ') },
    { label: 'Tipo', value: game.value?.kind },
    { label: 'Nota', value: game.value?.rating && `${game.value.rating}/100` },
  ].filter((f) => f.value),
);

watch(game, (g) => g && (document.title = `${g.title} · ${APP_NAME}`), { immediate: true });

// Voltar: de onde veio; aberto direto → início
const back = () => (window.history.state?.back ? router.back() : router.push({ name: 'home' }));
</script>

<template>
  <div class="game-page">
    <PageBar :title="game?.title ?? 'Jogo'" :share="false" class="game-page__bar" @back="back" />

    <div v-if="loading && !game" class="game-page__skeleton" aria-busy="true" />

    <div v-else-if="!game" class="container game-page__empty">
      <EmptyState :icon="FileQuestion" title="Jogo não encontrado" :text="error || 'Não deu para carregar este jogo.'">
        <BaseButton :to="{ name: 'home' }">Ir para o início</BaseButton>
      </EmptyState>
    </div>

    <template v-else>
      <DetailHero :title="game.title" kicker="Jogo" :cover="game.cover" :backdrop="game.backdrop" :meta="meta">
        <template v-if="guide?.status === 'published'" #labels>
          <span class="badge badge--success"><BookOpen :size="12" /> Tem guia</span>
        </template>
        <template #actions>
          <ActionIcon v-if="guide" :icon="BookOpen" label="Ler guia" :to="viewRoute" />
          <ActionIcon v-if="canEdit" :icon="guide ? Pencil : Plus" :label="guide ? 'Editar guia' : 'Criar guia'" :to="editRoute" />
          <ActionIcon v-if="game.trailer" :icon="CirclePlay" label="Trailer" @click="trailerOpen = true" />
          <ActionIcon v-if="game.sourceUrl && source" :icon="ExternalLink" :label="source.name" :href="game.sourceUrl" />
        </template>
      </DetailHero>

      <div class="container game-page__content d-flex flex-column gap-5">
        <div class="game-page__grid">
          <div class="d-flex flex-column gap-3 min-w-0">
            <GameAbout :game="game" />
            <dl v-if="facts.length" class="facts">
              <div v-for="f in facts" :key="f.label">
                <dt>{{ f.label }}</dt>
                <dd>{{ f.value }}</dd>
              </div>
            </dl>
          </div>

          <!-- Guia do jogo (lugar do "Para platinar" na leitura) -->
          <aside class="guide-card surface radius-2 p-2 d-flex flex-column gap-2">
            <p class="kicker">Guia de troféus</p>
            <p v-if="guideLoading" class="text-sm text-muted">Procurando guia…</p>
            <template v-else-if="guide">
              <div class="d-flex align-center flex-wrap gap-1 text-sm text-muted">
                <span class="badge" :class="`badge--${GUIDE_STATUS[guide.status].tone}`">{{ GUIDE_STATUS[guide.status].label }}</span>
                <DifficultyBadge v-if="guide.difficulty" :value="guide.difficulty" show-label />
                <span class="d-inline-flex align-center gap-1"><MessageSquareText :size="14" /> {{ guide.tips }} dica(s)</span>
              </div>
              <BaseButton :to="viewRoute" :icon="BookOpen" variant="primary" class="w-100">Ler guia</BaseButton>
            </template>
            <template v-else>
              <p class="text-sm text-muted">Ainda não tem guia para este jogo.</p>
              <BaseButton v-if="canEdit" :to="editRoute" :icon="Plus" variant="primary" class="w-100">Criar guia</BaseButton>
            </template>
          </aside>
        </div>

        <GuideLinkList v-if="dlcGuides.length" :items="dlcGuides" title="Guias de DLC" />

        <section v-if="related.length" class="d-flex flex-column gap-2">
          <h2 class="section-heading">Outras versões e relacionados <span class="text-subtle fw-500">{{ related.length }}</span></h2>
          <GameGrid>
            <GameCard v-for="r in related" :key="r.id" :game="r" />
          </GameGrid>
        </section>
        <ProviderCredit v-if="game.provider" :providers="[game.provider]" />
      </div>

      <VideoModal v-if="game.trailer" v-model="trailerOpen" :url="game.trailer" :title="`Trailer: ${game.title}`" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.game-page {
  margin-top: calc(-1 * var(--nav-space)); // sobe por baixo da navegação (o fundo do hero aparece atrás)
  padding-bottom: space(8);

  &__bar {
    margin-top: calc(var(--nav-space) + var(--pbar-gap));
    margin-bottom: calc(-1 * (var(--pbar-height) + var(--nav-space) + var(--pbar-gap))); // fica por cima do hero
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

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: space(3);

    @include up(md) {
      grid-template-columns: minmax(0, 1fr) 300px;
      gap: space(5);
      align-items: start;
    }
  }
}

.guide-card {
  @include up(md) {
    position: sticky;
    top: calc(var(--nav-offset) + 96px); // abaixo da PageBar
  }
}

@keyframes pulse {
  50% {
    opacity: 0.6;
  }
}
</style>
