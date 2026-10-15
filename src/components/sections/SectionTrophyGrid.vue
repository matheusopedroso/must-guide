<script setup>
import { Check, Trophy, X } from 'lucide-vue-next';
import { TROPHY_TYPE_MAP } from '@/config/trophies';

// Troféus de uma seção em grade (2 colunas no desktop), como no fim de cada etapa do PSNProfiles.
// Conquistado (progresso da conta) fica com fundo verde. removable: botão de tirar (editor).
// O visual do cartão (.trophy-tile) é global (styles/components/_trophy-ref.scss): o mesmo do troféu citado no texto.
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
      class="trophy-tile d-flex align-center gap-2 radius-1 p-1"
      :class="{ 'is-earned': progress?.trophies[t.id]?.earned }"
    >
      <button type="button" class="trophy-tile__main d-flex align-center gap-2 flex-1 min-w-0" @click="$emit('open', t.id)">
        <span class="trophy-tile__icon radius-1 shrink-0">
          <img v-if="t.icon" :src="t.icon" alt="" loading="lazy" />
          <span v-if="progress?.trophies[t.id]?.earned" class="trophy-tile__check d-flex align-center justify-center" aria-label="Conquistado">
            <Check :size="10" :stroke-width="3" />
          </span>
        </span>
        <span class="d-flex flex-column min-w-0">
          <span class="trophy-tile__name d-flex align-center gap-1 truncate">
            <Trophy :size="14" :stroke-width="2" class="shrink-0" :style="{ color: typeOf(t).color }" :aria-label="typeOf(t).label" />
            <span class="truncate">{{ t.name || 'Troféu oculto' }}</span>
          </span>
          <span v-if="t.detail" class="text-xs text-muted truncate">{{ t.detail }}</span>
        </span>
      </button>
      <button
        v-if="removable"
        type="button"
        class="trophy-tile__remove d-flex align-center justify-center radius-1 shrink-0"
        :aria-label="`Tirar ${t.name}`"
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

.trophy-tile__remove {
  width: 32px;
  height: 32px;
  color: var(--text-subtle);

  &:hover {
    background: var(--surface-hover);
    color: var(--danger);
  }
}
</style>
