import { COLLECTIONS } from '@/config/firebase';
import { getFirestore } from './firebase/app';
import { guideIdOf } from '@/utils/guideIds';

// Guias no Firestore: guides/{guideId} (jogo "rawg-123" ou DLC "rawg-123~001"), mesmo formato do rascunho (utils/guideDraft.js)
// + updatedBy (uid) e savedAt (hora do servidor). Regras em firestore.rules.

// Campos só do servidor ficam fora do rascunho
const toGuide = (snap) => {
  const { savedAt, updatedBy, ...guide } = snap.data();
  return guide;
};

// null = não existe (ou não pode ler: rascunho de outra pessoa / sem login)
export async function fetchGuide(guideId) {
  const { db, fs } = await getFirestore();
  try {
    const snap = await fs.getDoc(fs.doc(db, COLLECTIONS.guides, guideId));
    return snap.exists() ? toGuide(snap) : null;
  } catch (e) {
    if (e?.code === 'permission-denied') return null;
    throw e;
  }
}

// Admin: todos os guias (rascunhos e publicados). Sem admin: só os publicados (a regra exige o filtro).
export async function listGuides({ admin = false } = {}) {
  const { db, fs } = await getFirestore();
  const ref = fs.collection(db, COLLECTIONS.guides);
  const snap = await fs.getDocs(admin ? ref : fs.query(ref, fs.where('status', '==', 'published')));
  return snap.docs.map(toGuide);
}

// Guias das DLCs de um jogo. Sem admin: só os publicados (a regra exige o filtro)
export async function listDlcGuides(gameId, { admin = false } = {}) {
  const { db, fs } = await getFirestore();
  const filters = [fs.where('parentId', '==', gameId), ...(admin ? [] : [fs.where('status', '==', 'published')])];
  const snap = await fs.getDocs(fs.query(fs.collection(db, COLLECTIONS.guides), ...filters));
  return snap.docs.map(toGuide);
}

export async function saveGuide(guide, uid) {
  const { db, fs } = await getFirestore();
  await fs.setDoc(fs.doc(db, COLLECTIONS.guides, guideIdOf(guide)), {
    ...guide,
    updatedBy: uid,
    savedAt: fs.serverTimestamp(),
  });
}
