import { computed, shallowRef, watch } from 'vue';
import { useAuth } from './useAuth';
import { LIBRARY_STATUSES } from '@/config/library';

// Biblioteca pessoal (estado único do app): jogos marcados como Jogando, Quero platinar ou Platinado.
// Sempre no navegador (mg:library); logado, também na conta (users/{uid}/data/library), para ver o mesmo no
// celular e no PC — vale a cópia editada por último. Na nuvem grava agrupado (1,5 s) e ao esconder a aba.
// Também guarda o jogo ↔ lista de troféus da PSN ("Sincronizar com a PSN" na página do jogo, sem precisar de guia).
// Formato: { games: { [gameId]: { status, game: { id, title, cover, year, platforms, kind }, addedAt, updatedAt } },
//            links: { [gameId]: { id: NPWR…, service, name, platform, icon, game, updatedAt } }, editedAt }
const KEY = 'mg:library';
const CLOUD_DELAY = 1500;
const EMPTY = { games: {}, links: {}, editedAt: '' };
const fromRaw = (raw) => ({ games: raw?.games ?? {}, links: raw?.links ?? {}, editedAt: raw?.editedAt ?? '' });

const state = shallowRef(EMPTY);
let started = false;
let timer = null;
let dirty = false;
let auth = null;

function readLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return raw?.games ? fromRaw(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state.value));
  } catch {
    /* sem armazenamento */
  }
}

async function flush() {
  clearTimeout(timer);
  const uid = auth?.user.value?.uid;
  if (!dirty || !uid) return;
  dirty = false;
  try {
    const { saveLibrary } = await import('@/services/library.service');
    await saveLibrary(uid, state.value);
  } catch (e) {
    dirty = true; // tenta de novo na próxima mudança ou ao sair
    console.error('[biblioteca] Falha ao salvar', e);
  }
}

function schedule(delay = CLOUD_DELAY) {
  if (!auth?.user.value) return;
  dirty = true;
  clearTimeout(timer);
  timer = setTimeout(flush, delay);
}

// Entrou: pega a da conta (se for mais nova) ou sobe a do navegador (marcada sem login / sem internet)
async function syncWithCloud(user) {
  if (!user) return;
  try {
    const { fetchLibrary } = await import('@/services/library.service');
    const remote = await fetchLibrary(user.uid);
    if (auth.user.value?.uid !== user.uid) return;
    if (remote?.games && (remote.editedAt ?? '') >= state.value.editedAt) {
      state.value = fromRaw(remote);
      writeLocal();
    } else if (Object.keys(state.value.games).length || Object.keys(state.value.links).length) {
      schedule(0);
    }
  } catch (e) {
    console.error('[biblioteca] Falha ao ler', e);
  }
}

function start() {
  if (started) return;
  started = true;
  state.value = readLocal() ?? EMPTY;
  auth = useAuth();
  if (auth.enabled) watch(auth.user, syncWithCloud, { immediate: true });
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
}

// Só o que o card de jogo mostra (a biblioteca abre sem ir à API de jogos)
const snapshot = (g) => ({
  id: g.id,
  title: g.title ?? '',
  cover: g.cover ?? null,
  year: g.year ?? null,
  platforms: (g.platforms ?? []).slice(0, 3),
  kind: g.kind ?? '',
});

export function useLibrary() {
  start();

  const statusOf = (gameId) => state.value.games[gameId]?.status ?? null;

  function commit(next) {
    state.value = { ...state.value, ...next, editedAt: new Date().toISOString() };
    writeLocal();
    schedule();
  }

  // status null = tira da biblioteca
  function setStatus(game, status) {
    const now = new Date().toISOString();
    const games = { ...state.value.games };
    if (status) games[game.id] = { status, game: snapshot(game), addedAt: games[game.id]?.addedAt ?? now, updatedAt: now };
    else delete games[game.id];
    commit({ games });
  }

  // Jogo ↔ lista da PSN (title = { id: NPWR…, service, name, platform, icon }); null = desvincula
  const linkOf = (gameId) => state.value.links[gameId] ?? null;
  function setLink(game, title) {
    const links = { ...state.value.links };
    if (title) {
      const { id, service = null, name = '', platform = '', icon = null } = title;
      links[game.id] = { id, service, name, platform, icon, game: snapshot(game), updatedAt: new Date().toISOString() };
    } else delete links[game.id];
    commit({ links });
  }
  // Lista da PSN → jogo vinculado (para abrir a página do jogo a partir dos "Meus jogos da PSN")
  const gamesByList = computed(() => new Map(Object.values(state.value.links).map((l) => [l.id, l.game])));

  // Mais recentes primeiro: [{ status, game, updatedAt }]
  const entries = computed(() => Object.values(state.value.games).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  const counts = computed(() =>
    Object.fromEntries(LIBRARY_STATUSES.map((s) => [s.id, entries.value.filter((e) => e.status === s.id).length])),
  );

  return { entries, counts, statusOf, setStatus, linkOf, setLink, gamesByList };
}
