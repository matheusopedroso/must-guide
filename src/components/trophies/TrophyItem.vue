<script setup>
import { computed, ref } from 'vue';
import { Check, EyeOff, MessageSquareText, Trophy } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import TrophyFlags from './TrophyFlags.vue';
import TrophyTip from './TrophyTip.vue';
import { RARITY_LABELS, TROPHY_TYPE_MAP } from '@/config/trophies';
import { formatEarnedAt, formatRate } from '@/utils/trophies';
import { hasRichContent } from '@/utils/html';

const props = defineProps({
  trophy: { type: Object, required: true },
  note: { type: Object, required: true },
  stats: { type: Object, default: null }, // progresso da conta: { earned, earnedAt, rate, rarity }
});
const emit = defineEmits(['update-note']);
const update = (patch) => emit('update-note', props.trophy.id, patch);

const editingTip = ref(false);
const hasTip = computed(() => hasRichContent(props.note.tip));

const type = computed(() => TROPHY_TYPE_MAP[props.trophy.type] ?? TROPHY_TYPE_MAP.bronze);
const rarity = computed(() => {
  const s = props.stats;
  if (s?.rate == null) return '';
  return [RARITY_LABELS[s.rarity], `${formatRate(s.rate)} dos jogadores`].filter(Boolean).join(' · ');
});
</script>

<template>
  <li class="trophy d-flex flex-column gap-2 py-2" :class="{ 'is-earned': stats?.earned }">
    <div class="d-flex gap-2">
      <div class="trophy__icon radius-1 shrink-0" :title="stats?.earned ? `Conquistado em ${formatEarnedAt(stats.earnedAt)}` : ''">
        <img v-if="trophy.icon" :src="trophy.icon" alt="" loading="lazy" decoding="async" />
        <span v-if="stats?.earned" class="trophy__check d-flex align-center justify-center" aria-label="Conquistado">
          <Check :size="12" :stroke-width="3" />
        </span>
      </div>

      <div class="d-flex flex-column gap-1 min-w-0 flex-1">
        <div class="d-flex align-start gap-1">
          <div class="d-flex align-center flex-wrap gap-1 flex-1 min-w-0">
            <h4 class="trophy__name">{{ trophy.name || 'Troféu oculto' }}</h4>
            <span class="tag" :style="{ color: type.color }">
              <Trophy :size="14" :stroke-width="2" /> {{ type.label }}
            </span>
            <span v-if="trophy.hidden" class="tag"><EyeOff :size="14" :stroke-width="1.75" /> Oculto</span>
          </div>
          <BaseButton
            :icon="MessageSquareText"
            size="sm"
            :variant="hasTip ? 'ghost' : 'secondary'"
            class="trophy__how shrink-0"
            :class="{ 'is-filled': hasTip }"
            :aria-label="hasTip ? 'Editar como conseguir' : 'Escrever como conseguir'"
            @click="editingTip = true"
          >
            Como conseguir
          </BaseButton>
        </div>
        <p v-if="trophy.detail" class="text-sm text-muted">{{ trophy.detail }}</p>
        <p v-if="rarity" class="text-xs text-subtle">{{ rarity }}</p>

        <TrophyFlags :note="note" class="mt-1" @update="update" />
      </div>
    </div>

    <!-- Largura total do troféu (texto longo fica mais fácil de ler) -->
    <TrophyTip v-model:editing="editingTip" :tip="note.tip" @update="update" />
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

  // Já preenchido: discreto, na cor de destaque
  &__how.is-filled {
    color: var(--accent);
  }

  // No celular só o ícone, para não espremer o nome do troféu
  &__how :deep(span) {
    @include down(sm) {
      display: none;
    }
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
  }
}
</style>
