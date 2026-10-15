// Simula a PSN nos testes (login com NPSSO "valid", jogos da conta, listas, progresso e perfis de outras pessoas)
const real = globalThis.fetch;
const titles = [
  { npServiceName: 'trophy2', npCommunicationId: 'NPWR38432_00', trophyTitleName: 'Ghost of Yōtei', trophyTitleIconUrl: null, trophyTitlePlatform: 'PS5', definedTrophies: { bronze: 41, silver: 9, gold: 3, platinum: 1 }, progress: 37 },
  { npServiceName: 'trophy', npCommunicationId: 'NPWR21085_00', trophyTitleName: 'Ghost of Tsushima', trophyTitleIconUrl: null, trophyTitlePlatform: 'PS4', definedTrophies: { bronze: 39, silver: 10, gold: 3, platinum: 1 }, progress: 100 },
  { npServiceName: 'trophy2', npCommunicationId: 'NPWR22858_00', trophyTitleName: "Ghost of Tsushima DIRECTOR'S CUT", trophyTitleIconUrl: null, trophyTitlePlatform: 'PS5', definedTrophies: { bronze: 39, silver: 10, gold: 3, platinum: 1 }, progress: 12 },
  { npServiceName: 'trophy2', npCommunicationId: 'NPWR22814_00', trophyTitleName: 'ASTRO\'s PLAYROOM', trophyTitleIconUrl: null, trophyTitlePlatform: 'PS5', definedTrophies: { bronze: 37, silver: 11, gold: 2, platinum: 1 }, progress: 100 },
  { npServiceName: 'trophy', npCommunicationId: 'NPWR13348_00', trophyTitleName: 'God of War', trophyTitleIconUrl: null, trophyTitlePlatform: 'PS4', definedTrophies: { bronze: 26, silver: 7, gold: 3, platinum: 1 }, progress: 64 },
];
const other = [{ npServiceName: 'trophy2', npCommunicationId: 'NPWR40001_00', trophyTitleName: '007 First Light', trophyTitleIconUrl: null, trophyTitlePlatform: 'PS5', definedTrophies: { bronze: 30, silver: 8, gold: 4, platinum: 1 }, progress: 58 }, titles[3]];
const svg = (c) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${c}"/><circle cx="32" cy="32" r="14" fill="#fff6"/></svg>`);
titles.forEach((t, i) => (t.trophyTitleIconUrl = svg(['#6b4e71', '#7b3f3f', '#8a4b4b', '#3d5a80', '#556b2f'][i])));
other[0].trophyTitleIconUrl = svg('#1f3a2e');
const allTitles = [...titles, other[0]];
const types = ['platinum', 'gold', 'gold', 'silver', 'silver', 'bronze', 'bronze', 'bronze', 'bronze', 'bronze'];
const namesEn = ['Legend of Ezo', 'Revenge Complete', 'Blade Master', 'Bounty Hunter', 'Six of Yotei', 'First Blood', 'Curious Fox', 'Hot Springs', 'Haiku', 'Bamboo Shrine'];
const names = ['Lenda de Ezo', 'Vingança completa', 'Mestre da lâmina', 'Caçadora de recompensas', 'Seis de Yōtei', 'Primeiro sangue', 'Raposa curiosa', 'Fontes termais', 'Haiku', 'Santuário de bambu'];
const trophies = (group, en = false) => types.map((type, i) => ({ trophyId: i + (group === '001' ? 10 : 0), trophyGroupId: group, trophyType: group === '001' && type === 'platinum' ? 'gold' : type, trophyName: (group === '001' ? 'DLC: ' : '') + (en ? namesEn[i] : names[i]), trophyDetail: i === 4 ? '' : 'Descrição do troféu ' + (i + 1) + ' com dica de como conseguir.', trophyIconUrl: svg(['#a9bbd6', '#d4a63a', '#d4a63a', '#a8a8a8', '#a8a8a8', '#b0703c', '#b0703c', '#b0703c', '#b0703c', '#b0703c'][i]), trophyHidden: i === 1, ...(i === 9 && { trophyProgressTargetValue: '50' }), ...(i === 8 && { trophyRewardName: 'Avatar de Haiku', trophyRewardImageUrl: null }) }));
let calls = [];
globalThis.__psnCalls = calls;
globalThis.fetch = async (url, opts = {}, ...rest) => {
  const u = String(url);
  const ok = (body) => ({ ok: true, status: 200, headers: new Headers(), json: async () => body });
  if (u.includes('ca.account.sony.com') && u.includes('/authorize')) {
    calls.push('authorize');
    const good = String(opts.headers?.Cookie).includes('npsso=valid');
    return { ok: false, status: 302, headers: new Headers(good ? { location: 'com.scee.psxandroid.scecompcall://redirect/?code=v3.ABC&cid=x' } : { location: 'https://my.account.sony.com/central/signin/?error=login_required' }), json: async () => ({}) };
  }
  if (u.includes('ca.account.sony.com') && u.includes('/token')) { calls.push('token'); return ok({ access_token: 'AT', expires_in: 3600, refresh_token: 'RT', refresh_token_expires_in: 5000000 }); }
  if (u.includes('us-prof.np.community.playstation.net')) {
    const name = decodeURIComponent(new URL(u).pathname.split('/')[4]); calls.push('profile:' + name);
    if (name.toLowerCase() === 'ninguem') return { ok: false, status: 404, headers: new Headers(), json: async () => ({ error: { message: 'Not found' } }) };
    return ok({ profile: { onlineId: name === 'fechado' ? 'Fechado' : 'Hunter_BR', accountId: name === 'fechado' ? 'priv' : '999', avatarUrls: [{ size: 'm', avatarUrl: svg('#d97757') }] } });
  }
  if (u.includes('m.np.playstation.com')) {
    const p = new URL(u); calls.push(p.pathname.replace('/api/trophy/v1', '') + p.search);
    await new Promise((r) => setTimeout(r, 250));
    if (p.pathname.endsWith('/trophyTitles')) {
      const acc = p.pathname.split('/')[5];
      if (acc === 'priv') return { ok: false, status: 403, headers: new Headers(), json: async () => ({ error: { message: 'Not permitted' } }) };
      return ok({ trophyTitles: acc === 'me' ? titles : other });
    }
    if (p.pathname.includes('/users/me/npCommunicationIds/')) {
      const uid = p.pathname.split('/')[7]; const ut = titles.find((x) => x.npCommunicationId === uid);
      if (!ut || ut.npServiceName !== p.searchParams.get('npServiceName') || uid === 'NPWR13348_00') return { ok: false, status: 404, headers: new Headers(), json: async () => ({ error: { message: 'Resource not found' } }) };
      const g = uid === 'NPWR38432_00' ? ['default', '001'] : ['default'];
      const all = g.flatMap(trophies);
      return ok({ trophies: all.map((t, i) => ({ trophyId: t.trophyId, trophyType: t.trophyType, earned: ut.progress === 100 || (i % 3 === 0 && t.trophyId !== 9), earnedDateTime: '2025-11-0' + ((i % 9) + 1) + 'T20:00:00Z', trophyEarnedRate: String([1.2, 4.8, 9.5, 18.3, 35.0, 62.7][i % 6]), trophyRare: [0, 1, 1, 2, 3, 3][i % 6], ...(t.trophyId === 9 && { progress: '32' }) })) });
    }
    const id = p.pathname.split('/')[5]; const t = allTitles.find((x) => x.npCommunicationId === id);
    const svc = p.searchParams.get('npServiceName');
    if (!t || (t.npServiceName !== svc)) return { ok: false, status: 404, headers: new Headers(), json: async () => ({ error: { code: 2240525, message: 'Resource not found' } }) };
    const groups = id === 'NPWR38432_00' ? ['default', '001'] : ['default'];
    if (p.pathname.endsWith('/trophyGroups')) return ok({ trophyTitleName: t.trophyTitleName, trophyTitleIconUrl: t.trophyTitleIconUrl, trophyTitlePlatform: t.trophyTitlePlatform, definedTrophies: t.definedTrophies, trophyGroups: groups.map((g) => ({ trophyGroupId: g, trophyGroupName: g === 'default' ? t.trophyTitleName : 'Lendas (DLC)', trophyGroupIconUrl: t.trophyTitleIconUrl, definedTrophies: g === 'default' ? { platinum: 1, gold: 2, silver: 2, bronze: 5 } : { platinum: 0, gold: 3, silver: 2, bronze: 5 } })) });
    const en = String(opts.headers?.['Accept-Language'] ?? '').startsWith('en');
    return ok({ trophies: groups.flatMap((g) => trophies(g, en)) });
  }
  return real(url, opts, ...rest);
};
