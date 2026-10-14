import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

// true quando um elemento "sticky" está grudado embaixo da barra de navegação.
// Observa um marcador vazio logo antes dele: se o marcador passou por baixo da barra, está grudado.
// sentinel: template ref (pode aparecer depois, ex.: dentro de um v-if)
export function useIsStuck(sentinel) {
  const stuck = ref(false);
  let observer = null;

  onMounted(() => {
    const navSpace = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-space')) || 0;
    observer = new IntersectionObserver(
      ([entry]) => (stuck.value = !entry.isIntersecting && entry.boundingClientRect.top < navSpace),
      { rootMargin: `-${navSpace + 1}px 0px 0px 0px` },
    );
    watch(
      sentinel,
      (el, old) => {
        if (old) observer.unobserve(old);
        if (el) observer.observe(el);
        else stuck.value = false;
      },
      { immediate: true },
    );
  });
  onBeforeUnmount(() => observer?.disconnect());

  return stuck;
}
