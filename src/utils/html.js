// HTML do editor (Pell): filtro de segurança, conversão de texto antigo e checagem de vazio.

// Tags permitidas → atributos permitidos. O resto é removido (o texto de dentro é mantido).
const ALLOWED = {
  P: [], BR: [], DIV: [], SPAN: [],
  B: [], STRONG: [], I: [], EM: [], U: [], S: [], STRIKE: [], CODE: [],
  H3: [], H4: [], UL: [], OL: [], LI: [], BLOCKQUOTE: [], HR: [],
  A: ['href'],
};
// Títulos grandes colados de sites viram os do guia
const RENAME = { H1: 'H3', H2: 'H3', H5: 'H4', H6: 'H4' };
const DROP_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'svg', 'SVG', 'IMG', 'VIDEO', 'AUDIO']);
const SAFE_URL = /^(https?:|mailto:)/i;

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

    for (const attr of [...el.attributes]) {
      if (!ALLOWED[el.tagName].includes(attr.name)) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A') {
      if (!SAFE_URL.test(el.getAttribute('href') ?? '')) {
        clean(el, doc);
        el.replaceWith(...el.childNodes); // link inseguro vira texto comum
        continue;
      }
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
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

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
