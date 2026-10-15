// Simula o RAWG nos testes (sem rede): 14 jogos com capas SVG coloridas. Carregado no servidor de teste (playwright.config.js)
const names = ['Elden Ring Nightreign','Clair Obscur: Expedition 33','Ghost of Yōtei','Death Stranding 2: On the Beach','Hollow Knight: Silksong','Split Fiction','Assassin\'s Creed Shadows','Kingdom Come: Deliverance II','Monster Hunter Wilds','Doom: The Dark Ages','Mafia: The Old Country','Battlefield 6','Silent Hill f','Borderlands 4'];
const colors = ['#8a5a44','#3d5a80','#6b4e71','#2a6f60','#9c6644','#4a5568','#7b3f3f','#556b2f','#5c4d7d','#8b4513','#3f5e5a','#704214','#5a3d55','#2f4858'];
const svg = (c, t) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="338"><rect width="600" height="338" fill="${c}"/><circle cx="300" cy="169" r="90" fill="#ffffff22"/><text x="300" y="180" font-family="Georgia" font-size="28" fill="#fff" text-anchor="middle">${t.split(':')[0]}</text></svg>`);
const games = names.map((n, i) => ({ id: 1000 + i, slug: 'g' + i, name: n, released: `202${5 + (i % 2)}-0${1 + (i % 9)}-15`, background_image: svg(colors[i], n), metacritic: 80 + i, platforms: [{ platform: { name: 'PlayStation 5' } }, { platform: { name: 'PC' } }, { platform: { name: 'Xbox Series S/X' } }], genres: [{ name: 'Action' }] }));
const real = globalThis.fetch;
globalThis.fetch = async (url, ...rest) => {
  const u = String(url);
  if (!u.includes('api.rawg.io')) return real(url, ...rest);
  await new Promise((r) => setTimeout(r, 300));
  const m = new URL(u).pathname.match(/\/games\/(\d+)$/);
  if (m) { const g = games.find((x) => x.id === Number(m[1])); return g ? { ok: true, json: async () => ({ ...g, description_raw: 'Resumo' }) } : { ok: false, status: 404, json: async () => ({}) }; }
  const q = new URL(u).searchParams.get('search');
  const results = q ? games.filter((g) => g.name.toLowerCase().includes(q)) : games;
  return { ok: true, json: async () => ({ results }) };
};
