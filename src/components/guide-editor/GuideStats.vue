<script setup>
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useGuideStats } from '@/composables/guide/useGuideStats';
import { GUIDE_STATS } from '@/config/guide';

// Blocos editáveis: Dificuldade x/10, Jogadas, Horas. Tocar no número edita.
const { draft } = useGuideDraft();
const { stats, update } = useGuideStats(draft);
// (largura do número acompanha os dígitos: "3" fica colado no "/10" e "999" cabe inteiro)
</script>

<template>
  <div class="stats d-flex gap-1">
    <label v-for="s in GUIDE_STATS" :key="s.id" class="stat d-flex flex-column align-center justify-center radius-1">
      <span class="stat__value d-flex align-baseline">
        <input
          class="stat__input"
          type="number"
          inputmode="numeric"
          :min="s.min"
          :max="s.max"
          :value="stats[s.id] || ''"
          placeholder="—"
          :aria-label="s.label"
          :style="{ width: `${String(stats[s.id] || '').length + 0.6 || 1.6}ch` }"
          @change="update(s.id, $event.target.value)"
          @keydown.enter="$event.target.blur()"
        />
        <span v-if="s.suffix && stats[s.id]" class="stat__suffix">{{ s.suffix }}</span>
      </span>
      <span class="stat__label">{{ s.label }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.stat {
  width: 96px;
  height: 64px;
  background: var(--accent-soft);
  color: var(--accent);
  cursor: text;
  transition: box-shadow 0.15s;

  &:focus-within {
    box-shadow: 0 0 0 2px var(--accent);
  }

  &__value {
    justify-content: center;
  }

  &__input {
    min-width: 1.6ch;
    max-width: 4ch;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 22px;
    font-weight: 600;
    text-align: center;
    line-height: 1.1;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    &::placeholder {
      color: inherit;
      opacity: 0.5;
    }

    &:focus {
      outline: none;
    }
  }

  &__suffix {
    font-size: 14px;
    font-weight: 600;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
}
</style>
