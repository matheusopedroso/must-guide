import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// As barras de navegação saem do caminho ao rolar para baixo e voltam ao subir (igual ao Must Watch).
// top: barra do topo · bottom: barra de baixo do celular (sempre visível perto do topo e no fim da página).
// A classe `nav-hidden` no <html> troca a variável --nav-offset, usada por quem gruda embaixo da barra
// (ex.: abas do editor), para ocupar o espaço liberado.
const top = ref(false);
const bottom = ref(false);
const MIN_DELTA = 8;

export function useNavVisibility() {
  const route = useRoute();
  let last = 0;
  let frame = 0;

  function update() {
    frame = 0;
    const y = Math.max(0, window.scrollY);
    const delta = y - last;
    const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 24;

    if (y <= MIN_DELTA) top.value = false;
    else if (Math.abs(delta) >= MIN_DELTA) top.value = delta > 0;

    if (y <= 80 || atEnd) bottom.value = false;
    else if (Math.abs(delta) >= MIN_DELTA) bottom.value = delta > 0;

    last = y;
  }

  const onScroll = () => (frame ||= requestAnimationFrame(update)); // no máximo 1 cálculo por quadro

  watch(top, (hidden) => document.documentElement.classList.toggle('nav-hidden', hidden), { immediate: true });

  // Tela nova: barras à vista
  watch(
    () => route.fullPath,
    () => {
      last = window.scrollY;
      top.value = bottom.value = false;
    },
  );

  onMounted(() => {
    last = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
  });
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(frame);
  });

  return { topHidden: top, bottomHidden: bottom };
}
