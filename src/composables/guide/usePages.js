import { computed } from 'vue';
import { createPage } from '@/utils/pages';
import { useQueryParam } from '@/composables/useQueryParam';

// Páginas de uma aba paginada no rascunho (cfg.paged): página aberta na URL (?pagina=2, a 1ª fica sem),
// criar, renomear, reordenar, remover e mandar uma seção para outra página.
export function usePages(draft, key) {
  const pages = computed(() => draft.value?.[key] ?? []);
  const param = useQueryParam('pagina');

  const index = computed({
    get: () => Math.min(Math.max(Number(param.value) - 1 || 0, 0), Math.max(pages.value.length - 1, 0)),
    set: (i) => (param.value = i > 0 ? String(i + 1) : ''),
  });
  const current = computed(() => pages.value[index.value] ?? null);

  function add() {
    if (!draft.value) return;
    draft.value[key] ??= [];
    draft.value[key].push(createPage());
    index.value = draft.value[key].length - 1;
  }

  const rename = (title) => current.value && (current.value.title = title);

  // dir: -1 = para trás, +1 = para frente (a página continua aberta)
  function move(dir) {
    const list = draft.value?.[key];
    const i = index.value;
    const j = i + dir;
    if (!list || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    index.value = j;
  }

  function remove() {
    const page = current.value;
    if (!page) return;
    draft.value[key] = pages.value.filter((p) => p !== page);
    index.value = Math.max(0, index.value - 1);
  }

  // Leva a seção da página aberta para o fim de outra página
  function moveSection(sectionId, toIndex) {
    const from = current.value;
    const to = pages.value[toIndex];
    const section = from?.sections.find((s) => s.id === sectionId);
    if (!section || !to || to === from) return;
    from.sections = from.sections.filter((s) => s.id !== sectionId);
    to.sections.push(section);
  }

  // Todas as seções da aba (troféus já cobertos em alguma página)
  const allSections = computed(() => pages.value.flatMap((p) => p.sections));

  return { pages, index, current, add, rename, move, remove, moveSection, allSections };
}
