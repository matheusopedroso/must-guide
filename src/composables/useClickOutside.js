import { onBeforeUnmount, watch } from 'vue';

// Chama onOutside ao tocar fora de `root` enquanto `isOpen` for true
// (o listener só existe com o elemento aberto)
export function useClickOutside(root, isOpen, onOutside) {
  const handler = (e) => !root.value?.contains(e.target) && onOutside();
  const toggle = (on) => document[on ? 'addEventListener' : 'removeEventListener']('pointerdown', handler);

  watch(isOpen, toggle);
  onBeforeUnmount(() => toggle(false));
}
