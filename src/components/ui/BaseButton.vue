<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { LoaderCircle } from 'lucide-vue-next';

const props = defineProps({
  variant: { type: String, default: 'secondary' }, // primary | secondary | ghost | danger
  size: { type: String, default: 'md' }, // sm | md
  icon: { type: [Object, Function], default: null },
  iconOnly: Boolean,
  loading: Boolean,
  disabled: Boolean,
  to: { type: [String, Object], default: null },
  href: { type: String, default: null }, // link externo (abre em nova aba)
  type: { type: String, default: 'button' },
});

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'));
const isButton = computed(() => !props.to && !props.href);
const iconSize = computed(() => (props.size === 'sm' ? 16 : 18));
// Só os atributos do tipo certo: um href "undefined" sobrescrevia o href que o RouterLink monta
// (o link funcionava no clique, mas sem endereço — sem abrir em nova aba nem copiar o link)
const linkAttrs = computed(() =>
  props.to ? { to: props.to } : props.href ? { href: props.href, target: '_blank', rel: 'noopener' } : { type: props.type },
);
</script>

<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    :disabled="(isButton && (disabled || loading)) || undefined"
    class="btn d-inline-flex align-center justify-center gap-1"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--icon': iconOnly }]"
  >
    <LoaderCircle v-if="loading" :size="iconSize" class="btn__spin" />
    <component :is="icon" v-else-if="icon" :size="iconSize" :stroke-width="1.75" />
    <span v-if="!iconOnly && $slots.default"><slot /></span>
  </component>
</template>

<style lang="scss" scoped>
.btn {
  height: 40px;
  padding-inline: space(2);
  border-radius: $r1;
  border: 1px solid transparent;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--sm {
    height: 32px;
    padding-inline: space(1);
    font-size: 13px;
  }

  &--icon {
    width: 40px;
    padding: 0;

    &.btn--sm {
      width: 32px;
    }
  }

  &--primary {
    background: var(--accent);
    color: var(--on-accent);

    &:hover:not(:disabled) {
      background: var(--accent-hover);
    }
  }

  &--secondary {
    background: var(--surface);
    border-color: var(--border);

    &:hover:not(:disabled) {
      background: var(--surface-hover);
    }
  }

  &--ghost {
    color: var(--text-muted);

    &:hover:not(:disabled) {
      background: var(--surface-hover);
      color: var(--text);
    }
  }

  &--danger {
    color: var(--danger);

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--danger) 12%, transparent);
    }
  }

  &__spin {
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
