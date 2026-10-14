<script setup>
import { computed, ref, watch } from 'vue';
import { Check, CirclePlay, EyeOff, Link as LinkIcon, MessageSquareText, SlidersHorizontal } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import TrophyMetaTags from './TrophyMetaTags.vue';
import TrophyDetailsEditor from './TrophyDetailsEditor.vue';
import TrophyTip from './TrophyTip.vue';
import VideoModal from '@/components/ui/VideoModal.vue';
import { TROPHY_FLAGS } from '@/config/trophies';
import { formatEarnedAt, formatEarnedAtFull } from '@/utils/trophies';
import { hasRichContent } from '@/utils/html';
import { trophyAnchorId } from '@/utils/trophyRef';
import { parseYoutube } from '@/utils/url';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';

// Card do troféu em 3 partes: topo (ícone, nome, descrição, ações) · meio (guia, se preenchido) · rodapé (badges e etiquetas)
const props = defineProps({
  trophy: { type: Object, required: true },
  note: { type: Object, required: true },
  stats: { type: Object, default: null }, // progresso da conta: { earned, earnedAt, rate, rarity }
  citedBy: { type: Array, default: () => [] }, // troféus cujo "Como conseguir" cita este
  spoiler: Boolean, // troféu oculto com nomes escondidos (até tocar)
  readonly: Boolean, // leitura do guia: sem os botões de edição
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
const earnedLabel = computed(() => (props.stats?.earned ? `Conquistado em ${formatEarnedAtFull(props.stats.earnedAt)}` : ''));
// Vídeo: YouTube toca dentro do app; outros links abrem em nova aba
const videoOpen = ref(false);
const isYoutubeVideo = computed(() => !!parseYoutube(props.note.video));
// Nome original em inglês, só quando for diferente do português
const nameEn = computed(() => {
  const en = props.trophy.nameEn?.trim();
  return en && en.toLowerCase() !== props.trophy.name?.trim().toLowerCase() ? en : '';
});
const tipLabel = computed(() => (hasTip.value ? 'Editar como conseguir' : 'Como conseguir'));
// Seção do meio = guia do troféu: só aparece se foi preenchido (ou está sendo editado)
const hasBody = computed(() => hasTip.value || editingTip.value || editingDetails.value);
</script>

<template>
  <li :id="trophyAnchorId(trophy.id)" class="trophy surface radius-2" :class="{ 'is-blurred': blurred, 'is-earned': stats?.earned }">
    <!-- Topo -->
    <header class="trophy__head p-2">
      <div
        class="trophy__icon radius-1"
        :title="earnedLabel"
        @click="reveal"
      >
        <img v-if="trophy.icon" :src="trophy.icon" alt="" loading="lazy" decoding="async" class="spoil" />
        <span v-if="stats?.earned" class="trophy__check d-flex align-center justify-center" aria-label="Conquistado">
          <Check :size="12" :stroke-width="3" />
        </span>
      </div>

      <div class="trophy__title d-flex flex-column gap-1 min-w-0">
        <h4 class="trophy__name spoil" @click="reveal">
          {{ trophy.name || 'Troféu oculto' }}
          <span v-if="nameEn" class="trophy__name-en" lang="en">({{ nameEn }})</span>
        </h4>
        <p v-if="trophy.detail" class="trophy__detail spoil" @click="reveal">{{ trophy.detail }}</p>

        <p v-if="citedBy.length" class="d-flex align-center flex-wrap gap-1 text-xs text-subtle mt-1">
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

      <div class="trophy__actions d-flex gap-1">
        <template v-if="note.video">
          <BaseButton
            v-if="isYoutubeVideo"
            :icon="CirclePlay"
            icon-only
            size="sm"
            class="trophy__action is-filled"
            aria-label="Ver vídeo"
            data-tooltip="Ver vídeo"
            @click="videoOpen = true"
          />
          <BaseButton
            v-else
            :icon="LinkIcon"
            icon-only
            size="sm"
            :href="note.video"
            class="trophy__action is-filled"
            aria-label="Abrir link de referência"
            data-tooltip="Abrir link"
          />
        </template>
        <template v-if="!readonly">
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
        </template>
      </div>
    </header>

    <VideoModal v-if="videoOpen" v-model="videoOpen" :url="note.video" :title="trophy.name || 'Vídeo'" />

    <!-- Meio: o guia do troféu (só quando preenchido ou em edição) -->
    <div v-if="hasBody" class="trophy__body p-2 border-top d-flex flex-column gap-2">
      <TrophyDetailsEditor v-if="editingDetails" :note="note" @update="update" @close="editingDetails = false" />
      <TrophyTip v-model:editing="editingTip" :tip="note.tip" :trophy-id="trophy.id" @update="update" />
    </div>

    <!-- Rodapé: etiquetas -->
    <footer class="trophy__foot d-flex align-start gap-1 px-2 py-2 border-top">
      <TrophyMetaTags :trophy="trophy" :note="note" :stats="stats" class="trophy__meta">
        <template #before>
          <span v-for="f in flags" :key="f.id" class="badge" :class="`badge--${f.tone}`">
            <component :is="f.icon" :size="14" :stroke-width="2" /> {{ f.label }}
          </span>
          <button v-if="trophy.hidden" type="button" class="badge" @click="revealed = true">
            <EyeOff :size="14" :stroke-width="2" /> {{ blurred ? 'Oculto · ver' : 'Oculto' }}
          </button>
        </template>
      </TrophyMetaTags>

      <!-- Conquistado: separado, no canto direito -->
      <span
        v-if="stats?.earned"
        class="tag trophy__earned shrink-0 tooltip-left"
        tabindex="0"
        :data-tooltip="earnedLabel"
        :aria-label="earnedLabel"
      >
        <Check :size="14" :stroke-width="2.5" /> {{ formatEarnedAt(stats.earnedAt) }}
      </span>
    </footer>
  </li>
</template>

<style lang="scss" scoped>
.trophy {
  scroll-margin-top: calc(var(--nav-space) + 64px); // barra de navegação + barra de abas fixa
  transition: box-shadow 0.2s;

  // Topo: ícone | nome | ações
  &__head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: 'icon name actions';
    align-items: start;
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

  &__title {
    grid-area: name;
    align-self: center;
  }

  &__name-en {
    font-weight: 400;
    color: var(--text-subtle);
  }

  &__name {
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
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-muted);
  }

  // Rodapé: etiquetas à esquerda (quebram linha) e "Conquistado" fixo à direita.
  // No celular o "Conquistado" desce para a linha de baixo, alinhado à direita.
  &__foot {
    @include down(sm) {
      flex-wrap: wrap;
    }
  }

  // (sem a utilitária flex-1: ela usa !important e impediria o ajuste do celular)
  &__meta {
    flex: 1 1 0;
    min-width: 0;

    @include down(sm) {
      flex-basis: 100%;
    }
  }

  &__earned {
    background: color-mix(in srgb, var(--earned) 12%, transparent);
    color: var(--earned);

    @include down(sm) {
      margin-left: auto;
    }
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
