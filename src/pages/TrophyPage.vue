<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, CircleCheck, CirclePlay, EyeOff, FileQuestion, ListChecks, Pencil, Share2 } from 'lucide-vue-next';
import PageBar from '@/components/ui/PageBar.vue';
import DetailHero from '@/components/ui/DetailHero.vue';
import ActionIcon from '@/components/ui/ActionIcon.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import PrevNextNav from '@/components/ui/PrevNextNav.vue';
import VideoModal from '@/components/ui/VideoModal.vue';
import RefText from '@/components/trophies/RefText.vue';
import TrophyCollectibles from '@/components/collectibles/TrophyCollectibles.vue';
import TrophyMetaTags from '@/components/trophies/TrophyMetaTags.vue';
import ButtonStyleToggle from '@/components/trophies/ButtonStyleToggle.vue';
import SectionTrophyGrid from '@/components/sections/SectionTrophyGrid.vue';
import CollectibleDetailModal from '@/components/collectibles/CollectibleDetailModal.vue';
import { useGuideReader } from '@/composables/guide/useGuideReader';
import { provideTrophyContext } from '@/composables/guide/useTrophyContext';
import { useToast } from '@/composables/useToast';
import { RARITY_LABELS, TROPHY_FLAGS, TROPHY_TYPE_MAP } from '@/config/trophies';
import { APP_NAME } from '@/config/app';
import { hasRichContent } from '@/utils/html';
import { formatEarnedAtFull, formatRate } from '@/utils/trophies';
import { trophyPageRoute } from '@/utils/trophyRef';
import { trophyCitations } from '@/utils/citations';
import { parseYoutube } from '@/utils/url';
import { absoluteUrl, copyText } from '@/utils/share';

// Página do troféu (/guia/:id/trofeu/:trophyId), como a do TrueAchievements: o troféu em destaque
// (ícone, nome, descrição, tipo, raridade e se você tem), o "Como conseguir" do guia, os detalhes,
// onde ele aparece no guia (seções e páginas), quem cita ele nas dicas e anterior/próximo.
// Tocar num troféu na leitura do guia (texto, cartões, lista) abre esta página.
const route = useRoute();
const router = useRouter();
const toast = useToast();
const guideId = computed(() => String(route.params.id ?? ''));
const trophyId = computed(() => Number(route.params.trophyId));

const {
  guide, loading, error, game, canEdit, title: guideTitle, getNote, backlinks, list, progress, listLoading, listError, openCollectible,
  checked, toggleChecked, isEarned,
} = useGuideReader(guideId);
// Checklist de quem lê: marcado à mão (conquistado na PSN já conta)
const isChecked = computed(() => checked.value.has(trophyId.value));

const trophies = computed(() => list.value?.trophies ?? []);
const index = computed(() => trophies.value.findIndex((t) => t.id === trophyId.value));
const trophy = computed(() => trophies.value[index.value] ?? null);
const note = computed(() => getNote(trophyId.value));
const stats = computed(() => progress.value?.trophies?.[trophyId.value] ?? null);
const type = computed(() => TROPHY_TYPE_MAP[trophy.value?.type] ?? TROPHY_TYPE_MAP.bronze);
const flags = computed(() => TROPHY_FLAGS.filter((f) => note.value[f.id]));
const group = computed(() => {
  const g = list.value?.groups?.find((x) => x.id === trophy.value?.groupId);
  return g && g.id !== 'default' ? g.name : '';
});

// Troféus citados no texto (chips e cartões) abrem a página deles
const pageOf = (id) => trophyPageRoute(guideId.value, id);
provideTrophyContext({ trophies, progress, goTo: (id) => router.push(pageOf(id)) });

const hasTip = computed(() => hasRichContent(note.value.tip));
const hasKeys = computed(() => !!note.value.tip?.includes('btn-key'));
const citations = computed(() => (guide.value && trophy.value ? trophyCitations(guide.value, trophyId.value) : []));
const citedBy = computed(() => {
  const byId = new Map(trophies.value.map((t) => [t.id, t]));
  return (backlinks.value.get(trophyId.value) ?? []).map((id) => byId.get(id)).filter(Boolean);
});

const meta = computed(() => [
  group.value ? `DLC: ${group.value}` : '',
  stats.value?.rate != null ? `${formatRate(stats.value.rate)} dos jogadores` : '',
  index.value >= 0 ? `Troféu ${index.value + 1} de ${trophies.value.length}` : '',
]);
const nameEn = computed(() => {
  const en = trophy.value?.nameEn?.trim();
  return en && en.toLowerCase() !== trophy.value?.name?.trim().toLowerCase() ? en : '';
});

