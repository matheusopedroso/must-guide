<script setup>
import { onBeforeUnmount, watch } from 'vue';
import { X } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';

const open = defineModel({ type: Boolean, default: false });
defineProps({
  title: { type: String, default: '' },
  wide: Boolean,
});

const close = () => (open.value = false);
const onKey = (e) => e.key === 'Escape' && close();

// Trava o scroll da página e escuta ESC só enquanto aberto
watch(
  open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : '';
    v ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal d-flex" @click.self="close">
        <div class="modal__panel d-flex flex-column" :class="{ 'modal__panel--wide': wide }" role="dialog" aria-modal="true">
          <header class="d-flex align-center justify-between gap-2 px-3 py-2 border-bottom">
            <h3 class="truncate">{{ title }}</h3>
            <BaseButton :icon="X" icon-only variant="ghost" aria-label="Fechar" @click="close" />
          </header>
          <div class="modal__body p-3">
            <slot />
          </div>
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
    width: 100%;
    max-height: 92dvh;
    background: var(--bg);
    border-radius: $r2 $r2 0 0;
    box-shadow: var(--shadow);

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

  &__body {
    overflow-y: auto;
    @include safe-bottom(space(3));
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
