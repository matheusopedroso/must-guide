import { onBeforeUnmount, onMounted, ref } from 'vue';

// true depois de rolar além de `offset` px (ex.: barra que entra só depois do topo da página).
// No máximo 1 leitura por quadro.
export function useScrolledPast(offset = 140) {
  const past = ref(false);
  let frame = 0;
  const measure = () => {
    frame = 0;
    past.value = window.scrollY > offset;
  };
  const onScroll = () => (frame ||= requestAnimationFrame(measure));

  onMounted(() => {
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
  });
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(frame);
  });
  return past;
}
