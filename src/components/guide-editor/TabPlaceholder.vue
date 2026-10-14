<script setup>
import EmptyState from '@/components/ui/EmptyState.vue';

// Conteúdo provisório das abas que ainda não foram construídas
defineProps({ tab: { type: Object, required: true } });
</script>

<template>
  <EmptyState :icon="tab.icon" :title="tab.label" :text="tab.description">
    <span class="tag">Em construção</span>
  </EmptyState>
</template>
