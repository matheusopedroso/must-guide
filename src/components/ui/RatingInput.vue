<script setup>
// Nota em pontos (ex.: dificuldade 1–5). readonly = só exibe. Clicar na nota atual limpa (volta a 0).
const model = defineModel({ type: Number, default: 0 });
defineProps({
  max: { type: Number, default: 5 },
  readonly: Boolean,
  label: { type: String, default: 'Nota' },
});

const set = (n) => (model.value = model.value === n ? 0 : n);
</script>

<template>
  <span v-if="readonly" class="rating d-inline-flex align-center" role="img" :aria-label="`${label}: ${model} de ${max}`">
    <i v-for="n in max" :key="n" class="rating__dot" :class="{ 'is-on': n <= model }" />
  </span>

  <span v-else class="rating d-inline-flex align-center" role="radiogroup" :aria-label="label">
    <button
      v-for="n in max"
      :key="n"
      type="button"
      role="radio"
      class="rating__btn d-flex align-center justify-center"
      :aria-checked="model === n"
      :aria-label="`${n} de ${max}`"
      @click="set(n)"
    >
      <i class="rating__dot" :class="{ 'is-on': n <= model }" />
    </button>
  </span>
</template>

<style lang="scss" scoped>
.rating {
  gap: $space-half;

  &__btn {
    width: 24px;
    height: 32px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border-strong);
    transition: background 0.15s, transform 0.15s;

    &.is-on {
      background: var(--accent);
    }
  }

  &__btn &__dot {
    width: 12px;
    height: 12px;
  }

  &__btn:hover &__dot {
    transform: scale(1.15);
  }
}
</style>
