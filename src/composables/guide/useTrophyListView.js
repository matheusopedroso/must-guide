import { computed, ref } from 'vue';
import { TROPHY_FLAGS, TROPHY_TYPES } from '@/config/trophies';
import { hasRichContent, htmlToPlain } from '@/utils/html';
import { normalizeName } from '@/utils/text';
import { useStoredRef } from '@/composables/useStoredRef';

const TYPE_ORDER = Object.fromEntries(TROPHY_TYPES.map((t, i) => [t.id, i]));

// Filtros (chips). test(trophy, note, stats)
const FILTERS = [
  { id: 'all', label: 'Todos', test: () => true },
  ...TROPHY_TYPES.map((t) => ({ id: t.id, label: t.label, test: (tr) => tr.type === t.id })),
  ...TROPHY_FLAGS.map((f) => ({ id: f.id, label: f.label, test: (tr, note) => note[f.id] })),
  { id: 'tip', label: 'Com explicação', test: (tr, note) => hasRichContent(note.tip) },
  { id: 'notip', label: 'Sem explicação', test: (tr, note) => !hasRichContent(note.tip) },
  { id: 'pending', label: 'Faltam', needsProgress: true, test: (tr, note, stats) => stats && !stats.earned },
];

// Ordenações. compare(a, b, ctx) com ctx = { note(id), stats(id) }; empate mantém a ordem da PSN
const SORTS = [
  { id: 'default', label: 'Ordem da PSN' },
  { id: 'type', label: 'Tipo (platina → bronze)', compare: (a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] },
  {
    id: 'rarity',
    label: 'Mais raros primeiro',
    needsProgress: true,
    compare: (a, b, c) => (c.stats(a.id)?.rate ?? 101) - (c.stats(b.id)?.rate ?? 101),
  },
  {
    id: 'pending',
    label: 'Faltam primeiro',
    needsProgress: true,
    compare: (a, b, c) => Number(!!c.stats(a.id)?.earned) - Number(!!c.stats(b.id)?.earned),
  },
  {
    id: 'difficulty',
    label: 'Mais difíceis primeiro',
    compare: (a, b, c) => c.note(b.id).difficulty - c.note(a.id).difficulty,
  },
];

// Estado e cálculo da lista de troféus: busca, filtro, ordenação e agrupamento (jogo base / DLCs).
// list, progress: refs · getNote(id): anotação do guia
export function useTrophyListView({ list, progress, getNote }) {
  const search = ref('');
  const filter = ref('all');
  const sort = useStoredRef('mg:trophy-sort', 'default'); // preferência pessoal

  const stats = (id) => progress.value?.trophies[id] ?? null;
  const ctx = { note: getNote, stats };

  const available = (items) => items.filter((x) => !x.needsProgress || progress.value);
  const sorts = computed(() => available(SORTS));
  const activeSort = computed(() => sorts.value.find((s) => s.id === sort.value) ?? SORTS[0]);

  // Texto fixo de cada troféu (nome em PT e EN + descrição) normalizado uma vez por lista
  const baseText = computed(
    () => new Map(list.value.trophies.map((t) => [t.id, normalizeName(`${t.name} ${t.nameEn ?? ''} ${t.detail}`)])),
  );

  const query = computed(() => normalizeName(search.value));
  const matches = (t) => {
    if (!query.value) return true;
    if (baseText.value.get(t.id).includes(query.value)) return true;
    const note = getNote(t.id); // também acha pelo capítulo e pelo "Como conseguir"
    return normalizeName(`${note.chapter} ${htmlToPlain(note.tip)}`).includes(query.value);
  };

  // Contagem dos filtros sobre a lista toda (sem a busca), escondendo os vazios
  const filters = computed(() =>
    available(FILTERS)
      .map((f) => ({ ...f, count: list.value.trophies.filter((t) => f.test(t, getNote(t.id), stats(t.id))).length }))
      .filter((f) => f.id === 'all' || f.count),
  );

  const sections = computed(() => {
    const f = FILTERS.find((x) => x.id === filter.value) ?? FILTERS[0];
    const groups = new Map(list.value.groups.map((g) => [g.id, { ...g, trophies: [] }]));
    for (const t of list.value.trophies) {
      if (matches(t) && f.test(t, getNote(t.id), stats(t.id))) groups.get(t.groupId)?.trophies.push(t);
    }
    const compare = activeSort.value.compare;
    const result = [...groups.values()].filter((g) => g.trophies.length);
    if (compare) for (const g of result) g.trophies.sort((a, b) => compare(a, b, ctx)); // sort é estável
    return result;
  });

  const visibleCount = computed(() => sections.value.reduce((n, g) => n + g.trophies.length, 0));

  // Mostrar tudo de novo (ex.: ir até um troféu citado que estava escondido pelo filtro/busca)
  function reset() {
    filter.value = 'all';
    search.value = '';
  }

  return { search, filter, sort, sorts, filters, sections, visibleCount, stats, reset };
}
