<script setup>
import { WifiOff } from 'lucide-vue-next';
import { useOnline } from '@/composables/useOnline';

// Aviso sem internet (PWA): o app continua abrindo o que já foi visto neste aparelho
const online = useOnline();
</script>

<template>
  <Transition name="offline">
    <div v-if="!online" class="offline d-flex align-center justify-center gap-1 text-sm" role="status">
      <WifiOff :size="16" /> Sem internet: mostrando o que está salvo.
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.offline {
  position: fixed;
  left: 50%;
  bottom: calc(var(--tabbar-space, 0px) + #{space(2)});
  z-index: 60;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100vw - #{space(4)});
  padding: space(1) space(2);
  border-radius: $r-full;
  background: var(--text);
  color: var(--bg);
  box-shadow: var(--shadow);

  @include down(md) {
    bottom: 96px; // acima da barra de abas do celular
  }
}

.offline-enter-active,
.offline-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.offline-enter-from,
.offline-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
