<script setup>
import { nextTick } from 'vue';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import GuideStepEditor from './GuideStepEditor.vue';
import { useGuideDraft } from '@/composables/useGuideDraft';

const props = defineProps({
  section: { type: Object, required: true },
  index: { type: Number, required: true },
  isLast: Boolean,
});

const { moveSection, removeSection, addStep, removeStep, moveStep } = useGuideDraft();

// Cria o passo e já coloca o cursor nele (fluxo rápido no celular)
async function insertStep(afterIndex = null) {
  const id = addStep(props.section.id, afterIndex);
  await nextTick();
  document.querySelector(`[data-step="${id}"]`)?.focus();
}

function confirmRemove() {
  const filled = props.section.steps.some((st) => st.text.trim());
  if (!filled || confirm('Remover esta seção e todos os passos?')) removeSection(props.section.id);
}
</script>

<template>
  <section class="surface radius-2 p-3">
    <header class="d-flex align-center gap-1 mb-1">
      <span class="text-sm text-subtle fw-600 shrink-0">{{ String(index + 1).padStart(2, '0') }}</span>
      <input v-model="section.title" class="input section-title flex-1" placeholder="Título da seção (ex.: Jogada 1, Coletáveis)" />
      <BaseButton :icon="ArrowUp" icon-only size="sm" variant="ghost" :disabled="index === 0" aria-label="Subir seção" @click="moveSection(index, -1)" />
      <BaseButton :icon="ArrowDown" icon-only size="sm" variant="ghost" :disabled="isLast" aria-label="Descer seção" @click="moveSection(index, 1)" />
      <BaseButton :icon="Trash2" icon-only size="sm" variant="danger" aria-label="Remover seção" @click="confirmRemove" />
    </header>

    <ul>
      <GuideStepEditor
        v-for="(step, i) in section.steps"
        :key="step.id"
        :step="step"
        :index="i"
        :is-last="i === section.steps.length - 1"
        @move="moveStep(section.id, i, $event)"
        @remove="removeStep(section.id, step.id)"
        @insert-after="insertStep(i)"
      />
    </ul>

    <BaseButton :icon="Plus" size="sm" variant="ghost" class="mt-1" @click="insertStep()">Adicionar passo</BaseButton>
  </section>
</template>

<style lang="scss" scoped>
.section-title {
  font-family: $font-serif;
  font-weight: 600;
  font-size: 17px;
}
</style>
