<script setup>
import { Minus, Plus } from 'lucide-vue-next';

// Número com − e + (dá para digitar também). 0 = não informado ("—"):
// "−" no mínimo limpa, "+" no vazio começa no mínimo.
const model = defineModel({ type: Number, default: 0 });
const props = defineProps({
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
  suffix: { type: String, default: '' },
  label: { type: String, required: true },
});

const clamp = (n) => Math.min(Math.max(n, props.min), props.max);
const dec = () => (model.value = model.value <= props.min ? 0 : model.value - 1);
const inc = () => (model.value = model.value ? clamp(model.value + 1) : props.min);

function type(e) {
  const n = Math.round(Number(e.target.value));
  model.value = !e.target.value || Number.isNaN(n) || n <= 0 ? 0 : clamp(n);
  e.target.value = model.value || ''; // mostra o valor ajustado (ex.: 2000 → 999)
}
</script>

<template>
  <div class="stepper d-flex align-center radius-1" role="group" :aria-label="label">
    <button type="button" class="stepper__btn d-flex align-center justify-center" :disabled="!model" :aria-label="`Diminuir ${label}`" @click="dec">
      <Minus :size="16" />
    </button>
    <label class="stepper__value d-flex align-baseline justify-center flex-1">
      <input
        class="stepper__input"
        type="number"
        inputmode="numeric"
        :min="min"
        :max="max"
        :value="model || ''"
        placeholder="—"
        :aria-label="label"
        @change="type"
        @keydown.enter="$event.target.blur()"
      />
      <span v-if="suffix && model" class="stepper__suffix">{{ suffix }}</span>
    </label>
    <button type="button" class="stepper__btn d-flex align-center justify-center" :disabled="model >= max" :aria-label="`Aumentar ${label}`" @click="inc">
      <Plus :size="16" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.stepper {
  height: 48px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  &__btn {
    width: 48px;
    height: 100%;
    color: var(--text-muted);
    transition: background 0.15s, color 0.15s;

    &:hover:not(:disabled) {
      background: var(--surface-hover);
      color: var(--text);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__value {
    min-width: 0;
    cursor: text;
  }

  &__input {
    width: 4ch;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 20px;
    font-weight: 600;
    text-align: right;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    &::placeholder {
      color: var(--text-subtle);
      text-align: center;
    }

    &:placeholder-shown {
      text-align: center;
    }

    &:focus {
      outline: none;
    }
  }

  &__suffix {
    margin-left: $space-half;
    color: var(--text-muted);
    font-weight: 600;
  }
}
</style>
