import { firebaseEnabled } from '@/config/firebase';
import { LIST_VERSION, fetchTrophyList } from './trophies.service';

// De onde vem a lista de troféus de uma versão do guia (NPWR…):
// - Leitura (prefer 'saved'): cópia no Firestore (trophyLists/{npId}) → API da PSN. Quem lê não depende da API
//   rodando (ex.: site publicado sem functions, plano Spark).
// - Editor (prefer 'api'): API (sempre a lista mais nova) → cópia do Firestore se a API falhar. Com canSave (admin),
//   confere a cópia uma vez por sessão e regrava se faltar, for de versão antiga ou tiver mudado.
// Sem nada disso (sem internet): a última lista vista neste navegador (mg:trophy-list:<npId>).
const LOCAL = 'mg:trophy-list:';
const memo = new Map(); // npId → lista (a mesma lista não vai à rede duas vezes na sessão)
const checked = new Set(); // npIds cuja cópia na nuvem já foi conferida nesta sessão

function remember(npId, list) {
  memo.set(npId, list);
  try {
    localStorage.setItem(LOCAL + npId, JSON.stringify({ v: LIST_VERSION, list }));
  } catch {
    /* sem espaço: segue sem a cópia local */
  }
  return list;
}

function localCopy(npId) {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL + npId) ?? 'null');
    return raw?.v === LIST_VERSION ? raw.list : null;
  } catch {
    return null;
  }
}

async function savedCopy(npId) {
  if (!firebaseEnabled) return null;
  const { fetchSavedList } = await import('@/services/trophyLists.service');
  const doc = await fetchSavedList(npId);
  return doc?.v === LIST_VERSION ? doc.list : null;
}

// Mudou algo que a leitura mostra? (contagens, nomes, descrições, ícones…) — compara o JSON inteiro
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function syncCopy(npId, list) {
  if (!firebaseEnabled || checked.has(npId)) return;
  checked.add(npId);
  try {
    const { fetchSavedList, saveListCopy } = await import('@/services/trophyLists.service');
    const doc = await fetchSavedList(npId);
    if (doc?.v !== LIST_VERSION || !same(doc.list, list)) await saveListCopy(npId, list, LIST_VERSION);
  } catch (e) {
    checked.delete(npId); // tenta de novo na próxima vez
    console.error('[troféus] Falha ao guardar a cópia da lista', e);
  }
}

export async function loadTrophyList(npId, service, { prefer = 'saved', canSave = false, signal } = {}) {
  if (prefer === 'saved' && memo.has(npId)) return memo.get(npId);

  const fromApi = async () => {
    const list = await fetchTrophyList(npId, service, { signal });
    if (canSave) syncCopy(npId, list); // em segundo plano
    return remember(npId, list);
  };
  const fromSaved = async () => {
    const list = await savedCopy(npId);
    if (!list) throw new Error('Sem cópia da lista.');
    return remember(npId, list);
  };

  const [first, second] = prefer === 'api' ? [fromApi, fromSaved] : [fromSaved, fromApi];
  try {
    return await first();
  } catch (e1) {
    if (signal?.aborted) throw e1;
    try {
      return await second();
    } catch (e2) {
      const local = localCopy(npId);
      if (local) return local;
      throw prefer === 'api' ? e1 : e2; // o erro da API explica melhor (ex.: código inválido)
    }
  }
}

// Ao publicar: garante a cópia de todas as versões do guia (as que o editor ainda não conferiu nesta sessão)
export const ensureListCopies = (versions) =>
  Promise.all(versions.map((v) => loadTrophyList(v.id, v.service, { prefer: 'api', canSave: true }).catch(() => null)));
