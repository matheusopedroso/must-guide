<script setup>
import { Hammer } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
</script>

<template>
  <div class="container page">
    <PageHeader title="Novo guia" back="/" />
    <EmptyState
      :icon="Hammer"
      title="Editor em construção"
      text="Esta é a próxima etapa: escolher o jogo e montar as seções e passos do guia."
    />
  </div>
</template>
