import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Mudanças feitas no mesmo instante viram UMA navegação (senão a segunda apagaria a primeira)
let pending = null;

function patchQuery(router, patch) {
  if (!pending) {
    pending = {};
    queueMicrotask(() => {
      const query = { ...router.currentRoute.value.query, ...pending };
      pending = null;
      for (const key of Object.keys(query)) if (!query[key]) delete query[key];
      router.replace({ query });
    });
  }
  Object.assign(pending, patch);
}

// Parâmetro da URL como ref (ex.: ?jogo=…&aba=…). Valor vazio remove o parâmetro.
// Usa replace: não enche o histórico a cada mudança.
export function useQueryParam(key, fallback = '') {
  const route = useRoute();
  const router = useRouter();

  return computed({
    get: () => String(route.query[key] ?? fallback),
    set: (value) => patchQuery(router, { [key]: value || '' }),
  });
}
