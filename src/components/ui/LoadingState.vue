<script setup>
import { LoaderCircle } from 'lucide-vue-next';
defineProps({ text: { type: String, default: 'Carregando…' } });
</script>

<template>
  <div class="d-flex align-center justify-center gap-1 py-6 text-muted">
    <LoaderCircle :size="18" class="spin" />
    <span class="text-sm">{{ text }}</span>
  </div>
</template>

<style lang="scss" scoped>
.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
