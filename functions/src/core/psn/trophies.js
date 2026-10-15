import { httpError } from '../http.js';
import { matchScore } from '../text.js';

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

const PAGE = 800; // máximo da PSN por chamada de trophyTitles

// Busca automática: listas cujo nome combina com o termo, em vários acervos (sua conta + perfis de referência).
// sources: [{ name, titles }] → [{ ...title, score, sources: [nomes] }], melhores primeiro (plataforma pedida
// desempata), sem repetir o mesmo NPWR. min: pontuação mínima (matchScore: 100 igual · 80 começa · 60 contém).
export function searchTitles(sources, term, { platform = '', limit = 12, min = 60 } = {}) {
  const byId = new Map();
  for (const { name, titles } of sources) {
    for (const t of titles) {
      const hit = byId.get(t.id);
      if (hit) {
        if (!hit.sources.includes(name)) hit.sources.push(name);
        continue;
      }
      const score = matchScore(t.name, term);
      if (score >= min) byId.set(t.id, { ...t, progress: undefined, score, sources: [name] });
    }
  }
  const wanted = platform.toUpperCase();
  const bonus = (t) => (wanted && t.platform.toUpperCase().includes(wanted) ? 1 : 0);
  return [...byId.values()].sort((a, b) => b.score - a.score || bonus(b) - bonus(a)).slice(0, limit);
}

export const NP_ID_PATTERN = /^NPWR\d{5}_\d{2}$/;
export const ONLINE_ID_PATTERN = /^[A-Za-z][\w-]{2,15}$/; // ID da PSN: 3–16, letras, números, - e _

const avatarOf = (urls = []) => (urls.find((a) => a.size === 'm') ?? urls[0])?.avatarUrl ?? null;

// Consultas de troféus sobre o cliente autenticado
export function createTrophyService(client) {
  // Jogos com troféus de uma conta (mais recentes primeiro; máx. 800 por chamada)
  const titlesOf = async (accountId) => (await client.get(`/users/${accountId}/trophyTitles`, { limit: 800 })).trophyTitles.map(mapTitle);
  const userTitles = () => titlesOf('me');

  // Todos os jogos de uma conta (perfis com milhares de jogos): 1ª página diz o total, o resto vem em paralelo (4 por vez)
  async function allTitlesOf(accountId) {
    const path = `/users/${accountId}/trophyTitles`;
    const first = await client.get(path, { limit: PAGE, offset: 0 });
    const total = first.totalItemCount ?? first.trophyTitles.length;
    const offsets = [];
    for (let o = PAGE; o < total; o += PAGE) offsets.push(o);
    const pages = [first];
    for (let i = 0; i < offsets.length; i += 4) {
      pages.push(...(await Promise.all(offsets.slice(i, i + 4).map((offset) => client.get(path, { limit: PAGE, offset })))));
    }
    return pages.flatMap((p) => p.trophyTitles ?? []).map(mapTitle);
  }

  // Todos os jogos de um perfil público pelo ID da PSN (perfis de referência da busca automática)
  async function playerAllTitles(onlineId) {
    if (!ONLINE_ID_PATTERN.test(onlineId)) throw httpError(400, 'ID da PSN inválido.');
    const { profile } = await client.profile(onlineId);
    return allTitlesOf(profile.accountId);
  }

  // Jogos de outra pessoa pelo ID da PSN: serve para achar o código (NPWR) de um jogo que a conta do
  // NPSSO ainda não tem — a PSN só mostra o código para quem já jogou. Precisa de perfil com troféus públicos.
  async function playerTitles(onlineId) {
    if (!ONLINE_ID_PATTERN.test(onlineId)) throw httpError(400, 'ID da PSN inválido.');
    let profile;
    try {
      ({ profile } = await client.profile(onlineId));
    } catch (e) {
      if (e.status === 404) throw httpError(404, `Não achei o perfil “${onlineId}” na PSN.`);
      throw e;
    }
    let titles;
    try {
      titles = await titlesOf(profile.accountId);
    } catch (e) {
      if (e.status === 403 || e.status === 404) throw httpError(403, `Os troféus de “${profile.onlineId}” não são públicos. Tente outro perfil.`);
      throw e;
    }
    return { player: { onlineId: profile.onlineId, avatar: avatarOf(profile.avatarUrls) }, titles };
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

    // Grupos (nomes, ícones, contagem), troféus em português e troféus em inglês (só para os nomes):
    // 3 chamadas em paralelo — a lista fica 24 h em cache, então isso acontece raramente
    const trophiesPath = `/npCommunicationIds/${npId}/trophyGroups/all/trophies`;
    const loadAll = (svc) =>
      Promise.all([
        client.get(`/npCommunicationIds/${npId}/trophyGroups`, { npServiceName: svc }),
        client.get(trophiesPath, { npServiceName: svc }),
        client.get(trophiesPath, { npServiceName: svc }, { language: 'en-US' }).catch(() => null), // opcional
      ]);

    const { service: resolved, data } = await withService(service, loadAll);
    const [groupsRes, trophiesRes, trophiesEn] = data;
    const namesEn = new Map((trophiesEn?.trophies ?? []).map((t) => [t.trophyId, t.trophyName ?? '']));

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
        nameEn: namesEn.get(t.trophyId) ?? '', // nome original em inglês (busca e referência a guias gringos)
        detail: t.trophyDetail ?? '',
        icon: t.trophyIconUrl ?? null,
        hidden: !!t.trophyHidden,
        target: t.trophyProgressTargetValue ? Number(t.trophyProgressTargetValue) : null, // "colete 50" (PS5)
        reward: t.trophyRewardName ? { name: t.trophyRewardName, image: t.trophyRewardImageUrl ?? null } : null,
      })),
    };
  }

  // Progresso da conta do NPSSO num jogo: conquistados, data e raridade (% de jogadores).
  // Jogo que a conta não tem → null (não é erro: a lista existe, só não há progresso).
  async function userProgress(npId, service) {
    if (!NP_ID_PATTERN.test(npId)) throw httpError(400, 'Código inválido. Formato: NPWR12345_00.');

    const load = (svc) =>
      client.get(`/users/me/npCommunicationIds/${npId}/trophyGroups/all/trophies`, { npServiceName: svc });

    let data;
    try {
      ({ data } = await withService(service, load));
    } catch (e) {
      if (e.status === 404) return null;
      throw e;
    }

    const trophies = {};
    let earned = 0;
    for (const t of data.trophies) {
      if (t.earned) earned++;
      trophies[t.trophyId] = {
        earned: !!t.earned,
        earnedAt: t.earnedDateTime ?? null,
        rate: t.trophyEarnedRate != null ? Number(t.trophyEarnedRate) : null, // % de jogadores
        rarity: t.trophyRare ?? null, // 0 ultra raro · 1 muito raro · 2 raro · 3 comum
        progress: t.progress != null ? Number(t.progress) : null, // contador (ex.: 32 de 50), troféus de PS5
      };
    }
    return { earned, total: data.trophies.length, trophies };
  }

  return { userTitles, allTitlesOf, playerTitles, playerAllTitles, trophyList, userProgress };
}
