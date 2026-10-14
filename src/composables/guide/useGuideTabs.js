import { computed } from 'vue';
import { DEFAULT_TAB, GUIDE_TABS } from '@/config/guideTabs';
import { useQueryParam } from '@/composables/useQueryParam';

// Abas do guia: fixas + opcionais ativadas no rascunho. A aba aberta fica na URL (?aba=).
// Guia de DLC não tem as abas só de jogo (gameOnly: a aba DLCs).
export function useGuideTabs(draft) {
  const activeParam = useQueryParam('aba');

  const enabled = computed(() => new Set(draft.value?.tabs ?? []));
  const allowed = computed(() => GUIDE_TABS.filter((t) => !(t.gameOnly && draft.value?.dlc)));

  const tabs = computed(() => allowed.value.filter((t) => t.fixed || enabled.value.has(t.id)));
  const available = computed(() => allowed.value.filter((t) => !t.fixed && !enabled.value.has(t.id)));

  const activeTab = computed(() => tabs.value.find((t) => t.id === activeParam.value) ?? tabs.value[0]);
  const active = computed({
    get: () => activeTab.value.id,
    set: (id) => (activeParam.value = id === DEFAULT_TAB ? '' : id), // aba padrão não polui a URL
  });

  // Grava na ordem da config → a ordem na barra é sempre a mesma
  const save = (ids) => {
    if (draft.value) draft.value.tabs = GUIDE_TABS.filter((t) => ids.has(t.id)).map((t) => t.id);
  };

  function add(id) {
    save(new Set([...enabled.value, id]));
    active.value = id;
  }

  // Ainda não há conteúdo nas opcionais; quando houver, pedir confirmação aqui
  function remove(id) {
    const index = tabs.value.findIndex((t) => t.id === id);
    const ids = new Set(enabled.value);
    ids.delete(id);
    save(ids);
    if (active.value === id) active.value = tabs.value[index - 1]?.id ?? DEFAULT_TAB; // vai para a aba vizinha
  }

  return { tabs, available, activeTab, active, add, remove };
}
