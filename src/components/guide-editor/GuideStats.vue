<script setup>
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useGuideStats } from '@/composables/guide/useGuideStats';
import { GUIDE_STATS } from '@/config/guide';

// Dificuldade x/10, jogadas e horas numa linha. Tocar no número edita (vazio = "—").
// No celular só ícone + valor + unidade (o nome fica no aria-label/tooltip).
const { draft } = useGuideDraft();
const { stats, update } = useGuideStats(draft);

// Largura do número acompanha os dígitos ("3" colado no "/10", "999" cabe inteiro)
const width = (v) => `${Math.max(String(v || '').length, 1) + 0.2}ch`;
</script>

<template>
  <div class="stats d-flex flex-wrap gap-1" aria-label="Visão geral do guia">
    <label
      v-for="s in GUIDE_STATS"
      :key="s.id"
      class="stat d-inline-flex align-center gap-1 px-1 radius-1"
      :class="{ 'is-empty': !stats[s.id] }"
      :data-tooltip="`${s.label} (${s.min}–${s.max})`"
    >
      <component :is="s.icon" :size="14" :stroke-width="2" class="shrink-0" />
      <span class="stat__label">{{ s.label }}</span>
      <span class="d-inline-flex align-baseline">
        <input
          class="stat__input"
          type="number"
          inputmode="numeric"
          :min="s.min"
          :max="s.max"
          :value="stats[s.id] || ''"
          placeholder="—"
          :aria-label="s.label"
          :style="{ width: width(stats[s.id]) }"
          @change="update(s.id, $event.target.value)"
          @keydown.enter="$event.target.blur()"
        />
        <span v-if="s.suffix" class="stat__suffix">{{ s.suffix }}</span>
      </span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.stat {
  height: 32px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 13px;
  cursor: text;
  transition: box-shadow 0.15s;

  &:focus-within {
    box-shadow: 0 0 0 2px var(--accent);
  }

  &.is-empty {
    background: var(--surface-2);
    color: var(--text-muted);
  }

  &__label {
    font-weight: 500;

    @include down(md) {
      display: none;
    }
  }

  &__input {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 700;
    text-align: center;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    &::placeholder {
      color: inherit;
    }

    &:focus {
      outline: none;
    }
  }

  &__suffix {
    font-weight: 600;
    opacity: 0.8;
  }
}
</style>
