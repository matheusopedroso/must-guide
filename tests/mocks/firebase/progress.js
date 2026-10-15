// Simula services/progress.service nos testes (nuvem = localStorage "mock-progress:<uid>:<guideId>")
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export async function fetchProgress(uid, gameId) {
  await wait(200);
  return JSON.parse(localStorage.getItem(`mock-progress:${uid}:${gameId}`) || 'null');
}
export async function saveProgress(uid, gameId, data) {
  await wait(150);
  window.__progressSaves = (window.__progressSaves ?? 0) + 1;
  localStorage.setItem(`mock-progress:${uid}:${gameId}`, JSON.stringify(data));
}
