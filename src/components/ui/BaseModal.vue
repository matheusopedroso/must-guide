<script setup>
import { nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { X } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';
import { useModalStack } from '@/composables/useModalStack';

// Janela sobre a página. Celular: folha que sobe de baixo (arrastar para baixo fecha).
// Fecha no X, no Esc, tocando fora ou no "voltar" do celular (só o modal de cima).
// Slots: padrão (conteúdo) e #footer (ações, fixas embaixo).
const open = defineModel({ type: Boolean, default: false });
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  wide: Boolean,
});

const close = () => (open.value = false);
const modal = useModalStack(close, useRouter());
const panel = useTemplateRef('panel');

// Foco: entra no modal ao abrir (com mouse, no 1º campo; no toque, no próprio painel para não
// abrir o teclado) e volta para quem abriu ao fechar.
let lastFocus = null;
function onOpen() {
  modal.push();
  lastFocus = document.activeElement;
  nextTick(() => {
    const el = panel.value;
    if (!el || el.contains(document.activeElement)) return;
    const field = matchMedia('(hover: hover)').matches ? el.querySelector('input, select, textarea') : null;
    (field || el).focus({ preventScroll: true });
  });
}
function onClose() {
  modal.pop();
  if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  lastFocus = null;
}
watch(open, (v) => (v ? onOpen() : onClose()), { immediate: true });
onBeforeUnmount(onClose);

// Tab e Shift+Tab giram dentro do modal de cima
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function trapTab(e) {
  if (!modal.isTop() || !panel.value) return;
  const items = [...panel.value.querySelectorAll(FOCUSABLE)].filter((x) => x.offsetParent !== null);
  if (!items.length) return;
  const [first, last] = [items[0], items[items.length - 1]];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// Arrastar para baixo fecha (celular), só puxando com o conteúdo no topo
const drag = ref(0);
let startY = null;
const body = useTemplateRef('body');
function touchStart(e) {
  startY = body.value?.scrollTop > 0 ? null : e.touches[0].clientY;
}
function touchMove(e) {
  if (startY !== null) drag.value = Math.max(0, e.touches[0].clientY - startY);
}
function touchEnd() {
  if (drag.value > 110) close();
  drag.value = 0;
  startY = null;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal d-flex" @click.self="close">
        <div
          ref="panel"
          class="modal__panel d-flex flex-column"
          :class="{ 'modal__panel--wide': wide, 'is-dragging': drag }"
          :style="drag ? { transform: `translateY(${drag}px)` } : null"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
          @keydown.tab="trapTab"
          @touchstart.passive="touchStart"
          @touchmove.passive="touchMove"
          @touchend="touchEnd"
          @touchcancel="touchEnd"
        >
          <span class="modal__handle d-md-none" aria-hidden="true" />
          <header class="d-flex align-start justify-between gap-2 px-3 pt-2 pb-2 border-bottom">
            <div class="min-w-0 pt-1">
              <h3 class="truncate">{{ title }}</h3>
              <p v-if="description" class="text-sm text-muted mt-1">{{ description }}</p>
            </div>
            <BaseButton :icon="X" icon-only variant="ghost" aria-label="Fechar" class="shrink-0" @click="close" />
          </header>

          <div ref="body" class="modal__body p-3" :class="{ 'has-footer': $slots.footer }">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal__footer d-flex align-center gap-1 px-3 py-2 border-top">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--overlay);
  align-items: flex-end;
  justify-content: center;

  @include up(md) {
    align-items: flex-start;
    padding-top: 10vh;
  }

  &__panel {
    position: relative;
    width: 100%;
    max-height: 92dvh;
    background: var(--bg);
    border-radius: $r2 $r2 0 0;
    box-shadow: var(--shadow);

    &:focus {
      outline: none; // foco programático no diálogo (não é alvo do Tab)
    }

    &.is-dragging {
      transition: none !important;
    }

    @include up(md) {
      max-width: 560px;
      max-height: 80vh;
      border-radius: $r2;
      border: 1px solid var(--border);
    }

    &--wide {
      @include up(md) {
        max-width: 720px;
      }
    }
  }

  // Alça de arrastar (só no celular)
  &__handle {
    position: absolute;
    top: space(1);
    left: 50%;
    width: 40px;
    height: 4px;
    transform: translateX(-50%);
    border-radius: $r-full;
    background: var(--border-strong);
  }

  &__body {
    overflow-y: auto;
    overscroll-behavior: contain;

    &:not(.has-footer) {
      @include safe-bottom(space(3));
    }
  }

  &__footer {
    @include safe-bottom(space(2));
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s $ease;

  .modal__panel {
    transition: transform 0.25s $ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__panel {
    transform: translateY(24px);
  }
}
</style>
