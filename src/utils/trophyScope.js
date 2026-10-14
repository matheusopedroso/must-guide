// Recorte da lista de troféus da PSN para um guia:
// - guia de DLC → só o grupo da DLC (nome e ícone do grupo);
// - guia do jogo com DLCs na lista → só o jogo base (as DLCs têm guia próprio);
// - lista sem DLC → inteira.
export const BASE_GROUP = 'default';

export const dlcGroupsOf = (list) => (list?.groups ?? []).filter((g) => g.id !== BASE_GROUP);

export function scopeList(list, guide) {
  if (!list) return null;
  const groupId = guide?.dlc?.groupId ?? (dlcGroupsOf(list).length ? BASE_GROUP : null);
  if (!groupId) return list;
  const group = list.groups.find((g) => g.id === groupId);
  const trophies = list.trophies.filter((t) => t.groupId === groupId);
  const isDlc = groupId !== BASE_GROUP;
  return {
    ...list,
    name: isDlc ? group?.name || list.name : list.name,
    icon: (isDlc && group?.icon) || list.icon,
    groups: group ? [group] : [],
    trophies,
    counts: group?.counts ?? {},
    scope: groupId,
  };
}

// Progresso da conta só com os troféus do recorte
export function scopeProgress(progress, list) {
  if (!progress || !list) return progress;
  const earned = list.trophies.filter((t) => progress.trophies[t.id]?.earned).length;
  return { ...progress, earned, total: list.trophies.length };
}
