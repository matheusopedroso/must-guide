<script setup>
import { Check, Trophy, X } from 'lucide-vue-next';
import { TROPHY_TYPE_MAP } from '@/config/trophies';

// Troféus de uma etapa em grade (2 colunas no desktop), como no fim de cada etapa do PSNProfiles.
// Conquistado (progresso da conta) fica com fundo verde. removable: botão de tirar (editor).
defineProps({
  trophies: { type: Array, required: true }, // objetos da lista da PSN
  progress: { type: Object, default: null }, // { trophies: { [id]: { earned } } }
  removable: Boolean,
});
defineEmits(['open', 'remove']);

const typeOf = (t) => TROPHY_TYPE_MAP[t.type] ?? TROPHY_TYPE_MAP.bronze;
</script>

<template>
  <ul class="rgrid">
    <li
      v-for="t in trophies"
      :key="t.id"
      class="rcard d-flex align-center gap-2 radius-1 p-1"
      :class="{ 'is-earned': progress?.trophies[t.id]?.earned }"
    >
      <button type="button" class="rcard__main d-flex align-center gap-2 flex-1 min-w-0" @click="$emit('open', t.id)">
        <span class="rcard__icon radius-1 shrink-0">
          <img v-if="t.icon" :src="t.icon" alt="" loading="lazy" />
          <span v-if="progress?.trophies[t.id]?.earned" class="rcard__check d-flex align-center justify-center" aria-label="Conquistado">
            <Check :size="10" :stroke-width="3" />
          </span>
        </span>
        <span class="d-flex flex-column min-w-0">
          <span class="rcard__name d-flex align-center gap-1 truncate">
            <Trophy :size="14" :stroke-width="2" class="shrink-0" :style="{ color: typeOf(t).color }" :aria-label="typeOf(t).label" />
            <span class="truncate">{{ t.name || 'Troféu oculto' }}</span>
          </span>
          <span v-if="t.detail" class="text-xs text-muted truncate">{{ t.detail }}</span>
        </span>
      </button>
      <button
        v-if="removable"
        type="button"
        class="rcard__remove d-flex align-center justify-center radius-1 shrink-0"
        :aria-label="`Tirar ${t.name} da etapa`"
        @click="$emit('remove', t.id)"
      >
        <X :size="16" />
      </button>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.rgrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: space(1);

  @include up(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.rcard {
  border: 1px solid var(--border);
  background: var(--surface);
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--border-strong);
  }

  &.is-earned {
    border-color: color-mix(in srgb, var(--earned) 45%, transparent);
    background: color-mix(in srgb, var(--earned) 10%, var(--surface));
  }

  &__main {
    text-align: left;
  }

  &__icon {
    position: relative;
    width: 40px;
    height: 40px;
    background: var(--surface-2);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
    }
  }

  &__check {
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--earned);
    color: #fff;
    box-shadow: 0 0 0 2px var(--surface);
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
  }

  &__remove {
    width: 32px;
    height: 32px;
    color: var(--text-subtle);

    &:hover {
      background: var(--surface-hover);
      color: var(--danger);
    }
  }
}
</style>
