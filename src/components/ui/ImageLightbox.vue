<script setup>
import { computed, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-vue-next';
import { useModalStack } from '@/composables/useModalStack';

// Imagens em tela cheia dentro do app (ex.: fotos de um coletável): setas (tela e teclado) passam entre elas,
// Esc / voltar do celular / tocar fora fecham. v-model = índice aberto (null = fechada).
const index = defineModel({ type: Number, default: null });
const props = defineProps({
  images: { type: Array, required: true }, // [{ src, alt }]
});

const open = computed(() => index.value !== null && !!props.images[index.value]);
const current = computed(() => (open.value ? props.images[index.value] : null));
const many = computed(() => props.images.length > 1);

const close = () => (index.value = null);
const go = (dir) => (index.value = (index.value + dir + props.images.length) % props.images.length);

// Mesma pilha dos modais: Esc e o "voltar" do celular fecham, a página não rola por baixo
const stack = useModalStack(close, useRouter());
function onKey(e) {
  if (!stack.isTop()) return;
  if (e.key === 'ArrowRight' && many.value) go(1);
  else if (e.key === 'ArrowLeft' && many.value) go(-1);
}
watch(
  open,
  (v) => {
    if (v) {
      stack.push();
      document.addEventListener('keydown', onKey);
    } else {
      stack.pop();
      document.removeEventListener('keydown', onKey);
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  stack.pop();
  document.removeEventListener('keydown', onKey);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="open" class="lightbox d-flex flex-column" role="dialog" aria-modal="true" :aria-label="current.alt || 'Imagem'" @click.self="close">
        <header class="lightbox__bar d-flex align-center gap-1 p-2">
          <span v-if="many" class="text-sm fw-600">{{ index + 1 }} / {{ images.length }}</span>
          <span class="flex-1 truncate text-sm">{{ current.alt }}</span>
          <a :href="current.src" target="_blank" rel="noopener noreferrer" class="lightbox__btn d-flex align-center justify-center radius-full" aria-label="Abrir original" data-tooltip="Abrir original">
            <ExternalLink :size="18" />
          </a>
          <button type="button" class="lightbox__btn d-flex align-center justify-center radius-full" aria-label="Fechar" @click="close">
            <X :size="20" />
          </button>
        </header>

        <div class="lightbox__stage flex-1 d-flex align-center justify-center px-2 pb-2" @click.self="close">
          <img :key="current.src" :src="current.src" :alt="current.alt" class="lightbox__img radius-1" />
        </div>

        <template v-if="many">
          <button type="button" class="lightbox__btn lightbox__nav is-prev d-flex align-center justify-center radius-full" aria-label="Imagem anterior" @click="go(-1)">
            <ChevronLeft :size="24" />
          </button>
          <button type="button" class="lightbox__btn lightbox__nav is-next d-flex align-center justify-center radius-full" aria-label="Próxima imagem" @click="go(1)">
            <ChevronRight :size="24" />
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgb(0 0 0 / 92%);
  color: #fff;

  &__img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  &__stage {
    min-height: 0;
  }

  &__btn {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    background: rgb(255 255 255 / 12%);
    color: #fff;
    transition: background 0.15s;

    &:hover {
      background: rgb(255 255 255 / 24%);
    }
  }

  &__nav {
    position: absolute;
    top: 50%;
    width: 48px;
    height: 48px;
    transform: translateY(-50%);

    &.is-prev {
      left: space(2);
    }

    &.is-next {
      right: space(2);
    }
  }
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
