import { toRaw } from 'vue';
import { uid } from './id';
import { toGuideGame } from './game';

export const createStep = () => ({ id: uid(), text: '', trophy: '', missable: false });

export const createSection = (title = '') => ({ id: uid(), title, steps: [createStep()] });

export const createGuide = (game) => ({
  id: null,
  gameId: game.id,
  game: toGuideGame(game),
  title: `Guia de troféus — ${game.title}`,
  summary: '',
  difficulty: 5,
  hours: null,
  playthroughs: 1,
  hasOnline: false,
  hasMissables: false,
  status: 'draft',
  sections: [createSection('Visão geral')],
});

// Cópia profunda editável (o rascunho nunca mexe no objeto do cache)
export const cloneGuide = (guide) => structuredClone(toRaw(guide));

// Limpa o rascunho antes de salvar e pré-calcula totais para as listas
export function cleanGuide(draft) {
  const sections = draft.sections
    .map((s) => ({
      id: s.id,
      title: s.title.trim(),
      steps: s.steps
        .map((st) => ({ id: st.id, text: st.text.trim(), trophy: st.trophy.trim(), missable: !!st.missable }))
        .filter((st) => st.text || st.trophy),
    }))
    .filter((s) => s.title || s.steps.length);

  const stepCount = sections.reduce((n, s) => n + s.steps.length, 0);

  const num = (v, min, max) => {
    const n = Number(v);
    return v === '' || v === null || Number.isNaN(n) ? null : Math.min(Math.max(Math.round(n), min), max);
  };

  return {
    ...draft,
    title: draft.title.trim(),
    difficulty: num(draft.difficulty, 1, 10),
    hours: num(draft.hours, 0, 9999),
    playthroughs: num(draft.playthroughs, 1, 99) ?? 1,
    summary: draft.summary.trim(),
    hasMissables: draft.hasMissables || sections.some((s) => s.steps.some((st) => st.missable)),
    sections,
    stepCount,
  };
}

export const sectionDone = (section, done) => section.steps.filter((st) => done[st.id]).length;
