import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Parâmetro da URL como ref (ex.: ?jogo=…&aba=…). Valor vazio remove o parâmetro.
// Usa replace: não enche o histórico a cada mudança.
export function useQueryParam(key, fallback = '') {
  const route = useRoute();
  const router = useRouter();

  return computed({
    get: () => String(route.query[key] ?? fallback),
    set: (value) => {
      if (String(route.query[key] ?? '') === String(value ?? '')) return;
      router.replace({ query: { ...route.query, [key]: value || undefined } });
    },
  });
}
