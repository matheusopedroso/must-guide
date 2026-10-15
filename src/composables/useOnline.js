import { onBeforeUnmount, ref } from 'vue';

// Está com internet? (eventos online/offline do navegador)
export function useOnline() {
  const online = ref(navigator.onLine);
  const update = () => (online.value = navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  onBeforeUnmount(() => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
  });
  return online;
}
