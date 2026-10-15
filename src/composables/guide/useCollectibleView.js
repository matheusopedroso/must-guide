import { computed, ref } from 'vue';
import { useCollectibleContext } from './useCollectibles';
import { useStoredRef } from '@/composables/useStoredRef';
import { useQueryParam } from '@/composables/useQueryParam';
import { groupCollectibles, matchesFilter, summarizeByType } from '@/utils/collectibles';

// Leitura da aba Coletáveis: progresso (geral, por tipo e por região), filtro (tipo ou perdíveis),
// "Esconder coletados" e modo compacto (os dois guardados no navegador). sections: ref das regiões preenchidas.
// Os itens vêm do contexto (já com o número por tipo: "Artefato #4"); sem contexto, os da própria seção.
export function useCollectibleView(sections) {
  const col = useCollectibleContext();
  const isDone = (id) => !!col?.collected?.value.has(id);
  const hideDone = useStoredRef('mg:hide-collected', false);
  const compact = useStoredRef('mg:collectibles-compact', false);
  // Filtro: '' · 'missable' · 'type:<tipo>'. Vindo da página do troféu (?tipo=Artefato) já abre filtrado
  const tipo = useQueryParam('tipo');
  const filter = ref(tipo.value ? `type:${tipo.value}` : '');
  if (tipo.value) tipo.value = '';

  const full = (it) => col?.byId.value.get(it.id) ?? it;
  const itemsOf = (s) => (s.items ?? []).map(full);
  const all = computed(() => sections.value.flatMap(itemsOf));

  const countOf = (list) => ({ done: list.filter((i) => isDone(i.id)).length, total: list.length });
  const overall = computed(() => countOf(all.value));
  const byType = computed(() => summarizeByType(all.value, isDone));
  const missable = computed(() => all.value.filter((i) => i.missable).length);

  // Cartões visíveis de uma região: grupos (vários no mesmo lugar = um cartão). Entra se algum do grupo bate
  // com o filtro e, com "Esconder coletados", se ainda falta algum
  const shown = (s) =>
    groupCollectibles(itemsOf(s)).filter(
      (g) => g.some((it) => matchesFilter(it, filter.value)) && !(hideDone.value && g.every((it) => isDone(it.id))),
    );
  // Próximo que falta (na ordem do guia, respeitando o filtro) → id ou null
  const nextMissing = () => all.value.find((it) => !isDone(it.id) && matchesFilter(it, filter.value))?.id ?? null;
  const regionCount = (s) => countOf(itemsOf(s));
  const regionTypes = (s) => summarizeByType(itemsOf(s), isDone);

  return { col, isDone, hideDone, compact, filter, overall, byType, missable, itemsOf, shown, nextMissing, regionCount, regionTypes };
}
