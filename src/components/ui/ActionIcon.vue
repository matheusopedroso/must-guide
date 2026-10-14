<script setup>
// Ação em círculo com rótulo embaixo (igual à AcaoIcone do Must Watch): Editar, Compartilhar…
// to → link interno · href → externo · senão botão. active = ligado (cor de destaque).
defineProps({
  icon: { type: [Object, Function], required: true },
  label: { type: String, required: true },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  active: Boolean,
});
defineEmits(['click']);
</script>

<template>
  <component
    :is="to ? 'RouterLink' : href ? 'a' : 'button'"
    :to="to || undefined"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :type="to || href ? undefined : 'button'"
    class="action"
    :class="{ 'is-active': active }"
    @click="$emit('click', $event)"
  >
    <span class="action__icon d-flex align-center justify-center radius-full" aria-hidden="true">
      <component :is="icon" :size="20" :stroke-width="1.75" />
    </span>
    <span class="action__label">{{ label }}</span>
  </component>
</template>

<style lang="scss" scoped>
.action {
  display: grid;
  justify-items: center;
  align-content: start;
  gap: space(1);
  width: 76px;
  color: var(--text-muted);

  &__icon {
    width: 40px;
    height: 40px;
    background: color-mix(in srgb, var(--text) 10%, transparent);
    color: var(--text);
    transition: background 0.2s, color 0.2s;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
  }

  &:hover &__icon,
  &:focus-visible &__icon {
    background: color-mix(in srgb, var(--text) 18%, transparent);
  }

  &:focus-visible {
    outline: none;
  }

  &.is-active &__icon {
    background: var(--accent);
    color: var(--on-accent);
  }

  &.is-active &__label {
    color: var(--accent);
  }
}
</style>
