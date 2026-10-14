import { inject, provide, ref } from 'vue';
import { moveItem } from '@/utils/array';
import { createSection, createStep } from '@/utils/guide';

const KEY = Symbol('guide-draft');

// Dono do rascunho do editor. Os filhos pegam as ações via inject (sem prop drilling)
export function provideGuideDraft(initial) {
  const draft = ref(initial);
  const sectionOf = (sectionId) => draft.value.sections.find((s) => s.id === sectionId);

  const api = {
    draft,
    addSection() {
      draft.value.sections.push(createSection());
    },
    removeSection(sectionId) {
      draft.value.sections = draft.value.sections.filter((s) => s.id !== sectionId);
    },
    moveSection(index, dir) {
      moveItem(draft.value.sections, index, index + dir);
    },
    addStep(sectionId, afterIndex = null) {
      const steps = sectionOf(sectionId).steps;
      const step = createStep();
      afterIndex === null ? steps.push(step) : steps.splice(afterIndex + 1, 0, step);
      return step.id;
    },
    removeStep(sectionId, stepId) {
      const section = sectionOf(sectionId);
      section.steps = section.steps.filter((st) => st.id !== stepId);
    },
    moveStep(sectionId, index, dir) {
      moveItem(sectionOf(sectionId).steps, index, index + dir);
    },
  };

  provide(KEY, api);
  return api;
}

export const useGuideDraft = () => inject(KEY);
