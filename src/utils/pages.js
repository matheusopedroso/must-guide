import { createSection, sectionHasContent, uid } from './sections';

// Abas paginadas (cfg.paged — ex.: Guia, como os guias do IGN e do TrueAchievements): a aba é uma lista de
// páginas e cada página tem as suas seções (mesmo formato das outras abas: utils/sections).
// Formato: [{ id, title, sections: [{ id, title, body, trophies }] }]

// Página nova já com uma seção vazia (o editor abre pronto para escrever)
export const createPage = (title = '') => ({ id: uid(), title, sections: [createSection()] });

const isPaged = (list) => list.every((p) => Array.isArray(p?.sections));

// Formato antigo (seções soltas, antes da paginação) → uma página com todas elas
export const toPages = (list = []) => (!list.length || isPaged(list) ? list : [{ id: uid(), title: '', sections: list }]);

// "Página 2: Antes de começar" · sem título: "Página 2"
export const pageLabel = (page, index) => `Página ${index + 1}${page.title?.trim() ? `: ${page.title.trim()}` : ''}`;
export const pageName = (page, index) => page.title?.trim() || `Página ${index + 1}`;

// Leitura: só as páginas com alguma seção preenchida (e, nelas, só as seções preenchidas)
export const filledPages = (guide, key) =>
  toPages(guide?.[key] ?? [])
    .map((p) => ({ ...p, sections: p.sections.filter(sectionHasContent) }))
    .filter((p) => p.sections.length);

export const pageHasContent = (p) => !!p.title?.trim() || p.sections.some(sectionHasContent);
