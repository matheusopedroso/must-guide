// Simula services/trophyLists.service nos testes (nuvem = localStorage "mock-list:<npId>"; só admin grava)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const isAdmin = () => localStorage.getItem('mock-user') && localStorage.getItem('mock-admin') !== '0';
export async function fetchSavedList(npId) {
  await wait(150);
  window.__listReads = (window.__listReads ?? 0) + 1;
  return JSON.parse(localStorage.getItem(`mock-list:${npId}`) || 'null');
}
export async function saveListCopy(npId, list, v) {
  await wait(150);
  if (!isAdmin()) throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
  window.__listSaves = (window.__listSaves ?? 0) + 1;
  localStorage.setItem(`mock-list:${npId}`, JSON.stringify({ v, list }));
}
