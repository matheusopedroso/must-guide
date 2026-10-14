import { firebaseEnabled } from '@/config/firebase';
import { getApp } from './app';

// Login com Google. O Auth só é carregado quando precisa (sessão anterior ou clique em "Entrar").
let auth = null;
const sdk = () => import('firebase/auth');

function getAuth() {
  auth ??= Promise.all([getApp(), sdk()]).then(([app, a]) => {
    try {
      // Persistência definida na criação (trocar depois atrapalha o retorno do login por redirect)
      return a.initializeAuth(app, {
        persistence: [a.indexedDBLocalPersistence, a.browserLocalPersistence],
        popupRedirectResolver: a.browserPopupRedirectResolver,
      });
    } catch {
      return a.getAuth(app); // já iniciado (recarga do Vite)
    }
  });
  return auth;
}

// Avisa a cada troca de usuário ou renovação do token: cb(user | null, claims | null)
export async function watchUser(cb) {
  const [instance, a] = await Promise.all([getAuth(), sdk()]);
  await a.getRedirectResult(instance).catch(() => null); // volta do login por redirect (popup bloqueado)
  return a.onIdTokenChanged(instance, async (user) => {
    const claims = user ? (await user.getIdTokenResult().catch(() => null))?.claims ?? null : null;
    cb(user, claims);
  });
}

// Popup do Google; se o navegador bloquear, vai por redirect. Fechar a janela não é erro.
export async function signInWithGoogle() {
  const [instance, a] = await Promise.all([getAuth(), sdk()]);
  const provider = new a.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await a.signInWithPopup(instance, provider);
  } catch (e) {
    if (e?.code === 'auth/popup-blocked') return a.signInWithRedirect(instance, provider);
    if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(e?.code)) return;
    throw Object.assign(new Error(authErrorMessage(e)), { code: e?.code });
  }
}

export async function signOut() {
  const [instance, a] = await Promise.all([getAuth(), sdk()]);
  await a.signOut(instance);
}

// Token para as rotas privadas da API. Sem login (ou sem Firebase) → null, sem carregar o SDK.
// Espera a sessão salva ser restaurada (a 1ª chamada pode sair antes do login voltar).
export async function getIdToken() {
  if (!firebaseEnabled || !auth) return null;
  const instance = await auth;
  await instance.authStateReady();
  return instance.currentUser?.getIdToken() ?? null;
}

// Força um token novo (ex.: acabou de virar admin pelo script)
export async function refreshClaims() {
  if (auth) await (await auth).currentUser?.getIdToken(true);
}

const MESSAGES = {
  'auth/unauthorized-domain': 'Este endereço não está autorizado no Firebase (Authentication → Configurações → Domínios autorizados).',
  'auth/operation-not-allowed': 'O login com Google não está ativado no Firebase (Authentication → Método de login).',
  'auth/network-request-failed': 'Sem conexão. Tente de novo.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
};
const authErrorMessage = (e) => MESSAGES[e?.code] ?? 'Não foi possível entrar com o Google.';
