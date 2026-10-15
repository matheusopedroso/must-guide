import { ref, shallowRef } from 'vue';

// Imagens em tela cheia: uma janela só no app (LightboxHost, no App.vue) que qualquer parte abre
// — cartão do coletável, imagens no meio do texto, mapa da região. images: [{ src, alt }]
const images = shallowRef([]);
const index = ref(null);

export function useLightbox() {
  const open = (list, i = 0) => {
    if (!list.length) return;
    images.value = list;
    index.value = Math.min(Math.max(i, 0), list.length - 1);
  };
  return { images, index, open };
}
