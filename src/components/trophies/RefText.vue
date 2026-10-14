<script setup>
import { computed } from 'vue';
import { hasRichContent, sanitizeHtml, textToHtml } from '@/utils/html';

// Leitura de um texto do guia (HTML do editor, sempre filtrado). Chip de troféu → emite `trophy` (id);
// outros links abrem normal; tocar no resto do texto → `text` (ex.: abrir a edição).
const props = defineProps({ html: { type: String, default: '' } });
const emit = defineEmits(['trophy', 'text']);

const safeHtml = computed(() => (hasRichContent(props.html) ? sanitizeHtml(textToHtml(props.html)) : ''));

function onClick(e) {
  const refEl = e.target.closest('a.trophy-ref');
  if (refEl) {
    e.preventDefault();
    emit('trophy', Number(refEl.dataset.trophy));
    return;
  }
  if (!e.target.closest('a')) emit('text', e);
}
</script>

<template>
  <div v-if="safeHtml" class="rich-text" @click="onClick" v-html="safeHtml" />
</template>
