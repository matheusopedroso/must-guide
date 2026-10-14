<script setup>
import { ref, useTemplateRef } from 'vue';
import { Gem, Trophy, WandSparkles } from 'lucide-vue-next';
import RichTextEditor from '@/components/ui/RichTextEditor.vue';
import TrophyRefPicker from './TrophyRefPicker.vue';
import CollectiblePicker from '@/components/collectibles/CollectiblePicker.vue';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';
import { useCollectibleContext } from '@/composables/guide/useCollectibles';
import { collectibleRefHtml } from '@/utils/collectibles';
import { EDITOR_ACTIONS } from '@/config/editor';
import { autoLinkTrophies, trophyRefHtml } from '@/utils/trophyRef';
import { useToast } from '@/composables/useToast';

// Editor de texto (Pell) que cita troféus: botão na barra ou "@" → lista → chip do troféu no texto.
// Com um trecho selecionado (ex.: o nome do troféu escrito no texto), o botão ou Ctrl/⌘+K abre a lista já
// buscando por ele e o trecho vira o link para o troféu (mantém o texto escolhido).
// Varinha: transforma de uma vez todos os nomes de troféus já escritos (PT ou EN) em links — com Desfazer.
// Coletável (joia na barra): mesmo jeito do troféu — com o nome selecionado, o trecho vira o chip do coletável,
// que na leitura vira uma caixinha para marcar (marca também na aba Coletáveis).
// As listas vêm do contexto (provideTrophyContext / provideCollectibleContext). Usado em todas as abas de texto.
const model = defineModel({ type: String, default: '' });
const props = defineProps({
  placeholder: { type: String, default: '' },
  exclude: { type: [Number, String, Array], default: null }, // troféu(s) que não aparecem na lista
  autofocus: Boolean,
});
const emit = defineEmits(['keydown']);

const ctx = useTrophyContext();
const collectibles = useCollectibleContext();
const toast = useToast();
const editor = useTemplateRef('editor');
const picking = ref(null); // null | 'trophy' | 'collectible'
const selection = ref(''); // texto selecionado que vai virar o link
let fromTrigger = false;

function openPicker(trigger = false, kind = 'trophy') {
  fromTrigger = trigger;
  selection.value = trigger ? '' : editor.value.selectedText();
  picking.value = kind;
}

// Botão da barra / Ctrl+K: guarda a seleção antes de a lista tirar o foco
function openFromSelection(kind = 'trophy') {
  editor.value.saveSelection();
  openPicker(false, kind);
}

function onKeydown(e) {
  if (ctx && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openFromSelection('trophy');
    return;
  }
  emit('keydown', e);
}

const actions = [
  ...EDITOR_ACTIONS,
  ...(ctx
    ? [
        {
          name: 'trophyRef',
          title: 'Citar troféu: digite @, ou selecione o nome no texto e toque aqui (Ctrl+K)',
          icon: Trophy,
          result: () => openFromSelection('trophy'),
        },
        { name: 'autoLink', title: 'Linkar troféus automaticamente (acha os nomes já escritos no texto)', icon: WandSparkles, result: autoLink },
      ]
    : []),
  ...(collectibles
    ? [
        {
          name: 'collectibleRef',
          title: 'Citar coletável (vira uma caixinha para marcar na leitura); com o nome selecionado, ele vira o link',
          icon: Gem,
          result: () => openFromSelection('collectible'),
        },
      ]
    : []),
];

// Varinha: linka todos os nomes encontrados (fora dos links que já existem)
function autoLink() {
  const before = model.value;
  const { html, count } = autoLinkTrophies(before, ctx.trophies.value, { exclude: props.exclude ?? [] });
  if (!count) return toast.show('Nenhum nome de troféu encontrado no texto.', 'info');
  model.value = html;
  toast.show(`${count} ${count > 1 ? 'nomes de troféus viraram links' : 'nome de troféu virou link'}.`, 'success', {
    action: { label: 'Desfazer', run: () => (model.value = before) },
  });
}

// Com seleção: o trecho vira o chip (mesmo texto). Sem: entra o nome do troféu + espaço.
function insertRef(item) {
  const toHtml = picking.value === 'collectible' ? collectibleRefHtml : trophyRefHtml;
  picking.value = null;
  const label = selection.value;
  const html = label ? toHtml(item, label) : `${toHtml(item)}&nbsp;`;
  editor.value.insertHtml(html, { deleteBefore: fromTrigger ? 1 : 0 }); // tira o "@"
  selection.value = '';
}

function cancelPick() {
  picking.value = null;
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
      v-if="picking === 'trophy' && ctx"
      :trophies="ctx.trophies.value"
      :exclude="exclude"
      :initial-term="selection"
      class="ref-pop"
      @select="insertRef"
      @cancel="cancelPick"
    />
    <CollectiblePicker
      v-if="picking === 'collectible' && collectibles"
      :items="collectibles.items.value"
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
