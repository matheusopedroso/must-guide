import { deleteField, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const progressRef = (uid, guideId) => doc(db, 'users', uid, 'progress', guideId);

export async function fetchProgress(uid, guideId) {
  const snap = await getDoc(progressRef(uid, guideId));
  return snap.exists() ? snap.data().done ?? {} : {};
}

// changes: { stepId: true|false } → uma única gravação para vários cliques
export function saveProgress(uid, guideId, changes) {
  const done = {};
  for (const [stepId, checked] of Object.entries(changes)) {
    done[stepId] = checked ? true : deleteField();
  }
  return setDoc(progressRef(uid, guideId), { done, updatedAt: serverTimestamp() }, { merge: true });
}

export const resetProgress = (uid, guideId) =>
  setDoc(progressRef(uid, guideId), { done: {}, updatedAt: serverTimestamp() });
