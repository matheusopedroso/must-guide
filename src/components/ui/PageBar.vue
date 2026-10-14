<script setup>
import { ArrowLeft, Share2 } from 'lucide-vue-next';
import { useScrolledPast } from '@/composables/useScrolledPast';

// Barra flutuante das páginas de detalhe (igual à BarraFlutuante do Must Watch):
// voltar · título · ações (slot) · compartilhar. Gruda logo abaixo da navegação.
// Celular, no topo da página: só os botões redondos sobre a imagem (sem fundo nem título);
// a barra completa entra depois de rolar um pouco.
defineProps({
  title: { type: String, default: '' },
  share: { type: Boolean, default: true },
});
defineEmits(['back', 'share']);

const scrolled = useScrolledPast(140);
</script>

<template>
  <header class="pbar d-grid align-center gap-1" :class="{ 'is-top': !scrolled }">
    <button type="button" class="pbar__btn d-flex align-center justify-center" aria-label="Voltar" @click="$emit('back')">
      <ArrowLeft :size="18" :stroke-width="1.9" />
    </button>
    <p class="pbar__title truncate fw-600" :title="title">{{ title }}</p>
    <div class="d-flex align-center gap-1">
      <slot name="actions" />
      <button
        v-if="share"
        type="button"
        class="pbar__btn d-flex align-center justify-center tooltip-left"
        aria-label="Compartilhar"
        data-tooltip="Compartilhar"
        @click="$emit('share')"
      >
        <Share2 :size="18" :stroke-width="1.9" />
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.pbar {
  // Medidas do Must Watch (BarraFlutuante): 58px (54 no celular), padding 8, canto 18, botões 42 (38)
  position: sticky;
  top: calc(var(--nav-offset) + var(--pbar-gap));
  z-index: 40;
  grid-template-columns: auto minmax(0, 1fr) auto;
  width: calc(100% - #{space(2)});
  height: var(--pbar-height);
  margin: 0 auto;
  padding: space(1);
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--nav-glass);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  box-shadow: var(--nav-shadow);
  transition-duration: 0.22s;
  transition-timing-function: $ease;

  @include up(sm) {
    width: min(#{$container-header}, calc(100% - 24px));
  }

  transition-property: top, background, border-color, box-shadow;

  // Celular no topo: botões redondos sobre a imagem, sem a barra
  @include down(md) {
    &.is-top {
      border-color: transparent;
      background: transparent;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;

      .pbar__title {
        opacity: 0;
      }

      .pbar__btn {
        border-radius: $r-full;
        background: rgba(10, 8, 5, 0.56);
        color: #fff;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
    }
  }

  &__btn {
    width: 38px;
    height: 38px;
    border-radius: $r2;
    background: color-mix(in srgb, var(--text) 5%, transparent);
    color: var(--text);

    @include up(sm) {
      width: 42px;
      height: 42px;
    }

    transition: background 0.15s, color 0.15s, border-radius 0.2s;

    &:hover {
      background: color-mix(in srgb, var(--text) 10%, transparent);
    }
  }

  &__title {
    font-size: 13px;
    letter-spacing: 0.05em;
    transition: opacity 0.2s;
  }
}
</style>
