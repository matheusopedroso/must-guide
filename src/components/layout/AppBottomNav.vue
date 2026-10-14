<script setup>
import { useRoute } from 'vue-router';
import { NAV_ITEMS } from '@/config/nav';

const route = useRoute();
const isActive = (item) => item.match.includes(route.name);
</script>

<template>
  <nav class="bottom-nav d-flex d-md-none">
    <RouterLink
      v-for="item in NAV_ITEMS"
      :key="item.to"
      :to="item.to"
      class="bottom-nav__item flex-1 d-flex flex-column align-center justify-center gap-0"
      :class="{ 'is-active': isActive(item) }"
    >
      <component :is="item.icon" :size="22" :stroke-width="1.75" />
      <span class="text-xs fw-500">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  inset: auto 0 0;
  z-index: 50;
  height: calc(#{$bottom-nav-height} + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border);

  &__item {
    color: var(--text-subtle);
    transition: color 0.15s;

    &.is-active {
      color: var(--accent);
    }
  }
}
</style>
