<script setup>
import { LogIn, LogOut, Moon, ShieldCheck, ShieldOff, Sun } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import AccountAvatar from './AccountAvatar.vue';
import { useAuth } from '@/composables/useAuth';
import { useTheme } from '@/composables/useTheme';

// Conteúdo da conta: quem está logado e o papel, tema e Entrar/Sair.
// Usado no menu da foto (PC) e na folha "Conta" (celular).
defineProps({ showTheme: Boolean });
const emit = defineEmits(['done']); // ação concluída → quem abriu fecha

const { enabled, user, isAdmin, busy, login, logout } = useAuth();
const { theme, toggle } = useTheme();

async function enter() {
  await login();
  emit('done');
}
async function leave() {
  await logout();
  emit('done');
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div v-if="user" class="d-flex align-center gap-2">
      <AccountAvatar :size="48" />
      <div class="min-w-0">
        <p class="fw-600 truncate">{{ user.displayName || 'Sem nome' }}</p>
        <p class="text-xs text-muted truncate">{{ user.email }}</p>
        <p class="role d-inline-flex align-center gap-1 text-xs fw-500 mt-1" :class="{ 'is-admin': isAdmin }">
          <component :is="isAdmin ? ShieldCheck : ShieldOff" :size="14" />
          {{ isAdmin ? 'Administrador: salva guias na nuvem' : 'Sem permissão para editar guias' }}
        </p>
      </div>
    </div>
    <p v-else-if="enabled" class="text-sm text-muted">
      Entre com o Google para salvar seus guias na nuvem e acessar de qualquer aparelho.
    </p>
    <p v-else class="text-sm text-muted">Login indisponível: o Firebase não está configurado. Os guias ficam neste navegador.</p>

    <button v-if="showTheme" type="button" class="row d-flex align-center justify-between gap-2 radius-1 px-2" @click="toggle">
      <span class="d-flex align-center gap-2">
        <component :is="theme === 'dark' ? Moon : Sun" :size="18" /> Tema {{ theme === 'dark' ? 'escuro' : 'claro' }}
      </span>
      <span class="text-xs text-accent fw-600">Trocar</span>
    </button>

    <BaseButton v-if="user" :icon="LogOut" variant="danger" class="w-100" @click="leave">Sair</BaseButton>
    <BaseButton v-else-if="enabled" :icon="LogIn" variant="primary" class="w-100" :loading="busy" @click="enter">
      Entrar com Google
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.role {
  color: var(--text-muted);

  &.is-admin {
    color: var(--success);
  }
}

.row {
  height: 48px;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: background 0.15s;

  &:hover {
    background: var(--surface-hover);
  }
}
</style>
