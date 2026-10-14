<script setup>
import { computed, ref, watch } from 'vue';
import { Check, EyeOff, MessageSquareText, SlidersHorizontal, Trophy } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import TrophyMetaTags from './TrophyMetaTags.vue';
import TrophyDetailsEditor from './TrophyDetailsEditor.vue';
import TrophyTip from './TrophyTip.vue';
import { RARITY_LABELS, TROPHY_TYPE_MAP } from '@/config/trophies';
import { formatEarnedAt, formatRate } from '@/utils/trophies';
import { hasRichContent } from '@/utils/html';
import { trophyAnchorId } from '@/utils/trophyRef';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';

const props = defineProps({
  trophy: { type: Object, required: true },
  note: { type: Object, required: true },
  stats: { type: Object, default: null }, // progresso da conta: { earned, earnedAt, rate, rarity }
  citedBy: { type: Array, default: () => [] }, // troféus cujo "Como conseguir" cita este
  spoiler: Boolean, // troféu oculto com nomes escondidos (até tocar)
});
const emit = defineEmits(['update-note']);
const update = (patch) => emit('update-note', props.trophy.id, patch);

const ctx = useTrophyContext();
const editingTip = ref(false);
const editingDetails = ref(false);
const revealed = ref(false);

// Borrado só enquanto for spoiler e ninguém revelou/editou
const blurred = computed(() => props.spoiler && !revealed.value);
watch([editingTip, editingDetails], ([a, b]) => (a || b) && (revealed.value = true));

const hasTip = computed(() => hasRichContent(props.note.tip));
const type = computed(() => TROPHY_TYPE_MAP[props.trophy.type] ?? TROPHY_TYPE_MAP.bronze);
const rarity = computed(() => {
  const s = props.stats;
  if (s?.rate == null) return '';
  return [RARITY_LABELS[s.rarity], `${formatRate(s.rate)} dos jogadores`].filter(Boolean).join(' · ');
});
</script>

<template>
  <li :id="trophyAnchorId(trophy.id)" class="trophy d-flex flex-column gap-2 py-2" :class="{ 'is-blurred': blurred }">
    <div class="d-flex gap-2">
      <div
        class="trophy__icon radius-1 shrink-0"
        :title="stats?.earned ? `Conquistado em ${formatEarnedAt(stats.earnedAt)}` : ''"
        @click="blurred && (revealed = true)"
      >
        <img v-if="trophy.icon" :src="trophy.icon" alt="" loading="lazy" decoding="async" class="spoil" />
        <span v-if="stats?.earned" class="trophy__check d-flex align-center justify-center" aria-label="Conquistado">
          <Check :size="12" :stroke-width="3" />
        </span>
      </div>

      <div class="d-flex flex-column gap-1 min-w-0 flex-1">
        <div class="d-flex align-start gap-1">
          <div class="d-flex align-center flex-wrap gap-1 flex-1 min-w-0">
            <h4 class="trophy__name spoil" @click="blurred && (revealed = true)">{{ trophy.name || 'Troféu oculto' }}</h4>
            <span class="tag" :style="{ color: type.color }">
              <Trophy :size="14" :stroke-width="2" /> {{ type.label }}
            </span>
            <button v-if="trophy.hidden" type="button" class="tag" :title="blurred ? 'Tocar para ver' : ''" @click="revealed = true">
              <EyeOff :size="14" :stroke-width="1.75" /> {{ blurred ? 'Oculto · ver' : 'Oculto' }}
            </button>
          </div>

          <div class="d-flex gap-1 shrink-0">
            <BaseButton
              :icon="SlidersHorizontal"
              size="sm"
              :variant="editingDetails ? 'secondary' : 'ghost'"
              class="trophy__action"
              :aria-pressed="editingDetails"
              aria-label="Detalhes do troféu"
              @click="editingDetails = !editingDetails"
            >
              Detalhes
            </BaseButton>
            <BaseButton
              :icon="MessageSquareText"
              size="sm"
              :variant="hasTip ? 'ghost' : 'secondary'"
              class="trophy__action"
              :class="{ 'is-filled': hasTip }"
              :aria-label="hasTip ? 'Editar como conseguir' : 'Escrever como conseguir'"
              @click="editingTip = true"
            >
              Como conseguir
            </BaseButton>
          </div>
        </div>

        <p v-if="trophy.detail" class="text-sm text-muted spoil" @click="blurred && (revealed = true)">{{ trophy.detail }}</p>
        <p v-if="rarity" class="text-xs text-subtle">{{ rarity }}</p>

        <TrophyMetaTags :note="note" />

        <p v-if="citedBy.length" class="cited d-flex align-center flex-wrap gap-1 text-xs text-subtle">
          <span>Citado em:</span>
          <a
            v-for="src in citedBy"
            :key="src.id"
            :href="`#${trophyAnchorId(src.id)}`"
            class="trophy-ref"
            :data-type="src.type"
            @click.prevent="ctx?.goTo(src.id)"
          >
            {{ src.name || 'Troféu oculto' }}
          </a>
        </p>
      </div>
    </div>

    <!-- Largura total do troféu -->
    <TrophyDetailsEditor v-if="editingDetails" :note="note" @update="update" @close="editingDetails = false" />
    <TrophyTip v-model:editing="editingTip" :tip="note.tip" :trophy-id="trophy.id" @update="update" />
  </li>
</template>

<style lang="scss" scoped>
.trophy {
  // Ocupa a largura do card (o card tem 16px de respiro) para o destaque ir de ponta a ponta
  margin-inline: -(space(2));
  padding-inline: space(2);

  & + & {
    border-top: 1px solid var(--border);
  }

  // Destaque ao chegar por uma referência no texto
  &.is-flash {
    animation: flash 1.6s $ease;
  }

  &__icon {
    position: relative;
    width: 48px;
    height: 48px;
    background: var(--surface-2);
    border-radius: $r1;
    overflow: visible;

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

  &__action.is-filled {
    color: var(--accent);
  }

  // No celular só o ícone, para não espremer o nome do troféu
  &__action :deep(span) {
    @include down(sm) {
      display: none;
    }
  }

  // Spoiler: nome, descrição e ícone borrados até tocar
  &.is-blurred .spoil {
    filter: blur(6px);
    user-select: none;
    cursor: pointer;
  }
}

@keyframes flash {
  0%,
  50% {
    background: var(--accent-soft);
  }

  100% {
    background: transparent;
  }
}
</style>
