<script setup>
import { computed } from 'vue';
import { LogIn, LogOut, ShieldCheck, ShieldOff } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import DropdownMenu from '@/components/ui/DropdownMenu.vue';
import { useAuth } from '@/composables/useAuth';

// Conta no cabeçalho: "Entrar" (Google) ou a foto com o menu (papel e Sair).
// Sem Firebase configurado, não aparece.
const { enabled, user, isAdmin, ready, busy, login, logout } = useAuth();
const initial = computed(() => (user.value?.displayName || user.value?.email || '?').charAt(0).toUpperCase());
</script>

<template>
  <template v-if="enabled">
    <span v-if="!ready" class="avatar avatar--loading radius-full" aria-hidden="true" />

    <DropdownMenu v-else-if="user" label="Conta" :width="280">
      <template #trigger="{ open, toggle }">
        <button
          type="button"
          class="avatar d-flex align-center justify-center radius-full"
          aria-haspopup="menu"
          :aria-expanded="open"
          :aria-label="`Conta: ${user.displayName || user.email}`"
          @click="toggle"
        >
          <img v-if="user.photoURL" :src="user.photoURL" alt="" referrerpolicy="no-referrer" class="radius-full" />
          <span v-else>{{ initial }}</span>
        </button>
      </template>

      <template #default="{ close }">
        <div class="px-2 pb-1">
          <p class="fw-600 truncate">{{ user.displayName || 'Sem nome' }}</p>
          <p class="text-xs text-muted truncate">{{ user.email }}</p>
          <p class="role d-inline-flex align-center gap-1 text-xs fw-500 mt-1" :class="{ 'is-admin': isAdmin }">
            <component :is="isAdmin ? ShieldCheck : ShieldOff" :size="14" />
            {{ isAdmin ? 'Administrador: salva guias na nuvem' : 'Sem permissão para editar guias' }}
          </p>
        </div>
        <div class="border-top pt-1">
          <button type="button" role="menuitem" class="menu__item" @click="logout(), close()">
            <LogOut :size="16" /> Sair
          </button>
        </div>
      </template>
    </DropdownMenu>

    <BaseButton v-else :icon="LogIn" variant="ghost" :loading="busy" @click="login">
      <span class="d-none d-md-inline">Entrar</span>
    </BaseButton>
  </template>
</template>

<style lang="scss" scoped>
.avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
  transition: box-shadow 0.15s;

  &:hover,
  &[aria-expanded='true'] {
    box-shadow: 0 0 0 2px var(--accent);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--loading {
    background: var(--surface-2);
  }
}

.role {
  color: var(--text-muted);

  &.is-admin {
    color: var(--success);
  }
}
</style>
