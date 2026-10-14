<script setup>
import { ChevronLeft } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';

defineProps({ to: { type: [String, Object], required: true } });
</script>

<template>
  <BaseButton :to="to" :icon="ChevronLeft" variant="ghost" size="sm" class="back">Voltar</BaseButton>
</template>

<style lang="scss" scoped>
.back {
  align-self: flex-start;
  margin-left: -(space(1));
}
</style>
