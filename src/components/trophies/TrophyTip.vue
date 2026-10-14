<script setup>
import { computed, useTemplateRef, watch } from 'vue';
import { Check } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import RefTextEditor from './RefTextEditor.vue';
import RefText from './RefText.vue';
import { useClickOutside } from '@/composables/useClickOutside';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';
import { hasRichContent, sanitizeHtml } from '@/utils/html';

// Texto "Como conseguir" do troféu (HTML do editor): mostra o bloco ou o editor.
// Quem abre a edição é o botão do TrophyItem (v-model:editing). Fecha em Concluir, Esc ou tocando fora.
const props = defineProps({
  tip: { type: String, default: '' },
  trophyId: { type: [Number, String], required: true },
  readonly: Boolean, // leitura do guia: tocar no texto não abre a edição
});
const editing = defineModel('editing', { type: Boolean, default: false });
const emit = defineEmits(['update']);

const ctx = useTrophyContext();
const root = useTemplateRef('root');
useClickOutside(root, editing, () => (editing.value = false));

const hasTip = computed(() => hasRichContent(props.tip));

// Ao terminar de editar, grava a versão limpa do HTML (uma vez, não a cada tecla)
watch(editing, (open) => {
  if (open || !props.tip) return;
  const clean = hasTip.value ? sanitizeHtml(props.tip) : '';
  if (clean !== props.tip) emit('update', { tip: clean });
});
</script>

<template>
  <div v-if="editing || hasTip" ref="root">
    <div v-if="editing" class="d-flex flex-column gap-1">
      <span class="field__label">Como conseguir</span>
      <RefTextEditor
        :model-value="tip"
        :exclude="trophyId"
        placeholder="Onde, quando e como pegar este troféu. Digite @ para citar outro troféu…"
        autofocus
        @update:model-value="emit('update', { tip: $event })"
        @keydown="$event.key === 'Escape' && (editing = false)"
      />
      <div class="d-flex justify-end">
        <BaseButton :icon="Check" size="sm" @click="editing = false">Concluir</BaseButton>
      </div>
    </div>

    <!-- A seção do meio do card já é o guia: texto direto, sem caixa nem título.
         Chip de troféu leva até ele; tocar no resto abre a edição -->
    <RefText v-else :html="tip" class="tip" @trophy="ctx?.goTo($event)" @text="!readonly && (editing = true)" />
  </div>
</template>

<style lang="scss" scoped>
.tip {
  font-size: 14px;
  cursor: text;
}
</style>
