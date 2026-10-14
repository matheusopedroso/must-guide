<script setup>
import { computed } from 'vue';
import { UserRound } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';

// Foto da conta (ou a inicial). Sem login: ícone de pessoa.
defineProps({ size: { type: Number, default: 40 } });
const { user } = useAuth();
const initial = computed(() => (user.value?.displayName || user.value?.email || '?').charAt(0).toUpperCase());
</script>

<template>
  <span class="avatar d-inline-flex align-center justify-center radius-full shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <img v-if="user?.photoURL" :src="user.photoURL" alt="" referrerpolicy="no-referrer" />
    <span v-else-if="user" :style="{ fontSize: `${Math.round(size * 0.42)}px` }">{{ initial }}</span>
    <UserRound v-else :size="Math.round(size * 0.55)" :stroke-width="1.75" />
  </span>
</template>

<style lang="scss" scoped>
.avatar {
  overflow: hidden;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
