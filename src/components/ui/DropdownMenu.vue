<script setup>
import { ref, useTemplateRef } from 'vue';
import { useClickOutside } from '@/composables/useClickOutside';

// Menu suspenso genérico. O botão vem no slot #trigger ({ open, toggle });
// os itens no slot padrão ({ close }) — use a classe global .menu__item (styles/components/_menu.scss).
defineProps({
  label: { type: String, required: true }, // aria-label do menu
  width: { type: Number, default: 240 },
});

const open = ref(false);
const root = useTemplateRef('root');
const close = () => (open.value = false);
const toggle = () => (open.value = !open.value);
useClickOutside(root, open, close);
</script>

<template>
  <div ref="root" class="dropdown relative" @keydown.esc="close">
    <slot name="trigger" :open="open" :toggle="toggle" />
    <div
      v-if="open"
      class="dropdown__menu surface radius-2 py-1"
      role="menu"
      :aria-label="label"
      :style="{ width: `min(${width}px, calc(100vw - 32px))` }"
    >
      <slot :close="close" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dropdown__menu {
  position: absolute;
  top: calc(100% + #{space(1)});
  right: 0;
  z-index: 30;
  max-height: min(420px, 60dvh);
  overflow-y: auto;
  box-shadow: var(--shadow);
}
</style>
