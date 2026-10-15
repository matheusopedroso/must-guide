import { getFirestore } from './firebase/app';

// Biblioteca pessoal: um documento só por pessoa — users/{uid}/data/library =
// { games: { [gameId]: { status, game, addedAt, updatedAt } }, editedAt, savedAt }
// (1 leitura ao abrir o app; ~1 KB por centena de jogos). Só a própria pessoa lê e grava (firestore.rules).
const ref = (fs, db, uid) => fs.doc(db, 'users', uid, 'data', 'library');

export async function fetchLibrary(uid) {
  const { db, fs } = await getFirestore();
  const snap = await fs.getDoc(ref(fs, db, uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveLibrary(uid, { games, editedAt }) {
  const { db, fs } = await getFirestore();
  await fs.setDoc(ref(fs, db, uid), { games, editedAt, savedAt: fs.serverTimestamp() });
}
