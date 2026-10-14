<script setup>
import { h, onBeforeUnmount, onMounted, ref, render, useTemplateRef, watch } from 'vue';
import { exec, init } from 'pell';
import { EDITOR_ACTIONS } from '@/config/editor';
import { hasRichContent, sanitizeHtml, textToHtml } from '@/utils/html';

// Editor de texto com Pell. v-model = HTML ('' quando vazio).
const model = defineModel({ type: String, default: '' });
const props = defineProps({
  placeholder: { type: String, default: '' },
  actions: { type: Array, default: () => EDITOR_ACTIONS },
  autofocus: Boolean,
});
const emit = defineEmits(['keydown']);

const root = useTemplateRef('root');
const empty = ref(!hasRichContent(model.value));
let content = null;
let buttons = [];

function onChange(html) {
  empty.value = !hasRichContent(html);
  model.value = empty.value ? '' : html;
}

// Colar de sites/Word: só formatação simples (o filtro remove estilos, scripts, imagens…)
function onPaste(e) {
  e.preventDefault();
  const html = e.clipboardData.getData('text/html');
  exec('insertHTML', html ? sanitizeHtml(html) : textToHtml(e.clipboardData.getData('text/plain')));
}

function focusEnd() {
  content.focus();
  const range = document.createRange();
  range.selectNodeContents(content);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

onMounted(() => {
  const editor = init({
    element: root.value,
    defaultParagraphSeparator: 'p',
    // O Pell espera o ícone como HTML; os ícones do lucide são desenhados abaixo
    actions: props.actions.map(({ icon, ...action }) => ({ ...action, icon: '' })),
    classes: { actionbar: 'rte__bar', button: 'rte__btn', content: 'rte__content rich-text', selected: 'is-on' },
    onChange,
  });

  content = editor.content;
  content.dataset.placeholder = props.placeholder;
  content.innerHTML = textToHtml(model.value); // anotações antigas em texto simples viram parágrafos
  content.addEventListener('paste', onPaste);
  content.addEventListener('keydown', (e) => emit('keydown', e));

  const bar = root.value.querySelector('.rte__bar');
  bar.addEventListener('mousedown', (e) => e.preventDefault()); // clicar no botão não tira a seleção do texto
  buttons = [...bar.children];
  buttons.forEach((btn, i) => {
    btn.setAttribute('aria-label', props.actions[i].title);
    render(h(props.actions[i].icon, { size: 18, strokeWidth: 1.75 }), btn);
  });

  if (props.autofocus) focusEnd();
});

onBeforeUnmount(() => buttons.forEach((btn) => render(null, btn)));

// Valor trocado por fora (ex.: outro troféu): atualiza sem mexer no cursor enquanto digita
watch(model, (value) => {
  if (!content || value === content.innerHTML || (!value && !hasRichContent(content.innerHTML))) return;
  content.innerHTML = textToHtml(value);
  empty.value = !hasRichContent(value);
});

defineExpose({ focus: () => content && focusEnd() });
</script>

<template>
  <div ref="root" class="rte" :class="{ 'is-empty': empty }" />
</template>

<style lang="scss" scoped>
.rte {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: $r1;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  // Uma linha só: no celular rola para o lado em vez de quebrar
  :deep(.rte__bar) {
    display: flex;
    gap: $space-half;
    padding: space(1);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  :deep(.rte__btn) {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $r1;
    color: var(--text-muted);
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--surface-hover);
      color: var(--text);
    }

    &.is-on {
      background: var(--accent-soft);
      color: var(--accent);
    }
  }

  :deep(.rte__content) {
    position: relative;
    min-height: 120px;
    max-height: 60dvh;
    overflow-y: auto;
    padding: space(1) space(2);
    font-size: 14px;
    outline: none;
  }

  // Placeholder (o Pell não tem): aparece com o editor vazio
  &.is-empty :deep(.rte__content)::before {
    content: attr(data-placeholder);
    position: absolute;
    left: space(2);
    right: space(2);
    color: var(--text-subtle);
    pointer-events: none;
  }
}
</style>
