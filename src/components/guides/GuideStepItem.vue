<script setup>
import { Check, TriangleAlert, Trophy } from 'lucide-vue-next';

defineProps({
  step: { type: Object, required: true },
  checked: Boolean,
});
defineEmits(['toggle']);
</script>

<template>
  <li class="step d-flex gap-2 py-2" :class="{ 'is-done': checked }">
    <button
      type="button"
      class="step__check d-flex align-center justify-center shrink-0 radius-1"
      role="checkbox"
      :aria-checked="checked"
      :aria-label="checked ? 'Desmarcar' : 'Marcar como feito'"
      @click="$emit('toggle', step.id)"
    >
      <Check v-if="checked" :size="16" :stroke-width="2.5" />
    </button>

    <div class="d-flex flex-column gap-1 flex-1 min-w-0">
      <div v-if="step.trophy || step.missable" class="d-flex flex-wrap gap-1">
        <span v-if="step.trophy" class="tag">
          <Trophy :size="14" :stroke-width="1.75" /> {{ step.trophy }}
        </span>
        <span v-if="step.missable" class="tag text-warning">
          <TriangleAlert :size="14" :stroke-width="1.75" /> Perdível
        </span>
      </div>
      <p v-if="step.text" class="step__text pre-line">{{ step.text }}</p>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.step {
  & + & {
    border-top: 1px solid var(--border);
  }

  &__check {
    width: 24px;
    height: 24px;
    margin-top: 0;
    border: 1.5px solid var(--border-strong);
    color: var(--on-accent);
    transition: background 0.15s, border-color 0.15s;

    &:hover {
      border-color: var(--accent);
    }
  }

  &.is-done &__check {
    background: var(--accent);
    border-color: var(--accent);
  }

  &__text {
    transition: color 0.15s;
  }

  &.is-done &__text {
    color: var(--text-subtle);
    text-decoration: line-through;
    text-decoration-color: var(--border-strong);
  }
}
</style>
