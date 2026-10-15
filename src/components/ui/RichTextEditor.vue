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
// trigger: caractere especial digitado (ex.: "@") → quem usa o editor decide o que fazer
const emit = defineEmits(['keydown', 'trigger']);
const TRIGGERS = ['@'];

const root = useTemplateRef('root');
const empty = ref(!hasRichContent(model.value));
let content = null;
let buttons = [];
let savedRange = null;

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

// Guarda onde está o cursor (antes de abrir algo que tira o foco do editor)
function saveSelection() {
  const sel = window.getSelection();
  savedRange = sel.rangeCount && content.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
}

// Texto da seleção guardada (vazio se só havia o cursor)
const selectedText = () => savedRange?.toString().replace(/\s+/g, ' ').trim() ?? '';

function restoreSelection() {
  content.focus();
  if (!savedRange) return focusEnd();
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(savedRange);
}

// Insere HTML onde o cursor estava. deleteBefore: apaga N caracteres antes (ex.: o "@" que abriu a lista).
// block: é um bloco (ex.: cartão do troféu) → entra depois do parágrafo do cursor, com um parágrafo novo
// embaixo para continuar escrevendo.
// Feito com Range (e não execCommand('insertHTML')): o navegador jogava blocos não editáveis para fora do parágrafo.
function insertHtml(html, { deleteBefore = 0, block = false } = {}) {
  if (block) return insertBlock(html);
  restoreSelection();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);

  if (deleteBefore) {
    const { startContainer: node, startOffset: offset } = range;
    if (node.nodeType === Node.TEXT_NODE && offset >= deleteBefore) range.setStart(node, offset - deleteBefore);
  }
  range.deleteContents();

  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const last = tpl.content.lastChild;
  range.insertNode(tpl.content);

  // Cursor logo depois do que foi inserido
  const after = document.createRange();
  after.setStartAfter(last);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);

  content.dispatchEvent(new Event('input', { bubbles: true })); // avisa o Pell → v-model atualiza
  savedRange = null;
}

// Liga/desliga um trecho marcado (ex.: spoiler): com o cursor dentro de um, tira a marcação; com texto
// selecionado (dentro de um parágrafo), envolve em <span class="cls">. → 'on' | 'off' | 'empty' | 'multi'
function toggleWrap(cls) {
  const sel = window.getSelection();
  if (!sel.rangeCount || !content.contains(sel.anchorNode)) return 'empty';
  const range = sel.getRangeAt(0);
  const start = range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : range.startContainer;
  const current = start.closest?.(`span.${cls}`);
  if (current && content.contains(current)) {
    current.replaceWith(...current.childNodes);
    content.dispatchEvent(new Event('input', { bubbles: true }));
    return 'off';
  }
  if (range.collapsed) return 'empty';
  const blockOf = (node) => {
    while (node && node.parentNode !== content) node = node.parentNode;
    return node;
  };
  if (blockOf(range.startContainer) !== blockOf(range.endContainer)) return 'multi';

  const span = document.createElement('span');
  span.className = cls;
  span.append(range.extractContents());
  range.insertNode(span);
  sel.removeAllRanges();
  const after = document.createRange();
  after.setStartAfter(span);
  after.collapse(true);
  sel.addRange(after);
  content.dispatchEvent(new Event('input', { bubbles: true }));
  return 'on';
}

function insertBlock(html) {
  restoreSelection();
  const sel = window.getSelection();
  let node = sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
  while (node && node.parentNode !== content) node = node.parentNode; // bloco de 1º nível do cursor

  const tpl = document.createElement('template');
  tpl.innerHTML = `${html}<p><br></p>`;
  const next = tpl.content.lastChild;
  if (node && node !== content) node.after(tpl.content);
  else content.append(tpl.content);

  const after = document.createRange();
  after.setStart(next, 0);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);

  content.dispatchEvent(new Event('input', { bubbles: true }));
  savedRange = null;
}

function onInput(e) {
  if (e.inputType === 'insertText' && TRIGGERS.includes(e.data)) {
    saveSelection();
    emit('trigger', e.data);
  }
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
  content.addEventListener('input', onInput);

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

defineExpose({ focus: () => content && focusEnd(), saveSelection, restoreSelection, selectedText, insertHtml, toggleWrap });
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
