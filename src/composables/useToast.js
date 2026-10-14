import { ref } from 'vue';

// Avisos rápidos no canto da tela (um ToastHost no App.vue mostra a lista)
const toasts = ref([]);
let seq = 0;

function dismiss(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// tone: info | success | error. Some sozinho (erros ficam mais tempo)
function show(text, tone = 'info', ms = tone === 'error' ? 6000 : 3000) {
  const id = ++seq;
  toasts.value = [...toasts.value.slice(-2), { id, text, tone }]; // no máximo 3 na tela
  setTimeout(() => dismiss(id), ms);
}

export const useToast = () => ({ toasts, show, dismiss });
