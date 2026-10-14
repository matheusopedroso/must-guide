<script setup>
import { DIFFICULTY_BANDS } from '@/config/guide';
import { difficultyBand, difficultyClass } from '@/utils/difficulty';

// Escolha da dificuldade 1–10, cada botão na cor da sua faixa. Tocar na escolhida limpa (0).
const model = defineModel({ type: Number, default: 0 });
const set = (n) => (model.value = model.value === n ? 0 : n);

// Intervalo de cada faixa para a legenda (1–2, 3–5…)
const legend = DIFFICULTY_BANDS.map((b, i) => ({ ...b, min: (DIFFICULTY_BANDS[i - 1]?.max ?? 0) + 1 }));
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div class="picker" role="radiogroup" aria-label="Dificuldade de 1 a 10">
      <button
        v-for="n in 10"
        :key="n"
        type="button"
        role="radio"
        class="picker__btn radius-1"
        :class="[difficultyClass(n), { 'is-active': model === n }]"
        :aria-checked="model === n"
        @click="set(n)"
      >
        {{ n }}
      </button>
    </div>

    <ul class="legend-list d-flex flex-wrap text-xs text-muted">
      <li
        v-for="b in legend"
        :key="b.id"
        class="legend d-inline-flex align-center gap-1"
        :class="[`diff--${b.id}`, { 'is-current': difficultyBand(model)?.id === b.id }]"
      >
        <i class="legend__dot" /> {{ b.label }} <span class="text-subtle">{{ b.min }}–{{ b.max }}</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: space(1);

  @include up(md) {
    grid-template-columns: repeat(10, 1fr);
  }

  &__btn {
    height: 48px;
    border: 1px solid var(--diff-edge, transparent); // o preto (9–10) ganha contorno no tema escuro
    background: color-mix(in srgb, var(--diff-bg) 14%, transparent);
    color: var(--text);
    font-size: 16px;
    font-weight: 600;
    transition: background 0.15s, color 0.15s, transform 0.15s;

    &:hover {
      background: color-mix(in srgb, var(--diff-bg) 28%, transparent);
    }

    &.is-active {
      background: var(--diff-bg);
      color: var(--diff-fg);
      transform: scale(1.06);
    }
  }
}

.legend-list {
  gap: space(1) space(2);
}

.legend {
  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--diff-bg);
    box-shadow: inset 0 0 0 1px var(--diff-edge, transparent);
  }

  &.is-current {
    color: var(--text);
    font-weight: 600;
  }
}
</style>
