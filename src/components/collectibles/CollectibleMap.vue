<script setup>
import { computed } from 'vue';
import { Check, Maximize2 } from 'lucide-vue-next';
import { collectibleTag, pinLabel } from '@/utils/collectibles';
import { normalizeUrl } from '@/utils/url';
import { useLightbox } from '@/composables/useLightbox';

// Mapa da região na leitura (como os mapas do IGN): a imagem com um ponto por coletável marcado no editor.
// Ponto = inicial do tipo + número ("A3"); verde quando coletado. Tocar no ponto → vai ao cartão (`go`);
// o botão de ampliar abre o mapa em tela cheia.
const props = defineProps({
  src: { type: String, required: true },
  items: { type: Array, default: () => [] }, // coletáveis da região (com n), só os com pin aparecem
  isDone: { type: Function, default: () => false },
  title: { type: String, default: 'Mapa' },
});
defineEmits(['go']);

const url = computed(() => normalizeUrl(props.src));
const pins = computed(() => props.items.filter((it) => it.pin));
const lightbox = useLightbox();
</script>

<template>
  <figure v-if="url" class="cmap radius-2">
    <img :src="url" :alt="title" class="cmap__img" loading="lazy" decoding="async" />
    <button
      v-for="it in pins"
      :key="it.id"
      type="button"
      class="cmap__pin d-flex align-center justify-center radius-full text-xs fw-700"
      :class="{ 'is-done': isDone(it.id) }"
      :style="{ left: `${it.pin.x}%`, top: `${it.pin.y}%` }"
      :aria-label="`${[collectibleTag(it), it.name].filter(Boolean).join(': ')}${isDone(it.id) ? ' (coletado)' : ''}`"
      :title="[collectibleTag(it), it.name].filter(Boolean).join(': ')"
      @click="$emit('go', it.id)"
    >
      <Check v-if="isDone(it.id)" :size="14" :stroke-width="3" />
      <template v-else>{{ pinLabel(it) }}</template>
    </button>
    <button
      type="button"
      class="cmap__zoom d-flex align-center justify-center radius-full"
      aria-label="Ver o mapa em tela cheia"
      data-tooltip="Tela cheia"
      @click="lightbox.open([{ src: url, alt: title }])"
    >
      <Maximize2 :size="16" />
    </button>
  </figure>
</template>

<style lang="scss" scoped>
.cmap {
  position: relative;
  overflow: hidden;
  background: var(--surface-2);

  &__img {
    display: block;
    width: 100%;
    height: auto;
  }

  &__pin {
    position: absolute;
    min-width: 28px;
    height: 28px;
    padding-inline: $space-half;
    transform: translate(-50%, -50%);
    border: 2px solid #fff;
    background: var(--accent);
    color: #fff;
    box-shadow: 0 2px 8px rgb(0 0 0 / 40%);
    transition: transform 0.15s;

    &:hover,
    &:focus-visible {
      transform: translate(-50%, -50%) scale(1.15);
      z-index: 1;
    }

    &.is-done {
      background: var(--earned);
    }
  }

  &__zoom {
    position: absolute;
    top: space(1);
    right: space(1);
    width: 32px;
    height: 32px;
    background: rgb(0 0 0 / 55%);
    color: #fff;
  }
}
</style>
