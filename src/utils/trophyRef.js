import { escapeHtml } from './html';

// Referência a outro troféu dentro do texto do guia.
// contenteditable="false": no editor vira um bloco único (apaga inteiro, não dá para editar o nome por dentro).
// label: texto do chip (ex.: o nome selecionado no texto, até em inglês); sem ele, o nome do troféu.
export const trophyRefHtml = (trophy, label = '') =>
  `<a href="#trofeu-${trophy.id}" data-trophy="${trophy.id}" data-type="${trophy.type}" class="trophy-ref" contenteditable="false">${escapeHtml(label || trophy.name || 'Troféu oculto')}</a>`;

export const trophyAnchorId = (id) => `trofeu-${id}`;

// ids dos troféus citados num texto (sem repetir)
const REF_PATTERN = /data-trophy="(\d+)"/g;
export const extractTrophyRefs = (html = '') => new Set([...html.matchAll(REF_PATTERN)].map((m) => Number(m[1])));

// --- Linkar automaticamente os nomes de troféus já escritos no texto ---
const ESCAPE = /[.*+?^${}()|[\]\\]/g;
const MIN_LENGTH = 3; // nomes muito curtos dariam falso positivo
// Aspas retas e curvas valem igual ("Can't" = "Can’t")
const toPattern = (name) => name.replace(ESCAPE, '\\$&').replace(/['’]/g, "['’]").replace(/\s+/g, '\\s+');
const keyOf = (text) => text.toLocaleLowerCase('pt-BR').replace(/’/g, "'").replace(/\s+/g, ' ');

// Procura no HTML os nomes dos troféus (PT ou EN, palavra inteira, sem diferenciar maiúsculas) fora de
// links e troca cada um por um chip que mantém o texto escrito. Nome mais longo primeiro ("Big Earner" antes de "Earner").
// exclude: ids que não viram link (ex.: o próprio troféu). → { html, count }
export function autoLinkTrophies(html, trophies, { exclude = [] } = {}) {
  const skip = new Set([exclude].flat());
  const byName = new Map();
  for (const t of trophies) {
    if (skip.has(t.id)) continue;
    for (const name of [t.name, t.nameEn]) {
      const key = name && keyOf(name.trim());
      if (key && key.length >= MIN_LENGTH && !byName.has(key)) byName.set(key, t); // nome repetido (DLC): fica o 1º
    }
  }
  if (!byName.size || !html) return { html, count: 0 };

  const names = [...byName.keys()].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(?<![\\p{L}\\p{N}])(?:${names.map(toPattern).join('|')})(?![\\p{L}\\p{N}])`, 'giu');

  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('a, code') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  let count = 0;
  for (const node of nodes) {
    const text = node.data;
    regex.lastIndex = 0;
    if (!regex.test(text)) continue;
    regex.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(regex)) {
      const trophy = byName.get(keyOf(m[0]));
      if (!trophy) continue;
      frag.append(text.slice(last, m.index));
      const chip = document.createElement('template');
      chip.innerHTML = trophyRefHtml(trophy, m[0]);
      frag.append(chip.content);
      last = m.index + m[0].length;
      count++;
    }
    frag.append(text.slice(last));
    node.replaceWith(frag);
  }
  return { html: count ? tpl.innerHTML : html, count };
}
