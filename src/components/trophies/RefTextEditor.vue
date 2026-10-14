<script setup>
import { ref, useTemplateRef } from 'vue';
import { Trophy } from 'lucide-vue-next';
import RichTextEditor from '@/components/ui/RichTextEditor.vue';
import TrophyRefPicker from './TrophyRefPicker.vue';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';
import { EDITOR_ACTIONS } from '@/config/editor';
import { trophyRefHtml } from '@/utils/trophyRef';

// Editor de texto (Pell) que cita troféus: botão na barra ou "@" → lista → chip do troféu no texto.
// Com um trecho selecionado (ex.: o nome do troféu escrito no texto), o botão ou Ctrl/⌘+K abre a lista já
// buscando por ele e o trecho vira o link para o troféu (mantém o texto escolhido).
// A lista de troféus vem do contexto (provideTrophyContext). Usado no "Como conseguir" e no Roadmap.
const model = defineModel({ type: String, default: '' });
defineProps({
  placeholder: { type: String, default: '' },
  exclude: { type: [Number, String, Array], default: null }, // troféu(s) que não aparecem na lista
  autofocus: Boolean,
});
const emit = defineEmits(['keydown']);

const ctx = useTrophyContext();
const editor = useTemplateRef('editor');
const picking = ref(false);
const selection = ref(''); // texto selecionado que vai virar o link
let fromTrigger = false;

function openPicker(trigger = false) {
  fromTrigger = trigger;
  selection.value = trigger ? '' : editor.value.selectedText();
  picking.value = true;
}

// Botão da barra / Ctrl+K: guarda a seleção antes de a lista tirar o foco
function openFromSelection() {
  editor.value.saveSelection();
  openPicker(false);
}

function onKeydown(e) {
  if (ctx && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openFromSelection();
    return;
  }
  emit('keydown', e);
}

const actions = ctx
  ? [
      ...EDITOR_ACTIONS,
      {
        name: 'trophyRef',
        title: 'Citar troféu: digite @, ou selecione o nome no texto e toque aqui (Ctrl+K)',
        icon: Trophy,
        result: openFromSelection,
      },
    ]
  : EDITOR_ACTIONS;

// Com seleção: o trecho vira o chip (mesmo texto). Sem: entra o nome do troféu + espaço.
function insertRef(trophy) {
  picking.value = false;
  const label = selection.value;
  const html = label ? trophyRefHtml(trophy, label) : `${trophyRefHtml(trophy)}&nbsp;`;
  editor.value.insertHtml(html, { deleteBefore: fromTrigger ? 1 : 0 }); // tira o "@"
  selection.value = '';
}

function cancelPick() {
  picking.value = false;
  editor.value.restoreSelection();
}

defineExpose({ focus: () => editor.value?.focus() });
</script>

<template>
  <div class="relative">
    <RichTextEditor
      ref="editor"
      v-model="model"
      :actions="actions"
      :placeholder="placeholder"
      :autofocus="autofocus"
      @keydown="onKeydown"
      @trigger="ctx && openPicker(true)"
    />
    <TrophyRefPicker
      v-if="picking && ctx"
      :trophies="ctx.trophies.value"
      :exclude="exclude"
      :initial-term="selection"
      class="ref-pop"
      @select="insertRef"
      @cancel="cancelPick"
    />
  </div>
</template>

<style lang="scss" scoped>
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