// Vídeo: YouTube toca aqui; outros links abrem fora
const videoOpen = ref(false);
const isYoutube = computed(() => !!parseYoutube(note.value.video));

const listRoute = computed(() => ({ name: 'guide-view', params: { id: guideId.value }, query: { aba: 'trofeus', trofeu: String(trophyId.value) } }));
const editRoute = computed(() => ({ name: 'guide-edit', params: { id: guideId.value }, query: { aba: 'trofeus' } }));
const sideOf = (t, i) => t && { name: t.name || 'Troféu oculto', to: pageOf(t.id), i };
const prev = computed(() => sideOf(trophies.value[index.value - 1]));
const next = computed(() => sideOf(trophies.value[index.value + 1]));

watch([trophy, guideTitle], ([t, g]) => t && (document.title = `${t.name} · ${g} · ${APP_NAME}`), { immediate: true });

// Voltar: de onde veio; aberto direto → troféus do guia, já nele
const back = () => (window.history.state?.back ? router.back() : router.push(listRoute.value));

async function share() {
  const url = absoluteUrl(router, pageOf(trophyId.value));
  const text = `Troféu ${trophy.value?.name} (${guideTitle.value})`;
  if (navigator.share && matchMedia('(pointer: coarse)').matches) return navigator.share({ title: text, url }).catch(() => {});
  const ok = await copyText(url);
  toast.show(ok ? 'Link copiado.' : 'Não foi possível copiar o link.', ok ? 'success' : 'error');
}
</script>

