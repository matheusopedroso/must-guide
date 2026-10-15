import { COLLECTIONS } from '@/config/firebase';
import { getFirestore } from './firebase/app';

// Cópias das listas de troféus no Firestore: trophyLists/{npId} = { v, list, savedAt }.
// Leitura pública (a leitura do guia não depende da API da PSN rodando); só o admin grava (firestore.rules).
// v = versão do formato da lista (LIST_VERSION): cópia de versão antiga é ignorada e regravada pelo editor.
export async function fetchSavedList(npId) {
  const { db, fs } = await getFirestore();
  const snap = await fs.getDoc(fs.doc(db, COLLECTIONS.trophyLists, npId));
  return snap.exists() ? snap.data() : null;
}

export async function saveListCopy(npId, list, v) {
  const { db, fs } = await getFirestore();
  await fs.setDoc(fs.doc(db, COLLECTIONS.trophyLists, npId), { v, list, savedAt: fs.serverTimestamp() });
}
