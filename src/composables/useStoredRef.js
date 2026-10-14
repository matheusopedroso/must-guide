import { ref, watch } from 'vue';

// ref guardada no navegador (preferências pessoais: ordenação, mostrar ocultos…).
// Se o armazenamento estiver bloqueado, funciona só na memória.
export function useStoredRef(key, fallback) {
  let initial = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) initial = JSON.parse(raw);
  } catch {
    /* sem armazenamento */
  }

  const state = ref(initial);
  // sync: grava na hora (o componente pode sumir logo depois da mudança, ex.: ao escolher um item)
  watch(state, (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* sem armazenamento */
    }
  }, { flush: 'sync' });
  return state;
}
