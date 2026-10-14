import { inject, provide } from 'vue';

const KEY = Symbol('trophy-context');

// Dados da lista de troféus aberta para quem está dentro dela (ex.: editor do "Como conseguir"):
// trophies (ref) → para referenciar · goTo(id) → rolar até um troféu e destacá-lo
export const provideTrophyContext = (ctx) => provide(KEY, ctx);
export const useTrophyContext = () => inject(KEY, null);
