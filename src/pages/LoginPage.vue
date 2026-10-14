<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const loading = ref(false);

async function login() {
  loading.value = true;
  const ok = await auth.login();
  loading.value = false;
  if (ok) router.replace(route.query.next || '/');
}
</script>

<template>
  <div class="login d-flex align-center justify-center p-3">
    <div class="login__card surface radius-3 d-flex flex-column align-center gap-2 text-center p-5">
      <img src="/favicon.svg" alt="" width="56" height="56" class="mb-1" />
      <h1>Must Guide</h1>
      <p class="text-muted">Sua biblioteca de jogos e guias de troféus.</p>
      <BaseButton variant="primary" class="w-100 mt-2" :loading="loading" @click="login">
        Entrar com Google
      </BaseButton>
      <p v-if="auth.error" class="text-sm text-danger">{{ auth.error }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  min-height: 100dvh;

  &__card {
    width: 100%;
    max-width: 400px;
    box-shadow: var(--shadow);
  }
}
</style>
