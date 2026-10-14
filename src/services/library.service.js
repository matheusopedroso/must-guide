import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { normalizeDoc } from '@/utils/firestore';
import { toGameDoc, toLibraryEntry } from '@/utils/game';

const libraryCol = (uid) => collection(db, 'users', uid, 'library');
const entryRef = (uid, gameId) => doc(db, 'users', uid, 'library', gameId);
const gameRef = (gameId) => doc(db, 'games', gameId);

// 1 query traz a biblioteca inteira já com capa/título (dados desnormalizados)
export async function fetchLibrary(uid) {
  const snap = await getDocs(query(libraryCol(uid), orderBy('updatedAt', 'desc')));
  return snap.docs.map(normalizeDoc);
}

// Grava o jogo no catálogo e na biblioteca numa única operação
export async function addToLibrary(uid, game, status) {
  const now = serverTimestamp();
  const entry = toLibraryEntry(game, status);
  const batch = writeBatch(db);
  batch.set(gameRef(game.id), { ...toGameDoc(game), updatedAt: now }, { merge: true });
  batch.set(entryRef(uid, game.id), { ...entry, addedAt: now, updatedAt: now });
  await batch.commit();

  const local = new Date();
  return { id: game.id, ...entry, addedAt: local, updatedAt: local };
}

export async function updateLibraryEntry(uid, gameId, patch) {
  await updateDoc(entryRef(uid, gameId), { ...patch, updatedAt: serverTimestamp() });
  return { ...patch, updatedAt: new Date() };
}

export const removeFromLibrary = (uid, gameId) => deleteDoc(entryRef(uid, gameId));

export async function fetchGame(gameId) {
  const snap = await getDoc(gameRef(gameId));
  return snap.exists() ? normalizeDoc(snap) : null;
}
