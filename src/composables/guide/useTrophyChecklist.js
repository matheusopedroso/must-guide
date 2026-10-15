import { inject, provide } from 'vue';

// Checklist de troféus de quem lê o guia (só na leitura; o editor não provê).
// { checked: ref(Set), toggle(id), isDone(id) (marcado OU conquistado na PSN), isEarned(id) }
const KEY = Symbol('trophy-checklist');
export const provideTrophyChecklist = (ctx) => provide(KEY, ctx);
export const useTrophyChecklist = () => inject(KEY, null);

// Feitos de uma lista de ids → { done, total }
export const countDone = (ids, isDone) => ({ done: ids.filter(isDone).length, total: ids.length });
