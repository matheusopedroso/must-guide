import { hasRichContent } from './html';

// Etapa do roadmap: título ("Jogada da história"), texto corrido (HTML do editor, cita troféus)
// e os troféus que saem nela (ids, na ordem escolhida).
export const createStage = () => ({
  id: Math.random().toString(36).slice(2, 10),
  title: '',
  body: '',
  trophies: [],
});

export const stageHasContent = (s) => !!(s.title.trim() || hasRichContent(s.body) || s.trophies.length);

// Rótulo da etapa: "Etapa 2: Jogada da história" (ou só "Etapa 2")
export const stageLabel = (s, index) => `Etapa ${index + 1}${s.title.trim() ? `: ${s.title.trim()}` : ''}`;
