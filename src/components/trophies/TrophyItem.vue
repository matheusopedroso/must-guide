<script setup>
import { computed } from 'vue';
import { Check, EyeOff, Trophy } from 'lucide-vue-next';
import TrophyNoteEditor from './TrophyNoteEditor.vue';
import { RARITY_LABELS, TROPHY_TYPE_MAP } from '@/config/trophies';
import { formatEarnedAt, formatRate } from '@/utils/trophies';

const props = defineProps({
  trophy: { type: Object, required: true },
  note: { type: Object, required: true },
  stats: { type: Object, default: null }, // progresso da conta: { earned, earnedAt, rate, rarity }
});
defineEmits(['update-note']);

const type = computed(() => TROPHY_TYPE_MAP[props.trophy.type] ?? TROPHY_TYPE_MAP.bronze);
const rarity = computed(() => {
  const s = props.stats;
  if (s?.rate == null) return '';
  return [RARITY_LABELS[s.rarity], `${formatRate(s.rate)} dos jogadores`].filter(Boolean).join(' · ');
});
</script>

<template>
  <li class="trophy d-flex gap-2 py-2" :class="{ 'is-earned': stats?.earned }">
    <div class="trophy__icon radius-1 shrink-0" :title="stats?.earned ? `Conquistado em ${formatEarnedAt(stats.earnedAt)}` : ''">
      <img v-if="trophy.icon" :src="trophy.icon" alt="" loading="lazy" decoding="async" />
      <span v-if="stats?.earned" class="trophy__check d-flex align-center justify-center" aria-label="Conquistado">
        <Check :size="12" :stroke-width="3" />
      </span>
    </div>

    <div class="d-flex flex-column gap-1 min-w-0 flex-1">
      <div class="d-flex align-center flex-wrap gap-1">
        <h4 class="trophy__name">{{ trophy.name || 'Troféu oculto' }}</h4>
        <span class="tag" :style="{ color: type.color }">
          <Trophy :size="14" :stroke-width="2" /> {{ type.label }}
        </span>
        <span v-if="trophy.hidden" class="tag"><EyeOff :size="14" :stroke-width="1.75" /> Oculto</span>
      </div>
      <p v-if="trophy.detail" class="text-sm text-muted">{{ trophy.detail }}</p>
      <p v-if="rarity" class="text-xs text-subtle">{{ rarity }}</p>

      <TrophyNoteEditor :note="note" class="mt-1" @update="$emit('update-note', trophy.id, $event)" />
    </div>
  </li>
</template>

<style lang="scss" scoped>
.trophy {
  & + & {
    border-top: 1px solid var(--border);
  }

  &__icon {
    position: relative;
    width: 48px;
    height: 48px;
    background: var(--surface-2);

    @include up(md) {
      width: 56px;
      height: 56px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
    }
  }

  &__check {
    position: absolute;
    right: -$space-half;
    bottom: -$space-half;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--success);
    color: var(--surface);
    border: 2px solid var(--surface);
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
  }
}
</style>
