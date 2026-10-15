// Simula services/guides.service nos testes (nuvem = localStorage "mock-cloud:<guideId>"; só admin grava)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const isAdmin = () => localStorage.getItem('mock-user') && localStorage.getItem('mock-admin') !== '0';
const all = () => Object.keys(localStorage).filter((k) => k.startsWith('mock-cloud:')).map((k) => JSON.parse(localStorage.getItem(k)));
const strip = ({ _uid, ...g }) => g;
export async function fetchGuide(gameId) {
  await wait(300);
  const raw = localStorage.getItem(`mock-cloud:${gameId}`);
  const g = raw ? JSON.parse(raw) : null;
  if (g && !isAdmin() && g.status !== 'published') return null; // regra: rascunho só admin
  return g && strip(g);
}
export async function listGuides({ admin } = {}) {
  await wait(300);
  window.__lists = (window.__lists ?? 0) + 1;
  return all().filter((g) => admin || g.status === 'published').map(strip);
}
export async function saveGuide(guide, uid) {
  await wait(200);
  if (localStorage.getItem('mock-cloud-fail')) throw new Error('permission-denied');
  window.__saves = (window.__saves ?? 0) + 1;
  (window.__saveLog ??= []).push((guide.guideId ?? guide.gameId) + ':' + guide.status);
  localStorage.setItem(`mock-cloud:${guide.guideId ?? guide.gameId}`, JSON.stringify({ ...guide, _uid: uid }));
}

export async function listDlcGuides(gameId, { admin } = {}) {
  await wait(250);
  return all().filter((g) => g.parentId === gameId && (admin || g.status === 'published')).map(strip);
}
export async function deleteGuides(ids) {
  await wait(200);
  if (!isAdmin()) throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
  (window.__delLog ??= []).push(...ids);
  ids.forEach((id) => localStorage.removeItem(`mock-cloud:${id}`));
}
export async function moveGuides(guides, oldIds, uid) {
  await wait(200);
  if (!isAdmin()) throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
  (window.__moveLog ??= []).push({ to: guides.map((g) => g.guideId), from: oldIds });
  oldIds.forEach((id) => localStorage.removeItem(`mock-cloud:${id}`));
  guides.forEach((g) => localStorage.setItem(`mock-cloud:${g.guideId}`, JSON.stringify({ ...g, _uid: uid })));
}
export async function saveGuides(guides, uid) {
  await wait(200);
  if (!isAdmin()) throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
  (window.__importLog ??= []).push(...guides.map((g) => g.guideId ?? g.gameId));
  guides.forEach((g) => localStorage.setItem(`mock-cloud:${g.guideId ?? g.gameId}`, JSON.stringify({ ...g, _uid: uid })));
}
