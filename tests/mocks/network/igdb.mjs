// Simula o IGDB nos testes (token Twitch + /games + /game_time_to_beats): Ghost of Tsushima e edições
const real = globalThis.fetch;
globalThis.__igdbBodies = [];
const G = (id, name, extra = {}) => ({ id, name, slug: 'g' + id, summary: 'Resumo de ' + name, url: 'https://www.igdb.com/games/g' + id, first_release_date: 1595548800 + id * 1000, total_rating: 88, cover: { image_id: 'cov' + id }, platforms: [{ name: 'PlayStation 4' }, { name: 'PlayStation 5' }], genres: [{ name: 'Adventure' }], game_type: { type: 'Main Game' }, ...extra });
const base = G(100, 'Ghost of Tsushima', { remasters: [], expansions: [104], artworks: [{ image_id: 'art100' }], videos: [{ video_id: 'abc123XYZ00', name: 'Launch Trailer' }] });
const dc = G(101, "Ghost of Tsushima: Director's Cut", { version_parent: 100, version_title: "Director's Cut", first_release_date: 1629417600, artworks: [{ image_id: 'art101' }], screenshots: [{ image_id: 'shot1' }, { image_id: 'shot2' }, { image_id: 'shot3' }], videos: [{ video_id: 'dcTrailer01', name: 'Announce Trailer' }, { video_id: 'gp', name: 'Gameplay' }] });
const deluxe = G(102, 'Ghost of Tsushima: Digital Deluxe Edition', { version_parent: 100, version_title: 'Digital Deluxe' });
const mod = G(103, 'Ghost of Tsushima HD Mod', { game_type: { type: 'Mod' } });
const legends = G(104, 'Ghost of Tsushima: Legends', { game_type: { type: 'Expansion' } });
const all = [base, dc, deluxe, mod, legends];
const ok = (body) => ({ ok: true, status: 200, headers: new Headers(), json: async () => body, text: async () => JSON.stringify(body) });
globalThis.fetch = async (url, opts = {}, ...rest) => {
  const u = String(url);
  if (u.startsWith('https://id.twitch.tv/')) return ok({ access_token: 'tw', expires_in: 5000000 });
  if (u.startsWith('https://api.igdb.com/v4/')) {
    const body = String(opts.body); const ep = u.split('/v4/')[1]; globalThis.__igdbBodies.push(ep + ': ' + body);
    if (ep === 'game_time_to_beats') return ok([{ game_id: 101, hastily: 25 * 3600, normally: 40 * 3600, completely: 62 * 3600 }]);
    let m;
    if (body.startsWith('search')) return ok(all);
    if ((m = body.match(/where id = (\d+); limit 1/))) return ok(all.filter((g) => g.id === Number(m[1])));
    if (body.includes('version_parent = ')) {
      const b = Number(body.match(/version_parent = (\d+)/)[1]); const ids = (body.match(/id = \(([\d,]+)\)/)?.[1] ?? '').split(',').map(Number); const self = Number(body.match(/id != (\d+)/)[1]);
      return ok(all.filter((g) => (g.version_parent === b || ids.includes(g.id)) && g.id !== self));
    }
    return ok(all.filter((g) => !g.version_parent));
  }
  return real(url, opts, ...rest);
};
