import { inject, provide } from 'vue';

// --- Contexto: coletáveis do guia para quem está dentro dele (editor de texto, leitura) ---
// { items: ref([{ id, name, region, … }]), byId: ref(Map), collected?: ref(Set), toggle?(id), reset?(), open?(id),
//   types?: ref({ [tipo]: { trophy } }) }
const KEY = Symbol('collectibles');
export const provideCollectibleContext = (ctx) => provide(KEY, ctx);
export const useCollectibleContext = () => inject(KEY, null);

// O progresso pessoal (quais coletáveis a pessoa marcou) fica em usePersonalProgress.
