import { computed } from 'vue';
import { DEFAULT_TAB, GUIDE_TABS } from '@/config/guideTabs';
import { useQueryParam } from './useQueryParam';

// Abas do guia em edição: fixas + opcionais escolhidas pela pessoa.
// Por enquanto o estado vive na URL (?abas=coletaveis,detonado&aba=detonado);
// quando o guia for salvo, a lista de abas passa a vir dele.
export function useGuideTabs() {
  const enabledParam = useQueryParam('abas');
  const activeParam = useQueryParam('aba');

  const enabled = computed(() => new Set(enabledParam.value.split(',').filter(Boolean)));

  const tabs = computed(() => GUIDE_TABS.filter((t) => t.fixed || enabled.value.has(t.id)));
  const available = computed(() => GUIDE_TABS.filter((t) => !t.fixed && !enabled.value.has(t.id)));

  const activeTab = computed(() => tabs.value.find((t) => t.id === activeParam.value) ?? tabs.value[0]);
  const active = computed({
    get: () => activeTab.value.id,
    set: (id) => (activeParam.value = id === DEFAULT_TAB ? '' : id), // aba padrão não polui a URL
  });

  // Grava na ordem da config → a URL fica estável independente da ordem de adição
  const save = (ids) => (enabledParam.value = GUIDE_TABS.filter((t) => ids.has(t.id)).map((t) => t.id).join(','));

  function add(id) {
    save(new Set([...enabled.value, id]));
    active.value = id;
  }

  // Ainda não há conteúdo para perder; quando houver, pedir confirmação aqui
  function remove(id) {
    const index = tabs.value.findIndex((t) => t.id === id);
    const ids = new Set(enabled.value);
    ids.delete(id);
    save(ids);
    if (active.value === id) active.value = tabs.value[index - 1]?.id ?? DEFAULT_TAB; // vai para a aba vizinha
  }

  return { tabs, available, activeTab, active, add, remove };
}
