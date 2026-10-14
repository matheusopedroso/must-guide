<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import { Check, Trophy } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import RichTextEditor from '@/components/ui/RichTextEditor.vue';
import TrophyRefPicker from './TrophyRefPicker.vue';
import { useClickOutside } from '@/composables/useClickOutside';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';
import { EDITOR_ACTIONS } from '@/config/editor';
import { hasRichContent, sanitizeHtml, textToHtml } from '@/utils/html';
import { trophyRefHtml } from '@/utils/trophyRef';

// Texto "Como conseguir" do troféu (HTML do editor): mostra o bloco ou o editor.
// Quem abre a edição é o botão do TrophyItem (v-model:editing). Fecha em Concluir, Esc ou tocando fora.
const props = defineProps({
  tip: { type: String, default: '' },
  trophyId: { type: [Number, String], required: true },
});
const editing = defineModel('editing', { type: Boolean, default: false });
const emit = defineEmits(['update']);

const ctx = useTrophyContext();
const root = useTemplateRef('root');
const editor = useTemplateRef('editor');
useClickOutside(root, editing, () => (editing.value = false));

const hasTip = computed(() => hasRichContent(props.tip));
const safeHtml = computed(() => (hasTip.value ? sanitizeHtml(textToHtml(props.tip)) : ''));

// Ao terminar de editar, grava a versão limpa do HTML (uma vez, não a cada tecla)
watch(editing, (open) => {
  picking.value = false;
  if (open || !props.tip) return;
  const clean = hasTip.value ? sanitizeHtml(props.tip) : '';
  if (clean !== props.tip) emit('update', { tip: clean });
});

// --- Referenciar outro troféu: botão na barra ou digitando "@" ---
const picking = ref(false);
let fromTrigger = false;

function openPicker(trigger = false) {
  fromTrigger = trigger;
  picking.value = true;
}

const actions = ctx
  ? [
      ...EDITOR_ACTIONS,
      {
        name: 'trophyRef',
        title: 'Referenciar troféu (ou digite @)',
        icon: Trophy,
        result: () => {
          editor.value.saveSelection();
          openPicker(false);
        },
      },
    ]
  : EDITOR_ACTIONS;

function insertRef(trophy) {
  picking.value = false;
  editor.value.insertHtml(`${trophyRefHtml(trophy)}&nbsp;`, { deleteBefore: fromTrigger ? 1 : 0 }); // tira o "@"
}

function cancelPick() {
  picking.value = false;
  editor.value.restoreSelection();
}

// Leitura: chip de troféu leva até ele; outros links abrem normal; o resto do bloco abre a edição
function onViewClick(e) {
  const refEl = e.target.closest('a.trophy-ref');
  if (refEl) {
    e.preventDefault();
    ctx?.goTo(Number(refEl.dataset.trophy));
    return;
  }
  if (!e.target.closest('a')) editing.value = true;
}
</script>

<template>
  <div v-if="editing || hasTip" ref="root">
    <div v-if="editing" class="d-flex flex-column gap-1">
      <span class="field__label">Como conseguir</span>
      <div class="relative">
        <RichTextEditor
          ref="editor"
          :model-value="tip"
          :actions="actions"
          placeholder="Onde, quando e como pegar este troféu. Digite @ para citar outro troféu…"
          autofocus
          @update:model-value="emit('update', { tip: $event })"
          @keydown="$event.key === 'Escape' && (editing = false)"
          @trigger="ctx && openPicker(true)"
        />
        <TrophyRefPicker
          v-if="picking && ctx"
          :trophies="ctx.trophies.value"
          :exclude="trophyId"
          class="ref-pop"
          @select="insertRef"
          @cancel="cancelPick"
        />
      </div>
      <div class="d-flex justify-end">
        <BaseButton :icon="Check" size="sm" @click="editing = false">Concluir</BaseButton>
      </div>
    </div>

    <!-- A seção do meio do card já é o guia: texto direto, sem caixa nem título -->
    <div v-else class="tip rich-text" @click="onViewClick" v-html="safeHtml" />
  </div>
</template>

<style lang="scss" scoped>
.tip {
  font-size: 14px;
  cursor: text;
}

// Lista de troféus abre logo abaixo da barra do editor
.ref-pop {
  position: absolute;
  top: 48px;
  left: space(1);
  right: space(1);
  z-index: 20;

  @include up(md) {
    right: auto;
    width: 400px;
  }
}
</style>
