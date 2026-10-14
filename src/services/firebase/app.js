import { FIREBASE_CONFIG } from '@/config/firebase';

// SDK carregado sob demanda: quem só olha a tela inicial não baixa nada do Firebase.
// Cada getter devolve a mesma promessa (inicia uma vez só).
let app = null;
let db = null;

export const getApp = () =>
  (app ??= import('firebase/app').then(({ getApps, initializeApp }) => getApps()[0] ?? initializeApp(FIREBASE_CONFIG)));

// { db, fs } → instância + funções do Firestore (getDoc, setDoc…).
// Versão "lite" (só leitura/gravação pontual, sem tempo real nem cache offline): ~4× menor.
// O offline já é coberto pelo rascunho no navegador. Se um dia precisar de onSnapshot, trocar por 'firebase/firestore'.
export const getFirestore = () =>
  (db ??= Promise.all([getApp(), import('firebase/firestore/lite')]).then(([instance, fs]) => ({ db: fs.getFirestore(instance), fs })));
