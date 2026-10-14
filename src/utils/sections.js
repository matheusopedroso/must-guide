import { hasRichContent } from './html';

// Seções das abas de texto (Guia, Roadmap…): título, texto corrido (HTML do editor, cita troféus)
// e os troféus da seção (ids, na ordem escolhida). Cada aba guarda a sua lista no rascunho
// (config/guideTabs → sections.key: 'guide', 'roadmap').
export const createSection = () => ({
  id: Math.random().toString(36).slice(2, 10),
  title: '',
  body: '',
  trophies: [],
});

export const sectionHasContent = (s) => !!(s.title.trim() || hasRichContent(s.body) || s.trophies.length);

// Rótulo: numerado ("Etapa 2: Jogada da história") ou só o título ("Introdução")
export function sectionLabel(s, index, cfg) {
  const title = s.title.trim();
  if (!cfg.numbered) return title || `${cfg.unit} ${index + 1}`;
  return `${cfg.unit} ${index + 1}${title ? `: ${title}` : ''}`;
}

// Seções preenchidas de uma aba no guia (a leitura só mostra estas)
export const filledSections = (guide, key) => (guide?.[key] ?? []).filter(sectionHasContent);
