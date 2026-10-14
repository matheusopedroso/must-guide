<script setup>
import { computed, ref, watch } from 'vue';
import { Check, EyeOff, MessageSquareText, SlidersHorizontal } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import TrophyMetaTags from './TrophyMetaTags.vue';
import TrophyDetailsEditor from './TrophyDetailsEditor.vue';
import TrophyTip from './TrophyTip.vue';
import { TROPHY_FLAGS } from '@/config/trophies';
import { formatEarnedAt } from '@/utils/trophies';
import { hasRichContent } from '@/utils/html';
import { trophyAnchorId } from '@/utils/trophyRef';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';

// Card do troféu em 3 partes: topo (ícone, nome, ações) · meio (descrição e textos) · rodapé (badges e etiquetas)
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
const reveal = () => blurred.value && (revealed.value = true);

const hasTip = computed(() => hasRichContent(props.note.tip));
const flags = computed(() => TROPHY_FLAGS.filter((f) => props.note[f.id]));
const tipLabel = computed(() => (hasTip.value ? 'Editar como conseguir' : 'Como conseguir'));
// Seção do meio só quando há algo para mostrar
const hasBody = computed(
  () => props.trophy.detail || hasTip.value || editingTip.value || editingDetails.value || props.citedBy.length,
);
</script>

<template>
  <li :id="trophyAnchorId(trophy.id)" class="trophy surface radius-2" :class="{ 'is-blurred': blurred, 'is-earned': stats?.earned }">
    <!-- Topo -->
    <header class="trophy__head p-2">
      <div
        class="trophy__icon radius-1"
        :title="stats?.earned ? `Conquistado em ${formatEarnedAt(stats.earnedAt)}` : ''"
        @click="reveal"
      >
        <img v-if="trophy.icon" :src="trophy.icon" alt="" loading="lazy" decoding="async" class="spoil" />
        <span v-if="stats?.earned" class="trophy__check d-flex align-center justify-center" aria-label="Conquistado">
          <Check :size="12" :stroke-width="3" />
        </span>
      </div>

      <h4 class="trophy__name spoil" @click="reveal">{{ trophy.name || 'Troféu oculto' }}</h4>

      <div class="trophy__actions d-flex gap-1">
        <BaseButton
          :icon="SlidersHorizontal"
          icon-only
          size="sm"
          :class="{ 'is-on': editingDetails }"
          class="trophy__action"
          :aria-pressed="editingDetails"
          aria-label="Detalhes do troféu"
          data-tooltip="Detalhes"
          @click="editingDetails = !editingDetails"
        />
        <BaseButton
          :icon="MessageSquareText"
          icon-only
          size="sm"
          class="trophy__action tooltip-left"
          :class="{ 'is-filled': hasTip }"
          :aria-label="tipLabel"
          :data-tooltip="tipLabel"
          @click="editingTip = true"
        />
      </div>
    </header>

    <!-- Meio: descrição e textos do guia -->
    <div v-if="hasBody" class="trophy__body p-2 border-top d-flex flex-column gap-2">
      <p v-if="trophy.detail" class="trophy__detail spoil" @click="reveal">{{ trophy.detail }}</p>

      <TrophyDetailsEditor v-if="editingDetails" :note="note" @update="update" @close="editingDetails = false" />
      <TrophyTip v-model:editing="editingTip" :tip="note.tip" :trophy-id="trophy.id" @update="update" />

      <p v-if="citedBy.length" class="d-flex align-center flex-wrap gap-1 text-xs text-subtle">
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

    <!-- Rodapé: etiquetas -->
    <footer class="trophy__foot px-2 py-2 border-top">
      <TrophyMetaTags :trophy="trophy" :note="note" :stats="stats">
        <template #before>
          <span v-for="f in flags" :key="f.id" class="badge" :class="`badge--${f.tone}`">
            <component :is="f.icon" :size="14" :stroke-width="2" /> {{ f.label }}
          </span>
          <button v-if="trophy.hidden" type="button" class="badge" @click="revealed = true">
            <EyeOff :size="14" :stroke-width="2" /> {{ blurred ? 'Oculto · ver' : 'Oculto' }}
          </button>
        </template>
      </TrophyMetaTags>
    </footer>
  </li>
</template>

<style lang="scss" scoped>
.trophy {
  scroll-margin-top: $header-height + 64px; // header + barra de abas fixa
  transition: box-shadow 0.2s;

  // Topo: ícone | nome | ações
  &__head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: 'icon name actions';
    align-items: center;
    column-gap: space(2);
  }

  &__icon {
    grid-area: icon;
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
    right: -$space-half;
    bottom: -$space-half;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--earned);
    color: var(--surface);
    border: 2px solid var(--surface);
  }

  &__name {
    grid-area: name;
    font-family: $font-sans;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0;
  }

  &__actions {
    grid-area: actions;
  }

  &__action {
    &.is-on {
      background: var(--surface-hover);
    }

    &.is-filled {
      color: var(--accent);
    }
  }

  &__detail {
    font-size: 14px;
    color: var(--text-muted);
  }

  // Conquistado na conta (progresso da PSN): borda + anel no tom teal
  &.is-earned {
    border-color: var(--earned);
    box-shadow: 0 0 0 4px var(--earned-ring);
  }

  // Destaque ao chegar por uma referência no texto
  &.is-flash {
    animation: flash 1.6s $ease;
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
    box-shadow: 0 0 0 3px var(--accent);
  }

  100% {
    box-shadow: 0 0 0 3px transparent;
  }
}
</style>
