<script setup>
import { LogIn } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import DropdownMenu from '@/components/ui/DropdownMenu.vue';
import AccountAvatar from './AccountAvatar.vue';
import AccountSummary from './AccountSummary.vue';
import { useAuth } from '@/composables/useAuth';

// Conta na barra do topo (PC): "Entrar" (Google) ou a foto com o menu. Sem Firebase, não aparece.
const { enabled, user, ready, busy, login } = useAuth();
</script>

<template>
  <template v-if="enabled">
    <span v-if="!ready" class="loading radius-full" aria-hidden="true" />

    <DropdownMenu v-else-if="user" label="Conta" :width="340">
      <template #trigger="{ open, toggle }">
        <button
          type="button"
          class="trigger d-flex radius-full"
          aria-haspopup="menu"
          :aria-expanded="open"
          :aria-label="`Conta: ${user.displayName || user.email}`"
          @click="toggle"
        >
          <AccountAvatar :size="40" />
        </button>
      </template>
      <template #default="{ close }">
        <div class="px-2 py-1">
          <AccountSummary @done="close" />
        </div>
      </template>
    </DropdownMenu>

    <BaseButton v-else :icon="LogIn" variant="ghost" :loading="busy" @click="login">Entrar</BaseButton>
  </template>
</template>

<style lang="scss" scoped>
.trigger {
  transition: box-shadow 0.15s;

  &:hover,
  &[aria-expanded='true'] {
    box-shadow: 0 0 0 2px var(--accent);
  }
}

.loading {
  width: 40px;
  height: 40px;
  background: var(--surface-2);
}
</style>
