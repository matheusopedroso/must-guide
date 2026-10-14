import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useLibraryStore } from '@/stores/library';
import { useGuidesStore } from '@/stores/guides';

export function useSession() {
  const router = useRouter();
  const auth = useAuthStore();

  async function logout() {
    await auth.logout();
    useLibraryStore().reset();
    useGuidesStore().reset();
    router.replace({ name: 'login' });
  }

  return { auth, logout };
}
