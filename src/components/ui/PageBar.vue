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
      <ArrowLeft :size="18" />
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
        <Share2 :size="18" />
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.pbar {
  --pbar-height: 48px;
  position: sticky;
  top: calc(var(--nav-offset) + #{space(1)});
  z-index: 40;
  grid-template-columns: auto minmax(0, 1fr) auto;
  width: min(#{$container-header}, calc(100% - #{space(2)}));
  height: var(--pbar-height);
  margin: 0 auto;
  padding: $space-half;
  border: 1px solid var(--border);
  border-radius: $r2;
  background: var(--nav-glass);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  box-shadow: var(--nav-shadow);
  transition-duration: 0.22s;
  transition-timing-function: $ease;

  @include up(md) {
    width: min(#{$container-header}, calc(100% - #{space(4)}));
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
        background: rgba(20, 20, 19, 0.45);
        color: #fff;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
    }
  }

  &__btn {
    width: 40px;
    height: 40px;
    border-radius: $r1;
    color: var(--text-muted);
    transition: background 0.15s, color 0.15s, border-radius 0.2s;

    &:hover {
      background: var(--surface-hover);
      color: var(--text);
    }
  }

  &__title {
    font-size: 14px;
    transition: opacity 0.2s;
  }
}
</style>
