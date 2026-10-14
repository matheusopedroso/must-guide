<script setup>
import { Moon, Sun } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import AppLogo from './AppLogo.vue';
import AccountMenu from './AccountMenu.vue';
import { NAV_ITEMS } from '@/config/navigation';
import { useTheme } from '@/composables/useTheme';

// Barra flutuante do topo (igual ao Must Watch): logo · abas · tema e conta.
// No celular fica só o logo (abas e conta vão para a MobileTabBar). Some ao rolar para baixo.
defineProps({ hidden: Boolean });

const route = useRoute();
const { theme, toggle } = useTheme();
</script>

<template>
  <header class="nav" :class="{ 'is-hidden': hidden }">
    <RouterLink to="/" class="nav__brand d-flex shrink-0" aria-label="Must Guide — início">
      <AppLogo :height="40" />
    </RouterLink>

    <nav class="nav__links d-none d-md-flex align-center gap-1" aria-label="Navegação principal">
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.id"
        :to="item.to"
        class="nav__link d-flex align-center gap-1 px-2 radius-1"
        :class="{ 'is-active': item.match(route) }"
        :aria-current="item.match(route) ? 'page' : undefined"
      >
        <component :is="item.icon" :size="18" :stroke-width="1.75" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="nav__side d-none d-md-flex align-center gap-1">
      <BaseButton
        :icon="theme === 'dark' ? Sun : Moon"
        icon-only
        variant="ghost"
        :aria-label="theme === 'dark' ? 'Tema claro' : 'Tema escuro'"
        :data-tooltip="theme === 'dark' ? 'Tema claro' : 'Tema escuro'"
        class="tooltip-left"
        @click="toggle"
      />
      <AccountMenu />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.nav {
  position: fixed;
  top: space(1);
  left: 50%;
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: space(2);
  width: calc(100% - #{space(2)});
  height: $nav-height-sm;
  padding: space(1) space(1) space(1) space(2);
  border: 1px solid var(--border);
  border-radius: $r2;
  background: var(--nav-glass);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  box-shadow: var(--nav-shadow);
  transform: translateX(-50%);
  transition: transform 0.22s $ease, opacity 0.18s ease;
  will-change: transform;

  @include up(md) {
    top: space(2);
    grid-template-columns: 1fr auto 1fr; // abas no centro de verdade
    width: min(#{$container-header}, calc(100% - #{space(4)}));
    height: $nav-height;
  }

  &.is-hidden {
    transform: translate(-50%, calc(-100% - #{space(3)}));
    opacity: 0;
    pointer-events: none;
  }

  &__brand {
    justify-self: start;

    :deep(svg) {
      height: 32px;

      @include up(md) {
        height: 40px;
      }
    }
  }

  &__link {
    height: 40px;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    transition: background 0.15s, color 0.15s;

    &:hover {
      color: var(--text);
    }

    &.is-active {
      background: var(--accent);
      color: var(--on-accent);
    }
  }

  &__side {
    justify-self: end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav {
    transition: opacity 0.2s;
  }
}
</style>
