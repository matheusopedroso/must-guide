<script setup>
import { nextTick, useTemplateRef, watch } from 'vue';
import { TROPHY_FLAGS } from '@/config/trophies';

// Anotações do guia num troféu: texto "Como conseguir" + marcações (História, Perdível, Online…).
// Quem abre o texto é o botão do TrophyItem (v-model:editing).
const props = defineProps({ note: { type: Object, required: true } });
const editing = defineModel('editing', { type: Boolean, default: false });
// mousedown.prevent nas marcações: marcar não fecha o texto em edição (senão o layout pula e o toque se perde)
const emit = defineEmits(['update']);

const textarea = useTemplateRef('textarea');

watch(editing, async (open) => {
  if (!open) return;
  await nextTick();
  textarea.value?.focus();
});

const toggle = (field) => emit('update', { [field]: !props.note[field] });
</script>

<template>
  <div class="d-flex flex-column gap-1">
    <div v-if="note.tip && !editing" class="tip radius-1 px-2 py-1" @click="editing = true">
      <p class="text-xs fw-600 text-accent">Como conseguir</p>
      <p class="pre-line text-sm">{{ note.tip }}</p>
    </div>

    <label v-if="editing" class="field">
      <span class="field__label">Como conseguir</span>
      <textarea
        ref="textarea"
        class="input text-sm"
        rows="3"
        placeholder="Onde, quando e como pegar este troféu. O que evitar…"
        :value="note.tip"
        @input="emit('update', { tip: $event.target.value })"
        @blur="editing = false"
        @keydown.esc="editing = false"
      />
    </label>

    <div class="d-flex flex-wrap gap-1">
      <button
        v-for="flag in TROPHY_FLAGS"
        :key="flag.id"
        type="button"
        class="chip chip--sm"
        :class="{ 'is-on': note[flag.id] }"
        :aria-pressed="!!note[flag.id]"
        @mousedown.prevent
        @click="toggle(flag.id)"
      >
        <component :is="flag.icon" :size="14" :stroke-width="1.75" /> {{ flag.label }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tip {
  background: var(--surface-2);
  border-left: 2px solid var(--accent);
  cursor: text;
}
</style>
