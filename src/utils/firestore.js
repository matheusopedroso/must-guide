// Converte Timestamps do Firestore em Date para o estado local ficar uniforme
const toDate = (v) => (v && typeof v.toDate === 'function' ? v.toDate() : v);

export function normalizeDoc(snap) {
  const data = snap.data();
  for (const key of ['createdAt', 'updatedAt', 'addedAt']) {
    if (key in data) data[key] = toDate(data[key]);
  }
  return { id: snap.id, ...data };
}
