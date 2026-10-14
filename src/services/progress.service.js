import { getFirestore } from './firebase/app';

// Progresso pessoal num guia (coletáveis marcados): users/{uid}/progress/{gameId} = { collected: [ids], editedAt, savedAt }.
// editedAt (hora do aparelho) decide entre a cópia do navegador e a da nuvem.
// Só a própria pessoa lê e grava (firestore.rules).
export async function fetchProgress(uid, gameId) {
  const { db, fs } = await getFirestore();
  const snap = await fs.getDoc(fs.doc(db, 'users', uid, 'progress', gameId));
  return snap.exists() ? snap.data() : null;
}

export async function saveProgress(uid, gameId, { collected, editedAt }) {
  const { db, fs } = await getFirestore();
  await fs.setDoc(fs.doc(db, 'users', uid, 'progress', gameId), { collected, editedAt, savedAt: fs.serverTimestamp() });
}
