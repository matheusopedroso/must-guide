<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import BaseModal from '@/components/ui/BaseModal.vue';
import AccountAvatar from './AccountAvatar.vue';
import AccountSummary from './AccountSummary.vue';
import { NAV_ITEMS } from '@/config/navigation';
import { useAuth } from '@/composables/useAuth';

// Barra flutuante de baixo (celular, igual ao Must Watch): as abas mostram só o ícone e a ativa
// abre o nome. A última é a Conta (foto), que abre uma folha com login, tema e Sair.
defineProps({ hidden: Boolean });

const route = useRoute();
const { user } = useAuth();
const accountOpen = ref(false);
</script>

<template>
  <nav class="tabbar d-flex d-md-none align-center justify-between gap-1 p-1" :class="{ 'is-hidden': hidden }" aria-label="Navegação principal">
    <RouterLink
      v-for="item in NAV_ITEMS"
      :key="item.id"
      :to="item.to"
      class="tabbar__item"
      :class="{ 'is-active': item.match(route) }"
      :aria-current="item.match(route) ? 'page' : undefined"
      :aria-label="item.label"
    >
      <component :is="item.icon" :size="18" :stroke-width="1.8" class="shrink-0" />
      <span class="tabbar__label">{{ item.short ?? item.label }}</span>
    </RouterLink>

    <button
      type="button"
      class="tabbar__item"
      :class="{ 'is-active': accountOpen }"
      :aria-label="user ? `Conta: ${user.displayName || user.email}` : 'Conta'"
      @click="accountOpen = true"
    >
      <AccountAvatar :size="22" class="tabbar__avatar" />
      <span class="tabbar__label">Conta</span>
    </button>
  </nav>

  <BaseModal v-model="accountOpen" title="Conta">
    <AccountSummary show-theme @done="accountOpen = false" />
  </BaseModal>
</template>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 10px);
  z-index: 55;
  width: min(390px, calc(100% - 20px));
  border: 1px solid var(--border);
  border-radius: $r4; // 32px (radius-md do Must Watch)
  background: var(--nav-glass);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  box-shadow: var(--nav-shadow);
  transform: translateX(-50%);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;

  &.is-hidden {
    transform: translate(-50%, calc(100% + #{space(3)}));
    opacity: 0;
    pointer-events: none;
  }

  // Inativas: só o ícone, dividindo o espaço. Ativa: ocupa o que o nome precisa (nunca corta).
  // Medidas do Must Watch: padding 8px, canto 32px, ícone 18px, texto 10px (9px até 430px)
  &__item {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: space(1);
    border-radius: $r4;
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    transition: color 0.18s, background 0.18s, flex 0.18s, gap 0.18s;

    &.is-active {
      flex: 0 0 auto;
      gap: space(1);
      padding-inline: space(2);
      background: var(--accent);
      color: var(--on-accent);
    }
  }

  &__label {
    max-width: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-width 0.18s ease, opacity 0.15s ease;

    .is-active & {
      max-width: 120px;
      opacity: 1;
    }
  }

  &__item.is-active &__avatar {
    box-shadow: 0 0 0 2px var(--on-accent);
  }
}

@media (max-width: 430px) {
  .tabbar {
    width: calc(100% - #{space(2)});
    bottom: calc(env(safe-area-inset-bottom, 0px) + #{space(1)});

    &__item {
      font-size: 9px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .tabbar {
    transition: opacity 0.2s;
  }
}
</style>
