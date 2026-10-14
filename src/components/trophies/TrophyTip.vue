<script setup>
import { computed, useTemplateRef, watch } from 'vue';
import { Check } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import RichTextEditor from '@/components/ui/RichTextEditor.vue';
import { useClickOutside } from '@/composables/useClickOutside';
import { hasRichContent, sanitizeHtml, textToHtml } from '@/utils/html';

// Texto "Como conseguir" do troféu (HTML do editor): mostra o bloco ou o editor.
// Quem abre a edição é o botão do TrophyItem (v-model:editing). Fecha em Concluir, Esc ou tocando fora.
const props = defineProps({ tip: { type: String, default: '' } });
const editing = defineModel('editing', { type: Boolean, default: false });
const emit = defineEmits(['update']);

const root = useTemplateRef('root');
useClickOutside(root, editing, () => (editing.value = false));

const hasTip = computed(() => hasRichContent(props.tip));

// Ao terminar de editar, grava a versão limpa do HTML (uma vez, não a cada tecla)
watch(editing, (open) => {
  if (open || !props.tip) return;
  const clean = hasTip.value ? sanitizeHtml(props.tip) : '';
  if (clean !== props.tip) emit('update', { tip: clean });
});
const safeHtml = computed(() => (hasTip.value ? sanitizeHtml(textToHtml(props.tip)) : ''));

// Clique no bloco abre a edição, exceto em links
const openFromView = (e) => !e.target.closest('a') && (editing.value = true);
</script>

<template>
  <div v-if="editing || hasTip" ref="root">
    <div v-if="editing" class="d-flex flex-column gap-1">
      <span class="field__label">Como conseguir</span>
      <RichTextEditor
        :model-value="tip"
        placeholder="Onde, quando e como pegar este troféu. O que evitar…"
        autofocus
        @update:model-value="emit('update', { tip: $event })"
        @keydown="$event.key === 'Escape' && (editing = false)"
      />
      <div class="d-flex justify-end">
        <BaseButton :icon="Check" size="sm" @click="editing = false">Concluir</BaseButton>
      </div>
    </div>

    <div v-else class="tip radius-1 px-2 py-2" @click="openFromView">
      <p class="text-xs fw-600 text-accent mb-1">Como conseguir</p>
      <div class="rich-text text-sm" v-html="safeHtml" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tip {
  background: var(--surface-2);
  cursor: text;
}
</style>
