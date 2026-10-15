<script setup>
import { computed } from 'vue';
import GameCover from '@/components/ui/GameCover.vue';
import { backdropSrc, coverSrc } from '@/utils/cover';

// Topo das páginas de detalhe (igual ao hero do título no Must Watch): fundo da capa desfocado,
// capa à esquerda e, à direita, selos, título, meta e ações. Usado na página do jogo e na leitura do guia.
// Celular (igual ao Must Watch): sem capa, imagem nítida na largura da tela no alto, degradê e texto centralizado.
// Slots: #labels (selos ao lado do kicker) · #subtitle (logo abaixo do título) · #details (abaixo da meta)
//        #actions (ações em círculo) · #extra (abaixo das ações, ex.: progresso)
const props = defineProps({
  title: { type: String, required: true },
  kicker: { type: String, default: '' }, // "Guia de troféus", "Jogo"…
  cover: { type: String, default: null }, // capa do jogo (também vira o fundo, se não houver backdrop)
  backdrop: { type: String, default: null }, // imagem horizontal (artwork) para o fundo
  icon: { type: String, default: null }, // imagem quadrada no lugar da capa (ex.: ícone da DLC)
  meta: { type: Array, default: () => [] }, // textos da linha de meta (ano, plataformas…)
});

// Fundo: desfocado no desktop (640px basta) · nítido no celular (1280px, a tela tem 2–3× de densidade)
const backdrop = computed(() => {
  const [url, src] = props.backdrop ? [props.backdrop, backdropSrc] : [props.cover, coverSrc];
  return url ? { '--backdrop': `url("${src(url, 'lg')}")`, '--backdrop-sharp': `url("${src(url, 'xl')}")` } : null;
});
const metaItems = computed(() => props.meta.filter(Boolean));
</script>

<template>
  <section class="hero" :style="backdrop">
    <!-- Fundo recortado à parte: o hero não corta o que sai dele (ex.: menu da ação Biblioteca) -->
    <div class="hero__bg" aria-hidden="true">
      <div class="hero__backdrop" />
      <div class="hero__overlay" />
    </div>

    <div class="hero__inner">
      <img v-if="icon" :src="icon" :alt="title" class="hero__poster hero__poster--icon" />
      <GameCover v-else :src="cover" :title="title" size="lg" eager class="hero__poster" />

      <div class="hero__info">
        <div v-if="kicker || $slots.labels" class="d-flex flex-wrap align-center gap-1 hero__labels">
          <span v-if="kicker" class="hero__kicker">{{ kicker }}</span>
          <slot name="labels" />
        </div>
        <h1 class="hero__title">{{ title }}</h1>
        <slot name="subtitle" />
        <div v-if="metaItems.length" class="hero__meta d-flex flex-wrap align-center">
          <span v-for="m in metaItems" :key="m">{{ m }}</span>
        </div>
        <div v-if="$slots.details" class="hero__details">
          <slot name="details" />
        </div>
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
  // Fica atrás da navegação e da PageBar (a página sobe por baixo delas)
  padding: calc(var(--nav-space) + var(--pbar-gap) + var(--pbar-height) + #{space(4)}) space(2) space(5);

  &__bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
  }

  &__backdrop,
  &__overlay {
    position: absolute;
    inset: 0;
  }

  &__backdrop {
    background: var(--backdrop, none) center 26% / cover no-repeat;
    filter: blur(2px) saturate(0.9);
    transform: scale(1.04);
    opacity: 0.4;
  }

  &__overlay {
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

  &__poster--icon {
    @include up(md) {
      aspect-ratio: 1;
      object-fit: cover;
      align-self: center;
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

  &__details {
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
    &__details,
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
