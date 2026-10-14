<script setup>
import { computed } from 'vue';
import { Globe, HardDrive } from 'lucide-vue-next';
import GameCover from '@/components/ui/GameCover.vue';
import GuideStatsSummary from '@/components/guide-editor/GuideStatsSummary.vue';
import { coverSrc } from '@/utils/cover';
import { formatDate } from '@/utils/date';

// Topo da leitura do guia (igual ao hero do título no Must Watch): fundo do jogo desfocado,
// capa à esquerda e, à direita, selos, título, meta, visão geral (linha das "notas") e ações (slot).
// #extra: abaixo das ações (ex.: seu progresso).
// Celular (igual ao Must Watch): sem capa, imagem nítida na largura da tela no alto, degradê e texto centralizado.
const props = defineProps({
  guide: { type: Object, required: true },
  game: { type: Object, default: null }, // detalhes do jogo (ano, plataformas), se já carregou
  source: { type: String, default: '' }, // cloud | local
});

const title = computed(() => props.game?.title ?? props.guide.game?.title ?? '');
const cover = computed(() => props.game?.cover ?? props.guide.game?.cover ?? null);
// Fundo: desfocado no desktop (640px basta) · nítido no celular (1280px, a tela tem 2–3× de densidade)
const backdrop = computed(() =>
  cover.value
    ? { '--backdrop': `url("${coverSrc(cover.value, 'lg')}")`, '--backdrop-sharp': `url("${coverSrc(cover.value, 'xl')}")` }
    : null,
);
const platforms = computed(() => [...new Set(props.guide.versions.map((v) => v.platform).filter(Boolean))]);
const meta = computed(() =>
  [props.game?.year, platforms.value.join(' · '), props.guide.updatedAt && `Atualizado em ${formatDate(props.guide.updatedAt)}`].filter(
    Boolean,
  ),
);
const published = computed(() => props.guide.status === 'published');
const hasStats = computed(() => Object.values(props.guide.stats ?? {}).some(Boolean));
</script>

<template>
  <section class="hero" :style="backdrop">
    <div class="hero__backdrop" aria-hidden="true" />
    <div class="hero__overlay" aria-hidden="true" />

    <div class="hero__inner">
      <GameCover :src="cover" :title="title" size="lg" eager class="hero__poster" />

      <div class="hero__info">
        <div class="d-flex flex-wrap align-center gap-1 hero__labels">
          <span class="hero__kicker">Guia de troféus</span>
          <span v-if="published" class="badge badge--success"><Globe :size="12" /> Publicado</span>
          <span v-else class="badge">Rascunho</span>
          <span v-if="source === 'local'" class="badge"><HardDrive :size="12" /> Neste navegador</span>
        </div>
        <h1 class="hero__title">{{ title }}</h1>
        <div v-if="meta.length" class="hero__meta d-flex flex-wrap align-center">
          <span v-for="m in meta" :key="m">{{ m }}</span>
        </div>
        <GuideStatsSummary v-if="hasStats" :stats="guide.stats" show-label class="hero__stats" />
      </div>

      <div class="hero__extra">
        <div v-if="$slots.actions" class="hero__actions d-flex flex-wrap gap-1">
          <slot name="actions" />
        </div>
        <slot name="extra" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  // Fica atrás da navegação e da PageBar (a página sobe por baixo delas)
  padding: calc(var(--nav-space) + 48px + #{space(5)}) space(2) space(5);

  &__backdrop,
  &__overlay {
    position: absolute;
    inset: 0;
    z-index: -2;
  }

  &__backdrop {
    background: var(--backdrop, none) center 26% / cover no-repeat;
    filter: blur(2px) saturate(0.9);
    transform: scale(1.04);
    opacity: 0.4;
  }

  &__overlay {
    z-index: -1;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--bg) 60%, transparent) 0%, color-mix(in srgb, var(--bg) 70%, transparent) 35%, var(--bg) 100%),
      radial-gradient(circle at 50% 15%, var(--accent-soft), transparent 45%);
  }

  &__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: space(2);
    width: min(1040px, 100%);
    margin: 0 auto;

    @include up(md) {
      grid-template-columns: 224px minmax(0, 1fr);
      column-gap: space(4);
      row-gap: space(2);
      align-items: end;
    }
  }

  // Capa ocupa as duas linhas (título + ações), centralizada no bloco
  &__poster {
    display: none;

    @include up(md) {
      display: block;
      grid-row: 1 / span 2;
      align-self: center;
      width: 224px;
      aspect-ratio: 3 / 4;
      border-radius: $r2;
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--border);
    }
  }

  &__kicker {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding-inline: space(1);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: $r-full;
    background: color-mix(in srgb, var(--bg) 40%, transparent);
    color: var(--accent);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  &__title {
    margin: space(2) 0 space(1);
    font-size: clamp(30px, 6vw, 60px);
    line-height: 1;
  }

  &__meta {
    gap: space(1) space(2);
    color: var(--text-muted);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__stats {
    margin-top: space(2);
  }

  &__extra {
    @include up(md) {
      grid-column: 2;
      align-self: start;
    }
  }

  &__actions {
    margin-left: -(space(1)); // compensa o espaço interno das ações (76px)
  }

  // Celular (padrão do Must Watch): imagem nítida no tamanho natural (16:9 na largura da tela),
  // título sobre a parte de baixo dela e degradê até o fundo
  @include down(md) {
    padding: max(104px, 34vw) space(2) space(3);

    &__backdrop {
      background-image: var(--backdrop-sharp, none);
      background-size: 100% auto;
      background-position: center top;
      opacity: 1;
      filter: none;
      transform: none;
    }

    &__overlay {
      background: linear-gradient(
        180deg,
        rgba(20, 20, 19, 0.15) 0%,
        color-mix(in srgb, var(--bg) 35%, transparent) 30vw,
        var(--bg) 56vw
      );
    }

    &__info {
      text-align: center;
    }

    &__labels,
    &__meta,
    &__stats,
    &__actions {
      justify-content: center;
    }

    &__actions {
      margin-left: 0;
    }

    &__title {
      font-size: clamp(26px, 8vw, 34px);
      margin: space(1) 0;
    }
  }
}
</style>
