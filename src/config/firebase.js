// Configuração do Firebase (Console → Configurações do projeto → Seus apps → app Web).
// Estes valores são PÚBLICOS (vão para o navegador): quem protege os dados são as regras do Firestore.
// Sem eles o app funciona só com o rascunho no navegador.
const env = import.meta.env;

export const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  // Publicado: o login passa pelo próprio endereço do site (/__/auth do Hosting).
  // Evita o bloqueio de armazenamento de terceiros dos navegadores no login.
  authDomain: env.PROD ? location.hostname : env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = ['apiKey', 'authDomain', 'projectId', 'appId'].every((k) => FIREBASE_CONFIG[k]);

// Coleções do Firestore
export const COLLECTIONS = { guides: 'guides', trophyLists: 'trophyLists' };
