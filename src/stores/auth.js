import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { isAllowed, loginWithGoogle, logout as signOutUser, watchAuth } from '@/services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const error = ref('');
  let ready = null;

  const uid = computed(() => user.value?.uid ?? null);
  const isLogged = computed(() => !!user.value);

  // Resolve uma vez, na primeira resposta do Firebase (usado pelo guard do router)
  function init() {
    ready ??= new Promise((resolve) => {
      watchAuth(async (u) => {
        if (u && !isAllowed(u)) {
          error.value = 'Esta conta não tem acesso ao Must Guide.';
          await signOutUser();
          u = null;
        }
        user.value = u;
        resolve();
      });
    });
    return ready;
  }

  async function login() {
    error.value = '';
    try {
      const { user: u } = await loginWithGoogle();
      const ok = isAllowed(u);
      if (ok) user.value = u; // não depende da ordem do onAuthStateChanged
      return ok;
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') error.value = 'Não foi possível entrar. Tente de novo.';
      return false;
    }
  }

  const logout = () => signOutUser();

  return { user, uid, isLogged, error, init, login, logout };
});
