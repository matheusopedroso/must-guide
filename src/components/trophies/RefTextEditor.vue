<script setup>
import { ref, useTemplateRef } from 'vue';
import { Trophy } from 'lucide-vue-next';
import RichTextEditor from '@/components/ui/RichTextEditor.vue';
import TrophyRefPicker from './TrophyRefPicker.vue';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';
import { EDITOR_ACTIONS } from '@/config/editor';
import { trophyRefHtml } from '@/utils/trophyRef';

// Editor de texto (Pell) que cita troféus: botão na barra ou "@" → lista → chip do troféu no texto.
// A lista de troféus vem do contexto (provideTrophyContext). Usado no "Como conseguir" e no Roadmap.
const model = defineModel({ type: String, default: '' });
defineProps({
  placeholder: { type: String, default: '' },
  exclude: { type: [Number, String, Array], default: null }, // troféu(s) que não aparecem na lista
  autofocus: Boolean,
});
defineEmits(['keydown']);

const ctx = useTrophyContext();
const editor = useTemplateRef('editor');
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
        title: 'Citar troféu (ou digite @)',
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
      @keydown="$emit('keydown', $event)"
      @trigger="ctx && openPicker(true)"
    />
    <TrophyRefPicker
      v-if="picking && ctx"
      :trophies="ctx.trophies.value"
      :exclude="exclude"
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
