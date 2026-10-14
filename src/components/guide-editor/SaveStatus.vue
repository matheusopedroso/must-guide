<script setup>
import { computed } from 'vue';
import { Cloud, CloudAlert, HardDrive, LoaderCircle } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';

// Onde o guia está salvo (cabeçalho do editor). Sem login, oferece entrar para salvar na nuvem.
const props = defineProps({
  status: { type: String, required: true }, // idle | pending | local | cloud | error
  syncing: Boolean,
  cloud: Boolean, // admin logado (salva na nuvem)
});

const { enabled, user, login, busy } = useAuth();

const view = computed(() => {
  if (props.syncing) return { icon: LoaderCircle, text: 'Sincronizando…', spin: true };
  if (props.status === 'pending') return { icon: LoaderCircle, text: 'Salvando…', spin: true };
  if (props.status === 'cloud') return { icon: Cloud, text: 'Salvo na nuvem', tone: 'ok' };
  if (props.status === 'error')
    return { icon: CloudAlert, text: props.cloud ? 'Falha na nuvem · cópia no navegador' : 'Não foi possível salvar', tone: 'error' };
  if (props.status === 'local') {
    const why = enabled && user.value && !props.cloud ? ' (conta sem permissão)' : '';
    return { icon: HardDrive, text: `Salvo neste navegador${why}` };
  }
  return null;
});

const offerLogin = computed(() => enabled && !user.value && props.status !== 'idle');
</script>

<template>
  <div v-if="view" class="save d-flex align-center flex-wrap justify-end gap-1 text-xs" :class="view.tone && `save--${view.tone}`">
    <span class="d-inline-flex align-center gap-1">
      <component :is="view.icon" :size="14" :class="{ spin: view.spin }" />
      {{ view.text }}
    </span>
    <button v-if="offerLogin" type="button" class="save__login fw-600" :disabled="busy" @click="login">
      Entrar para salvar na nuvem
    </button>
  </div>
</template>

<style lang="scss" scoped>
.save {
  color: var(--text-subtle);

  &--ok {
    color: var(--success);
  }

  &--error {
    color: var(--danger);
  }

  &__login {
    color: var(--accent);

    &:hover {
      text-decoration: underline;
    }
  }
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
