<script setup>
import { LOGO_ACCENT_PATH, LOGO_PRIMARY_PATH, LOGO_VIEWBOX } from '@/assets/brand/logo';

// Logo inline: as cores seguem o tema (claro/escuro) pelas variáveis --logo-*
defineProps({ height: { type: Number, default: 40 } });
</script>

<template>
  <svg class="logo" :viewBox="LOGO_VIEWBOX" :height="height" role="img" aria-label="Must Guide">
    <path class="logo__primary" :d="LOGO_PRIMARY_PATH" />
    <path class="logo__accent" :d="LOGO_ACCENT_PATH" />
  </svg>
</template>

<style lang="scss" scoped>
.logo {
  display: block;
  width: auto;

  &__primary {
    fill: var(--logo-primary);
  }

  &__accent {
    fill: var(--logo-accent);
  }
}
</style>
