import { onBeforeUnmount } from 'vue';

// Executa `fn` só depois de `delay` ms sem novas chamadas
export function useDebounceFn(fn, delay = 400) {
  let timer;
  const cancel = () => clearTimeout(timer);
  onBeforeUnmount(cancel);
  const debounced = (...args) => {
    cancel();
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = cancel;
  return debounced;
}
