// HTML do editor (Pell): filtro de segurança, conversão de texto antigo e checagem de vazio.
import { CONTROLLER_KEY_IDS } from '@/config/controllerKeys';

// Tags permitidas → atributos permitidos (com validação do valor). O resto é removido (o texto de dentro é mantido).
const TROPHY_REF = /^#trofeu-\d+$/;
const COLLECTIBLE_REF = /^#coletavel-[a-z0-9]{4,16}$/;
const INTERNAL_REF = (v) => TROPHY_REF.test(v) || COLLECTIBLE_REF.test(v);
const TROPHY_TYPE = (v) => ['platinum', 'gold', 'silver', 'bronze'].includes(v);
const ALLOWED = {
  P: {}, BR: {},
  // Cartão do troféu no texto (<div class="trophy-card" data-trophy-card="12" data-type="gold">)
  DIV: { class: (v) => v === 'trophy-card', 'data-trophy-card': (v) => /^\d+$/.test(v), 'data-type': TROPHY_TYPE, contenteditable: (v) => v === 'false' },
  // Contador sem troféu (<span class="count-tag">5/6 Associados</span>) e botão de controle
  // (<span class="btn-key" data-key="face-down" title="Cruz / A">Cruz</span> — config/controllerKeys)
  SPAN: {
    class: (v) => v === 'count-tag' || v === 'btn-key',
    'data-key': (v) => CONTROLLER_KEY_IDS.has(v),
    title: (v) => v.length <= 60,
    contenteditable: (v) => v === 'false',
  },
  B: {}, STRONG: {}, I: {}, EM: {}, U: {}, S: {}, STRIKE: {}, CODE: {},
  H3: {}, H4: {}, UL: {}, OL: {}, LI: {}, BLOCKQUOTE: {}, HR: {},
  // Link externo, referência a troféu (<a href="#trofeu-12" data-trophy="12" data-type="gold" class="trophy-ref">)
  // ou a coletável (<a href="#coletavel-ab12cd" data-collectible="ab12cd" class="collectible-ref">)
  A: {
    href: (v) => /^(https?:|mailto:)/i.test(v) || INTERNAL_REF(v),
    'data-trophy': (v) => /^\d+$/.test(v),
    'data-type': TROPHY_TYPE,
    'data-collectible': (v) => /^[a-z0-9]{4,16}$/.test(v),
    class: (v) => ['trophy-ref', 'trophy-ref trophy-count', 'collectible-ref'].includes(v), // trophy-count = contador
    contenteditable: (v) => v === 'false',
  },
};
// Títulos grandes colados de sites viram os do guia
const RENAME = { H1: 'H3', H2: 'H3', H5: 'H4', H6: 'H4' };
const DROP_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'svg', 'SVG', 'IMG', 'VIDEO', 'AUDIO']);

function clean(node, doc) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove();
      continue;
    }

    let el = child;
    if (RENAME[el.tagName]) {
      const renamed = doc.createElement(RENAME[el.tagName]);
      renamed.append(...el.childNodes);
      el.replaceWith(renamed);
      el = renamed;
    }

    if (DROP_WITH_CONTENT.has(el.tagName)) {
      el.remove();
      continue;
    }
    if (!(el.tagName in ALLOWED)) {
      clean(el, doc);
      el.replaceWith(...el.childNodes); // remove a tag, mantém o conteúdo
      continue;
    }

    const rules = ALLOWED[el.tagName];
    for (const attr of [...el.attributes]) {
      if (!rules[attr.name]?.(attr.value)) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A') {
      if (!el.hasAttribute('href')) {
        clean(el, doc);
        el.replaceWith(...el.childNodes); // link inseguro vira texto comum
        continue;
      }
      // Referência a troféu/coletável é interna; link externo abre em nova aba
      if (!INTERNAL_REF(el.getAttribute('href'))) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
    clean(el, doc);
  }
}

export function sanitizeHtml(html = '') {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  clean(doc.body, doc);
  // Parágrafos vazios que sobram de listas (o navegador gera <p><ul>…</ul></p>)
  for (const p of doc.body.querySelectorAll('p:empty')) p.remove();
  return doc.body.innerHTML;
}

export const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// O editor sempre grava começando por um bloco (<p>, <h3>, <ul>…); texto antigo não
const looksLikeHtml = (s) => /^\s*<(p|h[1-6]|ul|ol|div|blockquote|hr|br)[\s/>]/i.test(s);

// Texto simples (anotações antigas) → parágrafos HTML. HTML passa direto.
export function textToHtml(text = '') {
  if (!text || looksLikeHtml(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Tem texto de verdade? (o editor deixa "<p><br></p>" quando apagado). Rápido: sem DOMParser.
export const hasRichContent = (html = '') =>
  !!html && html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '').length > 0;

// Texto puro de um HTML (para busca). Rápido: regex, sem montar DOM.
export const htmlToPlain = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
