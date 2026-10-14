<script setup>
import { computed, ref, useTemplateRef } from 'vue';
import { ArrowDown, ArrowUp, Plus, Quote, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import RefTextEditor from '@/components/trophies/RefTextEditor.vue';
import TrophyRefPicker from '@/components/trophies/TrophyRefPicker.vue';
import RoadmapTrophyGrid from './RoadmapTrophyGrid.vue';
import { useClickOutside } from '@/composables/useClickOutside';

// Uma etapa no editor: título, texto corrido (cita troféus com @) e os troféus da etapa.
const props = defineProps({
  stage: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
  trophies: { type: Array, default: () => [] }, // lista completa (para o seletor)
  byId: { type: Map, required: true },
  cited: { type: Array, default: () => [] }, // ids citados no texto e fora da lista
});
const emit = defineEmits(['update', 'move', 'remove', 'add-trophies', 'remove-trophy', 'open-trophy']);

const stageTrophies = computed(() => props.stage.trophies.map((id) => props.byId.get(id)).filter(Boolean));

// Seletor "Adicionar troféu": fica aberto para escolher vários seguidos
const picking = ref(false);
const pickerWrap = useTemplateRef('pickerWrap');
useClickOutside(pickerWrap, picking, () => (picking.value = false));
</script>

<template>
  <article class="stage surface radius-2 d-flex flex-column gap-2 p-2">
    <!-- Celular: "Etapa N" + ações numa linha, o título embaixo ocupando a largura -->
    <header class="stage__head d-flex align-center flex-wrap gap-1">
      <span class="kicker shrink-0">Etapa {{ index + 1 }}</span>
      <input
        :value="stage.title"
        class="input stage__title"
        placeholder="Título (ex.: Jogada da história)"
        aria-label="Título da etapa"
        @input="emit('update', { title: $event.target.value })"
      />
      <div class="d-flex gap-1 ml-auto">
        <BaseButton :icon="ArrowUp" icon-only size="sm" variant="ghost" :disabled="index === 0" aria-label="Subir etapa" data-tooltip="Subir" @click="emit('move', -1)" />
        <BaseButton :icon="ArrowDown" icon-only size="sm" variant="ghost" :disabled="index === total - 1" aria-label="Descer etapa" data-tooltip="Descer" @click="emit('move', 1)" />
        <BaseButton :icon="Trash2" icon-only size="sm" variant="danger" class="tooltip-left" aria-label="Remover etapa" data-tooltip="Remover etapa" @click="emit('remove')" />
      </div>
    </header>

    <RefTextEditor
      :model-value="stage.body"
      placeholder="O que fazer nesta etapa, em que ordem e o que não pode perder. Digite @ para citar um troféu…"
      @update:model-value="emit('update', { body: $event })"
    />

    <section class="d-flex flex-column gap-1">
      <div class="d-flex align-center justify-between flex-wrap gap-1">
        <h4 class="text-sm fw-600">Troféus desta etapa <span class="text-subtle">{{ stageTrophies.length }}</span></h4>
        <div class="d-flex flex-wrap gap-1">
          <BaseButton v-if="cited.length" :icon="Quote" size="sm" variant="ghost" @click="emit('add-trophies', cited)">
            Adicionar os {{ cited.length }} citados no texto
          </BaseButton>
          <div ref="pickerWrap" class="relative">
            <BaseButton :icon="Plus" size="sm" :disabled="!trophies.length" @click="picking = !picking">Adicionar troféu</BaseButton>
            <TrophyRefPicker
              v-if="picking"
              :trophies="trophies"
              :exclude="stage.trophies"
              class="stage__picker"
              @select="emit('add-trophies', [$event.id])"
              @cancel="picking = false"
            />
          </div>
        </div>
      </div>

      <RoadmapTrophyGrid v-if="stageTrophies.length" :trophies="stageTrophies" removable @remove="emit('remove-trophy', $event)" @open="emit('open-trophy', $event)" />
      <p v-else class="text-xs text-subtle">Nenhum troféu ainda. Adicione os que saem nesta etapa.</p>
    </section>
  </article>
</template>

<style lang="scss" scoped>
.stage {
  &__title {
    flex: 1 1 0;
    min-width: 0;
    font-weight: 600;

    @include down(md) {
      flex-basis: 100%;
      order: 1; // vai para a linha de baixo
    }
  }

  &__picker {
    position: absolute;
    top: calc(100% + #{space(1)});
    right: 0;
    z-index: 20;
    width: min(400px, calc(100vw - #{space(4)}));
  }
}
</style>
