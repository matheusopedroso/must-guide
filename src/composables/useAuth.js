import { computed, readonly, ref, shallowRef } from 'vue';
import { firebaseEnabled } from '@/config/firebase';
import { useToast } from './useToast';

// Sessão (estado único para o app todo).
// Só carrega o Firebase Auth na abertura se este aparelho já teve login (marca no localStorage);
// para quem nunca entrou, nada do Firebase é baixado até clicar em "Entrar".
const MARK = 'mg:had-session';
const hadSession = () => {
  try {
    return localStorage.getItem(MARK) === '1';
  } catch {
    return false;
  }
};
const setMark = (on) => {
  try {
    on ? localStorage.setItem(MARK, '1') : localStorage.removeItem(MARK);
  } catch {
    /* sem armazenamento */
  }
};

const user = shallowRef(null);
const claims = shallowRef(null);
const ready = ref(!firebaseEnabled || !hadSession()); // sem marca: já sabemos que não há sessão
const busy = ref(false);
let started = null;

function start() {
  if (!firebaseEnabled) return Promise.resolve();
  started ??= import('@/services/firebase/auth').then(({ watchUser }) =>
    watchUser((u, c) => {
      user.value = u;
      claims.value = c;
      ready.value = true;
      setMark(!!u);
    }),
  );
  return started;
}

if (hadSession()) start();

async function login() {
  busy.value = true;
  try {
    await start();
    const { signInWithGoogle } = await import('@/services/firebase/auth');
    await signInWithGoogle();
  } catch (e) {
    useToast().show(e.message, 'error');
  } finally {
    busy.value = false;
  }
}

async function logout() {
  const { signOut } = await import('@/services/firebase/auth');
  await signOut();
}

const isAdmin = computed(() => claims.value?.admin === true);

export function useAuth() {
  return { enabled: firebaseEnabled, user: readonly(user), isAdmin, ready: readonly(ready), busy: readonly(busy), login, logout };
}
