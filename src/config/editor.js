import { Bold, Heading, Italic, Link, List, ListOrdered, RemoveFormatting, Strikethrough, Underline } from 'lucide-vue-next';
import { exec } from 'pell';

const blockIs = (tag) => document.queryCommandValue('formatBlock').toLowerCase() === tag;

// Barra de ferramentas do editor (Pell). A ordem aqui é a ordem dos botões.
// name igual a um botão padrão do Pell (bold, italic, ulist…) reaproveita o comportamento dele;
// para um botão novo, informe result() (e state() se ele tiver estado ligado/desligado).
export const EDITOR_ACTIONS = [
  { name: 'bold', title: 'Negrito', icon: Bold },
  { name: 'italic', title: 'Itálico', icon: Italic },
  { name: 'underline', title: 'Sublinhado', icon: Underline },
  { name: 'strikethrough', title: 'Riscado', icon: Strikethrough },
  {
    name: 'subtitle',
    title: 'Subtítulo',
    icon: Heading,
    state: () => blockIs('h3'),
    result: () => exec('formatBlock', blockIs('h3') ? '<p>' : '<h3>'),
  },
  { name: 'ulist', title: 'Lista', icon: List },
  { name: 'olist', title: 'Lista numerada', icon: ListOrdered },
  {
    name: 'link',
    title: 'Link',
    icon: Link,
    result: () => {
      const url = window.prompt('Endereço do link (https://…)');
      if (url) exec('createLink', /^https?:\/\//i.test(url) ? url : `https://${url}`);
      return true;
    },
  },
  {
    name: 'clear',
    title: 'Limpar formatação',
    icon: RemoveFormatting,
    result: () => exec('removeFormat') && exec('formatBlock', '<p>'),
  },
];

// Conjuntos de botões do editor de texto (RefTextEditor → prop tools). A ordem dos botões é sempre a da
// barra completa; aqui só se escolhe quais aparecem. Nomes: os de EDITOR_ACTIONS e os do RefTextEditor
// (callout, image, spoiler, controllerKey, trophyRef, autoLink, trophyCard, counter, collectibleRef).
// Sem "trophyRef", o "@" e o Ctrl+K também não citam troféu.
export const EDITOR_TOOLSETS = {
  full: null, // tudo (abas de seções: Guia, Roadmap, Coletáveis…)
  // Dica do troféu: texto médio, sem subtítulo nem cartão de troféu (já está no troféu)
  tip: ['bold', 'italic', 'ulist', 'olist', 'link', 'clear', 'callout', 'image', 'spoiler', 'controllerKey', 'trophyRef', 'autoLink', 'counter', 'collectibleRef'],
  // "Como achar" do coletável: texto curto
  collectible: ['bold', 'italic', 'link', 'clear', 'spoiler', 'controllerKey', 'trophyRef', 'collectibleRef'],
};

// tools: nome de um conjunto ('full', 'tip'…) ou a lista de nomes → Set dos permitidos (null = todos)
export function resolveTools(tools = 'full') {
  const list = Array.isArray(tools) ? tools : EDITOR_TOOLSETS[tools];
  if (list === undefined) throw new Error(`Conjunto de botões desconhecido: ${tools}`);
  return list ? new Set(list) : null;
}
