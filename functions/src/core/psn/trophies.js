import { httpError } from '../http.js';

const mapCounts = (c = {}) => ({
  platinum: c.platinum ?? 0,
  gold: c.gold ?? 0,
  silver: c.silver ?? 0,
  bronze: c.bronze ?? 0,
});

const mapTitle = (t) => ({
  id: t.npCommunicationId,
  name: t.trophyTitleName,
  icon: t.trophyTitleIconUrl ?? null,
  platform: t.trophyTitlePlatform ?? '',
  service: t.npServiceName,
  counts: mapCounts(t.definedTrophies),
  progress: t.progress ?? 0,
});

export const NP_ID_PATTERN = /^NPWR\d{5}_\d{2}$/;

// Consultas de troféus sobre o cliente autenticado
export function createTrophyService(client) {
  // Jogos com troféus da conta do NPSSO (mais recentes primeiro; máx. 800 por chamada)
  async function userTitles() {
    const data = await client.get('/users/me/trophyTitles', { limit: 800 });
    return data.trophyTitles.map(mapTitle);
  }

  // PS3/PS4/Vita exigem npServiceName=trophy; PS5 usa trophy2.
  // Sem saber a plataforma, tenta "trophy" e cai para "trophy2" se a PSN não achar.
  async function withService(service, load) {
    if (service) return { service, data: await load(service) };
    try {
      return { service: 'trophy', data: await load('trophy') };
    } catch (e) {
      if (e.status !== 404) throw e;
      return { service: 'trophy2', data: await load('trophy2') };
    }
  }

  async function trophyList(npId, service) {
    if (!NP_ID_PATTERN.test(npId)) throw httpError(400, 'Código inválido. Formato: NPWR12345_00.');

    // Grupos (nomes, ícones, contagem) e troféus de todos os grupos: 2 chamadas em paralelo
    const loadAll = (svc) =>
      Promise.all([
        client.get(`/npCommunicationIds/${npId}/trophyGroups`, { npServiceName: svc }),
        client.get(`/npCommunicationIds/${npId}/trophyGroups/all/trophies`, { npServiceName: svc }),
      ]);

    const { service: resolved, data } = await withService(service, loadAll);
    const [groupsRes, trophiesRes] = data;

    return {
      id: npId,
      name: groupsRes.trophyTitleName,
      icon: groupsRes.trophyTitleIconUrl ?? null,
      platform: groupsRes.trophyTitlePlatform ?? '',
      service: resolved,
      counts: mapCounts(groupsRes.definedTrophies),
      groups: groupsRes.trophyGroups.map((g) => ({
        id: g.trophyGroupId,
        name: g.trophyGroupName,
        icon: g.trophyGroupIconUrl ?? null,
        counts: mapCounts(g.definedTrophies),
      })),
      trophies: trophiesRes.trophies.map((t) => ({
        id: t.trophyId,
        groupId: t.trophyGroupId,
        type: t.trophyType,
        name: t.trophyName ?? '',
        detail: t.trophyDetail ?? '',
        icon: t.trophyIconUrl ?? null,
        hidden: !!t.trophyHidden,
      })),
    };
  }

  return { userTitles, trophyList };
}
