<script setup>
// <select> compacto com ícone à esquerda. As <option>/<optgroup> vão no slot.
// `active` destaca o campo (ex.: filtro diferente de "Todos").
const model = defineModel({ type: String, default: '' });
defineProps({
  icon: { type: [Object, Function], required: true },
  label: { type: String, required: true },
  active: Boolean,
});
</script>

<template>
  <label class="icon-select relative d-inline-flex align-center" :class="{ 'is-active': active }">
    <component :is="icon" :size="16" :stroke-width="1.75" class="icon-select__icon" />
    <select v-model="model" class="input icon-select__field" :aria-label="label">
      <slot />
    </select>
  </label>
</template>

<style lang="scss" scoped>
.icon-select {
  &__icon {
    position: absolute;
    left: 12px;
    color: var(--text-subtle);
    pointer-events: none;
  }

  &__field {
    padding-left: space(5);
    text-overflow: ellipsis;
  }

  &.is-active {
    .icon-select__icon {
      color: var(--accent);
    }

    .icon-select__field {
      border-color: var(--accent);
      color: var(--accent);
      font-weight: 500;
    }
  }
}
</style>
