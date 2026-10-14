<script setup>
import { nextTick, useTemplateRef, watch } from 'vue';

// Texto "Como conseguir" do troféu: mostra o bloco ou o campo de edição.
// Quem abre a edição é o botão do TrophyItem (v-model:editing).
defineProps({ tip: { type: String, default: '' } });
const editing = defineModel('editing', { type: Boolean, default: false });
const emit = defineEmits(['update']);

const textarea = useTemplateRef('textarea');

watch(editing, async (open) => {
  if (!open) return;
  await nextTick();
  textarea.value?.focus();
});
</script>

<template>
  <label v-if="editing" class="field">
    <span class="field__label">Como conseguir</span>
    <textarea
      ref="textarea"
      class="input text-sm"
      rows="4"
      placeholder="Onde, quando e como pegar este troféu. O que evitar…"
      :value="tip"
      @input="emit('update', { tip: $event.target.value })"
      @blur="editing = false"
      @keydown.esc="editing = false"
    />
  </label>

  <div v-else-if="tip" class="tip radius-1 px-2 py-2" @click="editing = true">
    <p class="text-xs fw-600 text-accent mb-1">Como conseguir</p>
    <p class="pre-line text-sm">{{ tip }}</p>
  </div>
</template>

<style lang="scss" scoped>
.tip {
  background: var(--surface-2);
  cursor: text;
}
</style>
