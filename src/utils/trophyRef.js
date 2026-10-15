import { escapeHtml } from './html';
import { RARITY_LABELS, TROPHY_TYPE_MAP } from '@/config/trophies';
import { formatRate } from './trophies';

// Referência a outro troféu dentro do texto do guia.
// contenteditable="false": no editor vira um bloco único (apaga inteiro, não dá para editar o nome por dentro).
// label: texto do chip (ex.: o nome selecionado no texto, até em inglês); sem ele, o nome do troféu.
export const trophyRefHtml = (trophy, label = '') =>
  `<a href="#trofeu-${trophy.id}" data-trophy="${trophy.id}" data-type="${trophy.type}" class="trophy-ref" contenteditable="false">${escapeHtml(label || trophy.name || 'Troféu oculto')}</a>`;

export const trophyAnchorId = (id) => `trofeu-${id}`;

// Cartão do troféu no meio do texto (como o TrueAchievements): bloco próprio, entre os parágrafos.
// Guardado só com o id e o nome (o texto que aparece no editor); na leitura vira o cartão completo
// (ícone, descrição, tipo, raridade e se você já tem) com os dados da lista — fillTrophyCard.
export const trophyCardHtml = (trophy) =>
  `<div class="trophy-card" data-trophy-card="${trophy.id}" data-type="${trophy.type}" contenteditable="false">${escapeHtml(trophy.name || 'Troféu oculto')}</div>`;

// Contador no texto ("6/18 Chefes derrotados"): com troféu vira um chip que leva a ele; sem, só a etiqueta.
export function counterHtml({ done, total, label, trophy }) {
  const count = total ? `${done}/${total}` : `${done}`;
  const inner = `<b>${escapeHtml(count)}</b>${label ? ` ${escapeHtml(label)}` : ''}`;
  return trophy
    ? `<a href="#trofeu-${trophy.id}" data-trophy="${trophy.id}" data-type="${trophy.type}" class="trophy-ref trophy-count" contenteditable="false">${inner}</a>`
    : `<span class="count-tag" contenteditable="false">${inner}</span>`;
}

// Botão de controle no texto: guarda a posição genérica (data-key); o desenho sai do CSS no estilo escolhido
// por quem lê (PlayStation ou Xbox). O texto ("Cruz") fica por baixo para busca e leitores de tela.
export const controllerKeyHtml = (key) =>
  `<span class="btn-key" data-key="${key.id}" title="${escapeHtml(key.ps === key.xbox ? key.ps : `${key.ps} / ${key.xbox}`)}" contenteditable="false">${escapeHtml(key.ps)}</span>`;

// Monta o cartão completo dentro do bloco (leitura). DOM com textContent: nada do texto vira HTML.
export function fillTrophyCard(el, trophy, stats) {
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  const type = TROPHY_TYPE_MAP[trophy.type] ?? TROPHY_TYPE_MAP.bronze;
  const icon = make('span', 'trophy-card__icon');
  if (trophy.icon) {
    const img = make('img', '');
    img.src = trophy.icon;
    img.alt = '';
    img.loading = 'lazy';
    icon.append(img);
  }
  const body = make('span', 'trophy-card__body');
  body.append(make('span', 'trophy-card__name', trophy.name || 'Troféu oculto'));
  if (trophy.detail) body.append(make('span', 'trophy-card__detail', trophy.detail));
  const rate = stats?.rate;
  const meta = [type.label, rate != null && `${formatRate(rate)} dos jogadores`, RARITY_LABELS[stats?.rarity], stats?.earned && 'Você tem ✓'];
  body.append(make('span', 'trophy-card__meta', meta.filter(Boolean).join(' · ')));
  if (rate != null) {
    const bar = make('span', 'trophy-card__bar');
    const fill = make('span', '');
    fill.style.width = `${Math.min(100, Math.max(2, rate))}%`;
    bar.append(fill);
    body.append(bar);
  }
  el.replaceChildren(icon, body);
  el.classList.add('is-filled');
  el.classList.toggle('is-earned', !!stats?.earned);
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', `Troféu ${trophy.name}: ver na lista`);
}

// ids dos troféus citados num texto (chip, contador ou cartão; sem repetir)
const REF_PATTERN = /data-trophy(?:-card)?="(\d+)"/g;
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
    acceptNode: (n) => (n.parentElement?.closest('a, code, .count-tag, .trophy-card, .btn-key') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT), // fora de links, contadores e cartões
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
