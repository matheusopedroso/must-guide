import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { normalizeDoc } from '@/utils/firestore';

const guidesCol = collection(db, 'guides');

export async function fetchGuides({ gameId = null, max = 50 } = {}) {
  const constraints = [orderBy('updatedAt', 'desc'), limit(max)];
  if (gameId) constraints.unshift(where('gameId', '==', gameId));
  const snap = await getDocs(query(guidesCol, ...constraints));
  return snap.docs.map(normalizeDoc);
}

export async function fetchGuide(id) {
  const snap = await getDoc(doc(guidesCol, id));
  return snap.exists() ? normalizeDoc(snap) : null;
}

// Cria ou atualiza. Seções e passos ficam no próprio documento (1 leitura por guia)
export async function saveGuide(guide, authorId) {
  const ref = guide.id ? doc(guidesCol, guide.id) : doc(guidesCol);
  const { id: _omit, ...data } = guide;
  const now = serverTimestamp();
  const payload = { ...data, authorId, updatedAt: now };
  if (!guide.id) payload.createdAt = now;

  await setDoc(ref, payload, { merge: true });
  return { ...data, id: ref.id, authorId, updatedAt: new Date(), createdAt: guide.createdAt ?? new Date() };
}

export const deleteGuide = (id) => deleteDoc(doc(guidesCol, id));
