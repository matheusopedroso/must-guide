<script setup>
import { nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

// Trilho com rolagem lateral: setas (com mouse) quando há conteúdo escondido, bordas esmaecidas,
// rodinha do mouse rola para o lado e arraste no celular. O conteúdo vai no slot.
defineProps({
  label: { type: String, default: '' }, // aria-label do grupo
});

const track = useTemplateRef('track');
const canPrev = ref(false);
const canNext = ref(false);

function update() {
  const el = track.value;
  if (!el) return;
  canPrev.value = el.scrollLeft > 1;
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

const scrollPage = (dir) => track.value?.scrollBy({ left: dir * track.value.clientWidth * 0.8, behavior: 'smooth' });

// Rodinha vertical vira rolagem lateral só enquanto ainda dá para rolar; no fim, a página volta a rolar
function onWheel(e) {
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // touchpad lateral já funciona sozinho
  if ((e.deltaY > 0 && !canNext.value) || (e.deltaY < 0 && !canPrev.value)) return;
  e.preventDefault();
  track.value.scrollLeft += e.deltaY;
}

// Mantém um item visível (ex.: o chip selecionado). selector relativo ao trilho
async function reveal(selector = '.is-active') {
  await nextTick();
  track.value?.querySelector(selector)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}

let observer = null;
onMounted(() => {
  update();
  track.value.addEventListener('wheel', onWheel, { passive: false });
  observer = new ResizeObserver(update); // trilho mudou de largura
  observer.observe(track.value);
});
onUpdated(update); // itens do slot entraram, saíram ou mudaram
onBeforeUnmount(() => {
  observer?.disconnect();
  track.value?.removeEventListener('wheel', onWheel);
});

defineExpose({ reveal, update });
</script>

<template>
  <div class="rail" :class="{ 'can-prev': canPrev, 'can-next': canNext }" role="group" :aria-label="label || undefined">
    <div ref="track" class="rail__track" @scroll.passive="update">
      <slot />
    </div>

    <button v-show="canPrev" type="button" class="rail__arrow rail__arrow--prev" aria-label="Rolar para a esquerda" tabindex="-1" @click="scrollPage(-1)">
      <ChevronLeft :size="18" />
    </button>
    <button v-show="canNext" type="button" class="rail__arrow rail__arrow--next" aria-label="Rolar para a direita" tabindex="-1" @click="scrollPage(1)">
      <ChevronRight :size="18" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
$fade: 48px;

.rail {
  position: relative;
  min-width: 0;

  &__track {
    display: flex;
    gap: space(1);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    > :deep(*) {
      flex-shrink: 0;
    }
  }

  // Bordas esmaecidas só do lado que tem mais conteúdo
  &.can-prev &__track {
    mask-image: linear-gradient(to right, transparent, #000 $fade);
  }

  &.can-next &__track {
    mask-image: linear-gradient(to left, transparent, #000 $fade);
  }

  &.can-prev.can-next &__track {
    mask-image: linear-gradient(to right, transparent, #000 $fade, #000 calc(100% - #{$fade}), transparent);
  }

  &__arrow {
    position: absolute;
    top: 50%;
    z-index: 1;
    display: none;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    box-shadow: var(--shadow);
    transform: translateY(-50%);
    transition: background 0.15s;

    &:hover {
      background: var(--surface-hover);
    }

    &--prev {
      left: 0;
    }

    &--next {
      right: 0;
    }

    // Setas só com mouse; no toque o arraste já resolve
    @media (hover: hover) and (pointer: fine) {
      display: flex;
    }
  }
}
</style>
