import { sectionTabsOf } from '@/config/guideTabs';
import { TROPHY_TYPE_MAP } from '@/config/trophies';
import { filledPages, pageName } from './pages';
import { filledSections, sectionLabel } from './sections';
import { htmlToPlain } from './html';

// Busca dentro de um guia (leitura): texto das seções de todas as abas (e páginas), troféus (nome PT/EN,
// descrição, dica, capítulo) e coletáveis (nome, tipo, local, descrição). Sem acento e sem maiúsculas.

// Sem acento e minúsculo, letra a letra (mantém as posições: o trecho destacado bate com o texto original)
const foldChar = (c) => {
  const f = c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return f.length === 1 ? f : c.toLowerCase();
};
export const fold = (s = '') => Array.from(s, foldChar).join('');

// Monta o índice uma vez por guia (a busca em si só percorre a lista)
// → [{ kind: 'section'|'trophy'|'collectible', id, title, where, text, target }]
export function buildSearchIndex({ guide, trophies = [], getNote = () => ({}) }) {
  const entries = [];
  for (const tab of sectionTabsOf(guide)) {
    const cfg = tab.sections;
    const pages = cfg.paged ? filledPages(guide, cfg.key) : [{ sections: filledSections(guide, cfg.key) }];
    pages.forEach((page, pi) =>
      page.sections.forEach((s, si) => {
        entries.push({
          kind: 'section',
          id: s.id,
          title: sectionLabel(s, si, cfg),
          where: [tab.label, cfg.paged ? pageName(page, pi) : ''].filter(Boolean).join(' · '),
          text: htmlToPlain(s.body),
          target: { query: { aba: tab.id, ...(cfg.paged && pi > 0 && { pagina: String(pi + 1) }) }, hash: `#secao-${s.id}` },
        });
        for (const item of s.items ?? []) {
          entries.push({
            kind: 'collectible',
            id: item.id,
            title: item.name || 'Coletável',
            where: ['Coletável', s.title.trim()].filter(Boolean).join(' · '),
            text: [item.type, item.location, item.description].filter(Boolean).join(' · '),
          });
        }
      }),
    );
  }
  for (const t of trophies) {
    const note = getNote(t.id) ?? {};
    entries.push({
      kind: 'trophy',
      id: t.id,
      title: t.name || 'Troféu oculto',
      where: `Troféu · ${(TROPHY_TYPE_MAP[t.type] ?? TROPHY_TYPE_MAP.bronze).label}`,
      text: [t.nameEn, t.detail, htmlToPlain(note.tip ?? ''), note.chapter].filter(Boolean).join(' · '),
    });
  }
  return entries.map((e) => ({ ...e, foldedTitle: fold(e.title), foldedText: fold(e.text) }));
}

const SNIPPET_BEFORE = 40;
const SNIPPET_AFTER = 80;

// Trecho em volta do termo, já separado para destacar sem HTML: { before, match, after }
// (corta nos espaços para não começar nem terminar no meio de uma palavra)
function snippetAt(text, index, length) {
  let start = Math.max(0, index - SNIPPET_BEFORE);
  let end = Math.min(text.length, index + length + SNIPPET_AFTER);
  if (start > 0) {
    const space = text.indexOf(' ', start);
    if (space > -1 && space < index) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space > index + length) end = space;
  }
  return {
    before: `${start > 0 ? '…' : ''}${text.slice(start, index)}`,
    match: text.slice(index, index + length),
    after: `${text.slice(index + length, end)}${end < text.length ? '…' : ''}`,
  };
}

// → [{ ...entrada, score, snippet }] (título que começa com o termo > título que contém > só no texto)
export function searchGuide(index, term, limit = 40) {
  const t = fold(term.trim());
  if (t.length < 2) return [];
  const results = [];
  for (const e of index) {
    const inTitle = e.foldedTitle.indexOf(t);
    const inText = e.foldedText.indexOf(t);
    if (inTitle < 0 && inText < 0) continue;
    results.push({
      ...e,
      score: inTitle === 0 ? 3 : inTitle > 0 ? 2 : 1,
      titleHit: inTitle >= 0 ? snippetAt(e.title, inTitle, t.length) : null,
      snippet: inText >= 0 ? snippetAt(e.text, inText, t.length) : null,
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
