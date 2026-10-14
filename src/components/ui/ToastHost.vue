<script setup>
import { CircleAlert, CircleCheck, Info, X } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

const { toasts, dismiss } = useToast();
const ICONS = { info: Info, success: CircleCheck, error: CircleAlert };
</script>

<template>
  <div class="toasts d-flex flex-column gap-1" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast surface radius-2 d-flex align-start gap-1 p-2 text-sm"
        :class="`toast--${t.tone}`"
        role="status"
      >
        <component :is="ICONS[t.tone]" :size="18" class="toast__icon shrink-0" />
        <span class="flex-1">{{ t.text }}</span>
        <button v-if="t.action" type="button" class="toast__action fw-600 shrink-0" @click="t.action.run(), dismiss(t.id)">
          {{ t.action.label }}
        </button>
        <button type="button" class="toast__close shrink-0" aria-label="Fechar aviso" @click="dismiss(t.id)">
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.toasts {
  position: fixed;
  left: space(2);
  right: space(2);
  bottom: calc(var(--tabbar-space) + #{space(2)}); // acima da barra de baixo no celular
  z-index: 200;
  pointer-events: none;

  @include up(md) {
    left: auto;
    width: 360px;
  }
}

.toast {
  pointer-events: auto;
  box-shadow: var(--shadow);

  &__icon {
    margin-top: 1px;
    color: var(--info);
  }

  &--success &__icon {
    color: var(--success);
  }

  &--error &__icon {
    color: var(--danger);
  }

  &__action {
    color: var(--accent);

    &:hover {
      text-decoration: underline;
    }
  }

  &__close {
    color: var(--text-subtle);

    &:hover {
      color: var(--text);
    }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s $ease, transform 0.2s $ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
