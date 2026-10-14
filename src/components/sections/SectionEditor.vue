<script setup>
import { computed, ref, useTemplateRef } from 'vue';
import { ArrowDown, ArrowUp, Plus, Quote, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import RefTextEditor from '@/components/trophies/RefTextEditor.vue';
import TrophyRefPicker from '@/components/trophies/TrophyRefPicker.vue';
import SectionTrophyGrid from './SectionTrophyGrid.vue';
import CollectibleListEditor from '@/components/collectibles/CollectibleListEditor.vue';
import { sectionWords } from '@/utils/sections';
import { useClickOutside } from '@/composables/useClickOutside';

// Uma seção no editor (etapa do Roadmap, seção do Guia): título, texto corrido (cita troféus com @)
// e os troféus da seção. cfg = config da aba (config/guideTabs → sections).
const props = defineProps({
  section: { type: Object, required: true },
  cfg: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
  trophies: { type: Array, default: () => [] }, // lista completa (para o seletor)
  byId: { type: Map, required: true },
  cited: { type: Array, default: () => [] }, // ids citados no texto e fora da lista
  types: { type: Array, default: () => [] }, // tipos de coletável já usados (sugestões)
});
const emit = defineEmits([
  'update', 'move', 'remove', 'add-trophies', 'remove-trophy', 'open-trophy',
  'add-item', 'update-item', 'remove-item', 'move-item', // coletáveis (cfg.items)
]);

const sectionTrophies = computed(() => props.section.trophies.map((id) => props.byId.get(id)).filter(Boolean));
const w = computed(() => sectionWords(props.cfg));

// Seletor "Adicionar troféu": fica aberto para escolher vários seguidos
const picking = ref(false);
const pickerWrap = useTemplateRef('pickerWrap');
useClickOutside(pickerWrap, picking, () => (picking.value = false));
</script>

<template>
  <article class="section surface radius-2 d-flex flex-column gap-2 p-2">
    <!-- Celular: "Etapa N" + ações numa linha, o título embaixo ocupando a largura -->
    <header class="section__head d-flex align-center flex-wrap gap-1">
      <span class="kicker shrink-0">{{ cfg.unit }} {{ index + 1 }}</span>
      <input
        :value="section.title"
        class="input section__title"
        :placeholder="cfg.titlePlaceholder"
        :aria-label="`Título ${w.of} ${w.name}`"
        @input="emit('update', { title: $event.target.value })"
      />
      <div class="d-flex gap-1 ml-auto">
        <BaseButton :icon="ArrowUp" icon-only size="sm" variant="ghost" :disabled="index === 0" :aria-label="`Subir ${w.name}`" data-tooltip="Subir" @click="emit('move', -1)" />
        <BaseButton :icon="ArrowDown" icon-only size="sm" variant="ghost" :disabled="index === total - 1" :aria-label="`Descer ${w.name}`" data-tooltip="Descer" @click="emit('move', 1)" />
        <BaseButton :icon="Trash2" icon-only size="sm" variant="danger" class="tooltip-left" :aria-label="`Remover ${w.name}`" :data-tooltip="`Remover ${w.name}`" @click="emit('remove')" />
      </div>
    </header>

    <RefTextEditor
      :model-value="section.body"
      :placeholder="cfg.bodyPlaceholder"
      @update:model-value="emit('update', { body: $event })"
    />

    <!-- Coletáveis da região (aba Coletáveis) -->
    <CollectibleListEditor
      v-if="cfg.items"
      :items="section.items ?? []"
      :types="types"
      :region-name="`${w.this} ${w.name}`"
      @add="emit('add-item', $event)"
      @update="(itemId, patch) => emit('update-item', itemId, patch)"
      @remove="emit('remove-item', $event)"
      @move="(itemId, dir) => emit('move-item', itemId, dir)"
    />

    <section class="d-flex flex-column gap-1">
      <div class="d-flex align-center justify-between flex-wrap gap-1">
        <h4 class="text-sm fw-600">Troféus {{ w.this }} {{ w.name }} <span class="text-subtle">{{ sectionTrophies.length }}</span></h4>
        <div class="d-flex flex-wrap gap-1">
          <BaseButton v-if="cited.length" :icon="Quote" size="sm" variant="ghost" @click="emit('add-trophies', cited)">
            {{ cited.length > 1 ? `Adicionar os ${cited.length} citados no texto` : 'Adicionar o citado no texto' }}
          </BaseButton>
          <div ref="pickerWrap" class="relative">
            <BaseButton :icon="Plus" size="sm" :disabled="!trophies.length" @click="picking = !picking">Adicionar troféu</BaseButton>
            <TrophyRefPicker
              v-if="picking"
              :trophies="trophies"
              :exclude="section.trophies"
              class="section__picker"
              @select="emit('add-trophies', [$event.id])"
              @cancel="picking = false"
            />
          </div>
        </div>
      </div>

      <SectionTrophyGrid v-if="sectionTrophies.length" :trophies="sectionTrophies" removable @remove="emit('remove-trophy', $event)" @open="emit('open-trophy', $event)" />
      <p v-else class="text-xs text-subtle">Nenhum troféu ainda. Adicione os ligados a {{ w.thisOne }} {{ w.name }} (opcional).</p>
    </section>
  </article>
</template>

<style lang="scss" scoped>
.section {
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
