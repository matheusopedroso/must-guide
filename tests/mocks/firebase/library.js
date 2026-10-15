// Simula services/library.service nos testes (nuvem = localStorage "mock-library:<uid>")
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export async function fetchLibrary(uid) {
  await wait(200);
  return JSON.parse(localStorage.getItem(`mock-library:${uid}`) || 'null');
}
export async function saveLibrary(uid, data) {
  await wait(150);
  window.__librarySaves = (window.__librarySaves ?? 0) + 1;
  localStorage.setItem(`mock-library:${uid}`, JSON.stringify(data));
}
