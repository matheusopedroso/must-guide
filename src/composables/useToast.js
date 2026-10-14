import { ref } from 'vue';

// Avisos rápidos no canto da tela (um ToastHost no App.vue mostra a lista)
const toasts = ref([]);
let seq = 0;

function dismiss(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// tone: info | success | error. Some sozinho (erros e avisos com ação ficam mais tempo).
// action: { label, run } → botão no aviso (ex.: Desfazer)
function show(text, tone = 'info', { ms, action } = {}) {
  const id = ++seq;
  toasts.value = [...toasts.value.slice(-2), { id, text, tone, action }]; // no máximo 3 na tela
  setTimeout(() => dismiss(id), ms ?? (tone === 'error' || action ? 6000 : 3000));
}

export const useToast = () => ({ toasts, show, dismiss });
