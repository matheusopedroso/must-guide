import { inject, provide } from 'vue';
import { useRoute } from 'vue-router';

// Leitura → editor já no ponto certo (lápis em cada seção e coletável, para quem pode editar):
// seção → mesma aba e página no editor, rolando até ela (#secao-…); coletável → aba Coletáveis com a
// janela dele aberta (?coletavel=…). Sem permissão de editar, os links são null (o lápis não aparece).
const KEY = Symbol('edit-links');

export function provideEditLinks(canEdit, guideId) {
  const route = useRoute();
  const base = (query) => ({ name: 'guide-edit', params: { id: guideId.value }, query });

  provide(KEY, {
    section: (sectionId) =>
      canEdit.value
        ? { ...base({ aba: route.query.aba, ...(route.query.pagina && { pagina: route.query.pagina }) }), hash: `#secao-${sectionId}` }
        : null,
    collectible: (item) =>
      canEdit.value
        ? { ...base({ aba: 'coletaveis', coletavel: item.id }), ...(item.regionId && { hash: `#secao-${item.regionId}` }) }
        : null,
  });
}

export const useEditLinks = () => inject(KEY, null);