<template>
  <div class="trophy-page">
    <PageBar :title="trophy?.name ?? 'Troféu'" class="trophy-page__bar" @back="back" @share="share" />

    <div v-if="loading || (guide && listLoading && !list)" class="trophy-page__skeleton" aria-busy="true" />

    <div v-else-if="!guide || !trophy" class="container trophy-page__empty">
      <EmptyState
        :icon="FileQuestion"
        title="Troféu não encontrado"
        :text="error || listError || 'O guia não existe, ainda não foi publicado ou não tem este troféu.'"
      >
        <BaseButton v-if="guide" :to="{ name: 'guide-view', params: { id: guideId } }">Voltar ao guia</BaseButton>
        <BaseButton v-else :to="{ name: 'home' }">Ir para o início</BaseButton>
      </EmptyState>
    </div>

    <template v-else>
      <DetailHero
        :title="trophy.name || 'Troféu oculto'"
        :kicker="`Troféu · ${type.label}`"
        :icon="trophy.icon"
        :cover="game?.cover ?? guide.game?.cover"
        :backdrop="game?.backdrop ?? guide.game?.backdrop"
        :meta="meta"
      >
        <template #labels>
          <span v-if="stats?.earned" class="badge badge--success"><Check :size="12" /> Você tem</span>
          <span v-else-if="isChecked" class="badge badge--success"><Check :size="12" /> Feito</span>
          <span v-for="f in flags" :key="f.id" class="badge" :class="`badge--${f.tone}`"><component :is="f.icon" :size="12" /> {{ f.label }}</span>
          <span v-if="trophy.hidden" class="badge"><EyeOff :size="12" /> Oculto</span>
        </template>
        <template #subtitle>
          <RouterLink :to="{ name: 'guide-view', params: { id: guideId } }" class="parent d-inline-flex text-sm fw-600">
            Guia de {{ guideTitle }}
          </RouterLink>
        </template>
        <template #details>
          <p class="detail">{{ trophy.detail }}</p>
          <p v-if="nameEn" class="text-sm text-subtle mt-1" lang="en">{{ nameEn }}</p>
        </template>
        <template #actions>
          <ActionIcon
            v-if="!isEarned(trophyId)"
            :icon="CircleCheck"
            :label="isChecked ? 'Feito' : 'Marcar feito'"
            :active="isChecked"
            @click="toggleChecked(trophyId)"
          />
          <ActionIcon :icon="ListChecks" label="Na lista" :to="listRoute" />
          <ActionIcon v-if="note.video && isYoutube" :icon="CirclePlay" label="Vídeo" @click="videoOpen = true" />
          <ActionIcon v-else-if="note.video" :icon="CirclePlay" label="Vídeo" :href="note.video" />
          <ActionIcon v-if="canEdit" :icon="Pencil" label="Editar" :to="editRoute" />
          <ActionIcon :icon="Share2" label="Compartilhar" @click="share" />
        </template>
      </DetailHero>

      <div class="container trophy-page__content">
        <div class="trophy-page__grid">
          <div class="d-flex flex-column gap-5 min-w-0">
            <!-- Como conseguir -->
            <section class="d-flex flex-column gap-2">
              <h2 class="section-heading">Como conseguir</h2>
              <ButtonStyleToggle v-if="hasKeys" />
              <RefText v-if="hasTip" :html="note.tip" class="tip" @trophy="router.push(pageOf($event))" />
              <p v-else class="text-muted">O guia ainda não tem dica para este troféu.</p>
              <TrophyMetaTags :trophy="trophy" :note="note" :stats="stats" class="mt-1" />
            </section>

            <!-- Coletáveis dos tipos ligados a este troféu ("Artefato" → este) -->
            <TrophyCollectibles :guide-id="guideId" :trophy-id="trophyId" />

            <!-- Onde aparece no guia -->
            <section v-if="citations.length" class="d-flex flex-column gap-2">
              <h2 class="section-heading">Onde aparece no guia <span class="text-subtle fw-500">{{ citations.length }}</span></h2>
              <ul class="d-flex flex-column gap-1">
                <li v-for="c in citations" :key="c.id">
                  <RouterLink
                    :to="{ name: 'guide-view', params: { id: guideId }, query: c.query, hash: c.hash }"
                    class="cite surface radius-2 d-flex align-center justify-between gap-2 p-2"
                  >
                    <span class="d-flex flex-column min-w-0">
                      <span class="text-xs text-muted">{{ [c.tab, c.page].filter(Boolean).join(' · ') }}</span>
                      <span class="fw-600 truncate">{{ c.label }}</span>
                    </span>
                    <span class="text-xs text-subtle shrink-0">{{ c.inText ? 'Citado no texto' : 'Na lista da seção' }}</span>
                  </RouterLink>
                </li>
              </ul>
            </section>

            <!-- Dicas de outros troféus que citam este -->
            <section v-if="citedBy.length" class="d-flex flex-column gap-2">
              <h2 class="section-heading">Citado nas dicas de <span class="text-subtle fw-500">{{ citedBy.length }}</span></h2>
              <SectionTrophyGrid :trophies="citedBy" :progress="progress" @open="router.push(pageOf($event))" />
            </section>
          </div>

          <!-- Lateral: seu progresso e raridade -->
          <aside class="side surface radius-2 p-2 d-flex flex-column gap-2">
            <p class="kicker">{{ type.label }}</p>
            <div v-if="stats?.rate != null" class="d-flex flex-column gap-1">
              <div class="d-flex justify-between align-baseline gap-1 text-sm">
                <span class="text-muted">Jogadores com o troféu</span>
                <strong>{{ formatRate(stats.rate) }}</strong>
              </div>
              <ProgressBar :value="stats.rate" :max="100" :tone="stats.earned ? 'earned' : undefined" />
              <span v-if="RARITY_LABELS[stats.rarity]" class="text-xs text-subtle">{{ RARITY_LABELS[stats.rarity] }}</span>
            </div>
            <p v-if="stats?.earned" class="d-flex align-center gap-1 text-sm earned">
              <Check :size="16" /> Conquistado em {{ formatEarnedAtFull(stats.earnedAt) }}
            </p>
            <p v-else-if="stats" class="text-sm text-muted">Você ainda não tem este troféu.</p>
            <p v-else class="text-sm text-muted">Raridade e progresso aparecem para quem tem o jogo vinculado.</p>
          </aside>
        </div>

        <PrevNextNav :prev="prev" :next="next" label="Troféu anterior e próximo" masc class="mt-5" />
      </div>

      <VideoModal v-if="videoOpen" v-model="videoOpen" :url="note.video" :title="trophy.name || 'Vídeo'" />
      <CollectibleDetailModal v-model="openCollectible" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.trophy-page {
  margin-top: calc(-1 * var(--nav-space)); // sobe por baixo da navegação (o fundo do topo aparece atrás)
  padding-bottom: space(8);

  &__bar {
    margin-top: calc(var(--nav-space) + var(--pbar-gap));
    margin-bottom: calc(-1 * (var(--pbar-height) + var(--nav-space) + var(--pbar-gap)));
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

.parent {
  margin-bottom: space(1);
  color: var(--accent);

  &:hover {
    text-decoration: underline;
  }
}

.detail {
  max-width: 640px;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.5;
}

.tip {
  font-size: 15px;
  line-height: 1.7;
}

.cite {
  transition: background 0.15s;

  &:hover {
    background: var(--surface-hover);
  }
}

.side {
  @include up(md) {
    position: sticky;
    top: calc(var(--nav-offset) + 96px);
  }
}

.earned {
  color: var(--earned);
}

@keyframes pulse {
  50% {
    opacity: 0.6;
  }
}
</style>
