import { COLLECTIONS } from '@/config/firebase';
import { getFirestore } from './firebase/app';

// Guias no Firestore: guides/{gameId}, mesmo formato do rascunho (utils/guideDraft.js)
// + updatedBy (uid) e savedAt (hora do servidor). Regras em firestore.rules.

export async function fetchGuide(gameId) {
  const { db, fs } = await getFirestore();
  const snap = await fs.getDoc(fs.doc(db, COLLECTIONS.guides, gameId));
  if (!snap.exists()) return null;
  const { savedAt, updatedBy, ...guide } = snap.data(); // campos só do servidor ficam fora do rascunho
  return guide;
}

export async function saveGuide(guide, uid) {
  const { db, fs } = await getFirestore();
  await fs.setDoc(fs.doc(db, COLLECTIONS.guides, guide.gameId), {
    ...guide,
    updatedBy: uid,
    savedAt: fs.serverTimestamp(),
  });
}
