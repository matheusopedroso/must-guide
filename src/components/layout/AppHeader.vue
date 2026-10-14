<script setup>
import { Moon, Plus, Sun } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import AppLogo from './AppLogo.vue';
import { useTheme } from '@/composables/useTheme';

const { theme, toggle } = useTheme();
</script>

<template>
  <header class="header">
    <div class="container container-header d-flex align-center gap-2 h-100">
      <RouterLink to="/" class="shrink-0" aria-label="Must Guide — início">
        <AppLogo :height="48" />
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
</style>
