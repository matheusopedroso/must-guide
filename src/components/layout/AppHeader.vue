<script setup>
import { Moon, Plus, Sun } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useTheme } from '@/composables/useTheme';

const { theme, toggle } = useTheme();
</script>

<template>
  <header class="header">
    <div class="container container-header d-flex align-center gap-2 h-100">
      <RouterLink to="/" class="d-flex align-center gap-1 shrink-0">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span class="logo serif">Must Guide</span>
      </RouterLink>

      <div class="d-flex align-center gap-1 ml-auto">
        <BaseButton
          :icon="theme === 'dark' ? Sun : Moon"
          icon-only
          variant="ghost"
          :aria-label="theme === 'dark' ? 'Tema claro' : 'Tema escuro'"
          @click="toggle"
        />
        <BaseButton :to="{ name: 'guide-new' }" :icon="Plus" variant="primary">Criar guia</BaseButton>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: $header-height;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.logo {
  font-size: 19px;
}
</style>
