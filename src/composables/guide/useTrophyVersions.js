import { computed, ref, watch } from 'vue';

// Versões do jogo na PSN (ex.: PS4 e PS5) ligadas ao mesmo guia. A primeira é a principal.
export function useTrophyVersions(draft) {
  const versions = computed(() => draft.value?.versions ?? []);
  const activeId = ref(versions.value[0]?.id ?? null);

  // Se a versão aberta sumir (removida / outro jogo), abre a principal
  watch(versions, (list) => {
    if (!list.some((v) => v.id === activeId.value)) activeId.value = list[0]?.id ?? null;
  });

  const principal = computed(() => versions.value[0] ?? null);
  const active = computed(() => versions.value.find((v) => v.id === activeId.value) ?? principal.value);

  function add(title) {
    if (!draft.value || versions.value.some((v) => v.id === title.id)) return;
    draft.value.versions.push({ id: title.id, name: title.name, platform: title.platform, service: title.service });
    activeId.value = title.id;
  }

  // Atualiza nome/plataforma/serviço quando a lista carrega (ex.: código colado à mão)
  function sync(list) {
    const v = draft.value?.versions.find((x) => x.id === list.id);
    if (v && (v.name !== list.name || v.platform !== list.platform || v.service !== list.service)) {
      Object.assign(v, { name: list.name, platform: list.platform, service: list.service });
    }
  }

  function remove(id) {
    if (draft.value) draft.value.versions = draft.value.versions.filter((v) => v.id !== id);
  }

  function makePrincipal(id) {
    if (!draft.value) return;
    const list = draft.value.versions;
    const i = list.findIndex((v) => v.id === id);
    if (i > 0) list.unshift(...list.splice(i, 1));
  }

  return { versions, principal, active, activeId, add, sync, remove, makePrincipal };
}
